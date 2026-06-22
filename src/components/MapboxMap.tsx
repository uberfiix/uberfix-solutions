import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Navigation, Loader2, Plus, Minus } from 'lucide-react';
import type { MapMarker, ServiceType, TechnicianStatus } from '@/types/uberfix';
import { SERVICE_LABELS, STATUS_LABELS } from '@/types/uberfix';
import { getTechnicianIcon } from './TechnicianCard';
import { useAllTechniciansTracking } from '@/hooks/useTechnicianTracking';
import branchIcon from '@/assets/icons/branch.png';
import customerPinIcon from '@/assets/icons/svg/location_customer_pin.svg';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface MapboxMapProps {
  branches: MapMarker[];
  technicians: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  selectedMarkerId?: string | null;
  isLoading?: boolean;
}

const MapboxMap = ({
  branches,
  technicians,
  onMarkerClick,
  selectedMarkerId,
  isLoading,
}: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { locations: liveLocations } = useAllTechniciansTracking(mapLoaded);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [31.2357, 30.0444],
      zoom: 11,
      attributionControl: false,
    });

    map.current.on('load', () => setMapLoaded(true));

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  // Direct icon placement — no hover, no decorations, no overlays
  const createMarkerElement = useCallback((marker: MapMarker) => {
    const el = document.createElement('div');
    const isTechnician = marker.type === 'technician';
    const iconSrc = isTechnician ? getTechnicianIcon(marker.id) : branchIcon;
    const size = isTechnician ? 36 : 40;

    el.style.cssText = `width:${size}px;height:${size}px;cursor:pointer;`;
    const img = document.createElement('img');
    img.src = iconSrc;
    img.alt = marker.name;
    img.style.cssText = `width:100%;height:100%;object-fit:contain;display:block;`;
    img.draggable = false;
    el.appendChild(img);
    return el;
  }, []);

  const createTechnicianPopup = useCallback((marker: MapMarker) => {
    const isTechnician = marker.type === 'technician';
    const wrapper = document.createElement('div');
    wrapper.className = 'uf-card-popup';
    wrapper.dir = 'rtl';

    if (isTechnician) {
      const status = marker.status as TechnicianStatus;
      const statusText = STATUS_LABELS[status] || '';
      const statusColor =
        status === 'available'
          ? '#10B981'
          : status === 'busy'
          ? '#F59E0B'
          : '#6B7280';
      const fullStars = 5;
      const stars = '★'.repeat(fullStars);
      const specialty = SERVICE_LABELS[marker.specialty as ServiceType] || marker.specialty || '';

      wrapper.innerHTML = `
        <div class="uf-card-name">${marker.name}</div>
        <div class="uf-card-spec">${specialty}</div>
        <div class="uf-card-stars">${stars}</div>
        <div class="uf-card-status" style="color:${statusColor}">
          <span class="uf-card-dot" style="background:${statusColor}"></span>
          ${statusText}
        </div>
        <button class="uf-card-btn" type="button">طلب الخدمة</button>
      `;

      const btn = wrapper.querySelector('.uf-card-btn') as HTMLButtonElement | null;
      btn?.addEventListener('click', (e) => {
        e.stopPropagation();
        onMarkerClick?.(marker);
      });
      return wrapper;
    }

    // Branch popup
    wrapper.innerHTML = `
      <div class="uf-card-name">${marker.name}</div>
      <div class="uf-card-spec">${marker.location || ''}</div>
      <div class="uf-card-status" style="color:#10B981">
        <span class="uf-card-dot" style="background:#10B981"></span>
        فرع نشط
      </div>
    `;
    return wrapper;
  }, [onMarkerClick]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    clearMarkers();

    const updatedTechnicians = technicians.map((tech) => {
      const live = liveLocations.get(tech.id);
      return live
        ? { ...tech, latitude: live.latitude, longitude: live.longitude }
        : tech;
    });

    [...branches, ...updatedTechnicians].forEach((marker) => {
      const el = createMarkerElement(marker);
      const popup = new mapboxgl.Popup({
        offset: 22,
        closeButton: false,
        className: 'uberfix-popup',
      }).setDOMContent(createTechnicianPopup(marker));

      const m = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => onMarkerClick?.(marker));
      markersRef.current.push(m);
    });
  }, [
    branches,
    technicians,
    mapLoaded,
    liveLocations,
    clearMarkers,
    createMarkerElement,
    createTechnicianPopup,
    onMarkerClick,
  ]);

  useEffect(() => {
    if (!map.current || !selectedMarkerId || !mapLoaded) return;
    const all = [...branches, ...technicians];
    const sel = all.find((m) => m.id === selectedMarkerId);
    if (sel) {
      map.current.flyTo({
        center: [sel.longitude, sel.latitude],
        zoom: 14,
        duration: 900,
      });
    }
  }, [selectedMarkerId, branches, technicians, mapLoaded]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation || !map.current) return;
    navigator.geolocation.getCurrentPosition((position) => {
      const { longitude, latitude } = position.coords;
      map.current?.flyTo({ center: [longitude, latitude], zoom: 14, duration: 900 });

      userMarkerRef.current?.remove();
      const el = document.createElement('div');
      el.style.cssText = 'width:48px;height:56px;';
      const img = document.createElement('img');
      img.src = customerPinIcon;
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
      el.appendChild(img);

      userMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([longitude, latitude])
        .addTo(map.current!);
    });
  };

  const zoom = (delta: number) => map.current?.zoomTo((map.current.getZoom() || 11) + delta);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {(isLoading || !mapLoaded) && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">جاري تحميل الخريطة...</span>
          </div>
        </div>
      )}

      {/* Map controls — refined */}
      <div className="absolute bottom-24 left-4 flex flex-col gap-2 z-10">
        <button
          onClick={handleGetCurrentLocation}
          className="w-11 h-11 bg-card/95 backdrop-blur rounded-xl shadow-elevated flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all border border-border/50"
          aria-label="موقعي"
        >
          <Navigation className="w-5 h-5" />
        </button>
        <div className="bg-card/95 backdrop-blur rounded-xl shadow-elevated border border-border/50 overflow-hidden flex flex-col">
          <button onClick={() => zoom(1)} className="w-11 h-11 flex items-center justify-center hover:bg-muted transition-colors" aria-label="تكبير">
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-px bg-border/60" />
          <button onClick={() => zoom(-1)} className="w-11 h-11 flex items-center justify-center hover:bg-muted transition-colors" aria-label="تصغير">
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style>{`
        .mapboxgl-popup {
          z-index: 100;
        }
        .mapboxgl-popup-content {
          padding: 0;
          border-radius: 16px;
          box-shadow: 0 12px 40px -12px rgba(15, 23, 42, 0.22);
          border: 1px solid rgba(0, 0, 0, 0.25);
          overflow: hidden;
          background: white;
          font-family: 'Cairo', sans-serif;
        }
        .mapboxgl-popup-tip {
          border-top-color: white;
          filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.08));
        }
        .uberfix-popup .mapboxgl-popup-content {
          padding: 0 !important;
        }
        .uf-card-popup {
          padding: 14px 16px;
          min-width: 190px;
          max-width: 220px;
          direction: rtl;
          text-align: right;
          color: #0f172a;
          font-family: 'Cairo', sans-serif;
          box-sizing: border-box;
        }
        .uf-card-name {
          font-size: 15px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 2px;
          color: #0f172a;
        }
        .uf-card-spec {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          margin-top: 3px;
        }
        .uf-card-stars {
          color: #f59e0b;
          font-size: 13px;
          margin-top: 6px;
          letter-spacing: 1px;
          line-height: 1;
        }
        .uf-card-status {
          font-size: 11px;
          margin-top: 6px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
          line-height: 1;
        }
        .uf-card-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          display: inline-block;
        }
        .uf-card-btn {
          width: 100%;
          margin-top: 11px;
          padding: 8px 14px;
          border: none;
          border-radius: 999px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          font-family: 'Cairo', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.3);
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .uf-card-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
        }
        .uf-card-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default MapboxMap;

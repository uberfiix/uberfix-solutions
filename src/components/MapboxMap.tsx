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

  // Teardrop pin marker: colored pin with icon inside white circle
  const createMarkerElement = useCallback((marker: MapMarker) => {
    const el = document.createElement('div');
    const isTechnician = marker.type === 'technician';
    const iconSrc = isTechnician ? getTechnicianIcon(marker.id) : branchIcon;
    const pinColor = isTechnician ? '#1E3A8A' : '#F59E0B'; // blue for tech, orange for branch
    const pinShadow = isTechnician ? 'rgba(30,58,138,.35)' : 'rgba(245,158,11,.35)';
    const w = 44;
    const h = 56;

    el.style.cssText = `width:${w}px;height:${h}px;cursor:pointer;position:relative;filter:drop-shadow(0 4px 6px ${pinShadow});`;
    el.innerHTML = `
      <svg viewBox="0 0 44 56" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" style="display:block;">
        <path d="M22 0C9.85 0 0 9.85 0 22c0 14.5 22 34 22 34s22-19.5 22-34C44 9.85 34.15 0 22 0z" fill="${pinColor}"/>
        <circle cx="22" cy="21" r="15" fill="#ffffff"/>
      </svg>
      <div style="position:absolute;top:6px;left:7px;width:30px;height:30px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;">
        <img src="${iconSrc}" alt="${marker.name}" style="width:${isTechnician ? '28px' : '22px'};height:${isTechnician ? '28px' : '22px'};object-fit:contain;display:block;" draggable="false"/>
      </div>
    `;
    return el;
  }, []);

  const createPopupContent = useCallback((marker: MapMarker) => {
    const isTechnician = marker.type === 'technician';
    if (isTechnician) {
      const statusText = STATUS_LABELS[marker.status as TechnicianStatus] || '';
      const isAvail = marker.status === 'available';
      const statusColor = isAvail ? '#2563EB' : marker.status === 'busy' ? '#DC2626' : '#6B7280';
      const stars = '★★★★★'.slice(0, Math.max(1, Math.floor(marker.rating || 5)));
      const eta = isAvail ? `متاح بعد ${10 + (marker.name.length % 5) * 10} دقيقه` : statusText;
      return `
        <div class="uf-pop" dir="rtl">
          <div class="uf-pop-name">${marker.name}</div>
          <div class="uf-pop-spec">${SERVICE_LABELS[marker.specialty as ServiceType] || ''}</div>
          <div class="uf-pop-stars">${stars}</div>
          <div class="uf-pop-status" style="color:${statusColor}">${eta}</div>
          <button class="uf-pop-btn">طلب الخدمة</button>
        </div>`;
    }
    return `
      <div class="uf-pop" dir="rtl">
        <div class="uf-pop-name">${marker.name}</div>
        <div class="uf-pop-spec" style="color:#F59E0B">فرع تجاري</div>
        <div class="uf-pop-status" style="color:#10B981">● نشط الآن</div>
      </div>`;
  }, []);


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
      }).setHTML(createPopupContent(marker));

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
    createPopupContent,
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
        .mapboxgl-popup-content {
          padding: 0;
          border-radius: 14px;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.25);
          border: 1.5px solid #1f2937;
          overflow: hidden;
        }
        .mapboxgl-popup-tip { border-top-color: #1f2937; }
        .uf-pop { padding: 12px 16px; min-width: 160px; text-align:center; font-family: 'Cairo', sans-serif; background:#fff; }
        .uf-pop-name { font-weight: 800; color: #0f172a; font-size: 15px; }
        .uf-pop-spec { color: #DC2626; font-weight: 700; font-size: 13px; margin-top: 2px; }
        .uf-pop-stars { color: #F59E0B; font-size: 14px; letter-spacing: 2px; margin-top: 4px; }
        .uf-pop-status { font-weight: 700; font-size: 12px; margin-top: 4px; }
        .uf-pop-btn { margin-top: 10px; width: 100%; padding: 8px 12px; border-radius: 999px; border: 1.5px solid #1f2937;
          background: linear-gradient(180deg, #F59E0B 0%, #D97706 100%); color: #fff; font-weight: 800; font-size: 13px; cursor:pointer;
          box-shadow: 0 3px 0 #1f2937; font-family:'Cairo',sans-serif; }
        .uf-pop-btn:hover { filter: brightness(1.05); }
      `}</style>

    </div>
  );
};

export default MapboxMap;

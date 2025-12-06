import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Navigation, Loader2 } from 'lucide-react';
import type { MapMarker, ServiceType, TechnicianStatus } from '@/types/uberfix';
import { SERVICE_LABELS, STATUS_LABELS } from '@/types/uberfix';

// Mapbox token from env
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
  isLoading 
}: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [31.2357, 30.0444], // Cairo center
      zoom: 11,
      attributionControl: false
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    
    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  }, []);

  // Create marker element
  const createMarkerElement = useCallback((marker: MapMarker, isSelected: boolean) => {
    const el = document.createElement('div');
    el.className = 'marker-container';
    
    const isTechnician = marker.type === 'technician';
    const statusColor = marker.status === 'available' ? '#10B981' : 
                       marker.status === 'busy' ? '#EF4444' : '#6B7280';
    
    el.innerHTML = `
      <div class="relative cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125' : 'hover:scale-110'}">
        <img 
          src="${marker.icon || (isTechnician ? '/technician-marker.png' : '/branch-marker.png')}"
          alt="${marker.name}"
          class="w-10 h-12 object-contain drop-shadow-lg"
          onerror="this.src='https://api.iconify.design/mdi:map-marker.svg?color=%230F4C81'"
        />
        ${isTechnician ? `
          <div 
            class="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
            style="background-color: ${statusColor}"
          ></div>
        ` : ''}
      </div>
    `;

    return el;
  }, []);

  // Create popup content
  const createPopupContent = useCallback((marker: MapMarker) => {
    const isTechnician = marker.type === 'technician';
    
    if (isTechnician) {
      const statusText = STATUS_LABELS[marker.status as TechnicianStatus] || 'غير معروف';
      const statusColor = marker.status === 'available' ? 'text-green-500' : 'text-red-500';
      const stars = '★'.repeat(Math.floor(marker.rating || 5));
      
      return `
        <div class="p-3 min-w-[200px] font-cairo" dir="rtl">
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-gray-900">${marker.name}</span>
            <span class="text-yellow-500 text-sm">${stars}</span>
          </div>
          <p class="text-sm text-blue-600 font-medium">${SERVICE_LABELS[marker.specialty as ServiceType] || marker.specialty}</p>
          <p class="text-xs ${statusColor} mt-1">${statusText}</p>
          <button 
            class="w-full mt-3 py-2 rounded-lg text-white text-sm font-semibold"
            style="background: linear-gradient(135deg, #D4A84B 0%, #E8C547 100%)"
          >
            طلب الخدمة
          </button>
        </div>
      `;
    } else {
      return `
        <div class="p-3 min-w-[180px] font-cairo" dir="rtl">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span class="text-xs text-gray-500">فرع تجاري</span>
          </div>
          <p class="font-bold text-gray-900">${marker.name}</p>
          <p class="text-sm text-gray-600 mt-1">${marker.location}</p>
          <div class="flex items-center gap-1 mt-2">
            <span class="w-2 h-2 rounded-full bg-green-500"></span>
            <span class="text-xs text-green-600">نشط</span>
          </div>
        </div>
      `;
    }
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    clearMarkers();

    const allMarkers = [...branches, ...technicians];
    
    allMarkers.forEach((marker) => {
      const isSelected = marker.id === selectedMarkerId;
      const el = createMarkerElement(marker, isSelected);
      
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'uberfix-popup'
      }).setHTML(createPopupContent(marker));

      const mapMarker = new mapboxgl.Marker(el)
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onMarkerClick?.(marker);
      });

      markersRef.current.push(mapMarker);
    });
  }, [branches, technicians, mapLoaded, selectedMarkerId, clearMarkers, createMarkerElement, createPopupContent, onMarkerClick]);

  // Fly to selected marker
  useEffect(() => {
    if (!map.current || !selectedMarkerId || !mapLoaded) return;

    const allMarkers = [...branches, ...technicians];
    const selectedMarker = allMarkers.find(m => m.id === selectedMarkerId);
    
    if (selectedMarker) {
      map.current.flyTo({
        center: [selectedMarker.longitude, selectedMarker.latitude],
        zoom: 14,
        duration: 1000
      });
    }
  }, [selectedMarkerId, branches, technicians, mapLoaded]);

  // Get current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation || !map.current) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        map.current?.flyTo({
          center: [longitude, latitude],
          zoom: 14,
          duration: 1000
        });

        // Add current location marker
        new mapboxgl.Marker({ color: '#0F4C81' })
          .setLngLat([longitude, latitude])
          .addTo(map.current!);
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Loading overlay */}
      {(isLoading || !mapLoaded) && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">جاري تحميل الخريطة...</span>
          </div>
        </div>
      )}

      {/* Current Location Button */}
      <button 
        onClick={handleGetCurrentLocation}
        className="absolute bottom-24 left-4 w-12 h-12 bg-card rounded-xl shadow-elevated flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors z-10"
      >
        <Navigation className="w-5 h-5" />
      </button>

      {/* Custom popup styles */}
      <style>{`
        .mapboxgl-popup-content {
          padding: 0;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .mapboxgl-popup-tip {
          border-top-color: white;
        }
        .font-cairo {
          font-family: 'Cairo', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default MapboxMap;

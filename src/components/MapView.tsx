import { useState } from "react";
import { MapPin, Building2, Store, Navigation } from "lucide-react";
import branchMarker from "@/assets/branch-marker.png";
import technicianMarker from "@/assets/technician-marker.png";

interface MapMarker {
  id: string;
  type: "technician" | "branch";
  name: string;
  specialty?: string;
  location: string;
  x: number;
  y: number;
  status?: "available" | "busy";
}

const mockMarkers: MapMarker[] = [
  { id: "t1", type: "technician", name: "أحمد حسين", specialty: "سباك", location: "المعادي", x: 65, y: 35, status: "available" },
  { id: "t2", type: "technician", name: "محمود سعد", specialty: "نجار", location: "الدقي", x: 35, y: 55, status: "busy" },
  { id: "t3", type: "technician", name: "خالد إبراهيم", specialty: "كهرباء", location: "مصر الجديدة", x: 75, y: 25, status: "available" },
  { id: "t4", type: "technician", name: "عمر حسن", specialty: "تكييف", location: "المهندسين", x: 30, y: 40, status: "available" },
  { id: "b1", type: "branch", name: "Abu Auf", location: "Maadi 50", x: 80, y: 20 },
  { id: "b2", type: "branch", name: "فرع سيتي ستارز", location: "مدينة نصر", x: 85, y: 30 },
  { id: "b3", type: "branch", name: "فرع المهندسين", location: "الجيزة", x: 25, y: 45 },
  { id: "b4", type: "branch", name: "فرع وسط البلد", location: "القاهرة", x: 50, y: 50 },
  { id: "b5", type: "branch", name: "فرع الزمالك", location: "الزمالك", x: 45, y: 35 },
];

interface MapViewProps {
  onMarkerClick?: (marker: MapMarker) => void;
}

const MapView = ({ onMarkerClick }: MapViewProps) => {
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker.id);
    onMarkerClick?.(marker);
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
      {/* Cairo Map Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-90"
        style={{
          backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/light-v11/static/31.2357,30.0444,11,0/1200x800?access_token=pk.eyJ1IjoibG92YWJsZWRlbW8iLCJhIjoiY2x0NnBvdW9kMDBqMTJpcGRyY3V0dWRjdiJ9.placeholder')`,
        }}
      />
      
      {/* Simulated Map Grid */}
      <div className="absolute inset-0">
        {/* Grid lines for visual effect */}
        <svg className="w-full h-full opacity-20">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* City Label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <span className="text-4xl font-bold text-primary/20">القاهرة</span>
      </div>

      {/* Map Markers */}
      {mockMarkers.map((marker) => (
        <div
          key={marker.id}
          className="absolute cursor-pointer transition-all duration-200 hover:z-50"
          style={{ 
            left: `${marker.x}%`, 
            top: `${marker.y}%`,
            transform: 'translate(-50%, -100%)'
          }}
          onMouseEnter={() => setHoveredMarker(marker.id)}
          onMouseLeave={() => setHoveredMarker(null)}
          onClick={() => handleMarkerClick(marker)}
        >
          {/* Marker Image */}
          <div className={`
            relative transition-transform duration-200
            ${hoveredMarker === marker.id || selectedMarker === marker.id ? 'scale-125' : 'scale-100'}
            ${selectedMarker === marker.id ? 'animate-bounce-subtle' : ''}
          `}>
            <img 
              src={marker.type === "branch" ? branchMarker : technicianMarker}
              alt={marker.name}
              className="w-10 h-12 object-contain drop-shadow-lg"
            />
            
            {/* Status indicator for technicians */}
            {marker.type === "technician" && (
              <div className={`
                absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-card
                ${marker.status === "available" ? "bg-status-available" : "bg-status-busy"}
              `} />
            )}
          </div>

          {/* Tooltip */}
          {(hoveredMarker === marker.id || selectedMarker === marker.id) && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 animate-fade-in">
              <div className="bg-card rounded-xl p-3 shadow-popup border border-border min-w-[180px]">
                {marker.type === "branch" ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <Store className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">فرع تجاري</span>
                    </div>
                    <p className="font-bold text-foreground">{marker.name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{marker.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-status-available mt-2">
                      <span className="w-2 h-2 rounded-full bg-status-available" />
                      <span>نشط</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-foreground">{marker.name}</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-uberfix-yellow text-xs">★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-primary font-medium">{marker.specialty}</p>
                    <p className={`text-xs mt-1 ${marker.status === "available" ? "text-status-available" : "text-status-busy"}`}>
                      {marker.status === "available" ? "متاح الآن" : "مشغول اليوم"}
                    </p>
                    <button className="w-full mt-2 py-1.5 rounded-lg gradient-accent text-accent-foreground text-xs font-semibold">
                      طلب الخدمة
                    </button>
                  </>
                )}
              </div>
              {/* Tooltip arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                <div className="w-3 h-3 bg-card border-l border-b border-border rotate-[-45deg]" />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Current Location Button */}
      <button className="absolute bottom-4 left-4 w-12 h-12 bg-card rounded-xl shadow-elevated flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
        <Navigation className="w-5 h-5" />
      </button>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button className="w-10 h-10 bg-card rounded-lg shadow-card flex items-center justify-center text-lg font-bold hover:bg-primary hover:text-primary-foreground transition-colors">
          +
        </button>
        <button className="w-10 h-10 bg-card rounded-lg shadow-card flex items-center justify-center text-lg font-bold hover:bg-primary hover:text-primary-foreground transition-colors">
          −
        </button>
      </div>
    </div>
  );
};

export default MapView;

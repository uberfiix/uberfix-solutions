import { useState } from "react";
import { Search, Filter, Users, Loader2 } from "lucide-react";
import TechnicianCard, { Technician } from "./TechnicianCard";
import { useTechnicians } from "@/hooks/useTechnicians";
import type { ServiceType } from "@/types/uberfix";

// Mock data for demo (when no real data exists)
const mockTechnicians: Technician[] = [
  {
    id: "t1",
    name: "أحمد محمود حسين",
    phone: "+201234567890",
    specialty: "plumbing",
    status: "available",
    rating: 4.9,
    total_reviews: 156,
    total_orders: 234,
    is_verified: true,
    is_active: true,
    latitude: 30.0444,
    longitude: 31.2357
  },
  {
    id: "t2",
    name: "محمد سعيد العزب",
    phone: "+201234567891",
    specialty: "electrical",
    status: "available",
    rating: 4.8,
    total_reviews: 89,
    total_orders: 145,
    is_verified: true,
    is_active: true,
    latitude: 30.0500,
    longitude: 31.2400
  },
  {
    id: "t3",
    name: "خالد إبراهيم",
    phone: "+201234567892",
    specialty: "ac",
    status: "busy",
    rating: 4.7,
    total_reviews: 67,
    total_orders: 98,
    is_verified: false,
    is_active: true,
    latitude: 30.0600,
    longitude: 31.2500
  },
  {
    id: "t4",
    name: "عمر حسن الشريف",
    phone: "+201234567893",
    specialty: "carpentry",
    status: "available",
    rating: 4.6,
    total_reviews: 45,
    total_orders: 78,
    is_verified: true,
    is_active: true,
    latitude: 30.0700,
    longitude: 31.2600
  },
  {
    id: "t5",
    name: "ياسر عبد الرحمن",
    phone: "+201234567894",
    specialty: "painting",
    status: "offline",
    rating: 4.5,
    total_reviews: 34,
    total_orders: 56,
    is_verified: false,
    is_active: true,
    latitude: 30.0800,
    longitude: 31.2700
  }
];

interface TechniciansSidebarProps {
  selectedTechnicianId: string | null;
  onSelectTechnician: (id: string | null) => void;
  activeService?: ServiceType | 'all';
}

const TechniciansSidebar = ({ 
  selectedTechnicianId, 
  onSelectTechnician,
  activeService = 'all'
}: TechniciansSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const { data: dbTechnicians, isLoading } = useTechnicians({
    specialty: activeService,
    status: showAvailableOnly ? 'available' : 'all'
  });

  // Use mock data if no real data, and filter by specialty
  const baseTechnicians: Technician[] = (dbTechnicians && dbTechnicians.length > 0) 
    ? dbTechnicians.map(t => ({
        id: t.id,
        name: t.name,
        phone: t.phone,
        avatar_url: t.avatar_url || undefined,
        specialty: t.specialty as ServiceType,
        status: t.status as Technician['status'],
        rating: Number(t.rating),
        total_reviews: t.total_reviews,
        total_orders: t.total_orders,
        is_verified: t.is_verified,
        is_active: t.is_active,
        latitude: t.latitude ? Number(t.latitude) : undefined,
        longitude: t.longitude ? Number(t.longitude) : undefined
      }))
    : mockTechnicians.filter(t => 
        activeService === 'all' || t.specialty === activeService
      );

  const filteredTechnicians = baseTechnicians.filter(tech => {
    const matchesSearch = tech.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailability = !showAvailableOnly || tech.status === "available";
    return matchesSearch && matchesAvailability;
  });

  const availableCount = baseTechnicians.filter(t => t.status === "available").length;

  return (
    <aside className="w-80 bg-card border-l border-border flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">الفنيين</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {availableCount} متاح
            </span>
            <span className="w-2 h-2 rounded-full bg-status-available animate-pulse" />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ابحث عن فني..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pr-10 pl-10 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button 
            onClick={() => setShowAvailableOnly(!showAvailableOnly)}
            className={`absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${
              showAvailableOnly ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Technicians List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground mt-2">جاري التحميل...</span>
          </div>
        ) : filteredTechnicians.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">لا يوجد فنيين متاحين</p>
          </div>
        ) : (
          filteredTechnicians.map((technician) => (
            <TechnicianCard
              key={technician.id}
              technician={technician}
              isSelected={selectedTechnicianId === technician.id}
              onSelect={() => onSelectTechnician(
                selectedTechnicianId === technician.id ? null : technician.id
              )}
            />
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-border bg-muted/30">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>إجمالي الفنيين: {baseTechnicians.length}</span>
          <span>المتاحين: {availableCount}</span>
        </div>
      </div>
    </aside>
  );
};

export default TechniciansSidebar;

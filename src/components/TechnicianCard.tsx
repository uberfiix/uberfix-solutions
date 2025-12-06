import { Star, Clock, Phone, CheckCircle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServiceType, TechnicianStatus } from "@/types/uberfix";
import { SERVICE_LABELS, STATUS_LABELS } from "@/types/uberfix";

// Import technician icons
import tec01 from "@/assets/icons/tec-01.png";
import tec02 from "@/assets/icons/tec-02.png";
import tec03 from "@/assets/icons/tec-03.png";
import tec04 from "@/assets/icons/tec-04.png";
import tec05 from "@/assets/icons/tec-05.png";

const technicianIcons = [tec01, tec02, tec03, tec04, tec05];

export interface Technician {
  id: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  specialty: ServiceType;
  status: TechnicianStatus;
  rating: number;
  total_reviews: number;
  total_orders: number;
  is_verified: boolean;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
}

interface TechnicianCardProps {
  technician: Technician;
  isSelected?: boolean;
  onSelect?: () => void;
}

const statusConfig = {
  available: {
    label: "متاح الآن",
    bgClass: "bg-status-available/10",
    textClass: "text-status-available",
    dotClass: "bg-status-available",
  },
  busy: {
    label: "مشغول",
    bgClass: "bg-status-busy/10",
    textClass: "text-status-busy",
    dotClass: "bg-status-busy",
  },
  offline: {
    label: "غير متصل",
    bgClass: "bg-status-offline/10",
    textClass: "text-status-offline",
    dotClass: "bg-status-offline",
  },
};

const TechnicianCard = ({ technician, isSelected, onSelect }: TechnicianCardProps) => {
  const status = statusConfig[technician.status] || statusConfig.offline;
  
  // Get a consistent icon based on technician id
  const iconIndex = technician.id ? 
    parseInt(technician.id.replace(/[^0-9]/g, '').slice(-1) || '0') % technicianIcons.length : 0;
  const avatarUrl = technician.avatar_url || technicianIcons[iconIndex];

  return (
    <div
      onClick={onSelect}
      className={`
        bg-card rounded-xl p-4 cursor-pointer transition-all duration-200 animate-fade-in
        ${isSelected 
          ? "ring-2 ring-primary shadow-elevated" 
          : "shadow-card hover:shadow-elevated hover:-translate-y-1"
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
            <img 
              src={avatarUrl}
              alt={technician.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = technicianIcons[0];
              }}
            />
          </div>
          <div className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full ${status.dotClass} border-2 border-card`} />
          {technician.is_verified && (
            <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-primary bg-card rounded-full" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground truncate">{technician.name}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <Wrench className="w-3 h-3 text-primary" />
            <span className="text-sm text-primary font-medium">
              {SERVICE_LABELS[technician.specialty] || technician.specialty}
            </span>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-4 h-4 fill-uberfix-yellow text-uberfix-yellow" />
            <span className="text-sm font-semibold">{Number(technician.rating).toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">
              ({technician.total_reviews})
            </span>
          </div>
        </div>
      </div>

      {/* Status & Action */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${status.bgClass}`}>
          <span className={`text-xs font-medium ${status.textClass}`}>
            {status.label}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {technician.total_orders} طلب
          </span>
          <Button 
            variant="accent" 
            size="sm"
            className="text-xs"
            disabled={technician.status === "offline"}
          >
            <Phone className="w-3 h-3" />
            طلب الخدمة
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianCard;

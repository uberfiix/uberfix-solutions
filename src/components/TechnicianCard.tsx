import { Star, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Technician {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  status: "available" | "busy" | "offline";
  availableIn?: string;
  image: string;
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
  const status = statusConfig[technician.status];

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
              src={technician.image} 
              alt={technician.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full ${status.dotClass} border-2 border-card`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground truncate">{technician.name}</h3>
          <p className="text-sm text-muted-foreground">{technician.specialty}</p>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < technician.rating 
                    ? "fill-uberfix-yellow text-uberfix-yellow" 
                    : "text-muted"
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground mr-1">
              ({technician.reviewCount})
            </span>
          </div>
        </div>
      </div>

      {/* Status & Action */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${status.bgClass}`}>
          {technician.status === "busy" && technician.availableIn && (
            <Clock className="w-3 h-3" />
          )}
          <span className={`text-xs font-medium ${status.textClass}`}>
            {technician.status === "busy" && technician.availableIn 
              ? `متاح بعد ${technician.availableIn}`
              : status.label
            }
          </span>
        </div>
        
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
  );
};

export default TechnicianCard;

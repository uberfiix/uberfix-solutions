import { Search, MapPin, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServiceType } from "@/types/uberfix";

import iconAll from "@/assets/icons/svg/service_maintenance_checklist.svg";
import iconElectrical from "@/assets/icons/svg/service_electrical_system_maintenance.svg";
import iconPlumbing from "@/assets/icons/svg/service_home_plumbing.svg";
import iconAc from "@/assets/icons/svg/service_hvac_equipment.svg";
import iconCarpentry from "@/assets/icons/svg/trade_carpentry_roof_framing.svg";
import iconPainting from "@/assets/icons/svg/trade_wall_painting_worker.svg";

const services: { id: ServiceType | "all"; label: string; icon: string }[] = [
  { id: "all", label: "كل التخصصات", icon: iconAll },
  { id: "electrical", label: "كهرباء", icon: iconElectrical },
  { id: "plumbing", label: "سباكة", icon: iconPlumbing },
  { id: "ac", label: "تكييف", icon: iconAc },
  { id: "carpentry", label: "نجارة", icon: iconCarpentry },
  { id: "painting", label: "دهانات", icon: iconPainting },
];

interface HeaderProps {
  activeService: ServiceType | "all";
  onServiceChange: (serviceId: ServiceType | "all") => void;
}

const Header = ({ activeService, onServiceChange }: HeaderProps) => {
  return (
    <header className="bg-card/95 backdrop-blur border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-card">
            <Wrench className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold text-primary tracking-tight">UberFix</span>
            <span className="text-[10px] text-muted-foreground">خدمات الصيانة الفورية</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {services.map((service) => {
              const isActive = activeService === service.id;
              return (
                <button
                  key={service.id}
                  onClick={() => onServiceChange(service.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all flex-shrink-0 border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-card"
                      : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <img
                    src={service.icon}
                    alt={service.label}
                    className={`w-6 h-6 object-contain ${isActive ? "brightness-0 invert" : ""}`}
                  />
                  <span className="text-[11px] font-semibold whitespace-nowrap">{service.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث باسم الفني أو الخدمة..."
              className="w-56 h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <MapPin className="w-4 h-4" />
            صيانة سريعة
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

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
    <header className="bg-card/95 backdrop-blur border-b-2 border-foreground/10 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 gap-4">
        {/* Logo — pin-style UberFix.shop */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-11 h-14 flex items-center justify-center">
            <svg viewBox="0 0 44 56" className="w-11 h-14 drop-shadow" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 0C9.85 0 0 9.85 0 22c0 14.5 22 34 22 34s22-19.5 22-34C44 9.85 34.15 0 22 0z" fill="#F59E0B"/>
              <circle cx="22" cy="21" r="14" fill="#fff"/>
            </svg>
            <Wrench className="absolute top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 text-primary" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              UberFix<span className="text-accent">.shop</span>
            </span>
            <span className="text-[10px] text-muted-foreground mt-1">خدمات الصيانة الفورية</span>
          </div>
        </div>

        {/* Service filters */}
        <div className="flex items-center gap-1.5 flex-1 justify-center min-w-0 overflow-x-auto pb-1 scrollbar-hide">
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

        {/* Right title */}
        <div className="hidden md:flex items-center">
          <h1 className="text-xl lg:text-2xl font-extrabold text-foreground tracking-tight">
            Quick Maintenance Methods
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;


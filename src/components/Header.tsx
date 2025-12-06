import { Search, MapPin, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServiceType } from "@/types/uberfix";

const services: { id: ServiceType | "all"; label: string; icon: string }[] = [
  { id: "all", label: "كل التخصصات", icon: "🔧" },
  { id: "electrical", label: "كهرباء", icon: "⚡" },
  { id: "plumbing", label: "سباكة", icon: "🔧" },
  { id: "ac", label: "تكييف", icon: "❄️" },
  { id: "carpentry", label: "نجارة", icon: "🪚" },
  { id: "painting", label: "دهانات", icon: "🎨" },
];

interface HeaderProps {
  activeService: ServiceType | "all";
  onServiceChange: (serviceId: ServiceType | "all") => void;
}

const Header = ({ activeService, onServiceChange }: HeaderProps) => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-card">
            <Settings className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary">UberFix</span>
        </div>

        {/* Service Filters */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          <span className="text-sm text-muted-foreground ml-2">
            <MapPin className="w-4 h-4 inline-block ml-1" />
            اختر نوع الخدمة:
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {services.map((service) => (
              <Button
                key={service.id}
                variant={activeService === service.id ? "serviceActive" : "service"}
                size="sm"
                onClick={() => onServiceChange(service.id)}
                className="flex-shrink-0"
              >
                <span>{service.icon}</span>
                <span>{service.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Search and Quick Request */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث باسم الفني أو نوع الخدمة..."
              className="w-64 h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <MapPin className="w-4 h-4" />
            طلب صيانة سريع
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

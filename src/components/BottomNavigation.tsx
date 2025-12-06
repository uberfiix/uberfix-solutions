import { Map, Zap, ClipboardList, CheckCircle, Receipt, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { id: "map", label: "الخريطة", icon: Map },
  { id: "quick", label: "طلب سريع", icon: Zap },
  { id: "track", label: "تتبع الطلبات", icon: ClipboardList },
  { id: "completed", label: "الخدمات المكتملة", icon: CheckCircle },
  { id: "invoices", label: "الفواتير", icon: Receipt },
  { id: "profile", label: "الملف الشخصي", icon: User },
];

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  return (
    <nav className="bg-card border-t border-border px-2 py-1 flex justify-around items-center shadow-elevated">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <Button
            key={item.id}
            variant={isActive ? "navActive" : "nav"}
            size="nav"
            onClick={() => onTabChange(item.id)}
            className="flex-1 max-w-[100px]"
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Button>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;

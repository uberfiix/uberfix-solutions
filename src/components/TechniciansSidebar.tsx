import TechnicianCard, { Technician } from "./TechnicianCard";
import { Users } from "lucide-react";

const mockTechnicians: Technician[] = [
  {
    id: "1",
    name: "أحمد حسين",
    specialty: "فني سباك",
    rating: 5,
    reviewCount: 127,
    status: "available",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "2",
    name: "محمود سعد",
    specialty: "اسطى نجار",
    rating: 4,
    reviewCount: 89,
    status: "busy",
    availableIn: "40 دقيقة",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "3",
    name: "محمد علي",
    specialty: "فني كهرباء",
    rating: 4,
    reviewCount: 156,
    status: "busy",
    availableIn: "ساعة",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "4",
    name: "خالد إبراهيم",
    specialty: "فني تكييف",
    rating: 5,
    reviewCount: 203,
    status: "available",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "5",
    name: "عمر حسن",
    specialty: "فني دهانات",
    rating: 4,
    reviewCount: 67,
    status: "offline",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "6",
    name: "ياسر محمود",
    specialty: "فني سباك",
    rating: 5,
    reviewCount: 94,
    status: "available",
    image: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=face",
  },
];

interface TechniciansSidebarProps {
  selectedTechnicianId: string | null;
  onSelectTechnician: (id: string) => void;
}

const TechniciansSidebar = ({ selectedTechnicianId, onSelectTechnician }: TechniciansSidebarProps) => {
  const availableCount = mockTechnicians.filter(t => t.status === "available").length;

  return (
    <aside className="w-80 bg-background border-l border-border h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Users className="w-4 h-4 text-primary-foreground" />
            </div>
            <h2 className="font-bold text-foreground">الخدمات المتاحة</h2>
          </div>
          <span className="bg-primary/10 text-primary text-sm font-semibold px-2 py-1 rounded-md">
            {availableCount} متاح
          </span>
        </div>
      </div>

      {/* Technicians List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {mockTechnicians.map((technician) => (
          <TechnicianCard
            key={technician.id}
            technician={technician}
            isSelected={selectedTechnicianId === technician.id}
            onSelect={() => onSelectTechnician(technician.id)}
          />
        ))}
      </div>
    </aside>
  );
};

export default TechniciansSidebar;

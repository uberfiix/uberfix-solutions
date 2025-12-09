import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import TechniciansSidebar from "@/components/TechniciansSidebar";
import MapboxMap from "@/components/MapboxMap";
import BottomNavigation from "@/components/BottomNavigation";
import { Helmet } from "react-helmet";
import { useBranches } from "@/hooks/useBranches";
import { useTechnicians } from "@/hooks/useTechnicians";
import { useAuth } from "@/contexts/AuthContext";
import type { MapMarker, ServiceType } from "@/types/uberfix";
import { Button } from "@/components/ui/button";
import { Plus, LogIn, LogOut, User } from "lucide-react";

// Import branch data for demo
import branchesData from "@/assets/data/branchs-maps.js";

const Index = () => {
  const [activeService, setActiveService] = useState<ServiceType | "all">("all");
  const [activeTab, setActiveTab] = useState("map");
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  // Fetch data from Supabase
  const { data: dbBranches, isLoading: branchesLoading } = useBranches();
  const { data: technicians, isLoading: techniciansLoading } = useTechnicians({
    specialty: activeService === "all" ? "all" : activeService
  });

  // Convert branches data to MapMarker format
  const branchMarkers = useMemo((): MapMarker[] => {
    // If we have data from DB, use it
    if (dbBranches && dbBranches.length > 0) {
      return dbBranches.map(branch => ({
        id: branch.id,
        type: 'branch' as const,
        name: branch.name_ar || branch.name,
        location: branch.address,
        latitude: Number(branch.latitude),
        longitude: Number(branch.longitude),
        icon: branch.icon_url
      }));
    }

    // Otherwise use the static data from branchs-maps.js
    const allBranches = branchesData.flat();
    return allBranches.slice(0, 100).map((branch: any) => ({
      id: branch.id,
      type: 'branch' as const,
      name: branch.branch,
      location: branch.address,
      latitude: branch.latitude,
      longitude: branch.longitude,
      icon: branch.icon
    }));
  }, [dbBranches]);

  // Convert technicians to MapMarker format
  const technicianMarkers = useMemo((): MapMarker[] => {
    if (!technicians || technicians.length === 0) {
      // Mock technicians for demo
      return [
        { id: "t1", type: "technician", name: "أحمد حسين", specialty: "plumbing", location: "المعادي", latitude: 30.0444, longitude: 31.2357, status: "available", rating: 4.9 },
        { id: "t2", type: "technician", name: "محمد سعيد", specialty: "electrical", location: "مصر الجديدة", latitude: 30.0900, longitude: 31.3400, status: "available", rating: 4.8 },
        { id: "t3", type: "technician", name: "خالد إبراهيم", specialty: "ac", location: "مدينة نصر", latitude: 30.0500, longitude: 31.3600, status: "busy", rating: 4.7 },
        { id: "t4", type: "technician", name: "عمر حسن", specialty: "carpentry", location: "المهندسين", latitude: 30.0600, longitude: 31.2000, status: "available", rating: 4.6 },
      ];
    }

    return technicians
      .filter(t => t.latitude && t.longitude)
      .map(tech => ({
        id: tech.id,
        type: 'technician' as const,
        name: tech.name,
        specialty: tech.specialty as ServiceType,
        location: '',
        latitude: Number(tech.latitude),
        longitude: Number(tech.longitude),
        status: tech.status as MapMarker['status'],
        rating: Number(tech.rating)
      }));
  }, [technicians]);

  const handleMarkerClick = (marker: MapMarker) => {
    if (marker.type === "technician") {
      setSelectedTechnician(marker.id);
    }
  };

  const isLoading = branchesLoading || techniciansLoading;

  return (
    <>
      <Helmet>
        <title>UberFix - خدمات الصيانة المعمارية للفروع التجارية</title>
        <meta name="description" content="تطبيق UberFix لخدمات الصيانة المعمارية للمحلات والفروع التجارية. اطلب فني كهرباء، سباكة، تكييف، نجارة أو دهانات." />
      </Helmet>
      
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {/* Header */}
        <Header 
          activeService={activeService}
          onServiceChange={setActiveService}
        />

        {/* Main Content */}
        <main className="flex-1 flex overflow-hidden">
          {/* Technicians Sidebar */}
          <TechniciansSidebar
            selectedTechnicianId={selectedTechnician}
            onSelectTechnician={setSelectedTechnician}
            activeService={activeService}
          />

          {/* Map Area */}
          <div className="flex-1 relative">
            <MapboxMap 
              branches={branchMarkers}
              technicians={technicianMarkers}
              onMarkerClick={handleMarkerClick}
              selectedMarkerId={selectedTechnician}
              isLoading={isLoading}
            />
            
            {/* Auth & Action Buttons */}
            <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-3">
              {user ? (
                <>
                  <Link to="/new-request">
                    <Button size="lg" className="gradient-primary shadow-elevated h-14 px-6 gap-2 text-lg w-full">
                      <Plus className="h-5 w-5" />
                      طلب خدمة
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut()}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    تسجيل الخروج
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  className="gradient-primary shadow-elevated h-14 px-6 gap-2 text-lg"
                  onClick={() => navigate('/auth')}
                >
                  <LogIn className="h-5 w-5" />
                  تسجيل الدخول
                </Button>
              )}
            </div>
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </>
  );
};

export default Index;

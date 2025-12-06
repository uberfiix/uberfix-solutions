import { useState } from "react";
import Header from "@/components/Header";
import TechniciansSidebar from "@/components/TechniciansSidebar";
import MapView from "@/components/MapView";
import BottomNavigation from "@/components/BottomNavigation";
import { Helmet } from "react-helmet";

const Index = () => {
  const [activeService, setActiveService] = useState("all");
  const [activeTab, setActiveTab] = useState("map");
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);

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
          />

          {/* Map Area */}
          <div className="flex-1">
            <MapView 
              onMarkerClick={(marker) => {
                if (marker.type === "technician") {
                  setSelectedTechnician(marker.id);
                }
              }}
            />
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

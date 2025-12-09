import { useState, useMemo, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loader2, Plus, LogIn, LogOut } from 'lucide-react';
import Header from '@/components/Header';
import TechniciansSidebar from '@/components/TechniciansSidebar';
import MapboxMap from '@/components/MapboxMap';
import BottomNavigation from '@/components/BottomNavigation';
import { useBranches } from '@/hooks/useBranches';
import { useTechnicians } from '@/hooks/useTechnicians';
import { useAuth } from '@/contexts/AuthContext';
import { TaskControllerProvider, useTaskController } from '@/contexts/TaskControllerContext';
import type { MapMarker, ServiceType } from '@/types/uberfix';
import { Button } from '@/components/ui/button';

import branchesData from '@/assets/data/branchs-maps.js';

// Lazy loaded tab content components
const QuickRequestTab = lazy(() => import('@/components/tabs/QuickRequestTab'));
const TrackOrdersTab = lazy(() => import('@/components/tabs/TrackOrdersTab'));
const CompletedServicesTab = lazy(() => import('@/components/tabs/CompletedServicesTab'));
const InvoicesTab = lazy(() => import('@/components/tabs/InvoicesTab'));
const ProfileTab = lazy(() => import('@/components/tabs/ProfileTab'));

const TabLoader = () => (
  <div className="flex-1 flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const IndexContent = () => {
  const [activeService, setActiveService] = useState<ServiceType | 'all'>('all');
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { activeTab, setActiveTab, isTransitioning } = useTaskController();

  const { data: dbBranches, isLoading: branchesLoading } = useBranches();
  const { data: technicians, isLoading: techniciansLoading } = useTechnicians({
    specialty: activeService === 'all' ? 'all' : activeService,
  });

  const branchMarkers = useMemo((): MapMarker[] => {
    if (dbBranches && dbBranches.length > 0) {
      return dbBranches.map((branch) => ({
        id: branch.id,
        type: 'branch' as const,
        name: branch.name_ar || branch.name,
        location: branch.address,
        latitude: Number(branch.latitude),
        longitude: Number(branch.longitude),
        icon: branch.icon_url,
      }));
    }

    const allBranches = branchesData.flat();
    return allBranches.slice(0, 100).map((branch: any) => ({
      id: branch.id,
      type: 'branch' as const,
      name: branch.branch,
      location: branch.address,
      latitude: branch.latitude,
      longitude: branch.longitude,
      icon: branch.icon,
    }));
  }, [dbBranches]);

  const technicianMarkers = useMemo((): MapMarker[] => {
    if (!technicians || technicians.length === 0) {
      return [
        {
          id: 't1',
          type: 'technician',
          name: 'أحمد حسين',
          specialty: 'plumbing',
          location: 'المعادي',
          latitude: 30.0444,
          longitude: 31.2357,
          status: 'available',
          rating: 4.9,
        },
        {
          id: 't2',
          type: 'technician',
          name: 'محمد سعيد',
          specialty: 'electrical',
          location: 'مصر الجديدة',
          latitude: 30.09,
          longitude: 31.34,
          status: 'available',
          rating: 4.8,
        },
        {
          id: 't3',
          type: 'technician',
          name: 'خالد إبراهيم',
          specialty: 'ac',
          location: 'مدينة نصر',
          latitude: 30.05,
          longitude: 31.36,
          status: 'busy',
          rating: 4.7,
        },
        {
          id: 't4',
          type: 'technician',
          name: 'عمر حسن',
          specialty: 'carpentry',
          location: 'المهندسين',
          latitude: 30.06,
          longitude: 31.2,
          status: 'available',
          rating: 4.6,
        },
      ];
    }

    return technicians
      .filter((t) => t.latitude && t.longitude)
      .map((tech) => ({
        id: tech.id,
        type: 'technician' as const,
        name: tech.name,
        specialty: tech.specialty as ServiceType,
        location: '',
        latitude: Number(tech.latitude),
        longitude: Number(tech.longitude),
        status: tech.status as MapMarker['status'],
        rating: Number(tech.rating),
      }));
  }, [technicians]);

  const handleMarkerClick = (marker: MapMarker) => {
    if (marker.type === 'technician') {
      setSelectedTechnician(marker.id);
    }
  };

  const isLoading = branchesLoading || techniciansLoading;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'map':
        return (
          <>
            <TechniciansSidebar
              selectedTechnicianId={selectedTechnician}
              onSelectTechnician={setSelectedTechnician}
              activeService={activeService}
            />
            <div className="flex-1 relative">
              <MapboxMap
                branches={branchMarkers}
                technicians={technicianMarkers}
                onMarkerClick={handleMarkerClick}
                selectedMarkerId={selectedTechnician}
                isLoading={isLoading}
              />
              <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-3">
                {user ? (
                  <>
                    <Link to="/new-request">
                      <Button
                        size="lg"
                        className="gradient-primary shadow-elevated h-14 px-6 gap-2 text-lg w-full"
                      >
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
          </>
        );
      case 'quick':
        return (
          <Suspense fallback={<TabLoader />}>
            <QuickRequestTab />
          </Suspense>
        );
      case 'track':
        return (
          <Suspense fallback={<TabLoader />}>
            <TrackOrdersTab />
          </Suspense>
        );
      case 'completed':
        return (
          <Suspense fallback={<TabLoader />}>
            <CompletedServicesTab />
          </Suspense>
        );
      case 'invoices':
        return (
          <Suspense fallback={<TabLoader />}>
            <InvoicesTab />
          </Suspense>
        );
      case 'profile':
        return (
          <Suspense fallback={<TabLoader />}>
            <ProfileTab />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>UberFix - خدمات الصيانة المعمارية للفروع التجارية</title>
        <meta
          name="description"
          content="تطبيق UberFix لخدمات الصيانة المعمارية للمحلات والفروع التجارية. اطلب فني كهرباء، سباكة، تكييف، نجارة أو دهانات."
        />
      </Helmet>

      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {activeTab === 'map' && (
          <Header activeService={activeService} onServiceChange={setActiveService} />
        )}

        <main className="flex-1 flex overflow-hidden">{renderTabContent()}</main>

        <BottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isTransitioning={isTransitioning}
        />
      </div>
    </>
  );
};

const Index = () => {
  return (
    <TaskControllerProvider>
      <IndexContent />
    </TaskControllerProvider>
  );
};

export default Index;

import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
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
    // Source technicians (from DB or fallback mocks)
    const sourceTechnicians =
      technicians && technicians.length > 0
        ? technicians.map((tech) => ({
            id: tech.id,
            name: tech.name,
            specialty: tech.specialty as ServiceType,
            status: tech.status as MapMarker['status'],
            rating: Number(tech.rating),
            latitude: tech.latitude ? Number(tech.latitude) : undefined,
            longitude: tech.longitude ? Number(tech.longitude) : undefined,
          }))
        : [
            { id: 't1', name: 'أحمد حسين', specialty: 'plumbing' as ServiceType, status: 'available' as const, rating: 4.9 },
            { id: 't2', name: 'محمد سعيد', specialty: 'electrical' as ServiceType, status: 'available' as const, rating: 4.8 },
            { id: 't3', name: 'خالد إبراهيم', specialty: 'ac' as ServiceType, status: 'busy' as const, rating: 4.7 },
            { id: 't4', name: 'عمر حسن', specialty: 'carpentry' as ServiceType, status: 'available' as const, rating: 4.6 },
            { id: 't5', name: 'ياسر عبد الرحمن', specialty: 'painting' as ServiceType, status: 'available' as const, rating: 4.5 },
            { id: 't6', name: 'سامي طارق', specialty: 'electrical' as ServiceType, status: 'available' as const, rating: 4.7 },
            { id: 't7', name: 'مصطفى علي', specialty: 'plumbing' as ServiceType, status: 'busy' as const, rating: 4.6 },
            { id: 't8', name: 'كريم نبيل', specialty: 'ac' as ServiceType, status: 'available' as const, rating: 4.8 },
          ];

    // Deterministic small offset so each technician sits near a branch but distinct
    const hash = (s: string) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
      return Math.abs(h);
    };

    return sourceTechnicians.map((tech, idx) => {
      if (tech.latitude && tech.longitude) {
        return {
          ...tech,
          type: 'technician' as const,
          location: '',
          latitude: tech.latitude,
          longitude: tech.longitude,
        };
      }
      // Anchor to a branch deterministically
      const branch = branchMarkers.length > 0
        ? branchMarkers[hash(tech.id) % branchMarkers.length]
        : { latitude: 30.0444, longitude: 31.2357 };

      const h = hash(tech.id + idx);
      // Offset: ~150-400m radius from branch
      const dLat = (((h % 100) / 100) - 0.5) * 0.004;
      const dLng = ((((h >> 7) % 100) / 100) - 0.5) * 0.004;

      return {
        ...tech,
        type: 'technician' as const,
        location: '',
        latitude: branch.latitude + dLat,
        longitude: branch.longitude + dLng,
      };
    });
  }, [technicians, branchMarkers]);

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

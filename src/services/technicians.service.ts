// Technicians Service for UberFix
// Handles technician data fetching and caching

import { supabase } from '@/integrations/supabase/client';
import { cacheService } from './cache.service';
import { locationService } from './location.service';
import type { ServiceType, TechnicianStatus } from '@/types/uberfix';

export interface TechnicianData {
  id: string;
  name: string;
  phone: string;
  avatar_url?: string;
  specialty: ServiceType;
  secondary_skills?: ServiceType[];
  status: TechnicianStatus;
  latitude?: number;
  longitude?: number;
  rating: number;
  total_reviews: number;
  total_orders: number;
  is_verified: boolean;
  is_active: boolean;
  distance?: number;
}

interface FetchOptions {
  specialty?: ServiceType | 'all';
  status?: TechnicianStatus | 'all';
  radius?: number; // in km
  sortBy?: 'distance' | 'rating' | 'orders';
}

class TechniciansService {
  private readonly CACHE_KEY = 'technicians';
  private readonly CACHE_TTL = 2 * 60 * 1000; // 2 minutes

  async fetchNearbyTechnicians(options: FetchOptions = {}): Promise<TechnicianData[]> {
    const { specialty = 'all', status = 'all', radius = 50, sortBy = 'distance' } = options;
    const cacheKey = `${this.CACHE_KEY}-${specialty}-${status}`;

    // Check cache first
    const cached = cacheService.get<TechnicianData[]>(cacheKey);
    if (cached) return this.sortAndFilterByDistance(cached, radius, sortBy);

    try {
      let query = supabase
        .from('technicians')
        .select('*')
        .eq('is_active', true);

      if (specialty !== 'all') {
        query = query.eq('specialty', specialty);
      }

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('rating', { ascending: false });

      if (error) throw error;

      const technicians: TechnicianData[] = (data || []).map((t) => ({
        id: t.id,
        name: t.name,
        phone: t.phone,
        avatar_url: t.avatar_url || undefined,
        specialty: t.specialty as ServiceType,
        secondary_skills: t.secondary_skills as ServiceType[] | undefined,
        status: t.status as TechnicianStatus,
        latitude: t.latitude ? Number(t.latitude) : undefined,
        longitude: t.longitude ? Number(t.longitude) : undefined,
        rating: Number(t.rating),
        total_reviews: t.total_reviews || 0,
        total_orders: t.total_orders || 0,
        is_verified: t.is_verified || false,
        is_active: t.is_active || false,
      }));

      cacheService.set(cacheKey, technicians, this.CACHE_TTL);

      return this.sortAndFilterByDistance(technicians, radius, sortBy);
    } catch (error) {
      console.error('Error fetching technicians:', error);
      return [];
    }
  }

  private sortAndFilterByDistance(
    technicians: TechnicianData[],
    radius: number,
    sortBy: string
  ): TechnicianData[] {
    const userLocation = locationService.getCurrentLocation();

    // Calculate distances
    const withDistance = technicians.map((tech) => {
      if (tech.latitude && tech.longitude) {
        const distance = locationService.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          tech.latitude,
          tech.longitude
        );
        return { ...tech, distance };
      }
      return { ...tech, distance: 999 };
    });

    // Filter by radius
    const filtered = withDistance.filter((t) => t.distance <= radius);

    // Sort based on preference
    return filtered.sort((a, b) => {
      if (sortBy === 'distance') {
        return a.distance - b.distance;
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (sortBy === 'orders') {
        return b.total_orders - a.total_orders;
      }
      return 0;
    });
  }

  async prefetchTechnicianIcons(): Promise<void> {
    // Pre-load technician icons for faster map rendering
    const icons = [
      '/assets/icons/tec-01.png',
      '/assets/icons/tec-02.png',
      '/assets/icons/tec-03.png',
    ];

    icons.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  invalidateCache(): void {
    cacheService.delete(this.CACHE_KEY);
  }
}

export const techniciansService = new TechniciansService();
export default techniciansService;

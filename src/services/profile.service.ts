// Profile Service for UberFix
// Handles user profile and addresses

import { supabase } from '@/integrations/supabase/client';
import { cacheService } from './cache.service';

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export interface UserAddress {
  id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

class ProfileService {
  private readonly CACHE_KEY = 'user-profile';
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    const cacheKey = `${this.CACHE_KEY}-${userId}`;
    const cached = cacheService.get<UserProfile>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const profile: UserProfile = {
          id: data.id,
          full_name: data.full_name || undefined,
          phone: data.phone || undefined,
          avatar_url: data.avatar_url || undefined,
          created_at: data.created_at,
        };
        cacheService.set(cacheKey, profile, this.CACHE_TTL);
        return profile;
      }

      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  async fetchUserAddresses(): Promise<UserAddress[]> {
    // In production, this would fetch from database
    // For now, return saved addresses from localStorage
    const saved = localStorage.getItem('userAddresses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  }

  async saveAddress(address: Omit<UserAddress, 'id'>): Promise<UserAddress> {
    const addresses = await this.fetchUserAddresses();
    const newAddress: UserAddress = {
      ...address,
      id: `addr-${Date.now()}`,
    };
    addresses.push(newAddress);
    localStorage.setItem('userAddresses', JSON.stringify(addresses));
    return newAddress;
  }

  invalidateCache(userId: string): void {
    cacheService.delete(`${this.CACHE_KEY}-${userId}`);
  }
}

export const profileService = new ProfileService();
export default profileService;

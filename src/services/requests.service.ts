// Requests Service for UberFix
// Handles service request operations

import { supabase } from '@/integrations/supabase/client';
import { cacheService } from './cache.service';
import type { ServiceType, OrderStatus } from '@/types/uberfix';

export interface ServiceRequest {
  id: string;
  order_number: string;
  branch_id?: string;
  technician_id?: string;
  requested_by?: string;
  service_type: ServiceType;
  title: string;
  description?: string;
  priority: string;
  status: OrderStatus;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  estimated_cost?: number;
  final_cost?: number;
  notes?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateRequestInput {
  branch_id?: string;
  technician_id?: string;
  service_type: ServiceType;
  title: string;
  description?: string;
  priority?: string;
  scheduled_at?: string;
  estimated_cost?: number;
  images?: string[];
}

class RequestsService {
  private readonly CACHE_KEY = 'user-requests';
  private readonly CACHE_TTL = 60 * 1000; // 1 minute

  async fetchActiveRequests(userId: string): Promise<ServiceRequest[]> {
    const cacheKey = `${this.CACHE_KEY}-${userId}-active`;
    const cached = cacheService.get<ServiceRequest[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .eq('requested_by', userId)
        .in('status', ['pending', 'accepted', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const requests = (data || []) as ServiceRequest[];
      cacheService.set(cacheKey, requests, this.CACHE_TTL);
      return requests;
    } catch (error) {
      console.error('Error fetching active requests:', error);
      return [];
    }
  }

  async fetchAllRequests(userId: string): Promise<ServiceRequest[]> {
    const cacheKey = `${this.CACHE_KEY}-${userId}-all`;
    const cached = cacheService.get<ServiceRequest[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .eq('requested_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const requests = (data || []) as ServiceRequest[];
      cacheService.set(cacheKey, requests, this.CACHE_TTL);
      return requests;
    } catch (error) {
      console.error('Error fetching all requests:', error);
      return [];
    }
  }

  async fetchRequestById(requestId: string): Promise<ServiceRequest | null> {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .eq('id', requestId)
        .maybeSingle();

      if (error) throw error;
      return data as ServiceRequest | null;
    } catch (error) {
      console.error('Error fetching request:', error);
      return null;
    }
  }

  async createRequest(input: CreateRequestInput): Promise<ServiceRequest | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const orderNumber = `UF-${Date.now().toString(36).toUpperCase()}`;

      const { data, error } = await supabase
        .from('service_orders')
        .insert({
          ...input,
          order_number: orderNumber,
          requested_by: userData.user.id,
          status: 'pending',
          priority: input.priority || 'normal',
        })
        .select()
        .single();

      if (error) throw error;

      // Invalidate cache
      this.invalidateCache(userData.user.id);

      return data as ServiceRequest;
    } catch (error) {
      console.error('Error creating request:', error);
      return null;
    }
  }

  async updateRequestStatus(
    requestId: string,
    status: OrderStatus
  ): Promise<boolean> {
    try {
      const updates: Record<string, unknown> = { status };

      if (status === 'in_progress') {
        updates.started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('service_orders')
        .update(updates)
        .eq('id', requestId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating request status:', error);
      return false;
    }
  }

  prefetchForQuickRequest(): void {
    // Prefetch last used address and service type from localStorage
    const lastServiceType = localStorage.getItem('lastServiceType');
    const lastAddress = localStorage.getItem('lastAddress');
    
    if (lastServiceType) {
      cacheService.set('quick-request-service', lastServiceType, 10 * 60 * 1000);
    }
    if (lastAddress) {
      cacheService.set('quick-request-address', lastAddress, 10 * 60 * 1000);
    }
  }

  saveLastUsedData(serviceType: ServiceType, address: string): void {
    localStorage.setItem('lastServiceType', serviceType);
    localStorage.setItem('lastAddress', address);
  }

  invalidateCache(userId: string): void {
    cacheService.delete(`${this.CACHE_KEY}-${userId}-active`);
    cacheService.delete(`${this.CACHE_KEY}-${userId}-all`);
  }
}

export const requestsService = new RequestsService();
export default requestsService;

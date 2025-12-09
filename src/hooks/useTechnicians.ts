import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Technician, ServiceType } from '@/types/uberfix';

interface UseTechniciansOptions {
  specialty?: ServiceType | 'all';
  status?: 'available' | 'all';
}

export const useTechnicians = (options: UseTechniciansOptions = {}) => {
  const { specialty = 'all', status = 'all' } = options;

  return useQuery({
    queryKey: ['technicians', specialty, status],
    queryFn: async (): Promise<Technician[]> => {
      let query = supabase
        .from('technicians')
        .select('*')
        .eq('is_active', true);
      
      if (specialty !== 'all') {
        query = query.eq('specialty', specialty);
      }
      
      if (status === 'available') {
        query = query.eq('status', 'available');
      }
      
      const { data, error } = await query.order('rating', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
};

export const useTechnicianById = (id: string | null) => {
  return useQuery({
    queryKey: ['technician', id],
    queryFn: async (): Promise<Technician | null> => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
};

// Hook for fetching nearby technicians using edge function
interface NearbyTechniciansParams {
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  specialty?: string;
}

export const useNearbyTechnicians = (params: NearbyTechniciansParams) => {
  return useQuery({
    queryKey: ['nearby-technicians', params],
    queryFn: async () => {
      if (!params.latitude || !params.longitude) {
        // Fallback to regular query
        const { data, error } = await supabase
          .from('technicians')
          .select('*')
          .eq('is_active', true)
          .order('rating', { ascending: false });
        
        if (error) throw error;
        return data || [];
      }

      const { data, error } = await supabase.functions.invoke('get-nearby-technicians', {
        body: {
          latitude: params.latitude,
          longitude: params.longitude,
          radius_km: params.radius_km || 10,
          specialty: params.specialty === 'all' ? undefined : params.specialty
        }
      });

      if (error) throw error;
      return data?.technicians || [];
    },
    enabled: true
  });
};

// Hook for creating service request
interface CreateServiceRequestData {
  title: string;
  description?: string;
  service_type: string;
  technician_id?: string;
  branch_id?: string;
  scheduled_at?: string;
  priority?: string;
  images?: string[];
}

export const useCreateServiceRequest = () => {
  return useMutation({
    mutationFn: async (data: CreateServiceRequestData) => {
      const { data: result, error } = await supabase.functions.invoke('create-service-request', {
        body: data
      });

      if (error) throw error;
      return result;
    }
  });
};

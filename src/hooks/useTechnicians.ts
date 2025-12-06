import { useQuery } from '@tanstack/react-query';
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

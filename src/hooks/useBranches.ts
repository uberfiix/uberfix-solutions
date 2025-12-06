import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Branch } from '@/types/uberfix';

export const useBranches = () => {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async (): Promise<Branch[]> => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });
};

export const useBranchById = (id: string | null) => {
  return useQuery({
    queryKey: ['branch', id],
    queryFn: async (): Promise<Branch | null> => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
};

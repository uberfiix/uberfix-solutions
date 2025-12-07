import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface TechnicianLocation {
  technician_id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
}

interface UseTechnicianTrackingOptions {
  technicianId?: string;
  enabled?: boolean;
}

export const useTechnicianTracking = (options: UseTechnicianTrackingOptions = {}) => {
  const { technicianId, enabled = true } = options;
  const [location, setLocation] = useState<TechnicianLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (!enabled || !technicianId) return;

    let channel: RealtimeChannel;

    const setupTracking = async () => {
      setIsTracking(true);

      // Get initial location
      const { data: initialLocation } = await supabase
        .from('technician_locations')
        .select('*')
        .eq('technician_id', technicianId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (initialLocation) {
        setLocation(initialLocation);
      }

      // Subscribe to real-time updates
      channel = supabase
        .channel(`technician-location-${technicianId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'technician_locations',
            filter: `technician_id=eq.${technicianId}`
          },
          (payload) => {
            const newLocation = payload.new as TechnicianLocation;
            setLocation(newLocation);
          }
        )
        .subscribe();
    };

    setupTracking();

    return () => {
      setIsTracking(false);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [technicianId, enabled]);

  return { location, isTracking };
};

// Hook for tracking multiple technicians (for map view)
export const useAllTechniciansTracking = (enabled: boolean = true) => {
  const [locations, setLocations] = useState<Map<string, TechnicianLocation>>(new Map());

  useEffect(() => {
    if (!enabled) return;

    let channel: RealtimeChannel;

    const setupTracking = async () => {
      // Get all active technician locations
      const { data: initialLocations } = await supabase
        .from('technicians')
        .select('id, latitude, longitude, updated_at')
        .eq('is_active', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (initialLocations) {
        const locationMap = new Map<string, TechnicianLocation>();
        initialLocations.forEach((tech) => {
          if (tech.latitude && tech.longitude) {
            locationMap.set(tech.id, {
              technician_id: tech.id,
              latitude: Number(tech.latitude),
              longitude: Number(tech.longitude),
              recorded_at: tech.updated_at
            });
          }
        });
        setLocations(locationMap);
      }

      // Subscribe to real-time location updates
      channel = supabase
        .channel('all-technician-locations')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'technicians'
          },
          (payload) => {
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              const tech = payload.new as any;
              if (tech.latitude && tech.longitude && tech.is_active) {
                setLocations((prev) => {
                  const newMap = new Map(prev);
                  newMap.set(tech.id, {
                    technician_id: tech.id,
                    latitude: Number(tech.latitude),
                    longitude: Number(tech.longitude),
                    recorded_at: tech.updated_at
                  });
                  return newMap;
                });
              }
            } else if (payload.eventType === 'DELETE') {
              const tech = payload.old as any;
              setLocations((prev) => {
                const newMap = new Map(prev);
                newMap.delete(tech.id);
                return newMap;
              });
            }
          }
        )
        .subscribe();
    };

    setupTracking();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [enabled]);

  return { locations };
};

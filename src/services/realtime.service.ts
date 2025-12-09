// Realtime Service for UberFix
// Manages Supabase realtime subscriptions

import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Subscription {
  channel: RealtimeChannel;
  refCount: number;
}

class RealtimeService {
  private subscriptions: Map<string, Subscription> = new Map();

  subscribeToTechnicians(
    onUpdate: (payload: unknown) => void
  ): () => void {
    const key = 'technicians';
    
    if (this.subscriptions.has(key)) {
      const sub = this.subscriptions.get(key)!;
      sub.refCount++;
      return () => this.unsubscribe(key);
    }

    const channel = supabase
      .channel('technicians-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'technicians',
        },
        onUpdate
      )
      .subscribe();

    this.subscriptions.set(key, { channel, refCount: 1 });

    return () => this.unsubscribe(key);
  }

  subscribeToOrderStatus(
    orderId: string,
    onUpdate: (payload: unknown) => void
  ): () => void {
    const key = `order-${orderId}`;

    if (this.subscriptions.has(key)) {
      const sub = this.subscriptions.get(key)!;
      sub.refCount++;
      return () => this.unsubscribe(key);
    }

    const channel = supabase
      .channel(`order-${orderId}-changes`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'service_orders',
          filter: `id=eq.${orderId}`,
        },
        onUpdate
      )
      .subscribe();

    this.subscriptions.set(key, { channel, refCount: 1 });

    return () => this.unsubscribe(key);
  }

  subscribeToUserOrders(
    userId: string,
    onUpdate: (payload: unknown) => void
  ): () => void {
    const key = `user-orders-${userId}`;

    if (this.subscriptions.has(key)) {
      const sub = this.subscriptions.get(key)!;
      sub.refCount++;
      return () => this.unsubscribe(key);
    }

    const channel = supabase
      .channel(`user-${userId}-orders`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_orders',
          filter: `requested_by=eq.${userId}`,
        },
        onUpdate
      )
      .subscribe();

    this.subscriptions.set(key, { channel, refCount: 1 });

    return () => this.unsubscribe(key);
  }

  private unsubscribe(key: string): void {
    const sub = this.subscriptions.get(key);
    if (!sub) return;

    sub.refCount--;
    if (sub.refCount <= 0) {
      supabase.removeChannel(sub.channel);
      this.subscriptions.delete(key);
    }
  }

  unsubscribeAll(): void {
    for (const [key, sub] of this.subscriptions.entries()) {
      supabase.removeChannel(sub.channel);
      this.subscriptions.delete(key);
    }
  }
}

export const realtimeService = new RealtimeService();
export default realtimeService;

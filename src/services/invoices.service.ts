// Invoices Service for UberFix
// Handles invoice summary and details

import { supabase } from '@/integrations/supabase/client';
import { cacheService } from './cache.service';

export interface InvoiceSummary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  invoiceCount: number;
  recentInvoices: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  serviceType: string;
  technicianName?: string;
  createdAt: string;
}

class InvoicesService {
  private readonly CACHE_KEY = 'invoices';
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async fetchInvoicesSummary(userId: string): Promise<InvoiceSummary> {
    const cacheKey = `${this.CACHE_KEY}-summary-${userId}`;
    const cached = cacheService.get<InvoiceSummary>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select('id, order_number, service_type, final_cost, status, created_at')
        .eq('requested_by', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const invoices: InvoiceItem[] = (data || []).map((order) => ({
        id: order.id,
        orderId: order.id,
        orderNumber: order.order_number,
        amount: order.final_cost || 0,
        status: 'paid' as const,
        serviceType: order.service_type,
        createdAt: order.created_at,
      }));

      const summary: InvoiceSummary = {
        totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
        paidAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
        pendingAmount: 0,
        invoiceCount: invoices.length,
        recentInvoices: invoices.slice(0, 5),
      };

      cacheService.set(cacheKey, summary, this.CACHE_TTL);
      return summary;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return {
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        invoiceCount: 0,
        recentInvoices: [],
      };
    }
  }

  invalidateCache(userId: string): void {
    cacheService.delete(`${this.CACHE_KEY}-summary-${userId}`);
  }
}

export const invoicesService = new InvoicesService();
export default invoicesService;

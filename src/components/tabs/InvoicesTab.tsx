import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, Loader2, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { invoicesService, type InvoiceSummary } from '@/services/invoices.service';
import { SERVICE_LABELS, type ServiceType } from '@/types/uberfix';

const InvoicesTab = () => {
  const [summary, setSummary] = useState<InvoiceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadInvoices = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const data = await invoicesService.fetchInvoicesSummary(user.id);
      setSummary(data);
      setIsLoading(false);
    };

    loadInvoices();
  }, [user]);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-6">
        <Receipt className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">الفواتير</h2>
        <p className="text-muted-foreground mb-6">يجب تسجيل الدخول لعرض فواتيرك</p>
        <Link to="/auth">
          <Button className="gradient-primary">تسجيل الدخول</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!summary || summary.invoiceCount === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-6">
        <Receipt className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">لا توجد فواتير</h2>
        <p className="text-muted-foreground mb-6">ستظهر هنا فواتير خدماتك المكتملة</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 gradient-primary rounded-xl flex items-center justify-center shadow-card">
            <Receipt className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">الفواتير</h1>
            <p className="text-muted-foreground">{summary.invoiceCount} فاتورة</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 shadow-card text-center">
            <p className="text-sm text-muted-foreground mb-1">الإجمالي</p>
            <p className="text-xl font-bold text-foreground">{summary.totalAmount} ج.م</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card text-center">
            <p className="text-sm text-muted-foreground mb-1">المدفوع</p>
            <p className="text-xl font-bold text-status-available">{summary.paidAmount} ج.م</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card text-center">
            <p className="text-sm text-muted-foreground mb-1">المعلق</p>
            <p className="text-xl font-bold text-status-busy">{summary.pendingAmount} ج.م</p>
          </div>
        </div>

        {/* Invoices List */}
        <h2 className="text-lg font-semibold text-foreground mb-4">آخر الفواتير</h2>
        <div className="space-y-3">
          {summary.recentInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-card rounded-xl p-4 shadow-card flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-foreground">#{invoice.orderNumber}</p>
                <p className="text-sm text-primary">
                  {SERVICE_LABELS[invoice.serviceType as ServiceType] || invoice.serviceType}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(invoice.createdAt).toLocaleDateString('ar-EG')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-foreground">{invoice.amount} ج.م</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvoicesTab;

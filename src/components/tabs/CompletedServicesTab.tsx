import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Loader2, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { requestsService, type ServiceRequest } from '@/services/requests.service';
import { SERVICE_LABELS } from '@/types/uberfix';

const CompletedServicesTab = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadRequests = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const allRequests = await requestsService.fetchAllRequests(user.id);
      const completed = allRequests.filter((r) => r.status === 'completed');
      setRequests(completed);
      setIsLoading(false);
    };

    loadRequests();
  }, [user]);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-6">
        <CheckCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">الخدمات المكتملة</h2>
        <p className="text-muted-foreground mb-6">يجب تسجيل الدخول لعرض سجل خدماتك</p>
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

  if (requests.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-6">
        <CheckCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">لا توجد خدمات مكتملة</h2>
        <p className="text-muted-foreground mb-6">ستظهر هنا الخدمات التي تم إنجازها</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-status-available/10 rounded-xl flex items-center justify-center shadow-card">
            <CheckCircle className="w-8 h-8 text-status-available" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">الخدمات المكتملة</h1>
            <p className="text-muted-foreground">{requests.length} خدمة مكتملة</p>
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-card rounded-xl p-5 shadow-card"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{request.title}</h3>
                  <p className="text-sm text-primary">
                    {SERVICE_LABELS[request.service_type]}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-uberfix-yellow">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">5.0</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {request.completed_at
                      ? new Date(request.completed_at).toLocaleDateString('ar-EG')
                      : new Date(request.created_at).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                {request.final_cost && (
                  <span className="font-semibold text-foreground">
                    {request.final_cost} ج.م
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  #{request.order_number}
                </span>
                <Button variant="outline" size="sm">
                  عرض التفاصيل
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompletedServicesTab;

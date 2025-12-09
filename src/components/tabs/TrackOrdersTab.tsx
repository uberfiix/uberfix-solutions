import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Loader2, Clock, MapPin, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { requestsService, type ServiceRequest } from '@/services/requests.service';
import { SERVICE_LABELS, ORDER_STATUS_LABELS, type OrderStatus } from '@/types/uberfix';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const TrackOrdersTab = () => {
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
      const data = await requestsService.fetchActiveRequests(user.id);
      setRequests(data);
      setIsLoading(false);
    };

    loadRequests();
  }, [user]);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-6">
        <ClipboardList className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">تتبع طلباتك</h2>
        <p className="text-muted-foreground mb-6">يجب تسجيل الدخول لعرض طلباتك</p>
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
        <ClipboardList className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">لا توجد طلبات نشطة</h2>
        <p className="text-muted-foreground mb-6">ابدأ بطلب خدمة صيانة جديدة</p>
        <Link to="/new-request">
          <Button className="gradient-primary">طلب خدمة جديدة</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 gradient-primary rounded-xl flex items-center justify-center shadow-card">
            <ClipboardList className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">تتبع الطلبات</h1>
            <p className="text-muted-foreground">{requests.length} طلب نشط</p>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {requests.map((request) => (
            <Link key={request.id} to={`/order/${request.id}`}>
              <div className="bg-card rounded-xl p-5 shadow-card hover:shadow-elevated transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{request.title}</h3>
                    <p className="text-sm text-primary">
                      {SERVICE_LABELS[request.service_type]}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[request.status]
                    }`}
                  >
                    {ORDER_STATUS_LABELS[request.status]}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(request.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">#{request.order_number}</span>
                  </div>
                </div>

                {request.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {request.description}
                  </p>
                )}

                <div className="flex items-center justify-end mt-3 text-primary text-sm">
                  <span>عرض التفاصيل</span>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackOrdersTab;

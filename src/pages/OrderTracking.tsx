import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ORDER_STATUS_LABELS, SERVICE_LABELS, type OrderStatus } from '@/types/uberfix';
import { getTechnicianIcon } from '@/components/TechnicianCard';
import { 
  ArrowRight, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Star, 
  Clock, 
  CheckCircle2, 
  Loader2,
  Navigation,
  User,
  Wrench
} from 'lucide-react';

// Mock order data - in real app, this would come from Supabase
const mockOrder = {
  id: '1',
  order_number: 'UF-241206-0001',
  title: 'إصلاح مكيف غرفة النوم',
  description: 'المكيف لا يبرد بشكل جيد ويصدر صوت غريب',
  service_type: 'ac' as const,
  status: 'in_progress' as OrderStatus,
  technician: {
    id: '1',
    name: 'أحمد محمد',
    phone: '+966501234567',
    rating: 4.8,
    total_orders: 156,
    latitude: 24.7136,
    longitude: 46.6753,
  },
  branch: {
    name: 'فرع الرياض - حي النخيل',
  },
  scheduled_at: '2024-12-06T14:00:00',
  created_at: '2024-12-06T10:30:00',
  estimated_arrival: 15, // minutes
};

const statusSteps: OrderStatus[] = ['pending', 'accepted', 'in_progress', 'completed'];

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order] = useState(mockOrder);
  const [technicianLocation, setTechnicianLocation] = useState({
    lat: 24.7136,
    lng: 46.6753
  });

  // Simulate technician movement
  useEffect(() => {
    const interval = setInterval(() => {
      setTechnicianLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getCurrentStep = () => {
    return statusSteps.indexOf(order.status);
  };

  const getProgress = () => {
    const step = getCurrentStep();
    return ((step + 1) / statusSteps.length) * 100;
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      pending: 'bg-amber-500',
      accepted: 'bg-blue-500',
      in_progress: 'bg-primary',
      completed: 'bg-green-500',
      cancelled: 'bg-destructive'
    };
    return colors[status];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-primary text-primary-foreground p-6">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-4"
            onClick={() => navigate('/')}
          >
            <ArrowRight className="h-5 w-5 ml-2" />
            العودة
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">تتبع الطلب</h1>
              <p className="text-primary-foreground/80 mt-1">#{order.order_number}</p>
            </div>
            <Badge className={`${getStatusColor(order.status)} text-white px-4 py-1`}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">
        {/* Progress Tracker */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">حالة الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={getProgress()} className="h-2 mb-6" />
            <div className="flex justify-between">
              {statusSteps.map((status, index) => {
                const isCompleted = index <= getCurrentStep();
                const isCurrent = index === getCurrentStep();
                return (
                  <div key={status} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isCompleted 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    } ${isCurrent ? 'ring-4 ring-primary/30' : ''}`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`text-xs text-center ${
                      isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}>
                      {ORDER_STATUS_LABELS[status]}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Technician Card with Live Tracking */}
        {order.technician && (
          <Card className="shadow-card overflow-hidden">
            <div className="bg-gradient-to-l from-primary/10 to-transparent p-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={getTechnicianIcon(order.technician.id)}
                    alt={order.technician.name}
                    className="w-16 h-16 rounded-full object-cover border-3 border-primary"
                  />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground">{order.technician.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span>{order.technician.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wrench className="h-4 w-4" />
                      <span>{order.technician.total_orders} طلب</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* ETA */}
            {order.status === 'in_progress' && (
              <div className="bg-primary/5 p-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-primary animate-pulse" />
                    <span className="font-medium text-foreground">في الطريق إليك</span>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-primary">{order.estimated_arrival} دقيقة</div>
                    <div className="text-xs text-muted-foreground">الوقت المتوقع للوصول</div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Buttons */}
            <div className="p-4 flex gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <a href={`tel:${order.technician.phone}`}>
                  <Phone className="h-4 w-4 ml-2" />
                  اتصال
                </a>
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageSquare className="h-4 w-4 ml-2" />
                رسالة
              </Button>
              <Button variant="default" className="flex-1">
                <MapPin className="h-4 w-4 ml-2" />
                تتبع الموقع
              </Button>
            </div>
          </Card>
        )}

        {/* Order Details */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              تفاصيل الطلب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">نوع الخدمة</span>
              <Badge variant="secondary">{SERVICE_LABELS[order.service_type]}</Badge>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">العنوان</span>
              <span className="font-medium text-foreground">{order.title}</span>
            </div>
            {order.description && (
              <div className="py-3 border-b border-border">
                <span className="text-muted-foreground block mb-2">الوصف</span>
                <p className="text-foreground">{order.description}</p>
              </div>
            )}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">الفرع</span>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{order.branch.name}</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">تاريخ الإنشاء</span>
              <span className="font-medium text-foreground">
                {new Date(order.created_at).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Cancel Button */}
        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <Button variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive/10">
            إلغاء الطلب
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;

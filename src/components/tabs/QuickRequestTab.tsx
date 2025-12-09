import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, MapPin, Wrench, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { catalogService, type ServiceCategory } from '@/services/catalog.service';
import { locationService } from '@/services/location.service';
import { SERVICE_LABELS, type ServiceType } from '@/types/uberfix';
import { toast } from '@/hooks/use-toast';

const QuickRequestTab = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const catalog = await catalogService.fetchCatalog();
      setCategories(catalog);

      // Load last used data
      const lastService = localStorage.getItem('lastServiceType') as ServiceType;
      const lastAddress = localStorage.getItem('lastAddress');
      if (lastService) setSelectedService(lastService);
      if (lastAddress) setAddress(lastAddress);

      // Get current location for address
      const location = await locationService.requestCurrentPosition();
      if (!lastAddress && location) {
        setAddress(`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleSubmit = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!selectedService) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار نوع الخدمة',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Save last used data
    localStorage.setItem('lastServiceType', selectedService);
    localStorage.setItem('lastAddress', address);

    // Navigate to full request form
    navigate(`/new-request?service=${selectedService}&description=${encodeURIComponent(description)}`);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 gradient-accent rounded-xl flex items-center justify-center shadow-card">
            <Zap className="w-8 h-8 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">طلب صيانة سريع</h1>
            <p className="text-muted-foreground">اختر نوع الخدمة وسنجد لك أقرب فني متاح</p>
          </div>
        </div>

        {/* Service Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">اختر نوع الخدمة</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedService(category.id)}
                className={`p-4 rounded-xl border-2 transition-all text-right ${
                  selectedService === category.id
                    ? 'border-primary bg-primary/5 shadow-card'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="text-3xl mb-2 block">{category.icon}</span>
                <span className="font-semibold text-foreground block">{category.nameAr}</span>
                <span className="text-xs text-muted-foreground">
                  من {category.basePrice} ج.م
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            <MapPin className="w-4 h-4 inline-block ml-1" />
            العنوان
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="أدخل عنوانك..."
            className="w-full h-12 px-4 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Description */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-2">
            <Wrench className="w-4 h-4 inline-block ml-1" />
            وصف المشكلة (اختياري)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اشرح المشكلة بإيجاز..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Submit Button */}
        <Button
          size="lg"
          className="w-full gradient-accent h-14 text-lg gap-2"
          onClick={handleSubmit}
          disabled={!selectedService || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Zap className="w-5 h-5" />
              ابحث عن فني الآن
            </>
          )}
        </Button>

        {!user && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            يجب تسجيل الدخول لإرسال الطلب
          </p>
        )}
      </div>
    </div>
  );
};

export default QuickRequestTab;

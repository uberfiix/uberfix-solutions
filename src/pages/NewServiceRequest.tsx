import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTechnicians } from '@/hooks/useTechnicians';
import { useBranches } from '@/hooks/useBranches';
import { SERVICE_LABELS, type ServiceType } from '@/types/uberfix';
import { getTechnicianIcon } from '@/components/TechnicianCard';
import { ArrowRight, Wrench, User, MapPin, Star, Phone, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const NewServiceRequest = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<ServiceType | ''>('');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: technicians, isLoading: loadingTechnicians } = useTechnicians({
    specialty: selectedService || 'all',
    status: 'available'
  });

  const { data: branches, isLoading: loadingBranches } = useBranches();

  const serviceTypes: ServiceType[] = ['electrical', 'plumbing', 'ac', 'carpentry', 'painting', 'general'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !title) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call - in real app, this would create the order in Supabase
    setTimeout(() => {
      toast.success('تم إنشاء طلب الخدمة بنجاح!');
      setIsSubmitting(false);
      navigate('/');
    }, 1500);
  };

  const getServiceIcon = (service: ServiceType) => {
    const icons: Record<ServiceType, string> = {
      electrical: '⚡',
      plumbing: '🔧',
      ac: '❄️',
      carpentry: '🪚',
      painting: '🎨',
      general: '🔨'
    };
    return icons[service];
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
          <h1 className="text-2xl font-bold">طلب خدمة جديدة</h1>
          <p className="text-primary-foreground/80 mt-1">اختر نوع الخدمة والفني المناسب</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Type Selection */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="h-5 w-5 text-primary" />
                نوع الخدمة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {serviceTypes.map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => {
                      setSelectedService(service);
                      setSelectedTechnician('');
                    }}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedService === service
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border hover:border-primary/50 hover:bg-muted'
                    }`}
                  >
                    <div className="text-3xl mb-2">{getServiceIcon(service)}</div>
                    <div className="font-medium text-foreground">{SERVICE_LABELS[service]}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                تفاصيل الطلب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان الطلب *</Label>
                <Input
                  id="title"
                  placeholder="مثال: إصلاح مكيف غرفة النوم"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">وصف المشكلة</Label>
                <Textarea
                  id="description"
                  placeholder="اشرح المشكلة بالتفصيل..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-right min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Branch Selection */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                الفرع
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingBranches ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفرع" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{branch.name_ar || branch.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Technician Selection */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                اختيار الفني
                {selectedService && (
                  <Badge variant="secondary" className="mr-2">
                    {SERVICE_LABELS[selectedService]}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedService ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>اختر نوع الخدمة أولاً لعرض الفنيين المتاحين</p>
                </div>
              ) : loadingTechnicians ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : technicians && technicians.length > 0 ? (
                <div className="grid gap-3">
                  {technicians.map((technician, index) => (
                    <button
                      key={technician.id}
                      type="button"
                      onClick={() => setSelectedTechnician(technician.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-right ${
                        selectedTechnician === technician.id
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-border hover:border-primary/50 hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={getTechnicianIcon(technician.id)}
                          alt={technician.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-border"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{technician.name}</h3>
                            {technician.is_verified && (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              <span>{technician.rating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Wrench className="h-4 w-4" />
                              <span>{technician.total_orders} طلب</span>
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant={technician.status === 'available' ? 'default' : 'secondary'}
                          className={technician.status === 'available' ? 'bg-green-500' : ''}
                        >
                          {technician.status === 'available' ? 'متاح' : 'مشغول'}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>لا يوجد فنيين متاحين حالياً لهذه الخدمة</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            type="submit" 
            size="lg" 
            className="w-full gradient-primary text-lg h-14"
            disabled={isSubmitting || !selectedService || !title}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin ml-2" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 ml-2" />
                إرسال الطلب
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default NewServiceRequest;

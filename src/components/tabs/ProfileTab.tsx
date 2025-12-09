import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Loader2, LogOut, Phone, Mail, MapPin, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { profileService, type UserProfile, type UserAddress } from '@/services/profile.service';

const ProfileTab = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const [profileData, addressData] = await Promise.all([
        profileService.fetchUserProfile(user.id),
        profileService.fetchUserAddresses(),
      ]);
      setProfile(profileData);
      setAddresses(addressData);
      setIsLoading(false);
    };

    loadProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-6">
        <User className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">الملف الشخصي</h2>
        <p className="text-muted-foreground mb-6">يجب تسجيل الدخول لعرض ملفك الشخصي</p>
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

  return (
    <div className="flex-1 bg-background overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6">
        {/* Profile Header */}
        <div className="bg-card rounded-2xl p-6 shadow-card mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center text-3xl text-primary-foreground">
              {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">
                {profile?.full_name || 'مستخدم'}
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" size="icon">
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            {profile?.phone && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{profile.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-card rounded-2xl p-6 shadow-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">العناوين المحفوظة</h2>
            <Button variant="outline" size="sm">
              إضافة عنوان
            </Button>
          </div>

          {addresses.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">لم تقم بحفظ أي عناوين بعد</p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border"
                >
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{addr.label}</p>
                    <p className="text-sm text-muted-foreground">{addr.address}</p>
                  </div>
                  {addr.isDefault && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      افتراضي
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="bg-card rounded-2xl p-6 shadow-card mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">معلومات الحساب</h2>
          <div className="text-sm text-muted-foreground">
            <p>
              تاريخ الإنشاء:{' '}
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('ar-EG')
                : '-'}
            </p>
          </div>
        </div>

        {/* Sign Out Button */}
        <Button
          variant="destructive"
          className="w-full gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );
};

export default ProfileTab;

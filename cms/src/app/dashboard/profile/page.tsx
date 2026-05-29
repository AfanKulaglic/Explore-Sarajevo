'use client';

import * as React from 'react';
import { PageHeader, Card, Button, Input } from '@/components/ui';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import {
  User,
  Mail,
  Lock,
  Camera,
  Save,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { CmsThumbnail } from '@/components/ui/CmsThumbnail';
import { USER_ROLES, ASSIGNABLE_SECTIONS } from '@/lib/config/entities';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  avatar_url: string | null;
  assigned_sections: string[];
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

function ProfileContent() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchProfile = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const res = await fetch(`/api/cms/users/${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfile(data);
      setFormData(prev => ({
        ...prev,
        name: data.name || data.username || '',
        email: data.email || '',
        phone: data.phone || '',
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      const updateData: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
      };

      const res = await fetch(`/api/cms/users/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) throw new Error('Failed to update profile');
      
      setMessage({ type: 'success', text: t('profile.profileUpdated') });
      fetchProfile();
    } catch {
      setMessage({ type: 'error', text: t('messages.errorOccurred') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!profile) return;
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: t('profile.passwordMismatch') });
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: t('profile.passwordTooShort') });
      return;
    }
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch(`/api/cms/users/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: formData.newPassword }),
      });

      if (!res.ok) throw new Error('Failed to change password');
      
      setMessage({ type: 'success', text: t('profile.passwordChanged') });
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch {
      setMessage({ type: 'error', text: t('messages.errorOccurred') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile || !e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: language === 'en' ? 'Please select an image' : 'Molimo odaberite sliku' });
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: language === 'en' ? 'Image must be smaller than 2MB' : 'Slika mora biti manja od 2MB' });
      return;
    }
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'avatars');
      
      const uploadRes = await fetch('/api/cms/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      
      if (!uploadRes.ok) throw new Error('Upload failed');
      
      const { url } = await uploadRes.json();
      
      // Update user avatar
      const updateRes = await fetch(`/api/cms/users/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: url }),
      });
      
      if (!updateRes.ok) throw new Error('Failed to update avatar');
      
      setMessage({ type: 'success', text: language === 'en' ? 'Avatar updated successfully!' : 'Avatar uspješno ažuriran!' });
      fetchProfile();
    } catch {
      setMessage({ type: 'error', text: t('messages.errorOccurred') });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('profile.title')} description={t('profile.description')} />
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-slate-100 rounded-lg" />
          <div className="h-48 bg-slate-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('profile.title')} description={t('profile.description')} />
        <Card>
          <p className="text-center text-slate-500 py-8">{language === 'en' ? 'Profile not found' : 'Profil nije pronađen'}</p>
        </Card>
      </div>
    );
  }

  const roleInfo = USER_ROLES[profile.role as keyof typeof USER_ROLES];

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('profile.title')} 
        description={t('profile.description')}
      />

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <div className="text-center">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {profile.avatar_url ? (
                  <CmsThumbnail
                    src={profile.avatar_url}
                    alt={profile.name ? `Avatar: ${profile.name}` : 'Profilska fotografija'}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile.email.charAt(0).toUpperCase()
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"
              >
                <Camera className="w-4 h-4 text-slate-600" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            
            <h2 className="text-lg font-semibold text-slate-900">
              {profile.name || profile.email.split('@')[0]}
            </h2>
            <p className="text-sm text-slate-500 mb-4">{profile.email}</p>
            
            {/* Role badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full mb-4">
              <Shield className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">
                {roleInfo?.name[language] || profile.role}
              </span>
            </div>
            
            {/* Stats */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-left">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{t('profile.memberSince')}</span>
                <span className="text-slate-700">{formatDate(profile.created_at)}</span>
              </div>
              {profile.last_login && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{t('profile.lastLogin')}</span>
                  <span className="text-slate-700">{formatDate(profile.last_login)}</span>
                </div>
              )}
            </div>
            
            {/* Sections access */}
            {profile.assigned_sections && profile.assigned_sections.length > 0 && (
              <div className="pt-4 mt-4 border-t border-slate-100 text-left">
                <p className="text-xs font-medium text-slate-500 mb-2">{t('profile.sectionAccess')}</p>
                <div className="flex flex-wrap gap-1">
                  {profile.assigned_sections.map(section => (
                    <span key={section} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                      {ASSIGNABLE_SECTIONS.find(s => s.key === section)?.name || section}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-400" />
              {t('profile.personalInfo')}
            </h3>
            
            <div className="space-y-4">
              <Input
                label={t('profile.name')}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={language === 'en' ? 'Your name' : 'Vaše ime'}
              />
              
              <div className="relative">
                <Input
                  label={t('profile.email')}
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="vas@email.com"
                />
                <Mail className="absolute right-3 top-9 w-4 h-4 text-slate-400" />
              </div>
              
              <PhoneInput
                label={t('profile.phone')}
                value={formData.phone}
                onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
              />
              
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? t('common.loading') : t('profile.saveChanges')}
              </Button>
            </div>
          </Card>

          {/* Change Password */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-400" />
              {t('profile.changePassword')}
            </h3>
            
            <div className="space-y-4">
              <Input
                label={t('profile.newPassword')}
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder={language === 'en' ? 'Enter new password' : 'Unesite novu lozinku'}
              />
              
              <Input
                label={t('profile.confirmPassword')}
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder={language === 'en' ? 'Repeat new password' : 'Ponovite novu lozinku'}
              />
              
              <Button 
                onClick={handleChangePassword} 
                disabled={isSaving || !formData.newPassword || !formData.confirmPassword}
                variant="secondary"
              >
                <Lock className="w-4 h-4 mr-2" />
                {isSaving ? t('common.loading') : t('profile.changePassword')}
              </Button>
            </div>
          </Card>

          {/* Activity */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              {t('profile.recentActivity')}
            </h3>
            <p className="text-sm text-slate-500">
              {t('profile.viewActivity')} <a href="/dashboard/settings" className="text-blue-600 hover:underline">{t('settings.title')}</a>.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return <ProfileContent />;
}



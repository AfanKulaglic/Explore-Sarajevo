'use client';

import * as React from 'react';
import { PageHeader, Card, Button, Modal, Input } from '@/components/ui';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Shield, 
  ShieldCheck,
  ShieldAlert,
  User,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Globe,
  Package,
  Smartphone,
  Briefcase,
  Calendar,
  Building2,
  MapPin,
  Tag,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { CmsThumbnail } from '@/components/ui/CmsThumbnail';
import { USER_ROLES, ASSIGNABLE_SECTIONS, ACTION_TYPES, getRoleName } from '@/lib/config/entities';
import { useLanguage } from '@/lib/language-context';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  avatar_url: string | null;
  assigned_sections: string[];
  last_login: string | null;
  created_at: string;
}

interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  changes: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
  };
}

const roleIcons: Record<string, React.ElementType> = {
  owner: ShieldAlert,
  admin: ShieldCheck,
  moderator: Shield,
  employee: User,
};

const roleColors: Record<string, string> = {
  owner: 'bg-red-100 text-red-700',
  admin: 'bg-purple-100 text-purple-700',
  moderator: 'bg-blue-100 text-blue-700',
  employee: 'bg-slate-100 text-slate-700',
};

const sectionIcons: Record<string, React.ElementType> = {
  crm: Briefcase,
  explore: Globe,
  pametno: Package,
  hotspot: Smartphone,
};

const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  login: 'bg-slate-100 text-slate-700',
  logout: 'bg-slate-100 text-slate-700',
  upload: 'bg-purple-100 text-purple-700',
  reorder: 'bg-orange-100 text-orange-700',
};

const entityIcons: Record<string, React.ElementType> = {
  business: Building2,
  attraction: MapPin,
  event: Calendar,
  product: Package,
  category: Layers,
  brand: Tag,
  client: Briefcase,
  user: Users,
};

function SettingsContent() {
  const { t, language } = useLanguage();
  const [users, setUsers] = React.useState<User[]>([]);
  const [activityLogs, setActivityLogs] = React.useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'users' | 'activity'>('users');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [formData, setFormData] = React.useState({
    email: '',
    name: '',
    password: '',
    role: 'employee',
    phone: '',
    assigned_sections: [] as string[],
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/cms/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const res = await fetch('/api/cms/activity-logs?limit=100');
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setActivityLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchUsers(), fetchActivityLogs()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      name: '',
      password: '',
      role: 'employee',
      phone: '',
      assigned_sections: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name || '',
      password: '',
      role: user.role,
      phone: user.phone || '',
      assigned_sections: user.assigned_sections || [],
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        const updateData: Record<string, unknown> = {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          phone: formData.phone || null,
          assigned_sections: formData.assigned_sections,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        const res = await fetch(`/api/cms/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
        if (!res.ok) throw new Error('Failed to update user');
      } else {
        const res = await fetch('/api/cms/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const error = await res.json();
          alert(error.error || t('messages.errorOccurred'));
          return;
        }
      }
      
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert(t('messages.errorOccurred'));
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm(t('settings.confirmDeleteUser'))) return;
    
    try {
      const res = await fetch(`/api/cms/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || t('messages.errorOccurred'));
        return;
      }
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const toggleUserActive = async (user: User) => {
    try {
      const inactiveRole = 'inactive';
      const activeRole = 'employee';
      const newRole = user.role === inactiveRole ? activeRole : inactiveRole;
      await fetch(`/api/cms/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user:', error);
    }
  };

  const toggleSection = (section: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_sections: prev.assigned_sections.includes(section)
        ? prev.assigned_sections.filter(s => s !== section)
        : [...prev.assigned_sections, section],
    }));
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

  const formatRelativeTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (language === 'en') {
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes} min ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
    } else {
      if (minutes < 1) return 'Upravo sada';
      if (minutes < 60) return `Prije ${minutes} min`;
      if (hours < 24) return `Prije ${hours}h`;
      if (days < 7) return `Prije ${days}d`;
    }
    return formatDate(date);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('settings.title')} description={t('settings.description')} />
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-slate-100 rounded-lg" />
          <div className="h-64 bg-slate-100 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('settings.title')} 
        description={t('settings.description')}
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'users' 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          {t('entities.users')} ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'activity' 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          {t('settings.activityLog')} ({activityLogs.length})
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('settings.manageUsers')}</h2>
            <Button onClick={openCreateModal} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              {t('settings.newUser')}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 font-medium text-slate-500">{t('entities.user')}</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">{t('settings.role')}</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">{t('entities.sections')}</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">{t('common.status')}</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">{t('profile.lastLogin')}</th>
                  <th className="text-right py-3 px-2 font-medium text-slate-500">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const RoleIcon = roleIcons[user.role] || User;
                  return (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                            {user.avatar_url ? (
                              <CmsThumbnail
                                src={user.avatar_url}
                                alt={user.name ? `Avatar: ${user.name}` : `Avatar: ${user.email}`}
                                width={36}
                                height={36}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              user.email.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{user.name || user.email.split('@')[0]}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${roleColors[user.role]}`}>
                          <RoleIcon className="w-3 h-3" />
                          {getRoleName(user.role as keyof typeof USER_ROLES, language)}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex flex-wrap gap-1">
                          {/* Only show individual sections for employees with specific assignments */}
                          {user.role === 'employee' && user.assigned_sections && user.assigned_sections.length > 0 ? (
                            user.assigned_sections.map(section => {
                              const Icon = sectionIcons[section] || Globe;
                              return (
                                <span key={section} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
                                  <Icon className="w-3 h-3" />
                                  {ASSIGNABLE_SECTIONS.find(s => s.key === section)?.name || section}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-xs text-slate-400">{language === 'en' ? 'All sections' : 'Sve sekcije'}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => toggleUserActive(user)}
                          disabled={user.role === 'owner'}
                          className="flex items-center gap-1.5"
                        >
                          {user.role !== 'inactive' ? (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              {t('common.active')}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-red-600">
                              <XCircle className="w-4 h-4" />
                              {t('common.inactive')}
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-2 text-slate-500 text-xs">
                        {user.last_login ? (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatRelativeTime(user.last_login)}
                          </span>
                        ) : (
                          <span className="text-slate-400">{language === 'en' ? 'Never' : 'Nikad'}</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {user.role !== 'owner' && (
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('settings.activityLog')}</h2>
            <button
              onClick={fetchActivityLogs}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {language === 'en' ? 'Refresh' : 'Osvježi'}
            </button>
          </div>

          <div className="space-y-2">
            {activityLogs.length === 0 ? (
              <p className="text-center text-slate-500 py-8">{t('settings.noActivity')}</p>
            ) : (
              activityLogs.map(log => {
                const EntityIcon = entityIcons[log.entity_type] || Activity;
                const actionInfo = ACTION_TYPES[log.action as keyof typeof ACTION_TYPES];
                
                return (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      {log.user?.avatar_url ? (
                        <CmsThumbnail
                          src={log.user.avatar_url}
                          alt={log.user?.name ? `Avatar: ${log.user.name}` : 'Avatar korisnika'}
                          width={32}
                          height={32}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium text-slate-600">
                          {(log.user?.email || log.user_email || '?').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium text-slate-900">
                          {log.user?.name || log.user?.email?.split('@')[0] || log.user_email || (language === 'en' ? 'Unknown' : 'Nepoznato')}
                        </span>
                        {' '}
                        <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded ${actionColors[log.action] || 'bg-slate-100 text-slate-700'}`}>
                          {actionInfo?.name || log.action}
                        </span>
                        {' '}
                        <span className="text-slate-600">
                          {log.entity_name || log.entity_type}
                        </span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <EntityIcon className="w-3 h-3" />
                          {log.entity_type}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">
                          {formatRelativeTime(log.created_at)}
                        </span>
                      </div>
                    </div>
                    {log.entity_id && (
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      {/* User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? t('settings.editUser') : t('settings.newUser')}
      >
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
          
          <Input
            label={t('profile.name')}
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
          
          <Input
            label={editingUser 
              ? (language === 'en' ? 'New Password (leave empty for no change)' : 'Nova lozinka (ostavite prazno za bez promjene)') 
              : t('profile.password')}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            required={!editingUser}
          />
          
          <PhoneInput
            label={t('profile.phone')}
            value={formData.phone}
            onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
          />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('settings.role')}</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(USER_ROLES).map(([key, role]) => {
                const Icon = roleIcons[key];
                const isDisabled = key === 'owner' && !editingUser?.role?.includes('owner');
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setFormData(prev => ({ ...prev, role: key }))}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                      formData.role === key 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Icon className={`w-5 h-5 ${formData.role === key ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-sm font-medium">{role.name[language]}</p>
                      <p className="text-xs text-slate-500">{role.description[language]}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {formData.role === 'employee' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('settings.assignedSections')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ASSIGNABLE_SECTIONS.map(section => {
                  const Icon = sectionIcons[section.key];
                  const isSelected = formData.assigned_sections.includes(section.key);
                  return (
                    <button
                      key={section.key}
                      type="button"
                      onClick={() => toggleSection(section.key)}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="text-sm font-medium">{section.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave}>
              {editingUser ? t('common.save') : t('settings.createUser')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function SettingsPage() {
  return <SettingsContent />;
}



'use client';

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Palette, 
  Globe, 
  Key, 
  Moon,
  Mail,
  ChevronRight,
  ArrowLeft,
  Eye,
  Activity,
  Users,
  Shield,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import EditProfileModal from "@/components/account/EditProfileModal";

interface SettingItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  href?: string;
  action?: React.ReactNode;
  onClick?: () => void;
}

const SettingItem = ({ icon: Icon, title, description, color, href, action, onClick }: SettingItemProps) => {
  const content = (
    <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:border-white/10 hover:bg-white/10">
      <span className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br",
        color
      )}>
        <Icon size={20} className="text-white" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white">{title}</p>
        <p className="text-sm text-white/50">{description}</p>
      </div>
      {action || <ChevronRight size={18} className="text-white/30" />}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  if (onClick) {
    return <div className="cursor-pointer" onClick={onClick}>{content}</div>;
  }

  return <div className="cursor-pointer">{content}</div>;
};

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch = ({ enabled, onChange, disabled = false }: ToggleSwitchProps) => (
  <button 
    onClick={() => !disabled && onChange(!enabled)}
    disabled={disabled}
    className={cn(
      "relative h-7 w-12 rounded-full transition",
      enabled ? "bg-brand-500" : "bg-white/20",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    <span className={cn(
      "absolute top-1 h-5 w-5 rounded-full bg-white transition-all",
      enabled ? "left-6" : "left-1"
    )} />
  </button>
);

interface SelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

const SelectDropdown = ({ value, onChange, options, disabled = false }: SelectDropdownProps) => (
  <select 
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className={cn(
      "rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    {options.map(opt => (
      <option key={opt.value} value={opt.value} className="bg-slate-900">
        {opt.label}
      </option>
    ))}
  </select>
);

interface UserSettings {
  profile_visibility: 'everyone' | 'friends' | 'private';
  activity_status: boolean;
  show_on_leaderboard: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  profile_visibility: 'everyone',
  activity_status: true,
  show_on_leaderboard: true,
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from API
  useEffect(() => {
    async function loadSettings() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/settings?account_id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setSettings({
              profile_visibility: data.data.profile_visibility || 'everyone',
              activity_status: data.data.activity_status ?? true,
              show_on_leaderboard: data.data.show_on_leaderboard ?? true,
            });
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [user?.id]);

  // Save settings to API
  const saveSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: user.id,
          ...newSettings
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      // Update local state
      setSettings(prev => ({ ...prev, ...newSettings }));
    } catch (error) {
      console.error('Error saving settings:', error);
      // Could show a toast notification here
    } finally {
      setIsSaving(false);
    }
  }, [user?.id]);

  // Handlers for each setting
  const handleProfileVisibilityChange = (value: string) => {
    saveSettings({ profile_visibility: value as UserSettings['profile_visibility'] });
  };

  const handleActivityStatusChange = (enabled: boolean) => {
    saveSettings({ activity_status: enabled });
  };

  const handleShowOnLeaderboardChange = (enabled: boolean) => {
    saveSettings({ show_on_leaderboard: enabled });
  };

  // Build profile object for EditProfileModal
  const profile = {
    name: user?.name || 'Guest',
    handle: user ? `@${user.name.toLowerCase().replace(/\s+/g, '')}` : '@guest',
    email: user?.email || '',
    avatarUrl: user?.avatarUrl || '/default-avatar.svg',
    notifications: 0,
    tier: 'BRONZE' as const,
    tierProgress: 0,
    tierNextThreshold: 50000,
    xpProgress: { currentXP: 0, xpToNextLevel: 1000, level: 1 },
    joinedAt: new Date().toISOString(),
    stats: {
      totalEarned: 0,
      totalRedeemed: 0,
      ordersCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      rank: 0,
      percentile: 0,
    },
    achievements: [],
    recentTransactions: [],
  };

  const visibilityOptions = [
    { value: 'everyone', label: 'Everyone' },
    { value: 'friends', label: 'Friends Only' },
    { value: 'private', label: 'Private' },
  ];

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link 
          href="/account"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:border-brand-500/40 hover:bg-brand-500/10"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-white/50">Manage your account preferences</p>
        </div>
        {(isLoading || isSaving) && (
          <Loader2 size={20} className="animate-spin text-white/50" />
        )}
      </motion.div>

      {/* Account Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl border border-white/5 bg-slate-950/40 p-6 backdrop-blur-2xl"
      >
        <h3 className="mb-4 text-lg font-semibold text-white">Account</h3>
        <div className="space-y-3">
          <SettingItem
            icon={User}
            title="Edit Profile"
            description="Update your name, avatar, and bio"
            color="from-brand-500 to-brand-600"
            onClick={() => setIsEditModalOpen(true)}
          />
          <SettingItem
            icon={Mail}
            title="Email Address"
            description={user?.email || "eldar.dzuho@saraya.com"}
            color="from-blue-500 to-blue-600"
          />
          <SettingItem
            icon={Key}
            title="Change Password"
            description="Update your password regularly"
            color="from-amber-500 to-amber-600"
          />
        </div>
      </motion.div>

      {/* Privacy & Visibility */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl border border-white/5 bg-slate-950/40 p-6 backdrop-blur-2xl"
      >
        <h3 className="mb-4 text-lg font-semibold text-white">Privacy & Visibility</h3>
        <div className="space-y-3">
          <SettingItem
            icon={Eye}
            title="Profile Visibility"
            description="Who can see your profile"
            color="from-brand-500 to-brand-600"
            action={
              <SelectDropdown 
                value={settings.profile_visibility}
                onChange={handleProfileVisibilityChange}
                options={visibilityOptions}
                disabled={isLoading || isSaving}
              />
            }
          />
          <SettingItem
            icon={Activity}
            title="Activity Status"
            description="Show when you're online"
            color="from-emerald-500 to-emerald-600"
            action={
              <ToggleSwitch 
                enabled={settings.activity_status}
                onChange={handleActivityStatusChange}
                disabled={isLoading || isSaving}
              />
            }
          />
          <SettingItem
            icon={Users}
            title="Show on Leaderboard"
            description="Display your rank publicly"
            color="from-amber-500 to-amber-600"
            action={
              <ToggleSwitch 
                enabled={settings.show_on_leaderboard}
                onChange={handleShowOnLeaderboardChange}
                disabled={isLoading || isSaving}
              />
            }
          />
        </div>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-3xl border border-white/5 bg-slate-950/40 p-6 backdrop-blur-2xl"
      >
        <h3 className="mb-4 text-lg font-semibold text-white">Security</h3>
        <div className="space-y-3">
          <SettingItem
            icon={Shield}
            title="Active Sessions"
            description="2 devices currently logged in"
            color="from-teal-500 to-teal-600"
          />
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-3xl border border-white/5 bg-slate-950/40 p-6 backdrop-blur-2xl"
      >
        <h3 className="mb-4 text-lg font-semibold text-white">Appearance</h3>
        <div className="space-y-3">
          <SettingItem
            icon={Moon}
            title="Dark Mode"
            description="Always use dark theme"
            color="from-slate-500 to-slate-600"
          />
          <SettingItem
            icon={Palette}
            title="Accent Color"
            description="Customize your interface color"
            color="from-pink-500 to-pink-600"
            action={
              <div className="flex gap-2">
                <span className="h-6 w-6 rounded-full bg-brand-500 ring-2 ring-white ring-offset-2 ring-offset-slate-900" />
                <span className="h-6 w-6 rounded-full bg-emerald-500" />
                <span className="h-6 w-6 rounded-full bg-rose-500" />
              </div>
            }
          />
          <SettingItem
            icon={Globe}
            title="Language"
            description="English (US)"
            color="from-teal-500 to-teal-600"
          />
        </div>
      </motion.div>

      {/* Blocked & Restricted */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-3xl border border-white/5 bg-slate-950/40 p-6 backdrop-blur-2xl"
      >
        <h3 className="mb-4 text-lg font-semibold text-white">Blocked & Restricted</h3>
        <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4">
          <div>
            <p className="font-medium text-white">Blocked Users</p>
            <p className="text-sm text-white/50">0 users blocked</p>
          </div>
          <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
            Manage
          </button>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6"
      >
        <h3 className="mb-4 text-lg font-semibold text-rose-400">Danger Zone</h3>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-400 transition hover:bg-rose-500/20">
            Deactivate Account
          </button>
          <button className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-400 transition hover:bg-rose-500/20">
            Delete All Data
          </button>
        </div>
      </motion.div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
      />
    </section>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, User, AtSign, Mail, Save, Loader2 } from 'lucide-react';
import { AccountProfile } from '@/lib/types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AccountProfile;
  onSave?: (updatedProfile: AccountProfile) => void;
}

const avatarOptions = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
];

export default function EditProfileModal({ isOpen, onClose, profile, onSave }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: profile.name,
    handle: profile.handle,
    email: profile.email,
    avatarUrl: profile.avatarUrl,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarSelect = (url: string) => {
    setFormData(prev => ({ ...prev, avatarUrl: url }));
    setShowAvatarPicker(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (onSave) {
      onSave({
        ...profile,
        ...formData,
      });
    }
    
    setIsSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-slate-900/95 backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-900/95 backdrop-blur-xl px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-base sm:text-lg font-semibold text-white">Edit Profile</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {/* Avatar Section */}
              <div className="mb-4 sm:mb-6 flex flex-col items-center">
                <div className="relative">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-2 border-brand-500/50 bg-slate-800">
                    <img
                      src={formData.avatarUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 border-slate-900 bg-brand-500 text-white transition hover:bg-brand-600"
                  >
                    <Camera size={12} className="sm:hidden" />
                    <Camera size={14} className="hidden sm:block" />
                  </button>
                </div>

                {/* Avatar Picker */}
                <AnimatePresence>
                  {showAvatarPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 sm:mt-4 overflow-hidden w-full"
                    >
                      <p className="mb-2 sm:mb-3 text-center text-xs sm:text-sm text-white/60">Choose an avatar</p>
                      <div className="grid grid-cols-4 gap-2 sm:gap-2 justify-items-center">
                        {avatarOptions.map((url, index) => (
                          <button
                            key={index}
                            onClick={() => handleAvatarSelect(url)}
                            className={`h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-full border-2 transition ${
                              formData.avatarUrl === url
                                ? 'border-brand-500 ring-2 ring-brand-500/30'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            <img
                              src={url}
                              alt={`Avatar option ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Form Fields */}
              <div className="space-y-3 sm:space-y-4">
                {/* Name */}
                <div>
                  <label className="mb-1.5 sm:mb-2 flex items-center gap-2 text-xs sm:text-sm font-medium text-white/70">
                    <User size={12} className="sm:hidden" />
                    <User size={14} className="hidden sm:block" />
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-white/30 outline-none transition focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                    placeholder="Your display name"
                  />
                </div>

                {/* Handle */}
                <div>
                  <label className="mb-1.5 sm:mb-2 flex items-center gap-2 text-xs sm:text-sm font-medium text-white/70">
                    <AtSign size={12} className="sm:hidden" />
                    <AtSign size={14} className="hidden sm:block" />
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.handle}
                    onChange={(e) => handleInputChange('handle', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-white/30 outline-none transition focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                    placeholder="@username"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 sm:mb-2 flex items-center gap-2 text-xs sm:text-sm font-medium text-white/70">
                    <Mail size={12} className="sm:hidden" />
                    <Mail size={14} className="hidden sm:block" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-white/30 outline-none transition focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:from-brand-600 hover:to-brand-700 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin sm:hidden" />
                      <Loader2 size={16} className="animate-spin hidden sm:block" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} className="sm:hidden" />
                      <Save size={16} className="hidden sm:block" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

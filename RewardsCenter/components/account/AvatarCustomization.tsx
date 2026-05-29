'use client';

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Palette, Pencil } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/common/Avatar";
import { useTranslation } from "@/lib/i18n";

export function AvatarCustomization() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-950/40 p-4 sm:p-6 backdrop-blur-2xl"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600">
          <Palette size={14} className="text-white sm:hidden" />
          <Palette size={18} className="text-white hidden sm:block" />
        </span>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white">{t.account.avatarCustomization}</h3>
          <p className="text-[10px] sm:text-xs text-white/50">{t.account.personalizeAppearance}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar Preview */}
        <div className="relative">
          <div className="relative">
            <Avatar 
              src={user?.avatarUrl}
              name={user?.name}
              size="2xl"
              className="border-4 border-white/10"
            />
            <button
              onClick={() => router.push('/auth/avatar')}
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-brand-600 border-4 border-slate-900 flex items-center justify-center hover:bg-brand-500 transition-colors shadow-lg"
            >
              <Pencil size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Info and Edit Button */}
        <div className="flex-1 text-center sm:text-left">
          <h4 className="text-white font-medium mb-1">{t.account.yourAvatar}</h4>
          <p className="text-white/50 text-sm mb-4">
            {t.account.avatarDescription}
          </p>
          <button
            onClick={() => router.push('/auth/avatar')}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-brand-500 hover:to-brand-400"
          >
            <Pencil size={16} />
            {t.account.editAvatar}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

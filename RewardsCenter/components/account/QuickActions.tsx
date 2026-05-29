'use client';

import { motion } from "framer-motion";
import { Gift, Users, HelpCircle, Download, Bell, CreditCard } from "lucide-react";

const actions = [
  { icon: Gift, label: "Redeem Rewards", color: "from-brand-500 to-brand-600", href: "/rewards/catalog" },
  { icon: Users, label: "Refer Friends", color: "from-violet-500 to-violet-600", href: "#" },
  { icon: CreditCard, label: "Link Payment", color: "from-emerald-500 to-emerald-600", href: "#" },
  { icon: Bell, label: "Notifications", color: "from-amber-500 to-amber-600", href: "#" },
  { icon: Download, label: "Download Data", color: "from-blue-500 to-blue-600", href: "#" },
  { icon: HelpCircle, label: "Get Help", color: "from-rose-500 to-rose-600", href: "#" },
];

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-950/40 p-4 sm:p-6 backdrop-blur-2xl"
    >
      <h3 className="mb-4 sm:mb-5 text-base sm:text-lg font-semibold text-white">Quick Actions</h3>
      
      <div className="grid grid-cols-3 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {actions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <motion.a
              key={action.label}
              href={action.href}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * index }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-white/5 bg-white/5 p-2.5 sm:p-4 text-center transition hover:border-white/20 hover:bg-white/10"
            >
              <span className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${action.color}`}>
                <Icon size={16} className="text-white sm:hidden" />
                <Icon size={20} className="text-white hidden sm:block" />
              </span>
              <span className="text-[10px] sm:text-sm font-medium text-white/80 leading-tight">{action.label}</span>
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BalanceBadgeProps {
  label: string;
  value: string;
  icon: ReactNode;
  accent?: string;
}

export function BalanceBadge({ label, value, icon, accent = "from-brand-500 to-brand-600" }: BalanceBadgeProps) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full text-white shadow-glow",
          "bg-gradient-to-br",
          accent
        )}
      >
        {icon}
      </span>
      <div className="text-sm">
        <p className="text-white/60">{label}</p>
        <p className="font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

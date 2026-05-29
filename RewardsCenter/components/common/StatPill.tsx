import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatPillProps {
  label: string;
  value: string;
  icon?: ReactNode;
  tone?: string;
}

export function StatPill({ label, value, icon, tone = "bg-white/5 border-white/10" }: StatPillProps) {
  return (
    <div className={cn("flex flex-col gap-1 rounded-2xl border px-4 py-3", tone)}>
      <span className="text-xs uppercase tracking-wide text-white/60">{label}</span>
      <div className="flex items-center gap-2 text-lg font-semibold text-white">
        {icon}
        {value}
      </div>
    </div>
  );
}

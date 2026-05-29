import { PenLine, Trash2 } from "lucide-react";
import { mockRewards } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const columns = ["Reward", "Type", "Category", "Price", "Stock", "Actions"];

export default function ManagePage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">Admin</p>
          <h1 className="text-2xl font-semibold text-white">Manage Rewards</h1>
        </div>
        <button className="rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-500">
          + Add Reward
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/5">
        <table className="w-full min-w-[640px] text-left text-sm text-white/80">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/60">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-6 py-4">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockRewards.map((reward) => (
              <tr key={reward.id} className="border-t border-white/5">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-white">{reward.title}</p>
                    <p className="text-xs text-white/60">{reward.subtitle}</p>
                  </div>
                </td>
                <td className="px-6 py-4">{reward.type}</td>
                <td className="px-6 py-4 capitalize">{reward.category}</td>
                <td className="px-6 py-4 font-semibold text-white">
                  {formatCurrency(reward.price, reward.currency)}
                </td>
                <td className="px-6 py-4 text-white/70">
                  {reward.stock ?? (reward.requiresApproval ? "Approval" : "—")}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs text-white/80 transition hover:border-brand-500/60 hover:bg-brand-500/10">
                      <PenLine size={14} /> Edit
                    </button>
                    <button className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 px-3 py-1 text-xs text-rose-200 transition hover:bg-rose-500/10">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, ChevronDown, ChevronUp, History, Loader2, LogOut, RefreshCcw, Shield, Wallet, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLATFORM_CATALOG } from "@/lib/platforms";
import { supabase } from "@/lib/supabaseClient";

type AccountRecord = {
  id: string;
  email: string;
  name?: string | null;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  createdAt: string;
  coin_wallets?: { coins_balance: number; tokens_balance: number } | null;
  xp_profiles?: { xp_total: number; xp_current_level: number; xp_next_level: number; level: number } | null;
};

type ActivityRecord = {
  id: string;
  summary: string;
  createdAt: string;
  platform?: { code: string } | null;
  account?: { email: string } | null;
};

const statusPills: Record<AccountRecord["status"], string> = {
  ACTIVE: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  SUSPENDED: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  DELETED: "text-rose-300 bg-rose-500/10 border-rose-500/30",
};

export default function AdminConsole() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [metrics, setMetrics] = useState({ accounts: 0, suspended: 0, coinsTreasury: 0, tokensTreasury: 0 });
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({
    email: "",
    name: "",
    password: "",
    initialBalance: 0,
    platformCodes: [] as string[],
  });
  const [message, setMessage] = useState<string | null>(null);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [adminEmail, setAdminEmail] = useState<string>("eldardzuho2000@gmail.com");
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "suspend" | "delete";
    accountId: string;
    accountEmail: string;
  } | null>(null);
  const [confirmInput, setConfirmInput] = useState("");
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    accountId: string;
    name: string;
    email: string;
    password: string;
  } | null>(null);
  const [activityDialog, setActivityDialog] = useState<{
    isOpen: boolean;
    accountId: string;
    accountName: string;
    accountEmail: string;
    activities: Array<{
      id: string;
      event_type: string;
      coins_delta: number;
      tokens_delta: number;
      xp_delta: number;
      created_at: string;
      platform?: { code: string; name: string } | null;
      metadata?: any;
    }>;
    loading: boolean;
  } | null>(null);

  // Disable body scroll when activity dialog is open
  useEffect(() => {
    if (activityDialog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activityDialog]);

  // Auto-dismiss message after 10 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const getAdminEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setAdminEmail(session.user.email);
      }
    };
    getAdminEmail();
  }, []);

  const toggleAccount = (accountId: string) => {
    setExpandedAccounts((prev) => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getAdminHeaders = () => new Headers({ "x-admin-email": adminEmail });

  const fetchAccounts = async () => {
    const res = await fetch("/api/accounts", { headers: getAdminHeaders(), cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load accounts");
    const data = await res.json();
    setAccounts(data.data ?? []);
  };

  const fetchAdminSnapshot = async () => {
    const res = await fetch("/api/admin", { headers: getAdminHeaders(), cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load admin metrics");
    const payload = await res.json();
    setMetrics(payload.data?.totals ?? metrics);
    setActivities(payload.data?.recentActivities ?? []);
  };

  const bootstrap = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchAccounts(), fetchAdminSnapshot()]);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load data. Ensure admin headers are configured.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const response = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...Object.fromEntries(getAdminHeaders().entries()) },
      body: JSON.stringify({
        email: formState.email,
        name: formState.name,
        password: formState.password,
        initialBalance: formState.initialBalance,
      }),
    });

    if (!response.ok) {
      const payload = await response.json();
      setMessage(payload.error ?? "Failed to create account");
      return;
    }

    setFormState({ email: "", name: "", password: "", initialBalance: 0, platformCodes: [] });
    setMessage("Account created");
    await bootstrap();
  };

  const handleStatusChange = async (accountId: string, nextStatus: AccountRecord["status"]) => {
    await fetch(`/api/accounts/${accountId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...Object.fromEntries(getAdminHeaders().entries()) },
      body: JSON.stringify({ status: nextStatus }),
    });
    await bootstrap();
  };

  const handleConfirmedSuspend = async () => {
    if (!confirmDialog) return;
    try {
      await handleStatusChange(confirmDialog.accountId, "SUSPENDED");
      setMessage("Account suspended");
      setConfirmDialog(null);
      setConfirmInput("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to suspend account");
    }
  };

  const handleConfirmedDelete = async () => {
    if (!confirmDialog) return;
    try {
      const res = await fetch(`/api/accounts/${confirmDialog.accountId}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });
      if (!res.ok) throw new Error("Delete failed");
      await bootstrap();
      setMessage("Account permanently deleted");
      setConfirmDialog(null);
      setConfirmInput("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete account");
    }
  };

  const handleBalanceChange = async (accountId: string, delta: number) => {
    await fetch(`/api/accounts/${accountId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...Object.fromEntries(getAdminHeaders().entries()) },
      body: JSON.stringify({ balanceDelta: delta }),
    });
    await bootstrap();
  };

  const handleXpChange = async (accountId: string, delta: number) => {
    await fetch(`/api/accounts/${accountId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...Object.fromEntries(getAdminHeaders().entries()) },
      body: JSON.stringify({ xpDelta: delta }),
    });
    await bootstrap();
  };

  const handleTokenChange = async (accountId: string, delta: number) => {
    await fetch(`/api/accounts/${accountId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...Object.fromEntries(getAdminHeaders().entries()) },
      body: JSON.stringify({ tokensDelta: delta }),
    });
    await bootstrap();
  };

  const handleEditUser = async () => {
    if (!editDialog) return;
    try {
      const updateData: any = {};
      if (editDialog.name) updateData.name = editDialog.name;
      if (editDialog.email) updateData.email = editDialog.email;
      if (editDialog.password) updateData.password = editDialog.password;

      const res = await fetch(`/api/accounts/${editDialog.accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...Object.fromEntries(getAdminHeaders().entries()) },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) throw new Error("Update failed");
      
      await bootstrap();
      setMessage("Account updated successfully");
      setEditDialog(null);
    } catch (err) {
      console.error(err);
      setMessage("Failed to update account");
    }
  };

  const fetchAccountActivities = async (accountId: string, accountName: string, accountEmail: string) => {
    setActivityDialog({
      isOpen: true,
      accountId,
      accountName,
      accountEmail,
      activities: [],
      loading: true,
    });

    try {
      const res = await fetch(`/api/accounts/${accountId}/activities`, {
        headers: getAdminHeaders(),
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to fetch activities");

      const data = await res.json();
      setActivityDialog((prev) =>
        prev ? { ...prev, activities: data.data ?? [], loading: false } : null
      );
    } catch (err) {
      console.error(err);
      setActivityDialog((prev) =>
        prev ? { ...prev, loading: false } : null
      );
      setMessage("Failed to load activities");
    }
  };

  const overviewCards = useMemo(
    () => [
      {
        label: "Accounts",
        value: metrics.accounts,
        icon: BadgeCheck,
        accent: "from-emerald-500/40 to-emerald-500/10",
      },
      {
        label: "Suspended",
        value: metrics.suspended,
        icon: Shield,
        accent: "from-amber-500/40 to-amber-500/10",
      },
      {
        label: "Coins Treasury",
        value: metrics.coinsTreasury.toLocaleString(),
        icon: Wallet,
        accent: "from-sky-500/40 to-sky-500/10",
      },
      {
        label: "Token Treasury",
        value: metrics.tokensTreasury.toLocaleString(),
        icon: Wallet,
        accent: "from-violet-500/40 to-violet-500/10",
      },
    ],
    [metrics],
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">Control Panel</p>
          <h1 className="text-4xl font-semibold text-white">Saraya Admin</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={bootstrap}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:border-white"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-300 hover:border-rose-500"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-4">
        {overviewCards.map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "rounded-3xl border border-white/10 bg-white/5 p-5 shadow-card backdrop-blur",
              "bg-gradient-to-br",
              card.accent,
            )}
          >
            <card.icon className="h-6 w-6 text-white/80" />
            <p className="mt-4 text-sm text-white/70">{card.label}</p>
            <p className="text-3xl font-semibold text-white">{card.value}</p>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-card backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Accounts</h2>
              {loading && <Loader2 className="h-4 w-4 animate-spin text-white/60" />}
            </div>
            <div className="mt-6 divide-y divide-white/5">
              {accounts.map((account) => {
                const isExpanded = expandedAccounts.has(account.id);
                return (
                  <div key={account.id} className="py-3 first:pt-0 last:pb-0">
                    <button
                      onClick={() => toggleAccount(account.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium">{account.name ?? "Unnamed"}</p>
                          <p className="text-sm text-white/60">{account.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn("rounded-full border px-3 py-1 text-xs", statusPills[account.status])}>
                            {account.status}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-white/60" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-white/60" />
                          )}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 space-y-4"
                      >
                        {/* Stats Display */}
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                            <span className="text-xs font-medium text-amber-300">💰 Coins</span>
                            <span className="text-sm font-bold text-white">{account.coin_wallets?.coins_balance ?? 0}</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2">
                            <span className="text-xs font-medium text-violet-300">💎 Tokens</span>
                            <span className="text-sm font-bold text-white">{account.coin_wallets?.tokens_balance ?? 0}</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2">
                            <span className="text-xs font-medium text-cyan-300">⚡ XP</span>
                            <span className="text-sm font-bold text-white">{account.xp_profiles?.xp_total ?? 0}</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 py-2">
                            <span className="text-xs font-medium text-purple-300">🎯 Level</span>
                            <span className="text-sm font-bold text-white">{account.xp_profiles?.level ?? 1}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <button 
                            onClick={() => setEditDialog({
                              isOpen: true,
                              accountId: account.id,
                              name: account.name || "",
                              email: account.email,
                              password: ""
                            })}
                            className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-300 transition-colors hover:border-blue-500/50 hover:bg-blue-500/20"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => fetchAccountActivities(account.id, account.name || "Unnamed", account.email)}
                            className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-300 transition-colors hover:border-cyan-500/50 hover:bg-cyan-500/20"
                          >
                            📊 Activity
                          </button>
                          {account.status !== "ACTIVE" && (
                            <button 
                              onClick={() => handleStatusChange(account.id, "ACTIVE")} 
                              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-300 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/20"
                            >
                              ✓ Mark Active
                            </button>
                          )}
                          {account.status !== "SUSPENDED" && (
                            <button 
                              onClick={() => setConfirmDialog({ isOpen: true, action: "suspend", accountId: account.id, accountEmail: account.email })}
                              className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-medium text-orange-300 transition-colors hover:border-orange-500/50 hover:bg-orange-500/20"
                            >
                              ⏸ Suspend
                            </button>
                          )}
                          <button 
                            onClick={() => setConfirmDialog({ isOpen: true, action: "delete", accountId: account.id, accountEmail: account.email })}
                            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-medium text-rose-300 transition-colors hover:border-rose-500/50 hover:bg-rose-500/20"
                          >
                            🗑 Delete
                          </button>
                        </div>
                        <div className="space-y-2">
                          {/* Coins Row */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2">
                              <label className="mb-1 block text-[10px] uppercase tracking-wider text-emerald-300/70">Add Coins</label>
                              <div className="flex items-center gap-1">
                                <input
                                  id={`add-coins-${account.id}`}
                                  type="number"
                                  placeholder="Amount"
                                  min="0"
                                  className="w-full rounded border border-emerald-500/30 bg-black/30 px-2 py-1 text-xs text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const value = Number(e.currentTarget.value);
                                      if (value > 0) {
                                        handleBalanceChange(account.id, value);
                                        e.currentTarget.value = '';
                                      }
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`add-coins-${account.id}`) as HTMLInputElement;
                                    const value = Number(input.value);
                                    if (value > 0) {
                                      handleBalanceChange(account.id, value);
                                      input.value = '';
                                    }
                                  }}
                                  className="rounded bg-emerald-500/20 px-2 py-1 text-[10px] text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                                >
                                  ✓
                                </button>
                              </div>
                            </div>
                            <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-2">
                              <label className="mb-1 block text-[10px] uppercase tracking-wider text-rose-300/70">Subtract Coins</label>
                              <div className="flex items-center gap-1">
                                <input
                                  id={`sub-coins-${account.id}`}
                                  type="number"
                                  placeholder="Amount"
                                  min="0"
                                  className="w-full rounded border border-rose-500/30 bg-black/30 px-2 py-1 text-xs text-white placeholder:text-white/30 focus:border-rose-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const value = Number(e.currentTarget.value);
                                      if (value > 0) {
                                        handleBalanceChange(account.id, -value);
                                        e.currentTarget.value = '';
                                      }
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`sub-coins-${account.id}`) as HTMLInputElement;
                                    const value = Number(input.value);
                                    if (value > 0) {
                                      handleBalanceChange(account.id, -value);
                                      input.value = '';
                                    }
                                  }}
                                  className="rounded bg-rose-500/20 px-2 py-1 text-[10px] text-rose-300 hover:bg-rose-500/30 transition-colors"
                                >
                                  ✓
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Tokens Row */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-2">
                              <label className="mb-1 block text-[10px] uppercase tracking-wider text-violet-300/70">Add Tokens</label>
                              <div className="flex items-center gap-1">
                                <input
                                  id={`add-tokens-${account.id}`}
                                  type="number"
                                  placeholder="Amount"
                                  min="0"
                                  className="w-full rounded border border-violet-500/30 bg-black/30 px-2 py-1 text-xs text-white placeholder:text-white/30 focus:border-violet-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const value = Number(e.currentTarget.value);
                                      if (value > 0) {
                                        handleTokenChange(account.id, value);
                                        e.currentTarget.value = '';
                                      }
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`add-tokens-${account.id}`) as HTMLInputElement;
                                    const value = Number(input.value);
                                    if (value > 0) {
                                      handleTokenChange(account.id, value);
                                      input.value = '';
                                    }
                                  }}
                                  className="rounded bg-violet-500/20 px-2 py-1 text-[10px] text-violet-300 hover:bg-violet-500/30 transition-colors"
                                >
                                  ✓
                                </button>
                              </div>
                            </div>
                            <div className="rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/5 p-2">
                              <label className="mb-1 block text-[10px] uppercase tracking-wider text-fuchsia-300/70">Subtract Tokens</label>
                              <div className="flex items-center gap-1">
                                <input
                                  id={`sub-tokens-${account.id}`}
                                  type="number"
                                  placeholder="Amount"
                                  min="0"
                                  className="w-full rounded border border-fuchsia-500/30 bg-black/30 px-2 py-1 text-xs text-white placeholder:text-white/30 focus:border-fuchsia-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const value = Number(e.currentTarget.value);
                                      if (value > 0) {
                                        handleTokenChange(account.id, -value);
                                        e.currentTarget.value = '';
                                      }
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`sub-tokens-${account.id}`) as HTMLInputElement;
                                    const value = Number(input.value);
                                    if (value > 0) {
                                      handleTokenChange(account.id, -value);
                                      input.value = '';
                                    }
                                  }}
                                  className="rounded bg-fuchsia-500/20 px-2 py-1 text-[10px] text-fuchsia-300 hover:bg-fuchsia-500/30 transition-colors"
                                >
                                  ✓
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* XP Row */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-2">
                              <label className="mb-1 block text-[10px] uppercase tracking-wider text-sky-300/70">Add XP</label>
                              <div className="flex items-center gap-1">
                                <input
                                  id={`add-xp-${account.id}`}
                                  type="number"
                                  placeholder="Amount"
                                  min="0"
                                  className="w-full rounded border border-sky-500/30 bg-black/30 px-2 py-1 text-xs text-white placeholder:text-white/30 focus:border-sky-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const value = Number(e.currentTarget.value);
                                      if (value > 0) {
                                        handleXpChange(account.id, value);
                                        e.currentTarget.value = '';
                                      }
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`add-xp-${account.id}`) as HTMLInputElement;
                                    const value = Number(input.value);
                                    if (value > 0) {
                                      handleXpChange(account.id, value);
                                      input.value = '';
                                    }
                                  }}
                                  className="rounded bg-sky-500/20 px-2 py-1 text-[10px] text-sky-300 hover:bg-sky-500/30 transition-colors"
                                >
                                  ✓
                                </button>
                              </div>
                            </div>
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2">
                              <label className="mb-1 block text-[10px] uppercase tracking-wider text-amber-300/70">Subtract XP</label>
                              <div className="flex items-center gap-1">
                                <input
                                  id={`sub-xp-${account.id}`}
                                  type="number"
                                  placeholder="Amount"
                                  min="0"
                                  className="w-full rounded border border-amber-500/30 bg-black/30 px-2 py-1 text-xs text-white placeholder:text-white/30 focus:border-amber-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const value = Number(e.currentTarget.value);
                                      if (value > 0) {
                                        handleXpChange(account.id, -value);
                                        e.currentTarget.value = '';
                                      }
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`sub-xp-${account.id}`) as HTMLInputElement;
                                    const value = Number(input.value);
                                    if (value > 0) {
                                      handleXpChange(account.id, -value);
                                      input.value = '';
                                    }
                                  }}
                                  className="rounded bg-amber-500/20 px-2 py-1 text-[10px] text-amber-300 hover:bg-amber-500/30 transition-colors"
                                >
                                  ✓
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
              {!accounts.length && !loading && <p className="py-10 text-center text-sm text-white/50">No accounts yet.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur"
          >
            <h2 className="text-xl font-semibold">Create Account</h2>
            <div className="mt-4 grid gap-4">
              <input
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm focus:border-brand.primary focus:outline-none"
                placeholder="Display name"
                value={formState.name}
                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
              />
              <input
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm focus:border-brand.primary focus:outline-none"
                placeholder="Email"
                type="email"
                value={formState.email}
                onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
              <input
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm focus:border-brand.primary focus:outline-none"
                placeholder="Password"
                type="password"
                value={formState.password}
                onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
              <label className="text-xs uppercase tracking-[0.3em] text-white/50">Initial Balance</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm focus:border-brand.primary focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Initial Balance"
                  value={formState.initialBalance || ""}
                  onChange={(e) => setFormState((prev) => ({ ...prev, initialBalance: e.target.value === "" ? 0 : Number(e.target.value) }))}
                />
                <button
                  type="button"
                  onClick={() => setFormState((prev) => ({ ...prev, initialBalance: (prev.initialBalance || 0) + 10 }))}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/20"
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={() => setFormState((prev) => ({ ...prev, initialBalance: (prev.initialBalance || 0) + 100 }))}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/20"
                >
                  +100
                </button>
                <button
                  type="button"
                  onClick={() => setFormState((prev) => ({ ...prev, initialBalance: (prev.initialBalance || 0) + 1000 }))}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/20"
                >
                  +1000
                </button>
              </div>
              <p className="text-xs text-white/50">
                Account will be automatically enrolled in all platforms
              </p>
            </div>
            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand.primary to-brand.accent px-4 py-3 text-sm font-semibold uppercase tracking-wider"
            >
              Create Account
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </form>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur">
            <h2 className="text-xl font-semibold">Activity</h2>
            <div className="mt-4 max-h-[400px] space-y-3 overflow-y-auto">
              {activities.map((activity) => (
                <div key={activity.id} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-white">
                      {activity.summary}
                    </p>
                    <span className="ml-2 rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/70">
                      {activity.platform?.code ?? "SYSTEM"}
                    </span>
                  </div>
                  <p className="text-xs text-white/60">{activity.account?.email ?? "n/a"}</p>
                  <p className="text-[11px] text-white/40">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {!activities.length && <p className="py-6 text-center text-sm text-white/50">No activity captured.</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Modern Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl"
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white">
                {confirmDialog.action === "suspend" ? "⏸ Suspend Account" : "🗑 Delete Account"}
              </h3>
              <p className="mt-2 text-sm text-white/70">
                {confirmDialog.action === "suspend" 
                  ? `You are about to suspend ${confirmDialog.accountEmail}. The account will be disabled but data will be preserved.`
                  : `You are about to permanently delete ${confirmDialog.accountEmail}. This action cannot be undone and all data will be lost.`
                }
              </p>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-white/90">
                Type <span className="font-bold text-rose-400">{confirmDialog.action.toUpperCase()}</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={confirmDialog.action.toUpperCase()}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-rose-500/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setConfirmDialog(null);
                  setConfirmInput("");
                }}
                className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.action === "suspend" ? handleConfirmedSuspend : handleConfirmedDelete}
                disabled={confirmInput.toLowerCase() !== confirmDialog.action.toLowerCase()}
                className={cn(
                  "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors",
                  confirmInput.toLowerCase() === confirmDialog.action.toLowerCase()
                    ? confirmDialog.action === "suspend"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-rose-500 hover:bg-rose-600"
                    : "cursor-not-allowed bg-white/10 text-white/40"
                )}
              >
                {confirmDialog.action === "suspend" ? "Suspend Account" : "Delete Account"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit User Dialog */}
      {editDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl"
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white">✏️ Edit Account</h3>
              <p className="mt-2 text-sm text-white/70">
                Update user information. Leave password blank to keep current password.
              </p>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">Name</label>
                <input
                  type="text"
                  value={editDialog.name}
                  onChange={(e) => setEditDialog({ ...editDialog, name: e.target.value })}
                  placeholder="Display Name"
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">Email</label>
                <input
                  type="email"
                  value={editDialog.email}
                  onChange={(e) => setEditDialog({ ...editDialog, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">
                  New Password <span className="text-xs text-white/50">(optional)</span>
                </label>
                <input
                  type="password"
                  value={editDialog.password}
                  onChange={(e) => setEditDialog({ ...editDialog, password: e.target.value })}
                  placeholder="Leave blank to keep current"
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditDialog(null)}
                className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                disabled={!editDialog.email}
                className={cn(
                  "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors",
                  editDialog.email
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "cursor-not-allowed bg-white/10 text-white/40"
                )}
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Activity Dialog */}
      {activityDialog && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[80vh] mx-4 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <History className="h-5 w-5 text-cyan-400" />
                  Activity History
                </h3>
                <p className="mt-1 text-sm text-white/70">
                  {activityDialog.accountName} ({activityDialog.accountEmail})
                </p>
              </div>
              <button
                onClick={() => setActivityDialog(null)}
                className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activityDialog.loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                </div>
              ) : activityDialog.activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/50">
                  <History className="h-12 w-12 mb-3 opacity-50" />
                  <p>No activity recorded for this account</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityDialog.activities.map((activity) => {
                    const coinsPart = activity.coins_delta !== 0 ? (
                      <span className={activity.coins_delta > 0 ? "text-emerald-400" : "text-rose-400"}>
                        {activity.coins_delta > 0 ? "+" : ""}{activity.coins_delta} coins
                      </span>
                    ) : null;
                    const tokensPart = activity.tokens_delta !== 0 ? (
                      <span className={activity.tokens_delta > 0 ? "text-violet-400" : "text-fuchsia-400"}>
                        {activity.tokens_delta > 0 ? "+" : ""}{activity.tokens_delta} tokens
                      </span>
                    ) : null;
                    const xpPart = activity.xp_delta !== 0 ? (
                      <span className={activity.xp_delta > 0 ? "text-cyan-400" : "text-amber-400"}>
                        {activity.xp_delta > 0 ? "+" : ""}{activity.xp_delta} XP
                      </span>
                    ) : null;

                    return (
                      <div
                        key={activity.id}
                        className="rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-cyan-500/20 px-2 py-0.5 text-xs font-medium text-cyan-300">
                                {activity.event_type}
                              </span>
                              <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/60">
                                {activity.platform?.code ?? "SYSTEM"}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                              {coinsPart}
                              {tokensPart}
                              {xpPart}
                              {!coinsPart && !tokensPart && !xpPart && (
                                <span className="text-white/50">No balance changes</span>
                              )}
                            </div>
                            {activity.metadata?.action && (
                              <p className="mt-1 text-xs text-white/50">
                                {activity.metadata.action}
                                {activity.metadata.adjusted_by && ` by ${activity.metadata.adjusted_by}`}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-white/40 whitespace-nowrap">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-4">
              <button
                onClick={() => setActivityDialog(null)}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast Notification */}
      {message && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="fixed left-6 top-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 px-5 py-3 shadow-2xl backdrop-blur-md"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
            <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-white">{message}</p>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="ml-2 text-white/60 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </div>
  );
}

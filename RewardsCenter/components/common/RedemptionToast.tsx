'use client';

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Redemption {
  id: string;
  userName: string;
  userAvatar: string;
  reward: string;
  timeAgo: string;
}

// Format relative time
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  
  if (diffSecs < 30) return 'Just now';
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function RedemptionToast() {
  const [mounted, setMounted] = useState(false);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Mark as mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch recent redemptions on mount
  const fetchRecentRedemptions = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    try {
      // Fetch recent completed orders with reward info
      const { data: orders, error } = await supabase
        .from('reward_orders')
        .select(`
          id,
          account_id,
          created_at,
          reward:rewards (
            id,
            title
          )
        `)
        .not('fulfilled_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching redemptions:', error);
        return;
      }

      if (!orders || orders.length === 0) return;

      // Fetch user info for all unique account IDs
      const accountIds = [...new Set(orders.map(o => o.account_id))];
      const userInfoMap = new Map<string, { name: string; avatar: string }>();

      // Get user info from our API
      for (const accountId of accountIds) {
        try {
          const res = await fetch(`/api/user-info?accountId=${accountId}`);
          if (res.ok) {
            const data = await res.json();
            userInfoMap.set(accountId, {
              name: data.name || 'User',
              avatar: data.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=6366f1`
            });
          }
        } catch (e) {
          userInfoMap.set(accountId, {
            name: 'User',
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=6366f1`
          });
        }
      }

      // Transform to redemption format
      const newRedemptions: Redemption[] = orders.map(order => {
        const reward = order.reward as any;
        const userInfo = userInfoMap.get(order.account_id) || {
          name: 'User',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=6366f1`
        };

        return {
          id: order.id,
          userName: userInfo.name,
          userAvatar: userInfo.avatar,
          reward: reward?.title || reward?.name || 'Reward',
          timeAgo: formatTimeAgo(new Date(order.created_at)),
        };
      });

      setRedemptions(newRedemptions);
    } catch (error) {
      console.error('Error in fetchRecentRedemptions:', error);
    }
  }, []);

  // Subscribe to new orders via Supabase Realtime
  useEffect(() => {
    if (!mounted) return;
    
    fetchRecentRedemptions();

    // Set up realtime subscription for new orders
    const channel = supabase
      .channel('redemption-toast')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'rewardscenter',
          table: 'reward_orders',
        },
        async (payload) => {
          console.log('New order received:', payload);
          
          // Fetch the full order with reward info
          const { data: order, error } = await supabase
            .from('reward_orders')
            .select(`
              id,
              account_id,
              created_at,
              fulfilled_at,
              reward:rewards (
                id,
                title
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (error || !order) {
            console.error('Error fetching new order:', error);
            return;
          }

          // Only show fulfilled redemptions
          if (!order.fulfilled_at) return;

          // Fetch user info
          let userInfo = { name: 'User', avatar: `https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=6366f1` };
          try {
            const res = await fetch(`/api/user-info?accountId=${order.account_id}`);
            if (res.ok) {
              const data = await res.json();
              userInfo = {
                name: data.name || 'User',
                avatar: data.avatar || userInfo.avatar
              };
            }
          } catch (e) {
            // Use default
          }

          const reward = order.reward as any;
          const newRedemption: Redemption = {
            id: order.id,
            userName: userInfo.name,
            userAvatar: userInfo.avatar,
            reward: reward?.title || reward?.name || 'Reward',
            timeAgo: 'Just now',
          };

          // Add to front of list and show immediately
          setRedemptions(prev => [newRedemption, ...prev.slice(0, 19)]);
          setCurrentIndex(0);
          setIsVisible(true);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'rewardscenter',
          table: 'reward_orders',
        },
        async (payload) => {
          // Handle orders that were updated to COMPLETED status
          if (payload.new.fulfilled_at && !payload.old?.fulfilled_at) {
            // Fetch the full order with reward info
            const { data: order, error } = await supabase
              .from('reward_orders')
              .select(`
                id,
                account_id,
                created_at,
                fulfilled_at,
                reward:rewards (
                  id,
                  title
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (error || !order) return;

            // Fetch user info
            let userInfo = { name: 'User', avatar: `https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=6366f1` };
            try {
              const res = await fetch(`/api/user-info?accountId=${order.account_id}`);
              if (res.ok) {
                const data = await res.json();
                userInfo = {
                  name: data.name || 'User',
                  avatar: data.avatar || userInfo.avatar
                };
              }
            } catch (e) {
              // Use default
            }

            const reward = order.reward as any;
            const newRedemption: Redemption = {
              id: order.id,
              userName: userInfo.name,
              userAvatar: userInfo.avatar,
              reward: reward?.title || reward?.name || 'Reward',
              timeAgo: 'Just now',
            };

            // Add to front of list and show immediately
            setRedemptions(prev => [newRedemption, ...prev.slice(0, 19)]);
            setCurrentIndex(0);
            setIsVisible(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mounted, fetchRecentRedemptions]);

  // Show first notification after initial delay
  useEffect(() => {
    if (!mounted || isDismissed || redemptions.length === 0) return;

    // Show first notification after 3 seconds
    const initialDelay = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(initialDelay);
  }, [isDismissed, redemptions.length]);

  // Cycle through notifications
  useEffect(() => {
    if (!mounted || isDismissed || redemptions.length === 0) return;

    const interval = setInterval(() => {
      // Hide current notification
      setIsVisible(false);
      
      // After 5 second delay, show next notification
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % redemptions.length);
        setIsVisible(true);
      }, 5000);
    }, 12000); // 7 seconds visible + 5 seconds delay

    return () => clearInterval(interval);
  }, [mounted, isDismissed, redemptions.length]);

  const currentRedemption = redemptions[currentIndex];

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  // Don't render anything until mounted on client to avoid hydration mismatch
  if (!mounted || !currentRedemption) return null;

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: 50 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: 20 }}
          className="fixed bottom-6 right-6 z-50 w-80"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
            {/* Gradient accent */}
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-brand-500 via-violet-500 to-brand-500" />
            
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/50 transition hover:bg-white/20 hover:text-white"
            >
              <X size={12} />
            </button>

            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentRedemption.userAvatar}
                    alt={currentRedemption.userName}
                    className="h-12 w-12 rounded-xl bg-slate-800 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentRedemption.userName)}&backgroundColor=6366f1`;
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 shadow-lg">
                    <Gift size={10} className="text-white" />
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    <span className="font-semibold">{currentRedemption.userName}</span>
                    <span className="text-white/60"> just redeemed</span>
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-brand-400 truncate">
                    {currentRedemption.reward}
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    {currentRedemption.timeAgo}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <motion.div
              key={currentRedemption.id}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 7, ease: "linear" }}
              className="h-0.5 w-full origin-left bg-gradient-to-r from-brand-500 to-violet-500"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

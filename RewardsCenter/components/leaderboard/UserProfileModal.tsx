'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  X, 
  MessageCircle, 
  Trophy, 
  Coins, 
  Star, 
  Flame,
  Medal,
  Calendar,
  UserPlus,
  Users,
  Award,
  ShoppingBag,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfileModalProps {
  user: {
    id?: string;
    rank: number;
    name: string;
    handle?: string;
    avatarUrl: string | null | undefined;
    coins: number;
    xp: number;
    level: number;
    streak?: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

interface ProfileData {
  stats: {
    tournamentsWon: number;
    tournamentsEntered: number;
    ordersCompleted: number;
    currentStreak: number;
    longestStreak: number;
  };
  friendsCount: number;
  achievementsCount: number;
  recentAchievements: Array<{
    id: string;
    code: string;
    title: string;
    icon: string;
    category: string;
    unlockedAt: string;
  }>;
}

// Get avatar URL with fallback
const getAvatarUrl = (avatarUrl: string | null | undefined, name: string) => {
  if (avatarUrl) return avatarUrl;
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366f1`;
};

// Map achievement category to gradient color
const getAchievementColor = (category: string) => {
  switch (category?.toUpperCase()) {
    case 'SOCIAL':
      return 'from-blue-400 to-cyan-500';
    case 'TOURNAMENT':
      return 'from-amber-400 to-orange-500';
    case 'SPENDING':
      return 'from-emerald-400 to-teal-500';
    case 'STREAK':
      return 'from-orange-400 to-red-500';
    case 'COLLECTION':
      return 'from-violet-400 to-purple-500';
    default:
      return 'from-slate-400 to-slate-500';
  }
};

export function UserProfileModal({ user, isOpen, onClose, currentUserId }: UserProfileModalProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [friendRequestStatus, setFriendRequestStatus] = useState<'idle' | 'sent' | 'friends' | 'error'>('idle');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  // Fetch profile data and check friendship status when modal opens
  useEffect(() => {
    async function fetchProfileData() {
      if (!isOpen || !user?.id) return;
      
      setIsLoading(true);
      try {
        // Fetch profile data
        const response = await fetch(`/api/user-profile/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setProfileData(data.data);
        }
        
        // Check friendship status if we have a current user
        if (currentUserId && currentUserId !== user.id) {
          const friendsResponse = await fetch(`/api/friends?user_id=${currentUserId}`);
          if (friendsResponse.ok) {
            const friendsData = await friendsResponse.json();
            const friends = friendsData.data || [];
            const isFriend = friends.some((f: { friendId: string }) => f.friendId === user.id);
            if (isFriend) {
              setFriendRequestStatus('friends');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfileData();
  }, [isOpen, user?.id, currentUserId]);

  // Reset friend request status when modal closes or user changes
  useEffect(() => {
    if (!isOpen) {
      setFriendRequestStatus('idle');
    }
  }, [isOpen, user?.id]);

  // Send friend request
  const handleSendFriendRequest = async () => {
    if (!currentUserId || !user?.id || isSendingRequest) return;
    
    setIsSendingRequest(true);
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: currentUserId,
          receiver_id: user.id
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Check if they became friends (mutual request) or just sent
        if (data.status === 'accepted') {
          setFriendRequestStatus('friends');
        } else {
          setFriendRequestStatus('sent');
        }
      } else {
        // Check specific error messages
        if (data.error === 'Already friends') {
          setFriendRequestStatus('friends');
        } else if (data.error === 'Friend request already pending') {
          setFriendRequestStatus('sent');
        } else {
          setFriendRequestStatus('error');
        }
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      setFriendRequestStatus('error');
    } finally {
      setIsSendingRequest(false);
    }
  };

  // Check if viewing own profile
  const isOwnProfile = currentUserId && user?.id && currentUserId === user.id;

  if (!user) return null;

  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-amber-400 to-yellow-500";
    if (rank === 2) return "from-slate-300 to-slate-400";
    if (rank === 3) return "from-amber-600 to-amber-700";
    return "from-brand-500 to-brand-600";
  };

  // Use real data if available, otherwise use user props for streak
  const currentStreak = profileData?.stats?.currentStreak ?? user.streak ?? 0;
  const tournamentsWon = profileData?.stats?.tournamentsWon ?? 0;
  const ordersCompleted = profileData?.stats?.ordersCompleted ?? 0;
  const friendsCount = profileData?.friendsCount ?? 0;
  const achievementsCount = profileData?.achievementsCount ?? 0;
  const recentAchievements = profileData?.recentAchievements ?? [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4"
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
              {/* Header Background */}
              <div className="relative h-28 bg-gradient-to-r from-brand-600 via-violet-600 to-brand-600">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white/80 backdrop-blur-sm transition hover:bg-black/50 hover:text-white"
                >
                  <X size={16} />
                </button>

                {/* Rank Badge */}
                <div className={cn(
                  "absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-gradient-to-r px-3 py-1 text-sm font-bold text-white shadow-lg",
                  getRankColor(user.rank)
                )}>
                  <Medal size={14} />
                  #{user.rank}
                </div>
              </div>

              {/* Avatar */}
              <div className="relative -mt-14 px-6">
                <div className="relative inline-block">
                  <img
                    src={getAvatarUrl(user.avatarUrl, user.name)}
                    alt={user.name}
                    className="h-[88px] w-[88px] rounded-2xl border-4 border-slate-900 bg-slate-800 object-cover"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900 bg-emerald-500 text-xs font-bold text-white">
                    {user.level}
                  </span>
                </div>
              </div>

              {/* User Info */}
              <div className="px-6 pt-3 pb-4">
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <p className="text-sm text-white/50">{user.handle || `@${user.name.toLowerCase().replace(/\s+/g, '')}`}</p>

                {/* Member since */}
                <div className="mt-2 flex items-center gap-1 text-xs text-white/40">
                  <Calendar size={12} />
                  <span>Member since 2024</span>
                </div>

                {/* Stats Grid - Top row (Coins, XP, Streak) */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white/5 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-400">
                      <Coins size={14} />
                      <span className="font-bold">{user.coins.toLocaleString()}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-white/40">Coins</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-emerald-400">
                      <Star size={14} />
                      <span className="font-bold">{user.xp.toLocaleString()}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-white/40">XP</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-orange-400">
                      <Flame size={14} />
                      <span className="font-bold">{currentStreak}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-white/40">Day Streak</p>
                  </div>
                </div>

                {/* Achievements/Badges */}
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium text-white/50">
                    Badges {isLoading && <Loader2 size={10} className="inline animate-spin ml-1" />}
                  </p>
                  <div className="flex gap-2">
                    {recentAchievements.length > 0 ? (
                      recentAchievements.slice(0, 4).map((achievement) => (
                        <div
                          key={achievement.id}
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white text-lg",
                            getAchievementColor(achievement.category)
                          )}
                          title={achievement.title}
                        >
                          {achievement.icon || '🏆'}
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/20">
                          <Award size={16} />
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/20">
                          <Award size={16} />
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/20">
                          <Award size={16} />
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/20">
                          <Award size={16} />
                        </div>
                      </>
                    )}
                    {achievementsCount > 4 && (
                      <div className="flex h-9 items-center justify-center rounded-xl bg-white/5 px-2 text-xs text-white/50">
                        +{achievementsCount - 4}
                      </div>
                    )}
                  </div>
                </div>

                {/* Activity Stats - Real Data */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                    <span className="flex items-center gap-1.5 text-white/50">
                      <Trophy size={12} className="text-amber-400" />
                      Tournaments Won
                    </span>
                    <span className="font-semibold text-white">{tournamentsWon}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                    <span className="flex items-center gap-1.5 text-white/50">
                      <ShoppingBag size={12} className="text-emerald-400" />
                      Rewards
                    </span>
                    <span className="font-semibold text-white">{ordersCompleted}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                    <span className="flex items-center gap-1.5 text-white/50">
                      <Users size={12} className="text-blue-400" />
                      Friends
                    </span>
                    <span className="font-semibold text-white">{friendsCount}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                    <span className="flex items-center gap-1.5 text-white/50">
                      <Award size={12} className="text-violet-400" />
                      Achievements
                    </span>
                    <span className="font-semibold text-white">{achievementsCount}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-white/5 bg-white/5 p-4">
                <div className="flex gap-2">
                  {!isOwnProfile && (
                    <Link
                      href={`/messages?friend=${user.id}`}
                      onClick={onClose}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-3 font-semibold text-white shadow-lg transition hover:from-brand-500 hover:to-brand-400"
                    >
                      <MessageCircle size={18} />
                      Message
                    </Link>
                  )}
                  {isOwnProfile && (
                    <Link
                      href="/account/settings"
                      onClick={onClose}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-3 font-semibold text-white shadow-lg transition hover:from-brand-500 hover:to-brand-400"
                    >
                      Edit Profile
                    </Link>
                  )}
                  {!isOwnProfile && (
                    <button 
                      onClick={handleSendFriendRequest}
                      disabled={isSendingRequest || friendRequestStatus !== 'idle'}
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl border transition",
                        friendRequestStatus === 'sent' && "border-blue-500/30 bg-blue-500/10 text-blue-400",
                        friendRequestStatus === 'friends' && "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                        friendRequestStatus === 'error' && "border-red-500/30 bg-red-500/10 text-red-400",
                        friendRequestStatus === 'idle' && "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
                        isSendingRequest && "opacity-50 cursor-not-allowed"
                      )}
                      title={
                        friendRequestStatus === 'sent' ? 'Friend request sent' :
                        friendRequestStatus === 'friends' ? 'Already friends' :
                        friendRequestStatus === 'error' ? 'Error sending request' :
                        'Send friend request'
                      }
                    >
                      {isSendingRequest ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : friendRequestStatus === 'friends' ? (
                        <Users size={18} />
                      ) : (
                        <UserPlus size={18} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

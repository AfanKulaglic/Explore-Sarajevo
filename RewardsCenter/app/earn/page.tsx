'use client';

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Brain, 
  MapPin, 
  Flame, 
  Lightbulb, 
  Gamepad2,
  Printer,
  Coins, 
  Zap, 
  ChevronRight,
  Star,
  Clock,
  Trophy,
  Check,
  Loader2,
  ExternalLink,
  Gift,
  CalendarCheck,
  LogIn
} from "lucide-react";
import { 
  FaYoutube, 
  FaInstagram, 
  FaFacebookF, 
  FaTiktok,
  FaLinkedinIn 
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";

interface EarnActivity {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  coinsReward: string;
  xpReward: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  duration?: string;
  isNew?: boolean;
  isHot?: boolean;
  url?: string;
  comingSoon?: boolean;
  buttonText?: string;
}

const earnActivities: EarnActivity[] = [
  {
    id: "saraya-quiz",
    title: "Saraya Quiz",
    description: "Test your knowledge with daily trivia questions. Answer correctly to earn coins and climb the quiz leaderboard!",
    icon: <Brain size={28} />,
    gradient: "from-violet-600 to-purple-600",
    borderColor: "border-violet-500/30",
    coinsReward: "2,000",
    xpReward: "500",
    difficulty: "Medium",
    duration: "5 min",
    isHot: true,
    url: "https://quiz.saraya.solutions/",
    buttonText: "Go to Quizzes",
  },
  {
    id: "explore-sarajevo",
    title: "Explore Sarajevo",
    description: "Discover hidden gems and landmarks around Sarajevo. Check in at locations to earn rewards and unlock achievements.",
    icon: <MapPin size={28} />,
    gradient: "from-emerald-600 to-teal-600",
    borderColor: "border-emerald-500/30",
    coinsReward: "2,000",
    xpReward: "500",
    difficulty: "Easy",
    duration: "Varies",
    url: "https://bihdiscovery.com/",
    buttonText: "Go to Site",
  },
  {
    id: "hotspot-sarajevo",
    title: "Hotspot Sarajevo",
    description: "Find and capture hotspots across the city. Compete with others to claim territories and earn bonus rewards!",
    icon: <Flame size={28} />,
    gradient: "from-orange-600 to-red-600",
    borderColor: "border-orange-500/30",
    coinsReward: "2,500",
    xpReward: "750",
    difficulty: "Medium",
    duration: "10 min",
    isHot: true,
    url: "https://hs.saraya.solutions/",
    buttonText: "Connect Now",
  },
  {
    id: "pametno-odabrano",
    title: "Pametno Odabrano",
    description: "Make smart choices in this decision-based challenge. Your strategic thinking will be rewarded with coins!",
    icon: <Lightbulb size={28} />,
    gradient: "from-amber-500 to-yellow-500",
    borderColor: "border-amber-500/30",
    coinsReward: "2,000",
    xpReward: "500",
    difficulty: "Easy",
    duration: "Varies",
    url: "https://pametnoodabrano.com/",
    buttonText: "Go to Site",
  },
  {
    id: "saraya-runner",
    title: "Saraya Runner",
    description: "Run, jump, and collect coins in this endless runner game. Beat your high score to earn bigger rewards!",
    icon: <Gamepad2 size={28} />,
    gradient: "from-cyan-600 to-blue-600",
    borderColor: "border-cyan-500/30",
    coinsReward: "100-10,000",
    xpReward: "7,500",
    difficulty: "Hard",
    duration: "∞",
    comingSoon: true,
  },
  {
    id: "digital-print",
    title: "Digital Print",
    description: "Design and create custom merchandise. Complete printing tasks to earn coins and unlock exclusive designs!",
    icon: <Printer size={28} />,
    gradient: "from-rose-600 to-pink-600",
    borderColor: "border-rose-500/30",
    coinsReward: "2,000",
    xpReward: "500",
    difficulty: "Easy",
    duration: "Varies",
    comingSoon: true,
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Easy":
      return "text-emerald-400 bg-emerald-500/20";
    case "Medium":
      return "text-amber-400 bg-amber-500/20";
    case "Hard":
      return "text-rose-400 bg-rose-500/20";
    default:
      return "text-white/60 bg-white/10";
  }
};

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  followers: string;
  reward: number;
  url: string;
}

const socialPlatformsData: SocialPlatform[] = [
  {
    id: "youtube",
    name: "YouTube",
    icon: <FaYoutube size={24} />,
    gradient: "from-red-600 to-red-500",
    borderColor: "border-red-500/30",
    followers: "Subscribe",
    reward: 3000,
    url: "https://youtube.com/@sarayasolutions?si=hE_sBiTLa52EJ7yo",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: <FaInstagram size={24} />,
    gradient: "from-pink-600 via-purple-600 to-orange-500",
    borderColor: "border-pink-500/30",
    followers: "Follow",
    reward: 3000,
    url: "https://www.instagram.com/sarayasolutions_?igsh=MWFhM3Qwb2t0Z2Z2ZA==",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: <FaFacebookF size={22} />,
    gradient: "from-blue-600 to-blue-500",
    borderColor: "border-blue-500/30",
    followers: "Like",
    reward: 3000,
    url: "https://www.facebook.com/share/1A2iv7UpQZ/",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: <FaTiktok size={22} />,
    gradient: "from-slate-900 via-pink-500 to-cyan-400",
    borderColor: "border-cyan-500/30",
    followers: "Follow",
    reward: 3000,
    url: "https://www.tiktok.com/@sarayasolutions0?_r=1&_t=ZM-92U633z9RrE",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: <FaLinkedinIn size={22} />,
    gradient: "from-blue-700 to-blue-600",
    borderColor: "border-blue-600/30",
    followers: "Connect",
    reward: 8000,
    url: "https://www.linkedin.com/in/saraya-solutions-20917b27a/",
  },
];

// Social Follow Section Component with state management
const PENDING_PLATFORMS_KEY = 'saraya_pending_social_follows';

function SocialFollowSection() {
  const router = useRouter();
  const { user, updateBalance, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [claimedPlatforms, setClaimedPlatforms] = useState<string[]>([]);
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);
  const [pendingPlatforms, setPendingPlatforms] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load pending platforms from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(PENDING_PLATFORMS_KEY);
    if (stored) {
      try {
        setPendingPlatforms(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading pending platforms:', e);
      }
    }
  }, []);

  // Save pending platforms to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(PENDING_PLATFORMS_KEY, JSON.stringify(pendingPlatforms));
  }, [pendingPlatforms]);

  // Fetch claimed platforms on mount
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/social-follow?account_id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setClaimedPlatforms(data.data);
            // Remove already claimed platforms from pending
            setPendingPlatforms(prev => prev.filter(p => !data.data.includes(p)));
          }
        })
        .catch(err => console.error('Error fetching claimed platforms:', err));
    }
  }, [user?.id]);

  const handleFollow = async (platform: SocialPlatform) => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!user?.id) return;
    
    // Open the social media link in new tab
    window.open(platform.url, '_blank', 'noopener,noreferrer');
    
    // Add this platform to pending list (user needs to click "Claim" after following)
    setPendingPlatforms(prev => prev.includes(platform.id) ? prev : [...prev, platform.id]);
  };

  const handleClaim = async (platform: SocialPlatform) => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!user?.id || loadingPlatform) return;
    
    setLoadingPlatform(platform.id);
    setMessage(null);
    
    try {
      const response = await fetch('/api/social-follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: user.id,
          platform: platform.id,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setClaimedPlatforms(prev => [...prev, platform.id]);
        setPendingPlatforms(prev => prev.filter(p => p !== platform.id));
        setMessage({ type: 'success', text: data.message || `+${platform.reward} coins earned!` });
        // Update coin balance in header immediately
        if (user) {
          updateBalance(user.coins + platform.reward);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to claim reward' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoadingPlatform(null);
    }
  };

  const isClaimed = (platformId: string) => claimedPlatforms.includes(platformId);
  const isPending = (platformId: string) => pendingPlatforms.includes(platformId);
  const totalUnclaimed = socialPlatformsData.filter(p => !isClaimed(p.id)).reduce((sum, p) => sum + p.reward, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-950/60 p-4 sm:p-6 backdrop-blur-2xl"
    >
      <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-pink-500/20 to-violet-500/20 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-3xl" />
      
      <div className="relative">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">{t.earn.socialFollow.title}</h2>
            <p className="mt-1 text-xs sm:text-sm text-white/60">{t.earn.socialFollow.subtitle}</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg sm:rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2 sm:px-3 py-1.5 sm:py-2 w-fit">
            <Coins size={14} className="text-emerald-400 sm:hidden" />
            <Coins size={16} className="text-emerald-400 hidden sm:block" />
            <span className="text-xs sm:text-sm font-semibold text-emerald-400">
              {totalUnclaimed > 0 
                ? t.earn.socialFollow.coinsAvailable.replace('{coins}', totalUnclaimed.toLocaleString())
                : t.earn.socialFollow.allClaimed
              }
            </span>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mb-4 rounded-xl px-4 py-3 text-sm font-medium",
              message.type === 'success' 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            )}
          >
            {message.text}
          </motion.div>
        )}

        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-5">
          {socialPlatformsData.map((platform, index) => {
            const claimed = isClaimed(platform.id);
            const pending = isPending(platform.id);
            const loading = loadingPlatform === platform.id;
            
            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + index * 0.05 }}
                className={cn(
                  "group relative overflow-hidden rounded-xl sm:rounded-2xl border p-3 sm:p-4 transition-all hover:scale-[1.02]",
                  claimed 
                    ? "border-emerald-500/30 bg-emerald-500/5" 
                    : `${platform.borderColor} bg-white/5 hover:bg-white/10`
                )}
              >
                {/* Connected badge */}
                {claimed && (
                  <div className="absolute top-2 right-2">
                    <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-emerald-500">
                      <Check size={10} className="text-white sm:hidden" />
                      <Check size={12} className="text-white hidden sm:block" />
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <div className={cn(
                    "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br text-white shadow-lg",
                    platform.gradient
                  )}>
                    {platform.icon}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-sm sm:text-base font-semibold text-white">{platform.name}</h3>
                    <p className="text-[10px] sm:text-xs text-white/50 hidden sm:block">{platform.followers}</p>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Coins size={12} className="text-amber-400 sm:hidden" />
                    <Coins size={14} className="text-amber-400 hidden sm:block" />
                    <span className="text-xs sm:text-sm font-bold text-amber-400">
                      {claimed ? t.earn.socialFollow.claimed : `+${platform.reward.toLocaleString()}`}
                    </span>
                  </div>
                  
                  {claimed ? (
                    <span className="text-[10px] sm:text-xs font-medium text-emerald-400">{t.earn.socialFollow.completed}</span>
                  ) : pending ? (
                    <button
                      onClick={() => handleClaim(platform)}
                      disabled={loading}
                      className={cn(
                        "rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-white transition-all hover:shadow-lg w-full sm:w-auto text-center flex items-center justify-center gap-1",
                        loading && "opacity-70 cursor-not-allowed"
                      )}
                    >
                      {loading ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <>{t.earn.socialFollow.claim} {platform.reward}</>
                      )}
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleFollow(platform)}
                      className={cn(
                        "rounded-lg bg-gradient-to-r px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-white transition-all hover:shadow-lg w-full sm:w-auto text-center flex items-center justify-center gap-1",
                        platform.gradient
                      )}
                    >
                      <ExternalLink size={10} />
                      {t.earn.socialFollow.follow}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-3 sm:mt-4 text-center text-[10px] sm:text-xs text-white/40">
          {t.earn.socialFollow.instructions}
        </p>
      </div>
    </motion.div>
  );
}

// Daily Reward Section Component
function DailyRewardSection() {
  const router = useRouter();
  const { user, updateBalance, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [canClaim, setCanClaim] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const DAILY_REWARD = 1000;

  // Format milliseconds to HH:MM:SS
  const formatTime = (ms: number): string => {
    if (ms <= 0) return '00:00:00';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Fetch daily reward status
  useEffect(() => {
    if (!user?.id) return;

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/daily-reward?account_id=${user.id}`);
        const data = await response.json();
        
        if (response.ok) {
          setCanClaim(data.canClaim);
          setStreak(data.streak || 0);
          if (!data.canClaim && data.msUntilReset) {
            // Start countdown
            let remaining = data.msUntilReset;
            setTimeUntilReset(formatTime(remaining));
            
            const interval = setInterval(() => {
              remaining -= 1000;
              if (remaining <= 0) {
                clearInterval(interval);
                setCanClaim(true);
                setTimeUntilReset('');
              } else {
                setTimeUntilReset(formatTime(remaining));
              }
            }, 1000);
            
            return () => clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Error fetching daily reward status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [user?.id]);

  const handleClaim = async () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!user?.id || isClaiming || !canClaim) return;

    setIsClaiming(true);
    setMessage(null);

    try {
      const response = await fetch('/api/daily-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: user.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setCanClaim(false);
        setStreak(data.streak || streak + 1); // Update streak from response or increment
        setMessage({ type: 'success', text: data.message || `+${DAILY_REWARD} coins earned!` });
        // Update balance immediately
        if (user) {
          updateBalance(user.coins + DAILY_REWARD);
        }
        // Fetch new reset time
        const statusRes = await fetch(`/api/daily-reward?account_id=${user.id}`);
        const statusData = await statusRes.json();
        if (statusData.msUntilReset) {
          let remaining = statusData.msUntilReset;
          setTimeUntilReset(formatTime(remaining));
          
          const interval = setInterval(() => {
            remaining -= 1000;
            if (remaining <= 0) {
              clearInterval(interval);
              setCanClaim(true);
              setTimeUntilReset('');
            } else {
              setTimeUntilReset(formatTime(remaining));
            }
          }, 1000);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to claim reward' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-amber-600/20 p-4 sm:p-6"
    >
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-orange-500/15 blur-2xl" />
      
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
            <Gift size={24} className="text-white sm:hidden" />
            <Gift size={32} className="text-white hidden sm:block" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">{t.earn.dailyReward.title}</h3>
              {streak > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-orange-500/20 border border-orange-500/30 px-2 py-0.5">
                  <Flame size={12} className="text-orange-400" />
                  <span className="text-xs font-bold text-orange-400">{streak}</span>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-white/60">
              {streak > 0 
                ? t.earn.dailyReward.streakMessage.replace('{streak}', streak.toString())
                : t.earn.dailyReward.claimMessage.replace('{coins}', DAILY_REWARD.toString())
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4">
          {!canClaim && timeUntilReset && (
            <div className="text-right">
              <p className="text-xs text-white/50">{t.earn.dailyReward.resetsIn}</p>
              <p className="text-lg sm:text-xl font-mono font-bold text-amber-400">{timeUntilReset}</p>
            </div>
          )}
          
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/20 px-3 py-1.5">
              <Coins size={16} className="text-amber-400" />
              <span className="text-sm font-bold text-amber-400">+{DAILY_REWARD}</span>
            </div>
            
            {!isAuthenticated ? (
              <button
                onClick={() => router.push('/auth/login')}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
              >
                <LogIn size={16} />
                {t.earn.dailyReward.signInToClaim}
              </button>
            ) : isLoading ? (
              <div className="flex items-center justify-center w-24 h-9">
                <Loader2 size={20} className="animate-spin text-amber-400" />
              </div>
            ) : canClaim ? (
              <button
                onClick={handleClaim}
                disabled={isClaiming}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105",
                  isClaiming && "opacity-70 cursor-not-allowed"
                )}
              >
                {isClaiming ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <CalendarCheck size={16} />
                    {t.earn.dailyReward.claimNow}
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-white/50">
                <Check size={16} className="text-emerald-400" />
                {t.earn.dailyReward.claimed}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mt-4 rounded-xl px-4 py-2 text-sm font-medium text-center",
            message.type === 'success' 
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-red-500/20 text-red-400"
          )}
        >
          {message.text}
        </motion.div>
      )}
      
      <p className="mt-3 text-center text-[10px] sm:text-xs text-white/40">
        {t.earn.dailyReward.resetTime}
      </p>
    </motion.div>
  );
}

function ActivityCard({ activity, index }: { activity: EarnActivity; index: number }) {
  const { t } = useTranslation();
  
  // Get translated description based on activity ID
  const getActivityDescription = (id: string): string => {
    const descriptions: Record<string, string> = {
      'saraya-quiz': t.earn.activities.sarayaQuiz.description,
      'explore-sarajevo': t.earn.activities.exploreSarajevo.description,
      'hotspot-sarajevo': t.earn.activities.hotspotSarajevo.description,
      'pametno-odabrano': t.earn.activities.pametnoOdabrano.description,
      'saraya-runner': t.earn.activities.sarayaRunner.description,
      'digital-print': t.earn.activities.digitalPrint.description,
    };
    return descriptions[id] || activity.description;
  };

  // Get translated button text
  const getButtonText = (buttonText?: string): string => {
    const buttonTexts: Record<string, string> = {
      'Go to Quizzes': t.earn.goToQuizzes,
      'Go to Site': t.earn.goToSite,
      'Connect Now': t.earn.connectNow,
      'Play Now': t.earn.playNow,
    };
    return buttonText ? (buttonTexts[buttonText] || buttonText) : t.earn.playNow;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border bg-slate-950/60 backdrop-blur-2xl transition-all hover:shadow-2xl",
        activity.borderColor,
        "hover:border-white/20"
      )}
    >
      {/* Background gradient glow */}
      <div className={cn(
        "absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br opacity-20 blur-3xl transition-opacity group-hover:opacity-40",
        activity.gradient
      )} />
      
      {/* Badges */}
      <div className="absolute top-4 right-4 flex gap-2">
        {activity.comingSoon && (
          <span className="flex items-center gap-1 rounded-full bg-slate-600 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-white">
            {t.common.comingSoon.toUpperCase()}
          </span>
        )}
        {activity.isNew && !activity.comingSoon && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-white">
            {t.common.new.toUpperCase()}
          </span>
        )}
        {activity.isHot && !activity.comingSoon && (
          <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-white">
            <Flame size={10} />
            {t.common.hot.toUpperCase()}
          </span>
        )}
      </div>
      
      <div className="relative p-4 sm:p-6">
        {/* Icon */}
        <div className={cn(
          "mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br text-white shadow-lg",
          activity.gradient
        )}>
          {activity.icon}
        </div>
        
        {/* Title & Description */}
        <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-brand-400 transition-colors">
          {activity.title}
        </h3>
        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-white/60 line-clamp-2">
          {getActivityDescription(activity.id)}
        </p>
        
        {/* Rewards */}
        <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border border-amber-500/20 bg-amber-500/10 px-2 sm:px-3 py-1.5 sm:py-2">
            <Coins size={12} className="text-amber-400 sm:hidden" />
            <Coins size={14} className="text-amber-400 hidden sm:block" />
            <span className="text-xs sm:text-sm font-semibold text-amber-400">{activity.coinsReward}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2 sm:px-3 py-1.5 sm:py-2">
            <Zap size={12} className="text-emerald-400 sm:hidden" />
            <Zap size={14} className="text-emerald-400 hidden sm:block" />
            <span className="text-xs sm:text-sm font-semibold text-emerald-400">+{activity.xpReward} XP</span>
          </div>
        </div>
        
        {/* Meta info */}
        <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-white/50">
          {activity.difficulty && (
            <span className={cn(
              "rounded-md sm:rounded-lg px-1.5 sm:px-2 py-0.5 sm:py-1 font-medium",
              getDifficultyColor(activity.difficulty)
            )}>
              {activity.difficulty}
            </span>
          )}
          {activity.duration && (
            <span className="flex items-center gap-1">
              <Clock size={10} className="sm:hidden" />
              <Clock size={12} className="hidden sm:block" />
              {activity.duration}
            </span>
          )}
        </div>
        
        {/* Action Button */}
        {activity.comingSoon ? (
          <div className="mt-4 sm:mt-5 flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-slate-700/50 py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold text-white/60 cursor-not-allowed">
            {t.common.comingSoon}
          </div>
        ) : activity.url ? (
          <a
            href={activity.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mt-4 sm:mt-5 flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl",
              activity.gradient
            )}
          >
            {getButtonText(activity.buttonText)}
            <ChevronRight size={14} className="sm:hidden" />
            <ChevronRight size={16} className="hidden sm:block" />
          </a>
        ) : (
          <button className={cn(
            "mt-4 sm:mt-5 flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl",
            activity.gradient
          )}>
            {getButtonText(activity.buttonText)}
            <ChevronRight size={14} className="sm:hidden" />
            <ChevronRight size={16} className="hidden sm:block" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Stats Overview Component with real data
function StatsOverview() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [streak, setStreak] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchStats = async () => {
      try {
        // Fetch daily reward status for streak
        const dailyRes = await fetch(`/api/daily-reward?account_id=${user.id}`);
        if (dailyRes.ok) {
          const dailyData = await dailyRes.json();
          setStreak(dailyData.streak || 0);
        }

        // Fetch social follows for completed count
        const socialRes = await fetch(`/api/social-follow?account_id=${user.id}`);
        if (socialRes.ok) {
          const socialData = await socialRes.json();
          const claimedCount = socialData.claimed?.length || 0;
          setCompletedTasks(claimedCount);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  // Format number with K suffix for large values
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toLocaleString();
  };

  const totalCoins = user?.coins || 0;
  const totalXp = user?.xp || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4"
    >
      <div className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 sm:p-4">
        <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-amber-500/20">
          <Coins size={16} className="text-amber-400 sm:hidden" />
          <Coins size={18} className="text-amber-400 hidden sm:block" />
        </span>
        <div className="min-w-0">
          <p className="text-lg sm:text-2xl font-bold text-white">
            {isLoading ? '...' : formatNumber(totalCoins)}
          </p>
          <p className="text-[10px] sm:text-xs text-white/50 truncate">{t.earn.totalCoins}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 sm:p-4">
        <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500/20">
          <Zap size={16} className="text-emerald-400 sm:hidden" />
          <Zap size={18} className="text-emerald-400 hidden sm:block" />
        </span>
        <div className="min-w-0">
          <p className="text-lg sm:text-2xl font-bold text-white">
            {isLoading ? '...' : formatNumber(totalXp)}
          </p>
          <p className="text-[10px] sm:text-xs text-white/50 truncate">{t.earn.totalXp}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-brand-500/20 bg-brand-500/10 p-3 sm:p-4">
        <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-brand-500/20">
          <Star size={16} className="text-brand-400 sm:hidden" />
          <Star size={18} className="text-brand-400 hidden sm:block" />
        </span>
        <div className="min-w-0">
          <p className="text-lg sm:text-2xl font-bold text-white">
            {isLoading ? '...' : completedTasks}
          </p>
          <p className="text-[10px] sm:text-xs text-white/50 truncate">{t.earn.tasksDone}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3 sm:p-4">
        <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-violet-500/20">
          <Trophy size={16} className="text-violet-400 sm:hidden" />
          <Trophy size={18} className="text-violet-400 hidden sm:block" />
        </span>
        <div className="min-w-0">
          <p className="text-lg sm:text-2xl font-bold text-white">
            {isLoading ? '...' : streak}
          </p>
          <p className="text-[10px] sm:text-xs text-white/50 truncate">{t.earn.dailyStreak}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function EarnRewardsPage() {
  const { t } = useTranslation();
  
  return (
    <section className="flex flex-col gap-4 sm:gap-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{t.earn.title}</h1>
        <p className="text-sm sm:text-base text-white/60">{t.earn.subtitle}</p>
      </motion.div>
      
      {/* Stats Overview */}
      <StatsOverview />
      
      {/* Daily Reward Section */}
      <DailyRewardSection />

      {/* Social Media Follow Section */}
      <SocialFollowSection />
      
      {/* Activities Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {earnActivities.map((activity, index) => (
          <ActivityCard key={activity.id} activity={activity} index={index} />
        ))}
      </div>
    </section>
  );
}

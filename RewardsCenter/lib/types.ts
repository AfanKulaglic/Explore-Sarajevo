export type CurrencyCode = "COINS" | "TOKENS";

export type RewardType = "PHYSICAL" | "DIGITAL" | "PERK";

export type RewardTag = "FEATURED" | "LIMITED_TIME" | "REQUIRES_APPROVAL";

export interface Reward {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  type: RewardType;
  category: string;
  price: number;
  currency: CurrencyCode;
  stock?: number | null;
  requiresApproval?: boolean;
  tags?: RewardTag[];
  expiresAt?: string | null;
  // Bosnian translations
  titleBosnian?: string;
  subtitleBosnian?: string;
  descriptionBosnian?: string;
}

export type OrderStatus = "PENDING" | "APPROVED" | "FULFILLED" | "DENIED";

export interface RewardOrder {
  id: string;
  userName: string;
  rewardTitle: string;
  rewardId: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export interface UserWallet {
  coins: number;
  tokens: number;
  xp: number;
  level: number;
}

export interface UserProfile {
  name: string;
  handle: string;
  avatarUrl: string;
  notifications: number;
}

export interface FilterOption {
  label: string;
  value: string;
}

export type BadgeTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

export type AchievementType = "SEMIFINALIST" | "FINALIST" | "WINNER" | "MILESTONE" | "PERSONAL_BEST" | "ACHIEVEMENT" | "REDEMPTION";

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  coins: number;
  xp: number;
  level: number;
  avatarUrl: string;
  badge: BadgeTier;
  rating: number; // 1-5 stars
  streak?: number;
}

export interface ActivityFeedItem {
  id: string;
  type: AchievementType;
  userName: string;
  userAvatar: string;
  title: string;
  subtitle?: string;
  coins?: number;
  xpEarned?: number;
  isMonetary?: boolean;
  timestamp: string;
  gradientFrom: string;
  gradientTo: string;
}

export type AccountTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

export interface AccountStats {
  totalEarned: number;
  totalRedeemed: number;
  ordersCompleted: number;
  currentStreak: number;
  longestStreak: number;
  rank: number;
  percentile: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  // Bosnian translations
  titleBosnian?: string;
  descriptionBosnian?: string;
}

export interface Transaction {
  id: string;
  type: "EARNED" | "REDEEMED" | "BONUS" | "REFUND";
  title: string;
  description: string;
  amount: number;
  currency: CurrencyCode;
  timestamp: string;
}

export interface XPProgress {
  currentXP: number;
  xpToNextLevel: number;
  level: number;
}

export type TournamentStatus = "UPCOMING" | "LIVE" | "COMPLETED";
export type TournamentType = "SOLO" | "TEAM" | "BRACKET";

export interface TournamentPrize {
  place: number;
  coins: number;
  xp: number;
  badge?: string;
}

export interface TournamentParticipant {
  id: string;
  name: string;
  avatarUrl: string;
  score: number;
  rank: number;
}

export interface Tournament {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  type: TournamentType;
  status: TournamentStatus;
  startDate: string;
  endDate: string;
  entryFee: number;
  entryCurrency: CurrencyCode;
  maxParticipants: number;
  currentParticipants: number;
  prizes: TournamentPrize[];
  topParticipants: TournamentParticipant[];
  rules: string[];
  xpReward: number;
  featured: boolean;
  // Bosnian translations
  titleBosnian?: string;
  descriptionBosnian?: string;
  rulesBosnian?: string[];
}

export interface AccountProfile extends UserProfile {
  email: string;
  tier: AccountTier;
  tierProgress: number;
  tierNextThreshold: number;
  xpProgress: XPProgress;
  joinedAt: string;
  stats: AccountStats;
  achievements: Achievement[];
  recentTransactions: Transaction[];
}

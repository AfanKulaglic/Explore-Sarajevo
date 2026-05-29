import { RewardCard } from "@/components/common/RewardCard";
import { Reward } from "@/lib/types";

interface RewardsGridProps {
  rewards: Reward[];
}

export function RewardsGrid({ rewards }: RewardsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
      {rewards.map((reward) => (
        <RewardCard key={reward.id} reward={reward} />
      ))}
    </div>
  );
}

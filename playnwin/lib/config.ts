import { Prize } from './types';

export const PRIZES: Prize[] = [
  { id: 1, label: "Partner Prize", icon: "gift", description: "Special partner reward - exclusive merchandise or voucher", color: "#EC4899", coins_reward: 0, xp_reward: 0, probability_weight: 100 },
  { id: 2, label: "100 Coins", icon: "sparkles", description: "100 bonus coins added to your balance", color: "#7C3AED", coins_reward: 100, xp_reward: 50, probability_weight: 100 },
  { id: 3, label: "Free Spin", icon: "rotateCcw", description: "One free spin token - spin again for free!", color: "#3B82F6", coins_reward: 120, xp_reward: 0, probability_weight: 100 },
  { id: 4, label: "50 Coins", icon: "diamond", description: "50 bonus coins added to your balance", color: "#8B5CF6", coins_reward: 50, xp_reward: 25, probability_weight: 100 },
  { id: 5, label: "XP Boost", icon: "box", description: "100 XP boost for your profile!", color: "#EC4899", coins_reward: 0, xp_reward: 100, probability_weight: 100 },
  { id: 6, label: "200 Coins", icon: "crown", description: "200 bonus coins added to your balance", color: "#7C3AED", coins_reward: 200, xp_reward: 100, probability_weight: 100 },
  { id: 7, label: "Try Again", icon: "clock", description: "Better luck next time - keep spinning!", color: "#3B82F6", coins_reward: 0, xp_reward: 10, probability_weight: 100 },
  { id: 8, label: "Jackpot", icon: "zap", description: "Grand prize winner! 500 coins + 250 XP!", color: "#8B5CF6", coins_reward: 500, xp_reward: 250, probability_weight: 100 },
];

export const GAME_CONFIG = {
  spinCost: 120,
  initialBalance: 14000,
  initialXp: 0,
  minRotations: 4,
  maxRotations: 8,
  spinDuration: 4000,
  segmentCount: 8,
};

export function calculateSpinRotation(prizeIndex: number, totalPrizes: number, currentRotation: number): number {
  const segmentAngle = 360 / totalPrizes;
  
  // Calculate where the wheel currently is (normalized to 0-360)
  const currentAngle = ((currentRotation % 360) + 360) % 360;
  
  // The wheel has segment 0 centered at the top (pointer position)
  // Segment N is at N * segmentAngle degrees clockwise from top
  // After rotation, segment N appears at top when wheel is at (360 - N * segmentAngle)
  const targetAngle = ((360 - prizeIndex * segmentAngle) % 360 + 360) % 360;
  
  // Random number of full rotations (4-8)
  const randomRotations = Math.floor(Math.random() * 5) + 4;
  const baseRotation = randomRotations * 360;
  
  // Calculate how much more we need to rotate from current position to target
  let deltaAngle = targetAngle - currentAngle;
  if (deltaAngle < 0) deltaAngle += 360;
  
  const finalRotation = baseRotation + deltaAngle;
  
  console.log(`[Wheel] prizeIndex: ${prizeIndex}, currentAngle: ${currentAngle}, targetAngle: ${targetAngle}, deltaAngle: ${deltaAngle}, finalRotation: ${finalRotation}`);
  
  return finalRotation;
}

export function selectRandomPrize(prizes: Prize[]): Prize {
  // Calculate total weight
  const totalWeight = prizes.reduce((sum, prize) => sum + (prize.probability_weight || 100), 0);
  
  // Generate random number between 0 and totalWeight
  let random = Math.random() * totalWeight;
  
  // Find the prize based on weighted probability
  for (const prize of prizes) {
    const weight = prize.probability_weight || 100;
    random -= weight;
    if (random <= 0) {
      return prize;
    }
  }
  
  // Fallback to last prize (should never happen)
  return prizes[prizes.length - 1];
}

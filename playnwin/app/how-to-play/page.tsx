'use client';

import { ArrowLeft, Gamepad2, Target, Coins, Trophy, Sparkles, Clock, Star, Zap } from 'lucide-react';
import Link from 'next/link';

const games = [
  {
    name: 'Wheel of Fortune',
    icon: '🎡',
    color: 'from-purple-500 to-pink-500',
    description: 'Spin the wheel and win instant prizes!',
    howToPlay: [
      'Tap the spin button to start the wheel',
      'Wait for the wheel to stop spinning',
      'Win the prize where the pointer lands',
      'You can spin once per day for free'
    ],
    tips: [
      'Log in to save your winnings',
      'Come back daily for free spins',
      'Higher value prizes are rarer'
    ],
    rewards: { coins: '10-500', xp: '5-100' }
  },
  {
    name: 'Memory Match',
    icon: '🧠',
    color: 'from-blue-500 to-cyan-500',
    description: 'Test your memory by matching pairs of cards.',
    howToPlay: [
      'Choose a difficulty level (Easy, Medium, Hard)',
      'Memorize card positions during the preview',
      'Flip cards to find matching pairs',
      'Match all pairs before time runs out'
    ],
    tips: [
      'Start with Easy to learn the patterns',
      'Focus on a few cards at a time',
      'Faster completion = better rewards'
    ],
    rewards: { coins: '25-400', xp: '10-200' }
  },
  {
    name: 'Puzzle Challenge',
    icon: '🧩',
    color: 'from-green-500 to-emerald-500',
    description: 'Slide pieces to complete beautiful images.',
    howToPlay: [
      'Select your preferred difficulty',
      'Study the complete image during preview',
      'Drag and drop pieces to solve the puzzle',
      'Complete faster for better rewards'
    ],
    tips: [
      'Start from corners and edges',
      'Look for distinctive patterns',
      'Take your time on harder levels'
    ],
    rewards: { coins: '25-400', xp: '10-200' }
  },
  {
    name: 'Word Search',
    icon: '🔤',
    color: 'from-orange-500 to-amber-500',
    description: 'Find hidden words in the letter grid.',
    howToPlay: [
      'Pick a difficulty level',
      'Find all hidden words in the grid',
      'Drag to select words horizontally, vertically, or diagonally',
      'Find all words before time expires'
    ],
    tips: [
      'Scan for first letters of each word',
      'Words can go in any direction',
      'Check diagonal lines too'
    ],
    rewards: { coins: '25-400', xp: '10-200' }
  },
  {
    name: 'Pac-Man',
    icon: '👾',
    color: 'from-yellow-500 to-orange-500',
    description: 'Classic arcade action - eat dots, avoid ghosts!',
    howToPlay: [
      'Choose a difficulty level',
      'Use arrow keys or swipe to move Pac-Man',
      'Eat all dots while avoiding ghosts',
      'Grab power pellets to eat ghosts!'
    ],
    tips: [
      'Plan your route to avoid getting cornered',
      'Use power pellets strategically',
      'Ghosts have different behaviors'
    ],
    rewards: { coins: '50-500', xp: '50-100' }
  }
];

export default function HowToPlayPage() {
  return (
    <main className="min-h-screen px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/"
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Gamepad2 className="text-purple-400" />
              How to Play
            </h1>
            <p className="text-white/60 text-sm">Learn how to play and win rewards</p>
          </div>
        </div>

        {/* General Info */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-white/10 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="text-yellow-400" />
            Welcome to Play & Win!
          </h2>
          <p className="text-white/80 mb-4">
            Play exciting games and earn Saraya Coins and XP! Use your coins to redeem rewards 
            across all Saraya platforms. Level up by earning XP and unlock exclusive benefits.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <Coins className="text-yellow-400 mx-auto mb-2" size={24} />
              <p className="text-white font-medium">Earn Coins</p>
              <p className="text-white/50 text-sm">Win prizes in games</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <Zap className="text-cyan-400 mx-auto mb-2" size={24} />
              <p className="text-white font-medium">Gain XP</p>
              <p className="text-white/50 text-sm">Level up your account</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <Trophy className="text-purple-400 mx-auto mb-2" size={24} />
              <p className="text-white font-medium">Climb Ranks</p>
              <p className="text-white/50 text-sm">Compete on leaderboards</p>
            </div>
          </div>
        </div>

        {/* Games */}
        <div className="space-y-6">
          {games.map((game, index) => (
            <div 
              key={game.name}
              className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
            >
              {/* Game Header */}
              <div className={`bg-gradient-to-r ${game.color} p-4`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{game.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{game.name}</h3>
                    <p className="text-white/80 text-sm">{game.description}</p>
                  </div>
                </div>
              </div>

              {/* Game Content */}
              <div className="p-4 space-y-4">
                {/* How to Play Steps */}
                <div>
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Target size={16} className="text-purple-400" />
                    How to Play
                  </h4>
                  <ol className="space-y-2">
                    {game.howToPlay.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-3 text-white/70">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-sm flex items-center justify-center font-medium">
                          {stepIndex + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Tips */}
                <div>
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Star size={16} className="text-yellow-400" />
                    Tips
                  </h4>
                  <ul className="space-y-1">
                    {game.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-center gap-2 text-white/60 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/50" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Rewards */}
                <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Coins size={16} className="text-yellow-400" />
                    <span className="text-white/60 text-sm">
                      <span className="text-yellow-400 font-medium">{game.rewards.coins}</span> coins
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-cyan-400" />
                    <span className="text-white/60 text-sm">
                      <span className="text-cyan-400 font-medium">{game.rewards.xp}</span> XP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            <Gamepad2 size={18} />
            Start Playing
          </Link>
        </div>
      </div>
    </main>
  );
}

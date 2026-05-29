'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import LauncherHeader from '@/components/launcher/LauncherHeader';
import GameCard from '@/components/launcher/GameCard';
import LoadingScreen from '@/components/shared/LoadingScreen';
import { WheelIcon, MemoryIcon, PuzzleIcon, WordSearchIcon, PacmanIcon, ScratchIcon } from '@/components/shared/GameIcons';
import { Sparkles, Trophy, Coins, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GameInfo } from '@/lib/types';

// Create Supabase client for realtime
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Game settings type
interface GameSetting {
  id: number;
  game_key: string;
  game_name: string;
  is_active: boolean;
  sort_order: number;
}

// Game information data
const GAME_INFO: Record<string, GameInfo> = {
  wheel: {
    howToPlay: [
      'Tap the spin button to start the wheel',
      'Wait for the wheel to stop spinning',
      'Win the prize where the pointer lands',
      'You can spin once per day for free'
    ],
    rewards: { coins: { min: 50, max: 500 }, xp: { min: 50, max: 50000 } },
    features: ['Daily Free Spin', 'Multiple Prizes', 'Instant Rewards']
  },
  memory: {
    howToPlay: [
      'Choose a difficulty level',
      'Memorize card positions during preview',
      'Flip cards to find matching pairs',
      'Match all pairs before time runs out'
    ],
    rewards: { coins: { min: 50, max: 500 }, xp: { min: 50, max: 200 } },
    difficulties: ['Easy', 'Medium', 'Hard'],
    features: ['Time Challenge', 'Multiple Difficulties', 'Time-Based Rewards']
  },
  puzzle: {
    howToPlay: [
      'Select your preferred difficulty',
      'Study the complete image during preview',
      'Drag and drop pieces to solve the puzzle',
      'Complete faster for better rewards'
    ],
    rewards: { coins: { min: 50, max: 500 }, xp: { min: 50, max: 200 } },
    difficulties: ['Easy', 'Medium', 'Hard'],
    features: ['Beautiful Images', 'Drag & Drop', 'Time-Based Rewards']
  },
  wordsearch: {
    howToPlay: [
      'Pick a difficulty level',
      'Find all hidden words in the grid',
      'Drag to select words horizontally, vertically, or diagonally',
      'Find all words before time expires'
    ],
    rewards: { coins: { min: 50, max: 500 }, xp: { min: 50, max: 200 } },
    difficulties: ['Easy', 'Medium', 'Hard'],
    features: ['Word Lists', 'Multiple Directions', 'Time-Based Rewards']
  },
  pacman: {
    howToPlay: [
      'Choose a difficulty level',
      'Use arrow keys or swipe to move Pac-Man',
      'Eat all dots while avoiding ghosts',
      'Grab power pellets to eat ghosts!'
    ],
    rewards: { coins: { min: 50, max: 500 }, xp: { min: 50, max: 100 } },
    difficulties: ['Easy', 'Medium', 'Hard'],
    features: ['Classic Arcade', 'Ghost Chase', 'Power-Ups']
  }
};

// Game config for rendering
const GAME_CONFIG: Record<string, {
  icon: (size: number) => React.ReactNode;
  route: string;
  gradient: string;
  descriptionShort: string;
  descriptionLong: string;
  comingSoon?: boolean;
}> = {
  wheel: {
    icon: (size) => <WheelIcon size={size} />,
    route: '/wheel',
    gradient: 'from-amber-500/30 to-orange-600/30',
    descriptionShort: 'Spin to win coins and XP!',
    descriptionLong: 'Spin the lucky wheel and win coins, XP, and exclusive rewards!',
  },
  memory: {
    icon: (size) => <MemoryIcon size={size} />,
    route: '/memory',
    gradient: 'from-purple-500/30 to-indigo-600/30',
    descriptionShort: 'Match pairs before time runs out',
    descriptionLong: 'Test your memory! Flip cards and match pairs before time runs out.',
  },
  puzzle: {
    icon: (size) => <PuzzleIcon size={size} />,
    route: '/puzzle',
    gradient: 'from-rose-500/30 to-pink-600/30',
    descriptionShort: 'Solve image puzzles fast',
    descriptionLong: 'Piece together beautiful images and challenge your puzzle skills!',
  },
  wordsearch: {
    icon: (size) => <WordSearchIcon size={size} />,
    route: '/wordsearch',
    gradient: 'from-cyan-500/30 to-blue-600/30',
    descriptionShort: 'Find hidden words in grid',
    descriptionLong: 'Find hidden words in the grid! Search horizontally, vertically, and diagonally.',
  },
  pacman: {
    icon: (size) => <PacmanIcon size={size} />,
    route: '/pacman',
    gradient: 'from-yellow-400/30 to-orange-500/30',
    descriptionShort: 'Eat dots, avoid ghosts!',
    descriptionLong: 'Classic arcade fun! Eat dots, avoid ghosts, and grab power-ups to win!',
  },
  scratch: {
    icon: (size) => <ScratchIcon size={size} />,
    route: '#',
    gradient: 'from-emerald-500/30 to-teal-600/30',
    descriptionShort: 'Coming soon!',
    descriptionLong: 'Coming soon - Scratch to reveal hidden prizes and instant wins!',
    comingSoon: true,
  },
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [gameSettings, setGameSettings] = useState<GameSetting[]>([
    // Default fallback - will be overwritten by API if available
    { id: 1, game_key: 'wheel', game_name: 'Wheel of Fortune', is_active: true, sort_order: 1 },
    { id: 2, game_key: 'memory', game_name: 'Memory Match', is_active: true, sort_order: 2 },
    { id: 3, game_key: 'puzzle', game_name: 'Puzzle Challenge', is_active: true, sort_order: 3 },
    { id: 4, game_key: 'wordsearch', game_name: 'Word Search', is_active: true, sort_order: 4 },
    { id: 5, game_key: 'pacman', game_name: 'Pac-Man', is_active: true, sort_order: 5 },
    { id: 6, game_key: 'scratch', game_name: 'Scratch Cards', is_active: false, sort_order: 6 },
  ]);
  const { isLoading: authLoading } = useAuth();

  useEffect(() => {
    const fetchGameSettings = async () => {
      try {
        // Add timestamp to bust any caching
        const res = await fetch(`/api/games/settings?t=${Date.now()}`, { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        const data = await res.json();
        if (data.settings && Array.isArray(data.settings) && data.settings.length > 0) {
          console.log('Loaded game settings from API:', data.settings);
          setGameSettings(data.settings);
        } else {
          console.log('API returned no settings, using defaults');
        }
      } catch (error) {
        console.error('Error fetching game settings:', error);
      }
    };

    fetchGameSettings();

    // Subscribe to realtime updates on game_settings table
    const channel = supabase
      .channel('game_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_settings'
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          // Refetch all settings when any change occurs
          fetchGameSettings();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!authLoading) {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  if (isLoading || authLoading) {
    return <LoadingScreen message="Loading games..." />;
  }

  // Helper to check if a game is active
  const isGameActive = (gameKey: string) => {
    const setting = gameSettings.find(g => g.game_key === gameKey);
    return setting ? setting.is_active : true;
  };

  // Get sorted games: Active first, then Locked, then Coming Soon
  const sortedGames = [...gameSettings].sort((a, b) => {
    const configA = GAME_CONFIG[a.game_key];
    const configB = GAME_CONFIG[b.game_key];
    
    const isComingSoonA = configA?.comingSoon || false;
    const isComingSoonB = configB?.comingSoon || false;
    
    // Priority: Active (0), Locked (1), Coming Soon (2)
    const getPriority = (game: GameSetting, isComingSoon: boolean) => {
      if (isComingSoon) return 2;
      if (!game.is_active) return 1;
      return 0;
    };
    
    const priorityA = getPriority(a, isComingSoonA);
    const priorityB = getPriority(b, isComingSoonB);
    
    if (priorityA !== priorityB) return priorityA - priorityB;
    return a.sort_order - b.sort_order;
  });

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-6">
      {/* Mobile Layout */}
      <div className="w-full max-w-[420px] lg:hidden">
        <LauncherHeader />
        
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="text-yellow-400" size={24} />
            <h1 className="text-2xl font-bold text-white">Play & Win</h1>
            <Sparkles className="text-yellow-400" size={24} />
          </div>
          <p className="text-white/60 text-sm">Spin, match, and win amazing prizes!</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {sortedGames.map((game) => {
            const config = GAME_CONFIG[game.game_key];
            if (!config) return null;
            
            const isActive = game.is_active;
            const isComingSoon = config.comingSoon || false;
            
            return (
              <GameCard
                key={game.game_key}
                title={game.game_name.replace(' Match', '').replace(' of Fortune', '').replace(' Challenge', '').replace(' Cards', '')}
                description={isComingSoon ? 'Coming soon!' : config.descriptionShort}
                icon={config.icon(36)}
                route={isActive && !isComingSoon ? config.route : '#'}
                gradient={config.gradient}
                gameInfo={!isComingSoon ? GAME_INFO[game.game_key] : undefined}
                disabled={!isActive || isComingSoon}
                comingSoon={isComingSoon}
              />
            );
          })}
        </div>
        
        {/* Saraya Apps Footer */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-3 text-center">Saraya Apps</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
            <a href="https://hs.saraya.solutions/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition">Saraya Connect</a>
            <a href="https://rewards.saraya.solutions/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition">Rewards Center</a>
            <a href="https://quiz.saraya.solutions/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition">Quiz</a>
            <a href="https://bihdiscovery.com/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition">Explore Sarajevo</a>
            <a href="https://pametnoodabrano.com/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition">Pametno Odabrano</a>
          </div>
          <p className="text-center text-white/30 text-xs mt-4">© 2026 Saraya Solutions</p>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-col w-full max-w-6xl">
        <LauncherHeader />
        
        <div className="text-center mb-12 mt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="text-yellow-400" size={40} />
            <h1 className="text-5xl font-bold text-white">Play & Win</h1>
            <Sparkles className="text-yellow-400" size={40} />
          </div>
          <p className="text-white/60 text-lg max-w-md mx-auto">
            Spin, match, and win amazing prizes! Choose your game and start winning.
          </p>
        </div>

        <div className="flex items-center justify-center gap-8 mb-12">
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
            <Trophy className="text-yellow-400" size={24} />
            <div>
              <p className="text-white/50 text-xs">Total Games</p>
              <p className="text-white font-bold text-lg">6</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
            <Coins className="text-yellow-400" size={24} />
            <div>
              <p className="text-white/50 text-xs">Max Coins</p>
              <p className="text-white font-bold text-lg">3000+</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
            <Zap className="text-cyan-400" size={24} />
            <div>
              <p className="text-white/50 text-xs">Max XP</p>
              <p className="text-white font-bold text-lg">5000+</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {sortedGames.map((game) => {
            const config = GAME_CONFIG[game.game_key];
            if (!config) return null;
            
            const isActive = game.is_active;
            const isComingSoon = config.comingSoon || false;
            
            return (
              <GameCard
                key={game.game_key}
                title={game.game_name}
                description={isComingSoon ? 'Coming soon - Scratch to reveal hidden prizes and instant wins!' : config.descriptionLong}
                icon={config.icon(40)}
                route={isActive && !isComingSoon ? config.route : '#'}
                gradient={config.gradient}
                gameInfo={!isComingSoon ? GAME_INFO[game.game_key] : undefined}
                disabled={!isActive || isComingSoon}
                comingSoon={isComingSoon}
              />
            );
          })}
        </div>

        {/* Saraya Apps Footer */}
        <div className="mt-auto pt-8 border-t border-white/10">
          <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-4 text-center">Saraya Apps</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm mb-6">
            <a href="https://hs.saraya.solutions/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition">Saraya Connect</a>
            <a href="https://rewards.saraya.solutions/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition">Rewards Center</a>
            <a href="https://quiz.saraya.solutions/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition">Quiz</a>
            <a href="https://bihdiscovery.com/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition">Explore Sarajevo</a>
            <a href="https://pametnoodabrano.com/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition">Pametno Odabrano</a>
          </div>
          <p className="text-white/30 text-sm text-center">© 2026 Saraya Solutions. All rights reserved.</p>
        </div>
      </div>
    </main>
  );
}

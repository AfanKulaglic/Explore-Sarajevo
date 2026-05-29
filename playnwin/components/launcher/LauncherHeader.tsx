'use client';

import { useState, useEffect } from 'react';
import { Menu, User, LogOut, Coins, Sparkles, Gem, ChevronDown, Trophy, Star, X, Gamepad2, Info, HelpCircle, Settings, ExternalLink, Lock, Gift, Brain, MapPin, ShoppingBag, Wifi } from 'lucide-react';

// Saraya ecosystem app links (excluding current app - Game-Launcher/Play & Win)
const SARAYA_APPS = [
  { name: 'Saraya Connect', href: 'https://hs.saraya.solutions/', icon: Wifi, color: 'from-blue-500 to-cyan-500' },
  { name: 'Rewards Center', href: 'https://rewards.saraya.solutions/', icon: Gift, color: 'from-amber-500 to-orange-500' },
  { name: 'Quiz', href: 'https://quiz.saraya.solutions/', icon: Brain, color: 'from-violet-500 to-purple-500' },
  { name: 'Explore Sarajevo', href: 'https://bihdiscovery.com/', icon: MapPin, color: 'from-emerald-500 to-teal-500' },
  { name: 'Pametno Odabrano', href: 'https://pametnoodabrano.com/', icon: ShoppingBag, color: 'from-orange-500 to-amber-500' },
];
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/shared/AuthModal';

// Format large numbers with k/m suffixes
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  }
  if (num >= 10000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toLocaleString();
};

interface GameSetting {
  id: number;
  game_key: string;
  game_name: string;
  is_active: boolean;
  sort_order: number;
}

// Game config for menu
const MENU_GAMES: Record<string, { emoji: string; description: string; route: string; comingSoon?: boolean }> = {
  wheel: { emoji: '🎡', description: 'Spin to win prizes', route: '/wheel' },
  memory: { emoji: '🧠', description: 'Match pairs to win', route: '/memory' },
  puzzle: { emoji: '🧩', description: 'Piece together images', route: '/puzzle' },
  wordsearch: { emoji: '🔍', description: 'Find hidden words', route: '/wordsearch' },
  pacman: { emoji: '👾', description: 'Eat dots, avoid ghosts', route: '/pacman' },
  scratch: { emoji: '🎰', description: 'Coming soon', route: '#', comingSoon: true },
};

export default function LauncherHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSetting[]>([
    { id: 1, game_key: 'wheel', game_name: 'Wheel of Fortune', is_active: true, sort_order: 1 },
    { id: 2, game_key: 'memory', game_name: 'Memory Match', is_active: true, sort_order: 2 },
    { id: 3, game_key: 'puzzle', game_name: 'Puzzle Challenge', is_active: true, sort_order: 3 },
    { id: 4, game_key: 'wordsearch', game_name: 'Word Search', is_active: true, sort_order: 4 },
    { id: 5, game_key: 'pacman', game_name: 'Pac-Man', is_active: true, sort_order: 5 },
    { id: 6, game_key: 'scratch', game_name: 'Scratch Cards', is_active: false, sort_order: 6 },
  ]);

  useEffect(() => {
    const fetchGameSettings = async () => {
      try {
        const res = await fetch(`/api/games/settings?t=${Date.now()}`, { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        const data = await res.json();
        if (data.settings && Array.isArray(data.settings) && data.settings.length > 0) {
          setGameSettings(data.settings);
        }
      } catch (error) {
        console.error('Error fetching game settings:', error);
      }
    };
    fetchGameSettings();
  }, []);

  // Sort games: Active first, then Locked, then Coming Soon
  const sortedGames = [...gameSettings].sort((a, b) => {
    const configA = MENU_GAMES[a.game_key];
    const configB = MENU_GAMES[b.game_key];
    
    const isComingSoonA = configA?.comingSoon || false;
    const isComingSoonB = configB?.comingSoon || false;
    
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

  // Calculate level progress (example: 1000 XP per level)
  const xpPerLevel = 1000;
  const currentLevelXp = user ? user.xp % xpPerLevel : 0;
  const levelProgress = user ? (currentLevelXp / xpPerLevel) * 100 : 0;

  const handleOpenMenu = () => {
    setIsMenuVisible(true);
    setIsMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
    setTimeout(() => setIsMenuVisible(false), 400);
  };

  return (
    <>
      <header className="flex items-center justify-between w-full mb-8">
        <button 
          onClick={handleOpenMenu}
          className="text-white/70 p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10"
        >
          <Menu size={20} />
        </button>
        
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-white font-medium text-sm max-w-[100px] truncate">{user.name}</span>
              <ChevronDown size={16} className={`text-white/60 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden shadow-2xl z-50 border border-white/10 bg-gradient-to-b from-[#1a1030] to-[#0d0620]">
                  {/* Profile Header with gradient background */}
                  <div className="relative p-5 bg-gradient-to-br from-purple-600/30 to-pink-600/30">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-50" />
                    <div className="relative flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ring-4 ring-white/20">
                          <User size={28} className="text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                          {user.level}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-lg truncate">{user.name}</p>
                        <p className="text-white/60 text-sm truncate">{user.email}</p>
                        {/* Level progress bar */}
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-white/50">Level {user.level}</span>
                            <span className="text-white/50">{currentLevelXp}/{xpPerLevel} XP</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                              style={{ width: `${levelProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                        <Coins size={20} className="text-yellow-400 mx-auto mb-1" />
                        <p className="text-yellow-400 font-bold text-lg">{formatNumber(user.coins)}</p>
                        <p className="text-white/40 text-xs">Coins</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                        <Gem size={20} className="text-purple-400 mx-auto mb-1" />
                        <p className="text-purple-400 font-bold text-lg">{formatNumber(user.tokens)}</p>
                        <p className="text-white/40 text-xs">Tokens</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                        <Sparkles size={20} className="text-cyan-400 mx-auto mb-1" />
                        <p className="text-cyan-400 font-bold text-lg">{formatNumber(user.xp)}</p>
                        <p className="text-white/40 text-xs">XP</p>
                      </div>
                    </div>

                    {/* Saraya Apps Navigation */}
                    <div className="mb-4">
                      <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-2">Saraya Apps</p>
                      <div className="space-y-1">
                        {SARAYA_APPS.map((app) => (
                          <a
                            key={app.name}
                            href={app.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsProfileOpen(false)}
                            className="group flex items-center gap-3 px-2 py-2 rounded-xl transition hover:bg-white/10"
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${app.color} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                              <app.icon size={16} className="text-white" />
                            </div>
                            <span className="text-sm font-medium text-white/70 group-hover:text-white">
                              {app.name}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Sign Out Button */}
                    <button
                      onClick={() => { logout(); setIsProfileOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200 border border-red-500/20"
                    >
                      <LogOut size={18} />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium text-sm hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            <User size={16} />
            Sign In
          </button>
        )}
      </header>

      {/* Sidebar Menu */}
      {isMenuVisible && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-400 ease-out ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleCloseMenu} 
          />
          
          {/* Sidebar Panel */}
          <div 
            className={`absolute left-0 top-0 h-full w-[300px] max-w-[85vw] bg-gradient-to-b from-[#2a1f4e] to-[#0d0620] border-r border-white/10 shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-purple-400" />
                <h2 className="text-white font-bold text-lg">Play & Win</h2>
              </div>
              <button onClick={handleCloseMenu} className="text-white/60 hover:text-white p-1 hover:rotate-90 transition-all duration-200">
                <X size={20} />
              </button>
            </div>
            
            {/* Menu Content */}
            <div className="p-4 space-y-2">
              {/* Games Section */}
              <div className="mb-4">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2 px-2">Games</p>
                {sortedGames.map((game) => {
                  const config = MENU_GAMES[game.game_key];
                  if (!config) return null;
                  
                  const isActive = game.is_active;
                  const isComingSoon = config.comingSoon || false;
                  const isDisabled = !isActive || isComingSoon;
                  
                  if (isDisabled) {
                    return (
                      <div key={game.game_key} className="flex items-center gap-3 p-3 rounded-xl opacity-50 cursor-not-allowed">
                        <span className="text-2xl">{config.emoji}</span>
                        <div className="flex-1">
                          <p className="text-white font-medium">{game.game_name}</p>
                          <p className="text-white/40 text-xs">{isComingSoon ? 'Coming soon' : 'Currently unavailable'}</p>
                        </div>
                        {!isComingSoon && <Lock size={16} className="text-white/40" />}
                      </div>
                    );
                  }
                  
                  return (
                    <a key={game.game_key} href={config.route} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <span className="text-2xl">{config.emoji}</span>
                      <div>
                        <p className="text-white font-medium group-hover:text-purple-400 transition-colors">{game.game_name}</p>
                        <p className="text-white/40 text-xs">{config.description}</p>
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 my-4" />

              {/* Info Section */}
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2 px-2">Info</p>
                <a href="/how-to-play" className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <HelpCircle size={20} className="text-white/60 group-hover:text-purple-400 transition-colors" />
                  <span className="text-white font-medium group-hover:text-purple-400 transition-colors">How to Play</span>
                </a>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group opacity-50 cursor-not-allowed">
                  <Trophy size={20} className="text-white/60" />
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">Leaderboard</span>
                    <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded">Soon</span>
                  </div>
                </button>
                <a href="/about" className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <Info size={20} className="text-white/60 group-hover:text-cyan-400 transition-colors" />
                  <span className="text-white font-medium group-hover:text-cyan-400 transition-colors">About</span>
                </a>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 my-4" />

              {/* Saraya Apps Section */}
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2 px-2">Saraya Apps</p>
                {SARAYA_APPS.map((app) => (
                  <a 
                    key={app.name}
                    href={app.href} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <app.icon size={20} className="text-white/60 group-hover:text-purple-400 transition-colors" />
                    <span className="text-white font-medium group-hover:text-purple-400 transition-colors">{app.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
              <a 
                href="https://sarayasolutions.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-white/40 hover:text-white/60 transition-colors text-sm"
              >
                <span>© 2026 Saraya Solutions</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}

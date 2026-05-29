'use client';

import { ArrowLeft, Gamepad2, Heart, Shield, Gift, Users, Globe, Sparkles, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
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
              <Sparkles className="text-purple-400" />
              About Play & Win
            </h1>
            <p className="text-white/60 text-sm">Learn more about our gaming platform</p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-2xl p-8 border border-white/10 mb-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <Gamepad2 size={40} className="text-purple-400" />
              <h2 className="text-3xl font-bold text-white">Play & Win</h2>
            </div>
            <p className="text-white/80 text-lg max-w-2xl">
              A fun and rewarding gaming experience brought to you by Saraya Solutions. 
              Play exciting games, earn coins, and redeem amazing rewards!
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <Gift className="text-yellow-400 mb-3" size={28} />
            <h3 className="text-white font-bold text-lg mb-2">Earn Real Rewards</h3>
            <p className="text-white/60">
              Win Saraya Coins by playing games and use them to redeem real rewards, 
              discounts, and exclusive offers across all Saraya platforms.
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <Users className="text-blue-400 mb-3" size={28} />
            <h3 className="text-white font-bold text-lg mb-2">Unified Account</h3>
            <p className="text-white/60">
              Your Play & Win account is connected to the Saraya ecosystem. 
              Earn rewards here and spend them on Quiz, Rewards Center, and more!
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <Shield className="text-green-400 mb-3" size={28} />
            <h3 className="text-white font-bold text-lg mb-2">Fair & Secure</h3>
            <p className="text-white/60">
              All games are designed to be fair and fun. Your data is secure 
              and your rewards are guaranteed when you win.
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <Globe className="text-purple-400 mb-3" size={28} />
            <h3 className="text-white font-bold text-lg mb-2">Play Anywhere</h3>
            <p className="text-white/60">
              Access Play & Win from any device - mobile, tablet, or desktop. 
              Your progress syncs automatically across all your devices.
            </p>
          </div>
        </div>

        {/* Games Available */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
          <h3 className="text-white font-bold text-lg mb-4">Games Available</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <Link href="/wheel" className="text-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
              <span className="text-3xl block mb-2">🎡</span>
              <p className="text-white/80 text-sm group-hover:text-purple-400 transition-colors">Wheel of Fortune</p>
            </Link>
            <Link href="/memory" className="text-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
              <span className="text-3xl block mb-2">🧠</span>
              <p className="text-white/80 text-sm group-hover:text-purple-400 transition-colors">Memory Match</p>
            </Link>
            <Link href="/puzzle" className="text-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
              <span className="text-3xl block mb-2">🧩</span>
              <p className="text-white/80 text-sm group-hover:text-purple-400 transition-colors">Puzzle</p>
            </Link>
            <Link href="/wordsearch" className="text-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
              <span className="text-3xl block mb-2">🔤</span>
              <p className="text-white/80 text-sm group-hover:text-purple-400 transition-colors">Word Search</p>
            </Link>
            <Link href="/pacman" className="text-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
              <span className="text-3xl block mb-2">👾</span>
              <p className="text-white/80 text-sm group-hover:text-purple-400 transition-colors">Pac-Man</p>
            </Link>
          </div>
        </div>

        {/* Saraya Ecosystem */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-white/10 mb-8">
          <h3 className="text-white font-bold text-lg mb-4">Part of the Saraya Ecosystem</h3>
          <p className="text-white/60 mb-4">
            Play & Win is one of many exciting platforms in the Saraya ecosystem. 
            Your Saraya account gives you access to:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a 
              href="https://quiz.saraya.solutions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <span className="text-2xl">📝</span>
              <div className="flex-1">
                <p className="text-white font-medium group-hover:text-purple-400 transition-colors">Saraya Quiz</p>
                <p className="text-white/50 text-sm">Test your knowledge, win coins</p>
              </div>
              <ExternalLink size={16} className="text-white/30" />
            </a>
            <a 
              href="https://rewards.saraya.solutions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <span className="text-2xl">🎁</span>
              <div className="flex-1">
                <p className="text-white font-medium group-hover:text-purple-400 transition-colors">Rewards Center</p>
                <p className="text-white/50 text-sm">Redeem coins for prizes</p>
              </div>
              <ExternalLink size={16} className="text-white/30" />
            </a>
            <a 
              href="https://bihdiscovery.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <span className="text-2xl">🏛️</span>
              <div className="flex-1">
                <p className="text-white font-medium group-hover:text-purple-400 transition-colors">Explore Sarajevo</p>
                <p className="text-white/50 text-sm">Discover local attractions</p>
              </div>
              <ExternalLink size={16} className="text-white/30" />
            </a>
            <a 
              href="https://pametnoodabrano.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <span className="text-2xl">🛒</span>
              <div className="flex-1">
                <p className="text-white font-medium group-hover:text-purple-400 transition-colors">Pametno Odabrano</p>
                <p className="text-white/50 text-sm">Smart shopping choices</p>
              </div>
              <ExternalLink size={16} className="text-white/30" />
            </a>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Heart className="text-pink-400" />
            Made with Love by Saraya Solutions
          </h3>
          <p className="text-white/60 mb-4">
            We're passionate about creating fun and rewarding experiences. 
            Have feedback or questions? We'd love to hear from you!
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href="mailto:support@sarayasolutions.com"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/80"
            >
              <Mail size={16} />
              support@sarayasolutions.com
            </a>
            <a 
              href="https://sarayasolutions.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/80"
            >
              <Globe size={16} />
              sarayasolutions.com
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-white/40 text-sm">
          <p>© 2026 Saraya Solutions. All rights reserved.</p>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            <Gamepad2 size={18} />
            Back to Games
          </Link>
        </div>
      </div>
    </main>
  );
}

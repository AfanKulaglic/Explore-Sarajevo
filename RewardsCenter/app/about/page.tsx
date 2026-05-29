import React from "react";
import Image from "next/image";
import { FaTrophy, FaUsers, FaGift, FaGamepad, FaHeart, FaLightbulb, FaHandshake, FaStar } from "react-icons/fa";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-900 via-violet-900 to-slate-900 text-white py-16 md:py-24 rounded-3xl mb-8">
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            About Saraya Rewards Center
          </h1>
          <p className="text-lg md:text-xl text-white/70">
            Your gateway to rewards, achievements, and exclusive benefits
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 pb-16 space-y-8">
        {/* Our Mission */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            Our Mission
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            Saraya Rewards Center is the central hub for earning and redeeming rewards across the entire Saraya ecosystem. We make everyday activities more rewarding by connecting you to our network of apps, games, and experiences.
          </p>
          <p className="text-white/70 leading-relaxed">
            Whether you're answering quiz questions, exploring Sarajevo, making smart shopping decisions, or participating in community events, every action can earn you valuable points redeemable for real rewards.
          </p>
        </div>

        {/* What is Rewards Center */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            What is Saraya Rewards Center?
          </h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Saraya Rewards Center is a unified platform that tracks your activity across all Saraya applications and rewards you for your engagement. Here's what you can do:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                <FaTrophy className="text-brand-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Earn Points</h3>
                <p className="text-white/60 text-sm">Complete activities across connected apps to accumulate points</p>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <FaGift className="text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Redeem Rewards</h3>
                <p className="text-white/60 text-sm">Exchange your points for vouchers, discounts, and exclusive prizes</p>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <FaStar className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Unlock Achievements</h3>
                <p className="text-white/60 text-sm">Complete challenges and earn badges for special accomplishments</p>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <FaUsers className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Compete & Socialize</h3>
                <p className="text-white/60 text-sm">Join leaderboards, compete with friends, and climb the ranks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Apps */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            Connected Applications
          </h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Earn rewards by using any of these Saraya applications:
          </p>
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <FaGamepad className="text-white text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Saraya Quiz</h3>
                <p className="text-white/60 text-sm">Test your knowledge and earn points for correct answers</p>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <FaLightbulb className="text-white text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Pametno Odabrano</h3>
                <p className="text-white/60 text-sm">Make smart shopping decisions and get rewarded</p>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <FaHeart className="text-white text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Explore Sarajevo</h3>
                <p className="text-white/60 text-sm">Discover the city and earn rewards for exploring locations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-4">
                <FaHeart className="text-brand-400 text-2xl" />
              </div>
              <h3 className="font-semibold text-white mb-2">Community First</h3>
              <p className="text-white/60 text-sm">Building a thriving community where everyone benefits</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <FaHandshake className="text-purple-400 text-2xl" />
              </div>
              <h3 className="font-semibold text-white mb-2">Transparency</h3>
              <p className="text-white/60 text-sm">Clear rules, fair rewards, and honest communication</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <FaStar className="text-green-400 text-2xl" />
              </div>
              <h3 className="font-semibold text-white mb-2">Quality</h3>
              <p className="text-white/60 text-sm">Premium rewards and exceptional user experience</p>
            </div>
          </div>
        </div>

        {/* About Saraya */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            About Saraya Solutions
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            Saraya Solutions is a technology company based in Bosnia and Herzegovina, dedicated to creating innovative digital solutions that enhance everyday life. From smart shopping assistance to city exploration and gamified learning, we're building an ecosystem of connected applications.
          </p>
          <p className="text-white/70 leading-relaxed">
            Rewards Center is our way of giving back to our community - rewarding users for engaging with our platforms and making their digital experiences more valuable.
          </p>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-br from-brand-600/20 to-violet-600/20 backdrop-blur-sm rounded-2xl border border-brand-500/20 p-6 md:p-8 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            Have Questions?
          </h2>
          <p className="text-white/70 leading-relaxed mb-6">
            We'd love to hear from you! Whether you have feedback, questions, or just want to say hello, our team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}

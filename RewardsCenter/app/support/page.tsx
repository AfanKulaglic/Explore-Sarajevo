'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Book,
  HelpCircle,
  Mail,
  ChevronDown,
  Zap,
  CreditCard,
  Gift,
  Shield,
  Truck,
  Users,
  Send,
} from 'lucide-react';

const categories = [
  { id: 'getting-started', label: 'Getting Started', icon: Zap, color: 'from-amber-500 to-orange-500' },
  { id: 'earning-coins', label: 'Earning Coins', icon: CreditCard, color: 'from-emerald-500 to-teal-500' },
  { id: 'redeeming-rewards', label: 'Redeeming Rewards', icon: Gift, color: 'from-pink-500 to-rose-500' },
  { id: 'account-security', label: 'Account & Security', icon: Shield, color: 'from-blue-500 to-cyan-500' },
  { id: 'shipping', label: 'Shipping & Delivery', icon: Truck, color: 'from-violet-500 to-purple-500' },
  { id: 'community', label: 'Community & Social', icon: Users, color: 'from-red-500 to-orange-500' },
];

const faqs = [
  {
    category: 'getting-started',
    question: 'How do I create an account?',
    answer: 'Creating an account is easy! Click the "Sign Up" button on the top right corner of the page. You can register using your email address or connect with your Google, Discord, or social media accounts. Once registered, you\'ll receive a welcome bonus of 500 coins!',
  },
  {
    category: 'getting-started',
    question: 'What are Saraya Coins?',
    answer: 'Saraya Coins are our virtual currency that you can earn through various activities and redeem for exciting rewards. 1 Saraya Coin equals approximately $0.01 in reward value. You can earn coins by completing tasks, participating in tournaments, referring friends, and more!',
  },
  {
    category: 'earning-coins',
    question: 'How can I earn more coins?',
    answer: 'There are multiple ways to earn coins: Complete daily tasks and challenges, participate in tournaments, refer friends (earn 1000 coins per referral), watch sponsored content, follow our social media channels, maintain a daily login streak, and purchase coin packages directly.',
  },
  {
    category: 'earning-coins',
    question: 'Do coins expire?',
    answer: 'No, your earned coins never expire! However, promotional bonus coins from special events may have an expiration date, which will always be clearly communicated when you receive them.',
  },
  {
    category: 'redeeming-rewards',
    question: 'How do I redeem a reward?',
    answer: 'Browse our catalog and find a reward you\'d like. Click on the item to view details, select your quantity, and click "Redeem". If you have enough coins, the order will be processed immediately. You\'ll receive a confirmation email with tracking details for physical items.',
  },
  {
    category: 'redeeming-rewards',
    question: 'Can I cancel a redemption?',
    answer: 'Digital rewards cannot be cancelled once redeemed. For physical items, you can cancel within 24 hours of placing the order if it hasn\'t been shipped yet. Contact our support team immediately if you need to cancel.',
  },
  {
    category: 'account-security',
    question: 'How do I secure my account?',
    answer: 'We recommend enabling two-factor authentication (2FA) in your account settings. Use a strong, unique password and never share your login credentials. We\'ll never ask for your password via email or chat.',
  },
  {
    category: 'account-security',
    question: 'What if I forgot my password?',
    answer: 'Click "Forgot Password" on the login page and enter your registered email. You\'ll receive a password reset link within minutes. If you don\'t receive it, check your spam folder or contact support.',
  },
  {
    category: 'shipping',
    question: 'How long does shipping take?',
    answer: 'Shipping times vary by location. Domestic orders typically arrive in 5-7 business days. International orders may take 2-4 weeks. Digital rewards are delivered instantly to your email.',
  },
  {
    category: 'shipping',
    question: 'Do you ship internationally?',
    answer: 'Yes! We ship to most countries worldwide. Shipping costs and times vary by destination. Some items may have shipping restrictions based on local regulations.',
  },
  {
    category: 'community',
    question: 'How do referrals work?',
    answer: 'Share your unique referral link with friends. When they sign up and make their first redemption, you\'ll both receive 1000 bonus coins! There\'s no limit to how many friends you can refer.',
  },
  {
    category: 'community',
    question: 'How do I join tournaments?',
    answer: 'Check the Tournaments page for upcoming events. Click on any tournament to see entry requirements and prizes. Some tournaments are free to enter, while others may require an entry fee in coins.',
  },
];

export default function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === null || faq.category === selectedCategory;
    return matchesCategory;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-brand-600/30 via-violet-600/20 to-slate-900/50 p-4 sm:p-8 backdrop-blur-2xl"
      >
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-violet-500/20 blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500">
              <HelpCircle size={20} className="text-white sm:hidden" />
              <HelpCircle size={24} className="text-white hidden sm:block" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Support Center</h1>
          </div>
          <p className="text-sm sm:text-base text-white/60 max-w-2xl">
            Find answers to common questions, browse our guides, or get in touch with our support team.
          </p>
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="mb-4 text-lg font-semibold text-white">Browse by Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                className={`group relative flex flex-col items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border p-2.5 sm:p-4 transition ${
                  isSelected
                    ? 'border-brand-500/50 bg-brand-500/10'
                    : 'border-white/10 bg-slate-950/40 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <div className={`flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br ${category.color}`}>
                  <Icon size={18} className="text-white sm:hidden" />
                  <Icon size={22} className="text-white hidden sm:block" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-white/80 text-center leading-tight">{category.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* FAQs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                <Book size={18} className="text-white" />
              </div>
              <h2 className="text-lg font-semibold text-white">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-3">
              {filteredFaqs.length === 0 ? (
                <div className="py-12 text-center">
                  <HelpCircle size={48} className="mx-auto mb-4 text-white/20" />
                  <p className="text-white/60">No results found for your search.</p>
                  <p className="text-sm text-white/40 mt-1">Try different keywords or browse categories.</p>
                </div>
              ) : (
                filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={false}
                    className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="flex w-full items-center justify-between p-4 text-left"
                    >
                      <span className="font-medium text-white pr-4">{faq.question}</span>
                      <motion.div
                        animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={18} className="text-white/40" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {expandedFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-4 pb-4 text-sm text-white/60 leading-relaxed">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Contact Support */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500">
                <MessageCircle size={18} className="text-white" />
              </div>
              <h3 className="font-semibold text-white">Contact Support</h3>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder="Your name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-brand-500/50"
              />
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="Your email"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-brand-500/50"
              />
              <input
                type="text"
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                placeholder="Subject"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-brand-500/50"
              />
              <textarea
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="Describe your issue..."
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-brand-500/50 resize-none"
              />
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-sm font-semibold text-white transition hover:from-brand-600 hover:to-brand-700">
                <Send size={16} />
                Send Message
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-white/40">
              <Mail size={14} />
              <span>Or email us at support@saraya.com</span>
            </div>
          </div>

          {/* Live Chat - Commented out for future use
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 p-6 backdrop-blur-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">Support Online</span>
            </div>
            <h3 className="font-semibold text-white mb-2">Live Chat Available</h3>
            <p className="text-sm text-white/60 mb-4">Get instant help from our support team.</p>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600">
              <MessageCircle size={16} />
              Start Chat
            </button>
          </div>
          */}
        </motion.div>
      </div>
    </div>
  );
}

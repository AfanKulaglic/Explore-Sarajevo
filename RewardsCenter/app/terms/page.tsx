import React from "react";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-900 via-violet-900 to-slate-900 text-white py-16 md:py-24 rounded-3xl mb-8">
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Terms of Service
          </h1>
          <p className="text-lg md:text-xl text-white/70">
            Rules and guidelines for using Saraya Rewards Center
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 pb-16 space-y-8">
        {/* Acceptance */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            1. Acceptance of Terms
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            Welcome to <span className="font-semibold text-white">Saraya Rewards Center</span>. By using our website and related services (the "platform"), you accept these Terms of Service. If you do not agree with these terms, please do not use the platform.
          </p>
          <p className="text-white/70 leading-relaxed">
            Saraya Rewards Center is developed and maintained by <span className="font-semibold text-white">Saraya Solutions</span> from Sarajevo. These terms apply to all users of the platform.
          </p>
        </div>

        {/* What is Saraya Rewards */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            2. What is Saraya Rewards Center
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            Saraya Rewards Center is a digital rewards platform that allows users to:
          </p>
          <ul className="list-disc list-inside text-white/70 space-y-1 mb-4">
            <li>
              <span className="font-semibold text-white">Earn Coins</span> – accumulate virtual currency through activities across Saraya platforms
            </li>
            <li>
              <span className="font-semibold text-white">Redeem Rewards</span> – exchange coins for physical and digital rewards
            </li>
            <li>
              <span className="font-semibold text-white">Compete</span> – participate in tournaments and climb leaderboards
            </li>
            <li>
              <span className="font-semibold text-white">Connect</span> – add friends, send messages, and share achievements
            </li>
          </ul>
          <p className="text-white/70 leading-relaxed">
            The platform is designed to reward user engagement across the Saraya ecosystem of applications and services.
          </p>
        </div>

        {/* Accounts */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            3. User Accounts
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            To use Saraya Rewards Center, you must create an account. You agree to:
          </p>
          <ul className="list-disc list-inside text-white/70 space-y-1 mb-4">
            <li>Provide accurate and complete registration information</li>
            <li>Keep your login credentials secure and confidential</li>
            <li>Be responsible for all activity under your account</li>
            <li>Notify us immediately of any unauthorized use</li>
            <li>Not create multiple accounts or share accounts</li>
          </ul>
          <p className="text-white/70 leading-relaxed">
            We reserve the right to suspend or terminate accounts that violate these terms.
          </p>
        </div>

        {/* Virtual Currency */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            4. Virtual Currency (Coins & Tokens)
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            Saraya Rewards Center uses virtual currencies:
          </p>
          <ul className="list-disc list-inside text-white/70 space-y-1 mb-4">
            <li><span className="font-semibold text-white">Coins</span> – earned through activities, used to redeem rewards</li>
            <li><span className="font-semibold text-white">Tokens</span> – premium currency for special rewards</li>
            <li><span className="font-semibold text-white">XP</span> – experience points that determine your level</li>
          </ul>
          <p className="text-white/70 leading-relaxed mb-4">
            Important terms regarding virtual currency:
          </p>
          <ul className="list-disc list-inside text-white/70 space-y-1 mb-4">
            <li>Virtual currency has no real-world monetary value</li>
            <li>Currency cannot be exchanged for cash or transferred between users</li>
            <li>We may adjust currency values and rewards at any time</li>
            <li>Unused currency may expire as per platform policies</li>
            <li>Fraudulently obtained currency will be removed</li>
          </ul>
        </div>

        {/* Acceptable Use */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            5. Acceptable Use
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            As a user, you agree to use the platform in accordance with applicable laws and these Terms. You will not:
          </p>
          <ul className="list-disc list-inside text-white/70 space-y-1 mb-4">
            <li>Use bots, scripts, or automation to earn currency</li>
            <li>Exploit bugs or glitches for unfair advantage</li>
            <li>Attempt to hack or compromise platform security</li>
            <li>Harass, abuse, or threaten other users</li>
            <li>Post inappropriate, offensive, or illegal content</li>
            <li>Impersonate others or misrepresent your identity</li>
            <li>Engage in fraud, scams, or deceptive practices</li>
          </ul>
        </div>

        {/* Rewards Redemption */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            6. Rewards Redemption
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            When redeeming rewards:
          </p>
          <ul className="list-disc list-inside text-white/70 space-y-1 mb-4">
            <li>All redemptions are final once confirmed</li>
            <li>Reward availability may change without notice</li>
            <li>Physical rewards require valid shipping information</li>
            <li>Digital rewards are delivered as described on the platform</li>
            <li>We reserve the right to verify eligibility before fulfillment</li>
            <li>Delivery times may vary based on reward type and location</li>
          </ul>
        </div>

        {/* Intellectual Property */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            7. Intellectual Property
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            All content on Saraya Rewards Center, including text, graphics, logos, icons, images, and software, is protected by copyright and intellectual property laws.
          </p>
          <p className="text-white/70 leading-relaxed">
            Copying, distribution, or modification of content without prior written permission from Saraya Solutions is not permitted.
          </p>
        </div>

        {/* Limitation of Liability */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            8. Limitation of Liability
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            Saraya Rewards Center is provided "as is". We do not guarantee that the platform will always be available, error-free, or meet all your expectations.
          </p>
          <p className="text-white/70 leading-relaxed">
            Saraya Solutions will not be liable for any direct, indirect, incidental, or consequential damages arising from use or inability to use the platform.
          </p>
        </div>

        {/* Changes */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            9. Changes to Terms
          </h2>
          <p className="text-white/70 leading-relaxed">
            We may update these Terms of Service from time to time. Continued use of the platform after changes constitutes acceptance of the new terms. We encourage you to review these terms periodically.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            10. Contact
          </h2>
          <p className="text-white/70 leading-relaxed">
            If you have questions about these Terms of Service, contact us via our{" "}
            <Link href="/contact" className="text-brand-400 hover:underline font-semibold">
              Contact page
            </Link>.
          </p>
        </div>

        {/* Last updated */}
        <div className="text-center text-white/40 text-sm">
          Last updated: December 2025
        </div>
      </section>
    </div>
  );
}

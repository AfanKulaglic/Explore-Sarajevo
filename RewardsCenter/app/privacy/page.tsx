import React from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-900 via-violet-900 to-slate-900 text-white py-16 md:py-24 rounded-3xl mb-8">
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg md:text-xl text-white/70">
            How we collect, use, and protect your information
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 pb-16 space-y-8">
        {/* Introduction */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            1. Introduction
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            This Privacy Policy explains how Saraya Rewards Center collects, uses, and protects personal information of users of the <span className="font-semibold text-white">Saraya Rewards Center</span> platform (website and related services). By using our platform, you agree to the terms described in this Policy.
          </p>
          <p className="text-white/70 leading-relaxed">
            Saraya Rewards Center is developed and maintained by <span className="font-semibold text-white">Saraya Solutions</span> from Sarajevo (hereinafter: "we", "us", "our platform"). We are committed to processing your data transparently, securely, and only for purposes clearly explained to you.
          </p>
        </div>

        {/* What data we collect */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            2. What Data We Collect
          </h2>

          <h3 className="text-lg font-semibold text-white mb-2">
            2.1. Data You Provide
          </h3>
          <p className="text-white/70 leading-relaxed mb-3">
            When you create an account or contact us, we may collect:
          </p>
          <ul className="list-disc list-inside text-white/70 space-y-1 mb-4">
            <li>Name and email address</li>
            <li>Profile information (avatar, display name)</li>
            <li>Account preferences and settings</li>
            <li>Messages and support requests</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mb-2">
            2.2. Activity Data
          </h3>
          <p className="text-white/70 leading-relaxed mb-3">
            When you use Saraya Rewards Center, we automatically collect:
          </p>
          <ul className="list-disc list-inside text-white/70 space-y-1 mb-4">
            <li>Coins, tokens, and XP balances</li>
            <li>Transaction history (orders, redemptions)</li>
            <li>Tournament participation and scores</li>
            <li>Achievement progress</li>
            <li>Device information and IP address</li>
          </ul>
          <p className="text-white/70 leading-relaxed">
            This data is used for platform functionality, security, and improving user experience.
          </p>
        </div>

        {/* How we use your data */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            3. How We Use Your Data
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            We use your data exclusively for purposes related to the operation of Saraya Rewards Center, including:
          </p>
          <ul className="list-disc list-inside text-white/70 space-y-1 mb-4">
            <li>Managing your account and rewards balance</li>
            <li>Processing reward redemptions and orders</li>
            <li>Running tournaments and leaderboards</li>
            <li>Sending notifications about your account activity</li>
            <li>Providing customer support</li>
            <li>Improving platform features and security</li>
          </ul>
          <p className="text-white/70 leading-relaxed">
            We do not sell your personal data to third parties. We may share data only with trusted partners who help us operate the platform (hosting, analytics), under appropriate data processing agreements.
          </p>
        </div>

        {/* Legal basis */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            4. Legal Basis for Processing
          </h2>
          <p className="text-white/70 leading-relaxed mb-3">
            We process personal data based on:
          </p>
          <ul className="list-disc list-inside text-white/70 space-y-1 mb-4">
            <li>
              <span className="font-semibold text-white">Your consent</span> – e.g., when you create an account
            </li>
            <li>
              <span className="font-semibold text-white">Contract performance</span> – to provide rewards services
            </li>
            <li>
              <span className="font-semibold text-white">Legitimate interests</span> – platform security, analytics
            </li>
            <li>
              <span className="font-semibold text-white">Legal obligations</span> – where required by law
            </li>
          </ul>
        </div>

        {/* Your rights */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            5. Your Rights
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            You have the right to request:
          </p>
          <ul className="list-disc list-inside text-white/70 space-y-1 mb-4">
            <li>Access to your personal data</li>
            <li>Correction of inaccurate data</li>
            <li>Deletion of your data</li>
            <li>Restriction of processing</li>
            <li>Data portability</li>
            <li>Objection to processing</li>
          </ul>
          <p className="text-white/70 leading-relaxed">
            To exercise these rights, contact us at:{" "}
            <a href="mailto:info@sarayasolutions.com" className="text-brand-400 hover:underline">
              info@sarayasolutions.com
            </a>
          </p>
        </div>

        {/* Data security */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            6. Data Security
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            We implement appropriate technical and organizational measures to protect your data, including:
          </p>
          <ul className="list-disc list-inside text-white/70 space-y-1 mb-4">
            <li>Encrypted data transmission (HTTPS)</li>
            <li>Secure password hashing</li>
            <li>Access controls and authentication</li>
            <li>Regular security audits</li>
          </ul>
        </div>

        {/* Data retention */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            7. Data Retention
          </h2>
          <p className="text-white/70 leading-relaxed">
            We retain your data for as long as your account is active or as needed to provide services. If you delete your account, we will delete or anonymize your data within a reasonable timeframe, unless we are required to retain it for legal purposes.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            8. Contact
          </h2>
          <p className="text-white/70 leading-relaxed">
            If you have questions about this Privacy Policy, contact us via our{" "}
            <Link href="/contact" className="text-brand-400 hover:underline font-semibold">
              Contact page
            </Link>
            {" "}or email us at{" "}
            <a href="mailto:info@sarayasolutions.com" className="text-brand-400 hover:underline">
              info@sarayasolutions.com
            </a>.
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

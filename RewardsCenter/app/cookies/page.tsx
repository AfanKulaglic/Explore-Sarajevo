import React from "react";
import Link from "next/link";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-900 via-violet-900 to-slate-900 text-white py-16 md:py-24 rounded-3xl mb-8">
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Cookie Policy
          </h1>
          <p className="text-lg md:text-xl text-white/70">
            How we use cookies on Saraya Rewards Center
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 pb-16 space-y-8">
        {/* What are cookies */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            1. What are Cookies?
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            Cookies are small text files stored on your device (computer, tablet, mobile phone) when you visit a website. They are used to remember your settings, analyze traffic, and improve user experience.
          </p>
          <p className="text-white/70 leading-relaxed">
            On <span className="font-semibold text-white">Saraya Rewards Center</span>, we use cookies to provide you with the best possible experience while earning and redeeming rewards.
          </p>
        </div>

        {/* What cookies we use */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            2. What Cookies We Use
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Essential Cookies
              </h3>
              <p className="text-white/70 leading-relaxed">
                These cookies are necessary for basic platform functionality. They enable navigation, access to secure areas, and keep you logged in. Without these cookies, the platform cannot function properly.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Authentication Cookies
              </h3>
              <p className="text-white/70 leading-relaxed">
                We use authentication cookies to keep you logged in across sessions and enable Single Sign-On (SSO) across Saraya platforms. These ensure a seamless experience across our ecosystem.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Analytics Cookies
              </h3>
              <p className="text-white/70 leading-relaxed">
                We use analytics cookies to understand how visitors use our platform. This data helps us improve content and user experience. Information collected is anonymous and aggregated.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Preference Cookies
              </h3>
              <p className="text-white/70 leading-relaxed">
                These cookies remember your settings and preferences (e.g., theme, notification settings) to provide a personalized experience when you visit the platform.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Third-Party Cookies
              </h3>
              <p className="text-white/70 leading-relaxed">
                Some parts of our platform may use third-party cookies (e.g., for embedded content, social media features). These cookies are controlled by third parties and are subject to their privacy policies.
              </p>
            </div>
          </div>
        </div>

        {/* How to manage cookies */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            3. How to Manage Cookies
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            Most web browsers automatically accept cookies, but you can change your browser settings to control or block cookies. Here's how in popular browsers:
          </p>
          <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
            <li>
              <span className="font-semibold text-white">Chrome:</span> Settings → Privacy and Security → Cookies
            </li>
            <li>
              <span className="font-semibold text-white">Firefox:</span> Settings → Privacy & Security → Cookies
            </li>
            <li>
              <span className="font-semibold text-white">Safari:</span> Preferences → Privacy → Cookies
            </li>
            <li>
              <span className="font-semibold text-white">Edge:</span> Settings → Cookies and Site Permissions
            </li>
          </ul>
          <p className="text-white/70 leading-relaxed">
            Note: Blocking essential cookies may affect platform functionality, including the ability to log in and use core features.
          </p>
        </div>

        {/* Specific cookies */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            4. Cookies We Use
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-2 text-white font-semibold">Cookie Name</th>
                  <th className="text-left py-3 px-2 text-white font-semibold">Purpose</th>
                  <th className="text-left py-3 px-2 text-white font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody className="text-white/70">
                <tr className="border-b border-white/5">
                  <td className="py-3 px-2">sb-auth-token</td>
                  <td className="py-3 px-2">Authentication session</td>
                  <td className="py-3 px-2">Session</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-2">saraya_account</td>
                  <td className="py-3 px-2">User account data cache</td>
                  <td className="py-3 px-2">Persistent</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-2">saraya_session</td>
                  <td className="py-3 px-2">Session management</td>
                  <td className="py-3 px-2">Session</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-2">theme_preference</td>
                  <td className="py-3 px-2">UI theme setting</td>
                  <td className="py-3 px-2">1 year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Changes */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            5. Changes to This Policy
          </h2>
          <p className="text-white/70 leading-relaxed">
            We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            6. Contact
          </h2>
          <p className="text-white/70 leading-relaxed">
            If you have questions about our use of cookies, contact us via our{" "}
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

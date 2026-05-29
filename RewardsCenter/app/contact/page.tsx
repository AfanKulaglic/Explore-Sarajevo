import React from "react";
import { FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaGift, FaTrophy, FaQuestionCircle, FaHandshake } from "react-icons/fa";

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-900 via-violet-900 to-slate-900 text-white py-12 md:py-24 rounded-2xl md:rounded-3xl mb-6 md:mb-8 mx-2 md:mx-0">
        <div className="relative max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 md:mb-4">
            Contact Us
          </h1>
          <p className="text-base md:text-xl text-white/70">
            We'd love to hear from you
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-3 md:px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* Email CTA Card */}
          <div className="md:col-span-2">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6 md:p-8">
              <div className="flex flex-col gap-4 md:gap-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                    <FaEnvelope className="text-white text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Get in Touch</h2>
                    <p className="text-white/50 text-xs sm:text-sm">We respond within 24 hours</p>
                  </div>
                </div>
                <div>
                  <p className="text-white/70 text-sm sm:text-base mb-4">
                    For all inquiries about rewards, partnerships, technical support, or any other 
                    questions, reach out to us via email.
                  </p>
                  <a 
                    href="mailto:marketing@sarayasolutions.com"
                    className="inline-flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto px-4 sm:px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors text-sm sm:text-base"
                  >
                    <FaEnvelope className="flex-shrink-0" />
                    <span className="truncate">marketing@sarayasolutions.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6">Contact Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <FaEnvelope className="text-brand-400 text-sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm sm:text-base">Email</p>
                    <a href="mailto:marketing@sarayasolutions.com" className="text-white/60 text-xs sm:text-sm hover:text-brand-400 transition-colors break-all">
                      marketing@sarayasolutions.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-green-400 text-sm" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Location</p>
                    <p className="text-white/60 text-xs sm:text-sm">
                      Terezije bb<br />
                      71000 Sarajevo<br />
                      Bosnia and Herzegovina
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Follow Us</h2>
              <p className="text-white/60 text-xs sm:text-sm mb-4">
                Stay updated with the latest rewards and announcements.
              </p>
              <div className="flex gap-2 sm:gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=61583431934006"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                >
                  <FaFacebook className="text-white text-sm sm:text-base" />
                </a>
                <a
                  href="https://www.instagram.com/sarayasolutions_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 hover:bg-pink-600 flex items-center justify-center transition-colors"
                >
                  <FaInstagram className="text-white text-sm sm:text-base" />
                </a>
                <a
                  href="https://youtube.com/@sarayasolutions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 hover:bg-red-600 flex items-center justify-center transition-colors"
                >
                  <FaYoutube className="text-white text-sm sm:text-base" />
                </a>
                <a
                  href="https://www.tiktok.com/@sarayasolutions0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 hover:bg-slate-600 flex items-center justify-center transition-colors"
                >
                  <FaTiktok className="text-white text-sm sm:text-base" />
                </a>
              </div>
            </div>
          </div>

          {/* How We Can Help */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6">How We Can Help</h2>
              <ul className="space-y-3 sm:space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaGift className="text-amber-400 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Rewards & Redemption</p>
                    <p className="text-white/50 text-xs sm:text-sm">Questions about earning or redeeming rewards</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaTrophy className="text-purple-400 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Tournaments & Competitions</p>
                    <p className="text-white/50 text-xs sm:text-sm">Info about ongoing or upcoming events</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaQuestionCircle className="text-blue-400 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Technical Support</p>
                    <p className="text-white/50 text-xs sm:text-sm">Help with account or platform issues</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaHandshake className="text-green-400 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Partnerships</p>
                    <p className="text-white/50 text-xs sm:text-sm">Business inquiries and collaborations</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* FAQ Link */}
            <div className="bg-gradient-to-br from-brand-600/20 to-violet-600/20 backdrop-blur-sm rounded-2xl border border-brand-500/20 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-white mb-2">Need Quick Answers?</h2>
              <p className="text-white/60 text-xs sm:text-sm mb-3 sm:mb-4">
                Check our FAQ section for instant answers to common questions about rewards, points, and more.
              </p>
              <a
                href="/faq"
                className="text-brand-400 text-sm font-semibold hover:underline"
              >
                Visit FAQ →
              </a>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-6 sm:mt-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-white/10 p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">About Saraya Rewards Center</h2>
            <p className="text-white/70 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
              Saraya Rewards Center is the central hub for earning and redeeming rewards across the entire 
              Saraya ecosystem. Whether you're playing quizzes, exploring Sarajevo, or making smart shopping 
              decisions, every action earns you points redeemable for real rewards.
            </p>
            <p className="text-white/70 leading-relaxed text-sm sm:text-base">
              Built by <span className="text-white font-semibold">Saraya Solutions</span> from Sarajevo, 
              with a mission to make everyday activities more rewarding.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

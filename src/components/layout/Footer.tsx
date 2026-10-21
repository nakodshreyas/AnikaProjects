import React from 'react';
import { Phone, MessageCircle, Mail, MapPin, Instagram, Youtube, CheckCircle2, Lock } from 'lucide-react';
import { AnikaLogo } from './AnikaLogo';

interface FooterProps {
  onNavigateLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateLogin }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#14202b] text-brand-goldPale border-t border-brand-gold/30 pt-16 pb-20 sm:pb-12 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-70 pointer-events-none" />
      <div className="absolute -top-40 right-10 w-96 h-96 rounded-full bg-brand-gold/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-[94%] 2xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-brand-navyLight/40">
          
          {/* Brand Info */}
          <div className="space-y-5 lg:col-span-5">
            <a href="#home" className="flex items-center gap-3.5 group">
              <AnikaLogo variant="inverted" className="h-16 w-auto transition-transform duration-200 group-hover:scale-105" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-semibold tracking-[0.22em] text-brand-goldLight">
                  Building Dreams · Creating Future
                </span>
                <span className="text-[11px] text-brand-goldPale/70 mt-0.5">
                  Residential House Construction · Amravati
                </span>
              </div>
            </a>

            <p className="text-xs text-brand-goldPale/80 leading-relaxed max-w-sm">
              Setting elevated benchmarks for residential house construction in Amravati through architectural clarity, engineering integrity, and transparent homeowner partnerships.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 rounded bg-brand-navy/60 border border-brand-gold/30 text-[10px] uppercase font-bold tracking-wider text-brand-goldLight inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-brand-gold" /> RERA & Municipal Adherence
              </span>
              <span className="px-2.5 py-1 rounded bg-brand-navy/60 border border-brand-gold/30 text-[10px] uppercase font-bold tracking-wider text-brand-goldLight inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-brand-gold" /> Certified Civil Site Supervision
              </span>
            </div>

            {/* Official Social Channels */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href="https://www.youtube.com/@Anikaprojects"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600/15 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/30 text-[11px] font-semibold transition-all duration-200"
              >
                <Youtube className="w-3.5 h-3.5 fill-current text-red-400 group-hover:text-white" />
                <span>YouTube @Anikaprojects</span>
              </a>
              <a
                href="https://www.instagram.com/anikaprojects.in?utm_source=qr&stkn=MXAzaGJyOTBzamk5YQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600/15 hover:bg-gradient-to-r hover:from-amber-500 hover:to-purple-600 text-purple-200 hover:text-white border border-purple-500/30 text-[11px] font-semibold transition-all duration-200"
              >
                <Instagram className="w-3.5 h-3.5 text-purple-300 group-hover:text-white" />
                <span>Instagram Profile</span>
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-4 lg:col-span-3">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white border-b border-brand-gold/30 pb-2">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-goldPale/75 font-medium">
              <li>
                <a href="#home" className="hover:text-brand-gold transition-colors flex items-center gap-1.5">
                  <span className="text-brand-gold">›</span> Home Overview
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-brand-gold transition-colors flex items-center gap-1.5">
                  <span className="text-brand-gold">›</span> About Our Firm
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-brand-gold transition-colors flex items-center gap-1.5">
                  <span className="text-brand-gold">›</span> Capabilities & Services
                </a>
              </li>
              <li>
                <a href="#videos" className="hover:text-brand-gold transition-colors flex items-center gap-1.5">
                  <span className="text-brand-gold">›</span> YouTube Video Reels
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-brand-gold transition-colors flex items-center gap-1.5">
                  <span className="text-brand-gold">›</span> Delivered Projects
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-brand-gold transition-colors flex items-center gap-1.5">
                  <span className="text-brand-gold">›</span> Customer Testimonials
                </a>
              </li>
              <li>
                <a href="#why" className="hover:text-brand-gold transition-colors flex items-center gap-1.5">
                  <span className="text-brand-gold">›</span> The Anika Advantage
                </a>
              </li>
              <li>
                <a href="#callback" className="hover:text-brand-gold transition-colors flex items-center gap-1.5">
                  <span className="text-brand-gold">›</span> Request Callback
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Visiting */}
          <div className="space-y-4 lg:col-span-4">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white border-b border-brand-gold/30 pb-2">
              Amravati Office & Desk
            </h4>
            <div className="space-y-3 text-xs text-brand-goldPale/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                <a
                  href="https://maps.app.goo.gl/cuug7FtYQo9FL7Zk6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="leading-relaxed hover:text-brand-gold transition-colors"
                >
                  Amravati, Maharashtra — 444601
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <a href="tel:+919860641551" className="font-bold text-white hover:text-brand-gold transition-colors">
                  +91 98606 41551
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a
                  href="https://wa.me/919860641551?text=Hi%20Anika%20Projects,%20I%20would%20like%20to%20know%20more%20about%20residential%20properties."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-gold transition-colors font-semibold"
                >
                  WhatsApp Direct Support
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <a href="mailto:contact@anikaprojects.in" className="hover:text-brand-gold transition-colors font-medium">
                  contact@anikaprojects.in
                </a>
              </div>
              <div className="pt-2 text-[11px] text-brand-goldDark">
                <span className="block text-brand-goldLight font-semibold">Visiting Hours:</span>
                Monday – Saturday: 9:00 AM – 7:30 PM (Sunday By Prior Appointment)
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-brand-goldPale/70 text-center sm:text-left flex-wrap">
            <p>
              © {currentYear} <strong className="text-white font-semibold">Anika Projects</strong>. All rights reserved.
            </p>
            <span className="hidden sm:inline text-brand-navyLight">•</span>
            <p className="text-brand-goldLight font-medium">
              Crafted with Pride in Amravati, Maharashtra
            </p>
            <span className="hidden sm:inline text-brand-navyLight">•</span>
            <a
              href="/login"
              onClick={(e) => {
                if (onNavigateLogin) {
                  e.preventDefault();
                  onNavigateLogin();
                }
              }}
              className="text-brand-goldPale/40 hover:text-brand-gold inline-flex items-center gap-1 transition-colors text-[11px] font-medium"
              title="Private Client & Homeowner Portal"
            >
              <Lock className="w-3 h-3" />
              <span>Client Portal</span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.youtube.com/@Anikaprojects"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-brand-deepNavy hover:bg-red-600 hover:text-white border border-brand-gold/30 flex items-center justify-center text-brand-gold transition-colors"
              aria-label="YouTube channel"
              title="YouTube @Anikaprojects"
            >
              <Youtube className="w-4 h-4 fill-current" />
            </a>
            <a
              href="https://www.instagram.com/anikaprojects.in?utm_source=qr&stkn=MXAzaGJyOTBzamk5YQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-brand-deepNavy hover:bg-brand-gold hover:text-brand-deepNavy border border-brand-gold/30 flex items-center justify-center text-brand-gold transition-colors"
              aria-label="Instagram profile"
              title="Instagram @anikaprojects.in"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://wa.me/919860641551"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-brand-deepNavy hover:bg-emerald-600 hover:text-white border border-brand-gold/30 flex items-center justify-center text-brand-gold transition-colors"
              aria-label="WhatsApp contact"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a
              href="tel:+919860641551"
              className="w-8 h-8 rounded-lg bg-brand-deepNavy hover:bg-brand-gold hover:text-brand-deepNavy border border-brand-gold/30 flex items-center justify-center text-brand-gold transition-colors"
              aria-label="Telephone call"
            >
              <Phone className="w-4 h-4" />
            </a>
            <a
              href="mailto:contact@anikaprojects.in"
              className="w-8 h-8 rounded-lg bg-brand-deepNavy hover:bg-brand-gold hover:text-brand-deepNavy border border-brand-gold/30 flex items-center justify-center text-brand-gold transition-colors"
              aria-label="Email inquiry"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

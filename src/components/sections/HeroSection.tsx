import React from 'react';
import { ArrowRight, Star, Phone, MessageCircle, Home, Calendar, ShieldCheck } from 'lucide-react';
import { HeroPhotoSlider } from './HeroPhotoSlider';

interface HeroSectionProps {
  onExploreProjects: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreProjects,
}) => {
  return (
    <section id="home" className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
      {/* Decorative architectural ambient accents */}
      <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-brand-sandBg/80 via-brand-sandBg/30 to-transparent pointer-events-none" />
      <div className="absolute -top-24 right-12 -z-10 w-96 h-96 rounded-full bg-brand-goldPale/50 blur-3xl pointer-events-none" />

      <div className="w-full max-w-[94%] 2xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Main Hero Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-brand-goldDark">
              <span className="w-2 h-2 rounded-full bg-brand-gold animate-ping" />
              <span>Residential House Construction & Real Estate Development</span>
              <span className="text-brand-slateBorder" aria-hidden="true">·</span>
              <span>Amravati, Maharashtra</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-brand-deepNavy font-semibold leading-[1.12] tracking-tight max-w-3xl">
              Building Dreams, <br />
              <span className="gold-gradient-text italic font-normal">Creating Future.</span>
            </h1>

            <p className="text-base sm:text-lg text-brand-navyLight max-w-2xl leading-relaxed">
              Thoughtfully planned homes that harmonize modern architecture, certified structural engineering, and practical Indian family living — proudly rooted in Amravati.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={onExploreProjects}
                className="px-6 py-3.5 rounded-lg bg-brand-deepNavy hover:bg-brand-navyLight text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 active:scale-95"
              >
                <span>View Delivered Projects</span>
                <ArrowRight className="w-4 h-4 text-brand-gold" />
              </button>

              <a
                href="#callback"
                className="px-6 py-3.5 rounded-lg bg-white hover:bg-brand-sandBg text-brand-deepNavy border border-brand-slateBorder font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 active:scale-95"
              >
                <Calendar className="w-4 h-4 text-brand-goldDark" />
                <span>Schedule Consultation</span>
              </a>
            </div>

            {/* Quick Inquiries Strip */}
            <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-brand-navyLight border-t border-brand-slateBorder/60">
              <div className="flex items-center gap-2">
                <span className="text-brand-goldDark font-bold">Direct Call:</span>
                <a
                  href="tel:+919860641551"
                  className="text-brand-deepNavy hover:text-brand-gold font-bold underline decoration-brand-gold/40 underline-offset-4"
                >
                  +91 98606 41551
                </a>
              </div>
              <span className="text-brand-slateBorder" aria-hidden="true">•</span>
              <a
                href="https://wa.me/919860641551?text=Hi%20Anika%20Projects,%20I%20am%20interested%20in%20residential%20construction%20and%20homes."
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-deepNavy hover:text-brand-gold font-semibold flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Chat on WhatsApp</span>
              </a>
              <span className="text-brand-slateBorder" aria-hidden="true">•</span>
              <a
                href="#reviews"
                className="text-brand-navyLight hover:text-brand-deepNavy font-medium flex items-center gap-1"
              >
                <span className="text-amber-500">★</span>
                <span>4.9 Client Rating</span>
              </a>
            </div>

            {/* Credibility Stats Bar */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-brand-slateBorder/60">
              <div className="space-y-0.5">
                <div className="font-display text-2xl sm:text-3xl font-bold text-brand-deepNavy tabular-nums">
                  100%
                </div>
                <div className="text-xs text-brand-navyLight font-medium">On-Time Handover</div>
              </div>
              <div className="space-y-0.5">
                <div className="font-display text-2xl sm:text-3xl font-bold text-brand-goldDark tabular-nums">
                  3+
                </div>
                <div className="text-xs text-brand-navyLight font-medium">Delivered Row Houses</div>
              </div>
              <div className="space-y-0.5">
                <div className="font-display text-2xl sm:text-3xl font-bold text-brand-deepNavy">
                  Amravati
                </div>
                <div className="text-xs text-brand-navyLight font-medium">Prime Freehold Localities</div>
              </div>
            </div>

          </div>

          {/* Automatic Photo Showcase Switcher Column */}
          <div className="lg:col-span-5 relative">
            <HeroPhotoSlider onExploreProjects={onExploreProjects} />
          </div>

        </div>
      </div>
    </section>
  );
};

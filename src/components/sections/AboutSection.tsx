import React from 'react';
import { Building2, Shield, FileCheck, Compass, CheckCircle2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-brand-sandBg/40 border-y border-brand-slateBorder/60">
      <div className="w-full max-w-[94%] 2xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Commitment Card */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="p-8 rounded-2xl bg-white border border-brand-slateBorder shadow-sm relative space-y-6">
              <div className="w-14 h-14 rounded-xl bg-brand-deepNavy flex items-center justify-center text-brand-gold">
                <Building2 className="w-7 h-7" />
              </div>

              <h3 className="font-display text-2xl text-brand-deepNavy font-semibold">
                The Anika Quality Standard
              </h3>

              <p className="text-sm text-brand-navyLight leading-relaxed">
                Founded with corporate real estate and civil engineering rigor, Anika Projects was established to redefine residential construction quality in Amravati through transparent dealings, robust construction, and human-centric architecture.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-xs sm:text-sm text-brand-deepNavy font-medium">
                  <div className="w-5 h-5 rounded-full bg-brand-sandBg text-brand-goldDark flex items-center justify-center text-xs flex-shrink-0 font-bold mt-0.5">
                    ✓
                  </div>
                  <span>Engineered with certified grade materials and strict site supervision</span>
                </div>
                <div className="flex items-start gap-3 text-xs sm:text-sm text-brand-deepNavy font-medium">
                  <div className="w-5 h-5 rounded-full bg-brand-sandBg text-brand-goldDark flex items-center justify-center text-xs flex-shrink-0 font-bold mt-0.5">
                    ✓
                  </div>
                  <span>Clear freehold land titles, municipal compliance & complete documentation</span>
                </div>
                <div className="flex items-start gap-3 text-xs sm:text-sm text-brand-deepNavy font-medium">
                  <div className="w-5 h-5 rounded-full bg-brand-sandBg text-brand-goldDark flex items-center justify-center text-xs flex-shrink-0 font-bold mt-0.5">
                    ✓
                  </div>
                  <span>Ergonomic space optimization crafted for modern Indian family lifestyles</span>
                </div>
              </div>

              <div className="pt-3 border-t border-brand-slateBorder/60 flex items-center justify-between text-xs text-brand-goldDark font-semibold">
                <span>RERA & Municipal Guidelines</span>
                <span>ISO Standards Verification</span>
              </div>
            </div>
          </div>

          {/* Right Text Story */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-brand-goldDark block">
              About Anika Projects
            </span>

            <h2 className="font-display text-3xl sm:text-4xl text-brand-deepNavy font-semibold leading-tight max-w-xl">
              Building with Purpose, Planning with Meticulous Care.
            </h2>

            <p className="text-sm sm:text-base text-brand-navyLight leading-relaxed">
              Anika Projects is a premier residential house construction and real-estate development firm based in Amravati, Maharashtra. We design and build high-quality, practical, and enduring residential homes.
            </p>

            <p className="text-sm sm:text-base text-brand-navyLight leading-relaxed">
              We eliminate common industry pain points — ambiguous timelines, material compromises, and hidden costs — by establishing an elevated benchmark of clarity, craft, and post-delivery satisfaction for homeowners.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
              <div className="p-4 rounded-xl bg-white border border-brand-slateBorder/80 space-y-1">
                <div className="text-brand-gold font-display text-2xl font-bold">
                  Quality First
                </div>
                <p className="text-xs text-brand-navyLight leading-relaxed">
                  Foundational anchor depth, seismic RCC framing, multi-layer waterproofing, and anti-dampness finishes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-brand-slateBorder/80 space-y-1">
                <div className="text-brand-gold font-display text-2xl font-bold">
                  100% Transparent
                </div>
                <p className="text-xs text-brand-navyLight leading-relaxed">
                  Itemized Bill of Quantities (BOQ), milestone-based payment schedules, and weekly inspection photo records.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

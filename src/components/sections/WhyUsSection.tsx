import React from 'react';
import { ShieldCheck, Maximize2, MessageSquare, TrendingUp } from 'lucide-react';

export const WhyUsSection: React.FC = () => {
  return (
    <section id="why" className="py-20 bg-brand-sandBg/50 border-t border-brand-slateBorder/80">
      <div className="w-full max-w-[94%] 2xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-[0.2em] text-brand-goldDark block mb-2">
            Our Distinction
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-brand-deepNavy font-semibold">
            Why Families Choose Anika Projects
          </h2>
          <p className="text-brand-navyLight text-sm mt-3 leading-relaxed">
            We hold ourselves to higher civil construction benchmarks so your home remains resilient, beautiful, and valuable for decades to come.
          </p>
        </div>

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-brand-slateBorder space-y-3 card-hover">
            <div className="w-12 h-12 rounded-xl bg-brand-sandBg text-brand-goldDark flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-base text-brand-deepNavy">
              Structural Rigor
            </h3>
            <p className="text-xs text-brand-navyLight leading-relaxed">
              Certified ISI 53-grade cement, thermo-mechanically treated (TMT) Fe 550D steel bars, deep anchor footing, and dual-layer crystalline waterproofing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-brand-slateBorder space-y-3 card-hover">
            <div className="w-12 h-12 rounded-xl bg-brand-sandBg text-brand-goldDark flex items-center justify-center">
              <Maximize2 className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-base text-brand-deepNavy">
              Practical Space Planning
            </h3>
            <p className="text-xs text-brand-navyLight leading-relaxed">
              Every square inch is modeled for furniture ergonomics, cross-ventilation, and natural morning daylight without dark, unlivable dead corridors.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-brand-slateBorder space-y-3 card-hover">
            <div className="w-12 h-12 rounded-xl bg-brand-sandBg text-brand-goldDark flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-base text-brand-deepNavy">
              Clear Communication
            </h3>
            <p className="text-xs text-brand-navyLight leading-relaxed">
              Transparent stage milestones with weekly photographic WhatsApp records, transparent itemized invoices, and zero unexpected hidden add-ons.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-brand-slateBorder space-y-3 card-hover">
            <div className="w-12 h-12 rounded-xl bg-brand-sandBg text-brand-goldDark flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-base text-brand-deepNavy">
              Enduring Asset Value
            </h3>
            <p className="text-xs text-brand-navyLight leading-relaxed">
              Homes built on high-potential Amravati growth corridors that appreciate over time while keeping lifetime maintenance costs remarkably low.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

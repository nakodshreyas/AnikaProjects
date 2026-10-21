import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SERVICES_DATA } from '../../data/servicesData';
import { ServiceItem } from '../../types';

interface ServicesSectionProps {
  onSelectService: (service: ServiceItem) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  return (
    <section id="services" className="py-20 bg-brand-warmBg">
      <div className="w-full max-w-[94%] 2xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold tracking-[0.2em] text-brand-goldDark block mb-2">
            Our Capabilities
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-brand-deepNavy font-semibold">
            Specialized Construction Services
          </h2>
          <p className="text-brand-navyLight text-sm mt-3 leading-relaxed">
            From raw freehold plots to turnkey ready-to-move bungalows, we execute with architectural precision, certified materials, and dedicated supervisory care.
          </p>
        </div>

        {/* 8 Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES_DATA.map((service) => (
            <article
              key={service.id}
              onClick={() => onSelectService(service)}
              className="p-6 rounded-xl bg-white border border-brand-slateBorder/90 card-hover flex flex-col justify-between cursor-pointer group focus-within:ring-2 focus-within:ring-brand-gold"
              tabIndex={0}
              role="button"
              aria-label={`View details for ${service.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectService(service);
                }
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-lg bg-brand-sandBg flex items-center justify-center text-brand-goldDark font-display font-bold text-lg">
                    {service.number}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-brand-slateBorder group-hover:text-brand-gold transition-colors" />
                </div>
                <h3 className="font-display font-semibold text-lg text-brand-deepNavy mb-2 group-hover:text-brand-goldDark transition-colors">
                  {service.title}
                </h3>
                <p className="text-xs text-brand-navyLight leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="pt-4 border-t border-brand-slateBorder/40 mt-4 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-brand-goldDark uppercase tracking-wider">
                  {service.tag}
                </span>
                <span className="text-[11px] text-brand-navyLight group-hover:underline">
                  Scope →
                </span>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};

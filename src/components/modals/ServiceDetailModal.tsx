import React, { useEffect } from 'react';
import { X, CheckCircle, Clock, ArrowRight, Phone } from 'lucide-react';
import { ServiceItem } from '../../types';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onSelectService: (serviceTitle: string) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  onSelectService,
}) => {
  useEffect(() => {
    if (service) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [service]);

  if (!service) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-service-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-deepNavy/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl border border-brand-gold/40 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-brand-deepNavy text-white p-6 sm:p-7 border-b border-brand-gold/30 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-md bg-brand-gold text-brand-deepNavy font-display font-bold text-xs flex items-center justify-center">
                {service.number}
              </span>
              <span className="text-xs uppercase font-bold tracking-widest text-brand-goldLight">
                {service.tag}
              </span>
            </div>
            <h2 id="modal-service-title" className="font-display text-2xl font-semibold text-white">
              {service.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-brand-navy hover:bg-brand-navyLight text-white hover:text-brand-gold transition-colors focus:outline-none"
            aria-label="Close service modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-7 space-y-6">
          <p className="text-sm text-brand-navyLight leading-relaxed">{service.description}</p>

          <div className="bg-brand-sandBg/50 p-4 rounded-xl border border-brand-slateBorder/80 space-y-3">
            <h3 className="font-display font-semibold text-sm text-brand-deepNavy">
              What Is Included In This Service
            </h3>
            <ul className="space-y-2.5 text-xs text-brand-deepNavy">
              {service.deliverables.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-brand-goldDark flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-brand-deepNavy bg-white p-3 rounded-lg border border-brand-slateBorder/70">
            <Clock className="w-4 h-4 text-brand-goldDark" />
            <span>Estimated Duration: {service.duration}</span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-brand-slateBorder/60">
            <a
              href="tel:+919860641551"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-brand-slateBorder text-xs font-bold text-brand-deepNavy hover:bg-brand-sandBg transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-brand-goldDark" />
              <span>Call For Advice</span>
            </a>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectService(service.title);
                const cb = document.getElementById('callback');
                cb?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-brand-deepNavy hover:bg-brand-goldDark text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>Get Quotation</span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-gold" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

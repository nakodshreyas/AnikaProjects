import React from 'react';
import { Phone, MessageCircle, CalendarCheck } from 'lucide-react';

interface MobileQuickBarProps {
  onOpenReviewModal: () => void;
}

export const MobileQuickBar: React.FC<MobileQuickBarProps> = ({ onOpenReviewModal }) => {
  return (
    <aside
      aria-label="Mobile quick actions"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-brand-slateBorder px-3 py-2 flex items-center gap-2 shadow-lg h-14"
    >
      <a
        href="tel:+919860641551"
        className="flex-1 h-10 rounded-lg bg-brand-deepNavy text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
      >
        <Phone className="w-3.5 h-3.5 text-brand-gold" />
        <span className="truncate">Call Now</span>
      </a>

      <button
        type="button"
        onClick={onOpenReviewModal}
        className="flex-1 h-10 rounded-lg bg-brand-sandBg border border-brand-gold/60 text-brand-deepNavy font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
      >
        <span className="text-brand-goldDark">★</span>
        <span className="truncate">Review</span>
      </button>

      <a
        href="https://wa.me/919860641551?text=Hi%20Anika%20Projects,%20I%20am%20interested%20in%20residential%20construction%20and%20homes%20in%20Amravati."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="px-3.5 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center active:scale-95 transition-transform flex-shrink-0"
      >
        <MessageCircle className="w-4 h-4" />
      </a>
    </aside>
  );
};

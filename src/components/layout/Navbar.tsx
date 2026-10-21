import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AnikaLogo } from './AnikaLogo';

interface NavbarProps {
  onOpenReviewModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenReviewModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-[#fcfaf6]/95 backdrop-blur-md border-b border-brand-slateBorder/60 transition-all">
      <div className="w-full max-w-[94%] 2xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Zone 1: Official Brand Logo */}
        <a
          href="#home"
          className="flex items-center gap-2 group py-1 focus:outline-none"
          aria-label="Anika Projects Home"
        >
          <AnikaLogo className="h-14 sm:h-16 w-auto transition-transform duration-200 group-hover:scale-[1.02]" />
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7">
          <a
            href="#home"
            className="text-sm font-semibold text-brand-deepNavy hover:text-brand-gold transition-colors whitespace-nowrap"
          >
            Home
          </a>
          <a
            href="#about"
            className="text-sm font-medium text-brand-navy/80 hover:text-brand-gold transition-colors whitespace-nowrap"
          >
            About
          </a>
          <a
            href="#services"
            className="text-sm font-medium text-brand-navy/80 hover:text-brand-gold transition-colors whitespace-nowrap"
          >
            Services
          </a>
          <a
            href="#videos"
            className="text-sm font-medium text-brand-navy/80 hover:text-brand-gold transition-colors whitespace-nowrap"
          >
            Reels
          </a>
          <a
            href="#projects"
            className="text-sm font-medium text-brand-navy/80 hover:text-brand-gold transition-colors whitespace-nowrap"
          >
            Projects
          </a>
          <a
            href="#reviews"
            className="text-sm font-medium text-brand-navy/80 hover:text-brand-gold transition-colors whitespace-nowrap"
          >
            Reviews
          </a>
          <a
            href="#why"
            className="text-sm font-medium text-brand-navy/80 hover:text-brand-gold transition-colors whitespace-nowrap"
          >
            Why Anika
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-brand-navy/80 hover:text-brand-gold transition-colors whitespace-nowrap"
          >
            Contact
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenReviewModal}
            className="text-xs font-semibold text-brand-deepNavy hover:text-brand-gold px-3 py-2 transition-colors whitespace-nowrap"
          >
            Write Review
          </button>
          <a
            href="#callback"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-brand-deepNavy hover:bg-brand-goldDark text-white shadow-sm hover:shadow transition-all duration-200 border border-brand-deepNavy whitespace-nowrap"
          >
            Request Callback
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={toggleMobileMenu}
          className="md:hidden p-2 text-brand-deepNavy rounded-lg hover:bg-brand-sandBg transition-colors"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-warmBg border-b border-brand-slateBorder px-6 py-5 space-y-3.5 shadow-lg animate-fadeIn">
          <a
            href="#home"
            onClick={closeMobileMenu}
            className="block py-1 text-base font-semibold text-brand-deepNavy"
          >
            Home Overview
          </a>
          <a
            href="#about"
            onClick={closeMobileMenu}
            className="block py-1 text-sm font-medium text-brand-navy"
          >
            About Anika Projects
          </a>
          <a
            href="#services"
            onClick={closeMobileMenu}
            className="block py-1 text-sm font-medium text-brand-navy"
          >
            Capabilities & Services
          </a>
          <a
            href="#videos"
            onClick={closeMobileMenu}
            className="block py-1 text-sm font-medium text-brand-navy"
          >
            Videos & Walkthroughs
          </a>
          <a
            href="#projects"
            onClick={closeMobileMenu}
            className="block py-1 text-sm font-medium text-brand-navy"
          >
            Delivered & Ongoing Projects
          </a>
          <a
            href="#reviews"
            onClick={closeMobileMenu}
            className="block py-1 text-sm font-medium text-brand-navy"
          >
            Client Reviews & Ratings
          </a>
          <a
            href="#contact"
            onClick={closeMobileMenu}
            className="block py-1 text-sm font-medium text-brand-navy"
          >
            Office & Site Visits
          </a>

          <div className="pt-3 border-t border-brand-slateBorder/60 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                onOpenReviewModal();
              }}
              className="w-full text-center py-2.5 rounded-lg border border-brand-gold text-brand-deepNavy font-semibold text-xs uppercase tracking-wider"
            >
              ★ Write a Review
            </button>
            <a
              href="#callback"
              onClick={closeMobileMenu}
              className="block text-center py-2.5 rounded-lg bg-brand-deepNavy text-white font-bold text-xs uppercase tracking-wider shadow"
            >
              Request Free Callback
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

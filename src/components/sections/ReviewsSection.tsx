import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, CheckCircle2, ChevronLeft, ChevronRight, ShieldCheck, Star } from 'lucide-react';
import { Review } from '../../types';

interface ReviewsSectionProps {
  reviews: Review[];
  onOpenReviewModal: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  onOpenReviewModal,
}) => {
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // All active public reviews from database
  const publicReviews = reviews.filter((r) => r.showOnPublic !== false);
  const fiveStarsCount = publicReviews.filter((r) => r.rating === 5).length;
  const fourStarsCount = publicReviews.filter((r) => r.rating === 4).length;

  // Filter within reviews if user selects star filter
  const displayedReviews = filterRating === 'all'
    ? publicReviews
    : publicReviews.filter((r) => r.rating === filterRating);

  // Calculate dynamic average for all public reviews
  const averageRating = (
    publicReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / (publicReviews.length || 1)
  ).toFixed(1);

  // Update scroll navigation state and active dot indicator
  const updateScrollState = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    // Calculate approx active card index
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 24 : 380;
    const currentIndex = Math.min(
      displayedReviews.length - 1,
      Math.max(0, Math.round(scrollLeft / cardWidth))
    );
    setActiveIndex(currentIndex);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [displayedReviews.length]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 24 : 400;
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 24 : 400;
    el.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
  };

  return (
    <section id="reviews" className="py-20 sm:py-24 bg-brand-warmBg relative overflow-hidden">
      {/* Decorative ambient backdrop */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-brand-goldPale/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-brand-sandBg blur-2xl pointer-events-none" />

      <div className="w-full max-w-[94%] 2xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Header Block with Rating Summary & Scroll Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-6 border-b border-brand-slateBorder/80">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-brand-goldDark mb-2">
              <span className="text-brand-gold">★</span>
              <span>Client Testimonials</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-brand-deepNavy font-semibold">
              What Homeowners Say
            </h2>
            <p className="text-brand-navyLight text-sm sm:text-base max-w-2xl mt-2 leading-relaxed">
              Real experiences from verified families who constructed their homes with Anika Projects in Amravati.
            </p>
          </div>

          {/* Rating Summary + Horizontal Scroll Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Rating pill */}
            <div className="bg-brand-deepNavy text-white px-5 py-3 rounded-2xl border border-brand-gold/40 shadow-md flex items-center gap-4">
              <div className="text-center pr-3 border-r border-brand-navyLight/60">
                <div className="font-display text-2xl sm:text-3xl font-bold text-brand-gold leading-none tabular-nums">
                  {averageRating}
                </div>
                <div className="text-amber-400 text-xs mt-0.5">
                  ★★★★★
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{publicReviews.length} Verified Reviews</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-[11px] text-brand-goldPale/80 mt-0.5">
                  100% Homeowner Satisfaction
                </div>
              </div>
            </div>

            {/* Carousel Previous / Next Nav Buttons */}
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                  canScrollLeft
                    ? 'bg-white hover:bg-brand-deepNavy hover:text-white text-brand-deepNavy border-brand-slateBorder shadow-sm'
                    : 'bg-white/50 text-gray-300 border-gray-200 cursor-not-allowed'
                }`}
                title="Previous review"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                  canScrollRight
                    ? 'bg-brand-deepNavy hover:bg-brand-goldDark text-white border-brand-deepNavy shadow-sm'
                    : 'bg-white/50 text-gray-300 border-gray-200 cursor-not-allowed'
                }`}
                title="Next review"
                aria-label="Next review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Rating Filter Bar & Add Review CTA */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1.5 p-1 bg-brand-sandBg rounded-xl border border-brand-slateBorder/60">
            <button
              type="button"
              onClick={() => setFilterRating('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                filterRating === 'all'
                  ? 'bg-brand-deepNavy text-white shadow-sm'
                  : 'text-brand-navy hover:text-brand-deepNavy'
              }`}
            >
              All Reviews ({publicReviews.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterRating(5)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                filterRating === 5
                  ? 'bg-brand-deepNavy text-white shadow-sm'
                  : 'text-brand-navy hover:text-brand-deepNavy'
              }`}
            >
              ★ 5 Stars ({fiveStarsCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterRating(4)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                filterRating === 4
                  ? 'bg-brand-deepNavy text-white shadow-sm'
                  : 'text-brand-navy hover:text-brand-deepNavy'
              }`}
            >
              ★ 4 Stars ({fourStarsCount})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex text-xs font-medium text-brand-navyLight">
              Swipe or use arrows to view all {publicReviews.length} reviews →
            </span>
            <button
              type="button"
              onClick={onOpenReviewModal}
              className="px-4 py-2 rounded-lg bg-brand-deepNavy hover:bg-brand-goldDark text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-brand-gold" />
              <span>Write Review</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* HORIZONTALLY SCROLLABLE REVIEWS CAROUSEL */}
        {/* ================================================================= */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth no-scrollbar select-none"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {displayedReviews.map((rev, idx) => (
            <article
              key={rev.id}
              className={`w-[85vw] sm:w-[380px] md:w-[420px] flex-shrink-0 snap-start bg-white rounded-2xl p-7 border shadow-sm flex flex-col justify-between relative transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                rev.userSubmitted
                  ? 'border-brand-gold ring-1 ring-brand-gold/30'
                  : 'border-brand-slateBorder'
              }`}
            >
              <span className="absolute top-5 right-6 text-brand-goldPale font-display text-6xl leading-none select-none pointer-events-none">
                “
              </span>

              <div>
                {/* Review Header: Stars, Index, Verification */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-500 text-sm">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs text-gray-400 font-sans ml-2">
                      {rev.date}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {rev.userSubmitted ? 'Verified Homeowner' : `Verified #${idx + 1}`}
                  </span>
                </div>

                <h3 className="font-display font-semibold text-lg text-brand-deepNavy mb-2 pr-6">
                  “{rev.title}”
                </h3>

                <p className="text-sm text-brand-navyLight leading-relaxed line-clamp-4">
                  {rev.message}
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-5 mt-5 border-t border-brand-slateBorder/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-deepNavy text-brand-gold font-display font-bold flex items-center justify-center text-sm border border-brand-gold/30 flex-shrink-0">
                  {rev.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-brand-deepNavy flex items-center gap-1.5 truncate">
                    <span className="truncate">{rev.author}</span>
                    {rev.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-brand-goldDark font-medium truncate">
                    {rev.projectOrArea}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Carousel Indicators / Navigation Dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {displayedReviews.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              className={`transition-all rounded-full cursor-pointer ${
                activeIndex === i
                  ? 'w-7 h-2.5 bg-brand-deepNavy'
                  : 'w-2.5 h-2.5 bg-brand-slateBorder hover:bg-brand-goldDark'
              }`}
              title={`Go to review ${i + 1}`}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

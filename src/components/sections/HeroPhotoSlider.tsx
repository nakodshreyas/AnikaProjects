import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Layers, Maximize2, X } from 'lucide-react';

export interface HeroImageItem {
  id: string;
  title: string;
  imageUrl: string;
  alt: string;
}

const HERO_IMAGES: HeroImageItem[] = [
  {
    id: 'booking-1',
    title: 'Site Booking & Groundbreaking',
    imageUrl: '/images/Booking1.jpeg',
    alt: 'Residential construction site milestone by Anika Projects in Amravati',
  },
  {
    id: 'booking-2',
    title: 'Client Handover & Booking Milestone',
    imageUrl: '/images/Booking2.jpeg',
    alt: 'Happy client project milestone handover with Anika Projects team in Amravati',
  },
  {
    id: 'house-1',
    title: 'Sai Nagar Modern Row Houses',
    imageUrl: '/images/House1.jpeg',
    alt: 'Sai Nagar modern residential row houses delivered by Anika Projects in Amravati',
  },
  {
    id: 'house-2',
    title: 'Prime Luxury Bungalow',
    imageUrl: '/images/House2.jpeg',
    alt: 'Modern luxury independent residential house elevation constructed by Anika Projects in Amravati',
  },
  {
    id: 'house-3',
    title: 'Modern Duplex Villa Elevation',
    imageUrl: '/images/House3.jpeg',
    alt: 'Custom duplex residential house elevation in Amravati by Anika Projects',
  },
  {
    id: 'house-31',
    title: 'Contemporary Multi-Storey House',
    imageUrl: '/images/House31.jpeg',
    alt: 'Contemporary multi-storey residential house completed by Anika Projects in Amravati',
  },
  {
    id: 'house-4',
    title: 'Independent Luxury Villa',
    imageUrl: '/images/House4.jpeg',
    alt: 'Independent luxury residential villa elevation constructed by Anika Projects in Amravati',
  }
];

const AUTO_SCROLL_INTERVAL_MS = 4500;

interface HeroPhotoSliderProps {
  onExploreProjects?: () => void;
}

export const HeroPhotoSlider: React.FC<HeroPhotoSliderProps> = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<number | null>(null);
  const hoverExpandTimerRef = useRef<number | null>(null);
  const hoverCloseTimerRef = useRef<number | null>(null);
  const isUserScrollingRef = useRef(false);
  const [isInViewport, setIsInViewport] = useState(true);

  // Pause auto-scroll when hero slider is not in the viewport so it never interrupts downward scrolling
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInViewport(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (hoverExpandTimerRef.current) clearTimeout(hoverExpandTimerRef.current);
      if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current);
    };
  }, []);

  // Handle keyboard navigation and body scroll lock when expanded view is active
  useEffect(() => {
    if (expandedIndex === null) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseExpanded();
      } else if (e.key === 'ArrowLeft') {
        setExpandedIndex((prev) => (prev !== null ? (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length : 0));
      } else if (e.key === 'ArrowRight') {
        setExpandedIndex((prev) => (prev !== null ? (prev + 1) % HERO_IMAGES.length : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [expandedIndex]);

  // Smoothly scroll to a specific slide index strictly within the component containers
  const scrollToSlide = useCallback((index: number, smooth: boolean = true) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const targetIndex = (index + HERO_IMAGES.length) % HERO_IMAGES.length;
    const cardWidth = container.clientWidth;
    
    container.scrollTo({
      left: targetIndex * cardWidth,
      behavior: smooth ? 'smooth' : 'auto',
    });
    setActiveIndex(targetIndex);

    // Safely scroll thumbnail strip horizontally without touching the main window vertical scroll
    const thumbContainer = thumbnailContainerRef.current;
    if (thumbContainer) {
      const thumbs = thumbContainer.children;
      const targetThumb = thumbs[targetIndex] as HTMLElement;
      if (targetThumb) {
        const targetScrollLeft =
          targetThumb.offsetLeft -
          (thumbContainer.clientWidth - targetThumb.clientWidth) / 2;
        thumbContainer.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: smooth ? 'smooth' : 'auto',
        });
      }
    }
  }, []);

  // Handle scroll events on the track to update active index
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    isUserScrollingRef.current = true;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.clientWidth;
    if (cardWidth > 0) {
      const newIndex = Math.round(scrollLeft / cardWidth);
      if (newIndex >= 0 && newIndex < HERO_IMAGES.length && newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
    
    window.clearTimeout((handleScroll as any)._timeout);
    (handleScroll as any)._timeout = window.setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 150);
  };

  const handleNext = () => {
    scrollToSlide(activeIndex + 1);
  };

  const handlePrev = () => {
    scrollToSlide(activeIndex - 1);
  };

  // Trigger expand smoothly on hover with a subtle dwell to avoid accidental triggers while scrolling
  const handleMouseEnterSlide = (idx: number) => {
    setIsPaused(true);
    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
    if (hoverExpandTimerRef.current) {
      clearTimeout(hoverExpandTimerRef.current);
    }
    hoverExpandTimerRef.current = window.setTimeout(() => {
      setExpandedIndex(idx);
      setIsPinned(false);
    }, 120);
  };

  const handleMouseLeaveSlide = () => {
    if (hoverExpandTimerRef.current) {
      clearTimeout(hoverExpandTimerRef.current);
      hoverExpandTimerRef.current = null;
    }
  };

  const handleClickSlide = (idx: number) => {
    if (hoverExpandTimerRef.current) clearTimeout(hoverExpandTimerRef.current);
    if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current);
    setExpandedIndex(idx);
    setIsPinned(true);
  };

  const handleCloseExpanded = () => {
    if (hoverExpandTimerRef.current) clearTimeout(hoverExpandTimerRef.current);
    if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current);
    setExpandedIndex(null);
    setIsPinned(false);
  };

  const handleMouseEnterExpandedContent = () => {
    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  };

  const handleMouseLeaveExpandedContent = () => {
    // If not pinned by user click, close automatically when mouse exits the expanded view
    if (!isPinned) {
      hoverCloseTimerRef.current = window.setTimeout(() => {
        setExpandedIndex(null);
      }, 250);
    }
  };

  // Auto-scroll loop with pause detection and viewport visibility check
  useEffect(() => {
    if (isPaused || !isInViewport || expandedIndex !== null) return;

    autoScrollTimerRef.current = window.setInterval(() => {
      scrollToSlide(activeIndex + 1);
    }, AUTO_SCROLL_INTERVAL_MS);

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [isPaused, isInViewport, activeIndex, expandedIndex, scrollToSlide]);

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div
      ref={rootRef}
      className="relative w-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      role="region"
      aria-label="Projects We Build Till Now Gallery"
    >
      {/* Main Headline Above Component */}
      <div className="flex items-end justify-between gap-4 mb-2.5 sm:mb-3">
        <div>
          <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-[0.2em] text-brand-goldDark block mb-0.5">
            Verified Portfolio
          </span>
          <h2 className="font-display text-xl sm:text-2xl text-brand-deepNavy font-bold tracking-tight">
            Projects We Build Till Now
          </h2>
        </div>
        <div className="flex items-center gap-1.5 pb-0.5">
          <span className="text-xs font-semibold tabular-nums text-brand-deepNavy/80 px-2 py-0.5 rounded bg-white border border-brand-slateBorder shadow-2xs">
            {activeIndex + 1} / {HERO_IMAGES.length}
          </span>
          {/* Fit / Fill toggle button */}
          <button
            type="button"
            onClick={() => setFitMode(fitMode === 'cover' ? 'contain' : 'cover')}
            className="px-2 py-0.5 rounded bg-white hover:bg-brand-sandBg text-[11px] font-semibold text-brand-deepNavy border border-brand-slateBorder shadow-2xs transition-colors"
            title={fitMode === 'cover' ? 'Switch to Fit (Show entire photo)' : 'Switch to Fill (Edge-to-edge window)'}
            aria-label={fitMode === 'cover' ? 'Switch to Fit' : 'Switch to Fill'}
          >
            {fitMode === 'cover' ? 'Fill' : 'Fit'}
          </button>
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded bg-white hover:bg-brand-sandBg text-brand-deepNavy border border-brand-slateBorder shadow-2xs transition-colors"
            aria-label={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
            title={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-brand-goldDark" /> : <Pause className="w-3.5 h-3.5 text-brand-navy" />}
          </button>
        </div>
      </div>

      {/* Main Image Showcase Container */}
      <div className="relative rounded-2xl overflow-hidden bg-brand-deepNavy border border-brand-slateBorder/80 shadow-2xl">
        
        {/* Scrollable Track */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {HERO_IMAGES.map((item, idx) => (
            <div
              key={item.id}
              onMouseEnter={() => {
                if (!isUserScrollingRef.current) {
                  handleMouseEnterSlide(idx);
                }
              }}
              onMouseLeave={handleMouseLeaveSlide}
              onClick={() => {
                if (!isUserScrollingRef.current) {
                  handleClickSlide(idx);
                }
              }}
              className="w-full shrink-0 snap-center relative h-[360px] sm:h-[420px] md:h-[460px] lg:h-[500px] xl:h-[540px] flex items-center justify-center overflow-hidden bg-brand-deepNavy cursor-zoom-in group"
              title="Hover or click to expand photo"
            >
              {!failedImages[item.id] ? (
                <>
                  {/* Atmospheric blurred ambient backdrop when in contain mode */}
                  {fitMode === 'contain' && (
                    <img
                      src={item.imageUrl}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none select-none transition-transform duration-1000"
                    />
                  )}
                  
                  {/* Subtle darkening vignette overlay at bottom for title readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-deepNavy/85 via-brand-deepNavy/25 to-transparent pointer-events-none z-10" />

                  {/* Sharp image: perfectly fitted edge-to-edge in cover mode, or whole photo in contain mode */}
                  <img
                    src={item.imageUrl}
                    alt={item.alt}
                    onError={() => handleImageError(item.id)}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    className={`relative z-10 transition-transform duration-700 ease-out group-hover:scale-105 ${
                      fitMode === 'cover'
                        ? 'w-full h-full object-cover object-center'
                        : 'max-h-full max-w-full w-auto h-auto object-contain object-center drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]'
                    }`}
                  />

                  {/* Expand indicator badge on hover */}
                  <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg bg-brand-deepNavy/80 group-hover:bg-brand-deepNavy/95 backdrop-blur-md border border-white/20 text-white text-xs flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-all duration-200 shadow-md">
                    <Maximize2 className="w-3.5 h-3.5 text-brand-gold" />
                    <span className="hidden sm:inline text-[11px] font-medium tracking-wide">Hover to expand</span>
                  </div>

                  {/* Clean bottom glassmorphic caption overlay */}
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 max-w-[85%] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-brand-deepNavy/80 backdrop-blur-md border border-white/20 text-white shadow-lg pointer-events-none">
                    <p className="text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-brand-gold shrink-0 animate-pulse" />
                      <span className="truncate">{item.title}</span>
                    </p>
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-brand-navy flex flex-col items-center justify-center p-6 text-center text-brand-goldPale">
                  <Layers className="w-10 h-10 text-brand-gold mb-2 opacity-80" />
                  <p className="font-display font-semibold text-base text-white">{item.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Floating Left and Right Arrow Navigation Controls */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          aria-label="Previous image"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-brand-deepNavy/80 hover:bg-brand-deepNavy text-white backdrop-blur-md border border-white/20 shadow-xl transition-all duration-200 active:scale-90 hover:scale-110"
        >
          <ChevronLeft className="w-4 h-4 text-brand-gold" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          aria-label="Next image"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-brand-deepNavy/80 hover:bg-brand-deepNavy text-white backdrop-blur-md border border-white/20 shadow-xl transition-all duration-200 active:scale-90 hover:scale-110"
        >
          <ChevronRight className="w-4 h-4 text-brand-gold" />
        </button>

        {/* Live Auto-scroll Countdown Progress Bar */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-brand-deepNavy/60 z-30">
          <div
            key={activeIndex}
            className={`h-full bg-brand-gold transition-all ${isPaused ? 'w-full opacity-60' : 'w-full animate-progress'}`}
            style={{
              animationDuration: `${AUTO_SCROLL_INTERVAL_MS}ms`,
              animationTimingFunction: 'linear',
            }}
          />
        </div>
      </div>

      {/* Horizontal Scrollable Thumbnail Strip & Indicator Navigation */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <div
          ref={thumbnailContainerRef}
          className="flex-1 flex items-center gap-2 overflow-x-auto py-0.5 px-0.5 no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {HERO_IMAGES.map((img, i) => {
            const isCurrent = i === activeIndex;
            return (
              <button
                key={`thumb-${img.id}`}
                type="button"
                onClick={() => scrollToSlide(i)}
                aria-label={`View ${img.title}`}
                className={`relative flex-shrink-0 w-14 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  isCurrent
                    ? 'border-brand-gold shadow-md scale-105 opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-95 hover:border-brand-slateBorder'
                }`}
              >
                <img
                  src={img.imageUrl}
                  alt=""
                  className="w-full h-full object-cover object-center"
                />
                {isCurrent && (
                  <div className="absolute inset-0 bg-brand-gold/15 ring-1 ring-inset ring-brand-gold" />
                )}
              </button>
            );
          })}
        </div>

        {/* Indicator Dots */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 flex-shrink-0">
          {HERO_IMAGES.map((_, dotIdx) => (
            <button
              key={`dot-${dotIdx}`}
              type="button"
              onClick={() => scrollToSlide(dotIdx)}
              aria-label={`Go to slide ${dotIdx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                dotIdx === activeIndex
                  ? 'w-6 bg-brand-gold'
                  : 'w-1.5 bg-brand-slateBorder hover:bg-brand-goldDark'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Expanded View with Blurry Glassmorphic Ambient Background (Not Black) */}
      {expandedIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] p-3 sm:p-6 select-none bg-brand-deepNavy/40 backdrop-blur-2xl flex flex-col justify-between animate-in fade-in duration-200"
          onClick={handleCloseExpanded}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded Image View"
        >
          {/* Ambient colorful backdrop blur using the current image - prevents black background */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
            <img
              src={HERO_IMAGES[expandedIndex].imageUrl}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover blur-3xl opacity-35 scale-125 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-brand-deepNavy/25 backdrop-blur-2xl" />
          </div>

          {/* Interactive Content Container */}
          <div
            className="relative z-10 w-full max-w-6xl mx-auto flex flex-col justify-between h-full pointer-events-auto"
            onMouseEnter={handleMouseEnterExpandedContent}
            onMouseLeave={handleMouseLeaveExpandedContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Header Bar */}
            <div className="flex items-center justify-between gap-4 py-2.5 px-4 rounded-2xl bg-white/15 hover:bg-white/20 backdrop-blur-xl border border-white/25 shadow-xl transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse shrink-0" />
                <div>
                  <h3 className="text-white font-display text-sm sm:text-base md:text-lg font-bold">
                    {HERO_IMAGES[expandedIndex].title}
                  </h3>
                  <p className="text-white/75 text-xs hidden sm:block">
                    {HERO_IMAGES[expandedIndex].alt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm font-semibold tabular-nums text-white/90 px-2.5 py-1 rounded-lg bg-white/15 border border-white/20">
                  {expandedIndex + 1} / {HERO_IMAGES.length}
                </span>
                <button
                  type="button"
                  onClick={handleCloseExpanded}
                  className="p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors"
                  aria-label="Close expanded view"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Center Main Photo Frame with Arrow Navigation */}
            <div className="relative flex-1 flex items-center justify-center my-3 sm:my-4 overflow-hidden">
              <img
                src={HERO_IMAGES[expandedIndex].imageUrl}
                alt={HERO_IMAGES[expandedIndex].alt}
                className="max-h-[66vh] sm:max-h-[72vh] max-w-[92vw] w-auto h-auto object-contain rounded-2xl shadow-2xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/25 transition-all duration-300"
              />

              {/* Left Arrow */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedIndex((expandedIndex - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
                }}
                aria-label="Previous image"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-brand-deepNavy/65 hover:bg-brand-deepNavy/90 text-white border border-white/25 backdrop-blur-xl shadow-2xl transition-transform active:scale-90 hover:scale-110"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-brand-gold" />
              </button>

              {/* Right Arrow */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedIndex((expandedIndex + 1) % HERO_IMAGES.length);
                }}
                aria-label="Next image"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-brand-deepNavy/65 hover:bg-brand-deepNavy/90 text-white border border-white/25 backdrop-blur-xl shadow-2xl transition-transform active:scale-90 hover:scale-110"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-brand-gold" />
              </button>
            </div>

            {/* Bottom Thumbnail Strip inside Expanded View */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 px-3 no-scrollbar rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 shadow-xl">
              {HERO_IMAGES.map((img, i) => {
                const isCurrent = i === expandedIndex;
                return (
                  <button
                    key={`expanded-thumb-${img.id}`}
                    type="button"
                    onClick={() => setExpandedIndex(i)}
                    aria-label={`View ${img.title}`}
                    className={`relative flex-shrink-0 w-14 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      isCurrent
                        ? 'border-brand-gold scale-105 opacity-100 ring-2 ring-brand-gold/70 shadow-md'
                        : 'border-white/30 opacity-60 hover:opacity-100 hover:border-white/50'
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt=""
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Play,
  X,
  Sparkles,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  Youtube,
  ChevronLeft,
  ChevronRight,
  Film,
  MoveHorizontal
} from 'lucide-react';
import { ProjectVideo } from '../../types';
import { getYouTubeThumbnailUrl, getYouTubeEmbedUrl, getYouTubeShortsUrl } from '../../utils/youtube';

interface YouTubeVideosSectionProps {
  /** Optional custom title override */
  title?: string;
  /** Optional callback to notify parent of active modal */
  onVideoModalChange?: (isOpen: boolean) => void;
}

export const YouTubeVideosSection: React.FC<YouTubeVideosSectionProps> = ({
  title: customTitle,
  onVideoModalChange,
}) => {
  const [videos, setVideos] = useState<ProjectVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Horizontal scroll container & navigation state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Mouse drag-to-scroll support on desktop
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  // Load published videos from backend API / Supabase
  const loadPublishedVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.videos)) {
        setVideos(data.videos);
      } else {
        throw new Error(data.error || 'Failed to retrieve published videos');
      }
    } catch (err: any) {
      console.warn('[YouTubeVideosSection] Fetch notice:', err.message);
      setError('Unable to load video reels at this moment.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPublishedVideos();

    // Listen to video gallery updates from dashboard
    const handleVideosUpdated = () => {
      loadPublishedVideos();
    };

    window.addEventListener('anika_videos_updated', handleVideosUpdated);
    return () => {
      window.removeEventListener('anika_videos_updated', handleVideosUpdated);
    };
  }, [loadPublishedVideos]);

  // Extract unique categories present in published videos
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    videos.forEach((v) => {
      if (v.category && v.category.trim()) {
        set.add(v.category.trim());
      }
    });
    return Array.from(set);
  }, [videos]);

  // Filter videos by selected category
  const displayedVideos = useMemo(() => {
    if (selectedCategory === 'all') return videos;
    return videos.filter((v) => v.category === selectedCategory);
  }, [videos, selectedCategory]);

  // Update scroll navigation arrows & progress bar
  const updateScrollMetrics = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 12);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 12);

    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      const progress = Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100));
      setScrollProgress(progress);
    } else {
      setScrollProgress(100);
    }
  }, []);

  // Recalculate metrics on resize, video list change, or category filter switch
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Reset scroll to start when changing categories
    el.scrollTo({ left: 0, behavior: 'smooth' });

    const timeout = setTimeout(updateScrollMetrics, 100);
    el.addEventListener('scroll', updateScrollMetrics, { passive: true });
    window.addEventListener('resize', updateScrollMetrics);

    return () => {
      clearTimeout(timeout);
      el.removeEventListener('scroll', updateScrollMetrics);
      window.removeEventListener('resize', updateScrollMetrics);
    };
  }, [displayedVideos.length, selectedCategory, updateScrollMetrics]);

  // Handle smooth button scrolling (left / right)
  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const card = el.querySelector('article');
    const cardWidth = card ? (card as HTMLElement).offsetWidth + 20 : 280;
    // Scroll by ~2 cards or ~560px for a comfortable jump
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Mouse drag-to-scroll listeners for desktop track
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftStartRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const distance = x - startXRef.current;

    if (Math.abs(distance) > 5) {
      hasDraggedRef.current = true;
      setIsDragging(true);
    }

    if (hasDraggedRef.current) {
      e.preventDefault();
      el.scrollLeft = scrollLeftStartRef.current - distance * 1.35;
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    setTimeout(() => {
      hasDraggedRef.current = false;
      setIsDragging(false);
    }, 60);
  };

  // Active video in modal player
  const activeVideo = activeVideoIndex !== null && displayedVideos[activeVideoIndex]
    ? displayedVideos[activeVideoIndex]
    : null;

  // Handle modal open/close & Esc/Arrow keys
  const handleOpenVideo = (index: number) => {
    if (hasDraggedRef.current) return; // ignore click if user dragged the track
    setActiveVideoIndex(index);
    onVideoModalChange?.(true);
  };

  const handleCloseVideo = () => {
    setActiveVideoIndex(null);
    onVideoModalChange?.(false);
  };

  const handlePrevVideo = () => {
    if (activeVideoIndex === null || displayedVideos.length === 0) return;
    setActiveVideoIndex((prev) => (prev! > 0 ? prev! - 1 : displayedVideos.length - 1));
  };

  const handleNextVideo = () => {
    if (activeVideoIndex === null || displayedVideos.length === 0) return;
    setActiveVideoIndex((prev) => (prev! < displayedVideos.length - 1 ? prev! + 1 : 0));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeVideo) return;
      if (e.key === 'Escape') {
        handleCloseVideo();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        handlePrevVideo();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        handleNextVideo();
      }
    };

    if (activeVideo) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeVideo, activeVideoIndex, displayedVideos.length]);

  // If loading finished, no error, and no published videos: hide cleanly
  if (!loading && !error && videos.length === 0) {
    return null;
  }

  return (
    <section id="videos" className="py-20 sm:py-24 bg-brand-warmBg/70 border-t border-brand-slateBorder/40 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-brand-goldPale/35 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-brand-sandBg/45 blur-2xl pointer-events-none" />

      <div className="w-full max-w-[94%] 2xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-brand-slateBorder/60">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-600 text-xs font-bold tracking-[0.18em] uppercase mb-3">
              <Youtube className="w-3.5 h-3.5 fill-current text-red-600" />
              <span>Project Reels & Shorts</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-brand-deepNavy font-semibold tracking-tight">
              {customTitle || 'Anika Projects on Video'}
            </h2>
            <p className="text-brand-navyLight text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Explore our projects, construction progress, property walkthroughs, and real spaces we&apos;re building across Amravati.
            </p>
          </div>

          {/* Navigation Controls & Video Counter in Header */}
          <div className="flex items-center gap-3 self-start md:self-end shrink-0">
            {/* Total Videos Badge */}
            {displayedVideos.length > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-brand-slateBorder text-brand-navy text-xs font-semibold shadow-xs">
                <Film className="w-3.5 h-3.5 text-brand-goldDark" />
                <span>
                  {displayedVideos.length} {displayedVideos.length === 1 ? 'Reel' : 'Reels'}
                </span>
              </span>
            )}

            {/* Left Scroll Button */}
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll videos left"
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                canScrollLeft
                  ? 'bg-white hover:bg-brand-deepNavy text-brand-navy hover:text-white border-brand-slateBorder shadow-sm hover:shadow-md hover:scale-105'
                  : 'bg-white/50 text-gray-300 border-gray-200 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Scroll Button */}
            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll videos right"
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                canScrollRight
                  ? 'bg-white hover:bg-brand-deepNavy text-brand-navy hover:text-white border-brand-slateBorder shadow-sm hover:shadow-md hover:scale-105'
                  : 'bg-white/50 text-gray-300 border-gray-200 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills (if multiple categories present) */}
        {!loading && !error && availableCategories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-3 text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full font-semibold transition-all cursor-pointer shrink-0 border ${
                selectedCategory === 'all'
                  ? 'bg-brand-deepNavy text-brand-goldPale border-brand-deepNavy shadow-sm'
                  : 'bg-white text-brand-navy border-brand-slateBorder hover:border-brand-gold/60 hover:bg-brand-warmBg'
              }`}
            >
              All Videos ({videos.length})
            </button>
            {availableCategories.map((cat) => {
              const count = videos.filter((v) => v.category === cat).length;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full font-semibold transition-all cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-brand-deepNavy text-brand-goldPale border-brand-deepNavy shadow-sm'
                      : 'bg-white text-brand-navy border-brand-slateBorder hover:border-brand-gold/60 hover:bg-brand-warmBg'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Loading Skeleton: Horizontally Scrollable Cards */}
        {loading && (
          <div className="flex gap-4 sm:gap-5 overflow-hidden py-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="w-[220px] sm:w-[240px] md:w-[260px] lg:w-[275px] shrink-0 aspect-[9/16] rounded-2xl overflow-hidden bg-white border border-brand-slateBorder/60 shadow-sm animate-pulse relative flex flex-col justify-between p-4"
              >
                <div className="absolute inset-0 bg-gray-200/80" />
                <div className="relative z-10 flex justify-between">
                  <div className="h-5 w-16 bg-gray-300 rounded-full" />
                  <div className="h-5 w-12 bg-gray-300 rounded-full" />
                </div>
                <div className="relative z-10 space-y-2">
                  <div className="h-3 bg-gray-300 rounded w-1/3" />
                  <div className="h-4 bg-gray-300 rounded w-4/5" />
                  <div className="h-3 bg-gray-300 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State with Retry Button */}
        {!loading && error && (
          <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl border border-red-200 shadow-sm">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-sm text-brand-navy font-medium mb-4">{error}</p>
            <button
              type="button"
              onClick={loadPublishedVideos}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-white text-xs font-semibold rounded-lg hover:bg-brand-deepNavy transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Loading Reels</span>
            </button>
          </div>
        )}

        {/* Empty category filter fallback */}
        {!loading && !error && displayedVideos.length === 0 && videos.length > 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-brand-slateBorder p-6 max-w-md mx-auto">
            <Film className="w-10 h-10 text-brand-gold mx-auto mb-2 opacity-80" />
            <h4 className="font-semibold text-brand-navy text-base">No reels found in this category</h4>
            <p className="text-xs text-brand-navyLight mt-1 mb-4">Switch to another category to view videos.</p>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="px-4 py-2 rounded-lg bg-brand-deepNavy text-white text-xs font-bold"
            >
              Show All Videos
            </button>
          </div>
        )}

        {/* Horizontally Scrollable 9:16 Video Reels Track */}
        {!loading && !error && displayedVideos.length > 0 && (
          <div className="relative group/carousel">
            
            {/* Left Edge Floating Arrow (Desktop) */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => handleScroll('left')}
                aria-label="Previous videos"
                className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/95 text-brand-deepNavy border border-brand-slateBorder shadow-xl items-center justify-center hover:bg-brand-deepNavy hover:text-white hover:scale-110 transition-all cursor-pointer backdrop-blur-md"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Right Edge Floating Arrow (Desktop) */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => handleScroll('right')}
                aria-label="Next videos"
                className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/95 text-brand-deepNavy border border-brand-slateBorder shadow-xl items-center justify-center hover:bg-brand-deepNavy hover:text-white hover:scale-110 transition-all cursor-pointer backdrop-blur-md"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Left Gradient Fade Mask */}
            <div
              className={`absolute left-0 inset-y-0 w-12 bg-gradient-to-r from-brand-warmBg to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
                canScrollLeft ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Right Gradient Fade Mask */}
            <div
              className={`absolute right-0 inset-y-0 w-12 bg-gradient-to-l from-brand-warmBg to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
                canScrollRight ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* The Horizontal Track */}
            <div
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`horizontal-scroll-container overflow-x-auto flex gap-4 sm:gap-5 pb-5 pt-2 snap-x snap-mandatory ${
                isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
              }`}
            >
              {displayedVideos.map((video, idx) => {
                const defaultThumb = getYouTubeThumbnailUrl(video.youtubeVideoId, 'hq');
                const mqThumb = getYouTubeThumbnailUrl(video.youtubeVideoId, 'mq');

                return (
                  <article
                    key={video.id}
                    onClick={() => handleOpenVideo(idx)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Watch reel: ${video.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenVideo(idx);
                      }
                    }}
                    className="group relative w-[220px] sm:w-[240px] md:w-[260px] lg:w-[275px] shrink-0 aspect-[9/16] rounded-2xl overflow-hidden bg-brand-deepNavy border border-brand-slateBorder/90 shadow-md hover:shadow-2xl hover:border-brand-gold/70 transition-all duration-300 flex flex-col justify-between cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold hover:-translate-y-1.5 snap-start"
                  >
                    {/* Full-bleed Thumbnail Image */}
                    <img
                      src={defaultThumb}
                      alt={video.title}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== mqThumb) {
                          target.src = mqThumb;
                        }
                      }}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                    />

                    {/* Gradient Overlays (Top and Bottom Vignettes) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30 opacity-90 group-hover:opacity-85 transition-opacity pointer-events-none" />

                    {/* Top Header Bar */}
                    <div className="relative z-10 p-3 sm:p-3.5 flex items-center justify-between gap-2 pointer-events-none">
                      {/* Featured Star Badge */}
                      {video.isFeatured ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-gold text-brand-deepNavy text-[10px] font-bold shadow-md">
                          <Sparkles className="w-2.5 h-2.5 fill-current" />
                          <span>Featured</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-black/40 text-white/80 text-[10px] font-mono backdrop-blur-xs">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                      )}

                      {/* YouTube Shorts / Reel Badge */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600/90 text-white text-[10px] font-bold shadow-md backdrop-blur-sm">
                        <Youtube className="w-3 h-3 fill-current" />
                        <span>Reel</span>
                      </span>
                    </div>

                    {/* Center Floating Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 text-white border border-white/40 flex items-center justify-center backdrop-blur-md shadow-xl group-hover:scale-115 group-hover:bg-brand-gold group-hover:text-brand-deepNavy group-hover:border-brand-gold transition-all duration-300">
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
                      </div>
                    </div>

                    {/* Bottom Information Overlay */}
                    <div className="relative z-10 p-3.5 sm:p-4 space-y-1.5 pointer-events-none">
                      {/* Category Tag */}
                      {video.category && (
                        <span className="inline-block text-[10px] sm:text-[11px] font-bold text-brand-goldLight uppercase tracking-wider">
                          {video.category}
                        </span>
                      )}

                      {/* Reel Title */}
                      <h3 className="font-display font-semibold text-xs sm:text-sm text-white line-clamp-2 leading-snug group-hover:text-brand-goldLight transition-colors">
                        {video.title}
                      </h3>

                      {/* Short Description */}
                      {video.description && (
                        <p className="text-[11px] text-brand-goldPale/75 line-clamp-1 leading-normal">
                          {video.description}
                        </p>
                      )}

                      {/* Action Hint */}
                      <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-brand-goldLight/90">
                        <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>Watch Reel</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </span>
                        <span className="text-white/60 font-normal">
                          9:16 HD
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Horizontal Scroll Progress & Swipe Guidance Footer */}
            <div className="mt-4 pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-navyLight">
              {/* Guidance Hint */}
              <div className="flex items-center gap-1.5 text-brand-navy/70 text-[11px] sm:text-xs">
                <MoveHorizontal className="w-4 h-4 text-brand-goldDark" />
                <span>Scroll or drag horizontally to explore all {displayedVideos.length} project videos</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full sm:w-48 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-brand-slateBorder/50 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-gold to-brand-goldDark rounded-full transition-all duration-150"
                    style={{ width: `${scrollProgress}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-brand-navyLight shrink-0">
                  {Math.round(scrollProgress)}%
                </span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Vertical 9:16 Smartphone Reel Player Modal */}
      {activeVideo && activeVideoIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeVideo.title}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fadeIn"
          onClick={handleCloseVideo}
        >
          {/* Navigation Arrow: Previous Reel */}
          {displayedVideos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevVideo();
              }}
              title="Previous Reel (Left Arrow)"
              className="hidden md:flex absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center backdrop-blur-md transition-all cursor-pointer z-50 border border-white/20 hover:scale-105"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Navigation Arrow: Next Reel */}
          {displayedVideos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextVideo();
              }}
              title="Next Reel (Right Arrow)"
              className="hidden md:flex absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center backdrop-blur-md transition-all cursor-pointer z-50 border border-white/20 hover:scale-105"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Smartphone 9:16 Reel Container */}
          <div
            className="relative w-full max-w-[380px] sm:max-w-[400px] h-[85vh] max-h-[760px] aspect-[9/16] bg-black rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-white/20 sm:border-brand-gold/40 flex flex-col animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Floating Top Controls Header */}
            <div className="absolute top-0 inset-x-0 z-30 p-3 sm:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white pointer-events-auto">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="p-1 rounded bg-red-600 text-white text-[10px] font-bold shrink-0">
                  Shorts
                </span>
                <span className="text-xs font-semibold truncate text-white">
                  {activeVideo.title}
                </span>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseVideo}
                aria-label="Close reel player"
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Vertical 9:16 Embedded YouTube Shorts Player */}
            <div className="relative w-full h-full bg-black flex-1">
              <iframe
                src={getYouTubeEmbedUrl(activeVideo.youtubeVideoId, true)}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>

            {/* Floating Bottom Reel Controls */}
            <div className="absolute bottom-0 inset-x-0 z-30 p-3.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-between gap-3 text-white pointer-events-auto">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {activeVideo.title}
                </p>
                <span className="text-[10px] text-brand-goldLight block truncate">
                  {activeVideo.category || 'Anika Projects Walkthrough'} · Amravati
                </span>
              </div>

              <a
                href={getYouTubeShortsUrl(activeVideo.youtubeVideoId)}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold backdrop-blur-md transition-colors"
              >
                <span>YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

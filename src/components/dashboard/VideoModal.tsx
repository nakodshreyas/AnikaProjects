import React, { useState, useEffect } from 'react';
import { X, Youtube, Check, AlertCircle, Sparkles, Eye, EyeOff, Layers, ExternalLink } from 'lucide-react';
import { ProjectVideo } from '../../types';
import { parseAndValidateYouTubeUrl, getYouTubeThumbnailUrl, VIDEO_CATEGORIES } from '../../utils/youtube';

interface VideoModalProps {
  isOpen: boolean;
  video: ProjectVideo | null;
  onClose: () => void;
  onSave: (videoData: Partial<ProjectVideo> & { youtubeUrl?: string }) => Promise<void>;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  video,
  onClose,
  onSave,
}) => {
  const isEditing = Boolean(video);

  const [title, setTitle] = useState('');
  const [youtubeInput, setYoutubeInput] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('Project Walkthrough');
  const [customCategory, setCustomCategory] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);

  const [validationResult, setValidationResult] = useState<ReturnType<typeof parseAndValidateYouTubeUrl>>({ isValid: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize or reset form fields
  useEffect(() => {
    if (video) {
      setTitle(video.title || '');
      setYoutubeInput(video.youtubeVideoId ? `https://www.youtube.com/watch?v=${video.youtubeVideoId}` : '');
      setDescription(video.description || '');
      if (VIDEO_CATEGORIES.includes(video.category as any)) {
        setCategory(video.category || 'Project Walkthrough');
        setCustomCategory('');
      } else {
        setCategory('Other');
        setCustomCategory(video.category || '');
      }
      setDisplayOrder(video.displayOrder || 1);
      setIsPublished(Boolean(video.isPublished));
      setIsFeatured(Boolean(video.isFeatured));
      setValidationResult({
        isValid: true,
        videoId: video.youtubeVideoId,
        canonicalUrl: `https://www.youtube.com/watch?v=${video.youtubeVideoId}`,
        thumbnailUrl: getYouTubeThumbnailUrl(video.youtubeVideoId, 'hq'),
      });
    } else {
      setTitle('');
      setYoutubeInput('');
      setDescription('');
      setCategory('Project Walkthrough');
      setCustomCategory('');
      setDisplayOrder(1);
      setIsPublished(true);
      setIsFeatured(false);
      setValidationResult({ isValid: false });
    }
    setFormError(null);
  }, [video, isOpen]);

  // Live validate YouTube URL as user types
  const handleUrlChange = (value: string) => {
    setYoutubeInput(value);
    setFormError(null);
    if (!value.trim()) {
      setValidationResult({ isValid: false });
      return;
    }
    const result = parseAndValidateYouTubeUrl(value);
    setValidationResult(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setFormError('Video title is required.');
      return;
    }

    const parseResult = parseAndValidateYouTubeUrl(youtubeInput);
    if (!parseResult.isValid || !parseResult.videoId) {
      setFormError(parseResult.error || 'Please provide a valid YouTube video link or 11-character video ID.');
      return;
    }

    const finalCategory = category === 'Other' ? customCategory.trim() : category;

    setIsSubmitting(true);
    try {
      await onSave({
        title: cleanTitle,
        youtubeVideoId: parseResult.videoId,
        youtubeUrl: parseResult.canonicalUrl,
        description: description.trim() || undefined,
        category: finalCategory || undefined,
        displayOrder: Number(displayOrder) || 1,
        isPublished,
        isFeatured,
      });
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save video. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-brand-slateBorder overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#142332] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center">
              <Youtube className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 id="video-modal-title" className="font-semibold text-base text-white flex items-center gap-2">
                <span>{isEditing ? 'Edit YouTube Reel / Short' : 'Add New YouTube Reel'}</span>
                <span className="px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 text-[10px] font-bold border border-red-500/30">
                  9:16 Vertical
                </span>
              </h3>
              <p className="text-[11px] text-brand-goldPale/70">
                {isEditing ? 'Update reel details and public visibility' : 'Add a vertical video reel to the homepage Anika Projects showcase'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {formError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1">{formError}</div>
            </div>
          )}

          {/* Video Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1e2e3e] mb-1.5">
              Reel Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sai Nagar Modern Row Houses — Turnkey Walkthrough"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#d6d4cf] text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
            />
          </div>

          {/* YouTube Link or ID */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1e2e3e] mb-1.5">
              YouTube Shorts URL or Video ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={youtubeInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/shorts/... or youtu.be/... or 11-char ID"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 transition-colors ${
                validationResult.isValid
                  ? 'border-emerald-500 focus:ring-emerald-400'
                  : youtubeInput && !validationResult.isValid
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-[#d6d4cf] focus:ring-brand-gold/60 focus:border-brand-gold'
              }`}
            />
            <p className="text-[11px] text-[#74777f] mt-1">
              Optimized for 9:16 vertical format. Accepts YouTube Shorts, youtu.be, standard links, and 11-character IDs.
            </p>
          </div>

          {/* Live 9:16 Reel Thumbnail & Video ID Preview */}
          {validationResult.isValid && validationResult.videoId && (
            <div className="p-3.5 rounded-xl bg-[#f8f7f4] border border-[#e4e2de] flex items-center gap-3.5 animate-fadeIn">
              <div className="relative w-16 sm:w-20 aspect-[9/16] rounded-xl overflow-hidden bg-black shrink-0 border border-black/10 shadow-sm">
                <img
                  src={getYouTubeThumbnailUrl(validationResult.videoId, 'hq')}
                  alt="Reel thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 inset-x-1 py-0.5 rounded bg-black/70 text-[9px] font-bold text-center text-white">
                  9:16 Reel
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mb-1">
                  <Check className="w-3 h-3 text-emerald-700" />
                  <span>Valid YouTube Reel ID: {validationResult.videoId}</span>
                </div>
                <p className="text-[11px] text-[#44474c] truncate">
                  Ready to display in vertical 9:16 reel player.
                </p>
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1e2e3e] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#d6d4cf] text-sm text-[#1b1c1a] bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
              >
                {VIDEO_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Other">Other (Custom category)</option>
              </select>
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1e2e3e] mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#d6d4cf] text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
              />
            </div>
          </div>

          {/* Custom Category Input if "Other" selected */}
          {category === 'Other' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1e2e3e] mb-1.5">
                Custom Category Name
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Foundation & Soil Curing"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#d6d4cf] text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1e2e3e] mb-1.5">
              Description <span className="text-[#74777f] font-normal normal-case">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief walkthrough highlight, project milestones, or architectural notes..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#d6d4cf] text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
            />
          </div>

          {/* Switches for Published and Featured */}
          <div className="p-4 rounded-xl bg-[#fcfbf7] border border-[#e4e2de] space-y-3">
            {/* Published Toggle */}
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2.5">
                {isPublished ? (
                  <Eye className="w-4 h-4 text-emerald-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-[#74777f]" />
                )}
                <div>
                  <span className="text-xs font-bold text-[#1e2e3e] block">
                    Publish on Public Website
                  </span>
                  <span className="text-[11px] text-[#74777f]">
                    {isPublished
                      ? 'Video is live and visible on homepage gallery.'
                      : 'Saved as draft in dashboard only. Hidden from public.'}
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
              />
            </label>

            <div className="border-t border-[#e4e2de]/60" />

            {/* Featured Toggle */}
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <div>
                  <span className="text-xs font-bold text-[#1e2e3e] block">
                    Mark as Featured Video
                  </span>
                  <span className="text-[11px] text-[#74777f]">
                    Displays a prominent gold featured badge on the video card.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#e4e2de] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-[#44474c] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#081928] hover:bg-[#1e2e3e] rounded-lg shadow transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Video...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Add to Video Gallery'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

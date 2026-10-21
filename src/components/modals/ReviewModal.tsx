import React, { useState, useEffect } from 'react';
import { X, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { Review } from '../../types';
import { getInitials } from '../../utils/formatters';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (newReview: Review) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: '1.0 - Needs Improvement',
  2: '2.0 - Fair Experience',
  3: '3.0 - Good Work',
  4: '4.0 - Very Good & Reliable',
  5: '5.0 - Exceptional Quality & Service',
};

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [author, setAuthor] = useState('');
  const [projectOrArea, setProjectOrArea] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setErrorMsg('');
      setSuccessMsg('');
      setIsSubmitting(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!author.trim() || !projectOrArea.trim() || !title.trim() || !message.trim()) {
      setErrorMsg('Please fill out all mandatory fields marked with an asterisk (*).');
      return;
    }

    if (message.trim().length < 20) {
      setErrorMsg('Please provide at least a sentence or two (minimum 20 characters) describing your experience.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const formattedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newRev: Review = {
      id: `rev-user-${Date.now()}`,
      author: author.trim(),
      initials: getInitials(author.trim()),
      projectOrArea: projectOrArea.trim(),
      title: title.trim(),
      message: message.trim(),
      rating,
      date: formattedDate,
      verified: true,
      userSubmitted: true,
      showOnPublic: true,
    };

    // Send directly to backend database route /api/reviews
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRev),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to submit review to database');
        }
        const saved = data?.review ? { ...newRev, ...data.review } : newRev;
        onSubmitReview(saved);
        window.dispatchEvent(new Event('anika_reviews_updated'));
        setSuccessMsg(`Thank you, ${author.trim()}! Your review has been successfully verified and recorded in the database.`);
        setTimeout(() => {
          setAuthor('');
          setProjectOrArea('');
          setTitle('');
          setMessage('');
          setPhone('');
          setRating(5);
          onClose();
        }, 1500);
      })
      .catch((err) => {
        console.warn('Review API submission notice:', err);
        setErrorMsg(err.message || 'Could not save review to the database. Please try again.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const activeStarCount = hoverRating ?? rating;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-review-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-deepNavy/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl border border-brand-gold/40 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-brand-deepNavy p-6 sm:p-7 text-white flex items-center justify-between border-b border-brand-gold/30">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold block">
              Direct Feedback
            </span>
            <h2 id="modal-review-title" className="font-display text-2xl font-semibold text-white">
              Write a Client Review
            </h2>
            <p className="text-xs text-brand-goldPale/80 mt-0.5">
              Share your authentic construction or home-buying journey with Anika Projects.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-brand-navy hover:bg-brand-navyLight text-white hover:text-brand-gold transition-colors focus:outline-none"
            aria-label="Close review modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {successMsg ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-display font-semibold text-xl text-brand-deepNavy">Review Submitted!</h3>
              <p className="text-sm text-brand-navyLight max-w-md mx-auto">{successMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3.5 rounded-xl text-xs font-semibold bg-red-50 text-red-800 border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-deepNavy mb-2">
                  Overall Rating <span className="text-brand-goldDark">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                        aria-label={`${starVal} star rating`}
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            starVal <= activeStarCount
                              ? 'text-amber-500 fill-amber-400'
                              : 'text-brand-slateBorder'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-brand-goldDark bg-brand-sandBg px-2.5 py-1 rounded-md">
                    {RATING_LABELS[rating]}
                  </span>
                </div>
              </div>

              {/* Name & Property */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modalAuthor" className="block text-xs font-bold uppercase tracking-wider text-brand-deepNavy mb-1.5">
                    Your Full Name <span className="text-brand-goldDark">*</span>
                  </label>
                  <input
                    type="text"
                    id="modalAuthor"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Ramesh Deshmukh"
                    className="w-full px-4 py-2.5 rounded-lg border border-brand-slateBorder focus:border-brand-gold focus:ring-1 focus:ring-brand-gold bg-brand-warmBg/50 text-sm text-brand-deepNavy outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="modalProject" className="block text-xs font-bold uppercase tracking-wider text-brand-deepNavy mb-1.5">
                    Property / Area in Amravati <span className="text-brand-goldDark">*</span>
                  </label>
                  <input
                    type="text"
                    id="modalProject"
                    required
                    value={projectOrArea}
                    onChange={(e) => setProjectOrArea(e.target.value)}
                    placeholder="e.g. Sai Nagar Row House / Akoli Road"
                    className="w-full px-4 py-2.5 rounded-lg border border-brand-slateBorder focus:border-brand-gold focus:ring-1 focus:ring-brand-gold bg-brand-warmBg/50 text-sm text-brand-deepNavy outline-none"
                  />
                </div>
              </div>

              {/* Title & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modalTitle" className="block text-xs font-bold uppercase tracking-wider text-brand-deepNavy mb-1.5">
                    Review Headline <span className="text-brand-goldDark">*</span>
                  </label>
                  <input
                    type="text"
                    id="modalTitle"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Solid build quality & timely handover"
                    className="w-full px-4 py-2.5 rounded-lg border border-brand-slateBorder focus:border-brand-gold focus:ring-1 focus:ring-brand-gold bg-brand-warmBg/50 text-sm text-brand-deepNavy outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="modalPhone" className="block text-xs font-bold uppercase tracking-wider text-brand-deepNavy mb-1.5">
                    Mobile Number <span className="text-gray-400 font-normal">(Private)</span>
                  </label>
                  <input
                    type="tel"
                    id="modalPhone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Optional verification"
                    className="w-full px-4 py-2.5 rounded-lg border border-brand-slateBorder focus:border-brand-gold focus:ring-1 focus:ring-brand-gold bg-brand-warmBg/50 text-sm text-brand-deepNavy outline-none"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="modalMessage" className="block text-xs font-bold uppercase tracking-wider text-brand-deepNavy mb-1.5">
                  Detailed Experience & Observations <span className="text-brand-goldDark">*</span>
                </label>
                <textarea
                  id="modalMessage"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detail the construction quality, materials used, communication, structural finishing, and transparency..."
                  className="w-full px-4 py-2.5 rounded-lg border border-brand-slateBorder focus:border-brand-gold focus:ring-1 focus:ring-brand-gold bg-brand-warmBg/50 text-sm text-brand-deepNavy outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-brand-slateBorder/60">
                <p className="text-[11px] text-gray-500">
                  Published with verified homeowner status on the Anika Projects wall.
                </p>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg border border-brand-slateBorder text-brand-deepNavy hover:bg-brand-sandBg font-semibold text-xs uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-brand-deepNavy hover:bg-brand-goldDark text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Publishing Review...' : 'Publish Review →'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

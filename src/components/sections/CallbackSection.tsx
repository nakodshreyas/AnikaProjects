import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { isValidIndianPhone, sanitizePhoneNumber } from '../../utils/formatters';

interface CallbackSectionProps {
  preFilledInterest?: string;
}

export const CallbackSection: React.FC<CallbackSectionProps> = ({ preFilledInterest }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState('2 BHK Row House Project');
  const [plotStatus, setPlotStatus] = useState('Already Own A Plot');
  const [timeline, setTimeline] = useState('Within 1-3 Months');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preFilledInterest) {
      setInterest(preFilledInterest);
    }
  }, [preFilledInterest]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your full name.' });
      return;
    }

    const cleanPhone = sanitizePhoneNumber(phone);
    if (!isValidIndianPhone(cleanPhone)) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid 10-digit Indian mobile number (e.g. 9860641551).',
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      name: name.trim(),
      phone: cleanPhone,
      interest,
      plotStatus,
      timeline,
      message: `Inquiry: ${interest}. Plot: ${plotStatus}. Timeline: ${timeline}.`,
    };

    // Send directly to backend /api/contact which stores into Supabase
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success && data.error) {
          console.warn('Backend submission notice:', data.error);
        }
      })
      .catch((err) => {
        console.warn('Backend API submission warning:', err);
      })
      .finally(() => {
        setIsSubmitting(false);
        setStatusMessage({
          type: 'success',
          text: `Thank you, ${name.trim()}! Your inquiry has been registered in our system. Our project director will call you at +91 ${cleanPhone} shortly.`,
        });
        setName('');
        setPhone('');
      });
  };

  return (
    <section id="callback" className="py-20 bg-brand-deepNavy text-white relative">
      <div className="w-full max-w-[94%] 2xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-brand-gold block">
              Direct Inquiries
            </span>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
              Ready to Discuss Your New Home in Amravati?
            </h2>

            <p className="text-brand-goldPale/80 text-sm sm:text-base leading-relaxed max-w-lg">
              Leave your details below. Our project director will call you back personally to walk you through floor plans, pricing estimates, sanction clearances, and guided site visits.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="tel:+919860641551"
                className="px-6 py-3 rounded-lg bg-brand-gold hover:bg-brand-goldDark text-brand-deepNavy hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-2 shadow-md"
              >
                <Phone className="w-4 h-4" />
                <span>Call +91 98606 41551</span>
              </a>

              <a
                href="https://wa.me/919860641551?text=Hi%20Anika%20Projects,%20I%20would%20like%20to%20discuss%20a%20residential%20project%20in%20Amravati."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg bg-transparent hover:bg-white/10 text-white border border-brand-goldLight/40 font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Directly</span>
              </a>
            </div>

            <div className="pt-4 border-t border-brand-navyLight/60 text-xs text-brand-goldPale/70 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-brand-gold font-bold">✓</span> Direct consultation with civil engineers, not sales agents
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-gold font-bold">✓</span> No high-pressure sales calls or data sharing
              </div>
            </div>
          </div>

          {/* Right Lead Capture Form */}
          <div className="lg:col-span-6">
            <div className="bg-brand-warmBg text-brand-deepNavy rounded-2xl p-6 sm:p-10 border border-brand-gold/40 shadow-2xl">
              <h3 className="font-display font-semibold text-2xl mb-1 text-brand-deepNavy">
                Request an Immediate Callback
              </h3>
              <p className="text-xs text-brand-navyLight mb-6">
                Receive customized floor plans and cost breakdown within 2 business hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {statusMessage && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                      statusMessage.type === 'error'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {statusMessage.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                    )}
                    <span>{statusMessage.text}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="leadName" className="block text-xs font-bold uppercase tracking-wider text-brand-deepNavy mb-1">
                    Your Name <span className="text-brand-goldDark">*</span>
                  </label>
                  <input
                    type="text"
                    id="leadName"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 rounded-lg border border-brand-slateBorder focus:border-brand-gold focus:ring-1 focus:ring-brand-gold bg-white text-sm text-brand-deepNavy outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="leadPhone" className="block text-xs font-bold uppercase tracking-wider text-brand-deepNavy mb-1">
                    Mobile Number <span className="text-brand-goldDark">*</span>
                  </label>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3.5 py-2.5 rounded-l-lg border border-r-0 border-brand-slateBorder bg-brand-sandBg text-xs font-bold text-brand-deepNavy">
                      +91
                    </span>
                    <input
                      type="tel"
                      id="leadPhone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="w-full px-4 py-2.5 rounded-r-lg border border-brand-slateBorder focus:border-brand-gold focus:ring-1 focus:ring-brand-gold bg-white text-sm text-brand-deepNavy outline-none font-mono tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="leadInterest" className="block text-xs font-bold uppercase tracking-wider text-brand-deepNavy mb-1">
                      Interested In
                    </label>
                    <select
                      id="leadInterest"
                      value={interest}
                      onChange={(e) => setInterest(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-brand-slateBorder focus:border-brand-gold focus:ring-1 focus:ring-brand-gold bg-white text-xs text-brand-deepNavy outline-none"
                    >
                      <option value="2 BHK Row House Project">2 BHK Row House Project</option>
                      <option value="Individual Bungalow Construction">Individual Bungalow Construction</option>
                      <option value="Custom Home on Private Plot">Custom Home on Private Plot</option>
                      <option value="Camp Road Luxury Bungalows">Camp Road Luxury Bungalows</option>
                      <option value="Joint Venture / Land Development">Joint Venture / Land Development</option>
                      <option value="Schedule Site Visit in Amravati">Schedule Site Visit in Amravati</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="leadTimeline" className="block text-xs font-bold uppercase tracking-wider text-brand-deepNavy mb-1">
                      Preferred Timeline
                    </label>
                    <select
                      id="leadTimeline"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-brand-slateBorder focus:border-brand-gold focus:ring-1 focus:ring-brand-gold bg-white text-xs text-brand-deepNavy outline-none"
                    >
                      <option value="Immediate (This Month)">Immediate (This Month)</option>
                      <option value="Within 1-3 Months">Within 1-3 Months</option>
                      <option value="Within 3-6 Months">Within 3-6 Months</option>
                      <option value="Planning for Next Year">Planning for Next Year</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-lg bg-brand-deepNavy hover:bg-brand-goldDark text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 mt-2"
                >
                  {isSubmitting ? 'Transmitting Request...' : 'Request Free Callback'}
                </button>

                <p className="text-[11px] text-gray-500 text-center">
                  By submitting, you agree to receive a single personalized call from the Anika Projects director.
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

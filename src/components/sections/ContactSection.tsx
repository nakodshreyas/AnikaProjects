import React from 'react';
import { MapPin, Phone, MessageCircle, Mail, Instagram, Youtube, Clock, ArrowRight } from 'lucide-react';

export const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-20 bg-brand-sandBg/40 border-t border-brand-slateBorder/80">
      <div className="w-full max-w-[94%] 2xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wide uppercase text-brand-goldDark mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
              <span>Office & Site Visits</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-brand-deepNavy font-semibold">
              Visit Our Office in Amravati
            </h2>
            <p className="text-brand-navyLight text-sm sm:text-base max-w-2xl mt-3 leading-relaxed">
              Drop by for architectural consultations, master plan reviews, civil material sample inspections, and guided tours of ongoing project sites.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://maps.app.goo.gl/cuug7FtYQo9FL7Zk6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-deepNavy hover:bg-brand-goldDark text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow transition-all duration-200"
            >
              <MapPin className="w-4 h-4 text-brand-gold" />
              <span>Get Directions</span>
            </a>
            <a
              href="tel:+919860641551"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-brand-sandBg text-brand-deepNavy border border-brand-slateBorder text-xs font-bold uppercase tracking-wider transition-all duration-200"
            >
              <Phone className="w-4 h-4 text-brand-goldDark" />
              <span>Call Office</span>
            </a>
          </div>
        </div>

        {/* Main Grid: Interactive Map + Contact Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Interactive Google Map Column */}
          <div className="lg:col-span-7 flex flex-col h-full bg-white rounded-2xl border border-brand-slateBorder overflow-hidden shadow-sm">
            <div className="relative min-h-[380px] sm:min-h-[440px] flex-1 w-full bg-brand-deepNavy overflow-hidden">
              <iframe
                className="w-full h-full min-h-[380px] sm:min-h-[440px] border-0 filter contrast-[1.02] opacity-90 hover:opacity-100 transition-opacity"
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3726.8400178940365!2d77.75323737525362!3d20.91875518070322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjDCsDU1JzA3LjUiTiA3N8KwNDUnMjAuOSJF!5e0!3m2!1sen!2sin!4v1791889233999!5m2!1sen!2sin"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Anika Projects Office Location Amravati"
                aria-label="Amravati Google Map"
              />

              <div className="absolute top-4 left-4 bg-brand-deepNavy/95 text-white backdrop-blur-md px-3.5 py-2 rounded-lg border border-brand-gold/40 shadow-lg flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse" />
                <div>
                  <p className="text-xs font-bold leading-tight">Anika Projects Location</p>
                  <p className="text-[10px] text-brand-goldPale/80">Amravati, Maharashtra</p>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 hidden sm:flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-brand-deepNavy/90 backdrop-blur-md text-brand-goldLight text-[10px] font-semibold border border-brand-gold/30 shadow">
                  📍 Verified Coordinates (20°55'07.5"N 77°45'20.9"E)
                </span>
                <span className="px-2.5 py-1 rounded-full bg-brand-deepNavy/90 backdrop-blur-md text-brand-goldLight text-[10px] font-semibold border border-brand-gold/30 shadow">
                  🚗 Easy Road Access
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-white border-t border-brand-slateBorder/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-brand-navyLight">
                <MapPin className="w-4 h-4 text-brand-goldDark flex-shrink-0" />
                <span className="font-medium text-brand-deepNavy">
                  Amravati, Maharashtra — 444601
                </span>
              </div>
              <a
                href="https://maps.app.goo.gl/cuug7FtYQo9FL7Zk6"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-brand-deepNavy hover:text-brand-gold flex items-center gap-1 transition-colors"
              >
                <span>Open in Google Maps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Address, Hours, Direct Channels */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">

            {/* Visiting Hours Card */}
            <div className="bg-white rounded-2xl p-6 border border-brand-slateBorder shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-sandBg flex items-center justify-center text-brand-goldDark">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-base text-brand-deepNavy leading-tight">
                      Office Address & Hours
                    </h3>
                    <p className="text-xs text-brand-goldDark font-semibold uppercase tracking-wider">
                      Walk-ins & Consultations
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-brand-sandBg text-brand-deepNavy text-[10px] font-bold uppercase tracking-wider border border-brand-slateBorder/60">
                  Amravati HQ
                </span>
              </div>

              <div className="text-xs text-brand-navyLight space-y-2 pt-2 border-t border-brand-slateBorder/60">
                <p className="leading-relaxed text-brand-deepNavy font-medium">
                  <span className="font-bold block text-brand-navy">Anika Projects</span>
                  Near Sai Nagar / Akoli Road, Amravati, Maharashtra, India — PIN 444601
                </p>

                <div className="pt-1 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center bg-brand-sandBg/40 px-3 py-1.5 rounded-lg">
                    <span className="font-semibold text-brand-deepNavy">Monday – Saturday</span>
                    <span className="text-brand-goldDark font-bold">9:00 AM – 7:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center bg-brand-sandBg/40 px-3 py-1.5 rounded-lg">
                    <span className="font-semibold text-brand-deepNavy">Sunday</span>
                    <span className="text-brand-navyLight font-medium">By Prior Appointment (Site Visits)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Contact Channels */}
            <div className="bg-white rounded-2xl p-6 border border-brand-slateBorder shadow-sm space-y-3">
              <h4 className="font-display font-semibold text-base text-brand-deepNavy">
                Direct Contact Channels
              </h4>

              <div className="space-y-2.5">
                {/* Phone */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-sandBg/30 border border-brand-slateBorder/60 hover:border-brand-gold transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-deepNavy text-brand-gold flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">
                        Phone / Direct Call
                      </p>
                      <p className="text-xs font-bold text-brand-deepNavy">+91 98606 41551</p>
                    </div>
                  </div>
                  <a
                    href="tel:+919860641551"
                    className="px-3.5 py-1.5 rounded-lg bg-brand-deepNavy hover:bg-brand-goldDark text-white text-xs font-semibold transition-colors"
                  >
                    Call
                  </a>
                </div>

                {/* WhatsApp */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-sandBg/30 border border-brand-slateBorder/60 hover:border-brand-gold transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">
                        WhatsApp Desk
                      </p>
                      <p className="text-xs font-bold text-brand-deepNavy">+91 98606 41551</p>
                    </div>
                  </div>
                  <a
                    href="https://wa.me/919860641551?text=Hi%20Anika%20Projects,%20I%20would%20like%20to%20visit%20your%20office%20and%20learn%20more."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                  >
                    Chat
                  </a>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-sandBg/30 border border-brand-slateBorder/60 hover:border-brand-gold transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-sandBg text-brand-goldDark flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">
                        Official Inquiries
                      </p>
                      <a
                        href="mailto:contact@anikaprojects.in"
                        className="text-xs font-bold text-brand-deepNavy hover:text-brand-gold transition-colors"
                      >
                        contact@anikaprojects.in
                      </a>
                    </div>
                  </div>
                  <a
                    href="mailto:contact@anikaprojects.in"
                    className="px-3.5 py-1.5 rounded-lg bg-white border border-brand-slateBorder text-brand-deepNavy hover:bg-brand-sandBg text-xs font-semibold transition-colors"
                  >
                    Email
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Social Channels: Instagram & YouTube Side by Side */}
          {/* Starts where map starts (col 1) and ends where direct contact ends (col 12) */}
          <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            
            {/* Instagram Banner */}
            <div className="bg-gradient-to-r from-brand-deepNavy to-brand-navy text-white rounded-2xl p-5 border border-brand-gold/40 shadow-sm flex items-center justify-between gap-4 h-full hover:border-brand-gold transition-colors">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                  <Instagram className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-white truncate">Follow on Instagram</p>
                  <p className="text-[11px] text-brand-goldLight truncate">@AnikaProjects.in • Live Construction Updates</p>
                </div>
              </div>
              <a
                href="https://www.instagram.com/anikaprojects.in?utm_source=qr&stkn=MXAzaGJyOTBzamk5YQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-goldDark text-brand-deepNavy font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center gap-1.5 flex-shrink-0"
                aria-label="Visit Instagram Profile"
              >
                <span>Visit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* YouTube Banner */}
            <div className="bg-gradient-to-r from-brand-deepNavy to-brand-navy text-white rounded-2xl p-5 border border-brand-gold/40 shadow-sm flex items-center justify-between gap-4 h-full hover:border-brand-gold transition-colors">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                  <Youtube className="w-6 h-6 fill-current" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-white truncate">Watch on YouTube</p>
                  <p className="text-[11px] text-brand-goldLight truncate">@Anikaprojects • Video Reels & Tours</p>
                </div>
              </div>
              <a
                href="https://www.youtube.com/@Anikaprojects"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-goldDark text-brand-deepNavy font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center gap-1.5 flex-shrink-0"
                aria-label="Visit YouTube Channel"
              >
                <span>Visit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

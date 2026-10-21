import React, { useEffect, useState } from 'react';
import { X, CheckCircle, ShieldCheck, MapPin, Layers, Phone, MessageCircle, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { Project } from '../../types';
import { getProjectStatusMeta } from '../../utils/projectStatus';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onSelectForInquiry: (projectName: string) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onSelectForInquiry,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
      setActivePhotoIdx(0);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [project]);

  if (!project) return null;

  const galleryImages = (project.images && project.images.length > 0)
    ? project.images
    : (project.imageUrl ? [project.imageUrl] : []);

  const totalPhotos = galleryImages.length;
  const currentPhoto = galleryImages[activePhotoIdx] || galleryImages[0];
  const statusMeta = getProjectStatusMeta(project.status, project.categoryLabel);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-deepNavy/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-brand-warmBg rounded-2xl border border-brand-gold/40 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header banner */}
        <div className="bg-brand-deepNavy text-white p-6 sm:p-7 border-b border-brand-gold/30 relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-[11px] px-2.5 py-0.5 rounded-md flex items-center gap-1.5 uppercase tracking-wider font-extrabold ${statusMeta.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                <span>{statusMeta.label}</span>
              </span>
              <span className="text-brand-goldPale/50" aria-hidden="true">•</span>
              <span className="text-xs text-brand-gold font-medium">{project.units}</span>
            </div>
            <h2 id="modal-project-title" className="font-display text-2xl sm:text-3xl font-semibold text-white">
              {project.title}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-brand-goldPale/80 mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
              <span>{project.location}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-brand-navy hover:bg-brand-navyLight text-white hover:text-brand-gold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body with custom scrolling */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          
          {/* Multi-Photo Architectural Showcase Gallery */}
          {totalPhotos > 0 && (
            <div className="space-y-3">
              <div className="relative aspect-video sm:aspect-[21/9] rounded-xl overflow-hidden bg-brand-deepNavy border border-brand-slateBorder shadow-sm group">
                <img
                  src={currentPhoto}
                  alt={`${project.title} - Full View ${activePhotoIdx + 1}`}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                {/* Counter Pill */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-xs font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  <Camera className="w-3.5 h-3.5 text-brand-gold" />
                  <span>{activePhotoIdx + 1} of {totalPhotos} High-Res Photos</span>
                </div>

                {/* Navigation Arrows */}
                {totalPhotos > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActivePhotoIdx((prev) => (prev - 1 + totalPhotos) % totalPhotos)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all z-10 cursor-pointer shadow-lg border border-white/20"
                      title="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePhotoIdx((prev) => (prev + 1) % totalPhotos)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all z-10 cursor-pointer shadow-lg border border-white/20"
                      title="Next photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              {totalPhotos > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        activePhotoIdx === idx
                          ? 'border-brand-gold ring-2 ring-brand-gold/30 scale-102'
                          : 'border-transparent opacity-65 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sold Out Celebration Banner */}
          {statusMeta.isSoldOut && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-rose-950 text-sm">
                    Project Successfully Completed & 100% Sold Out
                  </h4>
                  <p className="text-rose-800 text-[11px] mt-0.5 leading-relaxed">
                    All residential units have been fully constructed, quality cleared, and possession handed over to homeowners in Amravati.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectForInquiry?.(project.title)}
                className="px-3.5 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs whitespace-nowrap shrink-0 transition-colors shadow-sm cursor-pointer"
              >
                Inquire Similar Development →
              </button>
            </div>
          )}

          {/* Ready to Move Immediate Possession Banner */}
          {statusMeta.isReady && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">
                    Move-In Ready • Immediate Possession Available
                  </h4>
                  <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                    All construction, finishing, and quality clearance certificates are complete. Ready for instant keys handover and registry in Amravati.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectForInquiry?.(project.title)}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs whitespace-nowrap shrink-0 transition-colors shadow-sm cursor-pointer"
              >
                Book Private Site Visit →
              </button>
            </div>
          )}

          {/* Key metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-xl border border-brand-slateBorder/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Configuration</span>
              <span className="font-semibold text-xs text-brand-deepNavy">{project.type}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-brand-slateBorder/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Plot Area</span>
              <span className="font-semibold text-xs text-brand-deepNavy">{project.plotArea}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-brand-slateBorder/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Built-up Area</span>
              <span className="font-semibold text-xs text-brand-deepNavy">{project.builtUpArea}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-brand-slateBorder/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Status</span>
              <span className={statusMeta.pillClass}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.isSoldOut ? 'bg-rose-600' : statusMeta.isReady ? 'bg-emerald-600 animate-pulse' : statusMeta.isHandedOver ? 'bg-teal-600' : statusMeta.isPlanning ? 'bg-blue-600' : 'bg-amber-600'}`} />
                {statusMeta.shortLabel}
              </span>
            </div>
          </div>

          {/* Overview text */}
          <div>
            <h3 className="font-display font-semibold text-base text-brand-deepNavy mb-2">Project Overview</h3>
            <p className="text-sm text-brand-navyLight leading-relaxed">{project.description}</p>
          </div>

          {/* Real-Time Unit Availability & Inventory (Live from Dashboard) */}
          <div className="bg-white p-5 rounded-xl border border-brand-slateBorder/80 space-y-3.5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-brand-slateBorder/60">
              <div>
                <h4 className="font-display font-semibold text-base text-brand-deepNavy flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Real-Time Unit Inventory & Availability
                </h4>
                <p className="text-xs text-brand-navyLight mt-0.5">
                  Live inventory synchronized directly from the site engineering desk.
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-brand-sandBg border border-brand-slateBorder text-brand-deepNavy">
                  {project.units}
                </span>
                {project.unitInventory && project.unitInventory.length > 0 && (() => {
                  const isSold = statusMeta.isSoldOut;
                  const availCount = isSold ? 0 : project.unitInventory.filter(u => u.status === 'available').length;
                  return isSold ? (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 border border-rose-300">
                      100% Sold Out
                    </span>
                  ) : availCount > 0 ? (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ✓ {availCount} Available {statusMeta.isReady ? '(Move-In Ready)' : ''}
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-300 font-bold">
                      All Units Handed Over / Booked
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Units Inventory Table / List */}
            {project.unitInventory && project.unitInventory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-brand-sandBg/60 text-brand-deepNavy border-b border-brand-slateBorder/60">
                      <th className="py-2.5 px-3 font-bold">Unit / Plot #</th>
                      <th className="py-2.5 px-3 font-bold">Type / Layout</th>
                      <th className="py-2.5 px-3 font-bold">Size</th>
                      <th className="py-2.5 px-3 font-bold">Facing</th>
                      <th className="py-2.5 px-3 font-bold">Live Status</th>
                      <th className="py-2.5 px-3 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-slateBorder/40">
                    {project.unitInventory.map((unit) => (
                      <tr key={unit.id} className="hover:bg-brand-sandBg/30 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-brand-deepNavy whitespace-nowrap">
                          {unit.unitNumber}
                        </td>
                        <td className="py-2.5 px-3 text-brand-navy">
                          {unit.type}
                        </td>
                        <td className="py-2.5 px-3 text-brand-navyLight whitespace-nowrap">
                          {unit.size}
                        </td>
                        <td className="py-2.5 px-3 text-brand-navyLight whitespace-nowrap">
                          {unit.facing || 'Vastu Compliant'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {unit.status === 'available' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              Available
                            </span>
                          ) : unit.status === 'booked' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              ● Token Booked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                              ✓ Handed Over
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          {unit.status === 'available' ? (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onSelectForInquiry(`${project.title} (${unit.unitNumber})`);
                              }}
                              className="px-2.5 py-1 rounded bg-brand-deepNavy hover:bg-brand-navy text-white text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                            >
                              Reserve / Enquire
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onSelectForInquiry(`${project.title} (Waitlist for ${unit.unitNumber})`);
                              }}
                              className="px-2 py-1 rounded bg-brand-sandBg hover:bg-brand-goldPale text-brand-navyLight text-[11px] font-medium border border-brand-slateBorder transition-colors cursor-pointer"
                            >
                              Join Waitlist
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-brand-sandBg/40 rounded-lg border border-brand-slateBorder/60 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-brand-deepNavy">
                  Current Allocation: <strong>{project.units}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectForInquiry(project.title);
                  }}
                  className="px-3 py-1.5 rounded-md bg-brand-deepNavy text-white text-xs font-bold"
                >
                  Enquire on Availability
                </button>
              </div>
            )}
          </div>

          {/* Key Highlights */}
          <div className="bg-white p-5 rounded-xl border border-brand-slateBorder/80 space-y-2.5">
            <h4 className="font-display font-semibold text-sm text-brand-deepNavy flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-goldDark" /> Key Architectural & Structural Highlights
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {project.keyHighlights.map((hl, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-brand-deepNavy">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-goldDark flex-shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floor Plan Outline */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-base text-brand-deepNavy flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-goldDark" /> Floor Plan Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-brand-slateBorder/80">
                <span className="font-bold text-brand-deepNavy block mb-1">Ground Floor Layout</span>
                <p className="text-brand-navyLight">{project.floorPlanDetails.groundFloor}</p>
              </div>
              {project.floorPlanDetails.firstFloor && (
                <div className="p-3.5 rounded-xl bg-white border border-brand-slateBorder/80">
                  <span className="font-bold text-brand-deepNavy block mb-1">First Floor Layout</span>
                  <p className="text-brand-navyLight">{project.floorPlanDetails.firstFloor}</p>
                </div>
              )}
              {project.floorPlanDetails.terrace && (
                <div className="p-3.5 rounded-xl bg-white border border-brand-slateBorder/80">
                  <span className="font-bold text-brand-deepNavy block mb-1">Terrace Zone</span>
                  <p className="text-brand-navyLight">{project.floorPlanDetails.terrace}</p>
                </div>
              )}
              <div className="p-3.5 rounded-xl bg-white border border-brand-slateBorder/80">
                <span className="font-bold text-brand-deepNavy block mb-1">Parking & Access</span>
                <p className="text-brand-navyLight">{project.floorPlanDetails.parking}</p>
              </div>
            </div>
          </div>

          {/* Detailed Civil Engineering Specifications */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-base text-brand-deepNavy">
              Civil Engineering Specifications & Material Grades
            </h3>
            <div className="bg-white rounded-xl border border-brand-slateBorder/80 divide-y divide-brand-slateBorder/60 text-xs">
              <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                <span className="font-bold text-brand-deepNavy">Foundation & Earthwork</span>
                <span className="sm:col-span-2 text-brand-navyLight">{project.specifications.foundation}</span>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                <span className="font-bold text-brand-deepNavy">RCC Superstructure</span>
                <span className="sm:col-span-2 text-brand-navyLight">{project.specifications.superstructure}</span>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                <span className="font-bold text-brand-deepNavy">Masonry & Plaster</span>
                <span className="sm:col-span-2 text-brand-navyLight">{project.specifications.masonry}</span>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                <span className="font-bold text-brand-deepNavy">Flooring & Tiling</span>
                <span className="sm:col-span-2 text-brand-navyLight">{project.specifications.flooring}</span>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                <span className="font-bold text-brand-deepNavy">Doors & Windows</span>
                <span className="sm:col-span-2 text-brand-navyLight">{project.specifications.doorsWindows}</span>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                <span className="font-bold text-brand-deepNavy">Electrical System</span>
                <span className="sm:col-span-2 text-brand-navyLight">{project.specifications.electrical}</span>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                <span className="font-bold text-brand-deepNavy">Plumbing & Sanitary</span>
                <span className="sm:col-span-2 text-brand-navyLight">{project.specifications.plumbingSanitary}</span>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                <span className="font-bold text-brand-deepNavy">Waterproofing Protection</span>
                <span className="sm:col-span-2 text-brand-navyLight">{project.specifications.waterproofing}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer action buttons */}
        <div className="p-4 sm:p-6 bg-white border-t border-brand-slateBorder/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href="tel:+919860641551"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand-sandBg hover:bg-brand-goldPale text-brand-deepNavy text-xs font-bold uppercase tracking-wider transition-colors border border-brand-slateBorder"
            >
              <Phone className="w-3.5 h-3.5 text-brand-goldDark" />
              <span>Call Director</span>
            </a>
            <a
              href={`https://wa.me/919860641551?text=Hi%20Anika%20Projects,%20I%20am%20interested%20in%20${encodeURIComponent(project.title)}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold uppercase tracking-wider transition-colors border border-emerald-200"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectForInquiry(project.title);
              const callbackEl = document.getElementById('callback');
              callbackEl?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`px-6 py-2.5 rounded-lg text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer ${
              statusMeta.isReady
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : statusMeta.isSoldOut
                ? 'bg-rose-700 hover:bg-rose-800'
                : 'bg-brand-deepNavy hover:bg-brand-goldDark'
            }`}
          >
            {statusMeta.isReady ? 'Book Immediate Site Visit →' : statusMeta.isSoldOut ? 'Enquire Similar Development →' : 'Enquire About This Project →'}
          </button>
        </div>
      </div>
    </div>
  );
};

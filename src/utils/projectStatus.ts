export interface ProjectStatusMeta {
  key: 'sold_out' | 'ready' | 'handed_over' | 'planning' | 'construction';
  label: string;
  shortLabel: string;
  isSoldOut: boolean;
  isReady: boolean;
  isHandedOver: boolean;
  isPlanning: boolean;
  isConstruction: boolean;

  // Badge styling for top of image cards and modal header
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  badgeClass: string;
  dotClass: string;

  // Pill styling for Specs Box "Status" cell
  pillClass: string;

  // Live strip status summary
  stripContainerClass: string;
  stripText: string;
  stripBadgeClass: string;
  stripActionText: string;

  // Card enquiry CTA button
  enquiryButtonText: string;
  enquiryButtonClass: string;
}

export function getProjectStatusMeta(status?: string, categoryLabel?: string): ProjectStatusMeta {
  const s = String(status || '').trim();
  const c = String(categoryLabel || '').trim();
  const combined = `${s} ${c}`.toLowerCase();

  // 1. Sold Out Check
  if (combined.includes('sold') || combined.includes('booked out')) {
    const displayLabel = s && s.toLowerCase().includes('sold') ? s : (c && c.toLowerCase().includes('sold') ? c : '100% Sold Out');
    return {
      key: 'sold_out',
      label: displayLabel.toLowerCase().includes('sold') ? displayLabel : '100% Sold Out',
      shortLabel: 'Sold Out',
      isSoldOut: true,
      isReady: false,
      isHandedOver: false,
      isPlanning: false,
      isConstruction: false,
      badgeBg: 'bg-rose-700/95',
      badgeText: 'text-white',
      badgeBorder: 'border-rose-400',
      badgeClass: 'bg-rose-700/95 text-white border border-rose-400 font-extrabold shadow-md',
      dotClass: 'bg-white animate-pulse',
      pillClass: 'font-extrabold text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded inline-flex items-center gap-1 mt-0.5',
      stripContainerClass: 'bg-rose-50 border-rose-200',
      stripText: '100% Sold Out • All Units Transferred to Owners',
      stripBadgeClass: 'text-rose-800 bg-rose-100/90',
      stripActionText: 'Delivered Dossier →',
      enquiryButtonText: 'Enquire Next Phase →',
      enquiryButtonClass: 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-300 font-bold',
    };
  }

  // 2. Ready to Move Check
  if (combined.includes('ready') || combined.includes('avail') || combined.includes('possession')) {
    const displayLabel = s || c || 'Ready to Move';
    return {
      key: 'ready',
      label: displayLabel,
      shortLabel: 'Ready to Move',
      isSoldOut: false,
      isReady: true,
      isHandedOver: false,
      isPlanning: false,
      isConstruction: false,
      badgeBg: 'bg-emerald-600/95',
      badgeText: 'text-white',
      badgeBorder: 'border-emerald-300',
      badgeClass: 'bg-emerald-600/95 text-white border border-emerald-300 font-extrabold shadow-md',
      dotClass: 'bg-white animate-pulse',
      pillClass: 'font-bold text-xs text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded inline-flex items-center gap-1 mt-0.5',
      stripContainerClass: 'bg-emerald-50 border-emerald-200',
      stripText: 'Ready for Immediate Possession • Move-In Ready',
      stripBadgeClass: 'text-emerald-900 bg-emerald-100/90 font-bold',
      stripActionText: 'Book Site Visit →',
      enquiryButtonText: 'Book Site Visit →',
      enquiryButtonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-emerald-500 shadow-sm',
    };
  }

  // 3. Handed Over / Completed Check
  if (combined.includes('hand') || combined.includes('deliver') || combined.includes('completed')) {
    const displayLabel = s || c || 'Handed Over';
    return {
      key: 'handed_over',
      label: displayLabel,
      shortLabel: 'Handed Over',
      isSoldOut: false,
      isReady: false,
      isHandedOver: true,
      isPlanning: false,
      isConstruction: false,
      badgeBg: 'bg-teal-700/95',
      badgeText: 'text-white',
      badgeBorder: 'border-teal-400',
      badgeClass: 'bg-teal-700/95 text-white border border-teal-400 font-bold shadow-md',
      dotClass: 'bg-teal-200',
      pillClass: 'font-bold text-xs text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded inline-flex items-center gap-1 mt-0.5',
      stripContainerClass: 'bg-teal-50 border-teal-200',
      stripText: 'Successfully Handed Over & Occupied by Owners',
      stripBadgeClass: 'text-teal-900 bg-teal-100/90 font-bold',
      stripActionText: 'View Portfolio →',
      enquiryButtonText: 'Enquire Similar Build →',
      enquiryButtonClass: 'bg-brand-sandBg hover:bg-brand-goldPale text-brand-deepNavy border-brand-slateBorder/60',
    };
  }

  // 4. Under Planning Check
  if (combined.includes('plan') || combined.includes('pre-book') || combined.includes('launch')) {
    const displayLabel = s || c || 'Under Planning';
    return {
      key: 'planning',
      label: displayLabel,
      shortLabel: 'Under Planning',
      isSoldOut: false,
      isReady: false,
      isHandedOver: false,
      isPlanning: true,
      isConstruction: false,
      badgeBg: 'bg-blue-600/95',
      badgeText: 'text-white',
      badgeBorder: 'border-blue-300',
      badgeClass: 'bg-blue-600/95 text-white border border-blue-300 font-bold shadow-md',
      dotClass: 'bg-white animate-pulse',
      pillClass: 'font-bold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded inline-flex items-center gap-1 mt-0.5',
      stripContainerClass: 'bg-blue-50 border-blue-200',
      stripText: 'Under Architectural Planning • Pre-Booking Enquiries Open',
      stripBadgeClass: 'text-blue-900 bg-blue-100/90 font-bold',
      stripActionText: 'Pre-Book Unit →',
      enquiryButtonText: 'Pre-Book Inquiry →',
      enquiryButtonClass: 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300 font-semibold',
    };
  }

  // 5. Default / In Construction / Custom
  const displayLabel = s || c || 'In Construction';
  return {
    key: 'construction',
    label: displayLabel,
    shortLabel: s ? s : 'In Construction',
    isSoldOut: false,
    isReady: false,
    isHandedOver: false,
    isPlanning: false,
    isConstruction: true,
    badgeBg: 'bg-amber-600/95',
    badgeText: 'text-white',
    badgeBorder: 'border-amber-300',
    badgeClass: 'bg-amber-600/95 text-white border border-amber-300 font-bold shadow-md',
    dotClass: 'bg-white animate-pulse',
    pillClass: 'font-bold text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded inline-flex items-center gap-1 mt-0.5',
    stripContainerClass: 'bg-amber-50 border-amber-200',
    stripText: 'Under Active Construction • Structural Work in Progress',
    stripBadgeClass: 'text-amber-900 bg-amber-100/90 font-bold',
    stripActionText: 'Track Progress →',
    enquiryButtonText: 'Enquire →',
    enquiryButtonClass: 'bg-brand-sandBg hover:bg-brand-goldPale text-brand-deepNavy border-brand-slateBorder/60',
  };
}

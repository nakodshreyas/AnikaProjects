export interface ProjectUnitItem {
  id: string;
  unitNumber: string; // e.g. "Unit 1", "Villa A", "Plot 18"
  type: string; // e.g. "2 BHK G+1", "3 BHK Duplex", "1,200 sq ft Plot"
  size: string; // e.g. "1,100 sq ft built-up", "700 sq ft plot"
  status: 'available' | 'booked' | 'sold';
  price?: string; // e.g. "₹42.5 L", "Contact for price"
  floor?: string; // e.g. "Ground + 1st", "Plot"
  facing?: string; // e.g. "East Facing", "Corner Plot"
  notes?: string;
}

export interface Project {
  id: string;
  title: string;
  category: 'completed' | 'upcoming' | 'custom';
  categoryLabel: string;
  location: string;
  type: string;
  units: string;
  unitInventory?: ProjectUnitItem[];
  plotArea: string;
  builtUpArea: string;
  status: 'Handed Over' | 'Under Planning' | 'In Construction' | 'Available' | 'Sold Out' | 'Completed & Sold Out' | string;
  statusColor: 'emerald' | 'amber' | 'blue' | 'rose' | string;
  rating: number;
  reviewCount: number;
  description: string;
  imageUrl?: string;
  images?: string[];
  keyHighlights: string[];
  specifications: {
    foundation: string;
    superstructure: string;
    masonry: string;
    flooring: string;
    doorsWindows: string;
    electrical: string;
    plumbingSanitary: string;
    waterproofing: string;
  };
  floorPlanDetails: {
    groundFloor: string;
    firstFloor?: string;
    terrace?: string;
    parking: string;
  };
}

export interface Review {
  id: string;
  author: string;
  initials: string;
  projectOrArea: string;
  title: string;
  message: string;
  rating: number;
  date: string;
  verified: boolean;
  userSubmitted?: boolean;
  showOnPublic?: boolean;
}

export interface LeadSubmission {
  id: string;
  name: string;
  phone: string;
  interest: string;
  timeline?: string;
  plotStatus?: string;
  submittedAt: string;
  status?: 'new' | 'contacted' | 'site_visit' | 'converted' | 'closed';
  notes?: string;
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  tag: string;
  deliverables: string[];
  duration: string;
}

export interface CostCalculation {
  plotArea: number;
  floors: number;
  totalBuiltUpArea: number;
  qualityTier: 'standard' | 'premium' | 'luxury';
  ratePerSqFt: number;
  baseConstructionCost: number;
  interiorCost: number;
  totalEstimatedCost: number;
  breakdown: {
    structureAndMasonry: number;
    finishesAndFlooring: number;
    electricalAndPlumbing: number;
    doorsWindowsAndPaints: number;
    miscellaneousAndLabor: number;
  };
  estimatedDurationMonths: number;
}

export interface ProjectVideo {
  id: string;
  title: string;
  youtubeVideoId: string;
  description?: string;
  category?: string;
  displayOrder: number;
  isPublished: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

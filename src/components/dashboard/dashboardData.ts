import { ProjectUnitItem } from '../../types';

export interface DashboardProject {
  id: string;
  title: string;
  location: string;
  units: string;
  unitInventory?: ProjectUnitItem[];
  configuration: string;
  plotArea: string;
  builtUpArea: string;
  status: 'delivered' | 'ongoing' | 'planning' | 'sold_out' | 'available' | string;
  statusLabel: string;
  statusBadgeBg: string;
  statusBadgeText: string;
  statusColor?: string;
  rawStatus?: string;
  imageUrl: string;
  images?: string[];
  imageAlt: string;
  syncedPhotosCount: number;
  overview: string;
  highlights: string[];
  floorPlans: {
    groundFloor: string;
    firstFloor: string;
    terrace: string;
    parking: string;
  };
  engineeringSpecs: {
    foundation: string;
    superstructure: string;
    masonry: string;
    flooring: string;
    doorsWindows: string;
    electrical: string;
    plumbing: string;
    waterproofing: string;
  };
  specs: {
    label1: string;
    val1: string;
    label2: string;
    val2: string;
    label3: string;
    val3: string;
  };
  progress?: number;
  progressLabel?: string;
  nextMilestone?: string;
  inquiryCount?: number;
  note?: string;
  rating?: number;
  reviewCount?: number;
}

export const DASHBOARD_PROJECTS_KEY = 'anika_dashboard_projects_ledger_v3';

export const INITIAL_PROJECTS: DashboardProject[] = [];

export const generateDefaultUnitsForProject = (project: DashboardProject): ProjectUnitItem[] => {
  const title = project.title;
  if (title.includes('Sai Nagar') || project.units.includes('3')) {
    return [
      { id: `sn-u1`, unitNumber: 'Row House 1 (Corner)', type: '2 BHK Independent Villa', size: '1,100 sq ft', status: 'sold', price: '₹38.5 L', floor: 'G+1 Duplex', facing: 'East Facing' },
      { id: `sn-u2`, unitNumber: 'Row House 2 (Middle)', type: '2 BHK Independent Villa', size: '1,100 sq ft', status: 'sold', price: '₹36.0 L', floor: 'G+1 Duplex', facing: 'East Facing' },
      { id: `sn-u3`, unitNumber: 'Row House 3 (End)', type: '2 BHK Independent Villa', size: '1,100 sq ft', status: 'available', price: '₹37.5 L', floor: 'G+1 Duplex', facing: 'North-East' },
    ];
  }
  if (title.includes('Villa Shravan') || project.units.toLowerCase().includes('single')) {
    return [
      { id: `vs-u1`, unitNumber: 'Villa Shravan Duplex', type: '4 BHK Luxury Duplex Bungalow', size: '2,450 sq ft', status: 'booked', price: 'Custom Luxury Quote', floor: 'G+1 + Terrace', facing: 'East Facing' },
    ];
  }
  if (title.includes('Akoli') || project.units.toLowerCase().includes('plot')) {
    return [
      { id: `ak-p1`, unitNumber: 'Plot #1 (Corner)', type: 'NA Residential Plot', size: '1,800 sq ft', status: 'available', price: '₹22.5 L', floor: 'Freehold Land', facing: 'North-East' },
      { id: `ak-p2`, unitNumber: 'Plot #2', type: 'NA Residential Plot', size: '1,500 sq ft', status: 'available', price: '₹18.5 L', floor: 'Freehold Land', facing: 'East Facing' },
      { id: `ak-p3`, unitNumber: 'Plot #3', type: 'NA Residential Plot', size: '1,200 sq ft', status: 'sold', price: '₹15.0 L', floor: 'Freehold Land', facing: 'East Facing' },
      { id: `ak-p4`, unitNumber: 'Plot #18 (Executive)', type: 'NA Residential Plot', size: '2,200 sq ft', status: 'booked', price: '₹28.0 L', floor: 'Freehold Land', facing: 'North Facing' },
      { id: `ak-p5`, unitNumber: 'Plot #19', type: 'NA Residential Plot', size: '2,000 sq ft', status: 'available', price: '₹25.0 L', floor: 'Freehold Land', facing: 'North Facing' },
      { id: `ak-p6`, unitNumber: 'Plot #20', type: 'NA Residential Plot', size: '1,500 sq ft', status: 'sold', price: '₹18.5 L', floor: 'Freehold Land', facing: 'West Facing' },
    ];
  }
  return [
    { id: `u-1`, unitNumber: 'Unit 101', type: project.configuration || 'Residential Unit', size: project.builtUpArea || '1,200 sq ft', status: 'available', price: 'On Request', floor: 'Ground', facing: 'East Facing' },
    { id: `u-2`, unitNumber: 'Unit 102', type: project.configuration || 'Residential Unit', size: project.builtUpArea || '1,200 sq ft', status: 'available', price: 'On Request', floor: 'First', facing: 'West Facing' },
  ];
};

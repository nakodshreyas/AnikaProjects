import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Plus,
  ArrowRight,
  ExternalLink,
  LogOut,
  Bell,
  ShieldCheck,
  FileText,
  MessageSquare,
  Phone,
  HardHat,
  Image as ImageIcon,
  Layers,
  X,
  Upload,
  Download,
  Check,
  Sparkles,
  ArrowLeft,
  Home,
  CheckSquare,
  Wrench,
  Compass,
  FileCheck,
  Calendar,
  MessageCircle,
  PhoneCall,
  UserCheck,
  AlertCircle,
  ChevronDown,
  Eye,
  EyeOff,
  Trash2,
  Star,
  Camera,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Database,
  Copy,
  CheckCheck,
  Youtube,
  Sliders
} from 'lucide-react';
import { ClientSession } from '../../utils/auth';
import {
  getStoredLeads,
  getStoredReviews,
  updateLeadStatusInStorage,
  updateReviewPublicStatus,
  toggleReviewPublicInStorage,
  saveAllReviewsToStorage
} from '../../utils/storage';
import { LeadSubmission, Review, ProjectUnitItem } from '../../types';

interface ClientDashboardProps {
  session: ClientSession;
  onLogout: () => void;
  onNavigateHome: () => void;
}


import {
  DashboardProject,
  DASHBOARD_PROJECTS_KEY,
  INITIAL_PROJECTS,
  generateDefaultUnitsForProject
} from './dashboardData';
import {
  QuickAddProjectModal,
  ProjectDetailModal,
  PhotoManagerModal,
  UnitsManagerModal,
  SupabaseDbModal,
  ProjectStatusModal,
  ProjectFormData
} from './DashboardModals';
import { VideoManagementTab } from './VideoManagementTab';

export type { DashboardProject };
export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  session,
  onLogout,
  onNavigateHome,
}) => {
  // Load initial projects from storage if present, or defaults
  const [projects, setProjects] = useState<DashboardProject[]>(() => {
    try {
      localStorage.removeItem('anika_dashboard_projects_ledger_v2');
      const stored = localStorage.getItem(DASHBOARD_PROJECTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const userOnly = parsed.filter((p: any) => !p.id?.startsWith('proj-'));
          return userOnly;
        }
      }
    } catch (e) {
      console.warn('Failed to load projects from storage:', e);
    }
    return INITIAL_PROJECTS;
  });

  const [filter, setFilter] = useState<'all' | 'ongoing' | 'delivered' | 'planning' | 'sold_out' | 'available'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'leads' | 'reviews' | 'videos' | 'desk'>('projects');

  // Data from website
  const [leads, setLeads] = useState<LeadSubmission[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'all' | 'new' | 'site_visit' | 'contacted' | 'converted' | 'closed'>('all');
  const [inquirySearchQuery, setInquirySearchQuery] = useState('');

  const handleUpdateLeadStatus = async (leadId: string, newStatus: NonNullable<LeadSubmission['status']>) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    // Immediately update local state for responsive UI
    const updated = leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l));
    setLeads(updated);
    try {
      localStorage.setItem('anika_projects_leads_v1', JSON.stringify(updated));
    } catch { }

    const statusLabels: Record<string, string> = {
      new: 'New Inquiry',
      site_visit: 'Site Visit Scheduled',
      contacted: 'In Discussion / Contacted',
      converted: 'Converted to Booking',
      closed: 'Closed / Archived',
    };

    try {
      // Sync update directly to Supabase via backend API
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          lead: { ...targetLead, status: newStatus },
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to update database');
      }

      showToast(`Inquiry status updated to "${statusLabels[newStatus] || newStatus}" in database`);
    } catch (err: any) {
      console.error('Inquiry status update database notice:', err);
      showToast(`Status updated locally. Cloud sync: ${err.message || 'error'}`);
    }
  };

  const handleDeleteLead = async (leadId: string, clientName: string) => {
    if (!window.confirm(`Are you sure you want to delete inquiry from "${clientName}"?`)) return;

    const remaining = leads.filter((l) => l.id !== leadId);
    setLeads(remaining);
    try {
      localStorage.setItem('anika_projects_leads_v1', JSON.stringify(remaining));
    } catch { }

    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete from database');
      }
      showToast(`Inquiry from "${clientName}" deleted from Supabase database.`);
    } catch (err: any) {
      console.error('Error deleting inquiry:', err);
      showToast(`Failed to delete inquiry from database: ${err.message || 'error'}`);
    }
  };

  // Review moderation state & handlers (to choose which reviews show at public site)
  const [reviewFilter, setReviewFilter] = useState<'all' | 'public' | 'hidden'>('all');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');

  const handleToggleReviewPublic = (reviewId: string) => {
    const target = reviews.find((r) => r.id === reviewId);
    if (!target) return;
    const nextShow = !target.showOnPublic;
    const updated = reviews.map((r) => (r.id === reviewId ? { ...r, showOnPublic: nextShow } : r));
    setReviews(updated);

    fetch(`/api/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ show_on_public: nextShow }),
    }).catch((err) => console.warn('Review status update notice:', err));

    window.dispatchEvent(new Event('anika_reviews_updated'));

    if (nextShow) {
      showToast(`Review by "${target.author}" is now active on the public site!`);
    } else {
      showToast(`Review by "${target.author}" hidden from public carousel.`);
    }
  };

  const handleSetPublicPreset = (count: number) => {
    const updated = reviews.map((r, i) => {
      const show = i < count;
      if (r.showOnPublic !== show) {
        fetch(`/api/reviews/${r.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ show_on_public: show }),
        }).catch(() => { });
      }
      return { ...r, showOnPublic: show };
    });
    setReviews(updated);
    window.dispatchEvent(new Event('anika_reviews_updated'));
    const hiddenCount = reviews.length - count;
    showToast(`Top ${count} reviews featured on public site; remaining ${hiddenCount > 0 ? hiddenCount : 0} archived.`);
  };

  const handleSetAllReviewsPublic = (show: boolean) => {
    const updated = reviews.map((r) => {
      if (r.showOnPublic !== show) {
        fetch(`/api/reviews/${r.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ show_on_public: show }),
        }).catch(() => { });
      }
      return { ...r, showOnPublic: show };
    });
    setReviews(updated);
    window.dispatchEvent(new Event('anika_reviews_updated'));
    if (show) {
      showToast(`All ${reviews.length} reviews set to show on the public site.`);
    } else {
      showToast(`All reviews moved to archive.`);
    }
  };

  // Modals & view states
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [selectedProjectForView, setSelectedProjectForView] = useState<DashboardProject | null>(null);
  const [viewModalTab, setViewModalTab] = useState<'overview' | 'floorplans' | 'engineering' | 'gallery'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Status Change Modal state for added projects
  const [statusModalProject, setStatusModalProject] = useState<DashboardProject | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Photo Manager Modal state for existing projects (to upload & manage multiple photos of any project)
  const [photoManagerProject, setPhotoManagerProject] = useState<DashboardProject | null>(null);
  const [managerImages, setManagerImages] = useState<string[]>([]);
  const [managerUrlInput, setManagerUrlInput] = useState('');

  // Stepper state for Add Project section (1: Basic Details, 2: Civil Specs & Floor Plans)
  const [addStep, setAddStep] = useState<1 | 2>(1);

  // Form Fields for Add Project with multiple images support
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    units: '',
    location: '',
    status: 'ongoing',
    configuration: '',
    plotArea: '',
    builtUpArea: '',
    imageUrl: '',
    images: [],
    overview: '',
    highlights: [],
    groundFloor: '',
    firstFloor: '',
    terrace: '',
    parking: '',
    foundation: '',
    superstructure: '',
    masonry: '',
    flooring: '',
    doorsWindows: '',
    electrical: '',
    plumbing: '',
    waterproofing: '',
  });

  const [formUrlInput, setFormUrlInput] = useState('');

  // Supabase cloud database & storage status state
  const [supabaseStatus, setSupabaseStatus] = useState<{
    configured: boolean;
    url: string | null;
    projectRef?: string;
    storageBucketReady: boolean;
    tables: Record<string, boolean>;
  } | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [sqlSchemaText, setSqlSchemaText] = useState<string>('');
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [dbPasswordInput, setDbPasswordInput] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    // 1. Fetch live projects directly from Supabase
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.projects) && data.projects.length > 0) {
          const mapped: DashboardProject[] = data.projects.map((p: any) => {
            const stStr = String(p.status || '');
            const stLower = stStr.toLowerCase();
            const catLower = String(p.category || '').toLowerCase();
            let statusKey: 'sold_out' | 'delivered' | 'ongoing' | 'planning' | 'available' = 'ongoing';
            let badgeBg = 'bg-amber-900/90 border border-amber-400/50';
            let badgeText = 'text-amber-100 font-bold';

            if (stLower.includes('sold')) {
              statusKey = 'sold_out';
              badgeBg = 'bg-rose-900/95 border border-rose-500/50';
              badgeText = 'text-rose-100 font-bold';
            } else if (stLower.includes('hand') || stLower.includes('deliver') || (catLower === 'completed' && !stLower.includes('ready'))) {
              statusKey = 'delivered';
              badgeBg = 'bg-[#081928] border border-[#7a582e]/50';
              badgeText = 'text-[#ecbe8b] font-bold';
            } else if (stLower.includes('ready') || stLower.includes('avail')) {
              statusKey = 'available';
              badgeBg = 'bg-emerald-900/90 border border-emerald-500/50';
              badgeText = 'text-emerald-100 font-bold';
            } else if (stLower.includes('plan') || stLower.includes('pre-book') || (catLower === 'upcoming' && stLower.includes('plan'))) {
              statusKey = 'planning';
              badgeBg = 'bg-blue-900/90 border border-blue-400/50';
              badgeText = 'text-blue-100 font-bold';
            } else {
              statusKey = 'ongoing';
              badgeBg = 'bg-amber-900/90 border border-amber-400/50';
              badgeText = 'text-amber-100 font-bold';
            }

            return {
              id: p.id,
              title: p.title,
              location: p.location,
              units: p.units,
              unitInventory: p.project_units || [],
              configuration: p.type || 'Residential Villa',
              plotArea: p.plot_area || '~700 sq ft per unit',
              builtUpArea: p.built_up_area || '~1,100 sq ft built-up',
              status: statusKey,
              rawStatus: p.status,
              statusLabel: p.category_label || p.status,
              statusBadgeBg: badgeBg,
              statusBadgeText: badgeText,
              statusColor: p.status_color || (statusKey === 'sold_out' ? 'rose' : statusKey === 'delivered' ? 'emerald' : statusKey === 'planning' ? 'blue' : 'amber'),
              imageUrl: p.image_url,
              images: p.images || [p.image_url],
              imageAlt: p.title,
              syncedPhotosCount: (p.images || []).length || 1,
              overview: p.overview || '',
              highlights: p.highlights || [],
              specs: {
                label1: 'Units',
                val1: p.units,
                label2: 'Built-up',
                val2: p.built_up_area,
                label3: 'Plot Size',
                val3: p.plot_area,
              },
              progress: typeof p.progress === 'number' ? p.progress : (statusKey === 'sold_out' || statusKey === 'delivered' ? 100 : 75),
              progressLabel: p.progress_label,
              rating: p.rating || 5.0,
              reviewCount: p.review_count || 0,
              groundFloor: p.floor_plans?.groundFloor || '',
              firstFloor: p.floor_plans?.firstFloor || '',
              terrace: p.floor_plans?.terrace || '',
              parking: p.floor_plans?.parking || '',
              foundation: p.engineering_specs?.foundation || '',
              superstructure: p.engineering_specs?.superstructure || '',
              masonry: p.engineering_specs?.masonry || '',
              flooring: p.engineering_specs?.flooring || '',
              doorsWindows: p.engineering_specs?.doorsWindows || '',
              electrical: p.engineering_specs?.electrical || '',
              plumbing: p.engineering_specs?.plumbingSanitary || '',
              waterproofing: p.engineering_specs?.waterproofing || '',
            };
          });
          setProjects(mapped);
        }
      })
      .catch(() => { });

    // 2. Fetch live leads directly from Supabase
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.leads)) {
          const mapped: LeadSubmission[] = data.leads.map((l: any) => ({
            id: l.id,
            name: l.name,
            phone: l.phone,
            interest: l.interest,
            timeline: l.timeline,
            plotStatus: l.plot_status || l.plotStatus,
            submittedAt: l.submitted_at || l.submittedAt || 'Recent',
            status: l.status || 'new',
            notes: l.notes || '',
          }));
          setLeads(mapped);
        }
      })
      .catch(() => { });

    // 3. Fetch reviews directly from Supabase
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
      })
      .catch(() => { });

    // 4. Check Supabase status
    fetch('/api/supabase/status')
      .then((res) => res.json())
      .then((st) => setSupabaseStatus(st))
      .catch(() => { });
  }, []);

  const handleOpenDbModal = () => {
    setIsDbModalOpen(true);
    setMigrationResult(null);
    fetch('/api/supabase/status')
      .then((r) => r.json())
      .then((st) => setSupabaseStatus(st))
      .catch(() => { });
    if (!sqlSchemaText) {
      fetch('/api/supabase/schema')
        .then((r) => r.text())
        .then((txt) => setSqlSchemaText(txt))
        .catch(() => { });
    }
  };

  const handleCopySchema = () => {
    if (sqlSchemaText) {
      navigator.clipboard.writeText(sqlSchemaText);
      setCopiedSchema(true);
      showToast('Supabase SQL Schema copied to clipboard!');
      setTimeout(() => setCopiedSchema(false), 3000);
    }
  };

  const handleRunMigration = async () => {
    setIsMigrating(true);
    setMigrationResult(null);
    try {
      const res = await fetch('/api/supabase/setup-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: dbPasswordInput }),
      });
      const data = await res.json();
      setMigrationResult(data);
      if (data.success) {
        showToast('Supabase database tables created & verified successfully!');
        fetch('/api/supabase/status')
          .then((r) => r.json())
          .then((st) => setSupabaseStatus(st))
          .catch(() => { });
      }
    } catch (err: any) {
      setMigrationResult({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setIsMigrating(false);
    }
  };

  const saveProjectsToLedger = (updated: DashboardProject[]) => {
    setProjects(updated);
    // Push directly to Supabase
    updated.forEach((p) => {
      const cat = p.status === 'delivered' ? 'completed' : 'upcoming';
      fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: p.id,
          title: p.title,
          category: cat,
          category_label: p.statusLabel,
          location: p.location,
          type: p.configuration,
          units: p.units,
          plot_area: p.plotArea,
          built_up_area: p.builtUpArea,
          status: p.statusLabel,
          status_color: p.status === 'delivered' ? 'emerald' : p.status === 'planning' ? 'blue' : 'amber',
          image_url: p.imageUrl,
          images: p.images,
          overview: p.overview,
          highlights: p.highlights,
          floor_plans: p.floorPlans,
          engineering_specs: p.engineeringSpecs,
          specs: p.specs,
          rating: p.rating || 5.0,
          review_count: p.reviewCount || 0,
          unitInventory: p.unitInventory,
        }),
      }).catch((err) => console.warn('Project sync notice:', err));

      if (p.unitInventory && p.unitInventory.length > 0) {
        fetch(`/api/projects/${p.id}/units`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            units: p.units,
            unitInventory: p.unitInventory,
          }),
        }).catch((err) => console.warn('Units sync notice:', err));
      }
    });
    window.dispatchEvent(new Event('anika_projects_updated'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // =========================================================================
  // REAL-TIME UNITS & INVENTORY MANAGER STATE & HANDLERS
  // =========================================================================
  const [unitManagerProject, setUnitManagerProject] = useState<DashboardProject | null>(null);
  const [tempUnitsSummary, setTempUnitsSummary] = useState('');
  const [tempInventory, setTempInventory] = useState<ProjectUnitItem[]>([]);
  const [newUnitForm, setNewUnitForm] = useState<{
    unitNumber: string;
    type: string;
    size: string;
    status: 'available' | 'booked' | 'sold';
    price: string;
    floor: string;
    facing: string;
  }>({
    unitNumber: '',
    type: '2 BHK Independent Villa',
    size: '1,100 sq ft',
    status: 'available',
    price: '',
    floor: 'G+1',
    facing: 'East Facing',
  });

  const handleOpenUnitManager = (project: DashboardProject) => {
    setUnitManagerProject(project);
    setTempUnitsSummary(project.units);
    if (project.unitInventory && project.unitInventory.length > 0) {
      setTempInventory([...project.unitInventory]);
    } else {
      setTempInventory(generateDefaultUnitsForProject(project));
    }
    setNewUnitForm({
      unitNumber: `Unit ${(project.unitInventory?.length || 2) + 1}`,
      type: project.configuration || 'Residential Villa',
      size: project.builtUpArea || '~1,100 sq ft',
      status: 'available',
      price: '',
      floor: 'G+1',
      facing: 'East Facing',
    });
  };

  const handleUpdateUnitStatus = (unitId: string, newStatus: 'available' | 'booked' | 'sold') => {
    setTempInventory((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, status: newStatus } : u))
    );
  };

  const handleUpdateUnitField = (unitId: string, field: keyof ProjectUnitItem, value: string) => {
    setTempInventory((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, [field]: value } : u))
    );
  };

  const handleAddNewUnitToInventory = () => {
    if (!newUnitForm.unitNumber.trim()) {
      showToast('Please specify a unit or plot designation number.');
      return;
    }
    const newItem: ProjectUnitItem = {
      id: `unit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      unitNumber: newUnitForm.unitNumber.trim(),
      type: newUnitForm.type.trim() || 'Residential Unit',
      size: newUnitForm.size.trim() || 'Built-up Area',
      status: newUnitForm.status,
      price: newUnitForm.price.trim() || undefined,
      floor: newUnitForm.floor.trim() || undefined,
      facing: newUnitForm.facing.trim() || undefined,
    };
    setTempInventory((prev) => [...prev, newItem]);
    setNewUnitForm((prev) => ({
      ...prev,
      unitNumber: `Unit ${tempInventory.length + 2}`,
      price: '',
    }));
    showToast(`Added ${newItem.unitNumber} to inventory.`);
  };

  const handleRemoveUnitFromInventory = (unitId: string) => {
    setTempInventory((prev) => prev.filter((u) => u.id !== unitId));
    showToast('Unit removed from inventory.');
  };

  const handleAutoGenerateSummaryFromInventory = () => {
    const total = tempInventory.length;
    const avail = tempInventory.filter((u) => u.status === 'available').length;
    const booked = tempInventory.filter((u) => u.status === 'booked').length;
    const sold = tempInventory.filter((u) => u.status === 'sold').length;

    if (total === 0) {
      setTempUnitsSummary('Custom Engagements');
      return;
    }
    if (total === 1) {
      setTempUnitsSummary(avail > 0 ? 'Single Luxury Villa (Available)' : 'Single Luxury Villa (Booked)');
      showToast('Headline synchronized to single villa status.');
      return;
    }
    if (avail === 0) {
      setTempUnitsSummary(`${total} Units (100% Sold / Handed Over)`);
    } else {
      setTempUnitsSummary(`${total} Units (${avail} Available${booked > 0 ? `, ${booked} Booked` : ''})`);
    }
    showToast('Headline auto-generated from live counts!');
  };

  const handleSaveUnitManager = () => {
    if (!unitManagerProject) return;

    const finalSummary = tempUnitsSummary.trim() || `${tempInventory.length} Units`;
    const updatedProjects = projects.map((p) => {
      if (p.id === unitManagerProject.id) {
        return {
          ...p,
          units: finalSummary,
          unitInventory: tempInventory,
        };
      }
      return p;
    });

    saveProjectsToLedger(updatedProjects);

    if (selectedProjectForView && selectedProjectForView.id === unitManagerProject.id) {
      setSelectedProjectForView({
        ...selectedProjectForView,
        units: finalSummary,
        unitInventory: tempInventory,
      });
    }

    showToast(`Units & live inventory for "${unitManagerProject.title}" saved and synced in real-time to public site!`);
    setUnitManagerProject(null);
  };

  // Open Project Photo Manager Modal for ANY existing project
  const handleOpenPhotoManager = (project: DashboardProject) => {
    const currentImgs = (project.images && project.images.length > 0)
      ? [...project.images]
      : (project.imageUrl ? [project.imageUrl] : []);
    setPhotoManagerProject(project);
    setManagerImages(currentImgs);
    setManagerUrlInput('');
  };

  const handleFilesUploadToManager = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Try backend upload to Supabase Storage via /api/upload
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.urls) && data.urls.length > 0) {
        setManagerImages((prev) => [...prev, ...data.urls]);
        showToast(`${data.urls.length} photos uploaded to storage & attached!`);
        return;
      }
    } catch (err) {
      console.warn('Backend upload fell back to client reader:', err);
    }

    // Client reader fallback
    const readers: Promise<string>[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        readers.push(
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) resolve(e.target.result as string);
            };
            reader.readAsDataURL(file);
          })
        );
      }
    });
    Promise.all(readers).then((newUrls) => {
      if (newUrls.length > 0) {
        setManagerImages((prev) => [...prev, ...newUrls]);
        showToast(`${newUrls.length} new photos uploaded & attached!`);
      }
    });
  };

  const handleAddUrlToManager = () => {
    if (!managerUrlInput.trim()) return;
    setManagerImages((prev) => [...prev, managerUrlInput.trim()]);
    setManagerUrlInput('');
    showToast('Photo URL added to project gallery.');
  };

  const handleRemoveManagerImage = (index: number) => {
    if (managerImages.length <= 1) {
      showToast('A project must have at least one photograph.');
      return;
    }
    setManagerImages((prev) => prev.filter((_, i) => i !== index));
    showToast('Photo removed.');
  };

  const handleSetCoverInManager = (index: number) => {
    if (index === 0) return;
    setManagerImages((prev) => {
      const copy = [...prev];
      const [target] = copy.splice(index, 1);
      return [target, ...copy];
    });
    showToast('Cover photograph updated.');
  };

  const handleMoveManagerImage = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= managerImages.length) return;
    setManagerImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleSavePhotoManager = () => {
    if (!photoManagerProject) return;
    if (managerImages.length === 0) {
      showToast('A project must have at least one photograph.');
      return;
    }
    const updatedProjects = projects.map((p) => {
      if (p.id === photoManagerProject.id) {
        return {
          ...p,
          images: managerImages,
          imageUrl: managerImages[0],
          syncedPhotosCount: managerImages.length,
        };
      }
      return p;
    });
    saveProjectsToLedger(updatedProjects);
    if (selectedProjectForView && selectedProjectForView.id === photoManagerProject.id) {
      setSelectedProjectForView({
        ...selectedProjectForView,
        images: managerImages,
        imageUrl: managerImages[0],
        syncedPhotosCount: managerImages.length,
      });
    }
    setPhotoManagerProject(null);
    showToast(`Saved ${managerImages.length} photos for "${photoManagerProject.title}" & synced live to public website!`);
  };

  // Add Project Multi-Image Handlers
  const handleFilesUploadToForm = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const readers: Promise<string>[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        readers.push(
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) resolve(e.target.result as string);
            };
            reader.readAsDataURL(file);
          })
        );
      }
    });
    Promise.all(readers).then((newUrls) => {
      if (newUrls.length > 0) {
        setFormData((prev) => {
          const combined = [...(prev.images || []), ...newUrls];
          return {
            ...prev,
            images: combined,
            imageUrl: combined[0],
          };
        });
        showToast(`${newUrls.length} photos added to project draft!`);
      }
    });
  };

  const handleAddUrlToForm = () => {
    if (!formUrlInput.trim()) return;
    setFormData((prev) => {
      const combined = [...(prev.images || []), formUrlInput.trim()];
      return {
        ...prev,
        images: combined,
        imageUrl: combined[0],
      };
    });
    setFormUrlInput('');
    showToast('Photo URL added to project draft.');
  };

  const handleRemoveFormImage = (index: number) => {
    setFormData((prev) => {
      const updated = (prev.images || []).filter((_, i) => i !== index);
      return {
        ...prev,
        images: updated,
        imageUrl: updated[0] || '',
      };
    });
    showToast('Photo removed.');
  };

  const handleSetCoverInForm = (index: number) => {
    setFormData((prev) => {
      const copy = [...(prev.images || [])];
      if (index === 0 || index >= copy.length) return prev;
      const [target] = copy.splice(index, 1);
      const updated = [target, ...copy];
      return {
        ...prev,
        images: updated,
        imageUrl: updated[0],
      };
    });
    showToast('Designated as primary cover photo.');
  };

  const handleAttachArchitecturalSamplePackage = () => {
    showToast('Upload photos directly from your device using the file picker or enter image URLs.');
  };

  // Pre-fill button with exact Sai Nagar specs provided by user
  const handleLoadSaiNagarTemplate = () => {
    setFormData({
      title: 'Sai Nagar Modern Row Houses',
      units: '3 Units',
      location: 'Sai Nagar, Akoli Road, Amravati',
      status: 'delivered',
      configuration: '2 BHK Independent Row House Villas',
      plotArea: '~700 sq ft per unit',
      builtUpArea: '~1,100 sq ft built-up each',
      imageUrl: '',
      images: [],
      overview:
        'Three thoughtfully planned 2 BHK modern row houses constructed as compact, self-contained independent villas on dedicated freehold plots in Sai Nagar, Akoli. Each home was engineered with seismic-grade RCC framing, anti-termite treatment, and zero passage wastage.',
      highlights: [
        'G+1 two-level residential layout with dedicated car porch',
        'Double-height feeling with generous 10 ft slab clear height',
        'Abundant natural cross-ventilation and Vastu-compliant layout',
        'Dedicated overhead water tank + underground RCC sump',
      ],
      groundFloor:
        'Covered Car Porch, Spacious Living Room (15x12 ft), Modular Kitchen & Dining, Powder Room, Utility Backyard',
      firstFloor:
        'Master Bedroom with Ensuite Bath (13x11 ft), Children/Guest Bedroom (11x10 ft), Common Bath, Private Front Balcony',
      terrace:
        'Weather-proof open terrace with waterproofing screed and perimeter parapet safety wall',
      parking:
        'Dedicated paved vehicular parking space with motorized gate point',
      foundation:
        'Isolated RCC Column footing with 6 ft anchor depth in solid hard strata',
      superstructure:
        'Reinforced cement concrete (RCC) frame with Ultratech 53 Grade & Fe 550D TMT bars',
      masonry:
        '6-inch fly-ash / red autoclaved brickwork with double-coat sand-faced external plaster',
      flooring:
        '800x800 mm glazed vitrified double-charged tiles across living, dining & master suite',
      doorsWindows:
        'Granite frame encasings with powder-coated 3-track sliding aluminum windows & mosquito mesh',
      electrical:
        'Polycab fire-resistant copper wiring with Legrand modular switches and AC conduit points',
      plumbing:
        'Astral CPVC/UPVC concealed pipework with Jaquar chrome fittings and wall-hung sanitaryware',
      waterproofing:
        'Dr. Fixit 2-coat chemical treatment on terrace slab, sunken bathroom slabs & external parapets',
    });
    showToast('Sai Nagar complete civil template loaded into form!');
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    let matchesFilter = true;
    if (filter === 'sold_out') {
      matchesFilter = project.status === 'sold_out' || (project.rawStatus || '').toLowerCase().includes('sold') || (project.statusLabel || '').toLowerCase().includes('sold');
    } else if (filter === 'delivered') {
      matchesFilter = (project.status === 'delivered' || (project.statusLabel || '').toLowerCase().includes('hand')) && !((project.rawStatus || '').toLowerCase().includes('sold') || (project.statusLabel || '').toLowerCase().includes('sold'));
    } else if (filter === 'ongoing') {
      matchesFilter = project.status === 'ongoing';
    } else if (filter === 'planning') {
      matchesFilter = project.status === 'planning';
    } else if (filter === 'available') {
      matchesFilter = project.status === 'available';
    }
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      project.title.toLowerCase().includes(query) ||
      project.location.toLowerCase().includes(query) ||
      project.configuration.toLowerCase().includes(query) ||
      (project.statusLabel || '').toLowerCase().includes(query) ||
      project.specs.val1.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  const countSoldOut = projects.filter((p) => p.status === 'sold_out' || (p.rawStatus || '').toLowerCase().includes('sold') || (p.statusLabel || '').toLowerCase().includes('sold')).length;
  const countDelivered = projects.filter((p) => (p.status === 'delivered' || (p.statusLabel || '').toLowerCase().includes('hand')) && !((p.rawStatus || '').toLowerCase().includes('sold') || (p.statusLabel || '').toLowerCase().includes('sold'))).length;
  const countOngoing = projects.filter((p) => p.status === 'ongoing').length;
  const countPlanning = projects.filter((p) => p.status === 'planning').length;

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Please specify a project title.');
      return;
    }

    setIsCreatingProject(true);

    let statusLabel = 'Completed & Handed Over';
    let statusBadgeBg = 'bg-[#081928]';
    let statusBadgeText = 'text-[#ecbe8b]';
    let progressVal = 100;
    let statusColor = 'emerald';
    let category = 'completed';

    if (formData.status === 'sold_out') {
      statusLabel = 'Completed & Sold Out';
      statusBadgeBg = 'bg-rose-900/95 border border-rose-500/50';
      statusBadgeText = 'text-rose-100 font-bold';
      progressVal = 100;
      statusColor = 'rose';
      category = 'completed';
    } else if (formData.status === 'available') {
      statusLabel = 'Ready to Move (Units Available)';
      statusBadgeBg = 'bg-emerald-900/90 border border-emerald-500/50';
      statusBadgeText = 'text-emerald-100 font-bold';
      progressVal = 100;
      statusColor = 'emerald';
      category = 'completed';
    } else if (formData.status === 'ongoing') {
      statusLabel = '75% Under Construction';
      statusBadgeBg = 'bg-amber-900/90 border border-amber-400/50';
      statusBadgeText = 'text-amber-100 font-bold';
      progressVal = 75;
      statusColor = 'amber';
      category = 'upcoming';
    } else if (formData.status === 'planning') {
      statusLabel = 'Pre-Booking / In Planning';
      statusBadgeBg = 'bg-blue-900/90 border border-blue-400/50';
      statusBadgeText = 'text-blue-100 font-bold';
      progressVal = 15;
      statusColor = 'blue';
      category = 'upcoming';
    }

    const finalImages = (formData.images && formData.images.length > 0)
      ? formData.images
      : (formData.imageUrl ? [formData.imageUrl] : []);

    const projectId = `proj-${Date.now()}`;

    // Seed unit inventory
    const unitMatch = formData.units.match(/\d+/);
    const unitCount = unitMatch ? parseInt(unitMatch[0], 10) : 3;
    const initialUnits = Array.from({ length: unitCount }, (_, i) => ({
      id: `unit-${projectId}-${i + 1}`,
      unitNumber: `${formData.title.trim()} - Unit ${i + 1}`,
      type: formData.configuration || '2 BHK Independent Villa',
      size: formData.builtUpArea || '~1,100 sq ft',
      status: (formData.status === 'sold_out' ? 'sold' : (i === 0 ? 'available' : i === 1 ? 'booked' : 'sold')) as 'available' | 'booked' | 'sold',
      price: '₹38.5 L',
      floor: 'G+1 Duplex',
      facing: 'East Facing',
    }));

    const newProject: DashboardProject = {
      id: projectId,
      title: formData.title.trim(),
      location: formData.location.trim() || 'Amravati, Maharashtra',
      units: formData.units.trim() || `${unitCount} Units`,
      unitInventory: initialUnits,
      configuration: formData.configuration.trim() || '2 BHK Independent Row House Villas',
      plotArea: formData.plotArea.trim() || '~700 sq ft per unit',
      builtUpArea: formData.builtUpArea.trim() || '~1,100 sq ft built-up each',
      status: formData.status,
      statusLabel,
      statusBadgeBg,
      statusBadgeText,
      imageUrl: finalImages[0],
      images: finalImages,
      imageAlt: formData.title.trim(),
      syncedPhotosCount: finalImages.length,
      overview:
        formData.overview.trim() ||
        'Thoughtfully planned residential development engineered with high quality civil standards in Amravati.',
      highlights:
        formData.highlights.length > 0
          ? formData.highlights
          : [
            'Seismic-grade RCC column framing with Ultratech cement',
            'Vastu-compliant cross-ventilated interior design',
            'Independent overhead and underground water storage',
          ],
      floorPlans: {
        groundFloor: formData.groundFloor.trim() || 'Living Room, Kitchen & Dining, Car Porch, Powder Room',
        firstFloor: formData.firstFloor.trim() || 'Master Suite with Ensuite Bath, Children Room, Balcony',
        terrace: formData.terrace.trim() || 'Waterproofed open sky terrace with parapet wall',
        parking: formData.parking.trim() || 'Dedicated vehicular parking space',
      },
      engineeringSpecs: {
        foundation: formData.foundation.trim() || 'Isolated RCC Column footing with 6 ft anchor depth in hard strata',
        superstructure: formData.superstructure.trim() || 'Ultratech 53 Grade & Fe 550D TMT reinforcement',
        masonry: formData.masonry.trim() || '6-inch fly-ash brickwork with double-coat plaster',
        flooring: formData.flooring.trim() || '800x800 mm glazed vitrified double-charged tiles',
        doorsWindows: formData.doorsWindows.trim() || 'Granite frame encasings with 3-track sliding windows',
        electrical: formData.electrical.trim() || 'Polycab FRLS copper wiring with Legrand modular switches',
        plumbing: formData.plumbing.trim() || 'Astral CPVC/UPVC pipework with Jaquar chrome fittings',
        waterproofing: formData.waterproofing.trim() || 'Dr. Fixit 2-coat chemical treatment on terrace and bathrooms',
      },
      specs: {
        label1: 'Configuration',
        val1: formData.configuration.split(' ')[0] + ' ' + (formData.configuration.split(' ')[1] || 'BHK'),
        label2: 'Plot Size',
        val2: formData.plotArea,
        label3: 'Built-up',
        val3: formData.builtUpArea,
      },
      progress: progressVal,
      progressLabel: `Status: ${statusLabel}`,
      note: 'Live project in database.',
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newProject.id,
          title: newProject.title,
          category,
          category_label: statusLabel,
          location: newProject.location,
          type: newProject.configuration,
          units: newProject.units,
          plot_area: newProject.plotArea,
          built_up_area: newProject.builtUpArea,
          status: statusLabel,
          status_color: statusColor,
          image_url: newProject.imageUrl,
          images: newProject.images,
          overview: newProject.overview,
          highlights: newProject.highlights,
          floor_plans: newProject.floorPlans,
          engineering_specs: newProject.engineeringSpecs,
          specs: newProject.specs,
          progress: newProject.progress,
          progress_label: newProject.progressLabel,
          unitInventory: initialUnits,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit project to Supabase database');
      }

      setProjects((prev) => [newProject, ...prev]);
      setIsQuickAddOpen(false);
      setAddStep(1);
      showToast(`Project "${newProject.title}" saved to database and live on public site!`);
      window.dispatchEvent(new Event('anika_projects_updated'));
    } catch (err: any) {
      console.warn('Error saving project to database:', err);
      showToast(`Error creating project: ${err.message}`);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${projectTitle}" from the database and public site?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete project');
      }
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      showToast(`Project "${projectTitle}" permanently deleted from database.`);
      window.dispatchEvent(new Event('anika_projects_updated'));
    } catch (err: any) {
      showToast(`Error deleting project: ${err.message}`);
    }
  };

  const handleOpenStatusModal = (project: DashboardProject) => {
    setStatusModalProject(project);
  };

  const handleSaveProjectStatus = async (
    projectId: string,
    newStatusKey: string,
    options?: { markAllUnitsSold?: boolean; progress?: number; customLabel?: string }
  ) => {
    const targetProject = projects.find((p) => p.id === projectId);
    if (!targetProject) return;

    setIsUpdatingStatus(true);

    let status = 'In Construction';
    let category = 'upcoming';
    let category_label = 'In Construction / Upcoming';
    let status_color = 'amber';
    let progress = options?.progress ?? 75;
    let progress_label = 'Active Construction in Progress';
    let badgeBg = 'bg-amber-900/90 border border-amber-400/50';
    let badgeText = 'text-amber-100 font-bold';

    if (newStatusKey === 'sold_out') {
      status = 'Sold Out';
      category = 'completed';
      category_label = options?.customLabel || 'Completed & Sold Out';
      status_color = 'rose';
      progress = 100;
      progress_label = '100% Sold Out & Delivered';
      badgeBg = 'bg-rose-900/95 border border-rose-500/50';
      badgeText = 'text-rose-100 font-bold';
    } else if (newStatusKey === 'delivered') {
      status = 'Handed Over';
      category = 'completed';
      category_label = options?.customLabel || 'Completed & Handed Over';
      status_color = 'emerald';
      progress = 100;
      progress_label = 'Delivered & Handed Over';
      badgeBg = 'bg-[#081928] border border-[#7a582e]/50';
      badgeText = 'text-[#ecbe8b] font-bold';
    } else if (newStatusKey === 'available') {
      status = 'Ready to Move';
      category = 'completed';
      category_label = options?.customLabel || 'Ready to Move / Available';
      status_color = 'emerald';
      progress = 100;
      progress_label = 'Ready for Possession';
      badgeBg = 'bg-emerald-900/90 border border-emerald-500/50';
      badgeText = 'text-emerald-100 font-bold';
    } else if (newStatusKey === 'planning') {
      status = 'Under Planning';
      category = 'upcoming';
      category_label = options?.customLabel || 'Pre-Booking / In Planning';
      status_color = 'blue';
      progress = options?.progress ?? 20;
      progress_label = 'Sanction & Pre-Booking Open';
      badgeBg = 'bg-blue-900/90 border border-blue-400/50';
      badgeText = 'text-blue-100 font-bold';
    } else {
      status = 'In Construction';
      category = 'upcoming';
      category_label = options?.customLabel || 'In Construction / Upcoming';
      status_color = 'amber';
      progress = options?.progress ?? 75;
      progress_label = 'Under Active Construction';
      badgeBg = 'bg-amber-900/90 border border-amber-400/50';
      badgeText = 'text-amber-100 font-bold';
    }

    try {
      const res = await fetch(`/api/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          category,
          category_label,
          status_color,
          progress,
          progress_label,
          markAllUnitsSold: options?.markAllUnitsSold ?? (newStatusKey === 'sold_out'),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update project status');
      }

      const updatedProjects = projects.map((p) => {
        if (p.id === projectId) {
          const updatedUnits = (options?.markAllUnitsSold || newStatusKey === 'sold_out') && p.unitInventory
            ? p.unitInventory.map((u) => ({ ...u, status: 'sold' as const }))
            : p.unitInventory;

          return {
            ...p,
            status: newStatusKey,
            rawStatus: status,
            statusLabel: category_label,
            statusBadgeBg: badgeBg,
            statusBadgeText: badgeText,
            statusColor: status_color,
            progress,
            progressLabel: progress_label,
            unitInventory: updatedUnits,
          };
        }
        return p;
      });

      setProjects(updatedProjects);
      setStatusModalProject(null);
      if (selectedProjectForView?.id === projectId) {
        setSelectedProjectForView((prev) =>
          prev
            ? {
                ...prev,
                status: newStatusKey,
                rawStatus: status,
                statusLabel: category_label,
                statusBadgeBg: badgeBg,
                statusBadgeText: badgeText,
                statusColor: status_color,
                progress,
                progressLabel: progress_label,
              }
            : null
        );
      }

      showToast(`Status for "${targetProject.title}" changed to "${category_label}" & live on public site!`);
      window.dispatchEvent(new Event('anika_projects_updated'));
      try {
        localStorage.setItem('anika_projects_last_updated', Date.now().toString());
      } catch { }
    } catch (err: any) {
      console.error('Error updating project status:', err);
      showToast(`Error updating project status: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] font-sans text-[#1b1c1a] flex flex-col selection:bg-[#ecbe8b] selection:text-[#081928]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#081928] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce border border-[#7a582e]/40">
          <CheckCircle2 className="w-4 h-4 text-[#ecbe8b]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* DESKTOP SIDEBAR (Visible lg+) */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-[#f5f3ef] z-50 flex-col justify-between py-6 px-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-[#e4e2de]">
        <div className="flex flex-col gap-6">
          {/* Brand Mark */}
          <div className="px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#081928] flex items-center justify-center text-[#ffddb9] shadow-sm">
                <Building2 className="w-5 h-5 text-[#ecbe8b]" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#081928]">
                ANIKA
              </span>
            </div>
            <p className="text-[11px] font-semibold text-[#44474c] uppercase tracking-wider mt-1.5 pl-1">
              Construction Portal
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded transition-colors text-left cursor-pointer ${activeTab === 'projects'
                  ? 'bg-[#1e2e3e] text-white shadow-sm'
                  : 'text-[#44474c] hover:bg-[#efeeea] hover:text-[#1b1c1a]'
                }`}
            >
              <Building2 className="w-4 h-4 text-[#ecbe8b]" />
              <span>Projects Portfolio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('leads')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded transition-colors text-left cursor-pointer ${activeTab === 'leads'
                  ? 'bg-[#1e2e3e] text-white shadow-sm'
                  : 'text-[#44474c] hover:bg-[#efeeea] hover:text-[#1b1c1a]'
                }`}
            >
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4" />
                <span>Inquiries & Leads</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-[#efeeea] text-[#1b1c1a] text-[10px]">
                {leads.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded transition-colors text-left cursor-pointer ${activeTab === 'reviews'
                  ? 'bg-[#1e2e3e] text-white shadow-sm'
                  : 'text-[#44474c] hover:bg-[#efeeea] hover:text-[#1b1c1a]'
                }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Client Reviews</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-[#efeeea] text-[#1b1c1a] text-[10px]">
                {reviews.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded transition-colors text-left cursor-pointer ${activeTab === 'videos'
                  ? 'bg-[#1e2e3e] text-white shadow-sm'
                  : 'text-[#44474c] hover:bg-[#efeeea] hover:text-[#1b1c1a]'
                }`}
            >
              <Youtube className="w-4 h-4 text-red-500" />
              <span>YouTube Reels</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('desk')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded transition-colors text-left cursor-pointer ${activeTab === 'desk'
                  ? 'bg-[#1e2e3e] text-white shadow-sm'
                  : 'text-[#44474c] hover:bg-[#efeeea] hover:text-[#1b1c1a]'
                }`}
            >
              <HardHat className="w-4 h-4" />
              <span>Engineer Desk</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className="flex flex-col gap-3">
          <div className="bg-[#efeeea] p-3 rounded flex items-center justify-between border border-[#e4e2de]">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#7a582e] uppercase tracking-wider">
                Amravati HQ
              </span>
              <span className="text-xs font-medium text-[#1b1c1a]">
                Site Office Synced
              </span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          </div>

          {/* Supabase & Cloud Database Status */}
          <button
            type="button"
            onClick={handleOpenDbModal}
            className="w-full text-left bg-[#efeeea] hover:bg-[#e4e2de] p-2.5 rounded border border-[#e4e2de] transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#7a582e]" />
                <span className="text-[11px] font-bold text-[#1b1c1a]">
                  Supabase & Cloud DB
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-[#55585d] leading-tight">
              Storage Bucket Ready • Local Ledger
            </p>
          </button>

          <div className="flex items-center justify-between pt-2 border-t border-[#e4e2de]">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-xs text-[#44474c] hover:text-[#1b1c1a] inline-flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Website</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="text-xs text-red-700 hover:text-red-900 inline-flex items-center gap-1 font-semibold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================= */}
      <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-[#fbf9f5]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 border-b border-[#e4e2de]/60">
        <div className="h-16 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#081928] flex items-center justify-center text-[#ffddb9]">
                <Building2 className="w-4 h-4 text-[#ecbe8b]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#7a582e]">
                  Anika Projects
                </span>
                <span className="font-semibold text-sm text-[#081928] leading-tight">
                  Portfolio Dashboard
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className="text-[#44474c]">Permit:</span>
              <span className="font-semibold text-[#1b1c1a] bg-[#eae8e4] px-2.5 py-0.5 rounded text-[11px] font-mono">
                AMT-2024-V942
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenDbModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#efeeea] hover:bg-[#e4e2de] border border-[#e4e2de] text-xs font-semibold text-[#1b1c1a] transition-colors cursor-pointer"
              title="Click to check Supabase Database & Storage status"
            >
              <Database className="w-3.5 h-3.5 text-[#7a582e]" />
              <span className="hidden md:inline">Supabase Cloud</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            <div className="hidden md:flex items-center gap-2 bg-[#f5f3ef] px-3 py-1 rounded border border-[#e4e2de]">
              <ShieldCheck className="w-4 h-4 text-[#7a582e]" />
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-[#1b1c1a]">
                  {session.email}
                </span>
                <span className="text-[10px] text-[#44474c]">
                  Verified Owner Session
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast('All site operations normal in Amravati.')}
              aria-label="Notifications"
              className="p-2 text-[#44474c] hover:text-[#1b1c1a] transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7a582e]" />
            </button>

            <button
              type="button"
              onClick={onNavigateHome}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#f5f3ef] hover:bg-[#efeeea] text-xs font-semibold text-[#1b1c1a] border border-[#e4e2de] transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#7a582e]" />
              <span>Public Site</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================= */}
      <div className="lg:pl-64 flex-1 flex flex-col pt-16 pb-20 lg:pb-12">
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1600px] mx-auto">

          {/* ========================================================= */}
          {/* TAB 1: RESIDENTIAL PROJECTS */}
          {/* ========================================================= */}
          {activeTab === 'projects' && (
            <div className="flex flex-col gap-6 animate-fadeIn">

              {/* Top Filter Tabs Bar */}
              <div className="bg-[#f5f3ef] p-1.5 rounded-lg flex items-center justify-between overflow-x-auto shadow-sm border border-[#e4e2de]">
                <div className="flex items-center gap-1 min-w-max">
                  <button
                    type="button"
                    onClick={() => setActiveTab('projects')}
                    className="px-4 py-2 rounded text-xs font-semibold bg-[#081928] text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-[#ecbe8b]" />
                    <span>Residential Projects ({projects.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('leads')}
                    className="px-4 py-2 rounded text-xs font-semibold text-[#44474c] hover:text-[#1b1c1a] hover:bg-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Inquiries & Leads ({leads.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className="px-4 py-2 rounded text-xs font-semibold text-[#44474c] hover:text-[#1b1c1a] hover:bg-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Client Reviews ({reviews.length})</span>
                  </button>
                </div>

                <div className="hidden xl:flex items-center gap-2 pr-2">
                  <button
                    type="button"
                    onClick={() => showToast('Exporting project portfolio as PDF...')}
                    className="px-3 py-1.5 bg-[#efeeea] hover:bg-white text-[#1b1c1a] text-xs font-semibold rounded flex items-center gap-1.5 shadow-sm transition-colors border border-[#e4e2de] cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#7a582e]" />
                    <span>Export Portfolio</span>
                  </button>
                </div>
              </div>

              {/* Title & Add Project Banner */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider text-[#7a582e] font-bold">
                      Amravati Urban Zone
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7a582e]" />
                    <span className="text-[11px] text-[#44474c] font-medium">
                      Active Portfolio ({projects.length} Projects)
                    </span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl text-[#081928] tracking-tight font-medium">
                    Residential Projects Portfolio
                  </h1>
                  <p className="text-sm text-[#44474c] max-w-2xl leading-relaxed">
                    Manage ongoing construction, delivered units, and add new developments across Amravati sites with complete civil engineering dossiers.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickAddOpen(true);
                      setAddStep(1);
                    }}
                    className="px-4 py-2.5 bg-[#081928] hover:bg-[#1e2e3e] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#fecf9b]" />
                    <span>Add New Project</span>
                  </button>
                </div>
              </div>

              {/* Filter Chips & Search Bar */}
              <div className="p-3 sm:p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#f5f3ef] shadow-sm border border-[#e4e2de]">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${filter === 'all'
                        ? 'bg-[#081928] text-white shadow-sm'
                        : 'bg-[#efeeea] text-[#44474c] hover:text-[#1b1c1a] hover:bg-[#eae8e4]'
                      }`}
                  >
                    <span>All Projects</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#1e2e3e] text-[#8596a9] text-[10px]">
                      {projects.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilter('sold_out')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${filter === 'sold_out'
                        ? 'bg-rose-900 text-white shadow-sm'
                        : 'bg-[#efeeea] text-[#44474c] hover:text-[#1b1c1a] hover:bg-[#eae8e4]'
                      }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>Sold Out</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-950 font-bold text-[10px]">
                      {countSoldOut}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilter('ongoing')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${filter === 'ongoing'
                        ? 'bg-[#081928] text-white shadow-sm'
                        : 'bg-[#efeeea] text-[#44474c] hover:text-[#1b1c1a] hover:bg-[#eae8e4]'
                      }`}
                  >
                    <span>Ongoing</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#e4e2de] text-[#1b1c1a] text-[10px]">
                      {countOngoing}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilter('delivered')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${filter === 'delivered'
                        ? 'bg-[#081928] text-white shadow-sm'
                        : 'bg-[#efeeea] text-[#44474c] hover:text-[#1b1c1a] hover:bg-[#eae8e4]'
                      }`}
                  >
                    <span>Delivered</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#e4e2de] text-[#1b1c1a] text-[10px]">
                      {countDelivered}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilter('planning')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${filter === 'planning'
                        ? 'bg-[#081928] text-white shadow-sm'
                        : 'bg-[#efeeea] text-[#44474c] hover:text-[#1b1c1a] hover:bg-[#eae8e4]'
                      }`}
                  >
                    <span>Planning</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#e4e2de] text-[#1b1c1a] text-[10px]">
                      {countPlanning}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-72">
                    <Search className="w-4 h-4 text-[#74777d] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter by project name, location..."
                      className="w-full pl-9 pr-3 py-1.5 bg-[#fbf9f5] rounded text-xs text-[#1b1c1a] placeholder-[#74777d] outline-none focus:bg-white shadow-sm border border-[#e4e2de]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setFilter('all');
                      showToast('Portfolio sync completed.');
                    }}
                    title="Refresh Portfolio"
                    className="p-2 bg-[#fbf9f5] hover:bg-[#efeeea] text-[#44474c] hover:text-[#1b1c1a] rounded shadow-sm border border-[#e4e2de] transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Projects Grid: Exactly Matching User Reference */}
              {filteredProjects.length === 0 ? (
                <div className="bg-white rounded-xl p-10 border border-dashed border-[#c4c6cc] text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#ffddb9]/50 flex items-center justify-center text-[#7a582e]">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#081928]">
                    No Projects in Ledger
                  </h3>
                  <p className="text-xs text-[#44474c] max-w-sm">
                    All demo data has been cleared. Add your first real construction project below or click "+ Add New Project".
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickAddOpen(true);
                      setAddStep(1);
                    }}
                    className="mt-2 px-4 py-2 bg-[#081928] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-[#1e2e3e]"
                  >
                    <Plus className="w-4 h-4 text-[#ecbe8b]" />
                    <span>Add New Project</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredProjects.map((project) => (
                  <article
                    key={project.id}
                    className="bg-white rounded-xl shadow-sm border border-[#c4c6cc]/40 flex flex-col justify-between hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-[#1e2e3e]">
                      {project.imageUrl ? (
                        <img
                          src={project.imageUrl}
                          alt={project.imageAlt || project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#ffddb9]/70 bg-[#0c1824] gap-2">
                          <Building2 className="w-10 h-10 text-[#ecbe8b]/50" />
                          <span className="text-xs font-semibold text-[#ecbe8b]/80">No Cover Photo Uploaded Yet</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#081928]/85 via-transparent to-transparent pointer-events-none" />

                      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(project)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${project.statusBadgeBg} ${project.statusBadgeText} text-[11px] font-bold tracking-wider uppercase backdrop-blur-sm shadow hover:scale-105 transition-all cursor-pointer`}
                          title="Click to update project status (Sold Out, Handed Over, In Construction...)"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{project.statusLabel}</span>
                          <Sliders className="w-3 h-3 opacity-75 ml-0.5" />
                        </button>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <span className="inline-flex items-center gap-1.5 text-[11px] bg-[#1e2e3e]/85 backdrop-blur-md px-2.5 py-1 rounded-md text-[#fecf9b]">
                          <Camera className="w-3.5 h-3.5 text-[#ecbe8b]" />
                          <span>{(project.images?.length || project.syncedPhotosCount || 1)} Photos Synced</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleOpenPhotoManager(project)}
                          className="px-2.5 py-1 rounded bg-[#ecbe8b] hover:bg-[#ffddb9] text-[#081928] text-[11px] font-bold shadow flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Upload / Manage Photos</span>
                        </button>
                      </div>
                    </div>

                    {/* Multiple Photos Thumbnail Preview Strip */}
                    <div className="px-4 py-2 bg-[#f5f3ef] border-b border-[#e4e2de] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5">
                        {((project.images && project.images.length > 0) ? project.images : [project.imageUrl]).slice(0, 4).map((imgUrl, imgIdx) => (
                          <div
                            key={imgIdx}
                            className="relative w-11 h-8 rounded overflow-hidden shrink-0 border border-[#c4c6cc] shadow-xs group/thumb"
                            title={`Project photo ${imgIdx + 1}`}
                          >
                            <img src={imgUrl} alt={`Photo ${imgIdx + 1}`} className="w-full h-full object-cover" />
                            {imgIdx === 0 && (
                              <div className="absolute top-0.5 left-0.5 bg-[#081928] text-[#ecbe8b] rounded-full p-0.5">
                                <Star className="w-2 h-2 fill-current" />
                              </div>
                            )}
                          </div>
                        ))}
                        {((project.images?.length || 1) > 4) && (
                          <button
                            type="button"
                            onClick={() => handleOpenPhotoManager(project)}
                            className="w-11 h-8 rounded bg-[#e4e2de] hover:bg-[#c4c6cc] text-[#081928] text-[10px] font-bold shrink-0 flex items-center justify-center cursor-pointer transition-colors"
                          >
                            +{(project.images?.length || 1) - 4} More
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenPhotoManager(project)}
                        className="text-[11px] font-bold text-[#7a582e] hover:text-[#081928] flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Photos</span>
                      </button>
                    </div>

                    <div className="p-5 flex flex-col gap-3.5 flex-1 justify-between">
                      <div className="flex flex-col gap-3">
                        <div>
                          <div className="flex items-center gap-1.5 text-[#7a582e] text-xs font-semibold">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{project.location}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <h2 className="font-serif text-2xl font-semibold text-[#081928] tracking-tight">
                              {project.title}
                            </h2>
                            <button
                              type="button"
                              onClick={() => handleOpenUnitManager(project)}
                              title="Click to manage live units inventory & status"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7a582e] hover:text-[#081928] px-2.5 py-1 rounded-md bg-[#f5f3ef] hover:bg-[#ffddb9]/50 border border-[#e4e2de] hover:border-[#7a582e]/50 whitespace-nowrap transition-all cursor-pointer group shadow-2xs"
                            >
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{project.units}</span>
                              <Edit3 className="w-3 h-3 text-[#7a582e] opacity-60 group-hover:opacity-100 transition-opacity" />
                            </button>
                          </div>

                          {/* Live Units Breakdown Strip */}
                          {project.unitInventory && project.unitInventory.length > 0 && (() => {
                            const avail = project.unitInventory.filter(u => u.status === 'available').length;
                            const booked = project.unitInventory.filter(u => u.status === 'booked').length;
                            const sold = project.unitInventory.filter(u => u.status === 'sold').length;
                            return (
                              <div className="mt-2 flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-lg bg-[#fbf9f5] border border-[#e4e2de] text-xs">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-[#081928] flex items-center gap-1 text-[11px]">
                                    <Home className="w-3 h-3 text-[#7a582e]" /> Real-Time Units:
                                  </span>
                                  <span className="font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded text-[10px]">
                                    {avail} Available
                                  </span>
                                  {booked > 0 && (
                                    <span className="font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded text-[10px]">
                                      {booked} Booked
                                    </span>
                                  )}
                                  {sold > 0 && (
                                    <span className="font-bold text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded text-[10px]">
                                      {sold} Sold
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleOpenUnitManager(project)}
                                  className="text-[11px] font-bold text-[#7a582e] hover:text-[#081928] underline cursor-pointer whitespace-nowrap"
                                >
                                  Manage Inventory →
                                </button>
                              </div>
                            );
                          })()}
                        </div>

                        {/* 3-Column Specs Grid */}
                        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg bg-[#f5f3ef] border border-[#e4e2de] text-center sm:text-left">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#44474c] uppercase tracking-wider">
                              {project.specs.label1}
                            </span>
                            <span className="text-xs font-bold text-[#081928] mt-0.5">
                              {project.specs.val1}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#44474c] uppercase tracking-wider">
                              {project.specs.label2}
                            </span>
                            <span className="text-xs font-bold text-[#081928] mt-0.5">
                              {project.specs.val2}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#44474c] uppercase tracking-wider">
                              {project.specs.label3}
                            </span>
                            <span className="text-xs font-bold text-[#7a582e] mt-0.5">
                              {project.specs.val3}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar (if ongoing) */}
                        {typeof project.progress === 'number' && project.status === 'ongoing' && (
                          <div className="flex flex-col gap-1.5 bg-[#f5f3ef] p-3 rounded-lg border border-[#e4e2de]">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-[#44474c] font-medium">
                                {project.progressLabel || 'Construction Progress'}
                              </span>
                              <span className="text-[#081928] font-bold">
                                {project.progress}%
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-[#e4e2de] overflow-hidden">
                              <div
                                className="h-full bg-[#7a582e] rounded-full transition-all duration-500"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Inquiry Status Strip */}
                        <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-[#f5f3ef] border border-[#e4e2de]">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 animate-pulse" />
                            <span className="font-bold text-[#081928] text-[11px] shrink-0">
                              Inquiry Status:
                            </span>
                            <span className="text-[#44474c] text-[11px] truncate">
                              {project.note?.includes('inquiries')
                                ? project.note
                                : `${project.inquiryCount || (project.status === 'delivered' ? 6 : project.status === 'ongoing' ? 5 : 4)} Active Inquiries (${project.statusLabel})`}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('leads');
                              setInquirySearchQuery(project.title.split(' ')[0]);
                            }}
                            className="text-[11px] font-bold text-[#7a582e] hover:text-[#081928] inline-flex items-center gap-0.5 ml-2 shrink-0 cursor-pointer"
                          >
                            <span>View Inquiries</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        {project.note && !project.note.includes('inquiries') && (
                          <div className="flex items-center gap-2 text-xs text-[#44474c] pt-0.5">
                            <CheckCircle2 className="w-4 h-4 text-[#7a582e] shrink-0" />
                            <span>{project.note}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 mt-1 border-t border-[#e4e2de] gap-2">
                        <span className="text-xs text-[#44474c]">
                          {project.status === 'sold_out' || (project.rawStatus || '').toLowerCase().includes('sold') ? (
                            <>Status: <strong className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">100% Sold Out</strong></>
                          ) : project.status === 'delivered' ? (
                            <>Status: <strong className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Handed Over</strong></>
                          ) : project.status === 'available' ? (
                            <>Status: <strong className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Ready to Move</strong></>
                          ) : project.status === 'ongoing' ? (
                            <>Next: <strong className="text-[#081928] font-semibold">{project.nextMilestone || 'Plastering & MEP'}</strong></>
                          ) : (
                            <>Status: <strong className="text-[#081928] font-semibold">Sanction Approved</strong></>
                          )}
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(project)}
                            className="px-2.5 py-1.5 bg-[#fbf9f5] hover:bg-[#ffddb9]/60 text-[#081928] border border-[#e4e2de] text-xs font-bold rounded flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            title="Change project status: Sold Out, Handed Over, Under Construction..."
                          >
                            <Sliders className="w-3.5 h-3.5 text-[#7a582e]" />
                            <span>Change Status</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenPhotoManager(project)}
                            className="px-2.5 py-1.5 bg-[#f5f3ef] hover:bg-[#ffddb9]/50 text-[#7a582e] hover:text-[#081928] border border-[#e4e2de] text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer transition-colors"
                            title="Manage & Upload Photos for this project"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Photos ({(project.images?.length || 1)})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenUnitManager(project)}
                            className="px-3 py-1.5 bg-[#efeeea] hover:bg-[#ffddb9]/50 text-[#1b1c1a] hover:text-[#081928] text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1.5 border border-[#e4e2de]"
                            title="Manage individual units, plots, and real-time inventory"
                          >
                            <Home className="w-3.5 h-3.5 text-[#7a582e]" />
                            <span>Manage Units</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProjectForView(project);
                              setViewModalTab('overview');
                            }}
                            className="px-3.5 py-1.5 bg-[#081928] text-white hover:bg-[#1e2e3e] text-xs font-semibold rounded shadow-sm transition-colors cursor-pointer"
                          >
                            View Project
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(project.id, project.title)}
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                            title="Delete this project from database and public site"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              )}

              {/* ========================================================= */}
              {/* ADJUSTED DASHBOARD PROJECT ADD SECTION (Interactive 2-Step) */}
              {/* ========================================================= */}
              <div className="bg-white rounded-xl p-5 sm:p-7 shadow-sm border border-[#c4c6cc]/40 flex flex-col gap-6" id="addProjectSection">

                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e4e2de]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#ffddb9] flex items-center justify-center text-[#7a582e] shadow-sm">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#081928]">
                          Add Project to Construction Ledger
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#081928] text-[#ecbe8b] text-[11px] font-bold">
                          Step {addStep} of 2
                        </span>
                      </div>
                      <p className="text-xs text-[#44474c] mt-0.5">
                        {addStep === 1
                          ? 'Step 1: Set identity, units count, plot area, built-up size, and elevation photo.'
                          : 'Step 2: Define architectural highlights, 4-tier floor plans, and civil material grades.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions / Pre-fill Template */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleLoadSaiNagarTemplate}
                      className="px-3 py-1.5 rounded-lg bg-[#f5f3ef] hover:bg-[#ffddb9]/50 text-[#7a582e] text-xs font-bold border border-[#7a582e]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Load Sai Nagar full real data into the form"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Pre-fill Sai Nagar Template</span>
                    </button>
                  </div>
                </div>

                {/* Step Indicators */}
                <div className="flex items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setAddStep(1)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${addStep === 1
                        ? 'bg-[#081928] text-white'
                        : 'bg-[#f5f3ef] text-[#44474c] hover:text-[#1b1c1a]'
                      }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>1. Core Details & Photos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddStep(2)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${addStep === 2
                        ? 'bg-[#081928] text-white'
                        : 'bg-[#f5f3ef] text-[#44474c] hover:text-[#1b1c1a]'
                      }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span>2. Architecture & Civil Engineering Specs</span>
                  </button>
                </div>

                {/* The Form */}
                <form onSubmit={handleCreateProject} className="space-y-6">

                  {/* STEP 1: Basic Details, Location, Dimensions & Elevation */}
                  {addStep === 1 && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#081928]">
                            Project Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) =>
                              setFormData({ ...formData, title: e.target.value })
                            }
                            placeholder="e.g. Sai Nagar Modern Row Houses"
                            className="bg-[#fbf9f5] border border-[#c4c6cc]/70 rounded-lg px-3.5 py-2.5 text-xs text-[#1b1c1a] focus:outline-none focus:border-[#7a582e] shadow-sm"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#081928]">
                            Location in Amravati *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({ ...formData, location: e.target.value })
                            }
                            placeholder="e.g. Sai Nagar, Akoli Road, Amravati"
                            className="bg-[#fbf9f5] border border-[#c4c6cc]/70 rounded-lg px-3.5 py-2.5 text-xs text-[#1b1c1a] focus:outline-none focus:border-[#7a582e] shadow-sm"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#081928]">
                            Units Count *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.units}
                            onChange={(e) =>
                              setFormData({ ...formData, units: e.target.value })
                            }
                            placeholder="e.g. 3 Units or Single Villa"
                            className="bg-[#fbf9f5] border border-[#c4c6cc]/70 rounded-lg px-3.5 py-2.5 text-xs text-[#1b1c1a] focus:outline-none focus:border-[#7a582e] shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#081928]">
                            Configuration / Typology
                          </label>
                          <input
                            type="text"
                            value={formData.configuration}
                            onChange={(e) =>
                              setFormData({ ...formData, configuration: e.target.value })
                            }
                            placeholder="e.g. 2 BHK Independent Row House Villas"
                            className="bg-[#fbf9f5] border border-[#c4c6cc]/70 rounded-lg px-3.5 py-2.5 text-xs text-[#1b1c1a] focus:outline-none focus:border-[#7a582e]"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#081928]">
                            Plot Area
                          </label>
                          <input
                            type="text"
                            value={formData.plotArea}
                            onChange={(e) =>
                              setFormData({ ...formData, plotArea: e.target.value })
                            }
                            placeholder="e.g. ~700 sq ft per unit"
                            className="bg-[#fbf9f5] border border-[#c4c6cc]/70 rounded-lg px-3.5 py-2.5 text-xs text-[#1b1c1a] focus:outline-none focus:border-[#7a582e]"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#081928]">
                            Built-up Area
                          </label>
                          <input
                            type="text"
                            value={formData.builtUpArea}
                            onChange={(e) =>
                              setFormData({ ...formData, builtUpArea: e.target.value })
                            }
                            placeholder="e.g. ~1,100 sq ft built-up each"
                            className="bg-[#fbf9f5] border border-[#c4c6cc]/70 rounded-lg px-3.5 py-2.5 text-xs text-[#1b1c1a] focus:outline-none focus:border-[#7a582e]"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-[#081928]">
                            Construction Status
                          </label>
                          <select
                            value={formData.status}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                status: e.target.value as any,
                              })
                            }
                            className="bg-[#fbf9f5] border border-[#c4c6cc]/70 rounded-lg px-3.5 py-2.5 text-xs text-[#1b1c1a] focus:outline-none focus:border-[#7a582e]"
                          >
                            <option value="sold_out">🔴 Completed & Sold Out (100% Sold)</option>
                            <option value="delivered">🟢 Completed & Handed Over</option>
                            <option value="ongoing">🟡 Under Construction (75%)</option>
                            <option value="planning">🔵 Under Planning / Pre-Booking</option>
                            <option value="available">🟣 Ready to Move / Available</option>
                          </select>
                        </div>
                      </div>

                      {/* Multi-Image Project Photo Gallery Uploader */}
                      <div className="flex flex-col gap-2.5 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-xs font-bold text-[#081928] flex items-center gap-1.5">
                              <Camera className="w-4 h-4 text-[#7a582e]" />
                              <span>Multiple Project Photographs & Elevations *</span>
                            </label>
                            <p className="text-[11px] text-[#44474c] mt-0.5">
                              Upload multiple images of the same project (Elevation, Floor Plans, Living, Bedrooms, Terrace, Construction).
                            </p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-[#081928] text-[#ecbe8b] text-[11px] font-bold">
                            {(formData.images?.length || 0)} Photos Attached
                          </span>
                        </div>

                        {/* Drag & Drop / File Browser Dropzone */}
                        <div
                          onClick={() => document.getElementById('inline-multi-photo-input')?.click()}
                          className="w-full p-4 rounded-xl border-2 border-dashed border-[#c4c6cc] bg-[#fbf9f5] hover:bg-[#f5f3ef] transition-all flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer group"
                        >
                          <input
                            id="inline-multi-photo-input"
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFilesUploadToForm(e.target.files)}
                          />
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-[#ffddb9] group-hover:scale-105 transition-transform flex items-center justify-center text-[#7a582e] shrink-0">
                              <Upload className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#081928]">
                                Click to Browse & Upload Multiple Project Photos
                              </p>
                              <p className="text-[11px] text-[#44474c] mt-0.5">
                                Select multiple JPG, PNG, or WebP files simultaneously.
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold px-3.5 py-2 rounded-lg bg-[#081928] text-white shadow-xs group-hover:bg-[#1e2e3e] transition-colors shrink-0">
                            + Select Files
                          </span>
                        </div>

                        {/* Attached Photos Thumbnail Gallery Grid */}
                        {formData.images && formData.images.length > 0 && (
                          <div className="p-3 bg-[#f5f3ef] rounded-xl border border-[#e4e2de] space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold text-[#44474c]">
                              <span>Attached Photos ({formData.images.length}) • First photo is primary cover</span>
                              <span className="text-[11px] text-[#7a582e]">Click photo to set as Cover</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                              {formData.images.map((imgUrl, imgIdx) => (
                                <div
                                  key={imgIdx}
                                  className={`relative aspect-[4/3] rounded-lg overflow-hidden border group transition-all ${imgIdx === 0
                                      ? 'border-[#7a582e] ring-2 ring-[#7a582e]/50 shadow-sm'
                                      : 'border-[#c4c6cc] hover:border-[#7a582e]'
                                    }`}
                                >
                                  <img src={imgUrl} alt={`Attached ${imgIdx + 1}`} className="w-full h-full object-cover" />

                                  {/* Cover Badge */}
                                  {imgIdx === 0 ? (
                                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#081928]/90 text-[#ecbe8b] text-[9px] font-bold flex items-center gap-0.5 shadow">
                                      <Star className="w-2.5 h-2.5 fill-current" />
                                      <span>Cover</span>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSetCoverInForm(imgIdx);
                                      }}
                                      className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 hover:bg-[#081928] text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                      title="Set as primary cover"
                                    >
                                      Make Cover
                                    </button>
                                  )}

                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveFormImage(imgIdx);
                                    }}
                                    className="absolute top-1 right-1 p-1 rounded-full bg-red-600/90 hover:bg-red-700 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                                    title="Remove this photo"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>

                                  <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/70 text-white text-[9px] font-mono">
                                    #{imgIdx + 1}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* URL Adder & Sample Package Toolbar */}
                        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                          <div className="flex items-center gap-1.5 flex-1 w-full">
                            <input
                              type="url"
                              value={formUrlInput}
                              onChange={(e) => setFormUrlInput(e.target.value)}
                              placeholder="Or paste an architectural photo URL..."
                              className="flex-1 h-9 px-3 rounded-lg bg-[#fbf9f5] border border-[#c4c6cc] text-xs text-[#1b1c1a] focus:outline-none focus:border-[#7a582e]"
                            />
                            <button
                              type="button"
                              onClick={handleAddUrlToForm}
                              className="px-3 h-9 rounded-lg bg-[#081928] hover:bg-[#1e2e3e] text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
                            >
                              + Add URL
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={handleAttachArchitecturalSamplePackage}
                            className="px-3 h-9 rounded-lg bg-[#ffddb9]/50 hover:bg-[#ffddb9] text-[#7a582e] border border-[#7a582e]/30 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Preload 6 Architectural Photos</span>
                          </button>
                        </div>
                      </div>

                      {/* Step 1 Footer */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#e4e2de]">
                        <span className="text-xs text-[#44474c]">
                          Configure detailed room measurements & civil specs, or save immediately to database.
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="submit"
                            disabled={isCreatingProject}
                            className="px-4 py-2.5 bg-[#f5f3ef] hover:bg-[#ffddb9]/50 text-[#7a582e] border border-[#e4e2de] rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            <Check className="w-4 h-4 text-[#7a582e]" />
                            <span>{isCreatingProject ? 'Saving...' : 'Quick Save'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddStep(2)}
                            className="px-5 py-2.5 bg-[#081928] hover:bg-[#1e2e3e] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow"
                          >
                            <span>Step 2: Civil Specs</span>
                            <ArrowRight className="w-4 h-4 text-[#ecbe8b]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Overview, Highlights, Floor Plans & Material Grades */}
                  {addStep === 2 && (
                    <div className="space-y-6 animate-fadeIn">

                      {/* Project Overview */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#081928]">
                          Project Overview / Architectural Synopsis
                        </label>
                        <textarea
                          rows={2}
                          value={formData.overview}
                          onChange={(e) =>
                            setFormData({ ...formData, overview: e.target.value })
                          }
                          placeholder="Three thoughtfully planned 2 BHK modern row houses constructed as compact, self-contained independent villas on dedicated freehold plots..."
                          className="bg-[#fbf9f5] border border-[#c4c6cc]/70 rounded-lg p-3 text-xs text-[#1b1c1a] focus:outline-none focus:border-[#7a582e]"
                        />
                      </div>

                      {/* Floor Plan Breakdown */}
                      <div className="p-4 rounded-xl bg-[#f5f3ef] border border-[#e4e2de] space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#081928] uppercase tracking-wider">
                          <Layers className="w-4 h-4 text-[#7a582e]" />
                          <span>Floor Plan Breakdown</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-bold text-[#44474c] mb-1">
                              Ground Floor Layout
                            </label>
                            <input
                              type="text"
                              value={formData.groundFloor}
                              onChange={(e) =>
                                setFormData({ ...formData, groundFloor: e.target.value })
                              }
                              placeholder="Covered Car Porch, Spacious Living Room (15x12 ft), Modular Kitchen & Dining..."
                              className="w-full bg-white border border-[#c4c6cc]/70 rounded p-2 text-xs text-[#1b1c1a]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#44474c] mb-1">
                              First Floor Layout
                            </label>
                            <input
                              type="text"
                              value={formData.firstFloor}
                              onChange={(e) =>
                                setFormData({ ...formData, firstFloor: e.target.value })
                              }
                              placeholder="Master Bedroom with Ensuite Bath (13x11 ft), Children/Guest Bedroom..."
                              className="w-full bg-white border border-[#c4c6cc]/70 rounded p-2 text-xs text-[#1b1c1a]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#44474c] mb-1">
                              Terrace Zone
                            </label>
                            <input
                              type="text"
                              value={formData.terrace}
                              onChange={(e) =>
                                setFormData({ ...formData, terrace: e.target.value })
                              }
                              placeholder="Weather-proof open terrace with waterproofing screed and perimeter parapet safety wall"
                              className="w-full bg-white border border-[#c4c6cc]/70 rounded p-2 text-xs text-[#1b1c1a]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#44474c] mb-1">
                              Parking & Access
                            </label>
                            <input
                              type="text"
                              value={formData.parking}
                              onChange={(e) =>
                                setFormData({ ...formData, parking: e.target.value })
                              }
                              placeholder="Dedicated paved vehicular parking space with motorized gate point"
                              className="w-full bg-white border border-[#c4c6cc]/70 rounded p-2 text-xs text-[#1b1c1a]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Civil Engineering Specs & Material Grades */}
                      <div className="p-4 rounded-xl bg-[#f5f3ef] border border-[#e4e2de] space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#081928] uppercase tracking-wider">
                          <HardHat className="w-4 h-4 text-[#7a582e]" />
                          <span>Civil Engineering Specifications & Material Grades</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-bold text-[#44474c] mb-1">
                              Foundation & Earthwork
                            </label>
                            <input
                              type="text"
                              value={formData.foundation}
                              onChange={(e) =>
                                setFormData({ ...formData, foundation: e.target.value })
                              }
                              placeholder="Isolated RCC Column footing with 6 ft anchor depth in solid hard strata"
                              className="w-full bg-white border border-[#c4c6cc]/70 rounded p-2 text-xs text-[#1b1c1a]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#44474c] mb-1">
                              RCC Superstructure
                            </label>
                            <input
                              type="text"
                              value={formData.superstructure}
                              onChange={(e) =>
                                setFormData({ ...formData, superstructure: e.target.value })
                              }
                              placeholder="Reinforced cement concrete (RCC) frame with Ultratech 53 Grade & Fe 550D TMT bars"
                              className="w-full bg-white border border-[#c4c6cc]/70 rounded p-2 text-xs text-[#1b1c1a]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#44474c] mb-1">
                              Masonry & Plaster
                            </label>
                            <input
                              type="text"
                              value={formData.masonry}
                              onChange={(e) =>
                                setFormData({ ...formData, masonry: e.target.value })
                              }
                              placeholder="6-inch fly-ash / red autoclaved brickwork with double-coat sand-faced external plaster"
                              className="w-full bg-white border border-[#c4c6cc]/70 rounded p-2 text-xs text-[#1b1c1a]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#44474c] mb-1">
                              Flooring & Tiling
                            </label>
                            <input
                              type="text"
                              value={formData.flooring}
                              onChange={(e) =>
                                setFormData({ ...formData, flooring: e.target.value })
                              }
                              placeholder="800x800 mm glazed vitrified double-charged tiles across living, dining & master suite"
                              className="w-full bg-white border border-[#c4c6cc]/70 rounded p-2 text-xs text-[#1b1c1a]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#44474c] mb-1">
                              Doors & Windows
                            </label>
                            <input
                              type="text"
                              value={formData.doorsWindows}
                              onChange={(e) =>
                                setFormData({ ...formData, doorsWindows: e.target.value })
                              }
                              placeholder="Granite frame encasings with powder-coated 3-track sliding aluminum windows & mosquito mesh"
                              className="w-full bg-white border border-[#c4c6cc]/70 rounded p-2 text-xs text-[#1b1c1a]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#44474c] mb-1">
                              Electrical System
                            </label>
                            <input
                              type="text"
                              value={formData.electrical}
                              onChange={(e) =>
                                setFormData({ ...formData, electrical: e.target.value })
                              }
                              placeholder="Polycab fire-resistant copper wiring with Legrand modular switches and AC conduit points"
                              className="w-full bg-white border border-[#c4c6cc]/70 rounded p-2 text-xs text-[#1b1c1a]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#44474c] mb-1">
                              Plumbing & Sanitary
                            </label>
                            <input
                              type="text"
                              value={formData.plumbing}
                              onChange={(e) =>
                                setFormData({ ...formData, plumbing: e.target.value })
                              }
                              placeholder="Astral CPVC/UPVC concealed pipework with Jaquar chrome fittings and wall-hung sanitaryware"
                              className="w-full bg-white border border-[#c4c6cc]/70 rounded p-2 text-xs text-[#1b1c1a]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#44474c] mb-1">
                              Waterproofing Protection
                            </label>
                            <input
                              type="text"
                              value={formData.waterproofing}
                              onChange={(e) =>
                                setFormData({ ...formData, waterproofing: e.target.value })
                              }
                              placeholder="Dr. Fixit 2-coat chemical treatment on terrace slab, sunken bathroom slabs & external parapets"
                              className="w-full bg-white border border-[#c4c6cc]/70 rounded p-2 text-xs text-[#1b1c1a]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Step 2 Actions */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#e4e2de]">
                        <button
                          type="button"
                          onClick={() => setAddStep(1)}
                          className="px-4 py-2.5 bg-[#f5f3ef] hover:bg-[#efeeea] text-[#1b1c1a] rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>← Back to Step 1</span>
                        </button>

                        <div className="flex items-center gap-2 self-end">
                          <button
                            type="submit"
                            disabled={isCreatingProject}
                            className="px-6 py-2.5 bg-[#081928] hover:bg-[#1e2e3e] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-4 h-4 text-[#ecbe8b]" />
                            <span>{isCreatingProject ? 'Saving to Database...' : 'Save & Publish Project to Database'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </form>
              </div>

              {/* Bottom Pagination / Stats footer */}
              <div className="p-3.5 bg-[#f5f3ef] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#44474c] border border-[#e4e2de]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#7a582e]" />
                  <span>
                    Displaying <strong className="text-[#1b1c1a] font-semibold">{filteredProjects.length} of {projects.length}</strong> active Amravati residential projects
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled
                    className="px-3 py-1 rounded bg-[#fbf9f5] text-[#44474c] opacity-50 cursor-not-allowed border border-[#e4e2de]"
                  >
                    Previous
                  </button>
                  <span className="px-2 font-mono text-[11px]">Page 1 of 1</span>
                  <button
                    disabled
                    className="px-3 py-1 rounded bg-[#fbf9f5] text-[#44474c] opacity-50 cursor-not-allowed border border-[#e4e2de]"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: INQUIRIES & LEADS (With Full Inquiry Status System) */}
          {/* ========================================================= */}
          {activeTab === 'leads' && (() => {
            const countNew = leads.filter((l) => (l.status || 'new') === 'new').length;
            const countSiteVisit = leads.filter((l) => l.status === 'site_visit').length;
            const countContacted = leads.filter((l) => l.status === 'contacted').length;
            const countConverted = leads.filter((l) => l.status === 'converted').length;
            const countClosed = leads.filter((l) => l.status === 'closed').length;

            const filteredLeads = leads.filter((lead) => {
              const currentStatus = lead.status || 'new';
              const matchesStatus =
                inquiryStatusFilter === 'all' || currentStatus === inquiryStatusFilter;
              const q = inquirySearchQuery.toLowerCase().trim();
              const matchesSearch =
                !q ||
                lead.name.toLowerCase().includes(q) ||
                lead.phone.toLowerCase().includes(q) ||
                lead.interest.toLowerCase().includes(q) ||
                (lead.notes && lead.notes.toLowerCase().includes(q));
              return matchesStatus && matchesSearch;
            });

            return (
              <div className="space-y-6 animate-fadeIn">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-wider text-[#7a582e] font-bold">
                        Client CRM & Callback Pipeline
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7a582e]" />
                      <span className="text-[11px] text-[#44474c] font-medium">
                        Live Inquiries ({leads.length})
                      </span>
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#081928] tracking-tight mt-0.5">
                      Client Leads & Inquiry Status
                    </h2>
                    <p className="text-xs text-[#44474c] mt-1">
                      Track callback requests, update inquiry status, schedule site visits, and record bookings.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const newLead: LeadSubmission = {
                          id: `lead-${Date.now()}`,
                          name: 'Direct Site Office Walk-in',
                          phone: '+91 98606 41551',
                          interest: 'Custom Home Construction in Amravati',
                          timeline: 'Immediate Planning',
                          plotStatus: 'Freehold Land',
                          submittedAt: new Date().toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: 'short',
                          }),
                          status: 'new',
                          notes: 'Inquiry registered directly at Amravati site office.',
                        };
                        const updated = [newLead, ...leads];
                        setLeads(updated);
                        try {
                          localStorage.setItem('anika_projects_leads_v1', JSON.stringify(updated));
                        } catch { }

                        try {
                          const res = await fetch('/api/leads', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(newLead),
                          });
                          const data = await res.json();
                          if (!res.ok || !data.success) {
                            throw new Error(data.error || 'Failed to save to database');
                          }
                          showToast('New inquiry recorded in Supabase database.');
                        } catch (err: any) {
                          console.error('Failed to log new lead:', err);
                          showToast(`Inquiry saved locally (${err.message || 'notice'})`);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-[#f5f3ef] hover:bg-[#efeeea] text-[#081928] text-xs font-semibold border border-[#e4e2de] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#7a582e]" />
                      <span>Log New Lead</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('projects')}
                      className="px-3.5 py-1.5 rounded-lg bg-[#081928] text-white text-xs font-semibold cursor-pointer"
                    >
                      ← Back to Projects
                    </button>
                  </div>
                </div>

                {/* Inquiry Status KPI Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div
                    onClick={() => setInquiryStatusFilter('all')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${inquiryStatusFilter === 'all'
                        ? 'bg-[#081928] text-white border-[#081928] shadow'
                        : 'bg-white text-[#1b1c1a] border-[#e4e2de] hover:border-[#7a582e]'
                      }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider block opacity-70">
                      Total Inquiries
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl sm:text-2xl font-bold font-mono">
                        {leads.length}
                      </span>
                      <span className="text-[10px] font-semibold opacity-80">100% Leads</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setInquiryStatusFilter('new')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${inquiryStatusFilter === 'new'
                        ? 'bg-amber-900 text-amber-100 border-amber-700 shadow'
                        : 'bg-amber-50/60 text-amber-900 border-amber-200 hover:border-amber-400'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider block">
                        New Inquiries
                      </span>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl sm:text-2xl font-bold font-mono">
                        {countNew}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700">Action Req.</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setInquiryStatusFilter('site_visit')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${inquiryStatusFilter === 'site_visit'
                        ? 'bg-purple-900 text-purple-100 border-purple-700 shadow'
                        : 'bg-purple-50/60 text-purple-900 border-purple-200 hover:border-purple-400'
                      }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider block">
                      Site Visits
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl sm:text-2xl font-bold font-mono">
                        {countSiteVisit}
                      </span>
                      <span className="text-[10px] font-bold text-purple-700">Scheduled</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setInquiryStatusFilter('contacted')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${inquiryStatusFilter === 'contacted'
                        ? 'bg-blue-900 text-blue-100 border-blue-700 shadow'
                        : 'bg-blue-50/60 text-blue-900 border-blue-200 hover:border-blue-400'
                      }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider block">
                      In Discussion
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl sm:text-2xl font-bold font-mono">
                        {countContacted}
                      </span>
                      <span className="text-[10px] font-bold text-blue-700">Follow-up</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setInquiryStatusFilter('converted')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${inquiryStatusFilter === 'converted'
                        ? 'bg-emerald-900 text-emerald-100 border-emerald-700 shadow'
                        : 'bg-emerald-50/60 text-emerald-900 border-emerald-200 hover:border-emerald-400'
                      }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider block">
                      Converted / Booked
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl sm:text-2xl font-bold font-mono">
                        {countConverted}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">Success</span>
                    </div>
                  </div>
                </div>

                {/* Filter Chips & Search Bar for Inquiries */}
                <div className="p-3 sm:p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#f5f3ef] shadow-sm border border-[#e4e2de]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInquiryStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${inquiryStatusFilter === 'all'
                          ? 'bg-[#081928] text-white shadow-sm'
                          : 'bg-[#efeeea] text-[#44474c] hover:bg-[#eae8e4]'
                        }`}
                    >
                      All Inquiries ({leads.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setInquiryStatusFilter('new')}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${inquiryStatusFilter === 'new'
                          ? 'bg-amber-800 text-white shadow-sm'
                          : 'bg-[#efeeea] text-[#44474c] hover:bg-[#eae8e4]'
                        }`}
                    >
                      New ({countNew})
                    </button>

                    <button
                      type="button"
                      onClick={() => setInquiryStatusFilter('site_visit')}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${inquiryStatusFilter === 'site_visit'
                          ? 'bg-purple-800 text-white shadow-sm'
                          : 'bg-[#efeeea] text-[#44474c] hover:bg-[#eae8e4]'
                        }`}
                    >
                      Site Visits ({countSiteVisit})
                    </button>

                    <button
                      type="button"
                      onClick={() => setInquiryStatusFilter('contacted')}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${inquiryStatusFilter === 'contacted'
                          ? 'bg-blue-800 text-white shadow-sm'
                          : 'bg-[#efeeea] text-[#44474c] hover:bg-[#eae8e4]'
                        }`}
                    >
                      In Discussion ({countContacted})
                    </button>

                    <button
                      type="button"
                      onClick={() => setInquiryStatusFilter('converted')}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${inquiryStatusFilter === 'converted'
                          ? 'bg-emerald-800 text-white shadow-sm'
                          : 'bg-[#efeeea] text-[#44474c] hover:bg-[#eae8e4]'
                        }`}
                    >
                      Converted ({countConverted})
                    </button>

                    <button
                      type="button"
                      onClick={() => setInquiryStatusFilter('closed')}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${inquiryStatusFilter === 'closed'
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'bg-[#efeeea] text-[#44474c] hover:bg-[#eae8e4]'
                        }`}
                    >
                      Closed ({countClosed})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-4 h-4 text-[#74777d] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={inquirySearchQuery}
                        onChange={(e) => setInquirySearchQuery(e.target.value)}
                        placeholder="Search client, phone, project..."
                        className="w-full pl-9 pr-3 py-1.5 bg-[#fbf9f5] rounded text-xs text-[#1b1c1a] placeholder-[#74777d] outline-none focus:bg-white shadow-sm border border-[#e4e2de]"
                      />
                    </div>

                    {inquirySearchQuery && (
                      <button
                        type="button"
                        onClick={() => setInquirySearchQuery('')}
                        className="text-xs text-[#7a582e] font-bold hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Inquiries Table with Interactive Inquiry Status Selector */}
                {filteredLeads.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center border border-[#e4e2de] space-y-3">
                    <Phone className="w-10 h-10 mx-auto text-[#74777d]" />
                    <h3 className="text-base font-bold text-[#1b1c1a]">
                      No Matching Inquiries Found
                    </h3>
                    <p className="text-xs text-[#44474c] max-w-sm mx-auto">
                      No inquiries match the selected status filter or search keywords.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setInquiryStatusFilter('all');
                        setInquirySearchQuery('');
                      }}
                      className="px-4 py-2 rounded-lg bg-[#081928] text-white text-xs font-semibold"
                    >
                      Reset Inquiry Filters
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-[#e4e2de] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#f5f3ef] text-[#44474c] uppercase font-bold text-[10px] tracking-wider border-b border-[#e4e2de]">
                          <tr>
                            <th className="px-5 py-3.5">Client & Contact</th>
                            <th className="px-5 py-3.5">Project / Interest</th>
                            <th className="px-5 py-3.5">Timeline & Status</th>
                            <th className="px-5 py-3.5">Inquiry Status (Click to Change)</th>
                            <th className="px-5 py-3.5">Submitted</th>
                            <th className="px-5 py-3.5 text-right">Quick Connect</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e4e2de]">
                          {filteredLeads.map((lead) => {
                            const status = lead.status || 'new';

                            return (
                              <tr
                                key={lead.id}
                                className="hover:bg-[#fbf9f5] transition-colors group"
                              >
                                {/* Client & Phone */}
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-[#f5f3ef] border border-[#e4e2de] flex items-center justify-center font-bold text-xs text-[#081928] shrink-0">
                                      {lead.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <span className="font-bold text-[#081928] block">
                                        {lead.name}
                                      </span>
                                      <span className="font-mono text-[11px] text-[#7a582e] block">
                                        {lead.phone}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                {/* Interest */}
                                <td className="px-5 py-4">
                                  <span className="font-medium text-[#1b1c1a] block">
                                    {lead.interest}
                                  </span>
                                  {lead.notes && (
                                    <span className="text-[11px] text-[#44474c] block mt-0.5 line-clamp-1 italic">
                                      "{lead.notes}"
                                    </span>
                                  )}
                                </td>

                                {/* Timeline */}
                                <td className="px-5 py-4 text-[#44474c]">
                                  <span className="font-semibold text-[#081928] block">
                                    {lead.timeline || 'Immediate Planning'}
                                  </span>
                                  {lead.plotStatus && (
                                    <span className="text-[10px] text-[#7a582e] block">
                                      {lead.plotStatus}
                                    </span>
                                  )}
                                </td>

                                {/* INTERACTIVE INQUIRY STATUS SELECTOR */}
                                <td className="px-5 py-4">
                                  <div className="relative inline-flex items-center">
                                    <select
                                      value={status}
                                      onChange={(e) =>
                                        handleUpdateLeadStatus(
                                          lead.id,
                                          e.target.value as NonNullable<LeadSubmission['status']>
                                        )
                                      }
                                      className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-[11px] font-bold tracking-wide border cursor-pointer focus:outline-none transition-shadow shadow-sm ${status === 'new'
                                          ? 'bg-amber-100/90 text-amber-900 border-amber-300 hover:bg-amber-200'
                                          : status === 'site_visit'
                                            ? 'bg-purple-100/90 text-purple-900 border-purple-300 hover:bg-purple-200'
                                            : status === 'contacted'
                                              ? 'bg-blue-100/90 text-blue-900 border-blue-300 hover:bg-blue-200'
                                              : status === 'converted'
                                                ? 'bg-emerald-100/90 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                                                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                                        }`}
                                      title="Click to update inquiry status"
                                    >
                                      <option value="new">● New Inquiry</option>
                                      <option value="site_visit">📅 Site Visit Scheduled</option>
                                      <option value="contacted">💬 In Discussion / Contacted</option>
                                      <option value="converted">✓ Converted / Booked</option>
                                      <option value="closed">✕ Closed / Archived</option>
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none opacity-60" />
                                  </div>
                                </td>

                                {/* Submitted Date */}
                                <td className="px-5 py-4 text-[#44474c] text-[11px]">
                                  {lead.submittedAt}
                                </td>

                                {/* Quick Connect Actions */}
                                <td className="px-5 py-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <a
                                      href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`}
                                      className="p-1.5 rounded-lg bg-[#f5f3ef] hover:bg-[#081928] hover:text-white text-[#081928] border border-[#e4e2de] transition-colors"
                                      title="Call Client"
                                    >
                                      <PhoneCall className="w-3.5 h-3.5" />
                                    </a>
                                    <a
                                      href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(lead.name)},%20this%20is%20from%20Anika%20Projects%20regarding%20your%20inquiry%20for%20${encodeURIComponent(lead.interest)}.`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 transition-colors"
                                      title="WhatsApp Client"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteLead(lead.id, lead.name)}
                                      className="p-1.5 rounded-lg bg-[#f5f3ef] hover:bg-red-600 hover:text-white text-[#74777d] border border-[#e4e2de] transition-colors cursor-pointer"
                                      title="Delete Inquiry from Database"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            );
          })()}

          {/* ========================================================= */}
          {/* TAB 3: CLIENT REVIEWS */}
          {/* ========================================================= */}
          {activeTab === 'reviews' && (() => {
            const publicReviewsCount = reviews.filter((r) => r.showOnPublic).length;
            const remainingCount = reviews.filter((r) => !r.showOnPublic).length;

            const filteredReviews = reviews.filter((r) => {
              if (reviewFilter === 'public' && !r.showOnPublic) return false;
              if (reviewFilter === 'hidden' && r.showOnPublic) return false;
              if (reviewSearchQuery.trim()) {
                const q = reviewSearchQuery.toLowerCase().trim();
                const matches =
                  r.author.toLowerCase().includes(q) ||
                  r.projectOrArea.toLowerCase().includes(q) ||
                  r.title.toLowerCase().includes(q) ||
                  r.message.toLowerCase().includes(q);
                if (!matches) return false;
              }
              return true;
            });

            return (
              <div className="space-y-6 animate-fadeIn">

                {/* Header & Presets */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-wider text-[#7a582e] font-bold">
                        Website Review Showcase & Moderation
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7a582e]" />
                      <span className="text-[11px] text-[#44474c] font-medium">
                        {reviews.length} Verified Ledger Reviews
                      </span>
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#081928] tracking-tight mt-0.5">
                      Choose Public Website Reviews
                    </h2>
                    <p className="text-xs text-[#44474c] mt-1 max-w-2xl leading-relaxed">
                      Select specifically which reviews appear directly on your public website. Only chosen reviews will be featured; the remaining will automatically show in the public site's <strong>"{remainingCount > 0 ? (remainingCount >= 10 ? '10+' : `${remainingCount}+`) : '10+'} more"</strong> trust archive.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-[#7a582e] mr-1 hidden sm:inline">
                      Quick Presets:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSetPublicPreset(6)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer ${publicReviewsCount === 6
                          ? 'bg-[#081928] text-[#ecbe8b] border-[#081928] shadow-sm'
                          : 'bg-[#f5f3ef] hover:bg-[#ffddb9]/60 text-[#7a582e] border-[#7a582e]/30'
                        }`}
                      title="Feature exactly 6 reviews for the public horizontal carousel"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Feature 6 (Carousel)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetPublicPreset(3)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${publicReviewsCount === 3
                          ? 'bg-[#081928] text-[#ecbe8b] border-[#081928] shadow-sm'
                          : 'bg-[#f5f3ef] hover:bg-[#efeeea] text-[#081928] border-[#e4e2de]'
                        }`}
                      title="Feature 3 reviews"
                    >
                      Feature Top 3
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetPublicPreset(5)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${publicReviewsCount === 5
                          ? 'bg-[#081928] text-[#ecbe8b] border-[#081928] shadow-sm'
                          : 'bg-[#f5f3ef] hover:bg-[#efeeea] text-[#081928] border-[#e4e2de]'
                        }`}
                      title="Feature 5 reviews on public homepage"
                    >
                      Feature Top 5
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetAllReviewsPublic(true)}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#efeeea] text-[#44474c] text-xs font-semibold border border-[#e4e2de] cursor-pointer"
                      title="Show all reviews on public site"
                    >
                      Show All
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('projects')}
                      className="px-3.5 py-1.5 rounded-lg bg-[#081928] text-white text-xs font-semibold cursor-pointer"
                    >
                      ← Back to Projects
                    </button>
                  </div>
                </div>

                {/* Status KPI Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div
                    onClick={() => {
                      setReviewFilter('all');
                      setReviewSearchQuery('');
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${reviewFilter === 'all'
                        ? 'bg-[#081928] text-white border-[#081928] shadow'
                        : 'bg-white text-[#1b1c1a] border-[#e4e2de] hover:border-[#7a582e]'
                      }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider block opacity-70">
                      Total Ledger Reviews
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl sm:text-2xl font-bold font-mono">
                        {reviews.length}
                      </span>
                      <span className="text-[10px] font-semibold opacity-80">100% Verified</span>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setReviewFilter('public');
                      setReviewSearchQuery('');
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${reviewFilter === 'public'
                        ? 'bg-emerald-900 text-emerald-100 border-emerald-700 shadow'
                        : 'bg-emerald-50/70 text-emerald-900 border-emerald-300 hover:border-emerald-500'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider block">
                        Live on Public Site
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl sm:text-2xl font-bold font-mono">
                        {publicReviewsCount}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">Home Showcase</span>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setReviewFilter('hidden');
                      setReviewSearchQuery('');
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${reviewFilter === 'hidden'
                        ? 'bg-[#1e2e3e] text-white border-[#1e2e3e] shadow'
                        : 'bg-[#f5f3ef] text-[#1b1c1a] border-[#e4e2de] hover:border-[#7a582e]'
                      }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider block">
                      In "10+ More" Archive
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl sm:text-2xl font-bold font-mono">
                        {remainingCount}
                      </span>
                      <span className="text-[10px] font-semibold text-[#7a582e]">Trust Drawer</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[#e4e2de]">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#44474c] block">
                      Homeowner Satisfaction
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl sm:text-2xl font-bold text-amber-600 font-mono">
                        5.0 ★
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">All 5 Stars</span>
                    </div>
                  </div>
                </div>

                {/* Public Display Rule Callout Card */}
                <div className="p-4 rounded-xl bg-[#fef8f0] border border-[#f3d9b6] flex items-start gap-3 shadow-xs">
                  <div className="w-7 h-7 rounded-lg bg-[#7a582e] text-[#ffddb9] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-[#2b1700]">
                      Public Homepage Display Rule Active:
                    </h4>
                    <p className="text-xs text-[#573e1c] mt-0.5 leading-relaxed">
                      Only reviews toggled with <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">● Live on Public Site</span> appear in the public homepage's main review cards. The rest ({remainingCount} reviews) automatically feed the public website's <strong>"10+ More Verified Homeowner Reviews"</strong> interactive trust drawer.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onNavigateHome}
                    className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-[#efeeea] text-[#081928] text-xs font-bold border border-[#e4e2de] shadow-xs cursor-pointer flex-shrink-0"
                    title="View public website to see live result"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#7a582e]" />
                    <span>Preview Public Site</span>
                  </button>
                </div>

                {/* Filter & Search Bar */}
                <div className="p-3 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#f5f3ef] border border-[#e4e2de]">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewFilter('all')}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${reviewFilter === 'all'
                          ? 'bg-[#081928] text-white shadow-sm'
                          : 'bg-[#efeeea] text-[#44474c] hover:bg-[#eae8e4]'
                        }`}
                    >
                      All ({reviews.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setReviewFilter('public')}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${reviewFilter === 'public'
                          ? 'bg-emerald-800 text-white shadow-sm'
                          : 'bg-[#efeeea] text-emerald-800 hover:bg-[#eae8e4]'
                        }`}
                    >
                      ★ Featured on Public Site ({publicReviewsCount})
                    </button>

                    <button
                      type="button"
                      onClick={() => setReviewFilter('hidden')}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${reviewFilter === 'hidden'
                          ? 'bg-[#081928] text-white shadow-sm'
                          : 'bg-[#efeeea] text-[#44474c] hover:bg-[#eae8e4]'
                        }`}
                    >
                      🔒 In "10+ More" Archive ({remainingCount})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#44474c]" />
                    <input
                      type="text"
                      value={reviewSearchQuery}
                      onChange={(e) => setReviewSearchQuery(e.target.value)}
                      placeholder="Search author, project or note..."
                      className="w-full pl-8 pr-8 py-1.5 bg-white border border-[#e4e2de] rounded-lg text-xs text-[#081928] placeholder-[#76777d] focus:outline-none focus:ring-1 focus:ring-[#7a582e]"
                    />
                    {reviewSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setReviewSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Reviews Interactive Grid */}
                {filteredReviews.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-white border border-[#e4e2de]">
                    <div className="w-12 h-12 rounded-full bg-[#f5f3ef] text-[#7a582e] flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#081928]">No Reviews Found</h3>
                    <p className="text-xs text-[#44474c] mt-1">
                      No reviews match your current filter or search criteria.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setReviewFilter('all');
                        setReviewSearchQuery('');
                      }}
                      className="mt-3 px-4 py-1.5 rounded-lg bg-[#081928] text-white text-xs font-semibold cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredReviews.map((r) => {
                      const isPublic = !!r.showOnPublic;
                      return (
                        <div
                          key={r.id}
                          className={`p-5 rounded-2xl transition-all duration-200 shadow-sm flex flex-col justify-between space-y-4 ${isPublic
                              ? 'bg-gradient-to-b from-white to-[#f9fbf9] border-2 border-emerald-600/90 ring-2 ring-emerald-500/10 shadow-md'
                              : 'bg-white border border-[#e4e2de] hover:border-[#7a582e]/50'
                            }`}
                        >
                          <div>
                            {/* Card Top Action Bar: Status Pill + Instant Toggle Button */}
                            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#e4e2de]">
                              {isPublic ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                                  Live on Public Site
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#f5f3ef] text-[#44474c] border border-[#e4e2de]">
                                  In "10+ More" Archive
                                </span>
                              )}

                              {/* Prominent Instant Action Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleReviewPublic(r.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${isPublic
                                    ? 'bg-emerald-700 hover:bg-red-700 text-white'
                                    : 'bg-[#081928] hover:bg-[#7a582e] text-[#ecbe8b] hover:text-white'
                                  }`}
                                title={
                                  isPublic
                                    ? 'Click to remove from public homepage (will move to "10+ more" archive)'
                                    : 'Click to feature this review on the public homepage'
                                }
                              >
                                {isPublic ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                                    <span>Public Live ✓</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5 text-[#ecbe8b]" />
                                    <span>Show on Site</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Author & Rating Header */}
                            <div className="flex items-center justify-between mb-2.5">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-9 h-9 rounded-full font-serif font-bold text-xs flex items-center justify-center shadow-xs ${isPublic
                                      ? 'bg-[#081928] text-[#ecbe8b] border border-[#ecbe8b]/40'
                                      : 'bg-[#f5f3ef] text-[#7a582e] border border-[#e4e2de]'
                                    }`}
                                >
                                  {r.initials}
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-[#081928] block">
                                    {r.author}
                                  </span>
                                  <span className="text-[10px] text-[#44474c] block">
                                    {r.projectOrArea}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center text-amber-500 text-xs">
                                {'★'.repeat(r.rating)}
                              </div>
                            </div>

                            <h4 className="font-serif font-bold text-xs text-[#081928] mb-1.5">
                              “{r.title}”
                            </h4>
                            <p className="text-xs text-[#44474c] leading-relaxed italic">
                              "{r.message}"
                            </p>
                          </div>

                          {/* Card Footer */}
                          <div className="pt-3 border-t border-[#e4e2de] flex items-center justify-between text-[11px]">
                            <span className="text-[#76777d]">{r.date}</span>
                            <div className="flex items-center gap-2.5">
                              <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleReviewPublic(r.id)}
                                className={`text-[11px] font-bold cursor-pointer underline underline-offset-2 transition-colors ${isPublic
                                    ? 'text-red-700 hover:text-red-900'
                                    : 'text-[#7a582e] hover:text-[#081928]'
                                  }`}
                              >
                                {isPublic ? 'Move to 10+ Pool' : 'Make Featured'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })()}

          {/* ========================================================= */}
          {/* TAB 4: YOUTUBE VIDEO MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === 'videos' && (
            <div className="animate-fadeIn">
              <VideoManagementTab
                session={session}
                showToast={showToast}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: ENGINEER DESK */}
          {/* ========================================================= */}
          {activeTab === 'desk' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-[#081928]">
                    Site Engineer Desk
                  </h2>
                  <p className="text-xs text-[#44474c] mt-1">
                    Quality audits, municipal sanction drawings, and technical field contact.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('projects')}
                  className="px-3.5 py-1.5 rounded bg-[#081928] text-white text-xs font-semibold cursor-pointer"
                >
                  ← Back to Projects
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-white border border-[#e4e2de] space-y-3">
                  <h3 className="font-serif text-lg font-bold text-[#081928]">
                    Active Site Office Contact
                  </h3>
                  <div className="space-y-2 text-xs text-[#44474c]">
                    <p><strong>Chief Engineer:</strong> Er. Prathamesh Joshi (B.E. Civil)</p>
                    <p><strong>Structural Consultant:</strong> Dr. V. K. Deshmukh & Associates</p>
                    <p><strong>Site Office:</strong> Tapowan Extension, Near Akoli Ring Road, Amravati</p>
                    <p><strong>Direct Helpline:</strong> +91 98606 41551</p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white border border-[#e4e2de] space-y-3">
                  <h3 className="font-serif text-lg font-bold text-[#081928]">
                    Municipal Permits & Sanctions
                  </h3>
                  <div className="space-y-2 text-xs text-[#44474c]">
                    <p><strong>Master Permit:</strong> AMT-2024-V942</p>
                    <p><strong>RERA Status:</strong> Registered & Audited</p>
                    <p><strong>Concrete Grade:</strong> M25 Standard Ready-Mix with 28-day water curing verification</p>
                    <p><strong>Steel Reinforcement:</strong> Primary Fe 550D TMT bars with tensile certificates</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ========================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {/* ========================================================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-xl border-t border-[#e4e2de] shadow-[0_-2px_12px_rgba(30,46,62,0.06)]">
        <div className="h-16 px-4 flex items-center justify-around">
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`flex flex-col items-center justify-center w-14 h-11 transition-colors cursor-pointer ${activeTab === 'projects' ? 'text-[#081928] font-bold' : 'text-[#44474c]'
              }`}
          >
            <Building2 className="w-5 h-5 text-[#7a582e]" />
            <span className="text-[10px] mt-0.5">Projects</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className={`flex flex-col items-center justify-center w-14 h-11 transition-colors cursor-pointer ${activeTab === 'leads' ? 'text-[#081928] font-bold' : 'text-[#44474c]'
              }`}
          >
            <Phone className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Inquiries</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex flex-col items-center justify-center w-14 h-11 transition-colors cursor-pointer ${activeTab === 'reviews' ? 'text-[#081928] font-bold' : 'text-[#44474c]'
              }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Reviews</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`flex flex-col items-center justify-center w-14 h-11 transition-colors cursor-pointer ${activeTab === 'videos' ? 'text-[#081928] font-bold' : 'text-[#44474c]'
              }`}
          >
            <Youtube className="w-5 h-5 text-red-500" />
            <span className="text-[10px] mt-0.5">Reels</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('desk')}
            className={`flex flex-col items-center justify-center w-14 h-11 transition-colors cursor-pointer ${activeTab === 'desk' ? 'text-[#081928] font-bold' : 'text-[#44474c]'
              }`}
          >
            <HardHat className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Desk</span>
          </button>
        </div>
      </nav>

      {/* ========================================================= */}

      {/* ========================================================= */}
      {/* DASHBOARD MODALS & OVERLAYS */}
      {/* ========================================================= */}
      <QuickAddProjectModal
        isQuickAddOpen={isQuickAddOpen}
        setIsQuickAddOpen={setIsQuickAddOpen}
        addStep={addStep}
        setAddStep={setAddStep}
        formData={formData}
        setFormData={setFormData}
        isCreatingProject={isCreatingProject}
        handleCreateProject={handleCreateProject}
        handleLoadSaiNagarTemplate={handleLoadSaiNagarTemplate}
        handleFilesUploadToForm={handleFilesUploadToForm}
        handleRemoveFormImage={handleRemoveFormImage}
        handleSetCoverInForm={handleSetCoverInForm}
      />

      <ProjectDetailModal
        selectedProjectForView={selectedProjectForView}
        setSelectedProjectForView={setSelectedProjectForView}
        viewModalTab={viewModalTab}
        setViewModalTab={setViewModalTab}
        leads={leads}
        handleUpdateLeadStatus={handleUpdateLeadStatus}
        handleOpenPhotoManager={handleOpenPhotoManager}
        handleOpenUnitManager={handleOpenUnitManager}
        setActiveTab={setActiveTab}
        setInquirySearchQuery={setInquirySearchQuery}
        handleOpenStatusModal={handleOpenStatusModal}
      />

      <ProjectStatusModal
        statusModalProject={statusModalProject}
        onClose={() => setStatusModalProject(null)}
        onSaveStatus={handleSaveProjectStatus}
        isUpdatingStatus={isUpdatingStatus}
      />

      <PhotoManagerModal
        photoManagerProject={photoManagerProject}
        setPhotoManagerProject={setPhotoManagerProject}
        managerImages={managerImages}
        setManagerImages={setManagerImages}
        managerUrlInput={managerUrlInput}
        setManagerUrlInput={setManagerUrlInput}
        handleFilesUploadToManager={handleFilesUploadToManager}
        handleAddUrlToManager={handleAddUrlToManager}
        handleRemoveManagerImage={handleRemoveManagerImage}
        handleSetCoverInManager={handleSetCoverInManager}
        handleMoveManagerImage={handleMoveManagerImage}
        handleSavePhotoManager={handleSavePhotoManager}
        showToast={showToast}
      />

      <UnitsManagerModal
        unitManagerProject={unitManagerProject}
        setUnitManagerProject={setUnitManagerProject}
        tempUnitsSummary={tempUnitsSummary}
        setTempUnitsSummary={setTempUnitsSummary}
        tempInventory={tempInventory}
        newUnitForm={newUnitForm}
        setNewUnitForm={setNewUnitForm}
        handleAutoGenerateSummaryFromInventory={handleAutoGenerateSummaryFromInventory}
        handleUpdateUnitField={handleUpdateUnitField}
        handleUpdateUnitStatus={handleUpdateUnitStatus}
        handleAddNewUnitToInventory={handleAddNewUnitToInventory}
        handleRemoveUnitFromInventory={handleRemoveUnitFromInventory}
        handleSaveUnitManager={handleSaveUnitManager}
      />

      <SupabaseDbModal
        isDbModalOpen={isDbModalOpen}
        setIsDbModalOpen={setIsDbModalOpen}
        supabaseStatus={supabaseStatus}
        copiedSchema={copiedSchema}
        dbPasswordInput={dbPasswordInput}
        setDbPasswordInput={setDbPasswordInput}
        isMigrating={isMigrating}
        migrationResult={migrationResult}
        sqlSchemaText={sqlSchemaText}
        handleCopySchema={handleCopySchema}
        handleRunMigration={handleRunMigration}
      />

    </div>
  );
};
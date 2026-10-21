import React, { useState, useEffect } from 'react';
import { Layers, ArrowRight, ShieldCheck, MapPin, ChevronLeft, ChevronRight, Camera, ImageIcon, Building2 } from 'lucide-react';
import { PROJECTS_DATA } from '../../data/projectsData';
import { Project } from '../../types';
import { getProjectStatusMeta } from '../../utils/projectStatus';

interface ProjectsSectionProps {
  onSelectProject: (project: Project) => void;
  onEnquireProject: (projectName: string) => void;
}

const DASHBOARD_PROJECTS_KEY = 'anika_dashboard_projects_ledger_v3';

// Interactive Multiple Image Showcase for each Project Card with visible thumbnail gallery strip
const ProjectCardGallery: React.FC<{
  project: Project;
  onOpenDetails: () => void;
}> = ({ project, onOpenDetails }) => {
  const images = (project.images && project.images.length > 0)
    ? project.images
    : (project.imageUrl ? [project.imageUrl] : []);

  const [currentIdx, setCurrentIdx] = useState(0);
  const total = images.length || 1;

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % total);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + total) % total);
  };

  const currentImage = images[currentIdx] || images[0];
  const visibleThumbs = images.slice(0, 4);
  const remainingCount = total > 4 ? total - 4 : 0;
  const statusMeta = getProjectStatusMeta(project.status, project.categoryLabel);

  return (
    <div className="w-full bg-brand-deepNavy/95 border-b border-brand-slateBorder/60 select-none">
      {/* Primary Hero View */}
      <div
        onClick={onOpenDetails}
        className="relative aspect-video overflow-hidden group cursor-pointer bg-brand-deepNavy"
      >
        {currentImage ? (
          <img
            key={currentImage}
            src={currentImage}
            alt={`${project.title} - View ${currentIdx + 1}`}
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-brand-goldPale/60 gap-1.5 p-4">
            <Building2 className="w-8 h-8 text-brand-gold/40" />
            <span className="text-[11px] font-medium">Site Photography Being Added</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-deepNavy/85 via-black/15 to-black/30 pointer-events-none" />

        {/* Sold Out Center Watermark Banner */}
        {statusMeta.isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="bg-rose-950/90 backdrop-blur-sm border-2 border-rose-500/80 px-4 py-1.5 rounded-lg shadow-2xl text-center transform -rotate-2">
              <span className="text-white font-extrabold tracking-widest text-xs sm:text-sm uppercase drop-shadow flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                <span>Sold Out • Successfully Delivered</span>
              </span>
            </div>
          </div>
        )}

        {/* Top Header Overlays */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none gap-2">
          {/* Dynamic Real-Time Status Badge */}
          <span className={`text-[11px] px-2.5 py-1 rounded-md shadow-md backdrop-blur-md flex items-center gap-1.5 uppercase tracking-wider shrink-0 ${statusMeta.badgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
            <span>{statusMeta.label}</span>
          </span>
          
          {/* Photos Counter Badge */}
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md border border-white/20 shrink-0">
            <Camera className="w-3.5 h-3.5 text-brand-gold" />
            <span>{currentIdx + 1} of {total} Photos</span>
          </span>
        </div>

        {/* Interactive Carousel Arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prevImg}
              aria-label="Previous project photo"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-85 hover:opacity-100 group-hover:scale-110 z-20 cursor-pointer shadow-lg border border-white/20"
              title="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextImg}
              aria-label="Next project photo"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-85 hover:opacity-100 group-hover:scale-110 z-20 cursor-pointer shadow-lg border border-white/20"
              title="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Location strip */}
        <div className="absolute bottom-2.5 left-3 z-10 pointer-events-none">
          <div className="flex items-center gap-1 text-[11px] text-brand-goldLight font-medium drop-shadow-md">
            <MapPin className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
            <span className="truncate max-w-[220px]">{project.location.split(',')[0]}</span>
          </div>
        </div>
      </div>

      {/* Prominent Multi-Image Thumbnail Gallery Strip */}
      <div className="p-2 sm:p-2.5 bg-[#0b1b2a] border-t border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5">
          {visibleThumbs.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIdx(idx);
              }}
              className={`relative w-12 h-9 sm:w-14 sm:h-10 rounded-md overflow-hidden shrink-0 transition-all border cursor-pointer ${
                currentIdx === idx
                  ? 'border-brand-gold ring-2 ring-brand-gold/60 scale-105 shadow-md'
                  : 'border-white/20 opacity-70 hover:opacity-100 hover:border-white/60'
              }`}
              title={`View perspective ${idx + 1}`}
              aria-label={`View perspective ${idx + 1}`}
            >
              <img
                src={imgUrl}
                alt={`${project.title} thumb ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {currentIdx === idx && (
                <div className="absolute inset-0 bg-brand-gold/15 pointer-events-none" />
              )}
            </button>
          ))}

          {/* +N More Photos Pill */}
          {remainingCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails();
              }}
              className="relative w-12 h-9 sm:w-14 sm:h-10 rounded-md overflow-hidden shrink-0 bg-brand-navy hover:bg-[#1a2d42] border border-brand-gold/40 flex flex-col items-center justify-center text-white cursor-pointer transition-all hover:scale-105"
              title={`View ${remainingCount} more photos`}
            >
              <span className="text-[10px] font-bold text-brand-gold">+{remainingCount}</span>
              <span className="text-[8px] text-white/80 font-medium">More</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="text-[11px] font-bold text-brand-gold hover:text-white shrink-0 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer border border-brand-gold/30"
        >
          <Camera className="w-3 h-3 text-brand-gold" />
          <span className="hidden xs:inline">All</span>
          <span>{total} Photos</span>
        </button>
      </div>
    </div>
  );
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  onSelectProject,
  onEnquireProject,
}) => {
  const [filter, setFilter] = useState<'all' | 'ready' | 'completed' | 'sold_out' | 'upcoming' | 'custom'>('all');
  const [allProjects, setAllProjects] = useState<Project[]>(PROJECTS_DATA);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch live projects directly from database
  useEffect(() => {
    const fetchLiveProjects = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/projects');
        const data = await res.json();

        if (data.success && Array.isArray(data.projects) && data.projects.length > 0) {
          const formatted: Project[] = data.projects.map((dp: any) => {
            const existingMatch = PROJECTS_DATA.find((p) => p.id === dp.id || p.title.toLowerCase() === dp.title?.toLowerCase());
            const projectImages = Array.isArray(dp.images) && dp.images.length > 0
              ? dp.images
              : (dp.image_url ? [dp.image_url] : (existingMatch?.images || []));

            const cat = dp.category || (dp.status?.toLowerCase().includes('completed') ? 'completed' : 'upcoming');

            return {
              id: dp.id || `proj-${Math.random()}`,
              title: dp.title,
              category: cat,
              categoryLabel: dp.category_label || dp.status || (cat === 'completed' ? 'Completed & Handed Over' : cat === 'upcoming' ? 'In Construction / Upcoming' : 'Custom Build on Your Land'),
              location: dp.location || 'Amravati, Maharashtra',
              type: dp.type || 'Residential Villa Development',
              units: dp.units || 'Multiple Units',
              unitInventory: Array.isArray(dp.project_units) && dp.project_units.length > 0
                ? dp.project_units.map((u: any) => ({
                    id: u.id,
                    unitNumber: u.unit_number || u.unitNumber,
                    type: u.type,
                    size: u.size,
                    status: u.status,
                    price: u.price || '',
                    floor: u.floor || '',
                    facing: u.facing || '',
                  }))
                : (existingMatch?.unitInventory || []),
              plotArea: dp.plot_area || '~700 sq ft',
              builtUpArea: dp.built_up_area || '~1,100 sq ft',
              status: dp.status || (cat === 'completed' ? 'Handed Over' : 'In Construction'),
              statusColor: dp.status_color || (cat === 'completed' ? 'emerald' : 'amber'),
              rating: Number(dp.rating) || 5.0,
              reviewCount: Number(dp.review_count) || 3,
              imageUrl: projectImages[0],
              images: projectImages,
              description: dp.overview || existingMatch?.description || 'Engineered residential development delivered in Amravati.',
              keyHighlights: Array.isArray(dp.highlights) && dp.highlights.length > 0
                ? dp.highlights
                : (existingMatch?.keyHighlights || ['Seismic RCC framing', 'Waterproofing guarantee', 'Vastu compliant']),
              specifications: {
                foundation: dp.engineering_specs?.foundation || existingMatch?.specifications?.foundation || 'Isolated RCC Footing with 6 ft depth',
                superstructure: dp.engineering_specs?.superstructure || existingMatch?.specifications?.superstructure || 'Ultratech 53 Grade & Fe 550D TMT bars',
                masonry: dp.engineering_specs?.masonry || existingMatch?.specifications?.masonry || '6-inch fly-ash brickwork with double-coat plaster',
                flooring: dp.engineering_specs?.flooring || existingMatch?.specifications?.flooring || '800x800 mm glazed vitrified double-charged tiles',
                doorsWindows: dp.engineering_specs?.doorsWindows || existingMatch?.specifications?.doorsWindows || 'Granite frame encasings with 3-track sliding windows',
                electrical: dp.engineering_specs?.electrical || existingMatch?.specifications?.electrical || 'Polycab FRLS copper wiring with Legrand modular switches',
                plumbingSanitary: dp.engineering_specs?.plumbingSanitary || dp.engineering_specs?.plumbing || existingMatch?.specifications?.plumbingSanitary || 'Astral CPVC/UPVC pipework with Jaquar fittings',
                waterproofing: dp.engineering_specs?.waterproofing || existingMatch?.specifications?.waterproofing || 'Dr. Fixit 2-coat chemical treatment on terrace & bathrooms',
              },
              floorPlanDetails: {
                groundFloor: dp.floor_plans?.groundFloor || existingMatch?.floorPlanDetails?.groundFloor || 'Living Room, Modular Kitchen, Powder Room, Car Porch',
                firstFloor: dp.floor_plans?.firstFloor || existingMatch?.floorPlanDetails?.firstFloor || 'Master Suite with Ensuite Bath, Children Room, Balcony',
                terrace: dp.floor_plans?.terrace || existingMatch?.floorPlanDetails?.terrace || 'Weather-proof open sky terrace with parapet wall',
                parking: dp.floor_plans?.parking || existingMatch?.floorPlanDetails?.parking || 'Dedicated paved vehicular parking space',
              },
            };
          });

          setAllProjects(formatted);
        } else {
          setAllProjects(PROJECTS_DATA);
        }
      } catch (err) {
        console.warn('Notice loading live projects from database:', err);
        setAllProjects(PROJECTS_DATA);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveProjects();

    const handleProjectsUpdated = () => {
      fetchLiveProjects();
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'anika_projects_last_updated' || e.key === DASHBOARD_PROJECTS_KEY) {
        fetchLiveProjects();
      }
    };

    const handleWindowFocus = () => {
      fetchLiveProjects();
    };

    window.addEventListener('anika_projects_updated', handleProjectsUpdated);
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('anika_projects_updated', handleProjectsUpdated);
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const readyCount = allProjects.filter((p) => getProjectStatusMeta(p.status, p.categoryLabel).isReady).length;
  const soldOutCount = allProjects.filter((p) => getProjectStatusMeta(p.status, p.categoryLabel).isSoldOut).length;
  const completedCount = allProjects.filter((p) => {
    const meta = getProjectStatusMeta(p.status, p.categoryLabel);
    return meta.isHandedOver || p.category === 'completed';
  }).length;
  const upcomingCount = allProjects.filter((p) => {
    const meta = getProjectStatusMeta(p.status, p.categoryLabel);
    return (meta.isPlanning || meta.isConstruction) && !meta.isReady && !meta.isSoldOut;
  }).length;

  const filteredProjects = allProjects.filter((p) => {
    if (filter === 'all') return true;
    const meta = getProjectStatusMeta(p.status, p.categoryLabel);
    if (filter === 'ready') return meta.isReady;
    if (filter === 'sold_out') return meta.isSoldOut;
    if (filter === 'completed') return meta.isHandedOver || p.category === 'completed';
    if (filter === 'upcoming') return meta.isPlanning || meta.isConstruction;
    return p.category === filter;
  });

  return (
    <section id="projects" className="py-20 bg-brand-sandBg/40 border-t border-brand-slateBorder/60">
      <div className="w-full max-w-[94%] 2xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-brand-goldDark block mb-2">
              Portfolio
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-brand-deepNavy font-semibold">
              Delivered & Ongoing Projects
            </h2>
          </div>
          <p className="text-sm text-brand-navyLight max-w-md leading-relaxed">
            Every residential home is rigorously inspected against structural load safety, multi-coat waterproofing, electrical load balancing, and sanitary fittings prior to handover.
          </p>
        </div>

        {/* Interactive Filter Tabs (Functional Segmented Control - Mobile Responsive) */}
        <div className="flex items-center gap-1.5 p-1.5 bg-brand-sandBg rounded-xl mb-10 border border-brand-slateBorder/60 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:max-w-fit">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              filter === 'all'
                ? 'bg-brand-deepNavy text-white shadow-sm'
                : 'text-brand-navy hover:text-brand-deepNavy hover:bg-brand-warmBg/50'
            }`}
          >
            All Work ({allProjects.length})
          </button>

          {/* Ready to Move Filter Tab */}
          <button
            type="button"
            onClick={() => setFilter('ready')}
            className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              filter === 'ready'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ready to Move ({readyCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              filter === 'completed'
                ? 'bg-brand-deepNavy text-white shadow-sm'
                : 'text-brand-navy hover:text-brand-deepNavy hover:bg-brand-warmBg/50'
            }`}
          >
            Completed & Handed Over ({completedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('sold_out')}
            className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              filter === 'sold_out'
                ? 'bg-rose-900 text-white shadow-sm'
                : 'text-rose-800 hover:text-rose-950 hover:bg-rose-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Sold Out ({soldOutCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('upcoming')}
            className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              filter === 'upcoming'
                ? 'bg-brand-deepNavy text-white shadow-sm'
                : 'text-brand-navy hover:text-brand-deepNavy hover:bg-brand-warmBg/50'
            }`}
          >
            Under Planning / Ongoing ({upcomingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('custom')}
            className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              filter === 'custom'
                ? 'bg-brand-deepNavy text-white shadow-sm'
                : 'text-brand-navy hover:text-brand-deepNavy hover:bg-brand-warmBg/50'
            }`}
          >
            Custom Plot Build
          </button>
        </div>

        {/* Project Grid with Multiple Image Galleries */}
        {filteredProjects.length === 0 ? (
          <div className="py-16 px-6 text-center bg-white/60 rounded-2xl border border-dashed border-brand-slateBorder/80 max-w-xl mx-auto my-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-brand-gold/15 flex items-center justify-center text-brand-goldDark mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-lg text-brand-deepNavy">
              Portfolio Being Updated
            </h3>
            <p className="text-xs text-brand-navyLight mt-1.5 max-w-md mx-auto">
              Latest residential projects and construction site dossiers are being updated. Connect with our engineering desk for live site visits.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => {
              const statusMeta = getProjectStatusMeta(project.status, project.categoryLabel);

              return (
                <article
                  key={project.id}
                  className="bg-white rounded-2xl border border-brand-slateBorder overflow-hidden shadow-sm card-hover flex flex-col justify-between"
                >
                  {/* Interactive Multiple Images Gallery Carousel */}
                  <ProjectCardGallery
                    project={project}
                    onOpenDetails={() => onSelectProject(project)}
                  />

                  {/* Card Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display font-semibold text-xl text-brand-deepNavy leading-snug">
                          {project.title}
                        </h3>
                        <span
                          title="Real-time units updated live by Anika Projects team"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-goldDark bg-brand-sandBg border border-brand-gold/30 px-2.5 py-1 rounded-md whitespace-nowrap shadow-2xs shrink-0"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{project.units}</span>
                        </span>
                      </div>

                      {/* Real-Time Status & Unit Availability Strip */}
                      {statusMeta.isSoldOut ? (
                        <div className="flex items-center justify-between gap-2 text-[11px] bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-rose-950 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                              Live Status:
                            </span>
                            <span className="font-bold text-rose-800 bg-rose-100/90 px-2 py-0.5 rounded text-[11px]">
                              100% Sold Out • All Units Transferred to Owners
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onSelectProject(project)}
                            className="text-[11px] font-bold text-rose-800 hover:text-rose-950 underline whitespace-nowrap cursor-pointer shrink-0"
                          >
                            Delivered Dossier →
                          </button>
                        </div>
                      ) : statusMeta.isReady ? (
                        <div className="flex items-center justify-between gap-2 text-[11px] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-emerald-950 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              Live Status:
                            </span>
                            <span className="font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded text-[11px]">
                              Ready to Move • Immediate Possession Available
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onSelectProject(project)}
                            className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline whitespace-nowrap cursor-pointer shrink-0"
                          >
                            Book Site Visit →
                          </button>
                        </div>
                      ) : project.unitInventory && project.unitInventory.length > 0 ? (() => {
                        const totalU = project.unitInventory.length;
                        const availU = project.unitInventory.filter(u => u.status === 'available').length;
                        const bookedU = project.unitInventory.filter(u => u.status === 'booked').length;
                        return (
                          <div className="flex items-center justify-between gap-2 text-[11px] bg-brand-sandBg/70 px-3 py-1.5 rounded-lg border border-brand-slateBorder/60">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-brand-deepNavy flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                Live Status:
                              </span>
                              {availU > 0 ? (
                                <span className="font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                                  {availU} of {totalU} Units Available
                                </span>
                              ) : (
                                <span className="font-bold text-slate-700 bg-slate-200/70 px-1.5 py-0.5 rounded">
                                  All {totalU} Units Handed Over / Sold
                                </span>
                              )}
                              {bookedU > 0 && (
                                <span className="text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded font-medium">
                                  {bookedU} Under Booking
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => onSelectProject(project)}
                              className="text-[11px] font-bold text-brand-goldDark hover:text-brand-deepNavy underline whitespace-nowrap cursor-pointer shrink-0"
                            >
                              Unit Details →
                            </button>
                          </div>
                        );
                      })() : (
                        <div className={`flex items-center justify-between gap-2 text-[11px] ${statusMeta.stripContainerClass} px-3 py-1.5 rounded-lg border`}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-brand-deepNavy flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-goldDark" />
                              Live Status:
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[11px] ${statusMeta.stripBadgeClass}`}>
                              {statusMeta.stripText}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onSelectProject(project)}
                            className="text-[11px] font-bold text-brand-navy hover:text-brand-deepNavy underline whitespace-nowrap cursor-pointer shrink-0"
                          >
                            {statusMeta.stripActionText}
                          </button>
                        </div>
                      )}

                      <p className="text-xs text-brand-navyLight leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    {/* Specs Box */}
                    <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-brand-slateBorder/60 bg-brand-sandBg/30 rounded-lg p-2.5">
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">
                          Plot Area
                        </span>
                        <span className="font-semibold text-brand-deepNavy">{project.plotArea}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">
                          Built-up Area
                        </span>
                        <span className="font-semibold text-brand-deepNavy">{project.builtUpArea}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">
                          Type
                        </span>
                        <span className="font-semibold text-brand-deepNavy">{project.type.split(' ')[0]} {project.type.split(' ')[1]}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">
                          Status
                        </span>
                        <span className={statusMeta.pillClass}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.isSoldOut ? 'bg-rose-600' : statusMeta.isReady ? 'bg-emerald-600 animate-pulse' : statusMeta.isHandedOver ? 'bg-teal-600' : statusMeta.isPlanning ? 'bg-blue-600' : 'bg-amber-600'}`} />
                          {statusMeta.shortLabel}
                        </span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectProject(project)}
                        className="text-xs font-bold text-brand-deepNavy hover:text-brand-goldDark flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>View Specifications & Photos ({project.images?.length || 1})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEnquireProject(project.title)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors border cursor-pointer ${statusMeta.enquiryButtonClass}`}
                      >
                        {statusMeta.enquiryButtonText}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

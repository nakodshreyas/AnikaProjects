import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Phone,
  Layers,
  X,
  Upload,
  Check,
  Sparkles,
  ArrowRight,
  Home,
  Star,
  Camera,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Edit3,
  Database,
  Copy,
  CheckCheck,
  PhoneCall,
  Trash2,
  Plus,
  ShieldCheck,
  Sliders
} from 'lucide-react';
import { LeadSubmission, ProjectUnitItem } from '../../types';
import { DashboardProject } from './dashboardData';

export interface ProjectFormData {
  title: string;
  units: string;
  location: string;
  status: 'delivered' | 'ongoing' | 'planning' | 'sold_out' | 'available' | string;
  configuration: string;
  plotArea: string;
  builtUpArea: string;
  imageUrl: string;
  images: string[];
  overview: string;
  highlights: string[];
  groundFloor: string;
  firstFloor: string;
  terrace: string;
  parking: string;
  foundation: string;
  superstructure: string;
  masonry: string;
  flooring: string;
  doorsWindows: string;
  electrical: string;
  plumbing: string;
  waterproofing: string;
}

// =========================================================================
// 1. QUICK ADD DRAWER MODAL
// =========================================================================
export interface QuickAddProjectModalProps {
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (isOpen: boolean) => void;
  addStep: 1 | 2;
  setAddStep: (step: 1 | 2) => void;
  formData: ProjectFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>;
  isCreatingProject: boolean;
  handleCreateProject: (e: React.FormEvent) => void;
  handleLoadSaiNagarTemplate: () => void;
  handleFilesUploadToForm: (files: FileList | null) => void;
  handleRemoveFormImage: (index: number) => void;
  handleSetCoverInForm: (index: number) => void;
}

export const QuickAddProjectModal: React.FC<QuickAddProjectModalProps> = ({
  isQuickAddOpen,
  setIsQuickAddOpen,
  addStep,
  setAddStep,
  formData,
  setFormData,
  isCreatingProject,
  handleCreateProject,
  handleLoadSaiNagarTemplate,
  handleFilesUploadToForm,
  handleRemoveFormImage,
  handleSetCoverInForm
}) => {
  return (
    <>
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center items-center bg-[#1b1c1a]/50 backdrop-blur-sm p-0 md:p-4">
          <div className="w-full max-w-2xl bg-white rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto border border-[#e4e2de] animate-fadeIn">

            {/* Modal Header */}
            <div className="p-5 flex items-start justify-between border-b border-[#e4e2de] bg-[#fbf9f5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#ffddb9] flex items-center justify-center text-[#7a582e]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl font-bold text-[#081928]">
                      Add Project Development
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#081928] text-[#ecbe8b] text-[10px] font-bold">
                      Step {addStep} of 2
                    </span>
                  </div>
                  <p className="text-xs text-[#44474c]">
                    {addStep === 1
                      ? 'Core dimensions, units count & elevation cover'
                      : 'Floor plan layouts & civil engineering specifications'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSaiNagarTemplate}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#ffddb9]/50 text-[#7a582e] text-[11px] font-bold cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Pre-fill Sai Nagar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="p-1 rounded-full text-[#44474c] hover:bg-[#efeeea] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stepper Tabs inside modal */}
            <div className="flex border-b border-[#e4e2de] text-xs">
              <button
                type="button"
                onClick={() => setAddStep(1)}
                className={`flex-1 py-3 text-center font-bold border-b-2 transition-colors cursor-pointer ${addStep === 1
                    ? 'border-[#081928] text-[#081928] bg-white'
                    : 'border-transparent text-[#44474c] bg-[#f5f3ef]'
                  }`}
              >
                1. Project Identity & Photos
              </button>
              <button
                type="button"
                onClick={() => setAddStep(2)}
                className={`flex-1 py-3 text-center font-bold border-b-2 transition-colors cursor-pointer ${addStep === 2
                    ? 'border-[#081928] text-[#081928] bg-white'
                    : 'border-transparent text-[#44474c] bg-[#f5f3ef]'
                  }`}
              >
                2. Architecture & Civil Specs
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateProject} className="p-5 space-y-4">

              {addStep === 1 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#081928]">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="e.g. Sai Nagar Modern Row Houses"
                        className="h-10 px-3 rounded-lg bg-[#f5f3ef] text-[#1b1c1a] text-xs border border-[#e4e2de]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
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
                        placeholder="e.g. 3 Units"
                        className="h-10 px-3 rounded-lg bg-[#f5f3ef] text-[#1b1c1a] text-xs border border-[#e4e2de]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#081928]">
                      Location in Amravati *
                    </label>
                    <div className="relative flex items-center">
                      <MapPin className="w-4 h-4 absolute left-3 text-[#7a582e]" />
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        placeholder="e.g. Sai Nagar, Akoli Road, Amravati"
                        className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#f5f3ef] text-[#1b1c1a] text-xs border border-[#e4e2de]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#081928]">
                        Configuration
                      </label>
                      <input
                        type="text"
                        value={formData.configuration}
                        onChange={(e) =>
                          setFormData({ ...formData, configuration: e.target.value })
                        }
                        placeholder="2 BHK Independent Villas"
                        className="h-10 px-3 rounded-lg bg-[#f5f3ef] text-[#1b1c1a] text-xs border border-[#e4e2de]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#081928]">
                        Plot Area
                      </label>
                      <input
                        type="text"
                        value={formData.plotArea}
                        onChange={(e) =>
                          setFormData({ ...formData, plotArea: e.target.value })
                        }
                        placeholder="~700 sq ft per unit"
                        className="h-10 px-3 rounded-lg bg-[#f5f3ef] text-[#1b1c1a] text-xs border border-[#e4e2de]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#081928]">
                        Built-up Area
                      </label>
                      <input
                        type="text"
                        value={formData.builtUpArea}
                        onChange={(e) =>
                          setFormData({ ...formData, builtUpArea: e.target.value })
                        }
                        placeholder="~1,100 sq ft built-up"
                        className="h-10 px-3 rounded-lg bg-[#f5f3ef] text-[#1b1c1a] text-xs border border-[#e4e2de]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#081928]">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as any,
                        })
                      }
                      className="h-10 px-3 rounded-lg bg-[#f5f3ef] text-[#1b1c1a] text-xs border border-[#e4e2de]"
                    >
                      <option value="sold_out">🔴 Completed & Sold Out (100% Sold)</option>
                      <option value="delivered">🟢 Completed & Handed Over</option>
                      <option value="ongoing">🟡 Under Construction</option>
                      <option value="planning">🔵 Pre-Booking / In Planning</option>
                      <option value="available">🟣 Ready to Move / Available</option>
                    </select>
                  </div>

                  {/* Multiple Project Images Uploader */}
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#081928] flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-[#7a582e]" />
                        <span>Project Photos & Elevations *</span>
                      </label>
                      <span className="px-2 py-0.5 rounded-full bg-[#081928] text-[#ecbe8b] text-[10px] font-bold">
                        {(formData.images?.length || 0)} Photos
                      </span>
                    </div>

                    <div
                      onClick={() => document.getElementById('modal-multi-photo-input')?.click()}
                      className="w-full p-3.5 rounded-xl bg-[#f5f3ef] border-2 border-dashed border-[#c4c6cc] flex items-center justify-between gap-3 cursor-pointer hover:bg-[#efeeea] group transition-all"
                    >
                      <input
                        id="modal-multi-photo-input"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFilesUploadToForm(e.target.files)}
                      />
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-[#ffddb9] flex items-center justify-center text-[#7a582e] shrink-0">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#081928]">
                            Upload Multiple Images
                          </p>
                          <p className="text-[10px] text-[#44474c]">
                            Browse device files (JPG, PNG, WebP)
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#081928] text-white">
                        Browse Files
                      </span>
                    </div>

                    {/* Thumbnail gallery */}
                    {formData.images && formData.images.length > 0 && (
                      <div className="p-2.5 bg-[#f5f3ef] rounded-lg border border-[#e4e2de]">
                        <div className="grid grid-cols-4 gap-2">
                          {formData.images.map((imgUrl, imgIdx) => (
                            <div
                              key={imgIdx}
                              className={`relative aspect-[4/3] rounded-md overflow-hidden border group ${imgIdx === 0
                                  ? 'border-[#7a582e] ring-2 ring-[#7a582e]/50 shadow-xs'
                                  : 'border-[#c4c6cc]'
                                }`}
                            >
                              <img src={imgUrl} alt={`Photo ${imgIdx + 1}`} className="w-full h-full object-cover" />
                              {imgIdx === 0 ? (
                                <span className="absolute top-0.5 left-0.5 px-1 py-0.2 rounded bg-[#081928]/90 text-[#ecbe8b] text-[8px] font-bold flex items-center gap-0.5">
                                  <Star className="w-2 h-2 fill-current" /> Cover
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetCoverInForm(imgIdx);
                                  }}
                                  className="absolute top-0.5 left-0.5 px-1 py-0.2 rounded bg-black/60 text-white text-[8px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                  Cover
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFormImage(imgIdx);
                                }}
                                className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isCreatingProject}
                      className="px-4 h-11 rounded-lg bg-[#f5f3ef] hover:bg-[#ffddb9]/50 text-[#7a582e] border border-[#e4e2de] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 text-[#7a582e]" />
                      <span>{isCreatingProject ? 'Saving...' : 'Quick Save'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddStep(2)}
                      className="flex-1 h-11 rounded-lg bg-[#081928] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow hover:bg-[#1e2e3e]"
                    >
                      <span>Proceed to Step 2: Civil Specs</span>
                      <ArrowRight className="w-4 h-4 text-[#ecbe8b]" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#081928]">
                      Project Overview
                    </label>
                    <textarea
                      rows={2}
                      value={formData.overview}
                      onChange={(e) =>
                        setFormData({ ...formData, overview: e.target.value })
                      }
                      placeholder="Three thoughtfully planned 2 BHK modern row houses..."
                      className="w-full p-2.5 rounded-lg bg-[#f5f3ef] text-[#1b1c1a] text-xs border border-[#e4e2de]"
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#081928] uppercase tracking-wider block">
                      Floor Plans (Ground, First, Terrace, Parking)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <input
                        type="text"
                        value={formData.groundFloor}
                        onChange={(e) => setFormData({ ...formData, groundFloor: e.target.value })}
                        placeholder="Ground Floor: Car Porch, Living 15x12 ft..."
                        className="p-2 rounded bg-[#f5f3ef] border border-[#e4e2de]"
                      />
                      <input
                        type="text"
                        value={formData.firstFloor}
                        onChange={(e) => setFormData({ ...formData, firstFloor: e.target.value })}
                        placeholder="First Floor: Master Ensuite 13x11 ft..."
                        className="p-2 rounded bg-[#f5f3ef] border border-[#e4e2de]"
                      />
                      <input
                        type="text"
                        value={formData.terrace}
                        onChange={(e) => setFormData({ ...formData, terrace: e.target.value })}
                        placeholder="Terrace: Weather-proof open terrace..."
                        className="p-2 rounded bg-[#f5f3ef] border border-[#e4e2de]"
                      />
                      <input
                        type="text"
                        value={formData.parking}
                        onChange={(e) => setFormData({ ...formData, parking: e.target.value })}
                        placeholder="Parking: Dedicated vehicular parking..."
                        className="p-2 rounded bg-[#f5f3ef] border border-[#e4e2de]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#081928] uppercase tracking-wider block">
                      Key Material Specifications
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <input
                        type="text"
                        value={formData.foundation}
                        onChange={(e) => setFormData({ ...formData, foundation: e.target.value })}
                        placeholder="Foundation: Isolated RCC Column footing..."
                        className="p-2 rounded bg-[#f5f3ef] border border-[#e4e2de]"
                      />
                      <input
                        type="text"
                        value={formData.superstructure}
                        onChange={(e) => setFormData({ ...formData, superstructure: e.target.value })}
                        placeholder="Superstructure: Ultratech 53 & Fe 550D TMT..."
                        className="p-2 rounded bg-[#f5f3ef] border border-[#e4e2de]"
                      />
                      <input
                        type="text"
                        value={formData.flooring}
                        onChange={(e) => setFormData({ ...formData, flooring: e.target.value })}
                        placeholder="Flooring: 800x800 mm glazed vitrified..."
                        className="p-2 rounded bg-[#f5f3ef] border border-[#e4e2de]"
                      />
                      <input
                        type="text"
                        value={formData.waterproofing}
                        onChange={(e) => setFormData({ ...formData, waterproofing: e.target.value })}
                        placeholder="Waterproofing: Dr. Fixit 2-coat..."
                        className="p-2 rounded bg-[#f5f3ef] border border-[#e4e2de]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#e4e2de]">
                    <button
                      type="button"
                      onClick={() => setAddStep(1)}
                      className="px-4 py-2 bg-[#f5f3ef] hover:bg-[#efeeea] text-[#1b1c1a] rounded text-xs font-semibold"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingProject}
                      className="px-5 py-2.5 bg-[#081928] text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow disabled:opacity-50 cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-[#ecbe8b]" />
                      <span>{isCreatingProject ? 'Saving to Database...' : 'Save & Publish to Database'}</span>
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      )}

    </>
  );
};

// =========================================================================
// 2. PROJECT DETAIL MODAL
// =========================================================================
export interface ProjectDetailModalProps {
  selectedProjectForView: DashboardProject | null;
  setSelectedProjectForView: (project: DashboardProject | null) => void;
  viewModalTab: 'overview' | 'floorplans' | 'engineering' | 'gallery';
  setViewModalTab: (tab: 'overview' | 'floorplans' | 'engineering' | 'gallery') => void;
  leads: LeadSubmission[];
  handleUpdateLeadStatus: (id: string, status: NonNullable<LeadSubmission['status']>) => void | Promise<void>;
  handleOpenPhotoManager: (project: DashboardProject) => void;
  handleOpenUnitManager: (project: DashboardProject) => void;
  setActiveTab: (tab: 'projects' | 'leads' | 'reviews' | 'desk') => void;
  setInquirySearchQuery: (query: string) => void;
  handleOpenStatusModal?: (project: DashboardProject) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  selectedProjectForView,
  setSelectedProjectForView,
  viewModalTab,
  setViewModalTab,
  leads,
  handleUpdateLeadStatus,
  handleOpenPhotoManager,
  handleOpenUnitManager,
  setActiveTab,
  setInquirySearchQuery,
  handleOpenStatusModal
}) => {
  return (
    <>
      {selectedProjectForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-[#e4e2de] animate-fadeIn max-h-[92vh] flex flex-col">

            {/* Modal Hero Banner */}
            <div className="relative h-60 w-full shrink-0">
              <img
                src={selectedProjectForView.imageUrl}
                alt={selectedProjectForView.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081928] via-[#081928]/40 to-transparent" />

              <button
                type="button"
                onClick={() => setSelectedProjectForView(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-5 right-5 text-white">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs uppercase font-extrabold text-[#ecbe8b] tracking-wider px-2 py-0.5 rounded bg-black/40 border border-[#ecbe8b]/40">
                    {selectedProjectForView.statusLabel}
                  </span>
                  {handleOpenStatusModal && (
                    <button
                      type="button"
                      onClick={() => handleOpenStatusModal(selectedProjectForView)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ecbe8b] hover:text-white bg-[#081928]/80 hover:bg-[#081928] px-2 py-0.5 rounded border border-[#ecbe8b]/40 cursor-pointer transition-colors"
                      title="Change status for this project"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Change Status</span>
                    </button>
                  )}
                  <span className="text-xs text-white/90">• {selectedProjectForView.units}</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold">
                  {selectedProjectForView.title}
                </h3>
                <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#ecbe8b]" />
                  <span>{selectedProjectForView.location}</span>
                </p>
              </div>
            </div>

            {/* Quick Sizing Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[#f5f3ef] border-b border-[#e4e2de] text-center shrink-0">
              <div className="p-1">
                <span className="text-[10px] uppercase font-bold text-[#44474c] block">Configuration</span>
                <span className="text-xs font-bold text-[#081928] block truncate">{selectedProjectForView.configuration}</span>
              </div>
              <div className="p-1">
                <span className="text-[10px] uppercase font-bold text-[#44474c] block">Plot Area</span>
                <span className="text-xs font-bold text-[#081928] block">{selectedProjectForView.plotArea}</span>
              </div>
              <div className="p-1">
                <span className="text-[10px] uppercase font-bold text-[#44474c] block">Built-up Area</span>
                <span className="text-xs font-bold text-[#081928] block">{selectedProjectForView.builtUpArea}</span>
              </div>
              <div className="p-1">
                <span className="text-[10px] uppercase font-bold text-[#44474c] block">Status</span>
                <span className="text-xs font-bold text-[#7a582e] block">{selectedProjectForView.statusLabel.split(' ')[0]}</span>
              </div>
            </div>

            {/* Modal Internal Tabs */}
            <div className="flex border-b border-[#e4e2de] text-xs bg-white shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setViewModalTab('overview')}
                className={`px-4 py-3 text-center font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${viewModalTab === 'overview'
                    ? 'border-[#081928] text-[#081928]'
                    : 'border-transparent text-[#44474c] hover:text-[#081928]'
                  }`}
              >
                Project Overview & Highlights
              </button>
              <button
                type="button"
                onClick={() => setViewModalTab('units' as any)}
                className={`px-4 py-3 text-center font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${(viewModalTab as string) === 'units'
                    ? 'border-[#081928] text-[#081928]'
                    : 'border-transparent text-[#44474c] hover:text-[#081928]'
                  }`}
              >
                Units & Live Inventory ({selectedProjectForView.unitInventory?.length || selectedProjectForView.units})
              </button>
              <button
                type="button"
                onClick={() => setViewModalTab('gallery')}
                className={`px-4 py-3 text-center font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${viewModalTab === 'gallery'
                    ? 'border-[#081928] text-[#081928]'
                    : 'border-transparent text-[#44474c] hover:text-[#081928]'
                  }`}
              >
                Project Photos ({(selectedProjectForView.images?.length || 1)})
              </button>
              <button
                type="button"
                onClick={() => setViewModalTab('floorplans')}
                className={`px-4 py-3 text-center font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${viewModalTab === 'floorplans'
                    ? 'border-[#081928] text-[#081928]'
                    : 'border-transparent text-[#44474c] hover:text-[#081928]'
                  }`}
              >
                Floor Plan Breakdown
              </button>
              <button
                type="button"
                onClick={() => setViewModalTab('engineering')}
                className={`px-4 py-3 text-center font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${viewModalTab === 'engineering'
                    ? 'border-[#081928] text-[#081928]'
                    : 'border-transparent text-[#44474c] hover:text-[#081928]'
                  }`}
              >
                Civil Engineering & Materials
              </button>
              <button
                type="button"
                onClick={() => setViewModalTab('inquiries' as any)}
                className={`px-4 py-3 text-center font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${(viewModalTab as string) === 'inquiries'
                    ? 'border-[#081928] text-[#081928]'
                    : 'border-transparent text-[#44474c] hover:text-[#081928]'
                  }`}
              >
                Inquiry Status & Leads ({leads.filter(l => l.interest.toLowerCase().includes(selectedProjectForView.title.toLowerCase().split(' ')[0])).length || 2})
              </button>
            </div>

            {/* Modal Tab Content Area */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">

              {/* TAB 1: Overview */}
              {viewModalTab === 'overview' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Live Units Overview Card */}
                  <div className="p-4 rounded-xl bg-[#fbf9f5] border border-[#e4e2de] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="text-xs font-bold text-[#081928] uppercase tracking-wider">
                          Real-Time Units & Inventory Status
                        </h4>
                      </div>
                      <p className="text-xs text-[#44474c] mt-0.5">
                        {selectedProjectForView.units} • Synced live with customer public website.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const proj = selectedProjectForView;
                        setSelectedProjectForView(null);
                        handleOpenUnitManager(proj);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-[#081928] hover:bg-[#1e2e3e] text-[#ecbe8b] font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#ecbe8b]" />
                      <span>Manage Units & Inventory</span>
                    </button>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#7a582e] uppercase tracking-wider mb-1.5">
                      Project Synopsis
                    </h4>
                    <p className="text-xs sm:text-sm text-[#1b1c1a] leading-relaxed">
                      {selectedProjectForView.overview}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#7a582e] uppercase tracking-wider mb-2">
                      Key Architectural & Structural Highlights
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {selectedProjectForView.highlights.map((h, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-2.5 rounded-lg bg-[#f5f3ef] border border-[#e4e2de]"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          <span className="text-[#1b1c1a]">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Real-Time Units & Inventory */}
              {(viewModalTab as string) === 'units' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e4e2de]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="text-xs font-bold text-[#7a582e] uppercase tracking-wider">
                          Real-Time Project Units Matrix
                        </h4>
                      </div>
                      <p className="text-xs text-[#44474c] mt-0.5">
                        Current unit status synchronized in real time with the public website.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const proj = selectedProjectForView;
                        setSelectedProjectForView(null);
                        handleOpenUnitManager(proj);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-[#081928] hover:bg-[#1e2e3e] text-[#ecbe8b] font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#ecbe8b]" />
                      <span>Manage & Edit Units</span>
                    </button>
                  </div>

                  {/* Summary Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-[#f5f3ef] rounded-lg border border-[#e4e2de]">
                      <span className="text-[10px] text-[#44474c] uppercase font-bold block">Headline Units</span>
                      <span className="font-bold text-[#081928] text-xs mt-0.5 block truncate">{selectedProjectForView.units}</span>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 uppercase font-bold block">Available</span>
                      <span className="font-bold text-emerald-800 text-sm mt-0.5 block">
                        {(selectedProjectForView.unitInventory?.filter(u => u.status === 'available').length || 0)} Units
                      </span>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                      <span className="text-[10px] text-amber-700 uppercase font-bold block">Token Booked</span>
                      <span className="font-bold text-amber-800 text-sm mt-0.5 block">
                        {(selectedProjectForView.unitInventory?.filter(u => u.status === 'booked').length || 0)} Units
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-300">
                      <span className="text-[10px] text-slate-600 uppercase font-bold block">Handed Over / Sold</span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                        {(selectedProjectForView.unitInventory?.filter(u => u.status === 'sold').length || 0)} Units
                      </span>
                    </div>
                  </div>

                  {/* Units Table */}
                  <div className="overflow-x-auto border border-[#e4e2de] rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f5f3ef] text-[#081928] border-b border-[#e4e2de]">
                        <tr>
                          <th className="py-2.5 px-3 font-bold">Unit / Plot #</th>
                          <th className="py-2.5 px-3 font-bold">Type / Layout</th>
                          <th className="py-2.5 px-3 font-bold">Carpet / Built-up</th>
                          <th className="py-2.5 px-3 font-bold">Facing</th>
                          <th className="py-2.5 px-3 font-bold">Price Quote</th>
                          <th className="py-2.5 px-3 font-bold">Real-Time Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e4e2de]">
                        {(selectedProjectForView.unitInventory && selectedProjectForView.unitInventory.length > 0) ? (
                          selectedProjectForView.unitInventory.map((unit) => (
                            <tr key={unit.id} className="hover:bg-[#fbf9f5] transition-colors">
                              <td className="py-2.5 px-3 font-bold text-[#081928] whitespace-nowrap">
                                {unit.unitNumber}
                              </td>
                              <td className="py-2.5 px-3 text-[#1b1c1a]">
                                {unit.type}
                              </td>
                              <td className="py-2.5 px-3 text-[#44474c] whitespace-nowrap">
                                {unit.size}
                              </td>
                              <td className="py-2.5 px-3 text-[#44474c] whitespace-nowrap">
                                {unit.facing || 'Vastu Compliant'}
                              </td>
                              <td className="py-2.5 px-3 text-[#7a582e] font-semibold whitespace-nowrap">
                                {unit.price || 'Market Rate'}
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                {unit.status === 'available' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    ✓ Available
                                  </span>
                                ) : unit.status === 'booked' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                    ● Token Booked
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                                    ✓ Handed Over
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-4 text-center text-gray-500">
                              No individual units mapped. Click &quot;Manage & Edit Units&quot; to configure units.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: Project Photo Gallery */}
              {viewModalTab === 'gallery' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e4e2de]">
                    <div>
                      <h4 className="text-xs font-bold text-[#7a582e] uppercase tracking-wider flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-[#7a582e]" />
                        <span>Project Architectural & Site Photograph Dossier</span>
                      </h4>
                      <p className="text-xs text-[#44474c] mt-0.5">
                        {((selectedProjectForView.images && selectedProjectForView.images.length > 0) ? selectedProjectForView.images.length : 1)} high-resolution photographs currently attached to this development.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenPhotoManager(selectedProjectForView)}
                      className="px-3.5 py-2 rounded-lg bg-[#081928] hover:bg-[#1e2e3e] text-[#ecbe8b] text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload & Manage Photos</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {((selectedProjectForView.images && selectedProjectForView.images.length > 0)
                      ? selectedProjectForView.images
                      : [selectedProjectForView.imageUrl]).map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-video rounded-xl overflow-hidden border border-[#e4e2de] shadow-xs group bg-[#081928]"
                        >
                          <img
                            src={imgUrl}
                            alt={`${selectedProjectForView.title} photo ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                          <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded flex items-center gap-1">
                            {idx === 0 ? <><Star className="w-2.5 h-2.5 fill-current text-[#ecbe8b]" /> Primary Cover</> : `Photo #${idx + 1}`}
                          </span>
                        </div>
                      ))}
                  </div>

                  <div className="p-3 bg-[#f5f3ef] rounded-lg border border-[#e4e2de] flex items-center justify-between text-xs">
                    <span className="text-[#44474c]">Need to add new construction site progress or elevations?</span>
                    <button
                      type="button"
                      onClick={() => handleOpenPhotoManager(selectedProjectForView)}
                      className="font-bold text-[#7a582e] hover:text-[#081928] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload More Images</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Floor Plans */}
              {viewModalTab === 'floorplans' && (
                <div className="space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-bold text-[#7a582e] uppercase tracking-wider mb-1">
                    Floor Plan Breakdown & Spatial Layout
                  </h4>

                  <div className="p-3.5 rounded-xl bg-[#f5f3ef] border border-[#e4e2de] space-y-1">
                    <span className="text-xs font-bold text-[#081928] block">
                      Ground Floor Layout
                    </span>
                    <p className="text-xs text-[#44474c]">
                      {selectedProjectForView.floorPlans.groundFloor}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#f5f3ef] border border-[#e4e2de] space-y-1">
                    <span className="text-xs font-bold text-[#081928] block">
                      First Floor Layout
                    </span>
                    <p className="text-xs text-[#44474c]">
                      {selectedProjectForView.floorPlans.firstFloor}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#f5f3ef] border border-[#e4e2de] space-y-1">
                    <span className="text-xs font-bold text-[#081928] block">
                      Terrace Zone
                    </span>
                    <p className="text-xs text-[#44474c]">
                      {selectedProjectForView.floorPlans.terrace}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#f5f3ef] border border-[#e4e2de] space-y-1">
                    <span className="text-xs font-bold text-[#081928] block">
                      Parking & Access
                    </span>
                    <p className="text-xs text-[#44474c]">
                      {selectedProjectForView.floorPlans.parking}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: Civil Engineering Specifications & Material Grades */}
              {viewModalTab === 'engineering' && (
                <div className="space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-bold text-[#7a582e] uppercase tracking-wider mb-1">
                    Civil Engineering Specifications & Material Grades
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#f5f3ef] border border-[#e4e2de]">
                      <span className="text-[10px] font-bold text-[#7a582e] uppercase block">Foundation & Earthwork</span>
                      <p className="font-medium text-[#1b1c1a] mt-0.5">{selectedProjectForView.engineeringSpecs.foundation}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#f5f3ef] border border-[#e4e2de]">
                      <span className="text-[10px] font-bold text-[#7a582e] uppercase block">RCC Superstructure</span>
                      <p className="font-medium text-[#1b1c1a] mt-0.5">{selectedProjectForView.engineeringSpecs.superstructure}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#f5f3ef] border border-[#e4e2de]">
                      <span className="text-[10px] font-bold text-[#7a582e] uppercase block">Masonry & Plaster</span>
                      <p className="font-medium text-[#1b1c1a] mt-0.5">{selectedProjectForView.engineeringSpecs.masonry}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#f5f3ef] border border-[#e4e2de]">
                      <span className="text-[10px] font-bold text-[#7a582e] uppercase block">Flooring & Tiling</span>
                      <p className="font-medium text-[#1b1c1a] mt-0.5">{selectedProjectForView.engineeringSpecs.flooring}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#f5f3ef] border border-[#e4e2de]">
                      <span className="text-[10px] font-bold text-[#7a582e] uppercase block">Doors & Windows</span>
                      <p className="font-medium text-[#1b1c1a] mt-0.5">{selectedProjectForView.engineeringSpecs.doorsWindows}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#f5f3ef] border border-[#e4e2de]">
                      <span className="text-[10px] font-bold text-[#7a582e] uppercase block">Electrical System</span>
                      <p className="font-medium text-[#1b1c1a] mt-0.5">{selectedProjectForView.engineeringSpecs.electrical}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#f5f3ef] border border-[#e4e2de]">
                      <span className="text-[10px] font-bold text-[#7a582e] uppercase block">Plumbing & Sanitary</span>
                      <p className="font-medium text-[#1b1c1a] mt-0.5">{selectedProjectForView.engineeringSpecs.plumbing}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#f5f3ef] border border-[#e4e2de]">
                      <span className="text-[10px] font-bold text-[#7a582e] uppercase block">Waterproofing Protection</span>
                      <p className="font-medium text-[#1b1c1a] mt-0.5">{selectedProjectForView.engineeringSpecs.waterproofing}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Inquiry Status & Leads for this Project */}
              {(viewModalTab as string) === 'inquiries' && (() => {
                const projectKeyword = selectedProjectForView.title.toLowerCase().split(' ')[0];
                const projectLeads = leads.filter((l) =>
                  l.interest.toLowerCase().includes(projectKeyword)
                );

                return (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#7a582e] uppercase tracking-wider">
                          Inquiry Pipeline for {selectedProjectForView.title}
                        </h4>
                        <p className="text-xs text-[#44474c] mt-0.5">
                          Prospects and callback leads interested in this development.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProjectForView(null);
                          setActiveTab('leads');
                          setInquirySearchQuery(projectKeyword);
                        }}
                        className="text-xs font-bold text-[#7a582e] hover:text-[#081928] flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open CRM Desk</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {projectLeads.length === 0 ? (
                      <div className="p-6 rounded-xl bg-[#f5f3ef] border border-[#e4e2de] text-center space-y-2">
                        <Phone className="w-8 h-8 mx-auto text-[#74777d]" />
                        <p className="text-xs font-bold text-[#081928]">
                          No direct inquiries recorded yet for this project.
                        </p>
                        <p className="text-[11px] text-[#44474c]">
                          Inquiries submitted from the public website for this project will automatically appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {projectLeads.map((lead) => {
                          const status = lead.status || 'new';
                          return (
                            <div
                              key={lead.id}
                              className="p-3.5 rounded-xl bg-[#f5f3ef] border border-[#e4e2de] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-[#081928]">
                                    {lead.name}
                                  </span>
                                  <span className="text-[11px] font-mono text-[#7a582e]">
                                    {lead.phone}
                                  </span>
                                </div>
                                <p className="text-xs text-[#44474c] mt-0.5">
                                  {lead.interest} • <span className="italic">{lead.notes || 'Interested buyer'}</span>
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="relative inline-flex items-center">
                                  <select
                                    value={status}
                                    onChange={(e) =>
                                      handleUpdateLeadStatus(
                                        lead.id,
                                        e.target.value as NonNullable<LeadSubmission['status']>
                                      )
                                    }
                                    className={`appearance-none pl-2.5 pr-7 py-1 rounded-full text-[11px] font-bold tracking-wide border cursor-pointer focus:outline-none transition-shadow shadow-sm ${status === 'new'
                                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                                        : status === 'site_visit'
                                          ? 'bg-purple-100 text-purple-900 border-purple-300'
                                          : status === 'contacted'
                                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                                            : status === 'converted'
                                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                              : 'bg-slate-100 text-slate-700 border-slate-300'
                                      }`}
                                    title="Click to update inquiry status in database"
                                  >
                                    <option value="new">● New Inquiry</option>
                                    <option value="site_visit">📅 Site Visit</option>
                                    <option value="contacted">💬 In Discussion</option>
                                    <option value="converted">✓ Booked</option>
                                    <option value="closed">✕ Closed</option>
                                  </select>
                                  <ChevronDown className="w-3 h-3 absolute right-2 pointer-events-none opacity-60" />
                                </div>

                                <a
                                  href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`}
                                  className="p-1.5 rounded-lg bg-white hover:bg-[#081928] hover:text-white text-[#081928] border border-[#e4e2de] transition-colors"
                                  title="Call"
                                >
                                  <PhoneCall className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-[#f5f3ef] border-t border-[#e4e2de] flex items-center justify-between shrink-0">
              <span className="text-xs text-[#44474c]">
                Verified by Anika Projects Quality Control Desk, Amravati.
              </span>
              <button
                type="button"
                onClick={() => setSelectedProjectForView(null)}
                className="px-5 py-2 bg-[#081928] text-white text-xs font-bold rounded-lg hover:bg-[#1e2e3e] cursor-pointer"
              >
                Close Project Dossier
              </button>
            </div>

          </div>
        </div>
      )}

    </>
  );
};

// =========================================================================
// 3. PHOTO MANAGER MODAL
// =========================================================================
export interface PhotoManagerModalProps {
  photoManagerProject: DashboardProject | null;
  setPhotoManagerProject: (project: DashboardProject | null) => void;
  managerImages: string[];
  setManagerImages: React.Dispatch<React.SetStateAction<string[]>>;
  managerUrlInput: string;
  setManagerUrlInput: (url: string) => void;
  handleFilesUploadToManager: (files: FileList | null) => Promise<void> | void;
  handleAddUrlToManager: (e: React.FormEvent) => void;
  handleRemoveManagerImage: (index: number) => void;
  handleSetCoverInManager: (index: number) => void;
  handleMoveManagerImage: (index: number, direction: 'left' | 'right') => void;
  handleSavePhotoManager: () => void;
  showToast: (msg: string) => void;
}

export const PhotoManagerModal: React.FC<PhotoManagerModalProps> = ({
  photoManagerProject,
  setPhotoManagerProject,
  managerImages,
  setManagerImages,
  managerUrlInput,
  setManagerUrlInput,
  handleFilesUploadToManager,
  handleAddUrlToManager,
  handleRemoveManagerImage,
  handleSetCoverInManager,
  handleMoveManagerImage,
  handleSavePhotoManager,
  showToast
}) => {
  return (
    <>
      {photoManagerProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-[#e4e2de] animate-fadeIn max-h-[92vh] flex flex-col">

            {/* Header */}
            <div className="p-5 sm:p-6 bg-[#081928] text-white flex items-start justify-between border-b border-[#7a582e]/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#ffddb9] flex items-center justify-center text-[#7a582e] shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                      Manage & Upload Project Photos
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ecbe8b] text-[#081928] text-[11px] font-bold">
                      {managerImages.length} Photos
                    </span>
                  </div>
                  <p className="text-xs text-white/80 mt-0.5">
                    {photoManagerProject.title} • Synced live to the public website showcase.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPhotoManagerProject(null)}
                className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
              {/* Multi-File Upload Dropzone */}
              <div
                onClick={() => document.getElementById('manager-multi-photo-input')?.click()}
                className="w-full p-5 rounded-xl border-2 border-dashed border-[#c4c6cc] bg-[#fbf9f5] hover:bg-[#f5f3ef] transition-all flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer group"
              >
                <input
                  id="manager-multi-photo-input"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFilesUploadToManager(e.target.files)}
                />
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#ffddb9] group-hover:scale-105 transition-transform flex items-center justify-center text-[#7a582e] shrink-0 shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#081928]">
                      Upload Multiple Photos from Your Computer
                    </h4>
                    <p className="text-xs text-[#44474c] mt-0.5">
                      Select multiple architectural photos, interior shots, floor plans, or site progress pictures simultaneously.
                    </p>
                  </div>
                </div>
                <span className="px-4 py-2 bg-[#081928] group-hover:bg-[#1e2e3e] text-white text-xs font-bold rounded-lg shadow-sm transition-colors whitespace-nowrap">
                  + Browse & Upload Files
                </span>
              </div>

              {/* Add by URL & Presets Toolbar */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="flex items-center gap-1.5 flex-1 w-full">
                  <input
                    type="url"
                    value={managerUrlInput}
                    onChange={(e) => setManagerUrlInput(e.target.value)}
                    placeholder="Or add photo by image URL..."
                    className="flex-1 h-9 px-3 rounded-lg bg-[#fbf9f5] border border-[#c4c6cc] text-xs text-[#1b1c1a] focus:outline-none focus:border-[#7a582e]"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrlToManager}
                    className="px-3.5 h-9 rounded-lg bg-[#081928] hover:bg-[#1e2e3e] text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
                  >
                    + Add URL
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    showToast('Please select your latest real photos from device or enter image URLs.');
                  }}
                  className="px-3 h-9 rounded-lg bg-[#ffddb9]/50 hover:bg-[#ffddb9] text-[#7a582e] border border-[#7a582e]/30 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Add Real Photos</span>
                </button>
              </div>

              {/* Photo Ledger Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#081928]">
                  <span>Project Photographs ({managerImages.length})</span>
                  <span className="text-[11px] text-[#7a582e] font-normal">
                    Tip: Photo #1 serves as the primary elevation cover on the public website.
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {managerImages.map((imgUrl, imgIdx) => (
                    <div
                      key={imgIdx}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 group bg-[#081928] shadow-xs transition-all ${imgIdx === 0
                          ? 'border-[#ecbe8b] ring-2 ring-[#ecbe8b]/40'
                          : 'border-[#e4e2de] hover:border-[#7a582e]'
                        }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Photo ${imgIdx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                      {/* Cover Badge / Button */}
                      {imgIdx === 0 ? (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#081928]/90 text-[#ecbe8b] text-[10px] font-bold flex items-center gap-1 shadow border border-[#ecbe8b]/40">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Primary Cover</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCoverInManager(imgIdx)}
                          className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 hover:bg-[#081928] text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-white/20"
                        >
                          Make Cover
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveManagerImage(imgIdx)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600/90 hover:bg-red-700 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Bottom Order Controls & Index */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs z-10">
                        <span className="font-mono text-[10px] bg-black/60 px-1.5 py-0.5 rounded">
                          #{imgIdx + 1}
                        </span>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {imgIdx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveManagerImage(imgIdx, 'left')}
                              className="p-1 rounded bg-black/70 hover:bg-black text-white cursor-pointer"
                              title="Move left"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                          )}
                          {imgIdx < managerImages.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveManagerImage(imgIdx, 'right')}
                              className="p-1 rounded bg-black/70 hover:bg-black text-white cursor-pointer"
                              title="Move right"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#f5f3ef] border-t border-[#e4e2de] flex items-center justify-between shrink-0">
              <span className="text-xs text-[#44474c]">
                {managerImages.length} photographs will be displayed across the public website cards and modal.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPhotoManagerProject(null)}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-[#efeeea] text-[#1b1c1a] border border-[#e4e2de] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePhotoManager}
                  className="px-5 py-2.5 rounded-lg bg-[#081928] hover:bg-[#1e2e3e] text-[#ecbe8b] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-colors"
                >
                  <Check className="w-4 h-4 text-[#ecbe8b]" />
                  <span>Save & Sync Photos to Public Site</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </>
  );
};

// =========================================================================
// 4. REAL-TIME UNITS & INVENTORY MANAGER MODAL
// =========================================================================
export interface UnitsManagerModalProps {
  unitManagerProject: DashboardProject | null;
  setUnitManagerProject: (project: DashboardProject | null) => void;
  tempUnitsSummary: string;
  setTempUnitsSummary: (summary: string) => void;
  tempInventory: ProjectUnitItem[];
  newUnitForm: {
    unitNumber: string;
    type: string;
    size: string;
    status: 'available' | 'booked' | 'sold';
    price: string;
    floor: string;
    facing: string;
  };
  setNewUnitForm: React.Dispatch<React.SetStateAction<{
    unitNumber: string;
    type: string;
    size: string;
    status: 'available' | 'booked' | 'sold';
    price: string;
    floor: string;
    facing: string;
  }>>;
  handleAutoGenerateSummaryFromInventory: () => void;
  handleUpdateUnitField: (unitId: string, field: keyof ProjectUnitItem, value: string) => void;
  handleUpdateUnitStatus: (unitId: string, status: 'available' | 'booked' | 'sold') => void;
  handleAddNewUnitToInventory: (e: React.FormEvent) => void;
  handleRemoveUnitFromInventory: (unitId: string) => void;
  handleSaveUnitManager: () => void;
}

export const UnitsManagerModal: React.FC<UnitsManagerModalProps> = ({
  unitManagerProject,
  setUnitManagerProject,
  tempUnitsSummary,
  setTempUnitsSummary,
  tempInventory,
  newUnitForm,
  setNewUnitForm,
  handleAutoGenerateSummaryFromInventory,
  handleUpdateUnitField,
  handleUpdateUnitStatus,
  handleAddNewUnitToInventory,
  handleRemoveUnitFromInventory,
  handleSaveUnitManager
}) => {
  return (
    <>
      {unitManagerProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5">
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl border border-[#e4e2de] animate-fadeIn max-h-[92vh] flex flex-col">

            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-[#081928] text-white flex items-start justify-between border-b border-[#7a582e]/40 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#ffddb9] flex items-center justify-center text-[#7a582e] shrink-0 shadow-sm">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                      Manage Real-Time Project Units
                    </h3>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Public Site Sync
                    </span>
                  </div>
                  <p className="text-xs text-white/80 mt-0.5">
                    {unitManagerProject.title} • {unitManagerProject.location}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setUnitManagerProject(null)}
                className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">

              {/* SECTION 1: Headline Units Label Editor */}
              <div className="p-4 rounded-xl bg-[#fbf9f5] border border-[#c4c6cc]/70 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-[#081928] block">
                      Public Website Headline Label (Shows on cards & banners)
                    </label>
                    <p className="text-[11px] text-[#44474c] mt-0.5">
                      Customers will see this exact status on the website homepage and portfolio card.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoGenerateSummaryFromInventory}
                    className="px-3 py-1.5 rounded-lg bg-[#ffddb9]/60 hover:bg-[#ffddb9] text-[#7a582e] border border-[#7a582e]/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
                    title="Automatically count available and booked units from matrix"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Calculate from Matrix</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempUnitsSummary}
                    onChange={(e) => setTempUnitsSummary(e.target.value)}
                    placeholder="e.g. 3 Units (1 Available, 2 Handed Over)"
                    className="flex-1 h-10 px-3.5 rounded-lg bg-white border border-[#c4c6cc] text-xs font-semibold text-[#081928] focus:outline-none focus:border-[#7a582e] focus:ring-1 focus:ring-[#7a582e]"
                  />
                  <div className="hidden sm:flex items-center gap-1.5 px-3 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Preview</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Live Inventory KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#f5f3ef] border border-[#e4e2de] text-center">
                  <span className="text-[10px] uppercase font-bold text-[#44474c] block tracking-wider">
                    Total Units / Plots
                  </span>
                  <span className="text-xl font-bold text-[#081928] block mt-1">
                    {tempInventory.length}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Available to Buy
                  </span>
                  <span className="text-xl font-bold text-emerald-800 block mt-1">
                    {tempInventory.filter((u) => u.status === 'available').length}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block tracking-wider flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    Under Booking
                  </span>
                  <span className="text-xl font-bold text-amber-800 block mt-1">
                    {tempInventory.filter((u) => u.status === 'booked').length}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block tracking-wider flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    Handed Over / Sold
                  </span>
                  <span className="text-xl font-bold text-slate-800 block mt-1">
                    {tempInventory.filter((u) => u.status === 'sold').length}
                  </span>
                </div>
              </div>

              {/* SECTION 3: Real-Time Unit Matrix Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#081928]">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#7a582e]" />
                    <span>Individual Unit Matrix ({tempInventory.length} Units)</span>
                  </span>
                  <span className="text-[11px] text-[#7a582e] font-normal">
                    Tip: Click status buttons to toggle instant availability.
                  </span>
                </div>

                <div className="border border-[#c4c6cc] rounded-xl overflow-hidden bg-white shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f5f3ef] text-[#081928] border-b border-[#c4c6cc]/70">
                        <tr>
                          <th className="py-2.5 px-3 font-bold">Unit / Plot #</th>
                          <th className="py-2.5 px-3 font-bold">Type / Layout</th>
                          <th className="py-2.5 px-3 font-bold">Size</th>
                          <th className="py-2.5 px-3 font-bold">Facing</th>
                          <th className="py-2.5 px-3 font-bold">Price / Tag</th>
                          <th className="py-2.5 px-3 font-bold text-center">Real-Time Status</th>
                          <th className="py-2.5 px-3 font-bold text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e4e2de]">
                        {tempInventory.map((unit) => (
                          <tr key={unit.id} className="hover:bg-[#fbf9f5] transition-colors">
                            {/* Unit Designation */}
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={unit.unitNumber}
                                onChange={(e) =>
                                  handleUpdateUnitField(unit.id, 'unitNumber', e.target.value)
                                }
                                className="w-32 h-8 px-2 rounded bg-[#f5f3ef] border border-[#c4c6cc] text-xs font-bold text-[#081928] focus:bg-white focus:outline-none focus:border-[#7a582e]"
                              />
                            </td>

                            {/* Type */}
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={unit.type}
                                onChange={(e) =>
                                  handleUpdateUnitField(unit.id, 'type', e.target.value)
                                }
                                className="w-36 h-8 px-2 rounded bg-[#f5f3ef] border border-[#c4c6cc] text-xs text-[#1b1c1a] focus:bg-white focus:outline-none focus:border-[#7a582e]"
                              />
                            </td>

                            {/* Size */}
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={unit.size}
                                onChange={(e) =>
                                  handleUpdateUnitField(unit.id, 'size', e.target.value)
                                }
                                className="w-24 h-8 px-2 rounded bg-[#f5f3ef] border border-[#c4c6cc] text-xs text-[#44474c] focus:bg-white focus:outline-none focus:border-[#7a582e]"
                              />
                            </td>

                            {/* Facing */}
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={unit.facing || ''}
                                placeholder="East / West"
                                onChange={(e) =>
                                  handleUpdateUnitField(unit.id, 'facing', e.target.value)
                                }
                                className="w-24 h-8 px-2 rounded bg-[#f5f3ef] border border-[#c4c6cc] text-xs text-[#44474c] focus:bg-white focus:outline-none focus:border-[#7a582e]"
                              />
                            </td>

                            {/* Price */}
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={unit.price || ''}
                                placeholder="e.g. ₹38.5 L"
                                onChange={(e) =>
                                  handleUpdateUnitField(unit.id, 'price', e.target.value)
                                }
                                className="w-24 h-8 px-2 rounded bg-[#f5f3ef] border border-[#c4c6cc] text-xs text-[#7a582e] font-semibold focus:bg-white focus:outline-none focus:border-[#7a582e]"
                              />
                            </td>

                            {/* Status Quick Toggle */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateUnitStatus(unit.id, 'available')}
                                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${unit.status === 'available'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                                    }`}
                                  title="Mark as Available"
                                >
                                  Available
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateUnitStatus(unit.id, 'booked')}
                                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${unit.status === 'booked'
                                      ? 'bg-amber-600 text-white shadow-xs'
                                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                    }`}
                                  title="Mark as Under Booking"
                                >
                                  Booked
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateUnitStatus(unit.id, 'sold')}
                                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${unit.status === 'sold'
                                      ? 'bg-slate-700 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                                    }`}
                                  title="Mark as Handed Over / Sold"
                                >
                                  Sold
                                </button>
                              </div>
                            </td>

                            {/* Delete */}
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveUnitFromInventory(unit.id)}
                                className="p-1 rounded text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Remove this unit"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Add New Unit Row Card */}
              <div className="p-4 rounded-xl bg-[#f5f3ef] border border-[#e4e2de] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#081928]">
                  <span className="flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-[#7a582e]" />
                    <span>Add New Unit to this Project</span>
                  </span>
                  <span className="text-[11px] text-[#44474c] font-normal">
                    Quickly register an additional villa, duplex, or plot.
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#44474c] uppercase">Unit / Plot #</label>
                    <input
                      type="text"
                      value={newUnitForm.unitNumber}
                      onChange={(e) => setNewUnitForm({ ...newUnitForm, unitNumber: e.target.value })}
                      placeholder="e.g. Unit 4"
                      className="h-8 px-2 rounded bg-white border border-[#c4c6cc] text-xs text-[#081928]"
                    />
                  </div>

                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-[#44474c] uppercase">Type / Configuration</label>
                    <input
                      type="text"
                      value={newUnitForm.type}
                      onChange={(e) => setNewUnitForm({ ...newUnitForm, type: e.target.value })}
                      placeholder="2 BHK Row House"
                      className="h-8 px-2 rounded bg-white border border-[#c4c6cc] text-xs text-[#081928]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#44474c] uppercase">Size Area</label>
                    <input
                      type="text"
                      value={newUnitForm.size}
                      onChange={(e) => setNewUnitForm({ ...newUnitForm, size: e.target.value })}
                      placeholder="1,100 sq ft"
                      className="h-8 px-2 rounded bg-white border border-[#c4c6cc] text-xs text-[#081928]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#44474c] uppercase">Status</label>
                    <select
                      value={newUnitForm.status}
                      onChange={(e) => setNewUnitForm({ ...newUnitForm, status: e.target.value as any })}
                      className="h-8 px-2 rounded bg-white border border-[#c4c6cc] text-xs text-[#081928]"
                    >
                      <option value="available">Available</option>
                      <option value="booked">Booked</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 justify-end">
                    <button
                      type="button"
                      onClick={handleAddNewUnitToInventory}
                      className="h-8 px-3 rounded-lg bg-[#081928] hover:bg-[#1e2e3e] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#ecbe8b]" />
                      <span>+ Add Unit</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#f5f3ef] border-t border-[#e4e2de] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-[#44474c] text-center sm:text-left">
                Saving updates will instantly sync units across public website portfolio cards and detail modals.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUnitManagerProject(null)}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-[#efeeea] text-[#1b1c1a] border border-[#e4e2de] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveUnitManager}
                  className="px-5 py-2.5 rounded-lg bg-[#081928] hover:bg-[#1e2e3e] text-[#ecbe8b] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-colors"
                >
                  <Check className="w-4 h-4 text-[#ecbe8b]" />
                  <span>Save & Sync Units to Public Site</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </>
  );
};

// =========================================================================
// 5. SUPABASE & CLOUD DATABASE MODAL
// =========================================================================
export interface SupabaseDbModalProps {
  isDbModalOpen: boolean;
  setIsDbModalOpen: (isOpen: boolean) => void;
  supabaseStatus: {
    configured: boolean;
    url: string | null;
    projectRef?: string;
    storageBucketReady: boolean;
    tables: Record<string, boolean>;
  } | null;
  copiedSchema: boolean;
  dbPasswordInput: string;
  setDbPasswordInput: (pwd: string) => void;
  isMigrating: boolean;
  migrationResult: { success: boolean; message: string } | null;
  sqlSchemaText: string;
  handleCopySchema: () => void;
  handleRunMigration: (e: React.FormEvent) => void;
}

export const SupabaseDbModal: React.FC<SupabaseDbModalProps> = ({
  isDbModalOpen,
  setIsDbModalOpen,
  supabaseStatus,
  copiedSchema,
  dbPasswordInput,
  setDbPasswordInput,
  isMigrating,
  migrationResult,
  sqlSchemaText,
  handleCopySchema,
  handleRunMigration
}) => {
  return (
    <>
      {isDbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#fbf9f5] rounded-2xl shadow-2xl max-w-2xl w-full border border-[#e4e2de] flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#e4e2de] flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#081928] flex items-center justify-center text-[#ecbe8b]">
                  <Database className="w-5 h-5 text-[#ecbe8b]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#081928]">
                    Supabase Database & Cloud Storage
                  </h3>
                  <p className="text-xs text-[#55585d]">
                    Cloud Infrastructure Status & Schema Migration
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDbModalOpen(false)}
                className="p-2 text-[#44474c] hover:text-[#1b1c1a] rounded-lg hover:bg-[#f0eee9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#1b1c1a]">
              {/* Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-[#e4e2de] shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-[#7a582e]">
                      Supabase Cloud Project
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Connected
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-[#081928] truncate bg-[#f5f3ef] px-2 py-1 rounded">
                    {supabaseStatus?.url || 'https://ilqhkyrhpwhazyziedsv.supabase.co'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#e4e2de] shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-[#7a582e]">
                      Storage Bucket
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Ready
                    </span>
                  </div>
                  <div className="text-[11px] text-[#081928]">
                    Bucket: <code className="bg-[#f5f3ef] px-1.5 py-0.5 rounded font-mono font-bold">project-images</code>
                  </div>
                  <p className="text-[10px] text-[#717378] mt-1">
                    Multi-image photo elevations uploaded directly to Supabase CDN.
                  </p>
                </div>
              </div>

              {/* Direct Supabase Architecture */}
              <div className="p-4 rounded-xl bg-[#f0eee9] border border-[#e4e2de]">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-xs text-[#081928]">
                    100% Direct Supabase Cloud (Zero Local Temp Storage)
                  </span>
                </div>
                <p className="text-[#44474c] leading-relaxed">
                  All customer leads, project inventory units, and reviews are written and read directly from your Supabase PostgreSQL cloud database, and photos are stored on the Supabase CDN (<code className="font-mono text-[11px]">project-images</code> bucket). All local disk storage has been removed.
                </p>
              </div>

              {/* Auto Database Setup / Migration Runner */}
              <div className="p-4 rounded-xl bg-white border border-[#e4e2de] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#081928]">
                      Auto Database Setup (Create Tables via Postgres)
                    </h4>
                    <p className="text-[11px] text-[#55585d]">
                      Enter your Supabase database password to create tables & seed projects automatically:
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="password"
                    value={dbPasswordInput}
                    onChange={(e) => setDbPasswordInput(e.target.value)}
                    placeholder="Enter Supabase DB Password"
                    className="flex-1 h-9 px-3 rounded-lg bg-[#fbf9f5] border border-[#c4c6cc] text-xs text-[#081928] placeholder-[#717378]"
                  />
                  <button
                    type="button"
                    onClick={handleRunMigration}
                    disabled={isMigrating}
                    className="h-9 px-4 rounded-lg bg-[#081928] hover:bg-[#1a2d3f] text-[#ecbe8b] font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm transition-colors shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isMigrating ? 'Creating Tables...' : 'Run Auto Setup'}</span>
                  </button>
                </div>

                {migrationResult && (
                  <div
                    className={`p-2.5 rounded-lg text-[11px] font-medium ${migrationResult.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                  >
                    {migrationResult.message}
                  </div>
                )}
              </div>

              {/* Schema SQL One-Click Copy */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#081928]">
                    Supabase SQL Schema (<code className="font-mono">schema.sql</code>)
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://supabase.com/dashboard/project/${supabaseStatus?.projectRef || 'ilqhkyrhpwhazyziedsv'}/sql/new`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#efeeea] hover:bg-[#e4e2de] text-[#1b1c1a] font-semibold text-[11px] border border-[#d0ceca]"
                    >
                      <ExternalLink className="w-3 h-3 text-[#7a582e]" />
                      <span>Open Supabase SQL Editor</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopySchema}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#081928] hover:bg-[#1a2d3f] text-[#ecbe8b] font-bold text-xs cursor-pointer shadow-sm transition-colors"
                    >
                      {copiedSchema ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSchema ? 'Copied!' : 'Copy SQL'}</span>
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-[#55585d]">
                  You can also paste this script into your Supabase SQL Editor and click <strong>Run</strong> to create all tables and RLS policies:
                </p>
                <div className="bg-[#0c1824] text-amber-100/90 p-3 rounded-lg font-mono text-[11px] max-h-48 overflow-y-auto border border-[#1b2b3a]">
                  <pre className="whitespace-pre-wrap">{sqlSchemaText || '-- Loading schema.sql...'}</pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-[#e4e2de] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[#55585d]">
                Zero local storage • 100% Supabase CDN & Database
              </span>
              <button
                type="button"
                onClick={() => setIsDbModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#081928] text-white hover:bg-[#1a2d3f] text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

// =========================================================================
// 6. PROJECT STATUS MODAL (Sold Out, Handed Over, In Construction, Planning)
// =========================================================================
export interface ProjectStatusModalProps {
  statusModalProject: DashboardProject | null;
  onClose: () => void;
  onSaveStatus: (
    projectId: string,
    newStatusKey: string,
    options?: { markAllUnitsSold?: boolean; progress?: number; customLabel?: string }
  ) => Promise<void>;
  isUpdatingStatus: boolean;
}

export const ProjectStatusModal: React.FC<ProjectStatusModalProps> = ({
  statusModalProject,
  onClose,
  onSaveStatus,
  isUpdatingStatus,
}) => {
  const [selectedKey, setSelectedKey] = useState<string>('ongoing');
  const [markAllUnitsSold, setMarkAllUnitsSold] = useState<boolean>(true);
  const [progressVal, setProgressVal] = useState<number>(75);
  const [customLabel, setCustomLabel] = useState<string>('');

  useEffect(() => {
    if (statusModalProject) {
      const raw = (statusModalProject.rawStatus || statusModalProject.statusLabel || statusModalProject.status || '').toLowerCase();
      let initKey = 'ongoing';
      if (raw.includes('sold')) {
        initKey = 'sold_out';
      } else if (raw.includes('hand') || raw.includes('deliver')) {
        initKey = 'delivered';
      } else if (raw.includes('ready') || raw.includes('avail')) {
        initKey = 'available';
      } else if (raw.includes('plan') || raw.includes('pre-book')) {
        initKey = 'planning';
      } else {
        initKey = 'ongoing';
      }
      setSelectedKey(initKey);
      setMarkAllUnitsSold(initKey === 'sold_out');
      setProgressVal(
        typeof statusModalProject.progress === 'number'
          ? statusModalProject.progress
          : (initKey === 'sold_out' || initKey === 'delivered' || initKey === 'available' ? 100 : initKey === 'planning' ? 20 : 75)
      );
      const matchChoice = STATUS_CHOICES.find(c => c.key === initKey);
      setCustomLabel(statusModalProject.rawStatus || matchChoice?.title || 'Under Construction');
    }
  }, [statusModalProject]);

  if (!statusModalProject) return null;

  const STATUS_CHOICES = [
    {
      key: 'sold_out',
      title: 'Completed & Sold Out',
      tagline: '100% Sold Out • All Units Transferred to Owners',
      description: 'Project is fully constructed and every residential unit has been purchased. Features a high-visibility SOLD OUT badge on the public site.',
      colorBadge: 'bg-rose-900/90 text-rose-100 border border-rose-500/50',
      dotColor: 'bg-rose-500',
      defaultProgress: 100,
    },
    {
      key: 'delivered',
      title: 'Completed & Handed Over',
      tagline: 'Civil Handover Complete',
      description: 'Construction completed with quality clearance. Possession transferred to proud Amravati homeowners.',
      colorBadge: 'bg-[#081928] text-[#ecbe8b] border border-[#7a582e]/50',
      dotColor: 'bg-emerald-400',
      defaultProgress: 100,
    },
    {
      key: 'available',
      title: 'Ready to Move',
      tagline: 'Ready Possession Units Available',
      description: 'Construction is finished and ready for occupancy. Units are actively available for direct purchase.',
      colorBadge: 'bg-emerald-900/90 text-emerald-100 border border-emerald-500/50',
      dotColor: 'bg-emerald-400',
      defaultProgress: 100,
    },
    {
      key: 'ongoing',
      title: 'Under Construction',
      tagline: 'Active Civil Execution On-Site',
      description: 'RCC framing, masonry brickwork, plastering, or architectural finishes in active progress.',
      colorBadge: 'bg-amber-900/90 text-amber-100 border border-amber-400/50',
      dotColor: 'bg-amber-400',
      defaultProgress: 75,
    },
    {
      key: 'planning',
      title: 'Pre-Booking / In Planning',
      tagline: 'Sanctions Approved • Pre-Launch Open',
      description: 'Architectural drawings and local sanction approval finalized. Early booking slots open.',
      colorBadge: 'bg-blue-900/90 text-blue-100 border border-blue-400/50',
      dotColor: 'bg-blue-400',
      defaultProgress: 20,
    },
  ];

  const handleSelectKey = (key: string) => {
    setSelectedKey(key);
    const choice = STATUS_CHOICES.find((c) => c.key === key);
    if (choice) {
      setProgressVal(choice.defaultProgress);
      setCustomLabel(choice.title);
      if (key === 'sold_out') {
        setMarkAllUnitsSold(true);
      }
    }
  };

  const handleSave = async () => {
    await onSaveStatus(statusModalProject.id, selectedKey, {
      markAllUnitsSold,
      progress: progressVal,
      customLabel: customLabel.trim() || undefined,
    });
  };

  const currentChoice = STATUS_CHOICES.find((c) => c.key === selectedKey) || STATUS_CHOICES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5">
      <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-[#e4e2de] animate-fadeIn max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-start justify-between border-b border-[#e4e2de] bg-[#fbf9f5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#081928] text-[#ecbe8b] flex items-center justify-center shrink-0 shadow-sm">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#081928]">
                  Update Project Status
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5f3ef] border border-[#e4e2de] text-[#7a582e]">
                  Public Sync
                </span>
              </div>
              <p className="text-xs text-[#44474c] mt-0.5">
                {statusModalProject.title} • {statusModalProject.location}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#44474c] hover:bg-[#efeeea] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status Selection Cards */}
          <div>
            <label className="text-xs font-bold text-[#081928] block mb-2">
              Select Development Status *
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {STATUS_CHOICES.map((choice) => {
                const isSelected = selectedKey === choice.key;
                return (
                  <button
                    key={choice.key}
                    type="button"
                    onClick={() => handleSelectKey(choice.key)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-[#081928] bg-[#fbf9f5] ring-2 ring-[#081928]/20 shadow-sm'
                        : 'border-[#e4e2de] hover:border-[#c4c6cc] hover:bg-[#faf8f5]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center border ${
                        isSelected ? 'border-[#081928] bg-[#081928]' : 'border-[#c4c6cc] bg-white'
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#081928]">
                            {choice.title}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${choice.colorBadge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${choice.dotColor}`} />
                            {choice.key === 'sold_out' ? 'SOLD OUT' : choice.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#44474c] mt-0.5 leading-snug">
                          {choice.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sold Out Inventory Sync Option */}
          {selectedKey === 'sold_out' && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={markAllUnitsSold}
                  onChange={(e) => setMarkAllUnitsSold(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-rose-600 rounded border-gray-300 focus:ring-rose-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-rose-950 block">
                    Synchronize Real-Time Units to "Sold"
                  </span>
                  <span className="text-[11px] text-rose-800 leading-snug block">
                    Automatically marks all units in this project's inventory matrix as "Sold", so the public website accurately displays 0 available and all units transferred.
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* Construction Progress Slider */}
          <div className="p-3.5 rounded-xl bg-[#f5f3ef] border border-[#e4e2de] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#081928]">
              <span>Construction Progress Milestone</span>
              <span className="px-2 py-0.5 rounded bg-white border border-[#e4e2de] text-[#7a582e]">
                {progressVal}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progressVal}
              onChange={(e) => setProgressVal(Number(e.target.value))}
              className="w-full accent-[#081928] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#74777d]">
              <span>0% (Planning)</span>
              <span>50% (Slab / Brickwork)</span>
              <span>100% (Completed / Handed Over)</span>
            </div>
          </div>

          {/* Live Public Website Preview Strip */}
          <div className="p-3.5 rounded-xl bg-[#081928] text-white space-y-2 border border-[#1e2e3e]">
            <span className="text-[10px] uppercase font-bold text-[#ecbe8b] tracking-wider block">
              Live Preview: How Visitors See This on Homepage
            </span>
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-black/40 border border-white/10">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${currentChoice.colorBadge} text-[10px] font-bold tracking-wider uppercase`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${currentChoice.dotColor} animate-pulse`} />
                  {selectedKey === 'sold_out' ? '100% SOLD OUT' : currentChoice.title}
                </span>
                <span className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
                  {statusModalProject.title}
                </span>
              </div>
              <span className="text-[10px] text-white/80 shrink-0">
                {selectedKey === 'sold_out' ? 'All Units Sold' : `${statusModalProject.units}`}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#e4e2de] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdatingStatus}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#44474c] hover:bg-[#efeeea] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isUpdatingStatus}
            className="px-5 py-2.5 rounded-lg bg-[#081928] hover:bg-[#1a2d3f] text-[#ecbe8b] text-xs font-bold shadow flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isUpdatingStatus ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#ecbe8b] border-t-transparent rounded-full animate-spin" />
                <span>Updating Status & Cloud...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-[#ecbe8b]" />
                <span>Save Status & Publish Live</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


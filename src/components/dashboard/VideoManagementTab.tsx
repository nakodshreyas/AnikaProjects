import React, { useState, useEffect, useCallback } from 'react';
import {
  Youtube,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Play,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Film,
  Calendar,
  X
} from 'lucide-react';
import { ProjectVideo } from '../../types';
import { ClientSession } from '../../utils/auth';
import { VideoModal } from './VideoModal';
import { getYouTubeThumbnailUrl, getYouTubeEmbedUrl, getYouTubeShortsUrl, VIDEO_CATEGORIES } from '../../utils/youtube';

interface VideoManagementTabProps {
  session: ClientSession;
  showToast: (msg: string) => void;
}

export const VideoManagementTab: React.FC<VideoManagementTabProps> = ({
  session,
  showToast,
}) => {
  const [videos, setVideos] = useState<ProjectVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'featured'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<ProjectVideo | null>(null);
  const [previewVideo, setPreviewVideo] = useState<ProjectVideo | null>(null);

  // Load all videos (both published and drafts) using admin endpoint
  const loadVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/videos', {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.videos)) {
        setVideos(data.videos);
      } else {
        throw new Error(data.error || 'Failed to fetch videos from server.');
      }
    } catch (err: any) {
      console.error('[VideoManagementTab] Load error:', err);
      setError(err.message || 'Failed to connect to database.');
    } finally {
      setLoading(false);
    }
  }, [session.token]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // Notify public homepage to update live
  const broadcastUpdate = () => {
    try {
      window.dispatchEvent(new Event('anika_videos_updated'));
    } catch {}
  };

  // 1. Create or Update Video
  const handleSaveVideo = async (videoData: Partial<ProjectVideo> & { youtubeUrl?: string }) => {
    const isEdit = Boolean(editingVideo?.id);
    const url = isEdit ? `/api/admin/videos/${editingVideo!.id}` : '/api/admin/videos';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify(videoData),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to save video');
    }

    showToast(isEdit ? 'Video updated successfully!' : 'Video added to gallery!');
    await loadVideos();
    broadcastUpdate();
  };

  // 2. Toggle Published / Draft status
  const handleTogglePublish = async (video: ProjectVideo) => {
    const newStatus = !video.isPublished;

    // Optimistic UI update
    setVideos((prev) =>
      prev.map((v) => (v.id === video.id ? { ...v, isPublished: newStatus } : v))
    );

    try {
      const res = await fetch(`/api/admin/videos/${video.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ isPublished: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to toggle status');
      }

      showToast(newStatus ? `"${video.title}" is now published on the homepage.` : `"${video.title}" moved to draft (hidden from public).`);
      broadcastUpdate();
    } catch (err: any) {
      console.error('Toggle status error:', err);
      showToast(`Error: ${err.message}`);
      // Revert optimistic update
      loadVideos();
    }
  };

  // 3. Toggle Featured status
  const handleToggleFeatured = async (video: ProjectVideo) => {
    const newFeatured = !video.isFeatured;

    setVideos((prev) =>
      prev.map((v) => (v.id === video.id ? { ...v, isFeatured: newFeatured } : v))
    );

    try {
      const res = await fetch(`/api/admin/videos/${video.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ isFeatured: newFeatured }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update featured status');
      }

      showToast(newFeatured ? `"${video.title}" marked as featured.` : `Removed featured status from "${video.title}".`);
      broadcastUpdate();
    } catch (err: any) {
      console.error('Toggle featured error:', err);
      showToast(`Error: ${err.message}`);
      loadVideos();
    }
  };

  // 4. Delete Video with confirmation
  const handleDeleteVideo = async (video: ProjectVideo) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${video.title}" from your video gallery?`
    );
    if (!confirmed) return;

    // Optimistic remove
    setVideos((prev) => prev.filter((v) => v.id !== video.id));

    try {
      const res = await fetch(`/api/admin/videos/${video.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete video');
      }

      showToast(`Video "${video.title}" deleted.`);
      broadcastUpdate();
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast(`Delete failed: ${err.message}`);
      loadVideos();
    }
  };

  // 5. Reorder Videos (Move Up / Down)
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredVideos.length) return;

    const reordered = [...filteredVideos];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Update display orders sequentially
    const orderedIds = reordered.map((v) => v.id);

    // Optimistic update
    setVideos((prev) => {
      const mapOrder = new Map(orderedIds.map((id, idx) => [id, idx + 1]));
      return [...prev].sort((a, b) => (mapOrder.get(a.id) ?? a.displayOrder) - (mapOrder.get(b.id) ?? b.displayOrder));
    });

    try {
      const res = await fetch('/api/admin/videos/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ orderedIds }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update order');
      }

      showToast('Video order updated successfully.');
      broadcastUpdate();
      await loadVideos();
    } catch (err: any) {
      console.error('Reorder error:', err);
      showToast(`Reorder failed: ${err.message}`);
      loadVideos();
    }
  };

  // Filter and search computation
  const filteredVideos = videos.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      v.youtubeVideoId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && v.isPublished) ||
      (statusFilter === 'draft' && !v.isPublished) ||
      (statusFilter === 'featured' && v.isFeatured);

    const matchesCategory =
      categoryFilter === 'all' || v.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPublished = videos.filter((v) => v.isPublished).length;
  const totalDrafts = videos.filter((v) => !v.isPublished).length;
  const totalFeatured = videos.filter((v) => v.isFeatured).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#e4e2de] shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-red-600/10 text-red-600 flex items-center justify-center">
              <Youtube className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1b1c1a] flex items-center gap-2">
                <span>YouTube Reels & Shorts</span>
                <span className="px-2 py-0.5 rounded-full bg-red-600/10 text-red-600 text-[10px] font-bold border border-red-500/20">
                  9:16 Vertical
                </span>
              </h2>
              <p className="text-xs text-[#74777f]">
                Manage 9:16 vertical video reels displayed in the homepage &ldquo;Anika Projects on Video&rdquo; section.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadVideos}
            disabled={loading}
            className="p-2 text-[#44474c] hover:bg-[#efeeea] rounded-lg transition-colors cursor-pointer border border-[#e4e2de]"
            title="Refresh list from database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingVideo(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#081928] hover:bg-[#1e2e3e] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-brand-gold" />
            <span>Add YouTube Reel</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#e4e2de]">
          <span className="text-[11px] font-semibold text-[#74777f] uppercase">Total Videos</span>
          <p className="text-2xl font-bold text-[#1b1c1a] mt-1">{videos.length}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e4e2de]">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Published (Public)
          </span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{totalPublished}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e4e2de]">
          <span className="text-[11px] font-semibold text-amber-700 uppercase flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            Drafts (Hidden)
          </span>
          <p className="text-2xl font-bold text-amber-700 mt-1">{totalDrafts}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e4e2de]">
          <span className="text-[11px] font-semibold text-[#7a582e] uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#7a582e]" />
            Featured
          </span>
          <p className="text-2xl font-bold text-[#7a582e] mt-1">{totalFeatured}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#e4e2de] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#74777f] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, or YouTube ID..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[#d6d4cf] focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-lg border border-[#d6d4cf] bg-white text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-brand-gold/60"
          >
            <option value="all">All Statuses ({videos.length})</option>
            <option value="published">Published Only ({totalPublished})</option>
            <option value="draft">Drafts Only ({totalDrafts})</option>
            <option value="featured">Featured Only ({totalFeatured})</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-[#d6d4cf] bg-white text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-brand-gold/60"
          >
            <option value="all">All Categories</option>
            {VIDEO_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Videos List */}
      {loading && videos.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-[#e4e2de]">
          <RefreshCw className="w-8 h-8 text-brand-gold mx-auto mb-3 animate-spin" />
          <p className="text-sm font-semibold text-[#1b1c1a]">Loading video gallery from Supabase...</p>
        </div>
      ) : error ? (
        <div className="bg-white p-8 text-center rounded-xl border border-red-200">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadVideos}
            className="mt-3 px-4 py-1.5 bg-[#081928] text-white text-xs font-semibold rounded-lg"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-[#e4e2de] space-y-3">
          <Film className="w-12 h-12 text-[#9fa0a4] mx-auto" />
          <h3 className="font-bold text-base text-[#1b1c1a]">No Videos Found</h3>
          <p className="text-xs text-[#74777f] max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'No videos match the active search or filter criteria.'
              : 'Your YouTube video gallery is currently empty. Add your first project walkthrough to showcase on the homepage.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingVideo(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#081928] text-white text-xs font-bold rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4 text-brand-gold" />
            <span>Add First Video</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#e4e2de] overflow-hidden shadow-sm">
          <div className="divide-y divide-[#efeeea]">
            {filteredVideos.map((video, idx) => {
              const thumbUrl = getYouTubeThumbnailUrl(video.youtubeVideoId, 'hq');

              return (
                <div
                  key={video.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#faf9f5] transition-colors"
                >
                  {/* Left: Thumbnail & Reorder controls */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* Reorder Arrows */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveOrder(idx, 'up')}
                        title="Move Up"
                        className="p-1 text-[#74777f] hover:text-[#1b1c1a] hover:bg-[#efeeea] rounded disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === filteredVideos.length - 1}
                        onClick={() => handleMoveOrder(idx, 'down')}
                        title="Move Down"
                        className="p-1 text-[#74777f] hover:text-[#1b1c1a] hover:bg-[#efeeea] rounded disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Order Index Badge */}
                    <span className="w-6 text-center text-xs font-bold text-[#74777f] shrink-0">
                      #{video.displayOrder}
                    </span>

                    {/* 9:16 Vertical Reel Thumbnail with Click to Preview */}
                    <div
                      onClick={() => setPreviewVideo(video)}
                      className="relative w-16 sm:w-20 aspect-[9/16] rounded-xl overflow-hidden bg-black shrink-0 cursor-pointer group shadow-sm border border-black/10"
                      title="Click to preview reel player"
                    >
                      <img
                        src={thumbUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/15 flex items-center justify-center transition-colors">
                        <div className="w-6 h-6 rounded-full bg-white/90 text-black flex items-center justify-center shadow">
                          <Play className="w-3 h-3 fill-current translate-x-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-1 inset-x-1 py-0.5 rounded bg-black/60 text-[8px] font-bold text-center text-white">
                        9:16 Reel
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {video.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            Draft (Hidden)
                          </span>
                        )}

                        {video.isFeatured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-gold/20 text-[#7a582e] text-[10px] font-bold border border-brand-gold/30">
                            <Sparkles className="w-3 h-3 text-[#7a582e]" />
                            Featured
                          </span>
                        )}

                        {video.category && (
                          <span className="px-2 py-0.5 rounded bg-[#efeeea] text-[#44474c] text-[10px] font-medium">
                            {video.category}
                          </span>
                        )}
                      </div>

                      <h4 className="font-semibold text-sm text-[#1b1c1a] leading-snug">
                        {video.title}
                      </h4>

                      {video.description && (
                        <p className="text-xs text-[#74777f] line-clamp-1 mt-0.5 max-w-xl">
                          {video.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#74777f]">
                        <span className="font-mono text-[10px]">ID: {video.youtubeVideoId}</span>
                        <span>·</span>
                        <a
                          href={getYouTubeShortsUrl(video.youtubeVideoId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-red-600 inline-flex items-center gap-1 font-medium"
                        >
                          <Youtube className="w-3 h-3 text-red-600 fill-current" />
                          <span>Open Shorts</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#efeeea]">
                    {/* Toggle Featured Star */}
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(video)}
                      title={video.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                      className={`p-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                        video.isFeatured
                          ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                          : 'bg-white text-[#74777f] border-[#d6d4cf] hover:bg-gray-50'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>

                    {/* Toggle Publish / Draft Button */}
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(video)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        video.isPublished
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      {video.isPublished ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                          <span>Hidden (Draft)</span>
                        </>
                      )}
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingVideo(video);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-[#44474c] hover:bg-[#efeeea] rounded-lg transition-colors cursor-pointer border border-[#d6d4cf]"
                      title="Edit video details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(video)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-red-200"
                      title="Delete video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Video Modal */}
      <VideoModal
        isOpen={isModalOpen}
        video={editingVideo}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVideo(null);
        }}
        onSave={handleSaveVideo}
      />

      {/* 9:16 Vertical Smartphone Reel Preview Modal */}
      {previewVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn"
          onClick={() => setPreviewVideo(null)}
        >
          <div
            className="relative w-full max-w-[370px] sm:max-w-[390px] h-[82vh] max-h-[740px] aspect-[9/16] bg-black rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-white/20 sm:border-brand-gold/40 flex flex-col animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header overlay */}
            <div className="absolute top-0 inset-x-0 z-30 p-3.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white">
              <span className="text-xs font-semibold truncate pr-2">{previewVideo.title}</span>
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Vertical 9:16 player */}
            <div className="relative w-full h-full bg-black flex-1">
              <iframe
                src={getYouTubeEmbedUrl(previewVideo.youtubeVideoId, true)}
                title={previewVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

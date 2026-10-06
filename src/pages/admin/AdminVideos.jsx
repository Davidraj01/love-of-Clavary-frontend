import React, { useState, useEffect, useRef } from 'react';
import { api, getMediaUrl } from '../../services/api';
import { useSiteContent } from '../../context/SiteContentContext';
import { ROUTES } from '../../routes/routes';
import { 
  Upload, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  Check, 
  X, 
  Video as VideoIcon, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  FolderOpen,
  Smartphone,
  Globe,
  Sparkles,
  ExternalLink,
  Monitor,
  Tablet,
  Calendar,
  User,
  Film
} from 'lucide-react';

const PRESET_SERMON_VIDEOS = [
  {
    title: 'The Unconditional Grace of Calvary Cross',
    speaker: 'Pastor & Elders',
    category: 'Sermon',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail_url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80',
    description: 'An uplifting message on the transformative power of God’s steadfast love and redemption through Christ Jesus.'
  },
  {
    title: 'Walking in Supernatural Peace & Hope',
    speaker: 'Pastoral Team',
    category: 'Devotional',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80',
    description: 'Discover Biblical tranquility in times of life trials and anxiety based on Philippians 4:6-7.'
  },
  {
    title: 'Worship Night & Holy Spirit Revival',
    speaker: 'Worship Ministry Team',
    category: 'Worship',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    description: 'An intimate evening of praise, intercession, and glorifying the Lord with one heart and voice.'
  }
];

export const AdminVideos = () => {
  const { refreshContent } = useSiteContent();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [previewDevice, setPreviewDevice] = useState('desktop');

  // Video Player Preview Modal
  const [activePlayerVideo, setActivePlayerVideo] = useState(null);

  // Upload modal & source tab state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [videoSourceTab, setVideoSourceTab] = useState('url'); // 'url', 'local', 'mobile', 'presets'
  const [editingVideo, setEditingVideo] = useState(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    speaker: 'Pastor & Elders',
    date: new Date().toISOString().split('T')[0],
    category: 'Sermon',
    video_url: '',
    thumbnail_url: '',
    published: true,
  });
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [selectedThumbFile, setSelectedThumbFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const videoFileInputRef = useRef(null);
  const mobileVideoInputRef = useRef(null);
  const thumbFileInputRef = useRef(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminVideos();
      setVideos(data || []);
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to fetch videos from database.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleOpenAddModal = (source = 'url') => {
    setEditingVideo(null);
    setVideoSourceTab(source);
    setUploadData({
      title: '',
      description: '',
      speaker: 'Pastor & Elders',
      date: new Date().toISOString().split('T')[0],
      category: 'Sermon',
      video_url: '',
      thumbnail_url: '',
      published: true,
    });
    setSelectedVideoFile(null);
    setSelectedThumbFile(null);
    setIsUploadOpen(true);
  };

  const handleOpenEditModal = (vid) => {
    setEditingVideo(vid);
    setVideoSourceTab(vid.video_url ? 'url' : 'local');
    setUploadData({
      title: vid.title,
      description: vid.description || '',
      speaker: vid.speaker || 'Pastor & Elders',
      date: vid.date || new Date().toISOString().split('T')[0],
      category: vid.category || 'Sermon',
      video_url: vid.video_url || '',
      thumbnail_url: vid.thumbnail_url || '',
      published: vid.published ?? true,
    });
    setSelectedVideoFile(null);
    setSelectedThumbFile(null);
    setIsUploadOpen(true);
  };

  const handleSelectPreset = (preset) => {
    setUploadData(prev => ({
      ...prev,
      title: preset.title,
      speaker: preset.speaker,
      category: preset.category,
      video_url: preset.video_url,
      thumbnail_url: preset.thumbnail_url,
      description: preset.description,
    }));
    setFeedback({ type: 'success', text: `Loaded video preset: "${preset.title}". Click save to add.` });
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 200 * 1024 * 1024) {
        setFeedback({ type: 'error', text: 'Video file exceeds 200MB limit. Consider embedding YouTube/Cloud link for large videos.' });
        return;
      }
      setSelectedVideoFile(file);
      if (!uploadData.title) {
        setUploadData(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }));
      }
    }
  };

  const handleThumbFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedThumbFile(file);
    }
  };

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    setUploading(true);
    setFeedback({ type: '', text: '' });

    try {
      const formData = new FormData();
      Object.keys(uploadData).forEach((key) => {
        formData.append(key, uploadData[key]);
      });
      if (selectedVideoFile) {
        formData.append('video_file', selectedVideoFile);
      }
      if (selectedThumbFile) {
        formData.append('thumbnail_file', selectedThumbFile);
      }

      if (editingVideo) {
        await api.updateAdminVideo(editingVideo.id, formData);
        setFeedback({ type: 'success', text: `Video "${uploadData.title}" updated successfully!` });
      } else {
        await api.createAdminVideo(formData);
        setFeedback({ type: 'success', text: `Video "${uploadData.title}" published & added to ministry video library!` });
      }

      setIsUploadOpen(false);
      await fetchVideos();
      await refreshContent();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to upload/save video. Please verify inputs.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the video "${title}"?`)) return;
    try {
      await api.deleteAdminVideo(id);
      setFeedback({ type: 'success', text: `Video "${title}" deleted from database.` });
      await fetchVideos();
      await refreshContent();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to delete video.' });
    }
  };

  const categories = ['All', 'Sermon', 'Bible Teaching', 'Worship', 'Testimony', 'Devotional', 'Encouragement'];

  const filteredVideos = videos.filter(vid => {
    const matchesSearch = vid.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          vid.speaker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vid.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || vid.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Helper to format embed URLs
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const vidId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${vidId}`;
    }
    if (url.includes('youtu.be/')) {
      const vidId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${vidId}`;
    }
    if (url.includes('vimeo.com/')) {
      const vidId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${vidId}`;
    }
    return url;
  };

  return (
    <div className="admin-videos-page">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: 'var(--gold-dark)' }}>Video &amp; Sermon</span> Media Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Manage video messages, YouTube sermons, worship recordings, MP4 uploads, and Google Photos video links.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href={ROUTES.SERMONS}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-navy btn-sm"
            style={{ border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ExternalLink size={14} /> View Live Sermons Page
          </a>

          {/* Upload Dropdown / Buttons */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => handleOpenAddModal('url')}
              className="btn btn-navy btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Globe size={15} /> YouTube / Link
            </button>
            <button
              type="button"
              onClick={() => handleOpenAddModal('local')}
              className="btn btn-navy btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FolderOpen size={15} /> Upload MP4 File
            </button>
            <button
              type="button"
              onClick={() => handleOpenAddModal('mobile')}
              className="btn btn-gold btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Smartphone size={15} /> Mobile Capture
            </button>
          </div>
        </div>
      </div>

      {feedback.text && (
        <div className={`admin-alert-${feedback.type}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexGrow: 1, maxWidth: '400px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search videos by title, speaker, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-form-control"
              style={{ paddingLeft: '2.5rem', background: '#F8FAFC', color: '#0F172A', borderColor: '#CBD5E1' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="admin-form-control"
              style={{ width: 'auto', padding: '0.45rem 0.8rem', background: '#F8FAFC', color: '#0F172A', borderColor: '#CBD5E1', fontSize: '0.85rem' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Device Preview Switcher */}
          <div style={{ display: 'flex', gap: '0.25rem', background: '#F1F5F9', padding: '0.2rem', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              style={{
                border: 'none',
                background: previewDevice === 'desktop' ? '#FFFFFF' : 'transparent',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: previewDevice === 'desktop' ? 'var(--bg-dark)' : '#64748B'
              }}
            >
              <Monitor size={13} /> Grid
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('tablet')}
              style={{
                border: 'none',
                background: previewDevice === 'tablet' ? '#FFFFFF' : 'transparent',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: previewDevice === 'tablet' ? 'var(--bg-dark)' : '#64748B'
              }}
            >
              <Tablet size={13} /> Tablet
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              style={{
                border: 'none',
                background: previewDevice === 'mobile' ? '#FFFFFF' : 'transparent',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: previewDevice === 'mobile' ? 'var(--bg-dark)' : '#64748B'
              }}
            >
              <Smartphone size={13} /> Mobile
            </button>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212,175,55,0.3)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
          <p>Loading video library...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <Film size={48} color="#94A3B8" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#0F172A', marginBottom: '0.5rem' }}>No Videos Found</h3>
          <p style={{ color: '#64748B', maxWidth: '450px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
            No video messages match your current filter. You can embed YouTube/Vimeo links, upload MP4s, or choose from presets.
          </p>
          <button onClick={() => handleOpenAddModal('url')} className="btn btn-gold btn-sm">
            <Upload size={14} /> Add First Video
          </button>
        </div>
      ) : (
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: previewDevice === 'mobile' ? '1fr' : previewDevice === 'tablet' ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '1.5rem' 
          }}
        >
          {filteredVideos.map((vid) => (
            <div key={vid.id} className="admin-media-card">
              <div style={{ position: 'relative', height: '180px', background: '#0B192C' }}>
                <img
                  src={getMediaUrl(vid.effective_thumbnail) || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80'}
                  alt={vid.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setActivePlayerVideo(vid)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(212,175,55,0.9)',
                    border: 'none',
                    color: '#0B192C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                    transition: 'transform 0.2s ease',
                  }}
                  title="Play Video Preview"
                >
                  <Play size={20} fill="#0B192C" style={{ marginLeft: '2px' }} />
                </button>

                <span 
                  style={{ 
                    position: 'absolute', 
                    top: '0.6rem', 
                    left: '0.6rem', 
                    background: 'rgba(11,25,44,0.85)', 
                    color: 'var(--gold-primary)', 
                    padding: '0.2rem 0.55rem', 
                    borderRadius: '4px', 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  {vid.category}
                </span>
              </div>

              <div className="admin-media-body">
                <h4 style={{ fontSize: '1rem', color: '#0F172A', margin: '0 0 0.35rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {vid.title}
                </h4>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: '#64748B', marginBottom: '0.5rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <User size={12} /> {vid.speaker || 'Pastor'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} /> {vid.date || 'Recent'}
                  </span>
                </div>

                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.4em' }}>
                  {vid.description || 'No description added for this message.'}
                </p>
              </div>

              <div className="admin-media-actions">
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  {vid.published ? '🟢 Live' : '⚪ Draft'}
                </span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(vid)}
                    className="btn btn-outline-navy btn-sm"
                    style={{ padding: '0.3rem 0.55rem' }}
                    title="Edit Metadata"
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteVideo(vid.id, vid.title)}
                    className="btn btn-sm"
                    style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '0.3rem 0.55rem' }}
                    title="Delete Video"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {activePlayerVideo && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(11, 25, 44, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: '#0B192C',
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              position: 'relative',
              border: '1px solid rgba(212,175,55,0.3)',
            }}
          >
            <button
              onClick={() => setActivePlayerVideo(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                border: 'none',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#FFF',
                zIndex: 10,
              }}
            >
              <X size={18} />
            </button>

            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
              {activePlayerVideo.effective_video_url?.includes('youtube') || activePlayerVideo.effective_video_url?.includes('vimeo') ? (
                <iframe
                  src={getEmbedUrl(activePlayerVideo.effective_video_url)}
                  title={activePlayerVideo.title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={getMediaUrl(activePlayerVideo.effective_video_url)}
                  controls
                  autoPlay
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
              )}
            </div>

            <div style={{ padding: '1.5rem', color: '#FFFFFF' }}>
              <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0', color: 'var(--gold-primary)' }}>
                {activePlayerVideo.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>
                Speaker: {activePlayerVideo.speaker} | Category: {activePlayerVideo.category} | Date: {activePlayerVideo.date}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload & Multi-Source Modal */}
      {isUploadOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(11, 25, 44, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              padding: '2rem',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setIsUploadOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                border: 'none',
                background: '#F1F5F9',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.4rem', color: '#0B192C', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <VideoIcon size={22} color="var(--gold-dark)" />
              {editingVideo ? 'Edit Video Details' : 'Add Video to Ministry Library'}
            </h3>

            {/* Source Tabs */}
            {!editingVideo && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', background: '#F1F5F9', padding: '0.3rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setVideoSourceTab('url')}
                  style={{
                    border: 'none',
                    background: videoSourceTab === 'url' ? '#FFFFFF' : 'transparent',
                    boxShadow: videoSourceTab === 'url' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    padding: '0.5rem 0.25rem',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: videoSourceTab === 'url' ? '#0B192C' : '#64748B',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <Globe size={16} /> YouTube / Link
                </button>
                <button
                  type="button"
                  onClick={() => setVideoSourceTab('local')}
                  style={{
                    border: 'none',
                    background: videoSourceTab === 'local' ? '#FFFFFF' : 'transparent',
                    boxShadow: videoSourceTab === 'local' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    padding: '0.5rem 0.25rem',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: videoSourceTab === 'local' ? '#0B192C' : '#64748B',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <FolderOpen size={16} /> Upload MP4 File
                </button>
                <button
                  type="button"
                  onClick={() => setVideoSourceTab('mobile')}
                  style={{
                    border: 'none',
                    background: videoSourceTab === 'mobile' ? '#FFFFFF' : 'transparent',
                    boxShadow: videoSourceTab === 'mobile' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    padding: '0.5rem 0.25rem',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: videoSourceTab === 'mobile' ? '#0B192C' : '#64748B',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <Smartphone size={16} /> Mobile Video
                </button>
                <button
                  type="button"
                  onClick={() => setVideoSourceTab('presets')}
                  style={{
                    border: 'none',
                    background: videoSourceTab === 'presets' ? '#FFFFFF' : 'transparent',
                    boxShadow: videoSourceTab === 'presets' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    padding: '0.5rem 0.25rem',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: videoSourceTab === 'presets' ? '#0B192C' : '#64748B',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <Sparkles size={16} /> Sermon Presets
                </button>
              </div>
            )}

            <form onSubmit={handleSaveVideo}>
              {/* URL Input Tab */}
              {videoSourceTab === 'url' && (
                <div className="admin-form-group" style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
                  <label className="admin-form-label" style={{ color: '#334155' }}>
                    YouTube / Vimeo / Cloud Video URL *
                  </label>
                  <input
                    type="url"
                    value={uploadData.video_url}
                    onChange={(e) => setUploadData(prev => ({ ...prev, video_url: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=... or Google Photos video link"
                    className="admin-form-control"
                    style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem', display: 'block' }}>
                    Automatically embeds responsive high-performance players for visitors.
                  </span>
                </div>
              )}

              {/* Local MP4 Upload Tab */}
              {videoSourceTab === 'local' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <input
                    type="file"
                    ref={videoFileInputRef}
                    onChange={handleVideoFileChange}
                    accept="video/mp4,video/webm,video/ogg"
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => videoFileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #CBD5E1',
                      borderRadius: '12px',
                      padding: '2rem 1.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: selectedVideoFile ? '#F0FDF4' : '#F8FAFC',
                      borderColor: selectedVideoFile ? '#22C55E' : '#CBD5E1',
                    }}
                  >
                    <FolderOpen size={32} color={selectedVideoFile ? '#16A34A' : 'var(--gold-dark)'} style={{ margin: '0 auto 0.75rem auto' }} />
                    <p style={{ fontWeight: 600, color: '#1E293B', marginBottom: '0.25rem' }}>
                      {selectedVideoFile ? `Selected: ${selectedVideoFile.name}` : 'Choose an MP4 / WebM video from your device'}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Supports MP4, WebM (Max 200MB)
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile Direct Video Tab */}
              {videoSourceTab === 'mobile' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <input
                    type="file"
                    ref={mobileVideoInputRef}
                    onChange={handleVideoFileChange}
                    accept="video/*"
                    capture="camcorder"
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => mobileVideoInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--gold-primary)',
                      borderRadius: '12px',
                      padding: '2rem 1.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: selectedVideoFile ? '#F0FDF4' : '#FFFBEB',
                    }}
                  >
                    <Smartphone size={36} color="var(--gold-dark)" style={{ margin: '0 auto 0.75rem auto' }} />
                    <p style={{ fontWeight: 700, color: '#0B192C', marginBottom: '0.25rem' }}>
                      {selectedVideoFile ? `Captured: ${selectedVideoFile.name}` : 'Tap to Record Video on Mobile or Select Gallery Video'}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#78350F' }}>
                      Direct smartphone video recording or mobile gallery upload
                    </span>
                  </div>
                </div>
              )}

              {/* Sermon Presets Tab */}
              {videoSourceTab === 'presets' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem', fontWeight: 600 }}>
                    Select curated sermon message preset:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {PRESET_SERMON_VIDEOS.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectPreset(preset)}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: uploadData.title === preset.title ? '2px solid var(--gold-primary)' : '1px solid #E2E8F0',
                          background: uploadData.title === preset.title ? '#FFFBEB' : '#F8FAFC',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0F172A' }}>{preset.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{preset.speaker} · {preset.category}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Information Fields */}
              <div className="admin-form-group">
                <label className="admin-form-label" style={{ color: '#334155' }}>Video Title *</label>
                <input
                  type="text"
                  required
                  value={uploadData.title}
                  onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Sunday Celebration Service: The Calvary Promise"
                  className="admin-form-control"
                  style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ color: '#334155' }}>Speaker / Minister</label>
                  <input
                    type="text"
                    value={uploadData.speaker}
                    onChange={(e) => setUploadData(prev => ({ ...prev, speaker: e.target.value }))}
                    className="admin-form-control"
                    style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ color: '#334155' }}>Category</label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))}
                    className="admin-form-control"
                    style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                  >
                    <option value="Sermon">Sermon</option>
                    <option value="Bible Teaching">Bible Teaching</option>
                    <option value="Worship">Worship</option>
                    <option value="Testimony">Testimony</option>
                    <option value="Devotional">Devotional</option>
                    <option value="Encouragement">Encouragement</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ color: '#334155' }}>Date Recorded</label>
                  <input
                    type="date"
                    value={uploadData.date}
                    onChange={(e) => setUploadData(prev => ({ ...prev, date: e.target.value }))}
                    className="admin-form-control"
                    style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ color: '#334155' }}>Thumbnail Image URL</label>
                  <input
                    type="text"
                    value={uploadData.thumbnail_url}
                    onChange={(e) => setUploadData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                    placeholder="https://... image link"
                    className="admin-form-control"
                    style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" style={{ color: '#334155' }}>Description</label>
                <textarea
                  rows={2}
                  value={uploadData.description}
                  onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Summary of this sermon or video teaching..."
                  className="admin-form-control"
                  style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={uploadData.published}
                    onChange={(e) => setUploadData(prev => ({ ...prev, published: e.target.checked }))}
                    style={{ accentColor: 'var(--gold-primary)' }}
                  />
                  Published &amp; Visible to Website Visitors
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="btn btn-outline-navy btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn btn-gold btn-sm"
                >
                  {uploading ? 'Saving Video...' : editingVideo ? 'Save Changes' : 'Upload & Add Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

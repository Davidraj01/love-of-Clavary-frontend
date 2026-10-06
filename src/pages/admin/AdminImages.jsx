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
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle,
  Folder,
  Smartphone,
  FolderOpen,
  Camera,
  Globe,
  Sparkles,
  Eye,
  ExternalLink,
  Layers,
  Monitor,
  Tablet
} from 'lucide-react';

const PRESET_GALLERY_IMAGES = [
  {
    title: 'Sacred Bible & Communion Cross',
    category: 'gallery',
    folder: 'Worship',
    url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80',
    alt: 'Holy Bible and Christian Cross'
  },
  {
    title: 'Church Worship Fellowship Hands',
    category: 'ministry',
    folder: 'Fellowship',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    alt: 'Congregation worship and praise'
  },
  {
    title: 'Prayer Altar Candle & Scripture',
    category: 'gallery',
    folder: 'Prayer',
    url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80',
    alt: 'Candlelight prayer altar'
  },
  {
    title: 'Youth & Children Ministry Joy',
    category: 'ministry',
    folder: 'Youth',
    url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    alt: 'Children smile ministry outreach'
  },
  {
    title: 'Community Compassion Outreach Food Drive',
    category: 'outreach',
    folder: 'Outreach',
    url: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80',
    alt: 'Helping hands community service'
  },
  {
    title: 'Calvary Cross Sunset Horizon',
    category: 'hero',
    folder: 'General',
    url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80',
    alt: 'Cross at sunset landscape'
  }
];

export const AdminImages = () => {
  const { refreshContent } = useSiteContent();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [folderFilter, setFolderFilter] = useState('All');
  const [previewDevice, setPreviewDevice] = useState('desktop');
  
  // Upload modal & source tab state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadSourceTab, setUploadSourceTab] = useState('local'); // 'local', 'mobile', 'googlephotos', 'presets'
  const [editingImage, setEditingImage] = useState(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: 'gallery',
    folder: 'General',
    alt_text: 'Compassionate Love of Calvary Ministries',
    external_url: '',
    is_homepage: false,
    is_ministry: false,
    is_event: false,
    is_sermon_thumb: false,
    published: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  
  const fileInputRef = useRef(null);
  const mobileCameraRef = useRef(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminImages();
      setImages(data || []);
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to fetch images from database.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setFeedback({ type: 'error', text: 'Invalid format. Please select a JPG, PNG, or WEBP image.' });
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setFeedback({ type: 'error', text: 'File size exceeds 15MB limit.' });
        return;
      }
      setSelectedFile(file);
      if (!uploadData.title) {
        setUploadData(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }));
      }
    }
  };

  const handleOpenAddModal = (source = 'local') => {
    setEditingImage(null);
    setUploadSourceTab(source);
    setUploadData({
      title: '',
      description: '',
      category: 'gallery',
      folder: 'General',
      alt_text: 'Compassionate Love of Calvary Ministries',
      external_url: '',
      is_homepage: false,
      is_ministry: false,
      is_event: false,
      is_sermon_thumb: false,
      published: true,
    });
    setSelectedFile(null);
    setIsUploadOpen(true);
  };

  const handleOpenEditModal = (img) => {
    setEditingImage(img);
    setUploadSourceTab('local');
    setUploadData({
      title: img.title,
      description: img.description || '',
      category: img.category || 'gallery',
      folder: img.folder || 'General',
      alt_text: img.alt_text || 'Compassionate Love of Calvary Ministries',
      external_url: img.external_url || '',
      is_homepage: img.is_homepage || false,
      is_ministry: img.is_ministry || false,
      is_event: img.is_event || false,
      is_sermon_thumb: img.is_sermon_thumb || false,
      published: img.published ?? true,
    });
    setSelectedFile(null);
    setIsUploadOpen(true);
  };

  const handleSelectPreset = (preset) => {
    setUploadData(prev => ({
      ...prev,
      title: preset.title,
      category: preset.category,
      folder: preset.folder,
      alt_text: preset.alt,
      external_url: preset.url,
    }));
    setFeedback({ type: 'success', text: `Loaded preset: "${preset.title}". Click save to add to gallery.` });
  };

  const handleSaveImage = async (e) => {
    e.preventDefault();
    setUploading(true);
    setFeedback({ type: '', text: '' });

    try {
      const formData = new FormData();
      Object.keys(uploadData).forEach((key) => {
        formData.append(key, uploadData[key]);
      });
      if (selectedFile) {
        formData.append('image_file', selectedFile);
      }

      if (editingImage) {
        await api.updateAdminImage(editingImage.id, formData);
        setFeedback({ type: 'success', text: `Image "${uploadData.title}" updated successfully!` });
      } else {
        await api.uploadAdminImage(formData);
        setFeedback({ type: 'success', text: `Image "${uploadData.title}" uploaded & added to gallery!` });
      }

      setIsUploadOpen(false);
      await fetchImages();
      await refreshContent();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to upload/save image. Please verify inputs.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the image "${title}"?`)) return;
    try {
      await api.deleteAdminImage(id);
      setFeedback({ type: 'success', text: `Image "${title}" deleted from database.` });
      await fetchImages();
      await refreshContent();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to delete image.' });
    }
  };

  // Folders and categories
  const categories = ['All', 'hero', 'welcome', 'ministry', 'event', 'sermon', 'gallery', 'outreach'];
  const folders = ['All', ...new Set(images.map(img => img.folder || 'General'))];

  const filteredImages = images.filter(img => {
    const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          img.alt_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          img.folder?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || img.category === categoryFilter;
    const matchesFolder = folderFilter === 'All' || (img.folder || 'General') === folderFilter;
    return matchesSearch && matchesCategory && matchesFolder;
  });

  return (
    <div className="admin-images-page">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: 'var(--gold-dark)' }}>Image Gallery</span> &amp; Media Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Upload, organize, edit, and delete ministry photos from Local Folders, Mobile Camera, Google Photos, or Presets.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href={ROUTES.MEDIA}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-navy btn-sm"
            style={{ border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ExternalLink size={14} /> View Live Media Page
          </a>

          {/* Upload Dropdown / Buttons */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => handleOpenAddModal('local')}
              className="btn btn-navy btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FolderOpen size={15} /> Upload Folder / File
            </button>
            <button
              type="button"
              onClick={() => handleOpenAddModal('mobile')}
              className="btn btn-navy btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Smartphone size={15} /> Mobile / Camera
            </button>
            <button
              type="button"
              onClick={() => handleOpenAddModal('googlephotos')}
              className="btn btn-gold btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Globe size={15} /> Google Photos / Link
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
              placeholder="Search images by title, folder, or alt text..."
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
                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Folder:</span>
            <select
              value={folderFilter}
              onChange={(e) => setFolderFilter(e.target.value)}
              className="admin-form-control"
              style={{ width: 'auto', padding: '0.45rem 0.8rem', background: '#F8FAFC', color: '#0F172A', borderColor: '#CBD5E1', fontSize: '0.85rem' }}
            >
              {folders.map(fol => (
                <option key={fol} value={fol}>{fol}</option>
              ))}
            </select>
          </div>

          {/* Device Preview Switcher for testing cards */}
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

      {/* Images Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212,175,55,0.3)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
          <p>Loading image assets...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <ImageIcon size={48} color="#94A3B8" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#0F172A', marginBottom: '0.5rem' }}>No Images Found</h3>
          <p style={{ color: '#64748B', maxWidth: '450px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
            No images match your search or filter. You can upload new files from local storage, mobile, Google Photos, or curated presets.
          </p>
          <button onClick={() => handleOpenAddModal('local')} className="btn btn-gold btn-sm">
            <Upload size={14} /> Upload First Image
          </button>
        </div>
      ) : (
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: previewDevice === 'mobile' ? '1fr' : previewDevice === 'tablet' ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '1.5rem' 
          }}
        >
          {filteredImages.map((img) => (
            <div key={img.id} className="admin-media-card">
              <div style={{ position: 'relative', height: '180px', background: '#0B192C' }}>
                <img
                  src={getMediaUrl(img.url) || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80'}
                  alt={img.alt_text || img.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <span 
                  style={{ 
                    position: 'absolute', 
                    top: '0.6rem', 
                    left: '0.6rem', 
                    background: 'rgba(11,25,44,0.85)', 
                    color: '#FFFFFF', 
                    padding: '0.2rem 0.55rem', 
                    borderRadius: '4px', 
                    fontSize: '0.7rem', 
                    fontWeight: 600, 
                    textTransform: 'uppercase',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  {img.category}
                </span>
                <span 
                  style={{ 
                    position: 'absolute', 
                    top: '0.6rem', 
                    right: '0.6rem', 
                    background: 'rgba(212,175,55,0.9)', 
                    color: '#0B192C', 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.7rem', 
                    fontWeight: 700 
                  }}
                >
                  {img.folder || 'General'}
                </span>
              </div>

              <div className="admin-media-body">
                <h4 style={{ fontSize: '1rem', color: '#0F172A', margin: '0 0 0.35rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {img.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 0.75rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.4em' }}>
                  {img.description || img.alt_text || 'No description added.'}
                </p>

                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {img.is_homepage && <span style={{ fontSize: '0.65rem', background: '#E0E7FF', color: '#3730A3', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>Homepage</span>}
                  {img.is_ministry && <span style={{ fontSize: '0.65rem', background: '#DCFCE7', color: '#166534', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>Ministry</span>}
                  {img.is_event && <span style={{ fontSize: '0.65rem', background: '#FEF3C7', color: '#92400E', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>Event</span>}
                </div>
              </div>

              <div className="admin-media-actions">
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  {img.published ? '🟢 Live' : '⚪ Draft'}
                </span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(img)}
                    className="btn btn-outline-navy btn-sm"
                    style={{ padding: '0.3rem 0.55rem' }}
                    title="Edit Metadata"
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id, img.title)}
                    className="btn btn-sm"
                    style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '0.3rem 0.55rem' }}
                    title="Delete Image"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
              <ImageIcon size={22} color="var(--gold-dark)" />
              {editingImage ? 'Edit Image Information' : 'Add Image to Ministry Portal'}
            </h3>

            {/* Source Tabs */}
            {!editingImage && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', background: '#F1F5F9', padding: '0.3rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setUploadSourceTab('local')}
                  style={{
                    border: 'none',
                    background: uploadSourceTab === 'local' ? '#FFFFFF' : 'transparent',
                    boxShadow: uploadSourceTab === 'local' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    padding: '0.5rem 0.25rem',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: uploadSourceTab === 'local' ? '#0B192C' : '#64748B',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <FolderOpen size={16} /> Local / Folder
                </button>
                <button
                  type="button"
                  onClick={() => setUploadSourceTab('mobile')}
                  style={{
                    border: 'none',
                    background: uploadSourceTab === 'mobile' ? '#FFFFFF' : 'transparent',
                    boxShadow: uploadSourceTab === 'mobile' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    padding: '0.5rem 0.25rem',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: uploadSourceTab === 'mobile' ? '#0B192C' : '#64748B',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <Camera size={16} /> Mobile / Camera
                </button>
                <button
                  type="button"
                  onClick={() => setUploadSourceTab('googlephotos')}
                  style={{
                    border: 'none',
                    background: uploadSourceTab === 'googlephotos' ? '#FFFFFF' : 'transparent',
                    boxShadow: uploadSourceTab === 'googlephotos' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    padding: '0.5rem 0.25rem',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: uploadSourceTab === 'googlephotos' ? '#0B192C' : '#64748B',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <Globe size={16} /> Google Photos / URL
                </button>
                <button
                  type="button"
                  onClick={() => setUploadSourceTab('presets')}
                  style={{
                    border: 'none',
                    background: uploadSourceTab === 'presets' ? '#FFFFFF' : 'transparent',
                    boxShadow: uploadSourceTab === 'presets' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    padding: '0.5rem 0.25rem',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: uploadSourceTab === 'presets' ? '#0B192C' : '#64748B',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <Sparkles size={16} /> Church Presets
                </button>
              </div>
            )}

            <form onSubmit={handleSaveImage}>
              {/* Local Folder / File Drop Zone */}
              {uploadSourceTab === 'local' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #CBD5E1',
                      borderRadius: '12px',
                      padding: '2rem 1.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: selectedFile ? '#F0FDF4' : '#F8FAFC',
                      borderColor: selectedFile ? '#22C55E' : '#CBD5E1',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <FolderOpen size={32} color={selectedFile ? '#16A34A' : 'var(--gold-dark)'} style={{ margin: '0 auto 0.75rem auto' }} />
                    <p style={{ fontWeight: 600, color: '#1E293B', marginBottom: '0.25rem' }}>
                      {selectedFile ? `Selected: ${selectedFile.name}` : 'Choose an image or select from your computer / folder'}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Supports JPG, PNG, WEBP (Max 15MB)
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile / Direct Camera Capture */}
              {uploadSourceTab === 'mobile' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <input
                    type="file"
                    ref={mobileCameraRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => mobileCameraRef.current?.click()}
                    style={{
                      border: '2px dashed var(--gold-primary)',
                      borderRadius: '12px',
                      padding: '2rem 1.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: selectedFile ? '#F0FDF4' : '#FFFBEB',
                    }}
                  >
                    <Camera size={36} color="var(--gold-dark)" style={{ margin: '0 auto 0.75rem auto' }} />
                    <p style={{ fontWeight: 700, color: '#0B192C', marginBottom: '0.25rem' }}>
                      {selectedFile ? `Captured: ${selectedFile.name}` : 'Tap to Open Mobile Camera or Photo Gallery'}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#78350F' }}>
                      Direct mobile camera capture or select from smartphone photos
                    </span>
                  </div>
                </div>
              )}

              {/* Google Photos & External Link Tab */}
              {uploadSourceTab === 'googlephotos' && (
                <div style={{ marginBottom: '1.5rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <label className="admin-form-label" style={{ color: '#334155' }}>
                    Google Photos / Direct Image URL
                  </label>
                  <input
                    type="url"
                    value={uploadData.external_url}
                    onChange={(e) => setUploadData(prev => ({ ...prev, external_url: e.target.value }))}
                    placeholder="https://lh3.googleusercontent.com/... or https://images.unsplash.com/..."
                    className="admin-form-control"
                    style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1', marginBottom: '0.5rem' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Paste direct share link from Google Photos, Google Drive, Unsplash, or CDN.
                  </span>
                  {uploadData.external_url && (
                    <div style={{ marginTop: '0.75rem', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                      <img src={uploadData.external_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              )}

              {/* Church Presets Picker */}
              {uploadSourceTab === 'presets' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem', fontWeight: 600 }}>
                    Select high-resolution curated church photography:
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem', background: '#F8FAFC', borderRadius: '8px' }}>
                    {PRESET_GALLERY_IMAGES.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectPreset(preset)}
                        style={{
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: uploadData.external_url === preset.url ? '2px solid var(--gold-primary)' : '1px solid #CBD5E1',
                          cursor: 'pointer',
                          position: 'relative',
                          height: '70px',
                        }}
                      >
                        <img src={preset.url} alt={preset.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#FFF', fontSize: '0.65rem', padding: '2px 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {preset.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata Fields */}
              <div className="admin-form-group">
                <label className="admin-form-label" style={{ color: '#334155' }}>Image Title *</label>
                <input
                  type="text"
                  required
                  value={uploadData.title}
                  onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Sunday Morning Worship Gathering"
                  className="admin-form-control"
                  style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ color: '#334155' }}>Category</label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))}
                    className="admin-form-control"
                    style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                  >
                    <option value="hero">Hero Section</option>
                    <option value="welcome">Welcome Section</option>
                    <option value="ministry">Ministry</option>
                    <option value="event">Event</option>
                    <option value="sermon">Sermon Thumbnail</option>
                    <option value="gallery">Media Gallery</option>
                    <option value="outreach">Community Outreach</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ color: '#334155' }}>Folder</label>
                  <input
                    type="text"
                    value={uploadData.folder}
                    onChange={(e) => setUploadData(prev => ({ ...prev, folder: e.target.value }))}
                    placeholder="General, Worship, Youth, Prayer..."
                    className="admin-form-control"
                    style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" style={{ color: '#334155' }}>Alt Text (SEO &amp; Accessibility)</label>
                <input
                  type="text"
                  value={uploadData.alt_text}
                  onChange={(e) => setUploadData(prev => ({ ...prev, alt_text: e.target.value }))}
                  className="admin-form-control"
                  style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" style={{ color: '#334155' }}>Description</label>
                <textarea
                  rows={2}
                  value={uploadData.description}
                  onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional details about this image..."
                  className="admin-form-control"
                  style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                />
              </div>

              {/* Tags & Flags */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={uploadData.published}
                    onChange={(e) => setUploadData(prev => ({ ...prev, published: e.target.checked }))}
                    style={{ accentColor: 'var(--gold-primary)' }}
                  />
                  Published &amp; Active
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={uploadData.is_homepage}
                    onChange={(e) => setUploadData(prev => ({ ...prev, is_homepage: e.target.checked }))}
                    style={{ accentColor: 'var(--gold-primary)' }}
                  />
                  Show on Homepage
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={uploadData.is_ministry}
                    onChange={(e) => setUploadData(prev => ({ ...prev, is_ministry: e.target.checked }))}
                    style={{ accentColor: 'var(--gold-primary)' }}
                  />
                  Ministry Page
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
                  {uploading ? 'Saving Image...' : editingImage ? 'Save Changes' : 'Upload & Add Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

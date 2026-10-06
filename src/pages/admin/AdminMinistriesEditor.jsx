import React, { useState, useEffect, useRef } from 'react';
import { api, getMediaUrl } from '../../services/api';
import { useSiteContent } from '../../context/SiteContentContext';
import { ROUTES } from '../../routes/routes';
import { FontTypographyControls, ensureGoogleFontsLoaded } from '../../components/FontTypographyControls';
import { 
  Save, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Heart, 
  Eye, 
  RefreshCw, 
  Clock, 
  X,
  Music,
  Users,
  BookOpen,
  Flame,
  Smile,
  HandHeart,
  Upload,
  Image as ImageIcon,
  FolderOpen,
  Globe,
  Camera
} from 'lucide-react';

const ICON_OPTIONS = [
  'Heart', 'Music', 'HandHeart', 'HandsHelping', 'Sparkles', 'Smile', 'HeartHandshake', 'Users', 'BookOpen', 'Flame'
];

export const AdminMinistriesEditor = () => {
  const { refreshContent } = useSiteContent();
  const [headerData, setHeaderData] = useState({
    header_badge: 'Serving with Christ-Like Compassion',
    header_title: 'Ministries That Serve With Love',
    header_description: 'Each ministry at Compassionate Love of Calvary is designed to help you encounter God, build spiritual depth, and put faith into loving service.',
    heading_font: 'Cormorant Garamond',
    body_font: 'Inter',
    heading_size: 'normal',
    body_size: 'normal',
    font_weight: '600',
    line_height: '1.6',
    letter_spacing: 'normal',
    accent_color: '#D4AF37',
    primary_color: '#0B192C',
  });

  const [ministries, setMinistries] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingHeader, setSavingHeader] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [previewDevice, setPreviewDevice] = useState('desktop');

  // Ministry Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState(null);
  const [imageTab, setImageTab] = useState('upload'); // 'upload', 'gallery', 'url'
  const [modalForm, setModalForm] = useState({
    title: '',
    slug: '',
    summary: '',
    description: '',
    icon_name: 'Heart',
    image_url: '',
    meeting_time: '',
    order: 0,
    is_featured: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [modalSaving, setModalSaving] = useState(false);

  const fileInputRef = useRef(null);
  const mobileInputRef = useRef(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [headerRes, minRes, imgRes] = await Promise.all([
        api.getAdminMinistriesPageContent(),
        api.getAdminMinistries(),
        api.getAdminImages().catch(() => [])
      ]);
      if (headerRes && Object.keys(headerRes).length > 0) {
        setHeaderData((prev) => ({ ...prev, ...headerRes }));
        ensureGoogleFontsLoaded([headerRes.heading_font, headerRes.body_font]);
      }
      setMinistries(minRes || []);
      setGalleryImages(imgRes || []);
    } catch (err) {
      console.error('Failed to load ministries editor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleHeaderChange = (field, value) => {
    setHeaderData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveHeader = async (e) => {
    if (e) e.preventDefault();
    setSavingHeader(true);
    setFeedback({ type: '', text: '' });

    try {
      await api.updateAdminMinistriesPageContent(headerData);
      await refreshContent();
      setFeedback({ type: 'success', text: 'Ministries header & typography successfully saved!' });
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to save header settings.' });
    } finally {
      setSavingHeader(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingMinistry(null);
    setImageTab('upload');
    setModalForm({
      title: '',
      slug: '',
      summary: '',
      description: '',
      icon_name: 'Heart',
      image_url: '',
      meeting_time: '',
      order: ministries.length + 1,
      is_featured: true,
    });
    setSelectedFile(null);
    setFilePreview('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (min) => {
    setEditingMinistry(min);
    setImageTab(min.image_url ? 'url' : 'upload');
    setModalForm({
      title: min.title,
      slug: min.slug,
      summary: min.summary,
      description: min.description,
      icon_name: min.icon_name || 'Heart',
      image_url: min.image_url || '',
      meeting_time: min.meeting_time || '',
      order: min.order || 0,
      is_featured: min.is_featured ?? true,
    });
    setSelectedFile(null);
    setFilePreview(min.image_url ? getMediaUrl(min.image_url) : '');
    setIsModalOpen(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setFilePreview(objectUrl);
      setModalForm((prev) => ({ ...prev, image_url: '' }));
    }
  };

  const handleSelectFromGallery = (galleryImg) => {
    const url = galleryImg.url || galleryImg.external_url;
    setModalForm((prev) => ({ ...prev, image_url: url }));
    setSelectedFile(null);
    setFilePreview(getMediaUrl(url));
    setFeedback({ type: 'success', text: `Selected image "${galleryImg.title}" from gallery!` });
  };

  const handleSaveMinistry = async (e) => {
    e.preventDefault();
    setModalSaving(true);
    setFeedback({ type: '', text: '' });

    try {
      const generatedSlug = modalForm.slug || modalForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const formData = new FormData();
      formData.append('title', modalForm.title);
      formData.append('slug', generatedSlug);
      formData.append('summary', modalForm.summary);
      formData.append('description', modalForm.description || '');
      formData.append('icon_name', modalForm.icon_name || 'Heart');
      formData.append('meeting_time', modalForm.meeting_time || '');
      formData.append('order', modalForm.order || 0);
      formData.append('is_featured', modalForm.is_featured);

      if (selectedFile) {
        formData.append('image_file', selectedFile);
      } else {
        formData.append('image_url', modalForm.image_url || '');
      }

      if (editingMinistry) {
        await api.updateAdminMinistry(editingMinistry.id, formData);
        setFeedback({ type: 'success', text: `Ministry "${modalForm.title}" updated successfully!` });
      } else {
        await api.createAdminMinistry(formData);
        setFeedback({ type: 'success', text: `Ministry "${modalForm.title}" added successfully!` });
      }

      setIsModalOpen(false);
      await fetchAllData();
      await refreshContent();
    } catch (err) {
      console.error('Save error:', err);
      setFeedback({ type: 'error', text: 'Failed to save ministry details. Please check all fields.' });
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteMinistry = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the "${title}" ministry?`)) return;
    try {
      await api.deleteAdminMinistry(id);
      setFeedback({ type: 'success', text: `Ministry "${title}" deleted.` });
      await fetchAllData();
      await refreshContent();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to delete ministry.' });
    }
  };

  const renderIcon = (name) => {
    switch (name) {
      case 'Music': return <Music size={18} />;
      case 'HandsHelping': return <HandHeart size={18} />;
      case 'HandHeart': return <HandHeart size={18} />;
      case 'Sparkles': return <Sparkles size={18} />;
      case 'Smile': return <Smile size={18} />;
      case 'Users': return <Users size={18} />;
      case 'BookOpen': return <BookOpen size={18} />;
      case 'Flame': return <Flame size={18} />;
      default: return <Heart size={18} />;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212,175,55,0.3)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
        <p>Loading Ministries Page Editor...</p>
      </div>
    );
  }

  const getPreviewWidth = () => {
    if (previewDevice === 'mobile') return '375px';
    if (previewDevice === 'tablet') return '768px';
    return '100%';
  };

  const headingScaleMultiplier = headerData.heading_size === 'compact' ? 0.9 : headerData.heading_size === 'large' ? 1.15 : headerData.heading_size === 'extra-large' ? 1.3 : 1.0;

  return (
    <div className="admin-ministries-editor">
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: 'var(--gold-dark)' }}>Ministries Page</span> &amp; Font Styling Editor
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Manage church ministries (Add, Edit, Delete, Upload Images, Order), page header, and typography with live responsive preview.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a
            href={ROUTES.MINISTRIES}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-navy btn-sm"
            style={{ border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ExternalLink size={14} /> View Live Ministries
          </a>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="btn btn-gold btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} /> Add New Ministry
          </button>
        </div>
      </div>

      {feedback.text && (
        <div className={`admin-alert-${feedback.type}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Font & Typography Controls */}
      <FontTypographyControls
        values={headerData}
        onChange={handleHeaderChange}
        pageName="Ministries Page"
        previewDevice={previewDevice}
        onDeviceChange={setPreviewDevice}
      />

      <div className="editor-layout">
        {/* Left Column: Header Settings & Ministries List */}
        <div>
          {/* Header Banner Settings */}
          <div className="editor-panel" style={{ marginBottom: '2rem' }}>
            <div className="editor-section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="var(--gold-dark)" />
                <span>Ministries Page Banner Settings</span>
              </div>
              <button
                type="button"
                onClick={handleSaveHeader}
                disabled={savingHeader}
                className="btn btn-navy btn-sm"
                style={{ padding: '0.35rem 0.8rem' }}
              >
                {savingHeader ? 'Saving...' : 'Save Header'}
              </button>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Banner Badge Text</label>
              <input
                type="text"
                value={headerData.header_badge}
                onChange={(e) => handleHeaderChange('header_badge', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Banner Main Title</label>
              <input
                type="text"
                value={headerData.header_title}
                onChange={(e) => handleHeaderChange('header_title', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Banner Description</label>
              <textarea
                rows={2}
                value={headerData.header_description}
                onChange={(e) => handleHeaderChange('header_description', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>
          </div>

          {/* Ministries CRUD List */}
          <div className="editor-panel">
            <div className="editor-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={18} color="var(--gold-dark)" />
                <span>All Ministries ({ministries.length})</span>
              </div>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="btn btn-navy btn-sm"
                style={{ padding: '0.35rem 0.8rem' }}
              >
                <Plus size={14} /> Add Ministry
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {ministries.map((min) => (
                <div
                  key={min.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#0B192C',
                        flexShrink: 0,
                      }}
                    >
                      {getMediaUrl(min.image_url) ? (
                        <img 
                          src={getMediaUrl(min.image_url)} 
                          alt={min.title} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)' }}>
                          {renderIcon(min.icon_name)}
                        </div>
                      )}
                    </div>

                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {min.title}
                        {min.is_featured && (
                          <span style={{ fontSize: '0.65rem', background: 'var(--gold-subtle)', color: 'var(--gold-dark)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                            FEATURED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
                        {min.meeting_time && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={12} /> {min.meeting_time}
                          </span>
                        )}
                        <span>Order: {min.order}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(min)}
                      className="btn btn-outline-navy btn-sm"
                      style={{ padding: '0.35rem 0.6rem' }}
                      title="Edit Ministry & Image"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMinistry(min.id, min.title)}
                      className="btn btn-sm"
                      style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '0.35rem 0.6rem' }}
                      title="Delete Ministry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Responsive Preview Simulator */}
        <div style={{ position: 'sticky', top: '5.5rem', maxHeight: 'calc(100vh - 7rem)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
              <Eye size={16} color="var(--gold-dark)" />
              <span>Live Responsive Preview ({previewDevice.toUpperCase()})</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              {previewDevice === 'mobile' ? '375px View' : previewDevice === 'tablet' ? '768px View' : 'Full Desktop View'}
            </span>
          </div>

          <div
            style={{
              width: getPreviewWidth(),
              margin: '0 auto',
              transition: 'all 0.3s ease',
              background: '#0B192C',
              borderRadius: '16px',
              border: '2px solid rgba(212,175,55,0.4)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              color: '#FFFFFF',
            }}
          >
            {/* Header Simulator */}
            <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', background: 'radial-gradient(circle at 50% 30%, #112240 0%, #0B192C 100%)', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
              <span style={{ display: 'inline-block', fontSize: '0.75rem', color: headerData.accent_color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                {headerData.header_badge}
              </span>
              <h2
                style={{
                  fontFamily: headerData.heading_font,
                  fontSize: `${1.8 * headingScaleMultiplier}rem`,
                  fontWeight: headerData.font_weight,
                  color: '#FFFFFF',
                  lineHeight: headerData.line_height,
                  letterSpacing: headerData.letter_spacing,
                  marginBottom: '0.75rem',
                }}
              >
                {headerData.header_title}
              </h2>
              <p style={{ fontFamily: headerData.body_font, fontSize: '0.9rem', color: '#94A3B8', maxWidth: '90%', margin: '0 auto', lineHeight: '1.6' }}>
                {headerData.header_description}
              </p>
            </div>

            {/* Ministry Cards Simulator Grid */}
            <div style={{ padding: '1.5rem', background: '#FBF9F5', color: '#1E293B' }}>
              <div style={{ display: 'grid', gridTemplateColumns: previewDevice === 'mobile' ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                {ministries.slice(0, 4).map((min) => (
                  <div
                    key={min.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid #E2D9CC',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ height: '110px', background: '#0B192C', position: 'relative' }}>
                      {getMediaUrl(min.image_url) ? (
                        <img 
                          src={getMediaUrl(min.image_url)} 
                          alt={min.title} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: headerData.accent_color }}>
                          {renderIcon(min.icon_name)}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <h4
                        style={{
                          fontFamily: headerData.heading_font,
                          fontSize: '1.15rem',
                          fontWeight: 700,
                          color: '#0B192C',
                          margin: '0 0 0.35rem 0',
                        }}
                      >
                        {min.title}
                      </h4>
                      <p
                        style={{
                          fontFamily: headerData.body_font,
                          fontSize: '0.8rem',
                          color: '#64748B',
                          lineHeight: '1.5',
                          margin: 0,
                        }}
                      >
                        {min.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Ministry Modal */}
      {isModalOpen && (
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
              onClick={() => setIsModalOpen(false)}
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
              <Heart size={20} color="var(--gold-dark)" />
              {editingMinistry ? 'Edit Ministry & Image' : 'Add New Ministry'}
            </h3>

            <form onSubmit={handleSaveMinistry}>
              <div className="admin-form-group">
                <label className="admin-form-label" style={{ color: '#334155' }}>Ministry Title *</label>
                <input
                  type="text"
                  required
                  value={modalForm.title}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Prayer & Intercession"
                  className="admin-form-control"
                  style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" style={{ color: '#334155' }}>Short Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={modalForm.summary}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief 1-2 sentence description for cards..."
                  className="admin-form-control"
                  style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" style={{ color: '#334155' }}>Full Detailed Description</label>
                <textarea
                  rows={3}
                  value={modalForm.description}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Complete ministry details, vision, and how to get involved..."
                  className="admin-form-control"
                  style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                />
              </div>

              {/* Image Selection Tabs */}
              <div style={{ marginBottom: '1.5rem', background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <label className="admin-form-label" style={{ color: '#334155', marginBottom: '0.5rem' }}>
                  Ministry Image
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem', background: '#E2E8F0', padding: '0.25rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setImageTab('upload')}
                    style={{
                      border: 'none',
                      background: imageTab === 'upload' ? '#FFFFFF' : 'transparent',
                      padding: '0.45rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: imageTab === 'upload' ? '#0B192C' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Upload size={14} /> Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('gallery')}
                    style={{
                      border: 'none',
                      background: imageTab === 'gallery' ? '#FFFFFF' : 'transparent',
                      padding: '0.45rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: imageTab === 'gallery' ? '#0B192C' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <ImageIcon size={14} /> Media Gallery
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('url')}
                    style={{
                      border: 'none',
                      background: imageTab === 'url' ? '#FFFFFF' : 'transparent',
                      padding: '0.45rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: imageTab === 'url' ? '#0B192C' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Globe size={14} /> Web URL
                  </button>
                </div>

                {/* Tab 1: Upload File */}
                {imageTab === 'upload' && (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed #CBD5E1',
                        borderRadius: '8px',
                        padding: '1.25rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: selectedFile ? '#F0FDF4' : '#FFFFFF',
                      }}
                    >
                      <FolderOpen size={24} color={selectedFile ? '#16A34A' : 'var(--gold-dark)'} style={{ margin: '0 auto 0.5rem auto' }} />
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.2rem 0', color: '#1E293B' }}>
                        {selectedFile ? `Selected: ${selectedFile.name}` : 'Click to select image file from computer or folder'}
                      </p>
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Supports JPG, PNG, WEBP (Auto uploaded to server)</span>
                    </div>
                  </div>
                )}

                {/* Tab 2: Gallery Picker */}
                {imageTab === 'gallery' && (
                  <div>
                    <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 0.5rem 0' }}>
                      Click any image below from your media library:
                    </p>
                    {galleryImages.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: '#94A3B8', textAlign: 'center', padding: '1rem' }}>
                        No images found in gallery. Use Upload tab.
                      </p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', background: '#FFFFFF', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                        {galleryImages.map((gImg) => {
                          const imgUrl = getMediaUrl(gImg.url || gImg.external_url);
                          const isSelected = modalForm.image_url === (gImg.url || gImg.external_url);
                          return (
                            <div
                              key={gImg.id}
                              onClick={() => handleSelectFromGallery(gImg)}
                              style={{
                                height: '55px',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                border: isSelected ? '2px solid var(--gold-primary)' : '1px solid #CBD5E1',
                                cursor: 'pointer',
                                position: 'relative',
                              }}
                            >
                              {imgUrl ? (
                                <img src={imgUrl} alt={gImg.title || 'Gallery image'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', background: '#CBD5E1' }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Web Image URL */}
                {imageTab === 'url' && (
                  <div>
                    <input
                      type="url"
                      value={modalForm.image_url}
                      onChange={(e) => {
                        const val = e.target.value.trim().replace(/^["']|["']$/g, '');
                        setModalForm((prev) => ({ ...prev, image_url: val }));
                        setFilePreview(val);
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="admin-form-control"
                      style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.25rem', display: 'block' }}>
                      Enter a direct image link (https://...)
                    </span>
                  </div>
                )}

                {/* Selected Preview Box */}
                {Boolean(filePreview && getMediaUrl(filePreview)) && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#FFFFFF', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                      <img 
                        src={getMediaUrl(filePreview)} 
                        alt="Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600, flexGrow: 1 }}>
                      ✓ Image ready for upload &amp; save
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview('');
                        setModalForm(prev => ({ ...prev, image_url: '' }));
                      }}
                      style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ color: '#334155' }}>Icon</label>
                  <select
                    value={modalForm.icon_name}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, icon_name: e.target.value }))}
                    className="admin-form-control"
                    style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                  >
                    {ICON_OPTIONS.map((ico) => (
                      <option key={ico} value={ico}>{ico}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ color: '#334155' }}>Meeting Time / Schedule</label>
                  <input
                    type="text"
                    value={modalForm.meeting_time}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, meeting_time: e.target.value }))}
                    placeholder="e.g. Fridays 7:00 PM"
                    className="admin-form-control"
                    style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={modalForm.is_featured}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--gold-primary)' }}
                  />
                  Featured on Homepage
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#475569' }}>Display Order:</span>
                  <input
                    type="number"
                    value={modalForm.order}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    style={{ width: '60px', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline-navy btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="btn btn-gold btn-sm"
                >
                  {modalSaving ? 'Saving & Uploading...' : editingMinistry ? 'Update Ministry' : 'Create Ministry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { api, getMediaUrl } from '../../services/api';
import { useSiteContent } from '../../context/SiteContentContext';
import { ROUTES } from '../../routes/routes';
import { FontTypographyControls, ensureGoogleFontsLoaded } from '../../components/FontTypographyControls';
import { 
  Save, Plus, Edit3, Trash2, ExternalLink, CheckCircle2, AlertCircle, 
  Sparkles, Video, Play, Calendar, User, Eye, RefreshCw, X, Check,
  Search, Sliders, Star, BookOpen, Clock, Music, Film
} from 'lucide-react';

const SERMON_CATEGORIES = [
  'Sunday Service',
  'Bible Teaching',
  'Worship Message',
  'Encouragement',
  'Testimony'
];

export const AdminSermonsEditor = () => {
  const { refreshContent } = useSiteContent();
  const [headerData, setHeaderData] = useState({
    header_badge: 'Proclamation of the Living Gospel',
    header_title: 'Sermons & Messages of Hope',
    header_description: 'Listen to inspiring Biblical messages delivered with apostolic conviction and Christ-centered grace.',
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

  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingHeader, setSavingHeader] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Sermon Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSermon, setEditingSermon] = useState(null);
  const [modalForm, setModalForm] = useState({
    title: '',
    slug: '',
    speaker: 'Pastor',
    series: '',
    scripture: '',
    date: new Date().toISOString().split('T')[0],
    duration: '45 mins',
    video_url: '',
    audio_url: '',
    thumbnail_url: '',
    notes: '',
    category: SERMON_CATEGORIES[0],
    is_latest: false,
  });
  const [modalSaving, setModalSaving] = useState(false);

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [headerRes, sermonsRes] = await Promise.all([
        api.getAdminSermonsPageContent().catch(() => null),
        api.getAdminSermons().catch(() => [])
      ]);

      if (headerRes && Object.keys(headerRes).length > 0) {
        setHeaderData((prev) => ({ ...prev, ...headerRes }));
        ensureGoogleFontsLoaded([headerRes.heading_font, headerRes.body_font]);
      }
      setSermons(Array.isArray(sermonsRes) ? sermonsRes : []);
    } catch (err) {
      console.error('Failed to load sermons editor data:', err);
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
    e.preventDefault();
    setSavingHeader(true);
    setFeedback({ type: '', text: '' });

    try {
      await api.updateAdminSermonsPageContent(headerData);
      await refreshContent();
      setFeedback({ type: 'success', text: 'Sermons page banner and typography saved successfully! Live website updated.' });
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to save page header settings.' });
    } finally {
      setSavingHeader(false);
      setTimeout(() => setFeedback({ type: '', text: '' }), 5000);
    }
  };

  const openAddModal = () => {
    setEditingSermon(null);
    setModalForm({
      title: '',
      slug: '',
      speaker: 'Pastor',
      series: '',
      scripture: '',
      date: new Date().toISOString().split('T')[0],
      duration: '45 mins',
      video_url: '',
      audio_url: '',
      thumbnail_url: '',
      notes: '',
      category: SERMON_CATEGORIES[0],
      is_latest: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sermon) => {
    setEditingSermon(sermon);
    setModalForm({
      title: sermon.title || '',
      slug: sermon.slug || '',
      speaker: sermon.speaker || 'Pastor',
      series: sermon.series || '',
      scripture: sermon.scripture || '',
      date: sermon.date || new Date().toISOString().split('T')[0],
      duration: sermon.duration || '45 mins',
      video_url: sermon.video_url || '',
      audio_url: sermon.audio_url || '',
      thumbnail_url: sermon.thumbnail_url || '',
      notes: sermon.notes || '',
      category: sermon.category || SERMON_CATEGORIES[0],
      is_latest: Boolean(sermon.is_latest),
    });
    setIsModalOpen(true);
  };

  const handleModalSave = async (e) => {
    e.preventDefault();
    if (!modalForm.title.trim() || !modalForm.scripture.trim()) {
      alert('Please fill in both the Title and Scripture.');
      return;
    }

    setModalSaving(true);
    try {
      if (editingSermon) {
        await api.updateAdminSermon(editingSermon.id, modalForm);
        setFeedback({ type: 'success', text: `Sermon "${modalForm.title}" updated live!` });
      } else {
        await api.createAdminSermon(modalForm);
        setFeedback({ type: 'success', text: `New Sermon "${modalForm.title}" published live!` });
      }

      setIsModalOpen(false);
      await fetchAllData();
      await refreshContent();
    } catch (err) {
      alert('Error saving sermon: ' + (err.message || 'Please check all required fields.'));
    } finally {
      setModalSaving(false);
      setTimeout(() => setFeedback({ type: '', text: '' }), 5000);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.deleteAdminSermon(id);
      setFeedback({ type: 'success', text: 'Sermon deleted live from public site.' });
      setDeleteConfirmId(null);
      await fetchAllData();
      await refreshContent();
    } catch (err) {
      alert('Failed to delete sermon: ' + err.message);
    } finally {
      setDeleting(false);
      setTimeout(() => setFeedback({ type: '', text: '' }), 5000);
    }
  };

  const filteredSermons = sermons.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.scripture.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategoryFilter === 'All' || s.category === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212,175,55,0.3)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
        <p>Loading Sermons Page Editor...</p>
      </div>
    );
  }

  return (
    <div className="admin-editor-page">
      {/* Page Title & Live Action Header */}
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--gold-dark)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
            Live Content Management
          </span>
          <h1 style={{ fontSize: '2rem', margin: '0.25rem 0', color: 'var(--bg-dark)' }}>
            Sermons &amp; Video Messages Editor
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Manage sermon recordings, YouTube videos, message notes, and typography. Edits appear immediately on the live website.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a href={ROUTES.SERMONS} target="_blank" rel="noopener noreferrer" className="btn btn-outline-gold btn-sm">
            <ExternalLink size={15} /> View Live Sermons Page
          </a>
          <button onClick={openAddModal} className="btn btn-gold btn-sm">
            <Plus size={16} /> Add Sermon Message
          </button>
        </div>
      </div>

      {feedback.text && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: feedback.type === 'success' ? '#15803D' : '#B91C1C',
          border: `1px solid ${feedback.type === 'success' ? '#86EFAC' : '#FCA5A5'}`,
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span style={{ fontWeight: 600 }}>{feedback.text}</span>
        </div>
      )}

      {/* SECTION 1: Page Header & Typography Controls */}
      <div className="editor-card" style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={20} color="var(--gold-dark)" />
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Sermons Page Banner &amp; Typography</h2>
          </div>
        </div>

        <form onSubmit={handleSaveHeader}>
          {/* Typography Controls Component */}
          <FontTypographyControls
            values={headerData}
            onChange={handleHeaderChange}
            pageName="Sermons Page"
            previewDevice={previewDevice}
            onDeviceChange={setPreviewDevice}
          />

          {/* Banner Text Inputs */}
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Header Badge Text</label>
              <input
                type="text"
                className="form-control"
                value={headerData.header_badge}
                onChange={(e) => handleHeaderChange('header_badge', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Main Page Headline</label>
              <input
                type="text"
                className="form-control"
                value={headerData.header_title}
                onChange={(e) => handleHeaderChange('header_title', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Header Subtitle / Description</label>
            <textarea
              className="form-control"
              rows={2}
              value={headerData.header_description}
              onChange={(e) => handleHeaderChange('header_description', e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-navy" disabled={savingHeader}>
              <Save size={16} /> {savingHeader ? 'Saving Changes...' : 'Save Header & Fonts'}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: Sermons List & Management */}
      <div className="editor-card" style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Video size={20} color="var(--gold-dark)" />
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Sermon Library ({sermons.length})</h2>
          </div>

          {/* Search & Category Filter */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search sermons, speaker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '0.5rem 0.75rem 0.5rem 2rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', width: '220px' }}
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
            >
              <option value="All">All Categories</option>
              {SERMON_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Sermons Grid / Table */}
        {filteredSermons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <Video size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
            <p>No Sermons found matching your search.</p>
            <button onClick={openAddModal} className="btn btn-gold btn-sm" style={{ marginTop: '0.5rem' }}>
              <Plus size={15} /> Add First Sermon
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid var(--border-subtle)', color: '#475569' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Sermon &amp; Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Speaker &amp; Scripture</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Date / Duration</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Featured</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSermons.map((sermon) => (
                  <tr key={sermon.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--bg-dark)', fontSize: '1rem' }}>
                        {sermon.title}
                      </div>
                      <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', background: 'rgba(212,175,55,0.15)', color: 'var(--gold-dark)', borderRadius: '4px', fontWeight: 600 }}>
                        {sermon.category}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: 'var(--text-dark)', fontWeight: 500 }}>
                        <User size={13} style={{ display: 'inline', marginRight: '4px' }} />
                        {sermon.speaker}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gold-dark)', fontWeight: 600 }}>
                        <BookOpen size={12} style={{ display: 'inline', marginRight: '3px' }} />
                        {sermon.scripture}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      <div><Calendar size={12} style={{ display: 'inline', marginRight: '3px' }} />{sermon.date}</div>
                      <div style={{ fontSize: '0.8rem' }}><Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />{sermon.duration}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {sermon.is_latest ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: '#FEF3C7', color: '#D97706', borderRadius: '20px', fontWeight: 700 }}>
                          <Star size={12} fill="currentColor" /> Latest / Hero
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Standard</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEditModal(sermon)}
                          className="btn btn-sm btn-outline-navy"
                          title="Edit Sermon"
                          style={{ padding: '0.35rem 0.65rem' }}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(sermon.id)}
                          className="btn btn-sm"
                          title="Delete Sermon"
                          style={{ padding: '0.35rem 0.65rem', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Add / Edit Sermon */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem', color: 'var(--bg-dark)' }}>
              {editingSermon ? 'Edit Sermon Message' : 'Add Sermon Message'}
            </h2>

            <form onSubmit={handleModalSave}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Sermon Title *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Unshakable Faith in Troubled Times"
                    value={modalForm.title}
                    onChange={(e) => setModalForm(prev => ({ ...prev, title: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Category *</label>
                  <select
                    className="form-control"
                    value={modalForm.category}
                    onChange={(e) => setModalForm(prev => ({ ...prev, category: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  >
                    {SERMON_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Speaker *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Pastor David Raj"
                    value={modalForm.speaker}
                    onChange={(e) => setModalForm(prev => ({ ...prev, speaker: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Scripture Passage *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Hebrews 11:1-6"
                    value={modalForm.scripture}
                    onChange={(e) => setModalForm(prev => ({ ...prev, scripture: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Date Delivered</label>
                  <input
                    type="date"
                    className="form-control"
                    value={modalForm.date}
                    onChange={(e) => setModalForm(prev => ({ ...prev, date: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Duration</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 45 mins"
                    value={modalForm.duration}
                    onChange={(e) => setModalForm(prev => ({ ...prev, duration: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Series Name (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Walking in Divine Power"
                    value={modalForm.series}
                    onChange={(e) => setModalForm(prev => ({ ...prev, series: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Video URL (YouTube embed, Vimeo, or MP4)</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://www.youtube.com/embed/... or https://youtu.be/..."
                    value={modalForm.video_url}
                    onChange={(e) => setModalForm(prev => ({ ...prev, video_url: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Thumbnail Image URL</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://images.unsplash.com/... or media path"
                    value={modalForm.thumbnail_url}
                    onChange={(e) => setModalForm(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Sermon Notes / Outline</label>
                <textarea
                  rows={4}
                  className="form-control"
                  placeholder="Key sermon outline points, notes, and scripture insights..."
                  value={modalForm.notes}
                  onChange={(e) => setModalForm(prev => ({ ...prev, notes: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                />
              </div>

              {/* Set as Latest / Hero Toggle */}
              <div style={{ marginTop: '1rem', background: '#FFFBEB', padding: '1rem', borderRadius: '8px', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  id="is_latest_checkbox"
                  checked={modalForm.is_latest}
                  onChange={(e) => setModalForm(prev => ({ ...prev, is_latest: e.target.checked }))}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="is_latest_checkbox" style={{ fontWeight: 600, color: '#92400E', cursor: 'pointer', margin: 0, fontSize: '0.9rem' }}>
                  ⭐ Feature this sermon as the Latest Message on the public website and homepage
                </label>
              </div>

              <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline-navy">
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold" disabled={modalSaving}>
                  {modalSaving ? 'Saving Live...' : (editingSermon ? 'Update Sermon Live' : 'Publish Sermon Live')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', textAlign: 'center', padding: '2rem' }}>
            <AlertCircle size={48} color="#EF4444" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Delete this Sermon?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              This action will permanently delete this sermon from both the admin portal and the live public website.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button onClick={() => setDeleteConfirmId(null)} className="btn btn-outline-navy btn-sm">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="btn btn-sm" style={{ background: '#EF4444', color: '#FFFFFF', border: 'none' }} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Yes, Delete Live'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminSermonsEditor;

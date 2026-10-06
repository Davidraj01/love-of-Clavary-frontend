import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useSiteContent } from '../../context/SiteContentContext';
import { ROUTES } from '../../routes/routes';
import { FontTypographyControls, ensureGoogleFontsLoaded } from '../../components/FontTypographyControls';
import { 
  Save, Plus, Edit3, Trash2, ExternalLink, CheckCircle2, AlertCircle, 
  Sparkles, Heart, BookOpen, Calendar, User, Eye, RefreshCw, X, Check,
  Search, Sliders, Feather, MessageSquare
} from 'lucide-react';

export const AdminDevotionalEditor = () => {
  const { refreshContent } = useSiteContent();
  const [headerData, setHeaderData] = useState({
    header_badge: 'Daily Bread & Morning Dew',
    header_title: 'Daily Devotionals',
    header_description: 'Quiet your soul and begin each morning in the warm presence and comforting promises of our Lord.',
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

  const [devotionals, setDevotionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingHeader, setSavingHeader] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [searchQuery, setSearchQuery] = useState('');

  // Devotional Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevo, setEditingDevo] = useState(null);
  const [modalForm, setModalForm] = useState({
    title: '',
    slug: '',
    date: new Date().toISOString().split('T')[0],
    scripture_verse: '',
    scripture_text: '',
    reflection: '',
    prayer: '',
    author: 'Calvary Pastoral Team',
  });
  const [modalSaving, setModalSaving] = useState(false);

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [headerRes, devoRes] = await Promise.all([
        api.getAdminDevotionalPageContent().catch(() => null),
        api.getAdminDevotionals().catch(() => [])
      ]);

      if (headerRes && Object.keys(headerRes).length > 0) {
        setHeaderData((prev) => ({ ...prev, ...headerRes }));
        ensureGoogleFontsLoaded([headerRes.heading_font, headerRes.body_font]);
      }
      setDevotionals(Array.isArray(devoRes) ? devoRes : []);
    } catch (err) {
      console.error('Failed to load devotional editor data:', err);
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
      await api.updateAdminDevotionalPageContent(headerData);
      await refreshContent();
      setFeedback({ type: 'success', text: 'Devotional page banner and fonts saved successfully! Live website updated.' });
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to save page header settings.' });
    } finally {
      setSavingHeader(false);
      setTimeout(() => setFeedback({ type: '', text: '' }), 5000);
    }
  };

  const openAddModal = () => {
    setEditingDevo(null);
    setModalForm({
      title: '',
      slug: '',
      date: new Date().toISOString().split('T')[0],
      scripture_verse: '',
      scripture_text: '',
      reflection: '',
      prayer: '',
      author: 'Calvary Pastoral Team',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (devo) => {
    setEditingDevo(devo);
    setModalForm({
      title: devo.title || '',
      slug: devo.slug || '',
      date: devo.date || new Date().toISOString().split('T')[0],
      scripture_verse: devo.scripture_verse || '',
      scripture_text: devo.scripture_text || '',
      reflection: devo.reflection || '',
      prayer: devo.prayer || '',
      author: devo.author || 'Calvary Pastoral Team',
    });
    setIsModalOpen(true);
  };

  const handleModalSave = async (e) => {
    e.preventDefault();
    if (!modalForm.title.trim() || !modalForm.scripture_verse.trim()) {
      alert('Please fill in both the Title and Scripture Verse.');
      return;
    }

    setModalSaving(true);
    try {
      if (editingDevo) {
        await api.updateAdminDevotional(editingDevo.id, modalForm);
        setFeedback({ type: 'success', text: `Devotional "${modalForm.title}" updated live!` });
      } else {
        await api.createAdminDevotional(modalForm);
        setFeedback({ type: 'success', text: `New Devotional "${modalForm.title}" published live!` });
      }

      setIsModalOpen(false);
      await fetchAllData();
      await refreshContent();
    } catch (err) {
      alert('Error saving devotional: ' + (err.message || 'Please check all required fields.'));
    } finally {
      setModalSaving(false);
      setTimeout(() => setFeedback({ type: '', text: '' }), 5000);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.deleteAdminDevotional(id);
      setFeedback({ type: 'success', text: 'Devotional deleted live from public site.' });
      setDeleteConfirmId(null);
      await fetchAllData();
      await refreshContent();
    } catch (err) {
      alert('Failed to delete devotional: ' + err.message);
    } finally {
      setDeleting(false);
      setTimeout(() => setFeedback({ type: '', text: '' }), 5000);
    }
  };

  const filteredDevotionals = devotionals.filter(d => {
    return d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           d.scripture_verse.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (d.date && d.date.includes(searchQuery));
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212,175,55,0.3)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
        <p>Loading Devotional Page Editor...</p>
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
            Daily Devotional Editor
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Publish daily verses, pastoral meditations, and prayers. Updates appear instantly on the live website and homepage.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a href={ROUTES.DEVOTIONAL} target="_blank" rel="noopener noreferrer" className="btn btn-outline-gold btn-sm">
            <ExternalLink size={15} /> View Live Devotional Page
          </a>
          <button onClick={openAddModal} className="btn btn-gold btn-sm">
            <Plus size={16} /> Add Daily Devotional
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
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Devotional Page Banner &amp; Typography</h2>
          </div>
        </div>

        <form onSubmit={handleSaveHeader}>
          {/* Typography Controls Component */}
          <FontTypographyControls
            values={headerData}
            onChange={handleHeaderChange}
            pageName="Devotional Page"
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

      {/* SECTION 2: Devotionals List & Management */}
      <div className="editor-card" style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={20} color="var(--gold-dark)" />
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Devotional Archive &amp; Daily Bread ({devotionals.length})</h2>
          </div>

          {/* Search Filter */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search devotional title, verse..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '0.5rem 0.75rem 0.5rem 2rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', width: '250px' }}
            />
          </div>
        </div>

        {/* Devotionals Table */}
        {filteredDevotionals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <Heart size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
            <p>No Devotionals found matching your search.</p>
            <button onClick={openAddModal} className="btn btn-gold btn-sm" style={{ marginTop: '0.5rem' }}>
              <Plus size={15} /> Add First Devotional
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid var(--border-subtle)', color: '#475569' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Title &amp; Scripture</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Author</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevotionals.map((devo) => (
                  <tr key={devo.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--gold-dark)' }}>
                      <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      {devo.date}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--bg-dark)', fontSize: '1rem' }}>
                        {devo.title}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--gold-dark)', fontWeight: 600, marginTop: '2px' }}>
                        <BookOpen size={13} style={{ display: 'inline', marginRight: '4px' }} />
                        {devo.scripture_verse}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        &ldquo;{devo.scripture_text}&rdquo;
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      <User size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      {devo.author}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEditModal(devo)}
                          className="btn btn-sm btn-outline-navy"
                          title="Edit Devotional"
                          style={{ padding: '0.35rem 0.65rem' }}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(devo.id)}
                          className="btn btn-sm"
                          title="Delete Devotional"
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

      {/* MODAL: Add / Edit Daily Devotional */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem', color: 'var(--bg-dark)' }}>
              {editingDevo ? 'Edit Daily Devotional' : 'Add Daily Devotional'}
            </h2>

            <form onSubmit={handleModalSave}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Devotional Title *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Abiding Under the Shadow of the Almighty"
                    value={modalForm.title}
                    onChange={(e) => setModalForm(prev => ({ ...prev, title: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Date *</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={modalForm.date}
                    onChange={(e) => setModalForm(prev => ({ ...prev, date: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Author</label>
                  <input
                    type="text"
                    className="form-control"
                    value={modalForm.author}
                    onChange={(e) => setModalForm(prev => ({ ...prev, author: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Scripture Verse Reference *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Psalm 91:1-2"
                    value={modalForm.scripture_verse}
                    onChange={(e) => setModalForm(prev => ({ ...prev, scripture_verse: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Scripture Quote Text *</label>
                <textarea
                  required
                  rows={2}
                  className="form-control"
                  placeholder="“Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty...”"
                  value={modalForm.scripture_text}
                  onChange={(e) => setModalForm(prev => ({ ...prev, scripture_text: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontStyle: 'italic' }}
                />
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Pastoral Reflection / Today's Meditation *</label>
                <textarea
                  required
                  rows={6}
                  className="form-control"
                  placeholder="Write the comforting devotional message and spiritual reflection..."
                  value={modalForm.reflection}
                  onChange={(e) => setModalForm(prev => ({ ...prev, reflection: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', lineHeight: '1.6' }}
                />
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Today's Closing Prayer *</label>
                <textarea
                  required
                  rows={3}
                  className="form-control"
                  placeholder="Heavenly Father, anchor my heart in Your peace today. Grant me strength to walk in love..."
                  value={modalForm.prayer}
                  onChange={(e) => setModalForm(prev => ({ ...prev, prayer: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontStyle: 'italic' }}
                />
              </div>

              <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline-navy">
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold" disabled={modalSaving}>
                  {modalSaving ? 'Saving Live...' : (editingDevo ? 'Update Devotional Live' : 'Publish Devotional Live')}
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
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Delete this Devotional?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              This action will permanently delete this devotional from both the admin portal and the live public website.
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
export default AdminDevotionalEditor;

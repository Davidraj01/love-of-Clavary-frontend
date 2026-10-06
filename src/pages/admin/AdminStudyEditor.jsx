import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useSiteContent } from '../../context/SiteContentContext';
import { ROUTES } from '../../routes/routes';
import { FontTypographyControls, ensureGoogleFontsLoaded } from '../../components/FontTypographyControls';
import { 
  Save, Plus, Edit3, Trash2, ExternalLink, CheckCircle2, AlertCircle, 
  Sparkles, BookOpen, Clock, Calendar, User, Eye, RefreshCw, X, Check,
  Search, Layers, Sliders, ChevronRight, ListPlus, Trash
} from 'lucide-react';

const STUDY_TOPICS = [
  'Grace & Redemption',
  'Prayer & Spiritual Warfare',
  'Hope & Perseverance',
  'Faith & Discipleship',
  'Christian Living',
  'The Holy Spirit',
  'Gospel & Salvation'
];

export const AdminStudyEditor = () => {
  const { refreshContent } = useSiteContent();
  const [headerData, setHeaderData] = useState({
    header_badge: 'Discipleship & Exposition',
    header_title: 'Bible Studies & Christian Teachings',
    header_description: 'Deepen your understanding of God\'s living truth through verse-by-verse scriptural studies and discipleship insights.',
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

  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingHeader, setSavingHeader] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('All');

  // Study Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudy, setEditingStudy] = useState(null);
  const [modalForm, setModalForm] = useState({
    title: '',
    slug: '',
    topic: STUDY_TOPICS[0],
    scripture_ref: '',
    study_date: new Date().toISOString().split('T')[0],
    summary: '',
    full_content: '',
    key_takeaways: ['', '', ''],
    read_time: '8 min read',
    author: 'Ministry Teaching Team',
  });
  const [modalSaving, setModalSaving] = useState(false);

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [headerRes, studiesRes] = await Promise.all([
        api.getAdminStudyPageContent().catch(() => null),
        api.getAdminStudies().catch(() => [])
      ]);

      if (headerRes && Object.keys(headerRes).length > 0) {
        setHeaderData((prev) => ({ ...prev, ...headerRes }));
        ensureGoogleFontsLoaded([headerRes.heading_font, headerRes.body_font]);
      }
      setStudies(Array.isArray(studiesRes) ? studiesRes : []);
    } catch (err) {
      console.error('Failed to load study editor data:', err);
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
      await api.updateAdminStudyPageContent(headerData);
      await refreshContent();
      setFeedback({ type: 'success', text: 'Study page banner and typography saved successfully! Live website updated.' });
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to save page header settings.' });
    } finally {
      setSavingHeader(false);
      setTimeout(() => setFeedback({ type: '', text: '' }), 5000);
    }
  };

  const openAddModal = () => {
    setEditingStudy(null);
    setModalForm({
      title: '',
      slug: '',
      topic: STUDY_TOPICS[0],
      scripture_ref: '',
      study_date: new Date().toISOString().split('T')[0],
      summary: '',
      full_content: '',
      key_takeaways: ['', '', ''],
      read_time: '8 min read',
      author: 'Ministry Teaching Team',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (study) => {
    setEditingStudy(study);
    setModalForm({
      title: study.title || '',
      slug: study.slug || '',
      topic: study.topic || STUDY_TOPICS[0],
      scripture_ref: study.scripture_ref || '',
      study_date: study.study_date || new Date().toISOString().split('T')[0],
      summary: study.summary || '',
      full_content: study.full_content || '',
      key_takeaways: Array.isArray(study.key_takeaways) && study.key_takeaways.length > 0 
        ? [...study.key_takeaways] 
        : ['', '', ''],
      read_time: study.read_time || '8 min read',
      author: study.author || 'Ministry Teaching Team',
    });
    setIsModalOpen(true);
  };

  const handleModalSave = async (e) => {
    e.preventDefault();
    if (!modalForm.title.trim()) {
      alert('Please enter a Study title.');
      return;
    }

    setModalSaving(true);
    try {
      const payload = {
        ...modalForm,
        key_takeaways: modalForm.key_takeaways.filter(t => t.trim().length > 0)
      };

      if (editingStudy) {
        await api.updateAdminStudy(editingStudy.id, payload);
        setFeedback({ type: 'success', text: `Bible Study "${payload.title}" updated live!` });
      } else {
        await api.createAdminStudy(payload);
        setFeedback({ type: 'success', text: `New Bible Study "${payload.title}" created and published live!` });
      }

      setIsModalOpen(false);
      await fetchAllData();
      await refreshContent();
    } catch (err) {
      alert('Error saving study: ' + (err.message || 'Please check all required fields.'));
    } finally {
      setModalSaving(false);
      setTimeout(() => setFeedback({ type: '', text: '' }), 5000);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.deleteAdminStudy(id);
      setFeedback({ type: 'success', text: 'Study deleted live from public site.' });
      setDeleteConfirmId(null);
      await fetchAllData();
      await refreshContent();
    } catch (err) {
      alert('Failed to delete study: ' + err.message);
    } finally {
      setDeleting(false);
      setTimeout(() => setFeedback({ type: '', text: '' }), 5000);
    }
  };

  const handleTakeawayChange = (index, val) => {
    const updated = [...modalForm.key_takeaways];
    updated[index] = val;
    setModalForm(prev => ({ ...prev, key_takeaways: updated }));
  };

  const addTakeawayField = () => {
    setModalForm(prev => ({ ...prev, key_takeaways: [...prev.key_takeaways, ''] }));
  };

  const removeTakeawayField = (index) => {
    const updated = modalForm.key_takeaways.filter((_, i) => i !== index);
    setModalForm(prev => ({ ...prev, key_takeaways: updated }));
  };

  const filteredStudies = studies.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.scripture_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopicFilter === 'All' || s.topic === selectedTopicFilter;
    return matchesSearch && matchesTopic;
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212,175,55,0.3)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
        <p>Loading Study Page Editor...</p>
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
            Bible Study Editor
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Manage discipleship teachings, scripture expositions, font styling, and page headers. Changes go live instantly.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a href={ROUTES.STUDY} target="_blank" rel="noopener noreferrer" className="btn btn-outline-gold btn-sm">
            <ExternalLink size={15} /> View Live Study Page
          </a>
          <button onClick={openAddModal} className="btn btn-gold btn-sm">
            <Plus size={16} /> Add Bible Study
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
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Study Page Banner &amp; Typography</h2>
          </div>
        </div>

        <form onSubmit={handleSaveHeader}>
          {/* Typography Controls Component */}
          <FontTypographyControls
            values={headerData}
            onChange={handleHeaderChange}
            pageName="Study Page"
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

      {/* SECTION 2: Bible Studies List & Management */}
      <div className="editor-card" style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="var(--gold-dark)" />
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Published Bible Studies ({studies.length})</h2>
          </div>

          {/* Search & Topic Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search studies, scripture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '0.5rem 0.75rem 0.5rem 2rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', width: '220px' }}
              />
            </div>

            <select
              value={selectedTopicFilter}
              onChange={(e) => setSelectedTopicFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
            >
              <option value="All">All Topics</option>
              {STUDY_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Studies Table */}
        {filteredStudies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <BookOpen size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
            <p>No Bible Studies found matching your filter.</p>
            <button onClick={openAddModal} className="btn btn-gold btn-sm" style={{ marginTop: '0.5rem' }}>
              <Plus size={15} /> Create First Bible Study
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid var(--border-subtle)', color: '#475569' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Title &amp; Topic</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Scripture Ref</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Author / Read Time</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudies.map((study) => (
                  <tr key={study.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--bg-dark)', fontSize: '1rem' }}>
                        {study.title}
                      </div>
                      <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', background: 'rgba(212,175,55,0.15)', color: 'var(--gold-dark)', borderRadius: '4px', fontWeight: 600 }}>
                        {study.topic}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--gold-dark)', fontWeight: 600 }}>
                      {study.scripture_ref}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                      <div>{study.author}</div>
                      <div style={{ fontSize: '0.8rem' }}><Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />{study.read_time}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {study.study_date}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEditModal(study)}
                          className="btn btn-sm btn-outline-navy"
                          title="Edit Study"
                          style={{ padding: '0.35rem 0.65rem' }}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(study.id)}
                          className="btn btn-sm"
                          title="Delete Study"
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

      {/* MODAL: Add / Edit Bible Study */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem', color: 'var(--bg-dark)' }}>
              {editingStudy ? 'Edit Bible Study' : 'Add New Bible Study'}
            </h2>

            <form onSubmit={handleModalSave}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Study Title *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Walking in Grace: The Calvary Mandate"
                    value={modalForm.title}
                    onChange={(e) => setModalForm(prev => ({ ...prev, title: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Topic Category *</label>
                  <select
                    className="form-control"
                    value={modalForm.topic}
                    onChange={(e) => setModalForm(prev => ({ ...prev, topic: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  >
                    {STUDY_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Scripture Reference *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Ephesians 2:8-10"
                    value={modalForm.scripture_ref}
                    onChange={(e) => setModalForm(prev => ({ ...prev, scripture_ref: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Study Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={modalForm.study_date}
                    onChange={(e) => setModalForm(prev => ({ ...prev, study_date: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Author / Teacher</label>
                  <input
                    type="text"
                    className="form-control"
                    value={modalForm.author}
                    onChange={(e) => setModalForm(prev => ({ ...prev, author: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Summary / Excerpt *</label>
                <textarea
                  required
                  rows={2}
                  className="form-control"
                  placeholder="Short engaging summary for the study card..."
                  value={modalForm.summary}
                  onChange={(e) => setModalForm(prev => ({ ...prev, summary: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Full Exposition Content *</label>
                <textarea
                  required
                  rows={8}
                  className="form-control"
                  placeholder="Detailed verse-by-verse scriptural insights and discipleship content..."
                  value={modalForm.full_content}
                  onChange={(e) => setModalForm(prev => ({ ...prev, full_content: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', lineHeight: '1.6' }}
                />
              </div>

              {/* Key Takeaways Builder */}
              <div className="form-group" style={{ marginTop: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 600, margin: 0 }}>Key Biblical Takeaways (Bullet Points)</label>
                  <button type="button" onClick={addTakeawayField} className="btn btn-sm btn-outline-gold" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                    <Plus size={12} /> Add Point
                  </button>
                </div>
                {modalForm.key_takeaways.map((takeaway, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gold-dark)', fontWeight: 700 }}>{idx + 1}.</span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`Key takeaway #${idx + 1}`}
                      value={takeaway}
                      onChange={(e) => handleTakeawayChange(idx, e.target.value)}
                      style={{ flexGrow: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    />
                    {modalForm.key_takeaways.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTakeawayField(idx)}
                        style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.25rem' }}
                      >
                        <Trash size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline-navy">
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold" disabled={modalSaving}>
                  {modalSaving ? 'Saving Live...' : (editingStudy ? 'Update Study Live' : 'Publish Study Live')}
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
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Delete this Bible Study?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              This action will permanently delete this teaching from both the admin portal and the live public website.
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
export default AdminStudyEditor;

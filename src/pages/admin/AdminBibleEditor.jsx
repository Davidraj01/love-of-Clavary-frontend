import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useSiteContent } from '../../context/SiteContentContext';
import { ROUTES } from '../../routes/routes';
import { FontTypographyControls, ensureGoogleFontsLoaded } from '../../components/FontTypographyControls';
import { 
  Save, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Feather, 
  Plus, 
  Trash2, 
  Eye, 
  RefreshCw, 
  Sparkles 
} from 'lucide-react';

export const AdminBibleEditor = () => {
  const { refreshContent } = useSiteContent();
  const [formData, setFormData] = useState({
    header_badge: 'Living Word of God',
    header_title: 'The Holy Scriptures',
    header_quote: '“Your word is a lamp for my feet, a light on my path.” — Psalm 119:105',
    intro_badge: 'Divine Wisdom',
    intro_title: 'An Inexhaustible Wellspring of Grace',
    intro_text1: 'The Bible is God\'s living, inspired revelation to mankind. Within its sacred pages, we discover God\'s eternal plan of redemption through Jesus Christ, comforting promises in times of distress, and practical wisdom for every dimension of daily life.',
    intro_text2: 'At Compassionate Love of Calvary Ministries, we cherish the Scriptures as our final authority for faith, worship, and love. We invite you to meditate upon these curated passages and let the Holy Spirit renew your mind and fortify your spirit.',
    tips_title: 'Bible Reading Encouragement',
    tips_list: [
      'Begin every reading session with a moment of silent prayer, inviting the Holy Spirit.',
      'Read passages in context to understand historical background and original intent.',
      'Journal personal reflections and practical applications for daily Christian walk.',
      'Meditate upon key memory verses throughout the day.'
    ],
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

  const [newTip, setNewTip] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [previewDevice, setPreviewDevice] = useState('desktop');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const data = await api.getAdminBibleContent();
        if (data && Object.keys(data).length > 0) {
          setFormData((prev) => ({ 
            ...prev, 
            ...data,
            tips_list: Array.isArray(data.tips_list) ? data.tips_list : prev.tips_list
          }));
          ensureGoogleFontsLoaded([data.heading_font, data.body_font]);
        }
      } catch (err) {
        console.error('Failed to load Bible content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTip = () => {
    if (!newTip.trim()) return;
    setFormData((prev) => ({
      ...prev,
      tips_list: [...prev.tips_list, newTip.trim()],
    }));
    setNewTip('');
  };

  const handleRemoveTip = (index) => {
    setFormData((prev) => ({
      ...prev,
      tips_list: prev.tips_list.filter((_, idx) => idx !== index),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', text: '' });

    try {
      await api.updateAdminBibleContent(formData);
      await refreshContent();
      setFeedback({ type: 'success', text: 'Bible page content and font styling successfully saved!' });
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to save changes. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212,175,55,0.3)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
        <p>Loading Bible Page Editor...</p>
      </div>
    );
  }

  const getPreviewWidth = () => {
    if (previewDevice === 'mobile') return '375px';
    if (previewDevice === 'tablet') return '768px';
    return '100%';
  };

  const headingScaleMultiplier = formData.heading_size === 'compact' ? 0.9 : formData.heading_size === 'large' ? 1.15 : formData.heading_size === 'extra-large' ? 1.3 : 1.0;

  return (
    <div className="admin-bible-editor">
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: 'var(--gold-dark)' }}>Bible Page</span> &amp; Font Styling Editor
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Manage the Bible scriptures page header, encouraging tips, wisdom guides, and custom typography in real-time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a
            href={ROUTES.BIBLE}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-navy btn-sm"
            style={{ border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ExternalLink size={14} /> View Live Bible Page
          </a>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn btn-gold btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {saving ? <RefreshCw size={14} className="spin-icon" /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {feedback.text && (
        <div className={`admin-alert-${feedback.type}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Font & Typography Controls */}
      <FontTypographyControls
        values={formData}
        onChange={handleChange}
        pageName="Bible Page"
        previewDevice={previewDevice}
        onDeviceChange={setPreviewDevice}
      />

      <div className="editor-layout">
        {/* Form Inputs Column */}
        <form onSubmit={handleSave} className="editor-panel">
          {/* Section 1: Page Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="editor-section-title">
              <Sparkles size={18} color="var(--gold-dark)" />
              <span>Header Banner &amp; Scripture Quote</span>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Header Badge</label>
              <input
                type="text"
                value={formData.header_badge}
                onChange={(e) => handleChange('header_badge', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Header Title</label>
              <input
                type="text"
                value={formData.header_title}
                onChange={(e) => handleChange('header_title', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Header Scripture Verse Quote</label>
              <textarea
                rows={2}
                value={formData.header_quote}
                onChange={(e) => handleChange('header_quote', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>
          </div>

          {/* Section 2: Intro & Teaching */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="editor-section-title">
              <BookOpen size={18} color="var(--gold-dark)" />
              <span>Scripture Introduction</span>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Intro Badge</label>
              <input
                type="text"
                value={formData.intro_badge}
                onChange={(e) => handleChange('intro_badge', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Intro Title</label>
              <input
                type="text"
                value={formData.intro_title}
                onChange={(e) => handleChange('intro_title', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Intro Paragraph 1</label>
              <textarea
                rows={3}
                value={formData.intro_text1}
                onChange={(e) => handleChange('intro_text1', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Intro Paragraph 2</label>
              <textarea
                rows={3}
                value={formData.intro_text2}
                onChange={(e) => handleChange('intro_text2', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>
          </div>

          {/* Section 3: Bible Reading Encouragement Tips */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="editor-section-title">
              <Feather size={18} color="var(--gold-dark)" />
              <span>Reading Encouragement Tips List</span>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Tips Box Title</label>
              <input
                type="text"
                value={formData.tips_title}
                onChange={(e) => handleChange('tips_title', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
              {formData.tips_list.map((tip, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <CheckCircle2 size={16} color="var(--gold-dark)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', color: '#1E293B', flexGrow: 1 }}>{tip}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTip(idx)}
                    style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', padding: '0.2rem' }}
                    title="Remove tip"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Add a new Bible reading tip..."
                value={newTip}
                onChange={(e) => setNewTip(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTip(); } }}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
              <button
                type="button"
                onClick={handleAddTip}
                className="btn btn-navy btn-sm"
                style={{ flexShrink: 0 }}
              >
                <Plus size={16} /> Add Tip
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-gold btn-full"
            style={{ marginTop: '1rem', padding: '0.85rem' }}
          >
            {saving ? 'Saving...' : 'Save All Bible Page Changes'}
          </button>
        </form>

        {/* Live Responsive Preview Column */}
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
              <span style={{ display: 'inline-block', fontSize: '0.75rem', color: formData.accent_color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                {formData.header_badge}
              </span>
              <h2
                style={{
                  fontFamily: formData.heading_font,
                  fontSize: `${1.8 * headingScaleMultiplier}rem`,
                  fontWeight: formData.font_weight,
                  color: '#FFFFFF',
                  lineHeight: formData.line_height,
                  letterSpacing: formData.letter_spacing,
                  marginBottom: '0.75rem',
                }}
              >
                {formData.header_title}
              </h2>
              <p style={{ fontFamily: formData.body_font, fontSize: '0.9rem', color: '#94A3B8', maxWidth: '90%', margin: '0 auto', lineHeight: '1.6' }}>
                {formData.header_quote}
              </p>
            </div>

            {/* Intro & Tips Simulator */}
            <div style={{ padding: '1.5rem', background: '#FBF9F5', color: '#1E293B' }}>
              <span style={{ fontSize: '0.75rem', color: formData.accent_color, fontWeight: 700, textTransform: 'uppercase' }}>
                {formData.intro_badge}
              </span>
              <h3
                style={{
                  fontFamily: formData.heading_font,
                  fontSize: `${1.4 * headingScaleMultiplier}rem`,
                  fontWeight: formData.font_weight,
                  color: '#0B192C',
                  marginTop: '0.25rem',
                  marginBottom: '0.75rem',
                }}
              >
                {formData.intro_title}
              </h3>
              <p style={{ fontFamily: formData.body_font, fontSize: '0.85rem', color: '#475569', lineHeight: formData.line_height, marginBottom: '0.75rem' }}>
                {formData.intro_text1}
              </p>

              {/* Encouragement Tips Card */}
              <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '8px', borderLeft: `4px solid ${formData.accent_color}`, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                <h4 style={{ fontFamily: formData.heading_font, fontSize: '1.15rem', color: '#0B192C', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Feather size={18} color={formData.accent_color} />
                  {formData.tips_title}
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {formData.tips_list.map((tip, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
                      <CheckCircle2 size={14} color={formData.accent_color} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontFamily: formData.body_font }}>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

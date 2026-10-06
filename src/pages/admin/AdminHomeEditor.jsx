import React, { useState, useEffect } from 'react';
import { api, getMediaUrl } from '../../services/api';
import { useSiteContent } from '../../context/SiteContentContext';
import { ROUTES } from '../../routes/routes';
import { FontTypographyControls, ensureGoogleFontsLoaded } from '../../components/FontTypographyControls';
import { 
  Save, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  ExternalLink, 
  BookOpen, 
  Heart,
  Home
} from 'lucide-react';

export const AdminHomeEditor = () => {
  const { refreshContent } = useSiteContent();
  const [formData, setFormData] = useState({
    hero_badge: 'COMPASSIONATE LOVE OF CALVARY MINISTRIES',
    hero_headline: 'Sharing the Love of Christ, Bringing Hope to Every Heart.',
    hero_description: 'A Christ-centered ministry devoted to sharing God\'s love, strengthening faith, serving others, and bringing hope through the transforming message of Jesus Christ.',
    hero_cta_primary: 'Discover Our Ministry',
    hero_cta_secondary: 'Join Us in Prayer',
    hero_image_url: '',
    welcome_heading: 'Welcome to a Place of Faith, Hope & Compassion',
    welcome_subheading: 'Walking together in the grace and boundless love of Jesus Christ',
    welcome_content: 'At Compassionate Love of Calvary Ministries, our doors and hearts are open to everyone. Rooted in prayer, anchored in Biblical truth, and energized by the Holy Spirit, we are dedicated to fostering a loving community where lives are restored, spiritual growth is nurtured, and the light of Christ shines through compassionate service.',
    welcome_image_url: '',
    scripture_text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    scripture_reference: 'Matthew 11:28',
    mission_heading: 'Our Mission',
    mission_subheading: 'Guided by the Holy Scriptures to love, serve, and glorify our Lord.',
    cta_headline: 'Come As You Are. Discover Hope. Walk in His Love.',
    cta_description: 'Whether you are seeking prayer, fellowship, spiritual growth, or simply a place to belong, you are welcome here.',
    cta_primary_btn: 'Visit Us',
    cta_secondary_btn: 'Request Prayer',
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [previewDevice, setPreviewDevice] = useState('desktop');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const data = await api.getAdminHomeContent();
        if (data && Object.keys(data).length > 0) {
          setFormData((prev) => ({ ...prev, ...data }));
          ensureGoogleFontsLoaded([data.heading_font, data.body_font]);
        }
      } catch (err) {
        console.error('Failed to load homepage content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', text: '' });

    try {
      await api.updateAdminHomeContent(formData);
      await refreshContent();
      setFeedback({ type: 'success', text: 'Homepage content and font settings saved successfully to database!' });
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to save changes. Please check your inputs.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212,175,55,0.3)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
        <p>Loading Home Editor...</p>
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
    <div className="admin-home-editor">
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: 'var(--gold-dark)' }}>Home Page</span> &amp; Font Styling Editor
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Customize homepage hero, welcome, scriptures, and live typography with instant responsive view.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a
            href={ROUTES.HOME}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-navy btn-sm"
            style={{ border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ExternalLink size={14} /> View Live Website
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
        pageName="Home Page"
        previewDevice={previewDevice}
        onDeviceChange={setPreviewDevice}
      />

      <div className="editor-layout">
        {/* Left: Input Form Controls */}
        <form onSubmit={handleSave} className="editor-panel">
          {/* Hero Section Content */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="editor-section-title">
              <Sparkles size={18} color="var(--gold-dark)" />
              <span>Hero Header Section</span>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Hero Badge / Tagline</label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.hero_badge}
                onChange={(e) => handleChange('hero_badge', e.target.value)}
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Hero Main Headline</label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.hero_headline}
                onChange={(e) => handleChange('hero_headline', e.target.value)}
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Hero Description</label>
              <textarea
                className="admin-form-control"
                rows={3}
                value={formData.hero_description}
                onChange={(e) => handleChange('hero_description', e.target.value)}
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Hero Background Image URL</label>
              <input
                type="text"
                className="admin-form-control"
                placeholder="https://images.unsplash.com/... or media path"
                value={formData.hero_image_url || ''}
                onChange={(e) => handleChange('hero_image_url', e.target.value)}
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="admin-form-group">
                <label className="admin-form-label" style={{ color: '#334155' }}>Primary Button Label</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={formData.hero_cta_primary}
                  onChange={(e) => handleChange('hero_cta_primary', e.target.value)}
                  style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" style={{ color: '#334155' }}>Secondary Button Label</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={formData.hero_cta_secondary}
                  onChange={(e) => handleChange('hero_cta_secondary', e.target.value)}
                  style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
                />
              </div>
            </div>
          </div>

          {/* Welcome Section */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="editor-section-title">
              <Heart size={18} color="var(--gold-dark)" />
              <span>Welcome Section</span>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Welcome Heading</label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.welcome_heading}
                onChange={(e) => handleChange('welcome_heading', e.target.value)}
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Welcome Subheading</label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.welcome_subheading}
                onChange={(e) => handleChange('welcome_subheading', e.target.value)}
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Welcome Paragraph</label>
              <textarea
                className="admin-form-control"
                rows={4}
                value={formData.welcome_content}
                onChange={(e) => handleChange('welcome_content', e.target.value)}
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Welcome Image URL</label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.welcome_image_url || ''}
                onChange={(e) => handleChange('welcome_image_url', e.target.value)}
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>
          </div>

          {/* Featured Scripture Banner */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="editor-section-title">
              <BookOpen size={18} color="var(--gold-dark)" />
              <span>Featured Scripture Section</span>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Scripture Text</label>
              <textarea
                className="admin-form-control"
                rows={3}
                value={formData.scripture_text}
                onChange={(e) => handleChange('scripture_text', e.target.value)}
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Scripture Reference (e.g. Matthew 11:28)</label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.scripture_reference}
                onChange={(e) => handleChange('scripture_reference', e.target.value)}
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-gold btn-full"
            style={{ marginTop: '1rem', padding: '0.85rem' }}
          >
            {saving ? 'Saving...' : 'Save All Home Page Changes'}
          </button>
        </form>

        {/* Right: Live Responsive Preview Column */}
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
            {/* Hero Preview */}
            <div
              style={{
                padding: '3rem 1.5rem',
                textAlign: 'center',
                background: 'radial-gradient(circle at 50% 30%, #112240 0%, #0B192C 100%)',
                borderBottom: '1px solid rgba(212,175,55,0.2)',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.75rem',
                  color: formData.accent_color,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '0.6rem',
                  fontWeight: 600,
                }}
              >
                {formData.hero_badge}
              </span>

              <h2
                style={{
                  fontFamily: formData.heading_font,
                  fontSize: `${1.85 * headingScaleMultiplier}rem`,
                  fontWeight: formData.font_weight,
                  lineHeight: formData.line_height,
                  letterSpacing: formData.letter_spacing,
                  color: '#FFFFFF',
                  marginBottom: '0.85rem',
                }}
              >
                {formData.hero_headline}
              </h2>

              <p
                style={{
                  fontFamily: formData.body_font,
                  fontSize: '0.9rem',
                  color: '#94A3B8',
                  maxWidth: '90%',
                  margin: '0 auto 1.5rem auto',
                  lineHeight: '1.6',
                }}
              >
                {formData.hero_description}
              </p>

              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  style={{
                    background: formData.accent_color,
                    color: '#0B192C',
                    border: 'none',
                    padding: '0.55rem 1.1rem',
                    borderRadius: '50px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                >
                  {formData.hero_cta_primary}
                </button>
                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    border: `1px solid ${formData.accent_color}`,
                    color: '#FFFFFF',
                    padding: '0.55rem 1.1rem',
                    borderRadius: '50px',
                    fontSize: '0.8rem',
                  }}
                >
                  {formData.hero_cta_secondary}
                </button>
              </div>
            </div>

            {/* Scripture Preview */}
            <div
              style={{
                padding: '2rem 1.5rem',
                background: '#F3ECE2',
                color: '#1E293B',
                textAlign: 'center',
                borderBottom: '1px solid #E2D9CC',
              }}
            >
              <p
                style={{
                  fontFamily: formData.heading_font,
                  fontSize: `${1.3 * headingScaleMultiplier}rem`,
                  fontStyle: 'italic',
                  color: '#0B192C',
                  lineHeight: '1.6',
                  marginBottom: '0.5rem',
                }}
              >
                &ldquo;{formData.scripture_text}&rdquo;
              </p>
              <span
                style={{
                  fontSize: '0.8rem',
                  color: formData.accent_color,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                — {formData.scripture_reference}
              </span>
            </div>

            {/* Welcome Section Preview */}
            <div style={{ padding: '2rem 1.5rem', background: '#FFFFFF', color: '#1E293B' }}>
              <span style={{ fontSize: '0.75rem', color: formData.accent_color, fontWeight: 700, textTransform: 'uppercase' }}>
                Welcome to Calvary
              </span>
              <h3
                style={{
                  fontFamily: formData.heading_font,
                  fontSize: `${1.45 * headingScaleMultiplier}rem`,
                  fontWeight: formData.font_weight,
                  color: '#0B192C',
                  margin: '0.25rem 0 0.5rem 0',
                }}
              >
                {formData.welcome_heading}
              </h3>
              <p
                style={{
                  fontFamily: formData.body_font,
                  fontSize: '0.85rem',
                  color: '#475569',
                  lineHeight: formData.line_height,
                  marginBottom: 0,
                }}
              >
                {formData.welcome_content}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

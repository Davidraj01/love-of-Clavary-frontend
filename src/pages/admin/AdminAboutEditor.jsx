import React, { useState, useEffect } from 'react';
import { api, getMediaUrl } from '../../services/api';
import { useSiteContent } from '../../context/SiteContentContext';
import { ROUTES } from '../../routes/routes';
import { FontTypographyControls, ensureGoogleFontsLoaded } from '../../components/FontTypographyControls';
import { 
  Save, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  BookOpen, 
  Heart, 
  Anchor, 
  Eye, 
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

export const AdminAboutEditor = () => {
  const { refreshContent } = useSiteContent();
  const [formData, setFormData] = useState({
    badge: 'Our Ministry Story',
    headline: 'About Compassionate Love of Calvary',
    subheadline: 'A ministry established on the unchanging foundation of Calvary grace, dedicated to loving God and serving people.',
    story_badge: 'Our Journey',
    story_title: 'Rooted in Faith, Driven by Compassion',
    story_p1: 'Compassionate Love of Calvary Ministries was born out of a profound conviction: that the sacrificial love demonstrated by Jesus Christ on Calvary Cross is the greatest source of healing, restoration, and hope for a hurting world.',
    story_p2: 'From our beginning in the Chengalpattu region, we have remained committed to simple, powerful principles—proclaiming the pure Gospel of Jesus Christ, lifting families through fervent intercessory prayer, providing spiritual nourishment through sound Biblical teaching, and extending practical compassion to our surrounding community.',
    story_p3: 'We believe that every individual is deeply precious to God. Regardless of background, past mistakes, or current trials, the Cross of Christ is an open door to peace, reconciliation, and new beginnings.',
    story_image_url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1000&q=80',
    mission_title: 'Our Mission',
    mission_text: 'To proclaim the transforming Gospel of Jesus Christ, disciple believers in Biblical truth, support families through intercessory prayer, and actively serve our community with Christ-like compassion and humility.',
    vision_title: 'Our Vision',
    vision_text: 'To be a radiant beacon of spiritual hope and renewal across Chengalpattu and beyond—where the broken are restored, faith is fortified, and lives are empowered to reflect God\'s glory in every walk of life.',
    values_badge: 'What Drives Us',
    values_title: 'Our Core Values',
    values_subtitle: 'The Biblical pillars that guide our pastoral care, fellowship, and service.',
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
        const data = await api.getAdminAboutContent();
        if (data && Object.keys(data).length > 0) {
          setFormData((prev) => ({ ...prev, ...data }));
          ensureGoogleFontsLoaded([data.heading_font, data.body_font]);
        }
      } catch (err) {
        console.error('Failed to load About content:', err);
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
      await api.updateAdminAboutContent(formData);
      await refreshContent();
      setFeedback({ type: 'success', text: 'About page content and typography settings successfully updated and live!' });
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
        <p>Loading About Page Editor...</p>
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
    <div className="admin-about-editor">
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: 'var(--gold-dark)' }}>About Page</span> &amp; Font Styling Editor
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Manage the About page story, mission, vision, values, images, and font styles with instant live responsive preview.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a
            href={ROUTES.ABOUT}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-navy btn-sm"
            style={{ border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ExternalLink size={14} /> View Live About Page
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
        pageName="About Page"
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
              <span>Header Banner &amp; Intro</span>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Header Badge Text</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => handleChange('badge', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Main Page Headline</label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => handleChange('headline', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Subheadline / Intro</label>
              <textarea
                rows={3}
                value={formData.subheadline}
                onChange={(e) => handleChange('subheadline', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>
          </div>

          {/* Section 2: Our Journey & Story */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="editor-section-title">
              <BookOpen size={18} color="var(--gold-dark)" />
              <span>Our Story &amp; Journey</span>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Story Section Badge</label>
              <input
                type="text"
                value={formData.story_badge}
                onChange={(e) => handleChange('story_badge', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Story Title</label>
              <input
                type="text"
                value={formData.story_title}
                onChange={(e) => handleChange('story_title', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Story Paragraph 1</label>
              <textarea
                rows={3}
                value={formData.story_p1}
                onChange={(e) => handleChange('story_p1', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Story Paragraph 2</label>
              <textarea
                rows={3}
                value={formData.story_p2}
                onChange={(e) => handleChange('story_p2', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Story Paragraph 3</label>
              <textarea
                rows={3}
                value={formData.story_p3}
                onChange={(e) => handleChange('story_p3', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Story Image URL</label>
              <input
                type="text"
                value={formData.story_image_url}
                onChange={(e) => handleChange('story_image_url', e.target.value)}
                placeholder="https://... or upload in Images manager"
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>
          </div>

          {/* Section 3: Mission & Vision */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="editor-section-title">
              <Anchor size={18} color="var(--gold-dark)" />
              <span>Mission &amp; Vision</span>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Mission Title</label>
              <input
                type="text"
                value={formData.mission_title}
                onChange={(e) => handleChange('mission_title', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Mission Statement</label>
              <textarea
                rows={3}
                value={formData.mission_text}
                onChange={(e) => handleChange('mission_text', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Vision Title</label>
              <input
                type="text"
                value={formData.vision_title}
                onChange={(e) => handleChange('vision_title', e.target.value)}
                className="admin-form-control"
                style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ color: '#334155' }}>Vision Statement</label>
              <textarea
                rows={3}
                value={formData.vision_text}
                onChange={(e) => handleChange('vision_text', e.target.value)}
                className="admin-form-control"
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
            {saving ? 'Saving...' : 'Save All About Page Changes'}
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
                {formData.badge}
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
                {formData.headline}
              </h2>
              <p style={{ fontFamily: formData.body_font, fontSize: '0.9rem', color: '#94A3B8', maxWidth: '90%', margin: '0 auto', lineHeight: '1.6' }}>
                {formData.subheadline}
              </p>
            </div>

            {/* Story Card Simulator */}
            <div style={{ padding: '1.5rem', background: '#FBF9F5', color: '#1E293B' }}>
              <span style={{ fontSize: '0.75rem', color: formData.accent_color, fontWeight: 700, textTransform: 'uppercase' }}>
                {formData.story_badge}
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
                {formData.story_title}
              </h3>
              <p style={{ fontFamily: formData.body_font, fontSize: '0.85rem', color: '#475569', lineHeight: formData.line_height, marginBottom: '0.75rem' }}>
                {formData.story_p1}
              </p>
              {formData.story_image_url && getMediaUrl(formData.story_image_url) && (
                <div style={{ borderRadius: '8px', overflow: 'hidden', height: '140px', marginBottom: '1rem' }}>
                  <img 
                    src={getMediaUrl(formData.story_image_url) || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1000&q=80'} 
                    alt="Story preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              )}

              {/* Mission & Vision Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: previewDevice === 'mobile' ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', borderLeft: `3px solid ${formData.accent_color}`, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                  <h4 style={{ fontFamily: formData.heading_font, fontSize: '1.1rem', margin: '0 0 0.4rem 0', color: '#0B192C' }}>
                    {formData.mission_title}
                  </h4>
                  <p style={{ fontFamily: formData.body_font, fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
                    {formData.mission_text}
                  </p>
                </div>
                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', borderLeft: `3px solid ${formData.accent_color}`, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                  <h4 style={{ fontFamily: formData.heading_font, fontSize: '1.1rem', margin: '0 0 0.4rem 0', color: '#0B192C' }}>
                    {formData.vision_title}
                  </h4>
                  <p style={{ fontFamily: formData.body_font, fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
                    {formData.vision_text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

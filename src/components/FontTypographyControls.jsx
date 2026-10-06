import React, { useEffect } from 'react';
import { Type, Palette, Sliders, Smartphone, Tablet, Monitor, Check } from 'lucide-react';

export const FONT_HEADING_OPTIONS = [
  { name: 'Cormorant Garamond (Classic Sacred Serif)', value: 'Cormorant Garamond' },
  { name: 'Playfair Display (Elegant Editorial Serif)', value: 'Playfair Display' },
  { name: 'Cinzel (Majestic Roman Serif)', value: 'Cinzel' },
  { name: 'Merriweather (Warm Traditional Serif)', value: 'Merriweather' },
  { name: 'Lora (Contemporary Literary Serif)', value: 'Lora' },
  { name: 'Outfit (Modern Clean Sans)', value: 'Outfit' },
  { name: 'Montserrat (Bold Architectural Sans)', value: 'Montserrat' },
  { name: 'Poppins (Friendly Geometric Sans)', value: 'Poppins' },
  { name: 'Inter (Precision Neutral Sans)', value: 'Inter' },
];

export const FONT_BODY_OPTIONS = [
  { name: 'Inter (Ultra Legible Sans)', value: 'Inter' },
  { name: 'Outfit (Modern Clean Sans)', value: 'Outfit' },
  { name: 'Poppins (Geometric Sans)', value: 'Poppins' },
  { name: 'Roboto (Clear Balanced Sans)', value: 'Roboto' },
  { name: 'Open Sans (Neutral Reading Sans)', value: 'Open Sans' },
  { name: 'Merriweather (Gentle Serif Body)', value: 'Merriweather' },
];

export const COLOR_PRESETS = [
  { name: 'Calvary Gold', hex: '#D4AF37' },
  { name: 'Royal Gold', hex: '#E5C158' },
  { name: 'Deep Calvary Navy', hex: '#0B192C' },
  { name: 'Sacred Burgundy', hex: '#7A1E32' },
  { name: 'Heavenly Amber', hex: '#F59E0B' },
  { name: 'Emerald Grace', hex: '#059669' },
  { name: 'Midnight Sapphire', hex: '#1E3A8A' },
  { name: 'Warm Charcoal', hex: '#1E293B' },
];

// Dynamically load Google Font families into document head
export const ensureGoogleFontsLoaded = (fontFamilies = []) => {
  if (typeof document === 'undefined') return;
  const validFamilies = fontFamilies.filter(Boolean);
  if (!validFamilies.length) return;

  const fontQuery = validFamilies
    .map((f) => `family=${encodeURIComponent(f)}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&`)
    .join('');

  const fontHref = `https://fonts.googleapis.com/css2?${fontQuery}display=swap`;
  const existingLink = document.querySelector(`link[data-calvary-font]`);

  if (existingLink) {
    if (existingLink.getAttribute('href') !== fontHref) {
      existingLink.setAttribute('href', fontHref);
    }
  } else {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.setAttribute('data-calvary-font', 'true');
    link.href = fontHref;
    document.head.appendChild(link);
  }
};

export const FontTypographyControls = ({
  values,
  onChange,
  pageName = 'This Page',
  previewDevice = 'desktop',
  onDeviceChange,
}) => {
  useEffect(() => {
    ensureGoogleFontsLoaded([values.heading_font, values.body_font]);
  }, [values.heading_font, values.body_font]);

  return (
    <div className="font-typography-controls-wrapper" style={{ marginBottom: '2rem' }}>
      <div className="editor-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Type size={20} color="var(--gold-dark)" />
          <span>{pageName} Typography &amp; Font Styling</span>
        </div>
        {onDeviceChange && (
          <div className="device-preview-switcher" style={{ display: 'flex', gap: '0.35rem', background: '#F1F5F9', padding: '0.25rem', borderRadius: '8px' }}>
            <button
              type="button"
              className={`device-btn ${previewDevice === 'desktop' ? 'active' : ''}`}
              onClick={() => onDeviceChange('desktop')}
              title="Desktop View"
              style={{
                border: 'none',
                background: previewDevice === 'desktop' ? '#FFFFFF' : 'transparent',
                boxShadow: previewDevice === 'desktop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: previewDevice === 'desktop' ? 'var(--bg-dark)' : '#64748B',
              }}
            >
              <Monitor size={14} /> Desktop
            </button>
            <button
              type="button"
              className={`device-btn ${previewDevice === 'tablet' ? 'active' : ''}`}
              onClick={() => onDeviceChange('tablet')}
              title="Tablet View"
              style={{
                border: 'none',
                background: previewDevice === 'tablet' ? '#FFFFFF' : 'transparent',
                boxShadow: previewDevice === 'tablet' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: previewDevice === 'tablet' ? 'var(--bg-dark)' : '#64748B',
              }}
            >
              <Tablet size={14} /> Tablet
            </button>
            <button
              type="button"
              className={`device-btn ${previewDevice === 'mobile' ? 'active' : ''}`}
              onClick={() => onDeviceChange('mobile')}
              title="Mobile View"
              style={{
                border: 'none',
                background: previewDevice === 'mobile' ? '#FFFFFF' : 'transparent',
                boxShadow: previewDevice === 'mobile' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: previewDevice === 'mobile' ? 'var(--bg-dark)' : '#64748B',
              }}
            >
              <Smartphone size={14} /> Mobile
            </button>
          </div>
        )}
      </div>

      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {/* Heading Font Family */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Heading Font Family
            </label>
            <select
              value={values.heading_font || 'Cormorant Garamond'}
              onChange={(e) => onChange('heading_font', e.target.value)}
              className="admin-form-control"
              style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
            >
              {FONT_HEADING_OPTIONS.map((f) => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Body Font Family */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Body / Paragraph Font Family
            </label>
            <select
              value={values.body_font || 'Inter'}
              onChange={(e) => onChange('body_font', e.target.value)}
              className="admin-form-control"
              style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
            >
              {FONT_BODY_OPTIONS.map((f) => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary styling attributes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Heading Scale
            </label>
            <select
              value={values.heading_size || 'normal'}
              onChange={(e) => onChange('heading_size', e.target.value)}
              className="admin-form-control"
              style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1', padding: '0.55rem' }}
            >
              <option value="compact">Compact (0.9x)</option>
              <option value="normal">Standard (1.0x)</option>
              <option value="large">Large (1.15x)</option>
              <option value="extra-large">Extra Large (1.3x)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Font Weight
            </label>
            <select
              value={values.font_weight || '600'}
              onChange={(e) => onChange('font_weight', e.target.value)}
              className="admin-form-control"
              style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1', padding: '0.55rem' }}
            >
              <option value="400">Regular (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semi-Bold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">Extra Bold (800)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Line Height
            </label>
            <select
              value={values.line_height || '1.6'}
              onChange={(e) => onChange('line_height', e.target.value)}
              className="admin-form-control"
              style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1', padding: '0.55rem' }}
            >
              <option value="1.3">1.3 (Tight)</option>
              <option value="1.45">1.45 (Balanced)</option>
              <option value="1.6">1.6 (Standard)</option>
              <option value="1.8">1.8 (Relaxed)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Letter Spacing
            </label>
            <select
              value={values.letter_spacing || 'normal'}
              onChange={(e) => onChange('letter_spacing', e.target.value)}
              className="admin-form-control"
              style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1', padding: '0.55rem' }}
            >
              <option value="-0.02em">Tight (-0.02em)</option>
              <option value="normal">Normal (0)</option>
              <option value="0.04em">Spaced (0.04em)</option>
              <option value="0.08em">Wide (0.08em)</option>
            </select>
          </div>
        </div>

        {/* Color Palette & Accents */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
            Accent &amp; Theme Colors
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              {COLOR_PRESETS.map((col) => (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => onChange('accent_color', col.hex)}
                  title={col.name}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: col.hex,
                    border: values.accent_color === col.hex ? '3px solid #0F172A' : '1px solid rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  {values.accent_color === col.hex && <Check size={14} color={col.hex === '#FBF9F5' || col.hex === '#E5C158' ? '#000' : '#FFF'} />}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Custom Hex:</span>
              <input
                type="color"
                value={values.accent_color || '#D4AF37'}
                onChange={(e) => onChange('accent_color', e.target.value)}
                style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={values.accent_color || '#D4AF37'}
                onChange={(e) => onChange('accent_color', e.target.value)}
                className="admin-form-control"
                style={{ width: '90px', padding: '0.35rem 0.5rem', fontSize: '0.8rem', background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

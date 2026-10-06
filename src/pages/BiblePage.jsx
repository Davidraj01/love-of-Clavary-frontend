import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSiteContent } from '../context/SiteContentContext';
import { BookOpen, Sparkles, CheckCircle2, Bookmark, Heart, Sun, Feather } from 'lucide-react';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { ensureGoogleFontsLoaded } from '../components/FontTypographyControls';
import { PageSEOSection } from '../components/PageSEOSection';

export const BiblePage = () => {
  const { bibleData: contextBibleData } = useSiteContent();
  const [bibleData, setBibleData] = useState(contextBibleData || null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(!contextBibleData);

  useEffect(() => {
    if (contextBibleData) {
      setBibleData(contextBibleData);
      setLoading(false);
      if (contextBibleData.content) {
        ensureGoogleFontsLoaded([contextBibleData.content.heading_font, contextBibleData.content.body_font]);
      }
    } else {
      const fetchBible = async () => {
        try {
          const data = await api.getBibleResources();
          setBibleData(data);
          if (data?.content) {
            ensureGoogleFontsLoaded([data.content.heading_font, data.content.body_font]);
          }
        } catch (err) {
          console.error('Failed to load Bible resources:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchBible();
    }
  }, [contextBibleData]);

  const content = bibleData?.content || {};
  const headingFont = content.heading_font ? `'${content.heading_font}', Georgia, serif` : 'var(--font-heading)';
  const bodyFont = content.body_font ? `'${content.body_font}', sans-serif` : 'var(--font-body)';
  const accentColor = content.accent_color || 'var(--gold-primary)';
  const fontWeight = content.font_weight || '600';
  const lineHeight = content.line_height || '1.7';

  const categories = ['All', 'Salvation & Grace', 'Hope & Assurance', 'Peace & Comfort', 'Prayer & Peace', 'Strength & Renewal', 'Christian Love'];

  const filteredVerses = bibleData?.featured_scriptures?.filter(v => 
    selectedCategory === 'All' || v.category === selectedCategory
  ) || [];

  return (
    <div className="bible-page" style={{ paddingTop: '5.5rem', fontFamily: bodyFont }}>
      {/* Header Banner */}
      <section className="section section-dark" style={{ textAlign: 'center', padding: '5rem 0', position: 'relative' }}>
        <ParticleCanvas count={25} />
        <div className="container container-narrow" style={{ position: 'relative', zIndex: 3 }}>
          <span className="section-badge" style={{ color: accentColor }}>
            {content.header_badge || 'Living Word of God'}
          </span>
          <h1 style={{ color: '#FFFFFF', marginBottom: '1rem', fontFamily: headingFont, fontWeight }}>
            {content.header_title || 'The Holy Scriptures'}
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-light-muted)', lineHeight }}>
            {content.header_quote || '“Your word is a lamp for my feet, a light on my path.” — Psalm 119:105'}
          </p>
        </div>
      </section>

      {/* Introduction to God's Word */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <span className="section-badge" style={{ color: accentColor }}>
                {content.intro_badge || 'Divine Wisdom'}
              </span>
              <h2 className="section-title" style={{ fontFamily: headingFont, fontWeight }}>
                {content.intro_title || 'An Inexhaustible Wellspring of Grace'}
              </h2>
              <p style={{ fontSize: '1.05rem', lineHeight, color: 'var(--text-dark)' }}>
                {content.intro_text1 || 'The Bible is God\'s living, inspired revelation to mankind. Within its sacred pages, we discover God\'s eternal plan of redemption through Jesus Christ, comforting promises in times of distress, and practical wisdom for every dimension of daily life.'}
              </p>
              <p style={{ fontSize: '1.05rem', lineHeight }}>
                {content.intro_text2 || 'At Compassionate Love of Calvary Ministries, we cherish the Scriptures as our final authority for faith, worship, and love. We invite you to meditate upon these curated passages and let the Holy Spirit renew your mind and fortify your spirit.'}
              </p>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', borderLeft: `4px solid ${accentColor}` }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontFamily: headingFont }}>
                <Feather size={22} color={accentColor} /> {content.tips_title || 'Bible Reading Encouragement'}
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0 }}>
                {(bibleData?.study_tips || []).map((tip, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    <CheckCircle2 size={18} color={accentColor} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter & Featured Verses */}
      <section className="section section-cream">
        <div className="container">
          <div className="section-header">
            <span className="section-badge" style={{ color: accentColor }}>Scripture Library</span>
            <h2 className="section-title" style={{ fontFamily: headingFont, fontWeight }}>Featured Verses of Faith &amp; Peace</h2>
            <p className="section-subtitle">
              Filter by spiritual theme to find uplifting promises for your heart.
            </p>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', marginTop: '2rem' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`btn btn-sm ${selectedCategory === cat ? 'btn-gold' : 'btn-outline-gold'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading scriptures...</p>
          ) : (
            <div className="grid-2" style={{ gap: '2rem' }}>
              {filteredVerses.map((verse) => (
                <div key={verse.id} className="devotional-card" style={{ padding: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span className="section-badge" style={{ margin: 0, color: accentColor }}>{verse.category}</span>
                    <Bookmark size={18} color={accentColor} />
                  </div>
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--bg-dark)', marginBottom: '1rem', fontFamily: headingFont }}>
                    {verse.reference}
                  </h3>
                  <div className="devotional-verse-box" style={{ borderLeftColor: accentColor }}>
                    <p className="devotional-verse-text" style={{ fontSize: '1.25rem', fontFamily: headingFont }}>
                      &ldquo;{verse.text}&rdquo;
                    </p>
                  </div>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight, margin: '1rem 0 0 0' }}>
                    <strong>Pastoral Reflection:</strong> {verse.reflection}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Guided Reading Plans */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge" style={{ color: accentColor }}>Systematic Devotion</span>
            <h2 className="section-title" style={{ fontFamily: headingFont, fontWeight }}>Scripture Reading Plans</h2>
            <p className="section-subtitle">
              Structured devotional journeys to enrich your personal quiet time with God.
            </p>
          </div>

          <div className="grid-4">
            {bibleData?.reading_plans?.map((plan, i) => (
              <div key={i} className="mission-card" style={{ textAlign: 'left', padding: '2rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {plan.duration}
                </span>
                <h4 style={{ fontSize: '1.25rem', margin: '0.5rem 0 0.75rem 0', fontFamily: headingFont }}>{plan.title}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 0 }}>
                  <strong>Focus:</strong> {plan.focus}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic SEO Body & Content Article Section */}
      <PageSEOSection 
        pageIdentifier="bible" 
        defaultTitle="Holy Scriptures & Bible Reading Plans | Compassionate Love of Calvary Ministries" 
        defaultDesc="Explore the living Word of God with guided Bible reading plans, scripture promises, and pastoral reflections."
      />
    </div>
  );
};

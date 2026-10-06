import React, { useState, useEffect } from 'react';
import { api, getMediaUrl } from '../services/api';
import { useSiteContent } from '../context/SiteContentContext';
import { Clock, Calendar, Heart, Music, Users, BookOpen, Flame, Smile, HandHeart, Sparkles } from 'lucide-react';
import { PrayerModal } from '../components/PrayerModal';
import { ensureGoogleFontsLoaded } from '../components/FontTypographyControls';
import { PageSEOSection } from '../components/PageSEOSection';

export const MinistriesPage = () => {
  const { ministriesData: contextMinistriesData } = useSiteContent();
  const [ministries, setMinistries] = useState([]);
  const [headerContent, setHeaderContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMinistry, setSelectedMinistry] = useState(null);
  const [prayerModalOpen, setPrayerModalOpen] = useState(false);

  useEffect(() => {
    if (contextMinistriesData) {
      setHeaderContent(contextMinistriesData.content || {});
      setMinistries(contextMinistriesData.ministries || []);
      setLoading(false);
      if (contextMinistriesData.content) {
        ensureGoogleFontsLoaded([contextMinistriesData.content.heading_font, contextMinistriesData.content.body_font]);
      }
    } else {
      const fetchMinistries = async () => {
        try {
          const data = await api.getMinistriesPageContent();
          setHeaderContent(data?.content || {});
          setMinistries(data?.ministries || []);
          if (data?.content) {
            ensureGoogleFontsLoaded([data.content.heading_font, data.content.body_font]);
          }
        } catch (err) {
          console.error('Failed to load ministries:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchMinistries();
    }
  }, [contextMinistriesData]);

  const headingFont = headerContent?.heading_font ? `'${headerContent.heading_font}', Georgia, serif` : 'var(--font-heading)';
  const bodyFont = headerContent?.body_font ? `'${headerContent.body_font}', sans-serif` : 'var(--font-body)';
  const accentColor = headerContent?.accent_color || 'var(--gold-primary)';
  const fontWeight = headerContent?.font_weight || '600';
  const lineHeight = headerContent?.line_height || '1.7';

  const getMinistryIcon = (iconName) => {
    switch (iconName) {
      case 'Music': return <Music size={22} />;
      case 'HandsHelping': return <HandHeart size={22} />;
      case 'HandHeart': return <HandHeart size={22} />;
      case 'Sparkles': return <Sparkles size={22} />;
      case 'Smile': return <Smile size={22} />;
      case 'HeartHandshake': return <Heart size={22} />;
      case 'Users': return <Users size={22} />;
      case 'BookOpen': return <BookOpen size={22} />;
      case 'Flame': return <Flame size={22} />;
      case 'Heart': return <Heart size={22} />;
      default: return <Heart size={22} />;
    }
  };

  return (
    <div className="ministries-page" style={{ paddingTop: '5.5rem', fontFamily: bodyFont }}>
      {/* Hero Header */}
      <section className="section section-dark" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="container container-narrow">
          <span className="section-badge" style={{ color: accentColor }}>
            {headerContent?.header_badge || 'Serving with Christ-Like Compassion'}
          </span>
          <h1 style={{ color: '#FFFFFF', marginBottom: '1rem', fontFamily: headingFont, fontWeight }}>
            {headerContent?.header_title || 'Ministries That Serve With Love'}
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-light-muted)', lineHeight }}>
            {headerContent?.header_description || 'Each ministry at Compassionate Love of Calvary is designed to help you encounter God, build spiritual depth, and put faith into loving service.'}
          </p>
        </div>
      </section>

      {/* Grid of Ministries */}
      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212,175,55,0.3)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
              <p>Loading Ministries...</p>
            </div>
          ) : (
            <div className="grid-3">
              {ministries.map((min) => (
                <div key={min.id} className="ministry-card">
                  <div className="ministry-img-wrap">
                    <img 
                      src={getMediaUrl(min.image_url) || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'} 
                      alt={min.title} 
                      className="ministry-img" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(11,25,44,0.85)', color: accentColor, padding: '0.5rem', borderRadius: 'var(--radius-full)', backdropFilter: 'blur(4px)' }}>
                      {getMinistryIcon(min.icon_name)}
                    </div>
                  </div>
                  <div className="ministry-body">
                    <h3 style={{ fontFamily: headingFont, fontWeight }}>{min.title}</h3>
                    <p style={{ marginBottom: '1rem', lineHeight }}>{min.summary}</p>
                    
                    {min.meeting_time && (
                      <div className="ministry-meta" style={{ color: accentColor }}>
                        <Clock size={15} /> <span>{min.meeting_time}</span>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedMinistry(min)}
                      className="btn btn-outline-gold btn-sm"
                      style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
                    >
                      Explore Ministry &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Ministry Detail Modal */}
          {selectedMinistry && (
            <div className="modal-overlay" onClick={() => setSelectedMinistry(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
                <button className="modal-close-btn" onClick={() => setSelectedMinistry(null)}>
                  &times;
                </button>

                <div style={{ height: '240px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <img 
                    src={getMediaUrl(selectedMinistry.image_url) || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'} 
                    alt={selectedMinistry.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span className="section-badge" style={{ margin: 0, color: accentColor }}>
                    {selectedMinistry.icon_name}
                  </span>
                  {selectedMinistry.meeting_time && (
                    <span style={{ fontSize: '0.85rem', color: accentColor, fontWeight: 500 }}>
                      <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> {selectedMinistry.meeting_time}
                    </span>
                  )}
                </div>

                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: headingFont }}>{selectedMinistry.title}</h2>
                <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
                  {selectedMinistry.description}
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => { setSelectedMinistry(null); setPrayerModalOpen(true); }}
                    className="btn btn-gold"
                  >
                    Request Ministry Prayer &rarr;
                  </button>
                  <button 
                    onClick={() => setSelectedMinistry(null)}
                    className="btn btn-outline-navy"
                    style={{ border: '1px solid var(--border-subtle)' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Volunteer Invitation */}
      <section className="section section-cream" style={{ textAlign: 'center' }}>
        <div className="container container-narrow">
          <span className="section-badge" style={{ color: accentColor }}>Get Involved</span>
          <h2 style={{ fontFamily: headingFont, fontWeight }}>Join a Ministry Team</h2>
          <p style={{ fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto 2rem auto', lineHeight }}>
            God has gifted each person with unique talents and gifts. We welcome you to participate and serve with joy.
          </p>
          <button onClick={() => setPrayerModalOpen(true)} className="btn btn-navy btn-lg">
            Connect With Our Pastoral Team &rarr;
          </button>
        </div>
      </section>

      {/* Dynamic SEO Body & Content Article Section */}
      <PageSEOSection 
        pageIdentifier="ministries" 
        defaultTitle="Church Ministries & Community Outreach | Compassionate Love of Calvary" 
        defaultDesc="Discover Christ-centered ministries serving youth, women, families, and community outreach in Chengalpattu."
      />

      <PrayerModal isOpen={prayerModalOpen} onClose={() => setPrayerModalOpen(false)} />
    </div>
  );
};

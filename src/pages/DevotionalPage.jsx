import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSiteContent } from '../context/SiteContentContext';
import { Calendar, Heart, BookOpen, User, Feather, Share2 } from 'lucide-react';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { PageSEOSection } from '../components/PageSEOSection';

export const DevotionalPage = () => {
  const { devotionalData } = useSiteContent();
  const [devotionals, setDevotionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevo, setSelectedDevo] = useState(null);

  useEffect(() => {
    const fetchDevotionals = async () => {
      try {
        const data = await api.getDevotionals();
        setDevotionals(data);
        if (data.length > 0) {
          setSelectedDevo(data[0]); // Default to today's devotional
        }
      } catch (err) {
        console.error('Failed to load devotionals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevotionals();
  }, []);

  const headerBadge = devotionalData?.header_badge || "Daily Bread & Morning Dew";
  const headerTitle = devotionalData?.header_title || "Daily Devotionals";
  const headerDesc = devotionalData?.header_description || "Quiet your soul and begin each morning in the warm presence and comforting promises of our Lord.";

  return (
    <div className="devotional-page" style={{ paddingTop: '5.5rem' }}>
      {/* Header */}
      <section className="section section-dark" style={{ textAlign: 'center', padding: '5rem 0', position: 'relative' }}>
        <ParticleCanvas count={25} />
        <div className="container container-narrow" style={{ position: 'relative', zIndex: 3 }}>
          <span className="section-badge">{headerBadge}</span>
          <h1 style={{ color: '#FFFFFF', marginBottom: '1rem' }}>{headerTitle}</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-light-muted)' }}>
            {headerDesc}
          </p>
        </div>
      </section>


      {/* Main Devotional Reader & Archive */}
      <section className="section">
        <div className="container">
          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading daily devotionals...</p>
          ) : selectedDevo ? (
            <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr', gap: '3.5rem', alignItems: 'flex-start' }}>
              {/* Featured / Selected Devotional Reader */}
              <article style={{ background: '#FFFFFF', padding: '3.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <span className="section-badge" style={{ margin: 0 }}>
                    <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    {selectedDevo.date}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {selectedDevo.author}
                  </span>
                </div>

                <h2 style={{ fontSize: '2.4rem', color: 'var(--bg-dark)', marginBottom: '1.5rem' }}>
                  {selectedDevo.title}
                </h2>

                {/* Scripture Verse Highlight */}
                <div className="devotional-verse-box" style={{ background: 'var(--bg-secondary)', padding: '2rem', margin: '2rem 0' }}>
                  <p className="devotional-verse-text" style={{ fontSize: '1.35rem', color: 'var(--bg-dark)' }}>
                    &ldquo;{selectedDevo.scripture_text}&rdquo;
                  </p>
                  <span className="devotional-verse-ref" style={{ fontSize: '0.95rem' }}>
                    &mdash; {selectedDevo.scripture_verse}
                  </span>
                </div>

                {/* Pastoral Reflection */}
                <h3 style={{ fontSize: '1.35rem', margin: '2rem 0 1rem 0', color: 'var(--bg-dark)' }}>
                  Today&apos;s Meditation
                </h3>
                <div style={{ fontSize: '1.1rem', lineHeight: '1.9', color: 'var(--text-dark)', marginBottom: '2.5rem' }}>
                  {selectedDevo.reflection}
                </div>

                {/* Closing Heartfelt Prayer */}
                <div style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(243,236,226,0.5) 100%)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
                  <h4 style={{ fontSize: '1.15rem', color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Heart size={18} /> Today&apos;s Prayer
                  </h4>
                  <p style={{ fontStyle: 'italic', fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-dark)', margin: 0 }}>
                    {selectedDevo.prayer}
                  </p>
                </div>
              </article>

              {/* Devotional Archive List */}
              <aside>
                <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    Devotional Archive
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {devotionals.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDevo(d)}
                        style={{
                          padding: '1rem',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          background: selectedDevo.id === d.id ? 'var(--gold-subtle)' : '#FFFFFF',
                          border: selectedDevo.id === d.id ? '1px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', color: 'var(--gold-dark)', fontWeight: 600 }}>
                          {d.date}
                        </span>
                        <h4 style={{ fontSize: '1.05rem', margin: '0.25rem 0' }}>{d.title}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.scripture_verse}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            <p>No devotionals available at this time.</p>
          )}
        </div>
      </section>

      {/* Dynamic SEO Body & Content Article Section */}
      <PageSEOSection 
        pageIdentifier="devotional" 
        defaultTitle="Daily Christian Devotionals & Morning Prayer | Calvary Ministries" 
        defaultDesc="Quiet your soul and begin each morning in the warm presence and comforting promises of our Lord."
      />
    </div>
  );
};

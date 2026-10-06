import React, { useState, useEffect } from 'react';
import { api, getMediaUrl } from '../services/api';
import { useSiteContent } from '../context/SiteContentContext';
import { Play, Calendar, User, BookOpen, Volume2, Video, X } from 'lucide-react';
import { PageSEOSection } from '../components/PageSEOSection';

export const SermonsPage = () => {
  const { sermonsData } = useSiteContent();
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeMediaSermon, setActiveMediaSermon] = useState(null);

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        const data = await api.getSermons(selectedCategory);
        setSermons(data);
      } catch (err) {
        console.error('Failed to load sermons:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSermons();
  }, [selectedCategory]);

  const categories = ['All', 'Sunday Service', 'Bible Teaching', 'Worship Message', 'Encouragement', 'Testimony'];

  const headerBadge = sermonsData?.header_badge || "Proclamation of the Living Gospel";
  const headerTitle = sermonsData?.header_title || "Sermons & Messages of Hope";
  const headerDesc = sermonsData?.header_description || "Listen to inspiring Biblical messages delivered with apostolic conviction and Christ-centered grace.";

  return (
    <div className="sermons-page" style={{ paddingTop: '5.5rem' }}>
      {/* Header */}
      <section className="section section-dark" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="container container-narrow">
          <span className="section-badge">{headerBadge}</span>
          <h1 style={{ color: '#FFFFFF', marginBottom: '1rem' }}>{headerTitle}</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-light-muted)' }}>
            {headerDesc}
          </p>
        </div>
      </section>


      {/* Category Tabs & Grid */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`btn btn-sm ${selectedCategory === c ? 'btn-gold' : 'btn-outline-gold'}`}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading sermons...</p>
          ) : (
            <div className="grid-3">
              {sermons.map((sermon) => (
                <div key={sermon.id} className="sermon-card">
                  <div className="sermon-thumb-wrap">
                    <img 
                      src={getMediaUrl(sermon.thumbnail_url) || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80'} 
                      alt={sermon.title} 
                      className="sermon-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div 
                      className="sermon-play-overlay"
                      onClick={() => setActiveMediaSermon(sermon)}
                    >
                      <div className="sermon-play-btn">
                        <Play size={22} fill="currentColor" />
                      </div>
                    </div>
                  </div>

                  <div className="sermon-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gold-dark)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                        {sermon.category}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {sermon.duration}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                      {sermon.title}
                    </h3>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      <User size={13} style={{ display: 'inline', marginRight: '4px' }} /> {sermon.speaker} &bull; <BookOpen size={13} style={{ display: 'inline', margin: '0 4px' }} /> {sermon.scripture}
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                      {sermon.notes}
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => setActiveMediaSermon(sermon)}
                        className="btn btn-gold btn-sm"
                        style={{ flexGrow: 1 }}
                      >
                        <Video size={14} /> Watch Video
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Video Player Modal */}
          {activeMediaSermon && (
            <div className="modal-overlay" onClick={() => setActiveMediaSermon(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', padding: '2rem' }}>
                <button className="modal-close-btn" onClick={() => setActiveMediaSermon(null)}>
                  &times;
                </button>

                <h3 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>{activeMediaSermon.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Speaker: {activeMediaSermon.speaker} | Scripture: {activeMediaSermon.scripture} | Date: {activeMediaSermon.date}
                </p>

                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)', background: '#000', marginBottom: '1.5rem' }}>
                  <iframe
                    src={activeMediaSermon.video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                    title={activeMediaSermon.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <p style={{ fontSize: '1rem', lineHeight: '1.7', color: 'var(--text-dark)' }}>
                  {activeMediaSermon.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Dynamic SEO Body & Content Article Section */}
      <PageSEOSection 
        pageIdentifier="sermons" 
        defaultTitle="Gospel Sermons & Christian Video Messages | Calvary Ministries" 
        defaultDesc="Watch and listen to uplifting Biblical messages, Sunday worship sermons, and Christ-centered teachings from Compassionate Love of Calvary Ministries."
      />
    </div>
  );
};

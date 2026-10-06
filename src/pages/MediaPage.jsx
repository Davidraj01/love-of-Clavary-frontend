import React, { useState, useEffect } from 'react';
import { api, getMediaUrl } from '../services/api';
import { Image as ImageIcon, Video as VideoIcon, Play, X } from 'lucide-react';
import { PageSEOSection } from '../components/PageSEOSection';

export const MediaPage = () => {
  const [mediaData, setMediaData] = useState({ images: [], videos: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('images'); // 'images' | 'videos'
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const data = await api.getMedia();
        setMediaData(data);
      } catch (err) {
        console.error('Failed to load media:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  const formatVideoEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
      const id = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  };

  return (
    <div className="media-page" style={{ paddingTop: '5.5rem' }}>
      {/* Header */}
      <section className="section section-dark" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="container container-narrow">
          <span className="section-badge">Gallery of Faith in Action</span>
          <h1 style={{ color: '#FFFFFF', marginBottom: '1rem' }}>Media &amp; Gallery</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-light-muted)' }}>
            Glimpses of worship gatherings, prayer vigils, community outreaches, and heartfelt testimonies.
          </p>
        </div>
      </section>

      {/* Tabs & Gallery Grid */}
      <section className="section">
        <div className="container">
          {/* Tab Switcher */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3.5rem' }}>
            <button
              onClick={() => setActiveTab('images')}
              className={`btn btn-lg ${activeTab === 'images' ? 'btn-gold' : 'btn-outline-gold'}`}
            >
              <ImageIcon size={18} /> Photo Gallery ({mediaData.images?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`btn btn-lg ${activeTab === 'videos' ? 'btn-gold' : 'btn-outline-gold'}`}
            >
              <VideoIcon size={18} /> Video Sermons &amp; Chants ({mediaData.videos?.length || 0})
            </button>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading media...</p>
          ) : activeTab === 'images' ? (
            /* Images Tab */
            <div className="grid-3">
              {mediaData.images?.map((img) => {
                const imgSrc = getMediaUrl(img.url || img.external_url) || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80';
                return (
                  <div 
                    key={img.id} 
                    className="ministry-card" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedImage(img)}
                  >
                    <div className="ministry-img-wrap" style={{ height: '240px' }}>
                      <img 
                        src={imgSrc} 
                        alt={img.alt_text || img.title} 
                        className="ministry-img" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                    </div>
                    <div className="ministry-body" style={{ padding: '1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gold-dark)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                        {img.category} &bull; {img.folder}
                      </span>
                      <h4 style={{ fontSize: '1.15rem', margin: '0.4rem 0' }}>{img.title}</h4>
                      {img.description && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                          {img.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Videos Tab */
            <div className="grid-3">
              {mediaData.videos?.map((vid) => {
                const thumbSrc = getMediaUrl(vid.effective_thumbnail || vid.thumbnail_url) || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80';
                return (
                  <div key={vid.id} className="sermon-card">
                    <div className="sermon-thumb-wrap" style={{ height: '220px' }}>
                      <img 
                        src={thumbSrc} 
                        alt={vid.title} 
                        className="sermon-thumb" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div 
                        className="sermon-play-overlay"
                        onClick={() => setSelectedVideo(vid)}
                      >
                        <div className="sermon-play-btn">
                          <Play size={22} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <div className="sermon-info">
                      <span style={{ fontSize: '0.75rem', color: 'var(--gold-dark)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                        {vid.category} &bull; {vid.date}
                      </span>
                      <h3 style={{ fontSize: '1.25rem', margin: '0.4rem 0' }}>{vid.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Speaker: {vid.speaker}</p>
                      <button 
                        onClick={() => setSelectedVideo(vid)} 
                        className="btn btn-outline-gold btn-sm"
                        style={{ width: '100%', marginTop: '0.5rem' }}
                      >
                        <Play size={14} /> Play Video
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Lightbox for Photo */}
          {selectedImage && (
            <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', padding: '1.5rem' }}>
                <button className="modal-close-btn" onClick={() => setSelectedImage(null)}>
                  <X size={24} />
                </button>
                <img 
                  src={getMediaUrl(selectedImage.url || selectedImage.external_url) || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80'} 
                  alt={selectedImage.alt_text || selectedImage.title} 
                  style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }} 
                />
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{selectedImage.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{selectedImage.description}</p>
              </div>
            </div>
          )}

          {/* Video Player Modal */}
          {selectedVideo && (
            <div className="modal-overlay" onClick={() => setSelectedVideo(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', padding: '2rem' }}>
                <button className="modal-close-btn" onClick={() => setSelectedVideo(null)}>
                  <X size={24} />
                </button>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>{selectedVideo.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Speaker: {selectedVideo.speaker} | Category: {selectedVideo.category}
                </p>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)', background: '#000', marginBottom: '1rem' }}>
                  {selectedVideo.video_file || selectedVideo.effective_video_url?.endsWith('.mp4') || selectedVideo.video_url?.endsWith('.mp4') ? (
                    <video
                      src={getMediaUrl(selectedVideo.effective_video_url || selectedVideo.video_url)}
                      controls
                      autoPlay
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    />
                  ) : (
                    <iframe
                      src={formatVideoEmbedUrl(selectedVideo.effective_video_url || selectedVideo.video_url) || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                      title={selectedVideo.title}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-dark)' }}>{selectedVideo.description}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Dynamic SEO Body & Content Article Section */}
      <PageSEOSection 
        pageIdentifier="media" 
        defaultTitle="Ministry Photos & Video Gallery | Calvary Ministries" 
        defaultDesc="Glimpses of worship gatherings, prayer vigils, community outreaches, and heartfelt testimonies."
      />
    </div>
  );
};

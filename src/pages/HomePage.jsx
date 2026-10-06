import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes/routes';
import { useSiteContent } from '../context/SiteContentContext';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { PrayerModal } from '../components/PrayerModal';
import { DonationModal } from '../components/DonationModal';
import { SocialLinks } from '../components/SocialLinks';
import { 
  Heart, 
  Sparkles, 
  BookOpen, 
  Users, 
  HandHeart, 
  Calendar, 
  ArrowRight, 
  Play, 
  ChevronDown, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Shield 
} from 'lucide-react';
import { api, getMediaUrl } from '../services/api';
import { PageSEOSection } from '../components/PageSEOSection';

export const HomePage = () => {
  const { content, featuredMinistries, upcomingEvents, latestSermon, recentDevotional, testimonials } = useSiteContent();
  const [prayerModalOpen, setPrayerModalOpen] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  
  // Prayer Section Form State

  const [prayerForm, setPrayerForm] = useState({
    name: '',
    email: '',
    phone: '',
    request_text: '',
    is_private: true,
  });
  const [prayerSubmitting, setPrayerSubmitting] = useState(false);
  const [prayerSuccess, setPrayerSuccess] = useState('');
  const [prayerError, setPrayerError] = useState('');

  const handlePrayerSubmit = async (e) => {
    e.preventDefault();
    setPrayerSubmitting(true);
    setPrayerError('');
    setPrayerSuccess('');

    try {
      const res = await api.submitPrayerRequest(prayerForm);
      setPrayerSuccess(res.message || 'Your prayer request has been received with love.');
      setPrayerForm({ name: '', email: '', phone: '', request_text: '', is_private: true });
    } catch (err) {
      setPrayerError('Unable to send prayer request. Please check your fields and try again.');
    } finally {
      setPrayerSubmitting(false);
    }
  };

  const heroBg = getMediaUrl(content.hero_image_url) || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1920&q=80';

  return (
    <div className="home-page-container">
      {/* 1. HERO SECTION */}
      <section 
        className="hero-wrapper"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="hero-overlay" />
        <ParticleCanvas count={35} />

        <div className="hero-content animate-fade-in">
          <div className="hero-cross-silhouette">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
              <path d="M12 2v20" />
              <path d="M6 8h12" />
            </svg>
          </div>

          <div className="section-badge" style={{ color: 'var(--gold-light)', borderColor: 'rgba(212,175,55,0.4)', background: 'rgba(11,25,44,0.6)' }}>
            {content.hero_badge || 'COMPASSIONATE LOVE OF CALVARY MINISTRIES'}
          </div>

          <h1 className="hero-title" style={{ fontFamily: content.heading_font || 'Cormorant Garamond' }}>
            {content.hero_headline || 'Sharing the Love of Christ, Bringing Hope to Every Heart.'}
          </h1>

          <p className="hero-desc" style={{ fontFamily: content.body_font || 'Inter' }}>
            {content.hero_description || "A Christ-centered ministry devoted to sharing God's love, strengthening faith, serving others, and bringing hope through the transforming message of Jesus Christ."}
          </p>

          <div className="hero-actions">
            <Link to={ROUTES.MINISTRIES} className="btn btn-gold btn-lg">
              {content.hero_cta_primary || 'Discover Our Ministry'} &rarr;
            </Link>
            <button onClick={() => setPrayerModalOpen(true)} className="btn btn-outline-light btn-lg">
              <Heart size={18} color="var(--gold-primary)" /> {content.hero_cta_secondary || 'Join Us in Prayer'}
            </button>
          </div>
        </div>

        <div className="scroll-indicator">
          <span>Scroll to discover</span>
          <ChevronDown size={18} className="animate-bounce" />
        </div>
      </section>

      {/* 2. WELCOME SECTION (Split Layout) */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            {/* Left Image */}
            <div style={{ position: 'relative' }}>
              <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-subtle)' }}>
                <img 
                  src={getMediaUrl(content.welcome_image_url) || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1000&q=80'} 
                  alt="Compassionate Calvary Welcome"
                  style={{ width: '100%', height: '480px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1000&q=80';
                  }}
                />
              </div>
              <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', background: 'var(--bg-dark)', color: '#FFFFFF', padding: '1.5rem 2rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--gold-primary)', boxShadow: 'var(--shadow-md)', maxWidth: '240px' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-primary)', fontWeight: 600 }}>Christ Centered</span>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem', fontFamily: 'var(--font-heading)', color: '#FFFFFF', lineHeight: '1.3' }}>
                  Faith, Hope &amp; Compassion
                </p>
              </div>
            </div>

            {/* Right Story */}
            <div style={{ paddingLeft: '1rem' }}>
              <span className="section-badge">Welcome to Calvary</span>
              <h2 className="section-title">
                {content.welcome_heading || 'Welcome to a Place of Faith, Hope & Compassion'}
              </h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--gold-dark)', fontWeight: 500, marginBottom: '1.25rem' }}>
                {content.welcome_subheading || 'Walking together in the grace and boundless love of Jesus Christ.'}
              </p>
              <p style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
                {content.welcome_content || 'At Compassionate Love of Calvary Ministries, our doors and hearts are open to everyone. Rooted in prayer, anchored in Biblical truth, and energized by the Holy Spirit, we are dedicated to fostering a loving community where lives are restored, spiritual growth is nurtured, and the light of Christ shines through compassionate service.'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '2rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle2 size={20} color="var(--gold-primary)" />
                  <span style={{ fontWeight: 500 }}>Unconditional Love</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle2 size={20} color="var(--gold-primary)" />
                  <span style={{ fontWeight: 500 }}>Biblical Foundations</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle2 size={20} color="var(--gold-primary)" />
                  <span style={{ fontWeight: 500 }}>Intercessory Prayer</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle2 size={20} color="var(--gold-primary)" />
                  <span style={{ fontWeight: 500 }}>Community Service</span>
                </div>
              </div>

              <Link to={ROUTES.ABOUT} className="btn btn-navy">
                Learn More About Us &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SCRIPTURE SECTION */}
      <section className="scripture-banner">
        <ParticleCanvas count={20} />
        <div className="container" style={{ position: 'relative', zIndex: 3 }}>
          <p className="scripture-quote">
            &ldquo;{content.scripture_text || 'Come to me, all you who are weary and burdened, and I will give you rest.'}&rdquo;
          </p>
          <div className="scripture-ref">
            {content.scripture_reference || 'Matthew 11:28'}
          </div>
        </div>
      </section>

      {/* 4. MISSION SECTION (4 Pillars) */}
      <section className="section section-cream">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Core Pillars</span>
            <h2 className="section-title">{content.mission_heading || 'Our Mission'}</h2>
            <p className="section-subtitle">
              {content.mission_subheading || 'Guided by the Holy Scriptures to love, serve, and glorify our Lord.'}
            </p>
          </div>

          <div className="grid-4">
            <div className="mission-card">
              <div className="mission-icon-box">
                <Sparkles size={28} />
              </div>
              <h3>Faith</h3>
              <p>Helping people grow deeper in their relationship with Jesus Christ through Biblical truth and discipleship.</p>
            </div>

            <div className="mission-card">
              <div className="mission-icon-box">
                <Heart size={28} />
              </div>
              <h3>Compassion</h3>
              <p>Serving people with Christ-centered love, kindness, dignity, and sincere care for emotional and spiritual well-being.</p>
            </div>

            <div className="mission-card">
              <div className="mission-icon-box">
                <HandHeart size={28} />
              </div>
              <h3>Hope</h3>
              <p>Sharing the living hope of the Gospel with individuals, broken families, and communities seeking light.</p>
            </div>

            <div className="mission-card">
              <div className="mission-icon-box">
                <Users size={28} />
              </div>
              <h3>Service</h3>
              <p>Putting faith into meaningful action by serving others, supporting the needy, and meeting practical community needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED MINISTRIES SECTION */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Our Ministries</span>
            <h2 className="section-title">Ministries That Serve With Love</h2>
            <p className="section-subtitle">
              Discover vibrant ministry pathways for worship, fellowship, prayer, and community service.
            </p>
          </div>

          <div className="grid-3">
            {featuredMinistries.map((min) => (
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
                </div>
                <div className="ministry-body">
                  <h3>{min.title}</h3>
                  <p>{min.summary}</p>
                  {min.meeting_time && (
                    <div className="ministry-meta">
                      <Clock size={14} /> <span>{min.meeting_time}</span>
                    </div>
                  )}
                  <Link to={ROUTES.MINISTRIES} className="btn btn-outline-gold btn-sm" style={{ marginTop: '1rem', alignSelf: 'flex-start' }}>
                    Explore Ministry &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <Link to={ROUTES.MINISTRIES} className="btn btn-navy btn-lg">
              View All 9 Ministries &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 6. LATEST SERMON & DEVOTIONAL SHOWCASE */}
      <section className="section section-dark">
        <div className="container">
          <div className="grid-2" style={{ gap: '3rem', alignItems: 'center' }}>
            {/* Latest Sermon */}
            <div>
              <span className="section-badge">Sunday Message</span>
              <h2 style={{ color: '#FFFFFF', marginBottom: '1.25rem' }}>Latest Sermon</h2>
              {latestSermon ? (
                <div className="sermon-card" style={{ background: 'var(--bg-dark-card)', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <div className="sermon-thumb-wrap">
                    <img src={latestSermon.thumbnail_url || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80'} alt={latestSermon.title} className="sermon-thumb" />
                    <Link to={ROUTES.SERMONS} className="sermon-play-overlay">
                      <div className="sermon-play-btn">
                        <Play size={22} fill="currentColor" />
                      </div>
                    </Link>
                  </div>
                  <div className="sermon-info">
                    <span style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {latestSermon.category} &bull; {latestSermon.date}
                    </span>
                    <h3 style={{ color: '#FFFFFF', fontSize: '1.35rem', margin: '0.5rem 0' }}>{latestSermon.title}</h3>
                    <p style={{ color: 'var(--text-light-muted)', fontSize: '0.9rem' }}>
                      Speaker: {latestSermon.speaker} | Scripture: {latestSermon.scripture}
                    </p>
                    <Link to={ROUTES.SERMONS} className="btn btn-outline-gold btn-sm" style={{ marginTop: '0.5rem' }}>
                      Watch Sermon &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                <p>Loading latest message...</p>
              )}
            </div>

            {/* Daily Devotional Preview */}
            <div>
              <span className="section-badge">Daily Nourishment</span>
              <h2 style={{ color: '#FFFFFF', marginBottom: '1.25rem' }}>Today's Devotional</h2>
              {recentDevotional ? (
                <div className="devotional-card" style={{ background: 'var(--bg-dark-card)', border: '1px solid rgba(212,175,55,0.2)', color: '#FFFFFF' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', fontWeight: 600 }}>
                    {recentDevotional.date}
                  </span>
                  <h3 style={{ color: '#FFFFFF', margin: '0.5rem 0 1rem 0' }}>{recentDevotional.title}</h3>
                  <div className="devotional-verse-box" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <p className="devotional-verse-text" style={{ color: '#F8FAFC' }}>&ldquo;{recentDevotional.scripture_text}&rdquo;</p>
                    <span className="devotional-verse-ref">{recentDevotional.scripture_verse}</span>
                  </div>
                  <p style={{ color: 'var(--text-light-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: '1rem 0' }}>
                    {recentDevotional.reflection.substring(0, 160)}...
                  </p>
                  <Link to={ROUTES.DEVOTIONAL} className="btn btn-gold btn-sm">
                    Read Full Devotional &rarr;
                  </Link>
                </div>
              ) : (
                <p>Loading devotional...</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 7. UPCOMING EVENTS */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Fellowship & Gatherings</span>
            <h2 className="section-title">Upcoming Events</h2>
            <p className="section-subtitle">
              Join us in fellowship, prayer vigils, worship celebrations, and community outreach.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '880px', margin: '0 auto' }}>
            {upcomingEvents.map((evt) => {
              const eventDate = new Date(evt.date);
              const day = isNaN(eventDate.getDate()) ? '15' : eventDate.getDate();
              const month = isNaN(eventDate.getMonth()) ? 'OCT' : eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();

              return (
                <div key={evt.id} className="event-card">
                  <div className="event-date-badge">
                    <span className="event-day">{day}</span>
                    <span className="event-month">{month}</span>
                  </div>
                  <div className="event-content">
                    <span style={{ fontSize: '0.75rem', color: 'var(--gold-dark)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                      {evt.category}
                    </span>
                    <h3>{evt.title}</h3>
                    <div className="event-details">
                      <span><Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> {evt.time}</span>
                      <span><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> {evt.location}</span>
                    </div>
                    <p style={{ fontSize: '0.95rem', margin: 0 }}>{evt.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to={ROUTES.EVENTS} className="btn btn-navy">
              View Calendar &amp; All Events &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="section section-cream">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Grace in Action</span>
            <h2 className="section-title">Stories of Faith &amp; Hope</h2>
            <p className="section-subtitle">
              How God's love and prayer have touched hearts and renewed spirits through Calvary Ministries.
            </p>
          </div>

          <div className="grid-3">
            {testimonials.map((t) => (
              <div key={t.id} className="testimonial-card">
                <p className="testimonial-quote">&ldquo;{t.story}&rdquo;</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {t.author_name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{t.author_name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {t.role_or_location} {t.scripture_fav && `&bull; ${t.scripture_fav}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic SEO Body & Content Article Section */}
      <PageSEOSection 
        pageIdentifier="home" 
        defaultTitle="Home | Compassionate Love of Calvary Ministries" 
        defaultDesc="A Christ-centered ministry devoted to sharing God's love, strengthening faith, serving others, and bringing hope through the transforming message of Jesus Christ."
      />

      {/* 9. PRAYER REQUEST SECTION */}
      <section className="section" id="prayer-section">
        <div className="container container-narrow">
          <div className="section-header">
            <span className="section-badge">We Are Standing With You</span>
            <h2 className="section-title">You Don't Have to Walk Alone</h2>
            <p className="section-subtitle">
              Whatever you are facing, you can share your prayer request with us. Our prayer team is here to stand with you in faith.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', padding: '3rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}>
            {prayerSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle2 size={48} color="#16A34A" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ color: '#16A34A', marginBottom: '0.5rem' }}>Prayer Request Received</h3>
                <p style={{ color: 'var(--text-muted)' }}>{prayerSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handlePrayerSubmit}>
                {prayerError && (
                  <div style={{ background: '#FEE2E2', border: '1px solid #F87171', color: '#B91C1C', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
                    {prayerError}
                  </div>
                )}

                <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '0' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="Your Name"
                      value={prayerForm.name}
                      onChange={(e) => setPrayerForm({ ...prayerForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      required
                      className="form-control"
                      placeholder="your.email@example.com"
                      value={prayerForm.email}
                      onChange={(e) => setPrayerForm({ ...prayerForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={prayerForm.phone}
                    onChange={(e) => setPrayerForm({ ...prayerForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Prayer Request Details *</label>
                  <textarea
                    required
                    className="form-control"
                    rows={4}
                    placeholder="Share the situation or petition you would like us to uphold in prayer..."
                    value={prayerForm.request_text}
                    onChange={(e) => setPrayerForm({ ...prayerForm, request_text: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.75rem' }}>
                  <input
                    type="checkbox"
                    id="confidential_home"
                    checked={prayerForm.is_private}
                    onChange={(e) => setPrayerForm({ ...prayerForm, is_private: e.target.checked })}
                  />
                  <label htmlFor="confidential_home" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Keep this prayer request confidential with our pastoral intercessory team.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={prayerSubmitting}
                  className="btn btn-gold btn-lg"
                  style={{ width: '100%' }}
                >
                  {prayerSubmitting ? 'Submitting to Altar...' : 'Send Prayer Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA SECTION */}
      <section 
        className="section section-dark"
        style={{ 
          backgroundImage: `linear-gradient(rgba(11,25,44,0.9), rgba(6,15,26,0.95)), url('https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          textAlign: 'center'
        }}
      >
        <div className="container container-narrow">
          <span className="section-badge" style={{ color: 'var(--gold-light)' }}>An Open Invitation</span>
          <h2 style={{ color: '#FFFFFF', marginBottom: '1.25rem' }}>
            {content.cta_headline || 'Come As You Are. Discover Hope. Walk in His Love.'}
          </h2>
          <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.8', marginBottom: '2.5rem' }}>
            {content.cta_description || 'Whether you are seeking prayer, fellowship, spiritual growth, or simply a place to belong, you are welcome here.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <Link to={ROUTES.CONTACT} className="btn btn-gold btn-lg">
              {content.cta_primary_btn || 'Visit Us'} &rarr;
            </Link>
            <button onClick={() => setDonationModalOpen(true)} className="btn btn-gold btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 18px rgba(212,175,55,0.45)' }}>
              <Heart size={18} fill="currentColor" /> Give &amp; Support Ministry
            </button>
            <button onClick={() => setPrayerModalOpen(true)} className="btn btn-outline-light btn-lg">
              {content.cta_secondary_btn || 'Request Prayer'}
            </button>
          </div>
        </div>
      </section>

      {/* 11. SOCIAL MEDIA CONNECT SECTION */}
      <section className="home-social-banner">
        <div className="container">
          <div className="home-social-inner">
            <div className="home-social-text">
              <span className="section-badge" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>Stay Connected</span>
              <h3 className="home-social-title">Connect With Calvary Ministries Online</h3>
              <p className="home-social-subtitle">
                Follow our sermons, prayer broadcasts, updates, and devotionals across our official social channels.
              </p>
            </div>
            <SocialLinks size="lg" />
          </div>
        </div>
      </section>

      {/* Global Prayer & Donation Modals */}
      <PrayerModal isOpen={prayerModalOpen} onClose={() => setPrayerModalOpen(false)} />
      <DonationModal isOpen={donationModalOpen} onClose={() => setDonationModalOpen(false)} />
    </div>
  );
};


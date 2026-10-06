import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes/routes';
import { useSiteContent } from '../context/SiteContentContext';
import { api, getMediaUrl } from '../services/api';
import { Sparkles, Heart, Shield, Users, BookOpen, Anchor } from 'lucide-react';
import { ensureGoogleFontsLoaded } from '../components/FontTypographyControls';
import { PageSEOSection } from '../components/PageSEOSection';

export const AboutPage = () => {
  const { aboutData: contextAboutData } = useSiteContent();
  const [data, setData] = useState(contextAboutData || null);
  const [loading, setLoading] = useState(!contextAboutData);

  useEffect(() => {
    if (contextAboutData) {
      setData(contextAboutData);
      setLoading(false);
      ensureGoogleFontsLoaded([contextAboutData.heading_font, contextAboutData.body_font]);
    } else {
      const fetchAbout = async () => {
        try {
          const res = await api.getAboutContent();
          setData(res);
          ensureGoogleFontsLoaded([res.heading_font, res.body_font]);
        } catch (err) {
          console.error('Failed to load about data:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchAbout();
    }
  }, [contextAboutData]);

  const headingFont = data?.heading_font ? `'${data.heading_font}', Georgia, serif` : 'var(--font-heading)';
  const bodyFont = data?.body_font ? `'${data.body_font}', sans-serif` : 'var(--font-body)';
  const accentColor = data?.accent_color || 'var(--gold-primary)';
  const fontWeight = data?.font_weight || '600';
  const lineHeight = data?.line_height || '1.7';

  return (
    <div className="about-page" style={{ paddingTop: '5.5rem', fontFamily: bodyFont }}>
      {/* Page Header */}
      <section className="section section-dark" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="container container-narrow">
          <span className="section-badge" style={{ color: accentColor }}>
            {data?.badge || 'Our Ministry Story'}
          </span>
          <h1 style={{ color: '#FFFFFF', marginBottom: '1rem', fontFamily: headingFont, fontWeight }}>
            {data?.headline || 'About Compassionate Love of Calvary'}
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-light-muted)', lineHeight }}>
            {data?.subheadline || 'A ministry established on the unchanging foundation of Calvary grace, dedicated to loving God and serving people.'}
          </p>
        </div>
      </section>

      {/* Our Story & Background */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <span className="section-badge" style={{ color: accentColor }}>
                {data?.story_badge || 'Our Journey'}
              </span>
              <h2 className="section-title" style={{ fontFamily: headingFont, fontWeight }}>
                {data?.story_title || 'Rooted in Faith, Driven by Compassion'}
              </h2>
              <p style={{ fontSize: '1.05rem', lineHeight, color: 'var(--text-dark)' }}>
                {data?.story_p1 || 'Compassionate Love of Calvary Ministries was born out of a profound conviction: that the sacrificial love demonstrated by Jesus Christ on Calvary Cross is the greatest source of healing, restoration, and hope for a hurting world.'}
              </p>
              <p style={{ fontSize: '1.05rem', lineHeight }}>
                {data?.story_p2 || 'From our beginning in the Chengalpattu region, we have remained committed to simple, powerful principles—proclaiming the pure Gospel of Jesus Christ, lifting families through fervent intercessory prayer, providing spiritual nourishment through sound Biblical teaching, and extending practical compassion to our surrounding community.'}
              </p>
              <p style={{ fontSize: '1.05rem', lineHeight }}>
                {data?.story_p3 || 'We believe that every individual is deeply precious to God. Regardless of background, past mistakes, or current trials, the Cross of Christ is an open door to peace, reconciliation, and new beginnings.'}
              </p>
            </div>

            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-subtle)' }}>
              <img 
                src={getMediaUrl(data?.story_image_url) || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1000&q=80'} 
                alt="Bible and ministry prayer"
                style={{ width: '100%', height: '420px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1000&q=80';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section section-cream">
        <div className="container">
          <div className="grid-2" style={{ gap: '2.5rem' }}>
            <div className="mission-card" style={{ textAlign: 'left', padding: '3rem', borderTop: `4px solid ${accentColor}` }}>
              <div className="mission-icon-box" style={{ margin: '0 0 1.5rem 0', color: accentColor }}>
                <Anchor size={28} />
              </div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontFamily: headingFont, fontWeight }}>
                {data?.mission_title || 'Our Mission'}
              </h3>
              <p style={{ fontSize: '1.05rem', lineHeight }}>
                {data?.mission_text || 'To proclaim the transforming Gospel of Jesus Christ, disciple believers in Biblical truth, support families through intercessory prayer, and actively serve our community with Christ-like compassion and humility.'}
              </p>
            </div>

            <div className="mission-card" style={{ textAlign: 'left', padding: '3rem', borderTop: `4px solid ${accentColor}` }}>
              <div className="mission-icon-box" style={{ margin: '0 0 1.5rem 0', color: accentColor }}>
                <Sparkles size={28} />
              </div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontFamily: headingFont, fontWeight }}>
                {data?.vision_title || 'Our Vision'}
              </h3>
              <p style={{ fontSize: '1.05rem', lineHeight }}>
                {data?.vision_text || 'To be a radiant beacon of spiritual hope and renewal across Chengalpattu and beyond—where the broken are restored, faith is fortified, and lives are empowered to reflect God\'s glory in every walk of life.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge" style={{ color: accentColor }}>
              {data?.values_badge || 'What Drives Us'}
            </span>
            <h2 className="section-title" style={{ fontFamily: headingFont, fontWeight }}>
              {data?.values_title || 'Our Core Values'}
            </h2>
            <p className="section-subtitle">
              {data?.values_subtitle || 'The Biblical pillars that guide our pastoral care, fellowship, and service.'}
            </p>
          </div>

          <div className="grid-3">
            <div className="mission-card">
              <div className="mission-icon-box"><BookOpen size={24} color={accentColor} /></div>
              <h3 style={{ fontFamily: headingFont }}>Scriptural Authority</h3>
              <p style={{ lineHeight }}>The Holy Bible is the inspired, authoritative, and living Word of God that guides all faith, doctrine, and daily Christian conduct.</p>
            </div>

            <div className="mission-card">
              <div className="mission-icon-box"><Heart size={24} color={accentColor} /></div>
              <h3 style={{ fontFamily: headingFont }}>Calvary Love</h3>
              <p style={{ lineHeight }}>Loving others unconditionally, extending grace, forgiveness, and Christ-centered empathy to all people without prejudice.</p>
            </div>

            <div className="mission-card">
              <div className="mission-icon-box"><Shield size={24} color={accentColor} /></div>
              <h3 style={{ fontFamily: headingFont }}>Fervent Prayer</h3>
              <p style={{ lineHeight }}>Maintaining continuous dependence on God through daily prayer, fasting, and interceding for families and spiritual revival.</p>
            </div>

            <div className="mission-card">
              <div className="mission-icon-box"><Users size={24} color={accentColor} /></div>
              <h3 style={{ fontFamily: headingFont }}>Genuine Fellowship</h3>
              <p style={{ lineHeight }}>Cultivating an authentic spiritual family where believers encourage one another, share burdens, and grow together in grace.</p>
            </div>

            <div className="mission-card">
              <div className="mission-icon-box"><Sparkles size={24} color={accentColor} /></div>
              <h3 style={{ fontFamily: headingFont }}>Holiness &amp; Integrity</h3>
              <p style={{ lineHeight }}>Pursuing upright Christian living, moral integrity, transparency, and personal spiritual growth before God and community.</p>
            </div>

            <div className="mission-card">
              <div className="mission-icon-box"><Anchor size={24} color={accentColor} /></div>
              <h3 style={{ fontFamily: headingFont }}>Community Service</h3>
              <p style={{ lineHeight }}>Putting our faith into meaningful, tangible service by helping the vulnerable, feeding the hungry, and extending medical aid.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statement of Faith */}
      <section className="section section-dark">
        <div className="container container-narrow">
          <div className="section-header">
            <span className="section-badge" style={{ color: accentColor }}>Statement of Faith</span>
            <h2 style={{ color: '#FFFFFF', fontFamily: headingFont, fontWeight }}>What We Believe</h2>
            <p style={{ color: 'var(--text-light-muted)' }}>
              Our doctrinal heritage is anchored in historic, orthodox Christian truth.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'var(--bg-dark-card)', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <h4 style={{ color: accentColor, fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: headingFont }}>The One True God</h4>
              <p style={{ margin: 0, color: 'var(--text-light-muted)', lineHeight }}>
                We believe in one God, eternally existent in three persons: Father, Son, and Holy Spirit, who is the Sovereign Creator, Sustainer, and Redeemer of all things.
              </p>
            </div>

            <div style={{ background: 'var(--bg-dark-card)', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <h4 style={{ color: accentColor, fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: headingFont }}>Jesus Christ our Savior</h4>
              <p style={{ margin: 0, color: 'var(--text-light-muted)', lineHeight }}>
                We believe in the deity of our Lord Jesus Christ, His virgin birth, His sinless life, His atoning death upon the Cross of Calvary, His bodily resurrection, and His glorious return.
              </p>
            </div>

            <div style={{ background: 'var(--bg-dark-card)', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <h4 style={{ color: accentColor, fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: headingFont }}>Salvation by Grace</h4>
              <p style={{ margin: 0, color: 'var(--text-light-muted)', lineHeight }}>
                Salvation is the free gift of God given by sovereign grace through faith in Jesus Christ alone, not by human works, granting eternal life and forgiveness of sins.
              </p>
            </div>

            <div style={{ background: 'var(--bg-dark-card)', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <h4 style={{ color: accentColor, fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: headingFont }}>The Holy Spirit</h4>
              <p style={{ margin: 0, color: 'var(--text-light-muted)', lineHeight }}>
                We believe in the ongoing ministry of the Holy Spirit who convicts, regenerates, indwells, comforts, and empowers believers for holy living and effective witness.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to={ROUTES.CONTACT} className="btn btn-gold btn-lg">
              Get in Touch With Our Team &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic SEO Body & Content Article Section */}
      <PageSEOSection 
        pageIdentifier="about" 
        defaultTitle="About Us | Compassionate Love of Calvary Ministries" 
        defaultDesc="A ministry established on the unchanging foundation of Calvary grace, dedicated to loving God and serving people in Chengalpattu."
      />
    </div>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PUBLIC_NAV_ITEMS, ROUTES } from '../routes/routes';
import { MapPin, Mail, Phone, Heart, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { SocialLinks } from './SocialLinks';
import { api } from '../services/api';
import { DonationModal } from './DonationModal';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subMessage, setSubMessage] = useState(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setSubMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setSubscribing(true);
    setSubMessage(null);

    try {
      const res = await api.subscribeNewsletter(email.trim(), 'Footer Stay Connected');
      setSubMessage({ type: 'success', text: res.message || 'Thank you for subscribing to receive updates!' });
      setEmail('');
    } catch (err) {
      setSubMessage({
        type: 'error',
        text: err.message || 'Could not process your subscription. Please try again.'
      });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <>
      <footer className="site-footer" role="contentinfo">
        <div className="container">
          
          {/* =========================================================================
              STAY CONNECTED NEWSLETTER SUBSCRIPTION BANNER
              ========================================================================= */}
          <div className="footer-stay-connected-card">
            <div className="footer-stay-connected-grid">
              <div className="footer-stay-connected-text">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(212, 175, 55, 0.15)', padding: '0.3rem 0.75rem', borderRadius: '30px', border: '1px solid rgba(212, 175, 55, 0.35)', marginBottom: '0.65rem' }}>
                  <Sparkles size={14} style={{ color: 'var(--gold-primary)' }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--gold-light)', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Stay Connected
                  </span>
                </div>
                <h3 className="footer-stay-connected-title">
                  Stay Connected
                </h3>
                <p className="footer-stay-connected-desc">
                  Subscribe to receive sermons, Bible study notes and event updates.
                </p>
              </div>

              <div className="footer-stay-connected-form-wrap">
                <form onSubmit={handleSubscribe} className="footer-subscribe-form" aria-label="Stay Connected Newsletter Form">
                  <div className="footer-input-wrapper">
                    <Mail size={18} className="footer-input-icon" aria-hidden="true" />
                    <input
                      type="email"
                      id="footer-email-input"
                      name="email"
                      autoComplete="email"
                      required
                      placeholder="Enter your email address..."
                      aria-label="Email address for updates"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="footer-email-input"
                      disabled={subscribing}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={subscribing}
                    className="btn btn-gold footer-subscribe-btn"
                    aria-label="Subscribe to newsletter"
                  >
                    {subscribing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} aria-hidden="true" />
                        <span>Subscribe</span>
                      </>
                    )}
                  </button>
                </form>

                {subMessage && (
                  <div
                    className={`footer-sub-alert ${subMessage.type === 'success' ? 'success' : 'error'}`}
                    role="alert"
                  >
                    {subMessage.type === 'success' ? (
                      <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                    ) : (
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    )}
                    <span>{subMessage.text}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =========================================================================
              MAIN FOOTER CONTENT GRID
              ========================================================================= */}
          <div className="footer-grid">
            {/* Column 1: Brand & Mission */}
            <div className="footer-brand">
              <div className="brand-logo" style={{ marginBottom: '1.25rem' }}>
                <div className="brand-cross-icon" style={{ width: '68px', height: '68px' }}>
                  <img 
                    src="/logo.png" 
                    alt="Compassionate Love of Calvary Ministries" 
                    className="brand-logo-img"
                  />
                </div>
                <div className="brand-text-block">
                  <span className="brand-title">Compassionate Love </span>
                  <span className="brand-subtitle">of Calvary Ministries</span>
                </div>
              </div>

              <p className="footer-tagline">
                Sharing Christ &bull; Serving People &bull; Bringing Hope
              </p>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-light-muted)', maxWidth: '360px', lineHeight: '1.7' }}>
                A Christ-centered ministry devoted to sharing God's transformative love, nurturing steadfast faith, praying for families, and serving our community with compassion.
              </p>

              <div style={{ marginTop: '1.5rem' }}>
                <SocialLinks size="md" />
              </div>
            </div>

            {/* Column 2: Quick Navigation Links */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
                Explore Ministry
              </h4>
              <ul className="footer-nav-list">
                {PUBLIC_NAV_ITEMS.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} className="footer-nav-link">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact Information & Secure Giving */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
                Ministry & Giving Contact
              </h4>
              
              <div className="footer-contact-item">
                <MapPin size={20} />
                <div>
                  <strong>Compassionate Love of Calvary Ministries</strong><br />
                  81/5, 6th Street, Shanthi Nagar,<br />
                  Chengalpattu District, Tamil Nadu,<br />
                  PIN Code: 603003, India
                </div>
              </div>

              <div className="footer-contact-item">
                <Phone size={18} />
                <div>
                  <strong>Helpline / Phone:</strong><br />
                  <a href="tel:+918248373375" style={{ color: 'var(--gold-primary)', textDecoration: 'none', fontWeight: '600' }}>
                    +91 8248373375
                  </a>
                </div>
              </div>

              <div className="footer-contact-item">
                <Mail size={18} />
                <div>
                  <strong>Owner Email:</strong><br />
                  <a href="mailto:davidraj2107@gmail.com" style={{ color: 'var(--gold-primary)', textDecoration: 'none' }}>
                    davidraj2107@gmail.com
                  </a>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsDonationModalOpen(true)}
                  className="btn btn-gold btn-sm"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)' }}
                >
                  <Heart size={15} fill="currentColor" /> Donate &amp; Support via Razorpay
                </button>

                <Link to={ROUTES.CONTACT} className="btn btn-outline-gold btn-sm" style={{ width: '100%', textAlign: 'center' }}>
                  Send Prayer Request
                </Link>
              </div>
            </div>
          </div>

          {/* =========================================================================
              FOOTER BOTTOM STRIP & SAFETY NOTICE
              ========================================================================= */}
          <div className="footer-bottom">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <p style={{ margin: 0 }}>
                &copy; 2026 Compassionate Love of Calvary Ministries. All rights reserved.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                <a href="/sitemap.html" style={{ color: 'var(--text-light-muted)', textDecoration: 'none' }}>Sitemap</a>
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-light-muted)', textDecoration: 'none' }}>XML Sitemap</a>
                <a href="/robots.html" style={{ color: 'var(--text-light-muted)', textDecoration: 'none' }}>Robots Directives</a>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.7)' }}>
                  <ShieldCheck size={15} style={{ color: 'var(--gold-primary)' }} />
                  <span>Safe &amp; Secure Payments Powered by Razorpay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Reusable Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
    </>
  );
};

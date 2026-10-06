import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { PUBLIC_NAV_ITEMS, ROUTES } from '../routes/routes';
import { Menu, X, Heart } from 'lucide-react';
import { DonationModal } from './DonationModal';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          {/* Ministry Brand Logo with Official Crest */}
          <Link to={ROUTES.HOME} className="brand-logo" aria-label="Compassionate Love of Calvary Ministries Home">
            <div className="brand-cross-icon">
              <img 
                src="/logo.png" 
                alt="Compassionate Love of Calvary Ministries" 
                className="brand-logo-img"
              />
            </div>
            <div className="brand-text-block">
              <span className="brand-title">Compassionate </span>
              <span className="brand-subtitle"> Love of Calvary Ministries</span>
            </div>
          </Link>

          {/* Desktop Public Navigation Links */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            {PUBLIC_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="mobile-only-wrap">
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Backdrop & Drawer */}
      <div
        className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div>
          <div className="brand-logo" style={{ marginBottom: '1.5rem' }}>
            <div className="brand-cross-icon">
              <img 
                src="/logo.png" 
                alt="Compassionate Love of Calvary Ministries" 
                className="brand-logo-img"
              />
            </div>
            <div className="brand-text-block">
              <span className="brand-title">Compassionate </span>
              <span className="brand-subtitle">Love of Calvary Ministries</span>
            </div>
          </div>

          <nav className="mobile-nav-links">
            {PUBLIC_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                <span>{item.name}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--gold-primary)' }}>&rarr;</span>
              </NavLink>
            ))}
          </nav>

          <div style={{ marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsDonationModalOpen(true);
              }}
              className="btn btn-gold"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Heart size={16} fill="currentColor" /> Donate via Razorpay
            </button>
          </div>
        </div>

        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light-muted)', margin: 0 }}>
            Sharing Christ &bull; Serving People &bull; Bringing Hope
          </p>
        </div>
      </aside>

      {/* Global Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
    </>
  );
};

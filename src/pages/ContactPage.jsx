import React, { useState } from 'react';
import { MapPin, Mail, Phone, Send, CheckCircle2, Heart } from 'lucide-react';
import { api } from '../services/api';
import { PrayerModal } from '../components/PrayerModal';
import { SocialLinks } from '../components/SocialLinks';
import { PageSEOSection } from '../components/PageSEOSection';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [prayerModalOpen, setPrayerModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.submitContactMessage(formData);
      setSuccessMsg(res.message || 'Thank you for reaching out. We will respond promptly.');
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    } catch (err) {
      setErrorMsg('Failed to send message. Please verify the form and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page" style={{ paddingTop: '5.5rem' }}>
      {/* Header */}
      <section className="section section-dark" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="container container-narrow">
          <span className="section-badge">Get In Touch</span>
          <h1 style={{ color: '#FFFFFF', marginBottom: '1rem' }}>Contact &amp; Location</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-light-muted)' }}>
            We would love to welcome you, answer your questions, or stand with you in prayer.
          </p>
        </div>
      </section>

      {/* Main Grid: Info + Contact Form */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ gap: '3.5rem', alignItems: 'flex-start' }}>
            {/* Left: Contact Details & Address */}
            <div>
              <span className="section-badge">Find Us</span>
              <h2 className="section-title">Compassionate Love of Calvary Ministries</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div className="mission-icon-box" style={{ width: '52px', height: '52px', margin: 0 }}>
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Physical Address</h4>
                    <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.7', color: 'var(--text-dark)' }}>
                      81/5, 6th Street,<br />
                      Shanthi Nagar,<br />
                      Chengalpattu District, Tamil Nadu,<br />
                      PIN Code: 603003,<br />
                      India
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div className="mission-icon-box" style={{ width: '52px', height: '52px', margin: 0 }}>
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Email Us</h4>
                    <p style={{ margin: 0, fontSize: '1rem' }}>
                      <a href="mailto:info@clm.org" style={{ color: 'var(--gold-dark)', fontWeight: 600, textDecoration: 'underline' }}>
                        info@clm.org
                      </a>
                    </p>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>We typically respond within 24 hours.</span>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Connect on Social Media</h4>
                  <SocialLinks size="md" variant="light" />
                </div>
              </div>

              {/* Prayer Callout */}
              <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-md)', marginTop: '2.5rem', borderLeft: '4px solid var(--gold-primary)' }}>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Heart size={20} color="var(--gold-dark)" /> Need Immediate Prayer?
                </h4>
                <p style={{ fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                  Our pastoral prayer team is dedicated to standing with you in faith. Confidential prayer requests are received with earnest care.
                </p>
                <button onClick={() => setPrayerModalOpen(true)} className="btn btn-gold btn-sm">
                  Send Confidential Prayer Request &rarr;
                </button>
              </div>
            </div>

            {/* Right: Message Form */}
            <div style={{ background: '#FFFFFF', padding: '3rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Send Us a Message</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Fill out the form below and our ministry office will be glad to assist you.
              </p>

              {successMsg ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <CheckCircle2 size={48} color="#16A34A" style={{ margin: '0 auto 1rem auto' }} />
                  <h4 style={{ color: '#16A34A', fontSize: '1.4rem', marginBottom: '0.5rem' }}>Message Sent!</h4>
                  <p style={{ color: 'var(--text-muted)' }}>{successMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {errorMsg && (
                    <div style={{ background: '#FEE2E2', border: '1px solid #F87171', color: '#B91C1C', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                      {errorMsg}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      required
                      className="form-control"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="General Inquiry / Visit / Ministry Info"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea
                      required
                      rows={5}
                      className="form-control"
                      placeholder="How can our ministry help or serve you?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-navy btn-lg"
                    style={{ width: '100%' }}
                  >
                    <Send size={16} /> {submitting ? 'Sending Message...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic SEO Body & Content Article Section */}
      <PageSEOSection 
        pageIdentifier="contact" 
        defaultTitle="Contact Us & Church Location | Calvary Ministries Chengalpattu" 
        defaultDesc="Get in touch with Compassionate Love of Calvary Ministries in Chengalpattu, send prayer requests, or plan your visit."
      />

      <PrayerModal isOpen={prayerModalOpen} onClose={() => setPrayerModalOpen(false)} />
    </div>
  );
};

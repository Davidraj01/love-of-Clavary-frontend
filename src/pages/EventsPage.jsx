import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Calendar, Clock, MapPin, CheckCircle, Heart } from 'lucide-react';
import { PrayerModal } from '../components/PrayerModal';
import { PageSEOSection } from '../components/PageSEOSection';

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prayerModalOpen, setPrayerModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.getEvents();
        setEvents(data);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="events-page" style={{ paddingTop: '5.5rem' }}>
      {/* Header */}
      <section className="section section-dark" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="container container-narrow">
          <span className="section-badge">Calendar &amp; Gatherings</span>
          <h1 style={{ color: '#FFFFFF', marginBottom: '1rem' }}>Ministry Events &amp; Services</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-light-muted)' }}>
            Join our spiritual family in Chengalpattu for uplifting worship, powerful prayer vigils, conferences, and community outreaches.
          </p>
        </div>
      </section>

      {/* Events List */}
      <section className="section">
        <div className="container container-narrow">
          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading upcoming events...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {events.map((evt) => {
                const eventDate = new Date(evt.date);
                const day = isNaN(eventDate.getDate()) ? '15' : eventDate.getDate();
                const month = isNaN(eventDate.getMonth()) ? 'OCT' : eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
                const year = isNaN(eventDate.getFullYear()) ? '2026' : eventDate.getFullYear();

                return (
                  <div key={evt.id} className="event-card" style={{ boxShadow: 'var(--shadow-md)' }}>
                    <div className="event-date-badge" style={{ minWidth: '120px' }}>
                      <span className="event-day" style={{ fontSize: '2.4rem' }}>{day}</span>
                      <span className="event-month" style={{ fontSize: '1rem', fontWeight: 600 }}>{month}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{year}</span>
                    </div>

                    <div className="event-content" style={{ padding: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span className="section-badge" style={{ margin: 0 }}>{evt.category}</span>
                      </div>

                      <h3 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>{evt.title}</h3>

                      <div className="event-details" style={{ fontSize: '0.9rem', margin: '0.75rem 0 1.25rem 0' }}>
                        <span>
                          <Clock size={15} style={{ display: 'inline', marginRight: '5px', color: 'var(--gold-dark)' }} /> 
                          {evt.time}
                        </span>
                        <span>
                          <MapPin size={15} style={{ display: 'inline', marginRight: '5px', color: 'var(--gold-dark)' }} /> 
                          {evt.location}
                        </span>
                      </div>

                      <p style={{ fontSize: '1rem', lineHeight: '1.7', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
                        {evt.description}
                      </p>

                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => setPrayerModalOpen(true)}
                          className="btn btn-outline-gold btn-sm"
                        >
                          <Heart size={14} /> Request Prayer for Event
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Weekly Schedule Summary */}
      <section className="section section-cream">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Regular Services</span>
            <h2 className="section-title">Weekly Schedule of Worship</h2>
            <p className="section-subtitle">You are warmly welcomed to attend our regular worship and prayer gatherings.</p>
          </div>

          <div className="grid-3">
            <div className="mission-card" style={{ textAlign: 'left' }}>
              <span style={{ color: 'var(--gold-dark)', fontWeight: 600, fontSize: '0.85rem' }}>EVERY SUNDAY</span>
              <h3 style={{ margin: '0.5rem 0' }}>Sunday Worship Service</h3>
              <p style={{ fontSize: '0.95rem' }}>09:30 AM &mdash; 12:30 PM</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Praise, worship, sermon, and Holy Communion.</p>
            </div>

            <div className="mission-card" style={{ textAlign: 'left' }}>
              <span style={{ color: 'var(--gold-dark)', fontWeight: 600, fontSize: '0.85rem' }}>EVERY TUESDAY</span>
              <h3 style={{ margin: '0.5rem 0' }}>Fasting Prayer Meeting</h3>
              <p style={{ fontSize: '0.95rem' }}>10:00 AM &mdash; 01:00 PM</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Intercession for healing, deliverance, and families.</p>
            </div>

            <div className="mission-card" style={{ textAlign: 'left' }}>
              <span style={{ color: 'var(--gold-dark)', fontWeight: 600, fontSize: '0.85rem' }}>EVERY SATURDAY</span>
              <h3 style={{ margin: '0.5rem 0' }}>Youth &amp; Children Fellowship</h3>
              <p style={{ fontSize: '0.95rem' }}>05:00 PM &mdash; 07:00 PM</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Scripture memorization, singing, and mentorship.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic SEO Body & Content Article Section */}
      <PageSEOSection 
        pageIdentifier="events" 
        defaultTitle="Worship Gatherings & Church Events | Calvary Ministries" 
        defaultDesc="Join our spiritual family in Chengalpattu for uplifting worship, powerful prayer vigils, conferences, and community outreaches."
      />

      <PrayerModal isOpen={prayerModalOpen} onClose={() => setPrayerModalOpen(false)} />
    </div>
  );
};

import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Heart, CheckCircle2, AlertCircle } from 'lucide-react';

export const PrayerModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    request_text: '',
    is_private: true,
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.submitPrayerRequest(formData);
      setSuccessMsg(res.message || 'Your prayer request has been received with love.');
      setFormData({ name: '', email: '', phone: '', request_text: '', is_private: true });
    } catch (err) {
      setErrorMsg('Unable to send prayer request. Please check your fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="mission-icon-box" style={{ width: '56px', height: '56px', margin: '0 auto 1rem auto' }}>
            <Heart size={28} />
          </div>
          <h2 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>You Don't Have to Walk Alone</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto' }}>
            Whatever you are facing, you can share your prayer request with us. Our prayer team is here to stand with you in faith.
          </p>
        </div>

        {successMsg ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={48} color="#16A34A" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.4rem', color: '#16A34A', marginBottom: '0.75rem' }}>Prayer Request Received</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{successMsg}</p>
            <button className="btn btn-gold" onClick={onClose}>
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {errorMsg && (
              <div style={{ background: '#FEE2E2', border: '1px solid #F87171', color: '#B91C1C', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                <label className="form-label">Phone Number (Optional)</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Your Prayer Request *</label>
              <textarea
                required
                className="form-control"
                placeholder="Share what is on your heart..."
                rows={4}
                value={formData.request_text}
                onChange={(e) => setFormData({ ...formData, request_text: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <input
                type="checkbox"
                id="is_private"
                checked={formData.is_private}
                onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
              />
              <label htmlFor="is_private" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Keep this prayer request confidential with the pastoral intercessory team.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-gold"
              style={{ width: '100%' }}
            >
              {loading ? 'Submitting in Prayer...' : 'Send Prayer Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

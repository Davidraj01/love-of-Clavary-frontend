import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routes';
import { api } from '../../services/api';
import { 
  Image as ImageIcon, 
  Video as VideoIcon, 
  BookOpen, 
  Calendar, 
  Heart, 
  Globe,
  Edit3, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getAdminDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0B192C 0%, #1A365D 100%)', color: '#FFFFFF', padding: '2.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2.5rem', border: '1px solid rgba(212,175,55,0.3)', boxShadow: 'var(--shadow-md)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
          Administration Control Center
        </span>
        <h1 style={{ color: '#FFFFFF', fontSize: '2.2rem', margin: '0.5rem 0' }}>
          Welcome to Compassionate Love of Calvary Ministries
        </h1>
        <p style={{ color: 'var(--text-light-muted)', fontSize: '1.05rem', margin: 0 }}>
          Manage your ministry website content, update homepage typography, upload photos, and organize video messages.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="metric-grid">
        <div className="metric-card">
          <div>
            <div className="metric-val">{stats?.total_images ?? '--'}</div>
            <div className="metric-label">Total Images</div>
          </div>
          <div className="metric-icon">
            <ImageIcon size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-val">{stats?.total_videos ?? '--'}</div>
            <div className="metric-label">Total Videos</div>
          </div>
          <div className="metric-icon">
            <VideoIcon size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-val">{stats?.total_sermons ?? '--'}</div>
            <div className="metric-label">Sermons</div>
          </div>
          <div className="metric-icon">
            <BookOpen size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-val">{stats?.total_events ?? '--'}</div>
            <div className="metric-label">Active Events</div>
          </div>
          <div className="metric-icon">
            <Calendar size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-val">{stats?.total_blogs ?? '--'}</div>
            <div className="metric-label">SEO Blog Articles</div>
          </div>
          <div className="metric-icon" style={{ background: 'rgba(212, 175, 55, 0.15)', color: 'var(--gold-dark)' }}>
            <Globe size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-val">{stats?.total_prayer_requests ?? '--'}</div>
            <div className="metric-label">Prayer Requests</div>
          </div>
          <div className="metric-icon">
            <Heart size={24} />
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts & Content Status */}
      <div className="grid-2" style={{ gap: '2rem' }}>
        {/* Quick Actions */}
        <div className="editor-panel">
          <h3 className="editor-section-title">
            <Edit3 size={20} color="var(--gold-dark)" /> Quick Management
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            Direct access to core website content editors, SEO articles, and media asset libraries.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <Link
              to={ROUTES.ADMIN_SEO_BLOGS}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-sm)', transition: 'all var(--transition-fast)' }}
            >
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--text-dark)' }}>SEO Blog Articles &amp; SERP Engine</strong>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Publish articles, optimize Google snippets &amp; OpenGraph tags</p>
              </div>
              <ArrowRight size={16} color="var(--gold-dark)" />
            </Link>

            <Link
              to={ROUTES.ADMIN_HOME_EDITOR}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-sm)', transition: 'all var(--transition-fast)' }}
            >
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--text-dark)' }}>Home Editor &amp; Typography</strong>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Customize hero, scriptures, welcome text &amp; fonts</p>
              </div>
              <ArrowRight size={16} color="var(--gold-dark)" />
            </Link>

            <Link
              to={ROUTES.ADMIN_ABOUT_EDITOR}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-sm)', transition: 'all var(--transition-fast)' }}
            >
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--text-dark)' }}>About Page &amp; Fonts</strong>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Edit ministry story, mission, vision, values &amp; fonts</p>
              </div>
              <ArrowRight size={16} color="var(--gold-dark)" />
            </Link>

            <Link
              to={ROUTES.ADMIN_BIBLE_EDITOR}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-sm)', transition: 'all var(--transition-fast)' }}
            >
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--text-dark)' }}>Bible Page &amp; Fonts</strong>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Edit scripture wisdom, reading tips &amp; fonts</p>
              </div>
              <ArrowRight size={16} color="var(--gold-dark)" />
            </Link>

            <Link
              to={ROUTES.ADMIN_MINISTRIES_EDITOR}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-sm)', transition: 'all var(--transition-fast)' }}
            >
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--text-dark)' }}>Ministries &amp; Fonts</strong>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Add/Edit/Delete church ministries &amp; fonts</p>
              </div>
              <ArrowRight size={16} color="var(--gold-dark)" />
            </Link>

            <Link
              to={ROUTES.ADMIN_IMAGES}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-sm)', transition: 'all var(--transition-fast)' }}
            >
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--text-dark)' }}>Image Media Gallery</strong>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Upload via Folders, Mobile, Google Photos &amp; Presets</p>
              </div>
              <ArrowRight size={16} color="var(--gold-dark)" />
            </Link>

            <Link
              to={ROUTES.ADMIN_VIDEOS}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-sm)', transition: 'all var(--transition-fast)' }}
            >
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--text-dark)' }}>Video &amp; Sermon Library</strong>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Add YouTube sermons, MP4 videos, &amp; worship media</p>
              </div>
              <ArrowRight size={16} color="var(--gold-dark)" />
            </Link>
          </div>
        </div>

        {/* Recent Activity & System Health */}
        <div className="editor-panel">
          <h3 className="editor-section-title">
            <Activity size={20} color="var(--gold-dark)" /> Content Activity &amp; Status
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)', background: 'rgba(34,197,94,0.15)', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', margin: 0 }}>Django REST API Connected</h4>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Secure connection active with database. REST API ready for instant sync.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)', background: 'var(--gold-subtle)', color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', margin: 0 }}>Quick Content Refresh</h4>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  All edits saved in the admin portal propagate to public visitors immediately.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <a
                href={ROUTES.HOME}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-navy"
                style={{ width: '100%' }}
              >
                <ExternalLink size={16} /> Open Public Site in New Tab
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

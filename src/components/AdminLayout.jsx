import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ADMIN_NAV_ITEMS, ROUTES } from '../routes/routes';
import { 
  LayoutDashboard, 
  Home,
  Info,
  BookOpen,
  GraduationCap,
  Heart,
  HeartHandshake,
  Globe,
  Image as ImageIcon, 
  Video as VideoIcon,
  Film,
  SearchCheck, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  ShieldCheck 
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.ADMIN_LOGIN);
  };

  const getIcon = (name) => {
    switch (name) {
      case 'LayoutDashboard': return <LayoutDashboard size={20} />;
      case 'Home': return <Home size={20} />;
      case 'Info': return <Info size={20} />;
      case 'BookOpen': return <BookOpen size={20} />;
      case 'GraduationCap': return <GraduationCap size={20} />;
      case 'Heart': return <Heart size={20} />;
      case 'Video': return <VideoIcon size={20} />;
      case 'HeartHandshake': return <HeartHandshake size={20} />;
      case 'SearchCheck': return <SearchCheck size={20} />;
      case 'Globe': return <Globe size={20} />;
      case 'Image': return <ImageIcon size={20} />;
      case 'Film': return <Film size={20} />;
      default: return <LayoutDashboard size={20} />;
    }
  };



  return (
    <div className="admin-layout">
      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="mobile-nav-overlay open" 
          onClick={() => setMobileSidebarOpen(false)} 
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`admin-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="brand-cross-icon" style={{ width: '38px', height: '38px' }}>
            <img 
              src="/logo.png" 
              alt="Compassionate Love of Calvary Ministries" 
              className="brand-logo-img"
            />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
              Calvary Admin
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Ministry Portal
            </div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {ADMIN_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === ROUTES.ADMIN_DASHBOARD}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileSidebarOpen(false)}
            >
              {getIcon(item.icon)}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <a
            href={ROUTES.HOME}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-nav-item"
            style={{ marginBottom: '0.5rem', color: '#94A3B8' }}
          >
            <ExternalLink size={18} />
            <span>Preview Website</span>
          </a>

          <button
            onClick={handleLogout}
            className="admin-nav-item"
            style={{ width: '100%', background: 'transparent', border: 'none', color: '#F87171' }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-content">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="mobile-menu-btn"
              style={{ display: 'block', color: 'var(--text-dark)', padding: 0 }}
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="var(--gold-dark)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                Authenticated Admin: {user?.username || 'Administrator'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to={ROUTES.HOME} target="_blank" className="btn btn-navy btn-sm">
              <ExternalLink size={14} /> View Live Site
            </Link>
          </div>
        </header>

        <main className="admin-page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

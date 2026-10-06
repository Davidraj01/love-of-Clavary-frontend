import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { ROUTES } from './routes';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from '../components/AdminLayout';

// Public Pages
import { HomePage } from '../pages/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { MinistriesPage } from '../pages/MinistriesPage';
import { BiblePage } from '../pages/BiblePage';
import { StudyPage } from '../pages/StudyPage';
import { DevotionalPage } from '../pages/DevotionalPage';
import { SermonsPage } from '../pages/SermonsPage';
import { EventsPage } from '../pages/EventsPage';
import { BlogPage } from '../pages/BlogPage';
import { BlogDetailPage } from '../pages/BlogDetailPage';
import { MediaPage } from '../pages/MediaPage';
import { ContactPage } from '../pages/ContactPage';

// Admin Pages
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminHomeEditor } from '../pages/admin/AdminHomeEditor';
import { AdminAboutEditor } from '../pages/admin/AdminAboutEditor';
import { AdminBibleEditor } from '../pages/admin/AdminBibleEditor';
import { AdminStudyEditor } from '../pages/admin/AdminStudyEditor';
import { AdminDevotionalEditor } from '../pages/admin/AdminDevotionalEditor';
import { AdminSermonsEditor } from '../pages/admin/AdminSermonsEditor';
import { AdminMinistriesEditor } from '../pages/admin/AdminMinistriesEditor';
import { AdminPageSEOEditor } from '../pages/admin/AdminPageSEOEditor';
import { AdminSEOEditor } from '../pages/admin/AdminSEOEditor';
import { AdminImages } from '../pages/admin/AdminImages';
import { AdminVideos } from '../pages/admin/AdminVideos';

// Layout with Navbar and Footer for public pages
const PublicLayout = () => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <main style={{ flexGrow: 1 }}>
      <Outlet />
    </main>
    <Footer />
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. PUBLIC ROUTES (Wrapped with Navbar & Footer) */}
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.ABOUT} element={<AboutPage />} />
        <Route path={ROUTES.MINISTRIES} element={<MinistriesPage />} />
        <Route path={ROUTES.BIBLE} element={<BiblePage />} />
        <Route path={ROUTES.STUDY} element={<StudyPage />} />
        <Route path={ROUTES.DEVOTIONAL} element={<DevotionalPage />} />
        <Route path={ROUTES.SERMONS} element={<SermonsPage />} />
        <Route path={ROUTES.EVENTS} element={<EventsPage />} />
        <Route path={ROUTES.BLOG} element={<BlogPage />} />
        <Route path={ROUTES.BLOG_DETAIL} element={<BlogDetailPage />} />
        <Route path={ROUTES.MEDIA} element={<MediaPage />} />
        <Route path={ROUTES.CONTACT} element={<ContactPage />} />
      </Route>

      {/* 2. AUTHENTICATION ROUTE (Private standalone page) */}
      <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />

      {/* 3. PROTECTED ADMIN ROUTES (Guarded by ProtectedRoute - only accessible after login) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
          <Route path={ROUTES.ADMIN_HOME_EDITOR} element={<AdminHomeEditor />} />
          <Route path={ROUTES.ADMIN_ABOUT_EDITOR} element={<AdminAboutEditor />} />
          <Route path={ROUTES.ADMIN_BIBLE_EDITOR} element={<AdminBibleEditor />} />
          <Route path={ROUTES.ADMIN_STUDY_EDITOR} element={<AdminStudyEditor />} />
          <Route path={ROUTES.ADMIN_DEVOTIONAL_EDITOR} element={<AdminDevotionalEditor />} />
          <Route path={ROUTES.ADMIN_SERMONS_EDITOR} element={<AdminSermonsEditor />} />
          <Route path={ROUTES.ADMIN_MINISTRIES_EDITOR} element={<AdminMinistriesEditor />} />
          <Route path={ROUTES.ADMIN_PAGE_SEO} element={<AdminPageSEOEditor />} />
          <Route path={ROUTES.ADMIN_SEO_BLOGS} element={<AdminSEOEditor />} />
          <Route path={ROUTES.ADMIN_IMAGES} element={<AdminImages />} />
          <Route path={ROUTES.ADMIN_VIDEOS} element={<AdminVideos />} />
        </Route>
      </Route>


      {/* Fallback 404 Route */}
      <Route path="*" element={<PublicLayout><HomePage /></PublicLayout>} />
    </Routes>
  );
};

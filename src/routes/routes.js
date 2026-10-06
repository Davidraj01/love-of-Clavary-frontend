/**
 * Centralized Route Configuration for Compassionate Love of Calvary Ministries.
 * All public navigation and protected admin routes are defined here.
 * Single Source of Truth for URLs across the entire application.
 */

export const ROUTES = {
  // Public Routes
  HOME: '/',
  ABOUT: '/about',
  MINISTRIES: '/ministries',
  BIBLE: '/bible',
  STUDY: '/study',
  DEVOTIONAL: '/devotional',
  SERMONS: '/sermons',
  EVENTS: '/events',
  BLOG: '/blog',
  BLOG_DETAIL: '/blog/:slug',
  MEDIA: '/media',
  CONTACT: '/contact',

  // Authentication Route (Hidden from public navigation)
  ADMIN_LOGIN: '/adminLogin',

  // Protected Admin Routes (Hidden & Guarded - accessible only after login)
  ADMIN_DASHBOARD: '/admin',
  ADMIN_HOME_EDITOR: '/admin/home',
  ADMIN_ABOUT_EDITOR: '/admin/about',
  ADMIN_BIBLE_EDITOR: '/admin/bible',
  ADMIN_STUDY_EDITOR: '/admin/study',
  ADMIN_DEVOTIONAL_EDITOR: '/admin/devotional',
  ADMIN_SERMONS_EDITOR: '/admin/sermons',
  ADMIN_MINISTRIES_EDITOR: '/admin/ministries',
  ADMIN_PAGE_SEO: '/admin/seo',
  ADMIN_SEO_BLOGS: '/admin/seo-blogs',
  ADMIN_IMAGES: '/admin/images',
  ADMIN_VIDEOS: '/admin/videos',
};

/**
 * Public navigation menu items.
 * Strictly contains only public ministry pages (No admin links).
 */
export const PUBLIC_NAV_ITEMS = [
  { name: 'Home', path: ROUTES.HOME },
  { name: 'About', path: ROUTES.ABOUT },
  { name: 'Ministries', path: ROUTES.MINISTRIES },
  { name: 'Bible', path: ROUTES.BIBLE },
  { name: 'Study', path: ROUTES.STUDY },
  { name: 'Devotional', path: ROUTES.DEVOTIONAL },
  { name: 'Sermons', path: ROUTES.SERMONS },
  { name: 'Events', path: ROUTES.EVENTS },
  { name: 'Blog', path: ROUTES.BLOG },
  { name: 'Media', path: ROUTES.MEDIA },
  { name: 'Contact', path: ROUTES.CONTACT },
];

/**
 * Admin portal navigation menu items.
 * Strictly used inside the private admin dashboard.
 */
export const ADMIN_NAV_ITEMS = [
  { name: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD, icon: 'LayoutDashboard' },
  { name: 'Home Editor', path: ROUTES.ADMIN_HOME_EDITOR, icon: 'Home' },
  { name: 'About Editor', path: ROUTES.ADMIN_ABOUT_EDITOR, icon: 'Info' },
  { name: 'Bible Editor', path: ROUTES.ADMIN_BIBLE_EDITOR, icon: 'BookOpen' },
  { name: 'Study Editor', path: ROUTES.ADMIN_STUDY_EDITOR, icon: 'GraduationCap' },
  { name: 'Devotional Editor', path: ROUTES.ADMIN_DEVOTIONAL_EDITOR, icon: 'Heart' },
  { name: 'Sermons Editor', path: ROUTES.ADMIN_SERMONS_EDITOR, icon: 'Video' },
  { name: 'Ministries Editor', path: ROUTES.ADMIN_MINISTRIES_EDITOR, icon: 'HeartHandshake' },
  { name: 'Page SEO Suite', path: ROUTES.ADMIN_PAGE_SEO, icon: 'SearchCheck' },
  { name: 'SEO Blogs', path: ROUTES.ADMIN_SEO_BLOGS, icon: 'Globe' },
  { name: 'Images', path: ROUTES.ADMIN_IMAGES, icon: 'Image' },
  { name: 'Videos', path: ROUTES.ADMIN_VIDEOS, icon: 'Film' },
];




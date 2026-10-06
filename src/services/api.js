/**
 * REST API client for Compassionate Love of Calvary Ministries.
 * Communicates with Django backend endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Helper to ensure media URLs (images, videos, thumbnails) load correctly
 * regardless of whether they are full URLs or relative backend /media/ paths.
 */
export const getMediaUrl = (url) => {
  if (!url) return '';
  let cleanUrl = String(url).trim().replace(/^["']|["']$/g, '');
  if (!cleanUrl) return '';

  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:') || cleanUrl.startsWith('blob:')) {
    return cleanUrl;
  }

  // If someone enters a local Windows file path (e.g. C:/ or C:\), it cannot be fetched via HTTP directly
  if (/^[a-zA-Z]:[/\\]/.test(cleanUrl) || cleanUrl.startsWith('file:')) {
    return '';
  }

  const backendBase = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${backendBase}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
};


/**
 * Helper to build headers with Authorization token if available.
 */
const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('clm_admin_token');
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  return headers;
};

export const api = {
  // Public Data Endpoints
  async getHomeContent() {
    const res = await fetch(`${API_BASE_URL}/home/`);
    if (!res.ok) throw new Error('Failed to fetch home content');
    return res.json();
  },

  async getAboutContent() {
    const res = await fetch(`${API_BASE_URL}/about/`);
    if (!res.ok) throw new Error('Failed to fetch about content');
    return res.json();
  },

  async getMinistriesPageContent() {
    const res = await fetch(`${API_BASE_URL}/ministries-content/`);
    if (!res.ok) throw new Error('Failed to fetch ministries content');
    return res.json();
  },

  async getMinistries() {
    const res = await fetch(`${API_BASE_URL}/ministries/`);
    if (!res.ok) throw new Error('Failed to fetch ministries');
    return res.json();
  },

  async getBibleResources() {
    const res = await fetch(`${API_BASE_URL}/bible/`);
    if (!res.ok) throw new Error('Failed to fetch bible resources');
    return res.json();
  },

  async getStudyPageContent() {
    const res = await fetch(`${API_BASE_URL}/study-content/`);
    if (!res.ok) throw new Error('Failed to fetch study page content');
    return res.json();
  },

  async getStudies(topic = '') {
    const url = topic ? `${API_BASE_URL}/studies/?topic=${encodeURIComponent(topic)}` : `${API_BASE_URL}/studies/`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch studies');
    return res.json();
  },

  async getDevotionalPageContent() {
    const res = await fetch(`${API_BASE_URL}/devotional-content/`);
    if (!res.ok) throw new Error('Failed to fetch devotional page content');
    return res.json();
  },

  async getDevotionals() {
    const res = await fetch(`${API_BASE_URL}/devotionals/`);
    if (!res.ok) throw new Error('Failed to fetch devotionals');
    return res.json();
  },

  async getSermonsPageContent() {
    const res = await fetch(`${API_BASE_URL}/sermons-content/`);
    if (!res.ok) throw new Error('Failed to fetch sermons page content');
    return res.json();
  },

  async getSermons(category = '') {
    const url = category && category !== 'All' ? `${API_BASE_URL}/sermons/?category=${encodeURIComponent(category)}` : `${API_BASE_URL}/sermons/`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch sermons');
    return res.json();
  },

  async getPageSEO(pageIdentifier) {
    const res = await fetch(`${API_BASE_URL}/seo/${encodeURIComponent(pageIdentifier)}/`);
    if (!res.ok) throw new Error('Failed to fetch page SEO');
    return res.json();
  },

  async getEvents() {
    const res = await fetch(`${API_BASE_URL}/events/`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  async getMedia() {
    const res = await fetch(`${API_BASE_URL}/media/`);
    if (!res.ok) throw new Error('Failed to fetch media');
    return res.json();
  },

  async getTestimonials() {
    const res = await fetch(`${API_BASE_URL}/testimonials/`);
    if (!res.ok) throw new Error('Failed to fetch testimonials');
    return res.json();
  },

  async submitPrayerRequest(data) {
    const res = await fetch(`${API_BASE_URL}/prayer-requests/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async submitContactMessage(data) {
    const res = await fetch(`${API_BASE_URL}/contact/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async subscribeNewsletter(email, source = 'Footer Stay Connected') {
    const res = await fetch(`${API_BASE_URL}/newsletter/subscribe/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source }),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  // Razorpay Donation & Giving Endpoints
  async getPaymentConfig() {
    const res = await fetch(`${API_BASE_URL}/payments/config/`);
    if (!res.ok) throw new Error('Failed to load payment gateway config');
    return res.json();
  },

  async createRazorpayOrder(data) {
    const res = await fetch(`${API_BASE_URL}/payments/create-order/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async verifyRazorpayPayment(data) {
    const res = await fetch(`${API_BASE_URL}/payments/verify/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async submitDirectDonation(data) {
    const res = await fetch(`${API_BASE_URL}/payments/direct-submit/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },



  // Authentication Endpoints
  async login(username, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async logout() {
    const res = await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async verifyAuth() {
    const res = await fetch(`${API_BASE_URL}/auth/verify/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  // Admin Endpoints (Protected)
  async getAdminDashboardStats() {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard-stats/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  async getAdminHomeContent() {
    const res = await fetch(`${API_BASE_URL}/admin/home/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin home content');
    return res.json();
  },

  async updateAdminHomeContent(data) {
    const res = await fetch(`${API_BASE_URL}/admin/home/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  // About Page CMS & Fonts
  async getAdminAboutContent() {
    const res = await fetch(`${API_BASE_URL}/admin/about/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin about content');
    return res.json();
  },

  async updateAdminAboutContent(data) {
    const res = await fetch(`${API_BASE_URL}/admin/about/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  // Bible Page CMS & Fonts
  async getAdminBibleContent() {
    const res = await fetch(`${API_BASE_URL}/admin/bible/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin bible content');
    return res.json();
  },

  async updateAdminBibleContent(data) {
    const res = await fetch(`${API_BASE_URL}/admin/bible/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  // Ministries Page CMS & Fonts
  async getAdminMinistriesPageContent() {
    const res = await fetch(`${API_BASE_URL}/admin/ministries-content/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin ministries page content');
    return res.json();
  },

  async updateAdminMinistriesPageContent(data) {
    const res = await fetch(`${API_BASE_URL}/admin/ministries-content/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async getAdminMinistries() {
    const res = await fetch(`${API_BASE_URL}/admin/ministries/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin ministries list');
    return res.json();
  },

  async createAdminMinistry(data) {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_BASE_URL}/admin/ministries/`, {
      method: 'POST',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async updateAdminMinistry(id, data) {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_BASE_URL}/admin/ministries/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async deleteAdminMinistry(id) {
    const res = await fetch(`${API_BASE_URL}/admin/ministries/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete ministry');
    return true;
  },


  // Images Management
  async getAdminImages() {
    const res = await fetch(`${API_BASE_URL}/admin/images/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin images');
    return res.json();
  },

  async uploadAdminImage(formData) {
    const res = await fetch(`${API_BASE_URL}/admin/images/`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async updateAdminImage(id, data) {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_BASE_URL}/admin/images/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async deleteAdminImage(id) {
    const res = await fetch(`${API_BASE_URL}/admin/images/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete image');
    return true;
  },

  // Videos Management
  async getAdminVideos() {
    const res = await fetch(`${API_BASE_URL}/admin/videos/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin videos');
    return res.json();
  },

  async createAdminVideo(data) {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_BASE_URL}/admin/videos/`, {
      method: 'POST',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async updateAdminVideo(id, data) {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_BASE_URL}/admin/videos/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async deleteAdminVideo(id) {
    const res = await fetch(`${API_BASE_URL}/admin/videos/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete video');
    return true;
  },

  // Public Blog Endpoints
  async getBlogPosts(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.tag) query.append('tag', params.tag);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/blogs/${qs}`);
    if (!res.ok) throw new Error('Failed to fetch blog posts');
    return res.json();
  },

  async getBlogPostBySlug(slug) {
    const res = await fetch(`${API_BASE_URL}/blogs/${encodeURIComponent(slug)}/`);
    if (!res.ok) {
      if (res.status === 404) throw new Error('Article not found');
      throw new Error('Failed to fetch article');
    }
    return res.json();
  },

  // Admin SEO Blog Management
  async getAdminBlogs() {
    const res = await fetch(`${API_BASE_URL}/admin/blogs/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin blog posts');
    return res.json();
  },

  async getAdminBlog(id) {
    const res = await fetch(`${API_BASE_URL}/admin/blogs/${id}/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin blog post');
    return res.json();
  },

  async createAdminBlog(data) {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_BASE_URL}/admin/blogs/`, {
      method: 'POST',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async updateAdminBlog(id, data) {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_BASE_URL}/admin/blogs/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async deleteAdminBlog(id) {
    const res = await fetch(`${API_BASE_URL}/admin/blogs/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete blog post');
    return true;
  },

  // Bible Studies Management
  async getAdminStudyPageContent() {
    const res = await fetch(`${API_BASE_URL}/admin/study-content/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin study content');
    return res.json();
  },

  async updateAdminStudyPageContent(data) {
    const res = await fetch(`${API_BASE_URL}/admin/study-content/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async getAdminStudies() {
    const res = await fetch(`${API_BASE_URL}/admin/studies/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin studies');
    return res.json();
  },

  async createAdminStudy(data) {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_BASE_URL}/admin/studies/`, {
      method: 'POST',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async updateAdminStudy(id, data) {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_BASE_URL}/admin/studies/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async deleteAdminStudy(id) {
    const res = await fetch(`${API_BASE_URL}/admin/studies/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete study');
    return true;
  },

  // Devotionals Management
  async getAdminDevotionalPageContent() {
    const res = await fetch(`${API_BASE_URL}/admin/devotional-content/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin devotional content');
    return res.json();
  },

  async updateAdminDevotionalPageContent(data) {
    const res = await fetch(`${API_BASE_URL}/admin/devotional-content/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async getAdminDevotionals() {
    const res = await fetch(`${API_BASE_URL}/admin/devotionals/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin devotionals');
    return res.json();
  },

  async createAdminDevotional(data) {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_BASE_URL}/admin/devotionals/`, {
      method: 'POST',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async updateAdminDevotional(id, data) {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_BASE_URL}/admin/devotionals/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async deleteAdminDevotional(id) {
    const res = await fetch(`${API_BASE_URL}/admin/devotionals/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete devotional');
    return true;
  },

  // Sermons Management
  async getAdminSermonsPageContent() {
    const res = await fetch(`${API_BASE_URL}/admin/sermons-content/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin sermons content');
    return res.json();
  },

  async updateAdminSermonsPageContent(data) {
    const res = await fetch(`${API_BASE_URL}/admin/sermons-content/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async getAdminSermons() {
    const res = await fetch(`${API_BASE_URL}/admin/sermons/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin sermons');
    return res.json();
  },

  async createAdminSermon(data) {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_BASE_URL}/admin/sermons/`, {
      method: 'POST',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async updateAdminSermon(id, data) {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_BASE_URL}/admin/sermons/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async deleteAdminSermon(id) {
    const res = await fetch(`${API_BASE_URL}/admin/sermons/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete sermon');
    return true;
  },

  // Page SEO Management
  async getAdminPageSEO(pageIdentifier) {
    const res = await fetch(`${API_BASE_URL}/admin/page-seo/${encodeURIComponent(pageIdentifier)}/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch page SEO');
    return res.json();
  },

  async updateAdminPageSEO(pageIdentifier, data) {
    const res = await fetch(`${API_BASE_URL}/admin/page-seo/${encodeURIComponent(pageIdentifier)}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  // Admin Prayer Requests Management
  async getAdminPrayerRequests() {
    const res = await fetch(`${API_BASE_URL}/admin/prayer-requests/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch prayer requests');
    return res.json();
  },

  async updateAdminPrayerRequest(id, data) {
    const res = await fetch(`${API_BASE_URL}/admin/prayer-requests/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  async deleteAdminPrayerRequest(id) {
    const res = await fetch(`${API_BASE_URL}/admin/prayer-requests/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete prayer request');
    return true;
  },

  // Admin Donations & Subscribers
  async getAdminDonations() {
    const res = await fetch(`${API_BASE_URL}/admin/donations/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch donations');
    return res.json();
  },

  async getAdminSubscribers() {
    const res = await fetch(`${API_BASE_URL}/admin/subscribers/`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch subscribers');
    return res.json();
  },

  async deleteAdminSubscriber(id) {
    const res = await fetch(`${API_BASE_URL}/admin/subscribers/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete subscriber');
    return true;
  },
};


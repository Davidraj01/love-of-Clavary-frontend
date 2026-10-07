import React, { useState, useEffect, useMemo } from 'react';
import { api, getMediaUrl } from '../../services/api';
import { ROUTES } from '../../routes/routes';
import { 
  Globe, Search, Plus, Edit2, Trash2, Eye, 
  CheckCircle2, AlertCircle, Loader2, Sparkles, 
  ExternalLink, Share2, Tag, Calendar, User, 
  Check, X, FileText, BarChart2, ShieldCheck, 
  Image as ImageIcon, RefreshCw, Smartphone, Monitor,
  Sliders, Link as LinkIcon, HelpCircle, ArrowRight
} from 'lucide-react';

const CATEGORIES = [
  'Spiritual Growth',
  'Faith & Prayer',
  'Biblical Teaching',
  'Gospel & Outreach',
  'Christian Living',
  'Ministry Updates',
  'Testimonies',
];

export const AdminSEOEditor = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All', 'Published', 'Draft'

  // Modal / Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeEditorTab, setActiveEditorTab] = useState('content'); // 'content', 'seo', 'preview'
  const [serpDevice, setSerpDevice] = useState('desktop'); // 'desktop', 'mobile'
  
  // Delete Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: CATEGORIES[0],
    author: 'Pastor David Raj',
    featured_image_url: '',
    tags: [],
    tagInput: '',
    read_time: '5 min read',
    is_published: true,
    is_featured: false,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    focus_keyword: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    og_image_url: '',
    schema_type: 'BlogPosting',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminBlogs();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('error', 'Failed to load blog posts. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Helper to slugify title
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (val) => {
    setFormData(prev => {
      const updated = { ...prev, title: val };
      const currentGeneratedSlug = slugify(prev.title);
      const newSlug = slugify(val);
      
      // Auto-generate slug if new post or if current slug matched auto-generated slug
      if (!editingId && (!prev.slug || prev.slug === currentGeneratedSlug)) {
        updated.slug = newSlug;
        // Auto-generate canonical SEO URL
        if (!prev.canonical_url || prev.canonical_url === `https://www.loveofcalvary.org/blog/${prev.slug}`) {
          updated.canonical_url = newSlug ? `https://www.loveofcalvary.org/blog/${newSlug}` : '';
        }
      }
      
      // Auto prefill meta title if empty or matching default
      if (!prev.meta_title || prev.meta_title === `${prev.title} | Calvary Ministries`) {
        updated.meta_title = val ? `${val} | Calvary Ministries` : '';
      }
      return updated;
    });
  };

  const handleSlugChange = (val) => {
    const cleanSlug = slugify(val);
    setFormData(prev => ({
      ...prev,
      slug: cleanSlug,
      canonical_url: (!prev.canonical_url || prev.canonical_url === `https://www.loveofcalvary.org/blog/${prev.slug}`)
        ? (cleanSlug ? `https://www.loveofcalvary.org/blog/${cleanSlug}` : '')
        : prev.canonical_url
    }));
  };

  const handleExcerptChange = (val) => {
    setFormData(prev => {
      const updated = { ...prev, excerpt: val };
      if (!prev.meta_description || prev.meta_description === prev.excerpt) {
        updated.meta_description = val.slice(0, 160);
      }
      return updated;
    });
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setImageFile(null);
    setImagePreview('');
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: CATEGORIES[0],
      author: 'Pastor David Raj',
      featured_image_url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80',
      tags: ['Faith', 'Prayer', 'Spiritual Growth'],
      tagInput: '',
      read_time: '5 min read',
      is_published: true,
      is_featured: false,
      meta_title: '',
      meta_description: '',
      meta_keywords: 'faith, prayer, Calvary ministries, bible encouragement',
      focus_keyword: '',
      canonical_url: '',
      og_title: '',
      og_description: '',
      og_image_url: '',
      schema_type: 'BlogPosting',
    });
    setActiveEditorTab('content');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (blog) => {
    setEditingId(blog.id);
    setImageFile(null);
    setImagePreview(getMediaUrl(blog.effective_image_url || blog.featured_image_url));
    setFormData({
      title: blog.title || '',
      slug: blog.slug || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      category: blog.category || CATEGORIES[0],
      author: blog.author || 'Pastor David Raj',
      featured_image_url: blog.featured_image_url || '',
      tags: Array.isArray(blog.tags) ? blog.tags : [],
      tagInput: '',
      read_time: blog.read_time || '5 min read',
      is_published: blog.is_published ?? true,
      is_featured: blog.is_featured ?? false,
      meta_title: blog.meta_title || '',
      meta_description: blog.meta_description || '',
      meta_keywords: blog.meta_keywords || '',
      focus_keyword: blog.focus_keyword || '',
      canonical_url: blog.canonical_url || '',
      og_title: blog.og_title || '',
      og_description: blog.og_description || '',
      og_image_url: blog.og_image_url || '',
      schema_type: blog.schema_type || 'BlogPosting',
    });
    setActiveEditorTab('content');
    setIsEditorOpen(true);
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = formData.tagInput.trim().replace(/^,|,$/g, '');
      if (val && !formData.tags.includes(val)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, val],
          tagInput: ''
        }));
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Quick insert markdown helper into content textarea
  const insertFormatting = (syntaxStart, syntaxEnd = '') => {
    const textarea = document.getElementById('blog-content-textarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = formData.content;
    const selected = currentText.substring(start, end) || 'Sample text';
    const replacement = `${syntaxStart}${selected}${syntaxEnd}`;
    const newContent = currentText.substring(0, start) + replacement + currentText.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + syntaxStart.length, start + syntaxStart.length + selected.length);
    }, 50);
  };

  // Real-time SEO Scoring & Checklist Engine
  const seoAudit = useMemo(() => {
    const title = formData.title.trim();
    const metaTitle = (formData.meta_title || title).trim();
    const metaDesc = (formData.meta_description || formData.excerpt).trim();
    const slug = formData.slug.trim();
    const content = formData.content.trim();
    const focus = formData.focus_keyword.trim().toLowerCase();
    const hasImage = !!(imagePreview || formData.featured_image_url || imageFile);

    const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;

    const checks = [
      {
        id: 'focus_title',
        label: 'Focus Keyword in SEO Title',
        pass: focus ? metaTitle.toLowerCase().includes(focus) : false,
        weight: 15,
        tip: focus ? `Add "${formData.focus_keyword}" to the SEO Title.` : 'Set a target focus keyword below.'
      },
      {
        id: 'focus_desc',
        label: 'Focus Keyword in Meta Description',
        pass: focus ? metaDesc.toLowerCase().includes(focus) : false,
        weight: 15,
        tip: focus ? `Include "${formData.focus_keyword}" in your search description snippet.` : 'Set a focus keyword.'
      },
      {
        id: 'focus_slug',
        label: 'Focus Keyword in URL Slug',
        pass: focus ? slug.toLowerCase().includes(slugify(focus)) : false,
        weight: 10,
        tip: `Include focus keywords in URL slug for higher search rankings.`
      },
      {
        id: 'focus_content',
        label: 'Focus Keyword in Content',
        pass: focus ? content.toLowerCase().includes(focus) : false,
        weight: 15,
        tip: `Mention your focus keyword naturally in the article body.`
      },
      {
        id: 'title_length',
        label: 'SEO Title Length (40–60 characters)',
        pass: metaTitle.length >= 35 && metaTitle.length <= 65,
        weight: 15,
        current: `${metaTitle.length} chars`,
        tip: metaTitle.length < 35 ? 'Title is too short.' : metaTitle.length > 65 ? 'Title may be truncated by Google.' : 'Optimal length!'
      },
      {
        id: 'desc_length',
        label: 'Meta Description Length (120–160 characters)',
        pass: metaDesc.length >= 100 && metaDesc.length <= 165,
        weight: 15,
        current: `${metaDesc.length} chars`,
        tip: metaDesc.length < 100 ? 'Add more details to reach at least 120 chars.' : metaDesc.length > 165 ? 'Description may get cut off on mobile.' : 'Optimal length!'
      },
      {
        id: 'word_count',
        label: 'Article Word Count (300+ words)',
        pass: wordCount >= 250,
        weight: 10,
        current: `${wordCount} words`,
        tip: 'Articles with 300+ words provide deeper value to readers and search bots.'
      },
      {
        id: 'featured_image',
        label: 'Featured Image / OpenGraph Asset',
        pass: hasImage,
        weight: 5,
        tip: 'Add a high-quality featured photo for rich snippets and social cards.'
      },
    ];

    const totalPassedWeight = checks.reduce((acc, c) => acc + (c.pass ? c.weight : 0), 0);
    const score = Math.min(100, Math.round(totalPassedWeight));

    let grade = 'Needs Work';
    let color = '#EF4444'; // Red
    if (score >= 85) {
      grade = 'Excellent (A+)';
      color = '#10B981'; // Green
    } else if (score >= 65) {
      grade = 'Good (B)';
      color = '#F59E0B'; // Amber
    }

    return { checks, score, grade, color, wordCount };
  }, [formData, imagePreview, imageFile]);

  // Handle Save (Create or Update)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'Please enter an article title.');
      return;
    }
    if (!formData.slug.trim()) {
      showToast('error', 'Please enter a URL slug.');
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('slug', slugify(formData.slug));
      payload.append('excerpt', formData.excerpt.trim());
      payload.append('content', formData.content.trim());
      payload.append('category', formData.category);
      payload.append('author', formData.author.trim());
      payload.append('read_time', formData.read_time.trim());
      payload.append('is_published', formData.is_published);
      payload.append('is_featured', formData.is_featured);
      payload.append('tags', JSON.stringify(formData.tags));

      payload.append('meta_title', formData.meta_title.trim());
      payload.append('meta_description', formData.meta_description.trim());
      payload.append('meta_keywords', formData.meta_keywords.trim());
      payload.append('focus_keyword', formData.focus_keyword.trim());
      payload.append('canonical_url', formData.canonical_url.trim());
      payload.append('og_title', (formData.og_title || formData.meta_title || formData.title).trim());
      payload.append('og_description', (formData.og_description || formData.meta_description || formData.excerpt).trim());
      payload.append('schema_type', formData.schema_type);

      if (imageFile) {
        payload.append('featured_image', imageFile);
      } else if (formData.featured_image_url) {
        payload.append('featured_image_url', formData.featured_image_url.trim());
      }

      if (editingId) {
        await api.updateAdminBlog(editingId, payload);
        showToast('success', 'SEO Blog article updated successfully!');
      } else {
        await api.createAdminBlog(payload);
        showToast('success', 'New SEO Blog article published and indexed successfully!');
      }

      setIsEditorOpen(false);
      fetchBlogs();
    } catch (err) {
      const msg = err.slug ? `Slug error: ${err.slug[0]}` : (err.message || 'Error saving blog article.');
      showToast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  // Handle Quick Toggle Publish
  const handleTogglePublish = async (blog) => {
    try {
      await api.updateAdminBlog(blog.id, { is_published: !blog.is_published });
      setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, is_published: !b.is_published } : b));
      showToast('success', `Article ${!blog.is_published ? 'Published' : 'Moved to Drafts'}.`);
    } catch (err) {
      showToast('error', 'Could not update publication status.');
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await api.deleteAdminBlog(deleteConfirmId);
      setBlogs(prev => prev.filter(b => b.id !== deleteConfirmId));
      showToast('success', 'Blog article deleted permanently.');
      setDeleteConfirmId(null);
    } catch (err) {
      showToast('error', 'Could not delete blog article.');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered Blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      const matchesSearch = 
        blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.focus_keyword?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'All' || blog.category === selectedCategory;
      const matchesStatus = 
        selectedStatus === 'All' ? true :
        selectedStatus === 'Published' ? blog.is_published :
        !blog.is_published;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [blogs, searchQuery, selectedCategory, selectedStatus]);

  // Overall stats
  const totalViews = blogs.reduce((sum, b) => sum + (b.views_count || 0), 0);
  const publishedCount = blogs.filter(b => b.is_published).length;
  const draftCount = blogs.filter(b => !b.is_published).length;

  return (
    <div className="admin-seo-blogs-page">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: toastMessage.type === 'success' ? '#065F46' : '#991B1B',
          color: '#FFFFFF',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0B192C 0%, #1E3A5F 100%)',
        color: '#FFFFFF',
        padding: '2rem 2.25rem',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '2rem',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212, 175, 55, 0.2)', padding: '0.25rem 0.65rem', borderRadius: '20px', marginBottom: '0.5rem', border: '1px solid rgba(212, 175, 55, 0.4)' }}>
            <Globe size={14} color="var(--gold-primary)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--gold-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              SEO &amp; Content Engine
            </span>
          </div>
          <h1 style={{ color: '#FFFFFF', fontSize: '1.9rem', margin: '0 0 0.35rem 0', fontFamily: 'var(--font-heading)' }}>
            SEO Blog Management Portal
          </h1>
          <p style={{ color: 'var(--text-light-muted)', fontSize: '0.92rem', margin: 0, maxWidth: '640px' }}>
            Publish search-optimized articles, manage Google SERP snippets, optimize OpenGraph social cards, and track reader engagement.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleOpenNew}
            className="btn btn-gold"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.75rem 1.25rem', fontWeight: 700 }}
          >
            <Plus size={18} /> New SEO Article
          </button>
        </div>
      </div>

      {/* Metrics Summary Row */}
      <div className="metric-grid" style={{ marginBottom: '2rem' }}>
        <div className="metric-card">
          <div>
            <div className="metric-val">{blogs.length}</div>
            <div className="metric-label">Total Articles</div>
          </div>
          <div className="metric-icon" style={{ background: 'rgba(212, 175, 55, 0.15)', color: 'var(--gold-dark)' }}>
            <FileText size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-val">{publishedCount}</div>
            <div className="metric-label">Live &amp; Indexed</div>
          </div>
          <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-val">{draftCount}</div>
            <div className="metric-label">Drafts</div>
          </div>
          <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}>
            <Edit2 size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-val">{totalViews.toLocaleString()}</div>
            <div className="metric-label">Total Readers / Views</div>
          </div>
          <div className="metric-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563EB' }}>
            <BarChart2 size={22} />
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="editor-panel" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search by title, focus keyword, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.4rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
                background: '#FFFFFF'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                background: '#FFFFFF'
              }}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                background: '#FFFFFF'
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published Only</option>
              <option value="Draft">Drafts Only</option>
            </select>

            <button
              type="button"
              onClick={fetchBlogs}
              className="btn btn-outline btn-sm"
              title="Refresh list"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Articles Table / List */}
      <div className="editor-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0F172A', fontFamily: 'var(--font-heading)' }}>
            Articles ({filteredBlogs.length})
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
            Admin restricted: Only authenticated administrators can edit or publish articles.
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 0.75rem auto', color: 'var(--gold-primary)' }} />
            <p style={{ margin: 0 }}>Loading SEO articles...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <Globe size={42} style={{ color: '#CBD5E1', margin: '0 auto 0.75rem auto' }} />
            <h4 style={{ margin: '0 0 0.35rem 0', color: '#334155' }}>No Articles Found</h4>
            <p style={{ margin: '0 0 1.25rem 0', color: '#64748B', fontSize: '0.9rem' }}>
              {searchQuery ? 'No articles match your search criteria.' : 'Create your first SEO-optimized ministry blog post today!'}
            </p>
            <button type="button" onClick={handleOpenNew} className="btn btn-gold btn-sm">
              <Plus size={15} /> Create Article
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Article &amp; URL Slug</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category &amp; Author</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Focus Keyword</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Views</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlogs.map((blog) => {
                  const imgUrl = getMediaUrl(blog.effective_image_url || blog.featured_image_url);
                  return (
                    <tr key={blog.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '8px',
                            background: '#F1F5F9',
                            overflow: 'hidden',
                            flexShrink: 0,
                            border: '1px solid #E2E8F0'
                          }}>
                            {imgUrl ? (
                              <img src={imgUrl} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>
                                <ImageIcon size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <strong style={{ color: '#0F172A', fontSize: '0.95rem', display: 'block', marginBottom: '0.2rem' }}>
                              {blog.title}
                            </strong>
                            <code style={{ fontSize: '0.75rem', background: '#F1F5F9', color: '#475569', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                              /blog/{blog.slug}
                            </code>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          background: 'rgba(212, 175, 55, 0.15)',
                          color: '#854D0E',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          marginBottom: '0.25rem'
                        }}>
                          {blog.category}
                        </span>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                          {blog.author}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        {blog.focus_keyword ? (
                          <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                            {blog.focus_keyword}
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '0.78rem', fontStyle: 'italic' }}>None set</span>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(blog)}
                          style={{
                            border: 'none',
                            background: blog.is_published ? '#DCFCE7' : '#F1F5F9',
                            color: blog.is_published ? '#15803D' : '#64748B',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '20px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                          title="Click to toggle publish status"
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: blog.is_published ? '#16A34A' : '#94A3B8' }} />
                          {blog.is_published ? 'Published' : 'Draft'}
                        </button>
                      </td>

                      <td style={{ padding: '1rem 1rem', color: '#475569', fontWeight: 600 }}>
                        {blog.views_count || 0}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                          <a
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                            title="Preview Public Article"
                          >
                            <ExternalLink size={14} />
                          </a>
                          
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(blog)}
                            className="btn btn-navy btn-sm"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            title="Edit Article & SEO"
                          >
                            <Edit2 size={13} /> Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(blog.id)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.55rem', color: '#DC2626', borderColor: '#FCA5A5' }}
                            title="Delete Article"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          FULL-FEATURED SEO & CONTENT EDITOR MODAL
          ========================================================================= */}
      {isEditorOpen && (
        <div className="modal-overlay" style={{ zIndex: 4000, padding: '1rem' }}>
          <div className="modal-content" style={{ maxWidth: '980px', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', padding: 0, borderRadius: '16px', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0B192C 0%, #1A365D 100%)',
              color: '#FFFFFF',
              padding: '1.25rem 1.75rem',
              position: 'relative',
              borderBottom: '2px solid var(--gold-primary)',
              flexShrink: 0
            }}>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                style={{
                  position: 'absolute',
                  top: '1.1rem',
                  right: '1.25rem',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  color: '#FFFFFF',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Globe size={22} color="var(--gold-primary)" />
                <div>
                  <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                    {editingId ? 'Edit SEO Blog Article' : 'Create New SEO Blog Article'}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--gold-light)' }}>
                    Admin Mode &bull; Real-time Google SERP analysis &bull; Schema generator
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Navigation Toolbar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              padding: '0.5rem 1.75rem',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveEditorTab('content')}
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeEditorTab === 'content' ? '#0B192C' : 'transparent',
                    color: activeEditorTab === 'content' ? '#D4AF37' : '#475569',
                    fontWeight: activeEditorTab === 'content' ? 700 : 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <FileText size={15} /> 1. Content &amp; Details
                </button>

                <button
                  type="button"
                  onClick={() => setActiveEditorTab('seo')}
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeEditorTab === 'seo' ? '#0B192C' : 'transparent',
                    color: activeEditorTab === 'seo' ? '#D4AF37' : '#475569',
                    fontWeight: activeEditorTab === 'seo' ? 700 : 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Globe size={15} /> 2. SEO &amp; SERP Engine
                  <span style={{
                    background: seoAudit.color,
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '10px',
                    marginLeft: '0.3rem',
                    fontWeight: 700
                  }}>
                    {seoAudit.score}%
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveEditorTab('preview')}
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeEditorTab === 'preview' ? '#0B192C' : 'transparent',
                    color: activeEditorTab === 'preview' ? '#D4AF37' : '#475569',
                    fontWeight: activeEditorTab === 'preview' ? 700 : 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Eye size={15} /> 3. Live Preview
                </button>
              </div>

              {/* Status Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                  />
                  <span>Publish to Website</span>
                </label>
              </div>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem 1.75rem' }}>
              
              {/* TAB 1: ARTICLE CONTENT & DETAILS */}
              {activeEditorTab === 'content' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Title & Slug */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                      Article Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Walking in Unshakable Faith in Challenging Times"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '1rem',
                        fontWeight: 600
                      }}
                    />
                  </div>

                  {/* Slug / Permalink */}
                  <div style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                        URL Slug / Automatic SEO Permalink *
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSlugChange(formData.title)}
                        style={{ border: 'none', background: 'transparent', color: 'var(--gold-dark)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                      >
                        <RefreshCw size={12} /> Auto-generate from Title
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ padding: '0.65rem 0.75rem', background: '#E2E8F0', border: '1px solid #CBD5E1', borderRight: 'none', borderRadius: '6px 0 0 6px', fontSize: '0.82rem', color: '#64748B' }}>
                        https://www.loveofcalvary.org/blog/
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="article-slug"
                        value={formData.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '0.65rem 0.85rem',
                          borderRadius: '0 6px 6px 0',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.88rem',
                          fontFamily: 'monospace',
                          background: '#FFFFFF'
                        }}
                      />
                    </div>
                  </div>

                  {/* Category, Author, Read Time */}
                  <div className="donation-form-grid-2">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', background: '#FFFFFF' }}
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                        Author Name
                      </label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  {/* Excerpt / Summary */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                        Short Excerpt / Summary (Used in cards &amp; search previews)
                      </label>
                      <span style={{ fontSize: '0.75rem', color: formData.excerpt.length > 200 ? '#DC2626' : '#64748B' }}>
                        {formData.excerpt.length} / 200 chars
                      </span>
                    </div>
                    <textarea
                      rows="2"
                      placeholder="Brief 1-2 sentence overview of the article..."
                      value={formData.excerpt}
                      onChange={(e) => handleExcerptChange(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', resize: 'vertical' }}
                    />
                  </div>

                  {/* Featured Image */}
                  <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                      Featured Image &amp; Social Share Graphic
                    </label>
                    
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div style={{
                        width: '120px',
                        height: '75px',
                        borderRadius: '6px',
                        background: '#E2E8F0',
                        overflow: 'hidden',
                        border: '1px solid #CBD5E1',
                        flexShrink: 0
                      }}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>
                            <ImageIcon size={24} />
                          </div>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          style={{ fontSize: '0.82rem' }}
                        />
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          Or paste an image URL directly:
                        </div>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={formData.featured_image_url}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, featured_image_url: e.target.value }));
                            if (!imageFile) setImagePreview(e.target.value);
                          }}
                          style={{ width: '100%', padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Article Content Editor with Toolbar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                        Article Body Content (Markdown / HTML formatted) *
                      </label>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {seoAudit.wordCount} words
                      </span>
                    </div>

                    {/* Quick Formatting Toolbar */}
                    <div style={{
                      display: 'flex',
                      gap: '0.35rem',
                      background: '#F1F5F9',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '6px 6px 0 0',
                      border: '1px solid #CBD5E1',
                      borderBottom: 'none',
                      flexWrap: 'wrap'
                    }}>
                      <button type="button" onClick={() => insertFormatting('### ')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer' }}>
                        H2
                      </button>
                      <button type="button" onClick={() => insertFormatting('#### ')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer' }}>
                        H3
                      </button>
                      <button type="button" onClick={() => insertFormatting('**', '**')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer' }}>
                        Bold
                      </button>
                      <button type="button" onClick={() => insertFormatting('*', '*')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', fontStyle: 'italic', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer' }}>
                        Italic
                      </button>
                      <button type="button" onClick={() => insertFormatting('> ')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer' }}>
                        Quote / Scripture
                      </button>
                      <button type="button" onClick={() => insertFormatting('- ')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer' }}>
                        Bullet List
                      </button>
                      <button type="button" onClick={() => insertFormatting('1. ')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer' }}>
                        Numbered List
                      </button>
                    </div>

                    <textarea
                      id="blog-content-textarea"
                      required
                      rows="14"
                      placeholder="Write your article content here in rich markdown or text..."
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '0 0 6px 6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.92rem',
                        lineHeight: 1.6,
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* Tags Input */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                      Article Tags &amp; Topics
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.45rem' }}>
                      {formData.tags.map(tag => (
                        <span key={tag} style={{ background: '#E0F2FE', color: '#0369A1', fontSize: '0.78rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: '15px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          #{tag}
                          <button type="button" onClick={() => handleRemoveTag(tag)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#0369A1', padding: 0, display: 'flex' }}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Type a tag and press Enter or comma..."
                      value={formData.tagInput}
                      onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                      onKeyDown={handleAddTag}
                      style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: SEO ENGINE & GOOGLE SERP OPTIMIZER */}
              {activeEditorTab === 'seo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Live SEO Score Banner */}
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', fontWeight: 700 }}>
                        Real-Time SEO Audit
                      </span>
                      <h4 style={{ margin: '0.2rem 0 0', fontSize: '1.2rem', color: '#0F172A' }}>
                        SEO Optimization Health Score: <strong style={{ color: seoAudit.color }}>{seoAudit.score}/100</strong> ({seoAudit.grade})
                      </h4>
                    </div>

                    <div style={{
                      width: '180px',
                      height: '10px',
                      background: '#E2E8F0',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${seoAudit.score}%`,
                        height: '100%',
                        background: seoAudit.color,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>

                  {/* Google SERP Live Search Preview */}
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>
                        <Globe size={16} color="var(--gold-primary)" /> Google SERP Snippet Preview
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem', background: '#F1F5F9', padding: '0.2rem', borderRadius: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setSerpDevice('desktop')}
                          style={{
                            border: 'none',
                            background: serpDevice === 'desktop' ? '#FFFFFF' : 'transparent',
                            color: serpDevice === 'desktop' ? '#0F172A' : '#64748B',
                            fontWeight: 600,
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            boxShadow: serpDevice === 'desktop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                          }}
                        >
                          <Monitor size={12} /> Desktop
                        </button>
                        <button
                          type="button"
                          onClick={() => setSerpDevice('mobile')}
                          style={{
                            border: 'none',
                            background: serpDevice === 'mobile' ? '#FFFFFF' : 'transparent',
                            color: serpDevice === 'mobile' ? '#0F172A' : '#64748B',
                            fontWeight: 600,
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            boxShadow: serpDevice === 'mobile' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                          }}
                        >
                          <Smartphone size={12} /> Mobile
                        </button>
                      </div>
                    </div>

                    {/* Google Visual Card Container */}
                    <div style={{
                      background: '#FFFFFF',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      maxWidth: serpDevice === 'mobile' ? '420px' : '620px',
                      fontFamily: 'arial, sans-serif'
                    }}>
                      <div style={{ fontSize: '0.8rem', color: '#202124', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#0B192C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontSize: '0.6rem', fontWeight: 'bold' }}>
                          C
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#202124' }}>Compassionate Love of Calvary</span>
                        <span style={{ color: '#5f6368', fontSize: '0.75rem' }}>https://compassionateloveofcalvary.org › blog › {formData.slug || 'article-slug'}</span>
                      </div>

                      <h4 style={{
                        color: '#1a0dab',
                        fontSize: serpDevice === 'mobile' ? '1rem' : '1.25rem',
                        fontWeight: 400,
                        margin: '0.2rem 0',
                        cursor: 'pointer',
                        lineHeight: 1.3
                      }}>
                        {formData.meta_title || formData.title || 'Your Article Title'}
                      </h4>

                      <p style={{
                        color: '#4d5156',
                        fontSize: '0.85rem',
                        lineHeight: 1.4,
                        margin: 0
                      }}>
                        {formData.meta_description || formData.excerpt || 'Please provide a meta description to see how your article will look in Google search results.'}
                      </p>
                    </div>
                  </div>

                  {/* Target Focus Keyword */}
                  <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                      Primary Focus Keyword (Target Search Term)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. unshakable faith in God"
                      value={formData.focus_keyword}
                      onChange={(e) => setFormData(prev => ({ ...prev, focus_keyword: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', background: '#FFFFFF' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '0.25rem' }}>
                      The main search query you want this article to rank for on Google and Bing.
                    </span>
                  </div>

                  {/* Meta Title Input */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                        SEO Meta Title (Title Tag)
                      </label>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: formData.meta_title.length >= 40 && formData.meta_title.length <= 60 ? '#059669' : formData.meta_title.length > 60 ? '#DC2626' : '#D97706'
                      }}>
                        {formData.meta_title.length} / 60 chars (Recommended: 40–60)
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Custom title tag for search engine bots..."
                      value={formData.meta_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>

                  {/* Meta Description Input */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                        SEO Meta Description
                      </label>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: formData.meta_description.length >= 120 && formData.meta_description.length <= 160 ? '#059669' : formData.meta_description.length > 160 ? '#DC2626' : '#D97706'
                      }}>
                        {formData.meta_description.length} / 160 chars (Recommended: 120–160)
                      </span>
                    </div>
                    <textarea
                      rows="3"
                      placeholder="Search snippet displayed under your title in Google search results..."
                      value={formData.meta_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem', resize: 'vertical' }}
                    />
                  </div>

                  {/* Meta Keywords & Canonical URL */}
                  <div className="donation-form-grid-2">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                        Meta Keywords (Comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="faith, christian living, prayer, calvary"
                        value={formData.meta_keywords}
                        onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
                        style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                        Canonical URL (Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://compassionateloveofcalvary.org/blog/..."
                        value={formData.canonical_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, canonical_url: e.target.value }))}
                        style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* Real-time SEO Checklist */}
                  <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '0.95rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={16} color="var(--gold-dark)" /> SEO Quality Checklist
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.65rem' }}>
                      {seoAudit.checks.map(c => (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.84rem' }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: c.pass ? '#DCFCE7' : '#FEE2E2',
                            color: c.pass ? '#15803D' : '#B91C1C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '1px'
                          }}>
                            {c.pass ? <Check size={13} /> : <X size={13} />}
                          </div>
                          <div>
                            <strong style={{ color: c.pass ? '#15803D' : '#991B1B' }}>
                              {c.label} {c.current ? `(${c.current})` : ''}
                            </strong>
                            {!c.pass && (
                              <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: '#64748B' }}>
                                {c.tip}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LIVE ARTICLE PREVIEW */}
              {activeEditorTab === 'preview' && (
                <div style={{ maxWidth: '780px', margin: '0 auto', background: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <span style={{
                    display: 'inline-block',
                    background: 'rgba(212, 175, 55, 0.15)',
                    color: '#854D0E',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    marginBottom: '0.65rem'
                  }}>
                    {formData.category}
                  </span>

                  <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: '#0B192C', margin: '0 0 0.75rem 0', lineHeight: 1.25 }}>
                    {formData.title || 'Untitled Article'}
                  </h1>

                  <div style={{ display: 'flex', gap: '1rem', color: '#64748B', fontSize: '0.84rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem' }}>
                    <span>By <strong>{formData.author}</strong></span>
                    <span>&bull;</span>
                    <span>{formData.read_time}</span>
                    <span>&bull;</span>
                    <span>Status: {formData.is_published ? 'Published' : 'Draft'}</span>
                  </div>

                  {(imagePreview || formData.featured_image_url) && (
                    <div style={{ borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem', maxHeight: '340px' }}>
                      <img
                        src={imagePreview || formData.featured_image_url}
                        alt={formData.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  {formData.excerpt && (
                    <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--gold-primary)', fontStyle: 'italic', fontSize: '1rem', color: '#334155', marginBottom: '1.5rem' }}>
                      {formData.excerpt}
                    </div>
                  )}

                  <div style={{ fontSize: '1rem', lineHeight: 1.8, color: '#1E293B', whiteSpace: 'pre-line' }}>
                    {formData.content || 'No content written yet.'}
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem'
              }}>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-gold"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', minWidth: '160px', justifyContent: 'center' }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving Article...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> {editingId ? 'Save Changes' : 'Publish Article'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION DIALOG
          ========================================================================= */}
      {deleteConfirmId && (
        <div className="modal-overlay" style={{ zIndex: 5000, padding: '1rem' }}>
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center', padding: '2rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '1.25rem' }}>
              Delete Article?
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.88rem', color: '#64748B' }}>
              Are you sure you want to permanently delete this SEO blog article? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="btn btn-gold"
                style={{ flex: 1, background: '#DC2626', borderColor: '#DC2626', color: '#FFFFFF' }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

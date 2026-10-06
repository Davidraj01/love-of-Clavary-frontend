import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api, getMediaUrl } from '../../services/api';
import { ROUTES } from '../../routes/routes';
import { MediaPickerModal } from '../../components/MediaPickerModal';
import { convertWordPressToHtml, extractCleanSnippet, calculateKeywordDensity } from '../../utils/wpToHtmlConverter';
import { 
  Globe, Search, Save, Eye, CheckCircle2, AlertCircle, Sparkles, 
  Smartphone, Monitor, ExternalLink, ShieldCheck, Tag, Link2, Share2, 
  Code, RefreshCw, FileText, Check, Copy, Image as ImageIcon,
  Bold, Italic, Underline, List, ListOrdered, Quote, Table, Minus,
  Link as LinkIcon, FileCode, Plus, X, Layers, Heading1, Heading2, Heading3
} from 'lucide-react';

const PAGES = [
  { id: 'home', name: 'Home Page', path: ROUTES.HOME, defaultKw: 'compassionate love of calvary ministries' },
  { id: 'about', name: 'About Page', path: ROUTES.ABOUT, defaultKw: 'christian ministry chengalpattu' },
  { id: 'ministries', name: 'Ministries Page', path: ROUTES.MINISTRIES, defaultKw: 'church ministries and community outreach' },
  { id: 'bible', name: 'Bible Page', path: ROUTES.BIBLE, defaultKw: 'holy scriptures bible reading plans' },
  { id: 'study', name: 'Study Page', path: ROUTES.STUDY, defaultKw: 'verse by verse bible studies discipleship' },
  { id: 'devotional', name: 'Devotional Page', path: ROUTES.DEVOTIONAL, defaultKw: 'daily christian devotionals morning prayer' },
  { id: 'sermons', name: 'Sermons Page', path: ROUTES.SERMONS, defaultKw: 'gospel sermons video messages faith' },
  { id: 'events', name: 'Events Page', path: ROUTES.EVENTS, defaultKw: 'worship prayer assembly church events' },
  { id: 'blog', name: 'Blog Page', path: ROUTES.BLOG, defaultKw: 'christian living articles spiritual growth' },
  { id: 'media', name: 'Media Page', path: ROUTES.MEDIA, defaultKw: 'ministry worship photos video gallery' },
  { id: 'contact', name: 'Contact Page', path: ROUTES.CONTACT, defaultKw: 'prayer request pastor contact chengalpattu' },
];

export const AdminPageSEOEditor = () => {
  const [selectedPage, setSelectedPage] = useState('home');
  const [seoData, setSeoData] = useState({
    page_identifier: 'home',
    h1_heading: '',
    body_content: '',
    featured_image_url: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    focus_keyword: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    og_image_url: '',
    twitter_card: 'summary_large_image',
    schema_type: 'Church',
    robots_index: true,
    robots_follow: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [serpDevice, setSerpDevice] = useState('desktop');
  const [autoSyncMetaDesc, setAutoSyncMetaDesc] = useState(true);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'preview', 'schema'

  // Modals
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState('featured'); // 'featured', 'body', 'og'
  const [isWpModalOpen, setIsWpModalOpen] = useState(false);
  const [wpRawText, setWpRawText] = useState('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkData, setLinkData] = useState({ text: '', url: 'https://', target: '_blank', nofollow: false });
  const [copiedSchema, setCopiedSchema] = useState(false);

  const textareaRef = useRef(null);

  const fetchPageSEO = async (pageId) => {
    try {
      setLoading(true);
      const data = await api.getAdminPageSEO(pageId);
      if (data) {
        setSeoData({
          page_identifier: data.page_identifier || pageId,
          h1_heading: data.h1_heading || '',
          body_content: data.body_content || '',
          featured_image_url: data.featured_image_url || '',
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          meta_keywords: data.meta_keywords || '',
          focus_keyword: data.focus_keyword || '',
          canonical_url: data.canonical_url || '',
          og_title: data.og_title || '',
          og_description: data.og_description || '',
          og_image_url: data.og_image_url || '',
          twitter_card: data.twitter_card || 'summary_large_image',
          schema_type: data.schema_type || 'Church',
          robots_index: data.robots_index ?? true,
          robots_follow: data.robots_follow ?? true,
        });
      }
    } catch (err) {
      console.error('Failed to load SEO data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageSEO(selectedPage);
  }, [selectedPage]);

  const handleChange = (field, value) => {
    setSeoData(prev => ({ ...prev, [field]: value }));
  };

  const handleBodyContentChange = (val) => {
    setSeoData(prev => {
      const updated = { ...prev, body_content: val };
      
      // Live Auto-Sync Meta Description from Body Content if enabled or empty
      if (autoSyncMetaDesc || !prev.meta_description) {
        const cleanSnippet = extractCleanSnippet(val, 155);
        if (cleanSnippet) {
          updated.meta_description = cleanSnippet;
        }
      }
      return updated;
    });
  };

  const handleOpenMediaPicker = (target = 'featured') => {
    setMediaPickerTarget(target);
    setIsMediaPickerOpen(true);
  };

  const handleMediaPickerSelect = (imgData) => {
    if (mediaPickerTarget === 'featured') {
      handleChange('featured_image_url', imgData.url);
      handleChange('og_image_url', seoData.og_image_url || imgData.url);
    } else if (mediaPickerTarget === 'og') {
      handleChange('og_image_url', imgData.url);
    }
  };

  // Textarea cursor insertion
  const insertAtCursor = (prefix, suffix = '') => {
    const textarea = textareaRef.current || document.getElementById('pageseo-body-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = seoData.body_content || '';
    const selected = currentText.substring(start, end) || 'Sample text';
    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = currentText.substring(0, start) + replacement + currentText.substring(end);

    handleBodyContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  const handleInsertLink = () => {
    if (!linkData.url) return;
    const rel = linkData.nofollow ? 'rel="nofollow noopener noreferrer"' : 'rel="noopener noreferrer"';
    const target = linkData.target ? `target="${linkData.target}"` : '';
    const linkHtml = `<a href="${linkData.url}" ${target} ${rel} style="color: #0B192C; text-decoration: underline; font-weight: 600;">${linkData.text || linkData.url}</a>`;
    insertAtCursor(linkHtml, '');
    setIsLinkModalOpen(false);
    setLinkData({ text: '', url: 'https://', target: '_blank', nofollow: false });
  };

  const insertTable = () => {
    const tableHtml = `\n<div style="overflow-x: auto; margin: 1.5rem 0;">\n  <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem; border: 1px solid #E2E8F0;">\n    <thead>\n      <tr style="background: #0B192C; color: #FFFFFF;">\n        <th style="padding: 0.75rem 1rem; text-align: left;">Section</th>\n        <th style="padding: 0.75rem 1rem; text-align: left;">Focus &amp; Scripture</th>\n        <th style="padding: 0.75rem 1rem; text-align: left;">Details</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr style="border-bottom: 1px solid #E2E8F0;">\n        <td style="padding: 0.75rem 1rem;">Fellowship &amp; Prayer</td>\n        <td style="padding: 0.75rem 1rem;">Acts 2:42</td>\n        <td style="padding: 0.75rem 1rem;">Devoted to apostolic teaching and prayer</td>\n      </tr>\n    </tbody>\n  </table>\n</div>\n`;
    insertAtCursor(tableHtml, '');
  };

  const handleConvertWpImport = () => {
    if (!wpRawText.trim()) return;
    const converted = convertWordPressToHtml(wpRawText);
    const existing = seoData.body_content ? seoData.body_content + '\n\n' : '';
    handleBodyContentChange(existing + converted);
    setWpRawText('');
    setIsWpModalOpen(false);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', text: '' });

    try {
      await api.updateAdminPageSEO(selectedPage, seoData);
      setFeedback({ type: 'success', text: `SEO & Body Content for ${selectedPage.toUpperCase()} saved and synced live!` });
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to update SEO and body content settings.' });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback({ type: '', text: '' }), 5000);
    }
  };

  const currentPageObj = PAGES.find(p => p.id === selectedPage) || PAGES[0];
  const titleLength = (seoData.meta_title || '').length;
  const descLength = (seoData.meta_description || '').length;

  const kwDensity = calculateKeywordDensity(seoData.body_content, seoData.focus_keyword);

  const handleAutoFillDefaults = () => {
    const pageObj = PAGES.find(p => p.id === selectedPage) || PAGES[0];
    const canonical = `https://www.clm.org.in${pageObj.path === '/' ? '' : pageObj.path}`;
    const metaTitle = `${pageObj.name} | Compassionate Love of Calvary Ministries`;
    const metaDesc = `Welcome to the ${pageObj.name} of Compassionate Love of Calvary Ministries. Rooted in prayer, anchored in Biblical truth, and sharing the boundless love of Christ.`;

    setSeoData(prev => ({
      ...prev,
      h1_heading: prev.h1_heading || pageObj.name,
      meta_title: metaTitle,
      meta_description: metaDesc,
      focus_keyword: pageObj.defaultKw,
      canonical_url: canonical,
      og_title: metaTitle,
      og_description: metaDesc,
      og_image_url: prev.og_image_url || prev.featured_image_url || 'https://www.clm.org.in/logo.png',
      meta_keywords: `${pageObj.name.toLowerCase()}, calvary ministries, faith, prayer, chengalpattu, christian worship`
    }));
  };

  const generatedSchema = useMemo(() => {
    const canonical = seoData.canonical_url || `https://www.clm.org.in${currentPageObj.path === '/' ? '' : currentPageObj.path}`;
    return {
      "@context": "https://schema.org",
      "@type": seoData.schema_type || "Church",
      "name": "Compassionate Love of Calvary Ministries",
      "headline": seoData.meta_title || `${currentPageObj.name} | Calvary Ministries`,
      "description": seoData.meta_description || "Compassionate Love of Calvary Ministries",
      "url": canonical,
      "logo": "https://www.clm.org.in/logo.png",
      "image": seoData.og_image_url || seoData.featured_image_url || "https://www.clm.org.in/logo.png",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "81/5, 6th Street, Shanthi Nagar",
        "addressLocality": "Chengalpattu",
        "addressRegion": "Tamil Nadu",
        "postalCode": "603003",
        "addressCountry": "IN"
      }
    };
  }, [seoData, currentPageObj]);

  const handleCopySchema = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(generatedSchema, null, 2));
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2500);
    }
  };

  return (
    <div className="admin-editor-page">
      {/* Page Title Header */}
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--gold-dark)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
            Master Page SEO &amp; Body Content Studio
          </span>
          <h1 style={{ fontSize: '2rem', margin: '0.25rem 0', color: 'var(--bg-dark)' }}>
            Page SEO Suite
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Add and edit body content, image URLs, canonical tags, and auto-sync live SEO rankings across all ministry pages.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleAutoFillDefaults}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Sparkles size={14} /> Auto-Fill Page Defaults
          </button>

          <a href={currentPageObj.path} target="_blank" rel="noopener noreferrer" className="btn btn-outline-gold btn-sm">
            <ExternalLink size={15} /> Preview {currentPageObj.name} Live
          </a>
        </div>
      </div>

      {feedback.text && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: feedback.type === 'success' ? '#15803D' : '#B91C1C',
          border: `1px solid ${feedback.type === 'success' ? '#86EFAC' : '#FCA5A5'}`,
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span style={{ fontWeight: 600 }}>{feedback.text}</span>
        </div>
      )}

      {/* Page Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        {PAGES.map(page => (
          <button
            key={page.id}
            type="button"
            onClick={() => setSelectedPage(page.id)}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: selectedPage === page.id ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
              background: selectedPage === page.id ? 'var(--bg-dark)' : '#FFFFFF',
              color: selectedPage === page.id ? '#FFFFFF' : 'var(--text-dark)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {page.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212,175,55,0.3)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
          <p>Loading SEO and body content parameters for {currentPageObj.name}...</p>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'flex-start' }}>
            
            {/* LEFT COLUMN: Body Content & SEO Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* SECTION 1: Rich Body Content & WordPress HTML Editor */}
              <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={18} color="var(--gold-dark)" />
                    <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--bg-dark)' }}>
                      {currentPageObj.name} Body &amp; Article Content
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsWpModalOpen(true)}
                    className="btn btn-outline btn-sm"
                    style={{ background: '#F0FDF4', borderColor: '#86EFAC', color: '#15803D', fontWeight: 700 }}
                  >
                    <Sparkles size={14} /> Paste WordPress Content
                  </button>
                </div>

                {/* H1 Heading on Page */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '0.35rem' }}>
                    Primary H1 Page Heading *
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. Welcome to ${currentPageObj.name} - Compassionate Love of Calvary`}
                    value={seoData.h1_heading}
                    onChange={(e) => handleChange('h1_heading', e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: 600 }}
                  />
                </div>

                {/* Rich Formatting Toolbar */}
                <div style={{
                  display: 'flex',
                  gap: '0.35rem',
                  background: '#F1F5F9',
                  padding: '0.5rem 0.65rem',
                  borderRadius: '8px 8px 0 0',
                  border: '1px solid #CBD5E1',
                  borderBottom: 'none',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}>
                  <button type="button" onClick={() => insertAtCursor('<h2>', '</h2>')} style={toolbarBtnStyle} title="Heading 2 (H2)">
                    H2
                  </button>
                  <button type="button" onClick={() => insertAtCursor('<h3>', '</h3>')} style={toolbarBtnStyle} title="Heading 3 (H3)">
                    H3
                  </button>
                  <button type="button" onClick={() => insertAtCursor('<h4>', '</h4>')} style={toolbarBtnStyle} title="Heading 4 (H4)">
                    H4
                  </button>
                  <button type="button" onClick={() => insertAtCursor('<p style="margin-bottom: 1.25rem; line-height: 1.8; color: #334155;">', '</p>')} style={toolbarBtnStyle} title="Paragraph">
                    P
                  </button>

                  <div style={{ width: '1px', height: '18px', background: '#CBD5E1', margin: '0 0.2rem' }} />

                  <button type="button" onClick={() => insertAtCursor('<strong>', '</strong>')} style={toolbarBtnStyle} title="Bold">
                    <Bold size={13} />
                  </button>
                  <button type="button" onClick={() => insertAtCursor('<em>', '</em>')} style={toolbarBtnStyle} title="Italic">
                    <Italic size={13} />
                  </button>
                  <button type="button" onClick={() => insertAtCursor('<u>', '</u>')} style={toolbarBtnStyle} title="Underline">
                    <Underline size={13} />
                  </button>

                  <div style={{ width: '1px', height: '18px', background: '#CBD5E1', margin: '0 0.2rem' }} />

                  <button 
                    type="button" 
                    onClick={() => insertAtCursor('<blockquote style="border-left: 4px solid #D4AF37; padding: 0.85rem 1.35rem; margin: 1.5rem 0; background: #F8FAFC; font-style: italic; color: #1E293B; border-radius: 0 8px 8px 0;">\n  "', '"\n  <cite style="display: block; margin-top: 0.4rem; font-size: 0.85rem; color: #64748B; font-weight: 600;">— Biblical Scripture</cite>\n</blockquote>')} 
                    style={{ ...toolbarBtnStyle, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }} 
                    title="Scripture Box"
                  >
                    <Quote size={13} /> Scripture
                  </button>

                  <button type="button" onClick={() => insertAtCursor('<ul style="margin: 1rem 0 1.25rem 1.5rem; line-height: 1.8;">\n  <li>', '</li>\n  <li>Point 2</li>\n</ul>')} style={toolbarBtnStyle} title="Bullet List">
                    <List size={13} />
                  </button>
                  <button type="button" onClick={() => insertAtCursor('<ol style="margin: 1rem 0 1.25rem 1.5rem; line-height: 1.8;">\n  <li>', '</li>\n  <li>Step 2</li>\n</ol>')} style={toolbarBtnStyle} title="Numbered List">
                    <ListOrdered size={13} />
                  </button>

                  <button type="button" onClick={() => setIsLinkModalOpen(true)} style={toolbarBtnStyle} title="Insert Link">
                    <LinkIcon size={13} /> Link
                  </button>

                  <button type="button" onClick={insertTable} style={toolbarBtnStyle} title="Insert Table">
                    <Table size={13} /> Table
                  </button>

                  <button type="button" onClick={() => insertAtCursor('\n<hr style="border: none; border-top: 1px solid #E2E8F0; margin: 2rem 0;" />\n', '')} style={toolbarBtnStyle} title="Horizontal Divider">
                    <Minus size={13} /> HR
                  </button>

                  <div style={{ width: '1px', height: '18px', background: '#CBD5E1', margin: '0 0.2rem' }} />

                  {/* Add Image from Media Folder Gallery into Body */}
                  <button 
                    type="button" 
                    onClick={() => handleOpenMediaPicker('body')} 
                    style={{ ...toolbarBtnStyle, background: 'rgba(212, 175, 55, 0.2)', borderColor: 'rgba(212, 175, 55, 0.5)', color: '#854D0E', fontWeight: 700 }}
                    title="Insert Image from Folder Gallery"
                  >
                    <ImageIcon size={13} /> + Add Body Image
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  id="pageseo-body-textarea"
                  rows={10}
                  placeholder={`Write or paste body content for the ${currentPageObj.name} here...`}
                  value={seoData.body_content}
                  onChange={(e) => handleBodyContentChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '0 0 8px 8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.78rem', color: '#64748B' }}>
                  <span>Body Words: <strong>{kwDensity.totalWords}</strong></span>
                  <span>Keyword Density: <strong>{kwDensity.density}%</strong> ({kwDensity.count} mentions)</span>
                </div>
              </div>

              {/* SECTION 2: Search Engine Meta Tags */}
              <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: 'var(--bg-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Search size={18} color="var(--gold-dark)" /> Search Engine Meta Tags &amp; Auto-Sync
                </h3>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Meta Title (Page Title Tag)</label>
                    <span style={{ fontSize: '0.75rem', color: titleLength > 60 ? '#EF4444' : '#64748B', fontWeight: 600 }}>
                      {titleLength}/60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bible Studies & Teachings | Compassionate Love of Calvary Ministries"
                    value={seoData.meta_title}
                    onChange={(e) => handleChange('meta_title', e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Meta Description (Google Snippet)</label>
                      <button
                        type="button"
                        onClick={() => {
                          const clean = extractCleanSnippet(seoData.body_content, 155);
                          handleChange('meta_description', clean);
                        }}
                        style={{ border: 'none', background: 'transparent', color: 'var(--gold-dark)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                      >
                        <RefreshCw size={11} /> Extract from Body
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#475569', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={autoSyncMetaDesc}
                          onChange={(e) => setAutoSyncMetaDesc(e.target.checked)}
                        />
                        <span>Auto-Sync from Body Content</span>
                      </label>
                      <span style={{ fontSize: '0.75rem', color: descLength > 160 ? '#EF4444' : '#64748B', fontWeight: 600 }}>
                        {descLength}/160 chars
                      </span>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="Compelling description summarizing this page for search results..."
                    value={seoData.meta_description}
                    onChange={(e) => {
                      setAutoSyncMetaDesc(false);
                      handleChange('meta_description', e.target.value);
                    }}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '0.35rem' }}>Focus Keyword</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Calvary Bible Study"
                      value={seoData.focus_keyword}
                      onChange={(e) => handleChange('focus_keyword', e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    />
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Canonical URL Tag</label>
                      <button
                        type="button"
                        onClick={() => handleChange('canonical_url', `https://www.clm.org.in${currentPageObj.path === '/' ? '' : currentPageObj.path}`)}
                        style={{ border: 'none', background: 'transparent', color: 'var(--gold-dark)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Auto Set
                      </button>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`https://www.clm.org.in${currentPageObj.path}`}
                      value={seoData.canonical_url}
                      onChange={(e) => handleChange('canonical_url', e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '0.35rem' }}>Meta Keywords (Comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="calvary, christian teachings, daily devotional, sunday sermons"
                    value={seoData.meta_keywords}
                    onChange={(e) => handleChange('meta_keywords', e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              {/* SECTION 3: Social Media OpenGraph & Images */}
              <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: 'var(--bg-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Share2 size={18} color="var(--gold-dark)" /> Social Sharing &amp; OpenGraph Image
                </h3>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Social Share Image URL (og:image)</label>
                    <button
                      type="button"
                      onClick={() => handleOpenMediaPicker('og')}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    >
                      <ImageIcon size={12} /> Select from Folder Gallery
                    </button>
                  </div>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://images.unsplash.com/... or /logo.png"
                    value={seoData.og_image_url}
                    onChange={(e) => handleChange('og_image_url', e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '0.35rem' }}>Twitter Card Format</label>
                    <select
                      className="form-control"
                      value={seoData.twitter_card}
                      onChange={(e) => handleChange('twitter_card', e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    >
                      <option value="summary_large_image">Large Image Card (Recommended)</option>
                      <option value="summary">Standard Summary Card</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '0.35rem' }}>Schema.org Structured Type</label>
                    <select
                      className="form-control"
                      value={seoData.schema_type}
                      onChange={(e) => handleChange('schema_type', e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    >
                      <option value="Church">Church / PlaceOfWorship</option>
                      <option value="Organization">Organization</option>
                      <option value="Article">Article (Study / Devotional)</option>
                      <option value="VideoObject">VideoObject (Sermons)</option>
                      <option value="WebPage">Standard WebPage</option>
                    </select>
                  </div>
                </div>

                {/* Robots Directives */}
                <div style={{ marginTop: '1.25rem', display: 'flex', gap: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={seoData.robots_index}
                      onChange={(e) => handleChange('robots_index', e.target.checked)}
                    />
                    <span>Allow Indexing (robots index)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={seoData.robots_follow}
                      onChange={(e) => handleChange('robots_follow', e.target.checked)}
                    />
                    <span>Follow Links (robots follow)</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="btn btn-gold"
                style={{ padding: '0.85rem 1.5rem', fontSize: '1rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {saving ? (
                  <>
                    <div style={{ width: '18px', height: '18px', border: '2px solid #0B192C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    Saving SEO &amp; Body Content...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Save &amp; Sync {currentPageObj.name} SEO &amp; Body Content Live
                  </>
                )}
              </button>
            </div>

            {/* RIGHT COLUMN: Live Previews & Head Code */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>
              
              {/* Google SERP Preview */}
              <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--bg-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Globe size={16} color="var(--gold-dark)" /> Live Google Search Result Preview
                  </h4>
                  
                  <div style={{ display: 'flex', gap: '0.25rem', background: '#F1F5F9', padding: '0.2rem', borderRadius: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setSerpDevice('desktop')}
                      style={{
                        border: 'none',
                        background: serpDevice === 'desktop' ? '#FFFFFF' : 'transparent',
                        color: serpDevice === 'desktop' ? '#0F172A' : '#64748B',
                        fontWeight: 600,
                        padding: '0.2rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem'
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
                        padding: '0.2rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}
                    >
                      <Smartphone size={12} /> Mobile
                    </button>
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontFamily: 'arial, sans-serif' }}>
                  <div style={{ fontSize: '0.8rem', color: '#202124', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#0B192C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontSize: '0.6rem', fontWeight: 'bold' }}>
                      C
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#202124' }}>Compassionate Love of Calvary</span>
                    <span style={{ color: '#5f6368', fontSize: '0.72rem' }}>https://www.clm.org.in{currentPageObj.path}</span>
                  </div>

                  <h5 style={{ color: '#1a0dab', fontSize: serpDevice === 'mobile' ? '1rem' : '1.15rem', fontWeight: 400, margin: '0.2rem 0', lineHeight: 1.3 }}>
                    {seoData.meta_title || `${currentPageObj.name} | Calvary Ministries`}
                  </h5>

                  <p style={{ color: '#4d5156', fontSize: '0.82rem', lineHeight: 1.4, margin: 0 }}>
                    {seoData.meta_description || 'Please provide a meta description to see how your page will appear on Google search results.'}
                  </p>
                </div>
              </div>

              {/* Rendered Body Preview */}
              {seoData.body_content && (
                <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--bg-dark)', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.75rem' }}>
                    <Eye size={15} color="var(--gold-dark)" /> Live Body HTML Render Preview
                  </div>

                  {seoData.h1_heading && (
                    <h2 style={{ fontSize: '1.3rem', color: '#0B192C', margin: '0 0 0.75rem 0', fontFamily: 'var(--font-heading)' }}>
                      {seoData.h1_heading}
                    </h2>
                  )}

                  <div 
                    style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#334155', maxHeight: '240px', overflowY: 'auto' }}
                    dangerouslySetInnerHTML={{ __html: seoData.body_content }}
                  />
                </div>
              )}

              {/* Schema JSON-LD Structured Data Inspector */}
              <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Code size={15} color="var(--gold-dark)" /> Schema.org JSON-LD Structured Data
                  </h4>

                  <button
                    type="button"
                    onClick={handleCopySchema}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  >
                    {copiedSchema ? <Check size={12} color="#15803D" /> : <Copy size={12} />}
                    {copiedSchema ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <pre style={{
                  margin: 0,
                  padding: '0.75rem',
                  background: '#0F172A',
                  color: '#38BDF8',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  lineHeight: 1.4
                }}>
                  {JSON.stringify(generatedSchema, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* WordPress Import Modal */}
      {isWpModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 5500, padding: '1rem' }}>
          <div className="modal-content" style={{ maxWidth: '640px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileCode size={22} color="var(--gold-dark)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0F172A' }}>
                  Paste WordPress / Raw Content for {currentPageObj.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWpModalOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1rem 0' }}>
              Paste raw content from WordPress Gutenberg blocks, Classic editor HTML, Microsoft Word, or Markdown. The engine will sanitize and convert it to clean semantic HTML for {currentPageObj.name}.
            </p>

            <textarea
              rows="10"
              placeholder="<!-- wp:paragraph --> Paste WordPress text or HTML here... <!-- /wp:paragraph -->"
              value={wpRawText}
              onChange={(e) => setWpRawText(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                marginBottom: '1.25rem'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setIsWpModalOpen(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!wpRawText.trim()}
                onClick={handleConvertWpImport}
                className="btn btn-gold"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Sparkles size={16} /> Convert &amp; Append into Body
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Inserter Modal */}
      {isLinkModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 5500, padding: '1rem' }}>
          <div className="modal-content" style={{ maxWidth: '440px', padding: '1.75rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <LinkIcon size={18} color="var(--gold-dark)" /> Insert Hyperlink
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                  Link Text (Anchor)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Learn more about Calvary Ministries"
                  value={linkData.text}
                  onChange={(e) => setLinkData(prev => ({ ...prev, text: e.target.value }))}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                  Target URL *
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={linkData.url}
                  onChange={(e) => setLinkData(prev => ({ ...prev, url: e.target.value }))}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={linkData.target === '_blank'}
                    onChange={(e) => setLinkData(prev => ({ ...prev, target: e.target.checked ? '_blank' : '' }))}
                  />
                  <span>Open in new tab (target="_blank")</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={linkData.nofollow}
                    onChange={(e) => setLinkData(prev => ({ ...prev, nofollow: e.target.checked }))}
                  />
                  <span>Add rel="nofollow"</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!linkData.url || linkData.url === 'https://'}
                onClick={handleInsertLink}
                className="btn btn-gold"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectImage={handleMediaPickerSelect}
        allowBodyInsert={mediaPickerTarget === 'body'}
        onInsertIntoBody={(htmlSnippet) => {
          insertAtCursor(htmlSnippet, '');
        }}
      />
    </div>
  );
};

const toolbarBtnStyle = {
  padding: '0.25rem 0.5rem',
  fontSize: '0.78rem',
  fontWeight: 700,
  borderRadius: '4px',
  border: '1px solid #CBD5E1',
  background: '#FFFFFF',
  color: '#334155',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '26px',
  height: '26px'
};

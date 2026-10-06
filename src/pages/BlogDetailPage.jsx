import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, getMediaUrl } from '../services/api';
import { ROUTES } from '../routes/routes';
import { 
  Globe, Calendar, Clock, User, Share2, 
  ArrowLeft, ArrowRight, BookOpen, Check, 
  Copy, MessageCircle, Loader2, Sparkles, Heart, Eye
} from 'lucide-react';

export const BlogDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);

    api.getBlogPostBySlug(slug)
      .then(data => {
        setPost(data.post);
        setRelatedPosts(data.related_posts || []);
        
        // ============================================================
        // DYNAMIC CLIENT-SIDE SEO & STRUCTURED DATA INJECTION
        // ============================================================
        const pageTitle = data.post.meta_title || `${data.post.title} | Compassionate Love of Calvary Ministries`;
        const pageDesc = data.post.meta_description || data.post.excerpt || 'Read inspirational Christian teachings and biblical wisdom from Compassionate Love of Calvary Ministries.';
        const pageUrl = data.post.canonical_url || window.location.href;
        const pageImg = data.post.og_image_url || getMediaUrl(data.post.effective_image_url || data.post.featured_image_url);

        document.title = pageTitle;

        // Meta Description
        let metaDescEl = document.querySelector('meta[name="description"]');
        if (!metaDescEl) {
          metaDescEl = document.createElement('meta');
          metaDescEl.name = 'description';
          document.head.appendChild(metaDescEl);
        }
        metaDescEl.content = pageDesc;

        // Canonical URL Tag
        let canonicalEl = document.querySelector('link[rel="canonical"]');
        if (!canonicalEl) {
          canonicalEl = document.createElement('link');
          canonicalEl.setAttribute('rel', 'canonical');
          document.head.appendChild(canonicalEl);
        }
        canonicalEl.setAttribute('href', pageUrl);

        // OpenGraph Meta Tags
        const setMetaTag = (property, content) => {
          let el = document.querySelector(`meta[property="${property}"]`);
          if (!el) {
            el = document.createElement('meta');
            el.setAttribute('property', property);
            document.head.appendChild(el);
          }
          el.content = content;
        };

        setMetaTag('og:title', data.post.og_title || pageTitle);
        setMetaTag('og:description', data.post.og_description || pageDesc);
        setMetaTag('og:url', pageUrl);
        setMetaTag('og:type', 'article');
        if (pageImg) setMetaTag('og:image', pageImg);

        // JSON-LD Structured Data for Google Search Indexing
        let scriptEl = document.getElementById('clm-blog-structured-data');
        if (!scriptEl) {
          scriptEl = document.createElement('script');
          scriptEl.id = 'clm-blog-structured-data';
          scriptEl.type = 'application/ld+json';
          document.head.appendChild(scriptEl);
        }

        const schemaData = {
          "@context": "https://schema.org",
          "@type": data.post.schema_type || "BlogPosting",
          "headline": data.post.title,
          "description": pageDesc,
          "image": pageImg || "https://compassionateloveofcalvary.org/logo.png",
          "author": {
            "@type": "Person",
            "name": data.post.author || "Pastor David Raj"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Compassionate Love of Calvary Ministries",
            "logo": {
              "@type": "ImageObject",
              "url": "https://compassionateloveofcalvary.org/logo.png"
            }
          },
          "datePublished": data.post.published_at || data.post.created_at,
          "dateModified": data.post.updated_at || data.post.created_at,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": pageUrl
          }
        };

        scriptEl.textContent = JSON.stringify(schemaData);
      })
      .catch(err => {
        setError(err.message || 'Could not load article');
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      // Clean up dynamic structured script on unmount
      const scriptEl = document.getElementById('clm-blog-structured-data');
      if (scriptEl) scriptEl.remove();
    };
  }, [slug]);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareTitle = post ? encodeURIComponent(post.title) : '';
  const currentUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--gold-primary)', marginBottom: '1rem' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Loading article...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center', maxWidth: '600px' }}>
        <Globe size={48} style={{ color: '#CBD5E1', margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.8rem', color: '#0F172A', marginBottom: '0.5rem' }}>Article Not Found</h2>
        <p style={{ color: '#64748B', marginBottom: '2rem' }}>
          The article you are looking for may have been moved or unpublished.
        </p>
        <Link to="/blog" className="btn btn-gold">
          <ArrowLeft size={16} /> Back to All Articles
        </Link>
      </div>
    );
  }

  const postImage = getMediaUrl(post.effective_image_url || post.featured_image_url);

  return (
    <div className="blog-detail-wrapper" style={{ background: '#F8FAFC', paddingBottom: '5rem' }}>
      
      {/* Article Header & Breadcrumbs */}
      <header style={{
        background: 'linear-gradient(135deg, #0B192C 0%, #152C48 100%)',
        color: '#FFFFFF',
        padding: '3.5rem 0 3rem 0',
        borderBottom: '2px solid var(--gold-primary)'
      }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--gold-light)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <Link to={ROUTES.HOME} style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
            <span>&rsaquo;</span>
            <Link to="/blog" style={{ color: 'inherit', textDecoration: 'none' }}>Blog</Link>
            <span>&rsaquo;</span>
            <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{post.category}</span>
          </div>

          <span style={{
            display: 'inline-block',
            background: 'rgba(212, 175, 55, 0.2)',
            color: 'var(--gold-primary)',
            padding: '0.3rem 0.8rem',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            marginBottom: '1rem'
          }}>
            {post.category}
          </span>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
            fontFamily: 'var(--font-heading)',
            color: '#FFFFFF',
            margin: '0 0 1.25rem 0',
            lineHeight: 1.25
          }}>
            {post.title}
          </h1>

          {/* Metadata Strip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            color: 'var(--text-light-muted)',
            fontSize: '0.86rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <User size={15} color="var(--gold-primary)" />
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{post.author}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Calendar size={15} />
              <span>{new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Clock size={15} />
              <span>{post.read_time}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Eye size={15} />
              <span>{post.views_count || 1} readers</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Article Container */}
      <main className="container" style={{ maxWidth: '860px', marginTop: '-2rem', position: 'relative', zIndex: 3 }}>
        <article style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: 'clamp(1.5rem, 4vw, 3rem)',
          boxShadow: '0 10px 35px rgba(0,0,0,0.06)',
          border: '1px solid #E2E8F0'
        }}>
          
          {/* Featured Hero Image */}
          {postImage && (
            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '2.5rem',
              maxHeight: '440px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
            }}>
              <img
                src={postImage}
                alt={post.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}

          {/* Excerpt Blockquote */}
          {post.excerpt && (
            <div style={{
              background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
              borderLeft: '4px solid var(--gold-primary)',
              padding: '1.25rem 1.5rem',
              borderRadius: '0 10px 10px 0',
              fontStyle: 'italic',
              fontSize: '1.1rem',
              color: '#334155',
              lineHeight: 1.7,
              marginBottom: '2.5rem'
            }}>
              "{post.excerpt}"
            </div>
          )}

          {/* Article Body Content */}
          {post.content && (post.content.includes('<p>') || post.content.includes('<h2>') || post.content.includes('<h3>') || post.content.includes('<figure>') || post.content.includes('<div>')) ? (
            <div 
              className="article-body-content" 
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.85,
                color: '#1E293B'
              }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <div className="article-body-content" style={{
              fontSize: '1.05rem',
              lineHeight: 1.85,
              color: '#1E293B',
              whiteSpace: 'pre-line'
            }}>
              {post.content}
            </div>
          )}

          {/* Tags */}
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Tag size={15} style={{ color: 'var(--gold-dark)', marginRight: '0.25rem' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Tags:</span>
              {post.tags.map(tag => (
                <Link
                  key={tag}
                  to={`/blog?search=${encodeURIComponent(tag)}`}
                  style={{
                    background: '#F1F5F9',
                    color: '#0369A1',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '20px',
                    textDecoration: 'none',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Social Share Bar */}
          <div style={{
            marginTop: '2rem',
            padding: '1.25rem',
            background: '#F8FAFC',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>
              <Share2 size={16} color="var(--gold-dark)" /> Share this article &amp; bless others:
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${shareTitle}%20${currentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#25D366',
                  color: '#FFFFFF',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <MessageCircle size={15} /> WhatsApp
              </a>

              {/* Twitter / X */}
              <a
                href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${currentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#000000',
                  color: '#FFFFFF',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> X (Twitter)
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#1877F2',
                  color: '#FFFFFF',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Facebook
              </a>

              {/* Copy Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  background: '#0B192C',
                  color: '#D4AF37',
                  border: 'none',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
              </button>
            </div>
          </div>
        </article>

        {/* Author Bio Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.75rem',
          marginTop: '2rem',
          border: '1px solid #E2E8F0',
          display: 'flex',
          gap: '1.25rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0B192C, #1A365D)',
            color: 'var(--gold-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            border: '2px solid var(--gold-primary)',
            flexShrink: 0
          }}>
            {post.author ? post.author.charAt(0) : 'P'}
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--gold-dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Written by
            </span>
            <h4 style={{ margin: '0 0 0.35rem 0', color: '#0B192C', fontSize: '1.15rem' }}>
              {post.author}
            </h4>
            <p style={{ margin: 0, color: '#64748B', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Proclaiming the transforming love of Christ, discipling believers in biblical truth, and serving our community with humility and compassion.
            </p>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div style={{ marginTop: '3.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', color: '#0B192C', marginBottom: '1.5rem' }}>
              Related Articles in {post.category}
            </h3>

            <div className="grid-3" style={{ gap: '1.5rem' }}>
              {relatedPosts.map(rel => {
                const rImg = getMediaUrl(rel.effective_image_url || rel.featured_image_url);
                return (
                  <Link
                    key={rel.id}
                    to={`/blog/${rel.slug}`}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid #E2E8F0',
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ height: '140px', background: '#0B192C' }}>
                      {rImg ? (
                        <img src={rImg} alt={rel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B' }}>
                          <BookOpen size={24} />
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '1.15rem', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <h4 style={{ fontSize: '1.05rem', color: '#0B192C', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)', lineHeight: 1.3 }}>
                        {rel.title}
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--gold-dark)', fontWeight: 700 }}>
                        Read Article &rarr;
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <Link to="/blog" className="btn btn-navy" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={16} /> Back to All Articles
          </Link>
        </div>
      </main>
    </div>
  );
};

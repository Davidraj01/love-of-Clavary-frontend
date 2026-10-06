import React, { useEffect, useState } from 'react';
import { api, getMediaUrl } from '../services/api';
import { BookOpen, Sparkles, Share2 } from 'lucide-react';

/**
 * PageSEOSection Component
 * 1. Dynamically syncs document <head> (meta_title, meta_description, canonical, robots, OG tags, Schema.org JSON-LD).
 * 2. Dynamically renders the H1 heading, featured image, and rich HTML body_content saved from Admin Page SEO Suite.
 */
export const PageSEOSection = ({ pageIdentifier, defaultTitle = '', defaultDesc = '', className = '' }) => {
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pageIdentifier) return;
    let isMounted = true;

    const fetchSEO = async () => {
      try {
        setLoading(true);
        const data = await api.getPageSEO(pageIdentifier);
        if (isMounted && data) {
          setSeoData(data);

          // ==========================================================
          // 1. DYNAMIC HEAD & META TAGS INJECTION
          // ==========================================================
          const pageTitle = data.meta_title || defaultTitle || `${pageIdentifier.charAt(0).toUpperCase() + pageIdentifier.slice(1)} | Compassionate Love of Calvary Ministries`;
          const pageDescription = data.meta_description || defaultDesc || "Compassionate Love of Calvary Ministries - Rooted in prayer, anchored in Biblical truth, and sharing the boundless love of Christ.";
          const canonicalUrl = data.canonical_url || `https://www.clm.org.in${pageIdentifier === 'home' ? '' : '/' + pageIdentifier}`;
          const ogImg = data.og_image_url || data.featured_image_url || 'https://www.clm.org.in/logo.png';

          // Update Document Title
          document.title = pageTitle;

          // Helper: Set or create meta tag by name
          const setMetaByName = (name, content) => {
            if (!content) return;
            let el = document.querySelector(`meta[name="${name}"]`);
            if (!el) {
              el = document.createElement('meta');
              el.setAttribute('name', name);
              document.head.appendChild(el);
            }
            el.setAttribute('content', content);
          };

          // Helper: Set or create meta tag by property
          const setMetaByProperty = (property, content) => {
            if (!content) return;
            let el = document.querySelector(`meta[property="${property}"]`);
            if (!el) {
              el = document.createElement('meta');
              el.setAttribute('property', property);
              document.head.appendChild(el);
            }
            el.setAttribute('content', content);
          };

          // Meta Description & Keywords
          setMetaByName('description', pageDescription);
          if (data.meta_keywords) {
            setMetaByName('keywords', data.meta_keywords);
          }

          // Canonical URL Link
          let canonicalEl = document.querySelector('link[rel="canonical"]');
          if (!canonicalEl) {
            canonicalEl = document.createElement('link');
            canonicalEl.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalEl);
          }
          canonicalEl.setAttribute('href', canonicalUrl);

          // Robots directives
          const robotsIndex = data.robots_index !== false ? 'index' : 'noindex';
          const robotsFollow = data.robots_follow !== false ? 'follow' : 'nofollow';
          setMetaByName('robots', `${robotsIndex}, ${robotsFollow}`);

          // OpenGraph Tags
          setMetaByProperty('og:title', data.og_title || pageTitle);
          setMetaByProperty('og:description', data.og_description || pageDescription);
          setMetaByProperty('og:url', canonicalUrl);
          setMetaByProperty('og:type', 'website');
          setMetaByProperty('og:site_name', 'Compassionate Love of Calvary Ministries');
          if (ogImg) {
            setMetaByProperty('og:image', getMediaUrl(ogImg));
          }

          // Twitter Card Tags
          setMetaByName('twitter:card', data.twitter_card || 'summary_large_image');
          setMetaByName('twitter:title', data.og_title || pageTitle);
          setMetaByName('twitter:description', data.og_description || pageDescription);
          if (ogImg) {
            setMetaByName('twitter:image', getMediaUrl(ogImg));
          }

          // Schema.org JSON-LD Structured Data
          const scriptId = `clm-schema-${pageIdentifier}`;
          let scriptEl = document.getElementById(scriptId);
          if (!scriptEl) {
            scriptEl = document.createElement('script');
            scriptEl.id = scriptId;
            scriptEl.type = 'application/ld+json';
            document.head.appendChild(scriptEl);
          }

          const schemaObject = {
            "@context": "https://schema.org",
            "@type": data.schema_type || "Church",
            "name": "Compassionate Love of Calvary Ministries",
            "headline": pageTitle,
            "description": pageDescription,
            "url": canonicalUrl,
            "logo": "https://www.clm.org.in/logo.png",
            "image": getMediaUrl(ogImg),
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "81/5, 6th Street, Shanthi Nagar",
              "addressLocality": "Chengalpattu",
              "addressRegion": "Tamil Nadu",
              "postalCode": "603003",
              "addressCountry": "IN"
            }
          };

          scriptEl.textContent = JSON.stringify(schemaObject);
        }
      } catch (err) {
        console.warn(`Could not load page SEO for ${pageIdentifier}:`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSEO();

    return () => {
      isMounted = false;
      const scriptEl = document.getElementById(`clm-schema-${pageIdentifier}`);
      if (scriptEl) scriptEl.remove();
    };
  }, [pageIdentifier, defaultTitle, defaultDesc]);

  // If no body content and no H1 heading configured, only head tags were injected
  if (!seoData || (!seoData.body_content && !seoData.h1_heading)) {
    return null;
  }

  const featuredImg = getMediaUrl(seoData.featured_image_url);

  return (
    <section className={`section page-seo-article-section ${className}`} id={`seo-content-${pageIdentifier}`}>
      <div className="container" style={{ maxWidth: '980px' }}>
        <article className="page-seo-article-card">
          
          {/* Header & H1 Heading */}
          {seoData.h1_heading && (
            <div className="page-seo-header">
              <span className="section-badge">
                <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Ministry &amp; Biblical Insights
              </span>
              <h1 className="page-seo-h1">
                {seoData.h1_heading}
              </h1>
            </div>
          )}

          {/* Featured Image */}
          {featuredImg && (
            <div className="page-seo-featured-wrap">
              <img 
                src={featuredImg} 
                alt={seoData.h1_heading || 'Calvary Ministries'} 
                className="page-seo-featured-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Rich Body Content (Render HTML with sanitization/styling) */}
          {seoData.body_content && (
            <div 
              className="page-seo-rich-body"
              dangerouslySetInnerHTML={{ __html: seoData.body_content }}
            />
          )}

          {/* Footer Badge / Attribution */}
          <div className="page-seo-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <BookOpen size={16} color="var(--gold-primary)" />
              <span>Compassionate Love of Calvary Ministries &bull; Chengalpattu, Tamil Nadu</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

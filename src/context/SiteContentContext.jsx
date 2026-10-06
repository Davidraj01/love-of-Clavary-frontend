import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { ensureGoogleFontsLoaded } from '../components/FontTypographyControls';

const SiteContentContext = createContext(null);

export const SiteContentProvider = ({ children }) => {
  const [siteData, setSiteData] = useState(null);
  const [aboutData, setAboutData] = useState(null);
  const [bibleData, setBibleData] = useState(null);
  const [ministriesData, setMinistriesData] = useState(null);
  const [studyData, setStudyData] = useState(null);
  const [devotionalData, setDevotionalData] = useState(null);
  const [sermonsData, setSermonsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Apply typography variables to document root for instant responsive preview & site-wide font styling
  const applyTypographyTokens = (content) => {
    if (!content || typeof document === 'undefined') return;
    const root = document.documentElement;

    if (content.heading_font) {
      root.style.setProperty('--font-heading', `'${content.heading_font}', 'Playfair Display', serif`);
    }
    if (content.body_font) {
      root.style.setProperty('--font-body', `'${content.body_font}', system-ui, sans-serif`);
    }
    if (content.accent_color) {
      root.style.setProperty('--gold-primary', content.accent_color);
      root.style.setProperty('--text-gold', content.accent_color);
    }
    if (content.font_weight) {
      root.style.setProperty('--heading-weight', content.font_weight);
    }
    if (content.line_height) {
      root.style.setProperty('--body-line-height', content.line_height);
    }

    ensureGoogleFontsLoaded([content.heading_font, content.body_font]);
  };

  const fetchAllContent = useCallback(async () => {
    try {
      setLoading(true);
      const [homeRes, aboutRes, bibleRes, minRes, studyRes, devoRes, sermRes] = await Promise.allSettled([
        api.getHomeContent(),
        api.getAboutContent(),
        api.getBibleResources(),
        api.getMinistriesPageContent(),
        api.getStudyPageContent(),
        api.getDevotionalPageContent(),
        api.getSermonsPageContent(),
      ]);

      if (homeRes.status === 'fulfilled' && homeRes.value) {
        setSiteData(homeRes.value);
        applyTypographyTokens(homeRes.value.content);
      }

      if (aboutRes.status === 'fulfilled' && aboutRes.value) {
        setAboutData(aboutRes.value);
      }

      if (bibleRes.status === 'fulfilled' && bibleRes.value) {
        setBibleData(bibleRes.value);
      }

      if (minRes.status === 'fulfilled' && minRes.value) {
        setMinistriesData(minRes.value);
      }

      if (studyRes.status === 'fulfilled' && studyRes.value) {
        setStudyData(studyRes.value);
      }

      if (devoRes.status === 'fulfilled' && devoRes.value) {
        setDevotionalData(devoRes.value);
      }

      if (sermRes.status === 'fulfilled' && sermRes.value) {
        setSermonsData(sermRes.value);
      }

      setError(null);
    } catch (err) {
      console.error('Failed to load site content:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllContent();
  }, [fetchAllContent]);

  return (
    <SiteContentContext.Provider
      value={{
        siteData,
        content: siteData?.content || {},
        aboutData,
        bibleData,
        ministriesData,
        studyData,
        devotionalData,
        sermonsData,
        featuredMinistries: siteData?.featured_ministries || [],
        upcomingEvents: siteData?.upcoming_events || [],
        latestSermon: siteData?.latest_sermon || null,
        recentDevotional: siteData?.recent_devotional || null,
        testimonials: siteData?.testimonials || [],
        loading,
        error,
        refreshContent: fetchAllContent,
        applyTypographyTokens,
      }}
    >
      {children}
    </SiteContentContext.Provider>
  );
};


export const useSiteContent = () => useContext(SiteContentContext);

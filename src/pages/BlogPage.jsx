import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, getMediaUrl } from '../services/api';
import { extractCleanSnippet } from '../utils/wpToHtmlConverter';
import { 
  Globe, Search, Calendar, User, Clock, 
  ArrowRight, Sparkles, BookOpen, Heart, 
  Share2, Tag, Loader2, Filter 
} from 'lucide-react';
import { PageSEOSection } from '../components/PageSEOSection';

const CATEGORIES = [
  'All',
  'Spiritual Growth',
  'Faith & Prayer',
  'Biblical Teaching',
  'Gospel & Outreach',
  'Christian Living',
  'Ministry Updates',
  'Testimonies',
];

export const BlogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [categories, setCategories] = useState(CATEGORIES);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [loading, setLoading] = useState(true);

  const fetchBlogPosts = async () => {
    setLoading(true);
    try {
      const data = await api.getBlogPosts({
        search: searchQuery,
        category: activeCategory,
      });
      setPosts(data.posts || []);
      if (data.featured_post && activeCategory === 'All' && !searchQuery) {
        setFeaturedPost(data.featured_post);
      } else {
        setFeaturedPost(null);
      }
    } catch (err) {
      console.error('Failed to load blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, [activeCategory, searchQuery]);

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchParams.set('search', searchQuery.trim());
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="blog-page-wrapper">
      {/* Hero Section */}
      <section className="page-header-section" style={{
        background: 'linear-gradient(135deg, #0B192C 0%, #152C48 60%, #0B192C 100%)',
        color: '#FFFFFF',
        padding: '5rem 0 3.5rem 0',
        textAlign: 'center',
        position: 'relative',
        borderBottom: '2px solid var(--gold-primary)'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'rgba(212, 175, 55, 0.15)',
            padding: '0.35rem 0.85rem',
            borderRadius: '30px',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            marginBottom: '1rem'
          }}>
            <Globe size={15} style={{ color: 'var(--gold-primary)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--gold-light)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Ministry Articles &amp; Insights
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            fontFamily: 'var(--font-heading)',
            color: '#FFFFFF',
            margin: '0 0 1rem 0',
            lineHeight: 1.2
          }}>
            Calvary Grace &amp; Truth Blog
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
            color: 'var(--text-light-muted)',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.7
          }}>
            Biblical teachings, pastoral reflections, and spiritual nourishment to strengthen your faith and encourage your daily Christian walk.
          </p>

          {/* Search Bar */}
          <div style={{ maxWidth: '580px', margin: '2rem auto 0 auto' }}>
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold-primary)' }} />
              <input
                type="text"
                placeholder="Search articles by topic, scripture, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem 0.9rem 3rem',
                  borderRadius: '30px',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  background: 'rgba(11, 25, 44, 0.85)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  fontSize: '0.95rem'
                }}
              />
            </form>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="section" style={{ background: '#F8FAFC', padding: '3.5rem 0 5rem 0' }}>
        <div className="container">
          
          {/* Category Filter Pills */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '1.25rem',
            marginBottom: '2.5rem',
            scrollbarWidth: 'none',
            justifyContent: 'flex-start',
            flexWrap: 'wrap'
          }}>
            {categories.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  style={{
                    padding: '0.55rem 1.15rem',
                    borderRadius: '25px',
                    border: active ? '1px solid var(--gold-primary)' : '1px solid #CBD5E1',
                    background: active ? '#0B192C' : '#FFFFFF',
                    color: active ? '#D4AF37' : '#475569',
                    fontWeight: active ? 700 : 600,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 4px 12px rgba(11, 25, 44, 0.15)' : 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Featured Article Banner (if available and viewing all) */}
          {featuredPost && (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              border: '1px solid #E2E8F0',
              marginBottom: '3rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'center'
            }}>
              <div style={{ position: 'relative', height: '100%', minHeight: '300px' }}>
                <img
                  src={getMediaUrl(featuredPost.effective_image_url || featuredPost.featured_image_url)}
                  alt={featuredPost.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{
                  position: 'absolute',
                  top: '1.25rem',
                  left: '1.25rem',
                  background: 'var(--gold-primary)',
                  color: '#0B192C',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Featured Article
                </span>
              </div>

              <div style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.84rem', color: '#64748B', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--gold-dark)', fontWeight: 700 }}>{featuredPost.category}</span>
                  <span>&bull;</span>
                  <span><Clock size={13} style={{ display: 'inline', marginRight: '3px' }} />{featuredPost.read_time}</span>
                </div>

                <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 1.9rem)', fontFamily: 'var(--font-heading)', color: '#0B192C', margin: '0 0 1rem 0', lineHeight: 1.3 }}>
                  <Link to={`/blog/${featuredPost.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {featuredPost.title}
                  </Link>
                </h2>

                <p style={{ color: '#475569', fontSize: '0.98rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  {extractCleanSnippet(featuredPost.excerpt || featuredPost.content, 180)}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem', color: '#334155' }}>
                    <User size={15} color="var(--gold-dark)" />
                    <span>By <strong>{featuredPost.author}</strong></span>
                  </div>

                  <Link to={`/blog/${featuredPost.slug}`} className="btn btn-gold btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    Read Article <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Posts Grid */}
          {loading ? (
            <div style={{ padding: '5rem 0', textAlign: 'center', color: '#64748B' }}>
              <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: 'var(--gold-primary)' }} />
              <p style={{ margin: 0, fontSize: '1rem' }}>Loading ministry articles...</p>
            </div>
          ) : posts.length === 0 ? (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '4rem 2rem',
              textAlign: 'center',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
            }}>
              <Globe size={48} style={{ color: '#CBD5E1', margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.35rem', color: '#0F172A', marginBottom: '0.5rem' }}>
                No Articles Found
              </h3>
              <p style={{ color: '#64748B', maxWidth: '420px', margin: '0 auto 1.5rem auto', fontSize: '0.92rem' }}>
                We couldn't find any articles matching your search query or selected category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                  setSearchParams({});
                }}
                className="btn btn-navy btn-sm"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid-3" style={{ gap: '2rem' }}>
              {posts.map((post) => {
                const imgUrl = getMediaUrl(post.effective_image_url || post.featured_image_url);
                return (
                  <article key={post.id} style={{
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.25s ease'
                  }}>
                    {/* Thumbnail Image */}
                    <div style={{ position: 'relative', height: '210px', background: '#0B192C' }}>
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={post.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                          <BookOpen size={32} />
                        </div>
                      )}
                      <span style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        background: 'rgba(11, 25, 44, 0.85)',
                        backdropFilter: 'blur(6px)',
                        color: 'var(--gold-primary)',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '20px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        border: '1px solid rgba(212, 175, 55, 0.3)'
                      }}>
                        {post.category}
                      </span>
                    </div>

                    {/* Post Content Details */}
                    <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#64748B', marginBottom: '0.65rem' }}>
                          <Clock size={12} />
                          <span>{post.read_time}</span>
                          <span>&bull;</span>
                          <span>{new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>

                        <h3 style={{
                          fontSize: '1.22rem',
                          fontFamily: 'var(--font-heading)',
                          color: '#0B192C',
                          margin: '0 0 0.65rem 0',
                          lineHeight: 1.35
                        }}>
                          <Link to={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {post.title}
                          </Link>
                        </h3>

                        <p style={{
                          color: '#64748B',
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {extractCleanSnippet(post.excerpt || post.content, 140)}
                        </p>
                      </div>

                      <div style={{
                        marginTop: '1.25rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #F1F5F9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                          By {post.author}
                        </span>

                        <Link
                          to={`/blog/${post.slug}`}
                          style={{
                            color: 'var(--gold-dark)',
                            fontWeight: 700,
                            fontSize: '0.86rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            textDecoration: 'none'
                          }}
                        >
                          Read &rarr;
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Dynamic SEO Body & Content Article Section */}
      <PageSEOSection 
        pageIdentifier="blog" 
        defaultTitle="Christian Articles & Spiritual Growth Blog | Calvary Ministries" 
        defaultDesc="Explore insightful Christian articles, biblical wisdom, testimonies, and faith teachings from Compassionate Love of Calvary Ministries."
      />
    </div>
  );
};

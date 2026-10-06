import React, { useState, useEffect } from 'react';
import { api, getMediaUrl } from '../services/api';
import { 
  Image as ImageIcon, Upload, Search, Filter, Check, X, 
  Folder, FolderOpen, Loader2, Sparkles, ExternalLink, Globe, Plus
} from 'lucide-react';

const PRESET_GALLERY_IMAGES = [
  {
    title: 'Sacred Bible & Communion Cross',
    category: 'gallery',
    folder: 'Worship',
    url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80',
    alt: 'Holy Bible and Christian Cross on wooden altar'
  },
  {
    title: 'Church Worship Fellowship Hands',
    category: 'ministry',
    folder: 'Fellowship',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    alt: 'Congregation worship and praise hands lifted'
  },
  {
    title: 'Prayer Altar Candle & Scripture',
    category: 'gallery',
    folder: 'Prayer',
    url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80',
    alt: 'Candlelight prayer altar with open scriptures'
  },
  {
    title: 'Youth & Children Ministry Joy',
    category: 'ministry',
    folder: 'Youth',
    url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    alt: 'Children smile ministry outreach and learning'
  },
  {
    title: 'Community Compassion Outreach Food Drive',
    category: 'outreach',
    folder: 'Outreach',
    url: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80',
    alt: 'Helping hands community outreach and charity'
  },
  {
    title: 'Calvary Cross Sunset Horizon',
    category: 'hero',
    folder: 'General',
    url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80',
    alt: 'Cross at sunset landscape symbolizing Calvary redemption'
  }
];

export const MediaPickerModal = ({
  isOpen,
  onClose,
  onSelectImage,
  title = "Select Image from Media Gallery",
  allowBodyInsert = false,
  onInsertIntoBody = null
}) => {
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery', 'upload', 'presets', 'url'
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All');
  
  // Selection details
  const [selectedImgUrl, setSelectedImgUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [alignment, setAlignment] = useState('center'); // 'center', 'left', 'right', 'full'

  // Upload Form State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFolder, setUploadFolder] = useState('General');
  const [uploadCategory, setUploadCategory] = useState('gallery');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // External URL input
  const [externalUrl, setExternalUrl] = useState('');

  const fetchGalleryImages = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminImages();
      setImages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load media images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchGalleryImages();
      setSelectedImgUrl('');
      setAltText('');
      setCaption('');
      setUploadError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Compute folder list
  const folders = ['All', ...new Set(images.map(img => img.folder || 'General').filter(Boolean))];

  // Filter gallery
  const filteredGallery = images.filter(img => {
    const titleMatch = (img.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const altMatch = (img.alt_text || '').toLowerCase().includes(searchQuery.toLowerCase());
    const folderMatch = selectedFolder === 'All' || (img.folder || 'General') === selectedFolder;
    return (titleMatch || altMatch) && folderMatch;
  });

  const handleSelectGalleryItem = (img) => {
    const rawUrl = img.image_file || img.external_url || '';
    const fullUrl = getMediaUrl(rawUrl);
    setSelectedImgUrl(fullUrl);
    setAltText(img.alt_text || img.title || 'Ministry Media Photo');
  };

  const handleSelectPreset = (preset) => {
    setSelectedImgUrl(preset.url);
    setAltText(preset.alt || preset.title);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      if (!altText) {
        setAltText(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUploadNewImage = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select an image file to upload.');
      return;
    }
    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('image_file', uploadFile);
      formData.append('title', uploadTitle.trim() || 'Uploaded Image');
      formData.append('alt_text', altText.trim() || uploadTitle.trim() || 'Ministry Photo');
      formData.append('folder', uploadFolder);
      formData.append('category', uploadCategory);

      const created = await api.uploadAdminImage(formData);
      const newUrl = getMediaUrl(created.image_file || created.external_url);
      
      // Refresh list and select this newly uploaded image
      await fetchGalleryImages();
      setSelectedImgUrl(newUrl);
      setActiveTab('gallery');
    } catch (err) {
      setUploadError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmFeatured = () => {
    if (!selectedImgUrl) return;
    onSelectImage({
      url: selectedImgUrl,
      alt: altText || 'Ministry Photo'
    });
    onClose();
  };

  const handleConfirmBodyInsert = () => {
    if (!selectedImgUrl || !onInsertIntoBody) return;
    
    // Generate clean semantic HTML snippet for article body
    let styleStr = 'max-width: 100%; height: auto; border-radius: 8px; margin: 1.25rem 0;';
    if (alignment === 'left') {
      styleStr = 'max-width: 48%; float: left; margin: 0.5rem 1.25rem 1rem 0; border-radius: 8px;';
    } else if (alignment === 'right') {
      styleStr = 'max-width: 48%; float: right; margin: 0.5rem 0 1rem 1.25rem; border-radius: 8px;';
    } else if (alignment === 'center') {
      styleStr = 'display: block; margin: 1.5rem auto; max-width: 100%; border-radius: 8px;';
    }

    const captionHtml = caption.trim() 
      ? `<figcaption style="font-size: 0.85rem; color: #64748B; text-align: center; margin-top: 0.4rem; font-style: italic;">${caption.trim()}</figcaption>`
      : '';

    const htmlSnippet = `\n<figure style="${styleStr}">\n  <img src="${selectedImgUrl}" alt="${altText.trim() || 'Ministry Photo'}" loading="lazy" style="width: 100%; height: auto; border-radius: 8px; display: block;" />${captionHtml ? '\n  ' + captionHtml : ''}\n</figure>\n`;

    onInsertIntoBody(htmlSnippet);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 6000, padding: '1rem' }}>
      <div className="modal-content" style={{ maxWidth: '960px', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', padding: 0, borderRadius: '16px', overflow: 'hidden' }}>
        
        {/* Header */}
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
            onClick={onClose}
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
            <ImageIcon size={22} color="var(--gold-primary)" />
            <div>
              <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
                {title}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--gold-light)' }}>
                Choose from file folders, upload from computer, or pick curated church media assets
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          padding: '0.5rem 1.5rem',
          flexShrink: 0
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'gallery' ? '#0B192C' : 'transparent',
              color: activeTab === 'gallery' ? '#D4AF37' : '#475569',
              fontWeight: activeTab === 'gallery' ? 700 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <FolderOpen size={15} /> 1. Media Library ({images.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'upload' ? '#0B192C' : 'transparent',
              color: activeTab === 'upload' ? '#D4AF37' : '#475569',
              fontWeight: activeTab === 'upload' ? 700 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Upload size={15} /> 2. Upload from PC/Folder
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'presets' ? '#0B192C' : 'transparent',
              color: activeTab === 'presets' ? '#D4AF37' : '#475569',
              fontWeight: activeTab === 'presets' ? 700 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Sparkles size={15} /> 3. Curated Photos
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'url' ? '#0B192C' : 'transparent',
              color: activeTab === 'url' ? '#D4AF37' : '#475569',
              fontWeight: activeTab === 'url' ? 700 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Globe size={15} /> 4. External URL
          </button>
        </div>

        {/* Modal Main Content */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          
          {/* TAB 1: MEDIA LIBRARY */}
          {activeTab === 'gallery' && (
            <div>
              {/* Search & Folder Filter Bar */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 240px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Search media files by title or alt..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Folder size={16} color="#64748B" />
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    style={{
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      background: '#FFFFFF'
                    }}
                  >
                    {folders.map(f => (
                      <option key={f} value={f}>{f === 'All' ? '📁 All Folders' : `📁 ${f}`}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                  <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 0.75rem auto', color: 'var(--gold-primary)' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>Loading media library files...</p>
                </div>
              ) : filteredGallery.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1' }}>
                  <ImageIcon size={36} color="#94A3B8" style={{ margin: '0 auto 0.5rem auto' }} />
                  <p style={{ margin: '0 0 0.75rem 0', color: '#64748B', fontSize: '0.9rem' }}>
                    No media items found in this folder.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="btn btn-gold btn-sm"
                  >
                    <Upload size={14} /> Upload First Image
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '0.85rem',
                  maxHeight: '380px',
                  overflowY: 'auto',
                  padding: '4px'
                }}>
                  {filteredGallery.map((img) => {
                    const rawUrl = img.image_file || img.external_url || '';
                    const fullUrl = getMediaUrl(rawUrl);
                    const isSelected = selectedImgUrl === fullUrl;

                    return (
                      <div
                        key={img.id}
                        onClick={() => handleSelectGalleryItem(img)}
                        style={{
                          borderRadius: '8px',
                          border: isSelected ? '3px solid var(--gold-primary)' : '1px solid #E2E8F0',
                          background: '#FFFFFF',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 0 0 2px rgba(212,175,55,0.4)' : '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        <div style={{ width: '100%', height: '100px', background: '#F1F5F9' }}>
                          <img
                            src={fullUrl}
                            alt={img.alt_text || img.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                          />
                        </div>

                        {isSelected && (
                          <div style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: 'var(--gold-primary)',
                            color: '#0B192C',
                            borderRadius: '50%',
                            width: '22px',
                            height: '22px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}>
                            <Check size={14} strokeWidth={3} />
                          </div>
                        )}

                        <div style={{ padding: '0.4rem 0.5rem', background: '#FFFFFF' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {img.title || 'Untitled'}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                            📁 {img.folder || 'General'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD FROM PC / FOLDER */}
          {activeTab === 'upload' && (
            <form onSubmit={handleUploadNewImage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {uploadError && (
                <div style={{ padding: '0.75rem 1rem', background: '#FEE2E2', color: '#B91C1C', borderRadius: '6px', fontSize: '0.85rem' }}>
                  {uploadError}
                </div>
              )}

              <div style={{
                border: '2px dashed #CBD5E1',
                borderRadius: '12px',
                padding: '1.75rem',
                textAlign: 'center',
                background: '#F8FAFC',
                cursor: 'pointer'
              }}>
                {uploadPreview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={uploadPreview} alt="Preview" style={{ maxHeight: '160px', borderRadius: '8px', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => { setUploadFile(null); setUploadPreview(''); }}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Choose Different File
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload size={36} color="var(--gold-dark)" style={{ margin: '0 auto 0.5rem auto' }} />
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#0F172A', fontSize: '1rem' }}>
                      Drag &amp; drop an image, or click to browse files
                    </h4>
                    <p style={{ margin: '0 0 1rem 0', color: '#64748B', fontSize: '0.8rem' }}>
                      Supports JPG, PNG, WEBP up to 15MB.
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                    Image Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunday Worship Blessing"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                    Target Folder
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Worship, Outreach, Youth"
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading || !uploadFile}
                className="btn btn-gold"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem' }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Uploading to Server...
                  </>
                ) : (
                  <>
                    <Upload size={16} /> Upload &amp; Select Image
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: CURATED PRESET PHOTOS */}
          {activeTab === 'presets' && (
            <div>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#64748B' }}>
                High-resolution curated photos optimized for Christian ministries, worship, and devotionals:
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '0.85rem',
                maxHeight: '380px',
                overflowY: 'auto'
              }}>
                {PRESET_GALLERY_IMAGES.map((preset, idx) => {
                  const isSelected = selectedImgUrl === preset.url;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectPreset(preset)}
                      style={{
                        borderRadius: '8px',
                        border: isSelected ? '3px solid var(--gold-primary)' : '1px solid #E2E8F0',
                        background: '#FFFFFF',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      <div style={{ width: '100%', height: '110px' }}>
                        <img src={preset.url} alt={preset.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          background: 'var(--gold-primary)',
                          color: '#0B192C',
                          borderRadius: '50%',
                          width: '22px',
                          height: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                      <div style={{ padding: '0.4rem 0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {preset.title}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                          📁 {preset.folder}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: EXTERNAL URL */}
          {activeTab === 'url' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                  Paste Direct Image URL
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or https://example.com/photo.jpg"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (externalUrl.trim()) {
                        setSelectedImgUrl(externalUrl.trim());
                      }
                    }}
                    className="btn btn-outline"
                    style={{ fontSize: '0.82rem' }}
                  >
                    Load Preview
                  </button>
                </div>
              </div>

              {selectedImgUrl && (
                <div style={{ maxWidth: '280px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                  <img src={selectedImgUrl} alt="Preview" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          )}

          {/* SELECTED IMAGE METADATA & SEO CONTROLS */}
          {selectedImgUrl && (
            <div style={{
              marginTop: '1.25rem',
              padding: '1rem 1.25rem',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <CheckCircle2 size={16} color="#059669" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#065F46' }}>
                  Selected Image: {selectedImgUrl.slice(0, 50)}...
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                    SEO Alt Tag (Image Description for Google SERP) *
                  </label>
                  <input
                    type="text"
                    placeholder="Describe this image for SEO ranking..."
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                {allowBodyInsert && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                      Body Image Caption (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Calvary Fellowship Assembly 2026"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>
                )}
              </div>

              {allowBodyInsert && (
                <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                    Body Layout Alignment:
                  </span>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {['center', 'left', 'right', 'full'].map(align => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => setAlignment(align)}
                        style={{
                          border: '1px solid #CBD5E1',
                          background: alignment === align ? '#0B192C' : '#FFFFFF',
                          color: alignment === align ? '#D4AF37' : '#475569',
                          padding: '0.25rem 0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          textTransform: 'capitalize',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #E2E8F0',
          background: '#FFFFFF',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          flexShrink: 0
        }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            style={{ fontSize: '0.88rem' }}
          >
            Cancel
          </button>

          {allowBodyInsert && onInsertIntoBody && (
            <button
              type="button"
              disabled={!selectedImgUrl}
              onClick={handleConfirmBodyInsert}
              className="btn btn-outline-gold"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.88rem' }}
            >
              <Plus size={15} /> Insert Into Article Body
            </button>
          )}

          <button
            type="button"
            disabled={!selectedImgUrl}
            onClick={handleConfirmFeatured}
            className="btn btn-gold"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.88rem' }}
          >
            <Check size={16} /> Set as Featured / OG Image
          </button>
        </div>
      </div>
    </div>
  );
};

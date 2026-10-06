import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSiteContent } from '../context/SiteContentContext';
import { BookOpen, Calendar, Clock, ArrowRight, User, CheckCircle2 } from 'lucide-react';
import { PageSEOSection } from '../components/PageSEOSection';

export const StudyPage = () => {
  const { studyData } = useSiteContent();
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStudy, setActiveStudy] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('All');

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        const data = await api.getStudies();
        setStudies(data);
      } catch (err) {
        console.error('Failed to load studies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudies();
  }, []);

  const topics = ['All', 'Grace & Redemption', 'Prayer & Spiritual Warfare', 'Hope & Perseverance', 'Faith & Discipleship', 'Christian Living'];

  const filteredStudies = studies.filter(s => 
    selectedTopic === 'All' || s.topic === selectedTopic
  );

  const headerBadge = studyData?.header_badge || "Discipleship & Exposition";
  const headerTitle = studyData?.header_title || "Bible Studies & Christian Teachings";
  const headerDesc = studyData?.header_description || "Deepen your understanding of God's living truth through verse-by-verse scriptural studies and discipleship insights.";

  return (
    <div className="study-page" style={{ paddingTop: '5.5rem' }}>
      {/* Header */}
      <section className="section section-dark" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="container container-narrow">
          <span className="section-badge">{headerBadge}</span>
          <h1 style={{ color: '#FFFFFF', marginBottom: '1rem' }}>{headerTitle}</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-light-muted)' }}>
            {headerDesc}
          </p>
        </div>
      </section>


      {/* Filter & Study Grid */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTopic(t)}
                className={`btn btn-sm ${selectedTopic === t ? 'btn-gold' : 'btn-outline-gold'}`}
              >
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading Bible Studies...</p>
          ) : (
            <div className="grid-3">
              {filteredStudies.map((study) => (
                <div key={study.id} className="devotional-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span className="section-badge" style={{ margin: 0 }}>{study.topic}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Clock size={13} style={{ display: 'inline', marginRight: '3px' }} />
                      {study.read_time}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.45rem', marginBottom: '0.75rem' }}>{study.title}</h3>
                  
                  <div style={{ fontSize: '0.85rem', color: 'var(--gold-dark)', fontWeight: 600, marginBottom: '1rem' }}>
                    <BookOpen size={14} style={{ display: 'inline', marginRight: '5px' }} />
                    {study.scripture_ref}
                  </div>

                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.7', flexGrow: 1 }}>
                    {study.summary}
                  </p>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Calendar size={13} style={{ display: 'inline', marginRight: '3px' }} />
                      {study.study_date}
                    </span>
                    <button
                      onClick={() => setActiveStudy(study)}
                      className="btn btn-outline-gold btn-sm"
                    >
                      Read Study &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Full Study Reader Modal */}
          {activeStudy && (
            <div className="modal-overlay" onClick={() => setActiveStudy(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
                <button className="modal-close-btn" onClick={() => setActiveStudy(null)}>
                  &times;
                </button>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="section-badge" style={{ margin: 0 }}>{activeStudy.topic}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--gold-dark)', fontWeight: 600 }}>
                    {activeStudy.scripture_ref}
                  </span>
                </div>

                <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{activeStudy.title}</h2>
                
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                  <span><User size={14} style={{ display: 'inline', marginRight: '4px' }} /> {activeStudy.author}</span>
                  <span><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> {activeStudy.study_date}</span>
                  <span><Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> {activeStudy.read_time}</span>
                </div>

                <div style={{ fontSize: '1.05rem', lineHeight: '1.9', color: 'var(--text-dark)', whiteSpace: 'pre-line', marginBottom: '2rem' }}>
                  {activeStudy.full_content}
                </div>

                {activeStudy.key_takeaways && activeStudy.key_takeaways.length > 0 && (
                  <div style={{ background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', borderLeft: '4px solid var(--gold-primary)' }}>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--bg-dark)' }}>Key Biblical Takeaways</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {activeStudy.key_takeaways.map((takeaway, idx) => (
                        <li key={idx} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.95rem' }}>
                          <CheckCircle2 size={18} color="var(--gold-dark)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button onClick={() => setActiveStudy(null)} className="btn btn-navy">
                  Close Study
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Dynamic SEO Body & Content Article Section */}
      <PageSEOSection 
        pageIdentifier="study" 
        defaultTitle="Bible Studies & Christian Discipleship | Calvary Ministries" 
        defaultDesc="Deepen your understanding of God's living truth through verse-by-verse scriptural studies and discipleship insights."
      />
    </div>
  );
};

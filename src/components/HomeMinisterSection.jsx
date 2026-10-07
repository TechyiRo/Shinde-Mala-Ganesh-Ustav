import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  Award,
  Crown,
  Sparkles,
  Users,
  Calendar,
  Clock,
  MapPin,
  Share2,
  Edit2,
  PlusCircle,
  Trash2,
  Eye,
  CheckCircle2,
  X
} from 'lucide-react';
import { ManageCompetitionsModal } from './ManageCompetitionsModal';

export const HomeMinisterSection = () => {
  const { competitionsList, deleteCompetition, addToast } = useData();
  const { isAdmin } = useAuth();

  // If no competitions list or empty, fallback
  const list = Array.isArray(competitionsList) && competitionsList.length > 0 ? competitionsList : [];

  const [selectedCompId, setSelectedCompId] = useState(() => list[0]?.id || 'COMP-01');
  const [modalMode, setModalMode] = useState(null); // null | 'edit' | 'create'
  const [lightboxImage, setLightboxImage] = useState(null);

  // Active competition
  const competition = list.find((c) => c.id === selectedCompId) || list[0] || null;

  if (!competition && !isAdmin) {
    return null;
  }

  const organizers = competition?.organizers || [];
  const winners = competition?.winners || [];

  // WhatsApp Share with attractive formatting & official website link
  const handleWhatsAppShare = () => {
    if (!competition) return;

    const topWinnersText = winners.length > 0
      ? winners
          .map((w) => `🏆 *${w.rankLabel || `${w.rank}रा क्रमांक`}:* ${w.name}${w.prize ? ` (${w.prize})` : ''}`)
          .join('\n')
      : 'निकाल लवकरच जाहीर होईल!';

    const text =
`🚩 *॥ श्री गणेशाय नमः ॥* 🚩
👑 *शिंदे मळा गणेश उत्सव मंडळ २०२६*
✨ *विशेष स्पर्धा व निकाल: "${competition.title}"* ✨
${competition.subtitle ? `_${competition.subtitle}_\n` : ''}
━━━━━━━━━━━━━━━━━━━━
🏆 *विजेते महासन्मान:*
${topWinnersText}
━━━━━━━━━━━━━━━━━━━━
${organizers.length > 0 ? `\n👥 *प्रमुख आयोजक व संयोजन:*\n${organizers.map(o => `• ${o.name} (${o.role || 'आयोजक'})`).join('\n')}\n` : ''}
सर्व सहभागी व विजेत्यांचे मनःपूर्वक अभिनंदन व कौतुक! 🌺🙏

━━━━━━━━━━━━━━━━━━━━
🌐 *विजेत्यांचे फोटो, बक्षिसे व संपूर्ण निकाल पाहण्यासाठी मंडळाच्या अधिकृत वेबसाईटला भेट द्या:*
👉 *https://shindemala.vercel.app/*
━━━━━━━━━━━━━━━━━━━━
_🚩 शिंदे मळा गणेश उत्सव मंडळ, हिंगणी दुमाला 🚩_`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleDeleteCurrentCompetition = () => {
    if (!competition) return;
    if (window.confirm(`तुम्हाला नक्की "${competition.title}" हा खेळ / स्पर्धा हटवायची आहे का?`)) {
      deleteCompetition(competition.id);
      addToast('खेळ यशस्वीरित्या हटवला.', 'info');
      const remaining = list.filter((c) => c.id !== competition.id);
      if (remaining.length > 0) {
        setSelectedCompId(remaining[0].id);
      }
    }
  };

  return (
    <div
      id="home-minister-showcase"
      className="glass-panel"
      style={{
        borderRadius: 'var(--radius-xl)',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        border: '1.5px solid rgba(245, 158, 11, 0.45)',
        background: 'linear-gradient(145deg, rgba(153, 27, 27, 0.22) 0%, rgba(180, 83, 9, 0.14) 40%, rgba(20, 10, 15, 0.7) 100%)',
        boxShadow: '0 12px 40px rgba(180, 83, 9, 0.25), 0 0 25px rgba(245, 158, 11, 0.12)'
      }}
    >
      {/* Royal Paithani Glow Background Backdrop */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '240px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(220, 38, 38, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(0.85rem, 3.2vw, 1.85rem)' }}>
        {/* Top Header & Royal Badge */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.65rem',
            marginBottom: '1rem'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.35rem 0.8rem',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(220, 38, 38, 0.35))',
              border: '1.5px solid rgba(251, 191, 36, 0.6)',
              color: '#fbbf24',
              fontSize: 'clamp(0.72rem, 2.4vw, 0.82rem)',
              fontWeight: 800,
              letterSpacing: '0.3px',
              boxShadow: '0 2px 10px rgba(245, 158, 11, 0.2)',
              maxWidth: '100%',
              wordBreak: 'break-word'
            }}
          >
            <Crown size={14} color="#fbbf24" style={{ flexShrink: 0 }} />
            <span>॥ खेळ पैठणीचा • मानाची पैठणी • सांस्कृतिक स्पर्धा ॥</span>
          </div>

          {/* Action Buttons: WhatsApp Share & Admin Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            {competition && (
              <button
                type="button"
                className="btn btn-whatsapp btn-sm"
                onClick={handleWhatsAppShare}
                title="निकाल व्हॉट्सॲपवर पाठवा"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.35rem 0.75rem',
                  fontSize: 'clamp(0.74rem, 2.2vw, 0.8rem)',
                  fontWeight: 700,
                  borderRadius: '8px',
                  minHeight: '36px'
                }}
              >
                <Share2 size={13} />
                <span>निकाल शेअर करा</span>
              </button>
            )}

            {isAdmin && competition && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setModalMode('edit')}
                title="आयोजक व विजेत्यांची माहिती संपादन करा"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.35rem 0.75rem',
                  fontSize: 'clamp(0.74rem, 2.2vw, 0.8rem)',
                  fontWeight: 700,
                  borderRadius: '8px',
                  color: '#fbbf24',
                  borderColor: 'rgba(251, 191, 36, 0.5)',
                  minHeight: '36px'
                }}
              >
                <Edit2 size={13} />
                <span>माहिती व निकाल भरा (Admin)</span>
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setModalMode('create')}
                title="नवीन खेळ / स्पर्धा जोडा"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.35rem 0.75rem',
                  fontSize: 'clamp(0.74rem, 2.2vw, 0.8rem)',
                  fontWeight: 800,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  border: '1px solid #34d399',
                  boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
                  minHeight: '36px'
                }}
              >
                <PlusCircle size={14} />
                <span>+ नवीन खेळ जोडा</span>
              </button>
            )}

            {isAdmin && list.length > 1 && competition && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={handleDeleteCurrentCompetition}
                title="हा खेळ हटवा"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0.35rem 0.6rem',
                  fontSize: 'clamp(0.72rem, 2vw, 0.78rem)',
                  fontWeight: 700,
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  minHeight: '36px'
                }}
              >
                <Trash2 size={13} />
                <span>हटवा</span>
              </button>
            )}
          </div>
        </div>

        {/* MULTIPLE GAMES / COMPETITIONS SELECTOR TABS */}
        {list.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              padding: '0.2rem 0 0.65rem',
              marginBottom: '1.15rem',
              touchAction: 'pan-x',
              width: '100%'
            }}
          >
            {list.map((c) => {
              const isSelected = c.id === competition?.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCompId(c.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.42rem 0.85rem',
                    borderRadius: '999px',
                    fontSize: 'clamp(0.76rem, 2.4vw, 0.84rem)',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    background: isSelected
                      ? 'linear-gradient(135deg, #b91c1c, #d97706)'
                      : 'rgba(255, 255, 255, 0.06)',
                    color: isSelected ? '#ffffff' : 'var(--text-muted)',
                    border: isSelected
                      ? '1.5px solid #fbbf24'
                      : '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: isSelected ? '0 4px 15px rgba(217, 119, 6, 0.4)' : 'none',
                    transition: 'all 0.2s ease',
                    minHeight: '34px'
                  }}
                >
                  <Trophy size={13} color={isSelected ? '#fbbf24' : 'currentColor'} style={{ flexShrink: 0 }} />
                  <span>{c.title || 'स्पर्धा'}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Empty competitions state if none exist */}
        {!competition ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-subtle)' }}>
            <Trophy size={44} color="#fbbf24" style={{ margin: '0 auto 0.85rem', opacity: 0.7 }} />
            <h3 style={{ color: 'var(--text-main)', margin: '0 0 0.5rem', fontSize: 'clamp(1rem, 3.5vw, 1.25rem)' }}>
              कोणतीही स्पर्धा माहिती उपलब्ध नाही
            </h3>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setModalMode('create')}
                className="btn btn-primary"
                style={{ marginTop: '0.85rem', background: 'linear-gradient(135deg, #d97706, #b91c1c)' }}
              >
                <PlusCircle size={16} />
                <span>+ पहिला खेळ / स्पर्धा जोडा (Admin)</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Title, Subtitle & Metadata Banner */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h2
                style={{
                  fontSize: 'clamp(1.2rem, 4.8vw, 1.95rem)',
                  fontWeight: 900,
                  color: 'var(--text-main)',
                  margin: '0 0 0.45rem',
                  lineHeight: 1.3,
                  wordBreak: 'break-word',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
                }}
              >
                {competition.title}
              </h2>

              {competition.subtitle && (
                <p
                  style={{
                    fontSize: 'clamp(0.82rem, 2.8vw, 0.95rem)',
                    color: '#fed7aa',
                    margin: '0 0 0.75rem',
                    fontWeight: 600,
                    lineHeight: 1.45,
                    wordBreak: 'break-word'
                  }}
                >
                  {competition.subtitle}
                </p>
              )}

              {/* Event Meta Badges: Date, Time, Venue */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.4rem 0.75rem',
                  fontSize: 'clamp(0.74rem, 2.4vw, 0.82rem)',
                  color: 'var(--text-subtle)'
                }}
              >
                {competition.date && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                    <Calendar size={13} style={{ flexShrink: 0 }} />
                    <span><strong>दिनांक:</strong> {competition.date}</span>
                  </span>
                )}
                {competition.time && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fed7aa' }}>
                    <Clock size={13} style={{ flexShrink: 0 }} />
                    <span><strong>वेळ:</strong> {competition.time}</span>
                  </span>
                )}
                {competition.venue && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fca5a5' }}>
                    <MapPin size={13} style={{ flexShrink: 0 }} />
                    <span><strong>स्थळ:</strong> {competition.venue}</span>
                  </span>
                )}
              </div>

              {competition.description && (
                <p
                  style={{
                    fontSize: 'clamp(0.78rem, 2.4vw, 0.85rem)',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    marginTop: '0.75rem',
                    marginBottom: 0,
                    wordBreak: 'break-word'
                  }}
                >
                  {competition.description}
                </p>
              )}
            </div>

            {/* SECTION 1: आयोजक व सूत्रसंचालक (ORGANIZERS / HOSTS) */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '0.75rem',
                  fontSize: 'clamp(0.88rem, 3vw, 0.95rem)',
                  fontWeight: 800,
                  color: '#fbbf24'
                }}
              >
                <Users size={16} style={{ flexShrink: 0 }} />
                <span>आयोजक व नियोजन समिती (Organizers)</span>
              </div>

              {organizers.length === 0 ? (
                <div
                  style={{
                    padding: '1.25rem 0.85rem',
                    textAlign: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px dashed rgba(245, 158, 11, 0.3)',
                    color: 'var(--text-subtle)'
                  }}
                >
                  <Users size={28} color="#fbbf24" style={{ opacity: 0.5, margin: '0 auto 0.4rem' }} />
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: 'clamp(0.84rem, 2.6vw, 0.9rem)' }}>
                    आयोजक व संयोजकांची नावे लवकरच जोडली जातील
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setModalMode('edit')}
                      className="btn btn-sm"
                      style={{
                        marginTop: '0.65rem',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid #fbbf24',
                        color: '#fbbf24',
                        fontWeight: 700,
                        fontSize: '0.78rem'
                      }}
                    >
                      + आयोजकांची नावे व फोटो भरा (Admin)
                    </button>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
                    gap: '0.75rem'
                  }}
                >
                  {organizers.map((org, idx) => (
                    <div
                      key={org.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-lg)',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        backdropFilter: 'blur(8px)',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      {/* Photo or Avatar */}
                      <div
                        onClick={() => org.photo && setLightboxImage({ src: org.photo, title: org.name })}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          padding: '2px',
                          background: 'linear-gradient(135deg, #d97706, #ef4444)',
                          flexShrink: 0,
                          cursor: org.photo ? 'pointer' : 'default',
                          boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)'
                        }}
                        title={org.photo ? 'फोटो मोठा करून पहा' : org.name}
                      >
                        {org.photo ? (
                          <img
                            src={org.photo}
                            alt={org.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              backgroundColor: '#261219',
                              color: '#fbbf24',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.85rem'
                            }}
                          >
                            {org.name ? org.name.charAt(0) : 'आ'}
                          </div>
                        )}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: 'clamp(0.84rem, 2.8vw, 0.9rem)',
                            color: 'var(--text-main)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={org.name}
                        >
                          {org.name}
                        </div>
                        <div
                          style={{
                            fontSize: 'clamp(0.72rem, 2.2vw, 0.76rem)',
                            color: '#fbbf24',
                            fontWeight: 600,
                            marginTop: '2px'
                          }}
                        >
                          {org.role || 'आयोजक'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: भव्य विजेते गौरव (WINNERS SHOWCASE PODIUM & LIST) */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.85rem',
                  flexWrap: 'wrap',
                  gap: '0.45rem'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: 'clamp(0.92rem, 3.2vw, 1rem)',
                    fontWeight: 900,
                    color: '#fbbf24'
                  }}
                >
                  <Trophy size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
                  <span>🏆 भव्य विजेते व महासन्मान (Winners & Honors)</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
                  (फक्त पाहण्यासाठी / Viewing Only)
                </span>
              </div>

              {winners.length === 0 ? (
                <div
                  style={{
                    padding: '2.25rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-subtle)',
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px dashed rgba(245, 158, 11, 0.35)'
                  }}
                >
                  <Trophy size={38} color="#fbbf24" style={{ opacity: 0.6, margin: '0 auto 0.5rem' }} />
                  <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: 'clamp(0.95rem, 3.2vw, 1.05rem)' }}>
                    विजेत्यांची नावे लवकरच जाहीर होतील!
                  </div>
                  <div style={{ fontSize: 'clamp(0.78rem, 2.4vw, 0.82rem)', marginTop: '4px', maxWidth: '420px', margin: '4px auto 0' }}>
                    खेळ / स्पर्धेचा निकाल घोषित होताच विजेत्यांची नावे, मानाचे क्रमांक आणि त्यांचे फोटो येथे प्रसिद्ध केले जातील.
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setModalMode('edit')}
                      className="btn btn-sm btn-primary"
                      style={{
                        marginTop: '0.85rem',
                        background: 'linear-gradient(135deg, #d97706, #b91c1c)',
                        border: '1px solid #fbbf24',
                        fontWeight: 800,
                        fontSize: '0.78rem'
                      }}
                    >
                      🏆 विजेत्यांची नावे, बक्षीस व फोटो भरा (Admin)
                    </button>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                    gap: '0.85rem'
                  }}
                >
                  {winners.map((win, idx) => {
                    const isFirst = win.rank === 1;
                    const isSecond = win.rank === 2;
                    const isThird = win.rank === 3;

                    // Rank specific crown and colors
                    const cardBorder = isFirst
                      ? '2px solid rgba(251, 191, 36, 0.85)'
                      : isSecond
                      ? '1.5px solid rgba(226, 232, 240, 0.6)'
                      : isThird
                      ? '1.5px solid rgba(217, 119, 6, 0.6)'
                      : '1px solid rgba(245, 158, 11, 0.35)';

                    const cardBg = isFirst
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(220, 38, 38, 0.15) 100%)'
                      : isSecond
                      ? 'linear-gradient(135deg, rgba(148, 163, 184, 0.15) 0%, rgba(0, 0, 0, 0.35) 100%)'
                      : isThird
                      ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.15) 0%, rgba(0, 0, 0, 0.35) 100%)'
                      : 'rgba(0, 0, 0, 0.35)';

                    const badgeBg = isFirst
                      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                      : isSecond
                      ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                      : isThird
                      ? 'linear-gradient(135deg, #d97706, #b45309)'
                      : 'linear-gradient(135deg, #dc2626, #b91c1c)';

                    return (
                      <div
                        key={win.id || idx}
                        style={{
                          borderRadius: 'var(--radius-lg)',
                          padding: 'clamp(0.85rem, 2.8vw, 1.1rem)',
                          background: cardBg,
                          border: cardBorder,
                          boxShadow: isFirst ? '0 8px 30px rgba(245, 158, 11, 0.25)' : '0 4px 16px rgba(0, 0, 0, 0.3)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          position: 'relative',
                          overflow: 'hidden',
                          backdropFilter: 'blur(10px)',
                          transition: 'transform 0.18s ease'
                        }}
                      >
                        {/* Rank Badge Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '0.22rem 0.6rem',
                              borderRadius: '999px',
                              background: badgeBg,
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: 'clamp(0.72rem, 2.2vw, 0.78rem)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)'
                            }}
                          >
                            {isFirst ? <Crown size={13} /> : isSecond ? <Award size={13} /> : <Trophy size={12} />}
                            <span>{win.rankLabel || `${win.rank}रा क्रमांक`}</span>
                          </div>

                          {isFirst && (
                            <span
                              style={{
                                fontSize: 'clamp(0.68rem, 2vw, 0.72rem)',
                                fontWeight: 800,
                                color: '#fbbf24',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <Sparkles size={12} /> महासन्मान
                            </span>
                          )}
                        </div>

                        {/* Winner Info with Photo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {/* Photo Thumbnail */}
                          <div
                            onClick={() => win.photo && setLightboxImage({ src: win.photo, title: win.name })}
                            style={{
                              width: isFirst ? '58px' : '50px',
                              height: isFirst ? '58px' : '50px',
                              borderRadius: '50%',
                              padding: '2px',
                              background: isFirst
                                ? 'linear-gradient(135deg, #fbbf24, #ef4444)'
                                : 'linear-gradient(135deg, #cbd5e1, #64748b)',
                              flexShrink: 0,
                              cursor: win.photo ? 'pointer' : 'default',
                              boxShadow: isFirst
                                ? '0 4px 12px rgba(245, 158, 11, 0.4)'
                                : '0 2px 8px rgba(0, 0, 0, 0.3)'
                            }}
                            title={win.photo ? 'फोटो मोठा करून पहा' : win.name}
                          >
                            {win.photo ? (
                              <img
                                src={win.photo}
                                alt={win.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '50%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '50%',
                                  backgroundColor: '#1f1322',
                                  color: isFirst ? '#fbbf24' : '#cbd5e1',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 900,
                                  fontSize: isFirst ? '1.05rem' : '0.92rem'
                                }}
                              >
                                {win.name ? win.name.charAt(0) : 'वि'}
                              </div>
                            )}
                          </div>

                          {/* Name & Prize Details */}
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <h4
                              style={{
                                margin: 0,
                                fontSize: isFirst ? 'clamp(0.92rem, 3.2vw, 1.05rem)' : 'clamp(0.85rem, 2.8vw, 0.96rem)',
                                fontWeight: 800,
                                color: 'var(--text-main)',
                                lineHeight: 1.3,
                                wordBreak: 'break-word'
                              }}
                            >
                              {win.name || 'विजेत्याचे नाव'}
                            </h4>

                            {win.prize && (
                              <div
                                style={{
                                  fontSize: 'clamp(0.74rem, 2.4vw, 0.8rem)',
                                  color: '#fbbf24',
                                  fontWeight: 700,
                                  marginTop: '3px',
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '4px',
                                  wordBreak: 'break-word'
                                }}
                              >
                                <span style={{ flexShrink: 0 }}>🎁</span>
                                <span>{win.prize}</span>
                              </div>
                            )}

                            {win.notes && (
                              <div
                                style={{
                                  fontSize: 'clamp(0.7rem, 2.2vw, 0.74rem)',
                                  color: 'var(--text-subtle)',
                                  marginTop: '2px',
                                  fontStyle: 'italic',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {win.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Lightbox Modal for Photo Preview */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(8px)'
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 100000
            }}
          >
            <X size={22} />
          </button>
          <div style={{ textAlign: 'center', maxWidth: '94vw' }}>
            <img
              src={lightboxImage.src}
              alt={lightboxImage.title || 'Photo'}
              style={{
                maxWidth: '92vw',
                maxHeight: '74vh',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
                objectFit: 'contain'
              }}
            />
            {lightboxImage.title && (
              <div
                style={{
                  marginTop: '0.75rem',
                  color: '#fbbf24',
                  fontSize: 'clamp(0.92rem, 3.5vw, 1.05rem)',
                  fontWeight: 800,
                  wordBreak: 'break-word'
                }}
              >
                {lightboxImage.title}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Edit Modal */}
      {modalMode === 'edit' && competition && (
        <ManageCompetitionsModal
          competition={competition}
          onClose={() => setModalMode(null)}
        />
      )}

      {/* Admin Create New Game Modal */}
      {modalMode === 'create' && (
        <ManageCompetitionsModal
          competition={{ isNew: true }}
          onClose={() => setModalMode(null)}
        />
      )}
    </div>
  );
};

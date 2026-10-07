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
  ChevronRight,
  Eye,
  Heart,
  UserCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { ManageCompetitionsModal } from './ManageCompetitionsModal';

export const HomeMinisterSection = () => {
  const { competitionsList } = useData();
  const { isAdmin } = useAuth();

  // Find the primary Home Minister competition or fallback to first one
  const competition =
    (competitionsList && competitionsList.find((c) => c.id === 'COMP-01' || c.title?.includes('होम मिनिस्टर'))) ||
    (competitionsList && competitionsList[0]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  if (!competition) return null;

  const organizers = competition.organizers || [];
  const winners = competition.winners || [];

  // WhatsApp Share with attractive formatting & official website link
  const handleWhatsAppShare = () => {
    const topWinnersText = winners
      .slice(0, 3)
      .map((w) => `🏆 *${w.rankLabel || `${w.rank}रा क्रमांक`}:* ${w.name} (${w.prize || ''})`)
      .join('\n');

    const text =
`🚩 *॥ श्री गणेशाय नमः ॥* 🚩
🌸 *॥ खेळ पैठणीचा • मानाची पैठणी ॥* 🌸

🚩 *शिंदे मळा गणेश उत्सव मंडळ २०२६*
👑 *विशेष सांस्कृतिक सोहळा: "होम मिनिस्टर — खेळ पैठणीचा"* 👑

माहेरवाशिणींचा महासन्मान आणि रंगतदार खेळ पैठणीचा महासोहळा यशस्वीरित्या पार पडला!

━━━━━━━━━━━━━━━━━━━━
🏆 *महासन्मान विजेत्या माहेरवाशिणी:*
${topWinnersText || 'सर्व विजेत्यांचे हार्दिक अभिनंदन!'}
━━━━━━━━━━━━━━━━━━━━

✨ *प्रमुख आयोजक व संयोजन:*
${organizers.map((o) => `• ${o.name} (${o.role || 'आयोजक'})`).join('\n') || 'शिंदे मळा महिला मंडळ व युवक'}

सर्व सहभागी माता-भगिनींचे व विजेत्यांचे मनःपूर्वक अभिनंदन व आभार! 🌺🙏

━━━━━━━━━━━━━━━━━━━━
🌐 *विजेत्यांचे फोटो, बक्षिसे व संपूर्ण निकाल पाहण्यासाठी मंडळाच्या वेबसाईटला भेट द्या:*
👉 *https://shindemala.vercel.app/*
━━━━━━━━━━━━━━━━━━━━
_🚩 शिंदे मळा गणेश उत्सव मंडळ, हिंगणी दुमाला 🚩_`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
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

      <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(1.2rem, 3.5vw, 2.2rem)' }}>
        {/* Top Header & Royal Badge */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.35rem 0.95rem',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(220, 38, 38, 0.35))',
              border: '1.5px solid rgba(251, 191, 36, 0.6)',
              color: '#fbbf24',
              fontSize: 'clamp(0.74rem, 2.2vw, 0.84rem)',
              fontWeight: 800,
              letterSpacing: '0.4px',
              boxShadow: '0 2px 12px rgba(245, 158, 11, 0.25)'
            }}
          >
            <Crown size={15} color="#fbbf24" />
            <span>॥ खेळ पैठणीचा • मानाची पैठणी • महासन्मान ॥</span>
          </div>

          {/* Action Buttons: WhatsApp Share & Admin Edit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-whatsapp btn-sm"
              onClick={handleWhatsAppShare}
              title="होम मिनिस्टर निकाल व्हॉट्सॲपवर पाठवा"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                borderRadius: '8px'
              }}
            >
              <Share2 size={13} />
              <span>निकाल शेअर करा</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditModalOpen(true)}
                title="आयोजक व विजेत्यांची माहिती संपादन करा"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  color: '#fbbf24',
                  borderColor: 'rgba(251, 191, 36, 0.5)'
                }}
              >
                <Edit2 size={13} />
                <span>संपादन करा (Admin)</span>
              </button>
            )}
          </div>
        </div>

        {/* Title, Subtitle & Metadata Banner */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h2
            style={{
              fontSize: 'clamp(1.35rem, 4.2vw, 2.1rem)',
              fontWeight: 900,
              color: 'var(--text-main)',
              margin: '0 0 0.45rem',
              lineHeight: 1.25,
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)'
            }}
          >
            {competition.title}
          </h2>

          <p
            style={{
              fontSize: 'clamp(0.85rem, 2.4vw, 0.98rem)',
              color: '#fed7aa',
              margin: '0 0 0.85rem',
              fontWeight: 600,
              lineHeight: 1.5
            }}
          >
            {competition.subtitle || 'माहेरवाशिणींचा महासन्मान • मानाची पैठणी • रंगतदार खेळ व मनोरंजक स्पर्धा'}
          </p>

          {/* Event Meta Badges: Date, Time, Venue */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
            {competition.date && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#fbbf24' }}>
                <Calendar size={13} />
                <strong>दिनांक:</strong> {competition.date}
              </span>
            )}
            {competition.time && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#fed7aa' }}>
                <Clock size={13} />
                <strong>वेळ:</strong> {competition.time}
              </span>
            )}
            {competition.venue && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#fca5a5' }}>
                <MapPin size={13} />
                <strong>स्थळ:</strong> {competition.venue}
              </span>
            )}
          </div>

          {competition.description && (
            <p
              style={{
                fontSize: '0.84rem',
                color: 'var(--text-muted)',
                lineHeight: 1.55,
                marginTop: '0.75rem',
                backgroundColor: 'rgba(0, 0, 0, 0.22)',
                padding: '0.65rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid #f59e0b'
              }}
            >
              {competition.description}
            </p>
          )}
        </div>

        {/* SECTION 1: आयोजक व सूत्रसंचालक (ORGANIZERS / HOSTS) */}
        {organizers.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                color: '#fbbf24'
              }}
            >
              <Users size={18} />
              <span>आयोजक व नियोजन समिती (Organizers & Hosts)</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(200px, 45vw, 280px), 1fr))',
                gap: '0.85rem'
              }}
            >
              {organizers.map((org, idx) => (
                <div
                  key={org.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.75rem 1rem',
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
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      padding: '2px',
                      background: 'linear-gradient(135deg, #d97706, #ef4444)',
                      flexShrink: 0,
                      cursor: org.photo ? 'pointer' : 'default',
                      boxShadow: '0 2px 10px rgba(217, 119, 6, 0.35)'
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
                          fontSize: '0.9rem'
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
                        fontSize: '0.9rem',
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
                        fontSize: '0.74rem',
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
          </div>
        )}

        {/* SECTION 2: भव्य विजेते गौरव (WINNERS SHOWCASE PODIUM & LIST) */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1rem',
                fontWeight: 900,
                color: '#fbbf24'
              }}
            >
              <Trophy size={20} color="#fbbf24" />
              <span>🏆 भव्य विजेते व महासन्मान (Winners & Honors)</span>
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
              (फक्त पाहण्यासाठी / Viewing Only)
            </span>
          </div>

          {winners.length === 0 ? (
            <div
              style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                color: 'var(--text-subtle)',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed rgba(245, 158, 11, 0.3)'
              }}
            >
              <Trophy size={36} color="#fbbf24" style={{ opacity: 0.5, margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>विजेत्यांची नावे लवकरच जाहीर होतील!</div>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                कार्यक्रमाचा निकाल लागताच विजेत्यांची नावे व मानाच्या पैठणीचे फोटो येथे प्रसिद्ध केले जातील.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(270px, 48vw, 360px), 1fr))',
                gap: '1rem'
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
                      padding: '1.1rem',
                      background: cardBg,
                      border: cardBorder,
                      boxShadow: isFirst ? '0 8px 30px rgba(245, 158, 11, 0.28)' : '0 4px 16px rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '0.85rem',
                      position: 'relative',
                      overflow: 'hidden',
                      backdropFilter: 'blur(10px)',
                      transition: 'transform 0.18s ease'
                    }}
                  >
                    {/* Rank Badge Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '999px',
                          background: badgeBg,
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)'
                        }}
                      >
                        {isFirst ? <Crown size={14} /> : isSecond ? <Award size={14} /> : <Trophy size={13} />}
                        <span>{win.rankLabel || `${win.rank}रा क्रमांक`}</span>
                      </div>

                      {isFirst && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            color: '#fbbf24',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <Sparkles size={13} /> मानाची पैठणी
                        </span>
                      )}
                    </div>

                    {/* Devotee Info with Photo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      {/* Photo Thumbnail */}
                      <div
                        onClick={() => win.photo && setLightboxImage({ src: win.photo, title: win.name })}
                        style={{
                          width: isFirst ? '64px' : '56px',
                          height: isFirst ? '64px' : '56px',
                          borderRadius: '50%',
                          padding: '2.5px',
                          background: isFirst
                            ? 'linear-gradient(135deg, #fbbf24, #ef4444)'
                            : 'linear-gradient(135deg, #d97706, #94a3b8)',
                          flexShrink: 0,
                          cursor: win.photo ? 'pointer' : 'default',
                          boxShadow: isFirst ? '0 0 16px rgba(251, 191, 36, 0.45)' : '0 2px 10px rgba(0, 0, 0, 0.4)',
                          position: 'relative'
                        }}
                        title={win.photo ? 'विजेत्याचा फोटो मोठा करून पहा' : win.name}
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
                              backgroundColor: '#261219',
                              color: '#fbbf24',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: isFirst ? '1.25rem' : '1rem'
                            }}
                          >
                            {win.name ? win.name.charAt(0) : 'वि'}
                          </div>
                        )}
                        {win.photo && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '-2px',
                              right: '-2px',
                              backgroundColor: 'rgba(0, 0, 0, 0.75)',
                              borderRadius: '50%',
                              padding: '2px',
                              color: '#fbbf24',
                              display: 'flex'
                            }}
                          >
                            <Eye size={10} />
                          </div>
                        )}
                      </div>

                      {/* Name & Notes */}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 900,
                            fontSize: isFirst ? '1.08rem' : '0.98rem',
                            color: 'var(--text-main)',
                            lineHeight: 1.25,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={win.name}
                        >
                          {win.name}
                        </div>
                        {win.notes && (
                          <div
                            style={{
                              fontSize: '0.74rem',
                              color: '#fed7aa',
                              marginTop: '2px',
                              lineHeight: 1.3
                            }}
                          >
                            {win.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Prize Banner */}
                    <div
                      style={{
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(251, 191, 36, 0.25)',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem'
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>बक्षीस / पारितोषिक:</div>
                      <div
                        style={{
                          fontWeight: 800,
                          color: '#fbbf24',
                          textAlign: 'right',
                          lineHeight: 1.2
                        }}
                      >
                        {win.prize || 'मानाचे पारितोषिक 🏆'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="modal-overlay"
          onClick={() => setLightboxImage(null)}
          style={{ zIndex: 99999, backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              position: 'relative',
              textAlign: 'center'
            }}
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              style={{
                position: 'absolute',
                top: '-42px',
                right: '0',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
            <img
              src={lightboxImage.src}
              alt={lightboxImage.title || 'Photo'}
              style={{
                maxWidth: '90vw',
                maxHeight: '80vh',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
                objectFit: 'contain'
              }}
            />
            {lightboxImage.title && (
              <div style={{ marginTop: '0.75rem', color: '#fbbf24', fontSize: '1.05rem', fontWeight: 800 }}>
                {lightboxImage.title}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Edit Modal */}
      {isEditModalOpen && (
        <ManageCompetitionsModal
          competition={competition}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};

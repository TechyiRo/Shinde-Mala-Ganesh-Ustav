import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  Heart,
  Share2,
  Copy,
  Check,
  MapPin,
  Clock,
  Radio,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Maximize2,
  X
} from 'lucide-react';

export const EventPostCard = ({ event }) => {
  const { lang, t } = useLanguage();
  const { likeEvent, addToast } = useData();

  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const lastTapRef = useRef(0);

  const mediaList = event.media && event.media.length > 0 ? event.media : [
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1567591974584-f1832dfa6291?auto=format&fit=crop&w=1000&q=80',
      caption: event.title
    }
  ];

  const currentMedia = mediaList[currentMediaIdx] || mediaList[0];

  // Double tap to like
  const handleMediaTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      triggerLike();
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    }
    lastTapRef.current = now;
  };

  const triggerLike = () => {
    likeEvent(event.id);
  };

  // WhatsApp Share
  const handleWhatsAppShare = () => {
    const title = lang === 'mr' ? event.title : event.titleEn || event.title;
    const text = `॥ गणपती बाप्पा मोरया ॥\n\n*शिंदे मळा गणेश उत्सव २०२६ — थेट उत्सव क्षणचित्रे*\n\n🌟 *${title}*\n📅 तारीख: ${event.date} (${event.startTime || ''})\n📍 ठिकाण: ${event.location || 'शिंदे मळा मंडप'}\n\n${event.caption || ''}\n\nसर्व भाविकांनी दर्शनाचा व कार्यक्रमाचा लाभ घ्यावा!\n\n_शिंदे मळा गणेश उत्सव मंडळ, हिंगणी दुमाला_`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Copy Link
  const handleCopyLink = () => {
    const link = `${window.location.origin}/#event-${event.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      addToast(t('toastLinkCopied'), 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isLive = event.status === 'Live' || event.status === 'Live Now';
  const displayTitle = lang === 'mr' ? event.title : event.titleEn || event.title;
  const displayCaption = lang === 'mr' ? event.caption : event.captionEn || event.caption;
  const timeAgo = lang === 'mr' ? event.timeAgoMr || 'आज' : event.timeAgoEn || 'Today';

  return (
    <article
      id={`event-${event.id}`}
      className="glass-panel"
      style={{
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto 2rem',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: isLive ? '1.5px solid rgba(239, 68, 68, 0.6)' : '1px solid var(--glass-border)',
        boxShadow: isLive
          ? '0 16px 40px -10px rgba(239, 68, 68, 0.35), var(--glass-inner-glow)'
          : 'var(--glass-shadow), var(--glass-inner-glow)'
      }}
    >
      {/* 1. Header: Mandal Avatar + Title + Time + Pulsing LIVE Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.15rem',
          borderBottom: '1px solid var(--glass-border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Avatar with gradient ring */}
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              padding: '2px',
              background: isLive
                ? 'linear-gradient(135deg, #ef4444, #f59e0b)'
                : 'linear-gradient(135deg, #ff7722, #fbbf24)',
              boxShadow: isLive ? '0 0 12px rgba(239, 68, 68, 0.6)' : 'none'
            }}
          >
            <img
              src="/logo.png"
              onError={(e) => {
                e.target.src = '/ganesh-icon.svg';
              }}
              alt="Mandal Logo"
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <strong style={{ fontSize: '0.98rem', color: 'var(--text-main)' }}>
                शिंदे मळा गणेश उत्सव
              </strong>
              {event.dayNumber && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(245, 158, 11, 0.18)',
                    color: 'var(--accent-gold-light)',
                    fontWeight: 700
                  }}
                >
                  दिवस {event.dayNumber}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>{timeAgo}</span>
              {event.location && (
                <>
                  <span>•</span>
                  <span>{event.location}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pulsing Live Badge if active */}
        {isLive ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              color: '#f87171',
              fontSize: '0.78rem',
              fontWeight: 800,
              boxShadow: '0 0 14px rgba(239, 68, 68, 0.5)',
              animation: 'pulseLive 1.8s infinite'
            }}
          >
            <Radio size={14} className="pulse-icon" />
            <span>LIVE NOW</span>
          </div>
        ) : event.isPinned ? (
          <span
            style={{
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(251, 191, 36, 0.2)',
              color: 'var(--accent-gold-light)',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            📌 मुख्य कार्यक्रम
          </span>
        ) : null}
      </div>

      {/* 2. Media Area with Natural Aspect Ratio & Ambient Backdrop */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '260px',
          maxHeight: 'min(78vh, 650px)',
          backgroundColor: '#07030a',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        onClick={handleMediaTap}
      >
        {/* Ambient Blurred Backdrop for portrait/mixed ratio photos */}
        <img
          src={currentMedia.url}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(30px) brightness(0.35)',
            transform: 'scale(1.15)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Foreground Content with Natural Aspect Ratio (Never cropped or distorted) */}
        {currentMedia.type === 'video' || currentMedia.url?.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? (
          <video
            src={currentMedia.url}
            controls
            playsInline
            preload="metadata"
            style={{
              position: 'relative',
              width: '100%',
              maxHeight: 'min(78vh, 650px)',
              objectFit: 'contain',
              zIndex: 2,
              display: 'block'
            }}
          />
        ) : (
          <img
            src={currentMedia.url}
            alt={event.title}
            style={{
              position: 'relative',
              maxWidth: '100%',
              maxHeight: 'min(78vh, 650px)',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              zIndex: 2,
              display: 'block',
              margin: '0 auto',
              transition: 'transform 0.3s ease'
            }}
          />
        )}

        {/* Fullscreen view trigger button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            zIndex: 6
          }}
          title="Fullscreen Lightbox"
        >
          <Maximize2 size={16} />
        </button>

        {/* Floating Heart Burst Animation on double-tap */}
        {showHeartBurst && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 10,
              animation: 'heartBurst 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <Heart size={90} fill="#f43f5e" color="#f43f5e" style={{ filter: 'drop-shadow(0 0 20px rgba(244, 63, 94, 0.8))' }} />
          </div>
        )}

        {/* Carousel Indicators & Next/Prev */}
        {mediaList.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMediaIdx((prev) => (prev > 0 ? prev - 1 : mediaList.length - 1));
              }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '10px',
                transform: 'translateY(-50%)',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(6px)',
                zIndex: 6
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMediaIdx((prev) => (prev < mediaList.length - 1 ? prev + 1 : 0));
              }}
              style={{
                position: 'absolute',
                top: '50%',
                right: '10px',
                transform: 'translateY(-50%)',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(6px)',
                zIndex: 6
              }}
            >
              <ChevronRight size={20} />
            </button>

            {/* Dots */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '6px',
                zIndex: 6,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                padding: '4px 8px',
                borderRadius: '999px',
                backdropFilter: 'blur(6px)'
              }}
            >
              {mediaList.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === currentMediaIdx ? '18px' : '6px',
                    height: '6px',
                    borderRadius: '3px',
                    backgroundColor: i === currentMediaIdx ? '#fbbf24' : 'rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 3. Action Bar: Like, WhatsApp Share, Copy Link */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.15rem 0.4rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Like button */}
          <button
            onClick={triggerLike}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: event.isLikedByUser ? '#f43f5e' : 'var(--text-main)',
              cursor: 'pointer',
              fontSize: '0.92rem',
              fontWeight: 700,
              padding: '4px'
            }}
          >
            <Heart
              size={22}
              fill={event.isLikedByUser ? '#f43f5e' : 'none'}
              color={event.isLikedByUser ? '#f43f5e' : 'currentColor'}
              style={{ transition: 'transform 0.15s ease' }}
            />
            <span>{event.likes || 0}</span>
          </button>

          {/* WhatsApp Share */}
          <button
            onClick={handleWhatsAppShare}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#25D366',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              padding: '4px'
            }}
            title={t('shareWhatsApp')}
          >
            <Share2 size={20} />
            <span>व्हॉट्सॲप</span>
          </button>
        </div>

        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-subtle)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.82rem',
            padding: '4px'
          }}
          title="Copy Link"
        >
          {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
          <span>{copied ? 'कॉपी झाले!' : 'लिंक'}</span>
        </button>
      </div>

      {/* 4. Post Caption & Event Details */}
      <div style={{ padding: '0.4rem 1.15rem 1.15rem' }}>
        <h3
          style={{
            fontSize: '1.08rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            margin: '0 0 0.35rem',
            lineHeight: 1.3
          }}
        >
          {displayTitle}
        </h3>

        {/* Category & Time chip */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.65rem' }}>
          <span
            style={{
              padding: '0.15rem 0.55rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(230, 81, 0, 0.15)',
              color: '#ff7722',
              fontSize: '0.78rem',
              fontWeight: 700
            }}
          >
            {event.category || 'उत्सव'}
          </span>
          {event.startTime && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.78rem',
                color: 'var(--text-subtle)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '0.15rem 0.55rem',
                borderRadius: '6px'
              }}
            >
              <Clock size={12} />
              <span>{event.startTime} {event.endTime ? `ते ${event.endTime}` : ''}</span>
            </span>
          )}
        </div>

        {/* Multiline caption with read more toggle */}
        <p
          style={{
            fontSize: '0.88rem',
            lineHeight: 1.6,
            color: 'var(--text-muted)',
            margin: 0,
            whiteSpace: 'pre-line'
          }}
        >
          {showFullCaption || (displayCaption || '').length < 130
            ? displayCaption
            : `${(displayCaption || '').slice(0, 130)}...`}
        </p>

        {(displayCaption || '').length >= 130 && (
          <button
            onClick={() => setShowFullCaption(!showFullCaption)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-gold-light)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              padding: '0.25rem 0 0'
            }}
          >
            {showFullCaption ? t('readLess') : t('readMore')}
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="modal-overlay" onClick={() => setIsLightboxOpen(false)} style={{ zIndex: 3000, padding: '1rem' }}>
          <div
            className="modal-content"
            style={{ maxWidth: '780px', padding: '1rem', position: 'relative', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
            {currentMedia.type === 'video' || currentMedia.url?.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? (
              <video
                src={currentMedia.url}
                controls
                autoPlay
                playsInline
                style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px' }}
              />
            ) : (
              <img
                src={currentMedia.url}
                alt="Enlarged view"
                style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px' }}
              />
            )}
            <div style={{ marginTop: '0.75rem', fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>
              {displayTitle}
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

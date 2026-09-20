import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Sparkles,
  MapPin,
  Pin,
  Share2
} from 'lucide-react';

export const EventStoriesViewer = ({
  isOpen,
  initialStatusId,
  statuses = [],
  fallbackEvents = [],
  onClose
}) => {
  const { lang, t } = useLanguage();
  const { likeStatus, addToast } = useData();

  // Combine items to display: prefer activeStatuses, fallback to events
  const storiesList = statuses.length > 0 ? statuses : fallbackEvents;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Set initial index when modal opens
  useEffect(() => {
    if (!isOpen || storiesList.length === 0) return;

    if (initialStatusId) {
      const idx = storiesList.findIndex((s) => s.id === initialStatusId);
      if (idx !== -1) {
        setCurrentIndex(idx);
        setProgress(0);
        return;
      }
    }
    setCurrentIndex(0);
    setProgress(0);
  }, [isOpen, initialStatusId, storiesList]);

  // Current active story item
  const currentStory = storiesList[currentIndex] || {
    title: 'श्री गणेश उत्सव २०२६',
    caption: 'शिंदे मळा सार्वजनिक गणेश उत्सव मंडळ',
    media: [{ url: '/logo.png', type: 'image' }],
    createdAt: new Date().toISOString()
  };

  const mediaItem =
    currentStory.media && currentStory.media.length > 0
      ? currentStory.media[0]
      : { url: '/logo.png', type: 'image' };

  // Auto-progress timer (5.0 seconds per story)
  useEffect(() => {
    if (!isOpen || isPaused || storiesList.length === 0) return;

    const intervalMs = 50;
    const step = 100 / (5000 / intervalMs);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, currentIndex, storiesList.length]);

  const handleNext = () => {
    if (currentIndex < storiesList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      // Completed all stories
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ') setIsPaused((p) => !p);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, storiesList.length]);

  // Format time ago (e.g., "२ तास आधी")
  const formatTimeAgo = (isoString) => {
    if (!isoString) return '';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'आत्ताच (Just now)';
      if (mins < 60) return `${mins} मिनिटांपूर्वी`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} तासांपूर्वी`;
      const days = Math.floor(hours / 24);
      return `${days} दिवसांपूर्वी`;
    } catch {
      return '';
    }
  };

  // Format remaining 24-hour time
  const formatRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    try {
      const diffMs = new Date(expiresAt).getTime() - Date.now();
      if (diffMs <= 0) return 'कालबाह्य';
      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      if (hours > 0) return `${hours} तास ${minutes} मि. शिल्लक`;
      return `${minutes} मि. शिल्लक`;
    } catch {
      return null;
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentStory.title || 'गणेश उत्सव स्टोरी',
          text: currentStory.caption || 'शिंदे मळा गणेश उत्सव मंडळ २४-तास स्टोरी',
          url: window.location.href
        });
      } catch {
        // Share cancelled or unavailable
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      addToast('स्टोरी लिंक कॉपी झाली!', 'success');
    }
  };

  if (!isOpen || storiesList.length === 0) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(16px)',
        userSelect: 'none'
      }}
      onClick={onClose}
    >
      {/* Story Container Responsive Modal Card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 'min(94vw, 760px)',
          height: 'min(94vh, 840px)',
          maxHeight: '94vh',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: '#0c0307',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(245, 158, 11, 0.25)',
          border: '1.5px solid rgba(251, 191, 36, 0.4)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Top Segmented Story Progress Bars */}
        <div
          style={{
            position: 'absolute',
            top: '0.85rem',
            left: '0.75rem',
            right: '0.75rem',
            display: 'flex',
            gap: '4px',
            zIndex: 30
          }}
        >
          {storiesList.map((s, idx) => {
            let segProgress = 0;
            if (idx < currentIndex) segProgress = 100;
            else if (idx === currentIndex) segProgress = progress;

            return (
              <div
                key={s.id || idx}
                style={{
                  flex: 1,
                  height: '3.5px',
                  borderRadius: '3px',
                  backgroundColor: 'rgba(255, 255, 255, 0.28)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${segProgress}%`,
                    backgroundColor: '#fbbf24',
                    boxShadow: '0 0 8px rgba(251, 191, 36, 0.8)',
                    transition: idx === currentIndex ? 'none' : 'width 0.2s ease'
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Top Header Bar: Mandal Logo, Title, Time, Remaining, Close */}
        <div
          style={{
            position: 'absolute',
            top: '1.65rem',
            left: '0.85rem',
            right: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 30,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
            paddingBottom: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            {/* Animated Profile Ring */}
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                padding: '2px',
                background: 'linear-gradient(135deg, #ff7722, #fbbf24, #ef4444)',
                flexShrink: 0
              }}
            >
              <img
                src="/logo.png"
                alt="Mandal Logo"
                onError={(e) => {
                  e.target.src = '/ganesh-icon.svg';
                }}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <span>{currentStory.category || 'Ganesh Utsav 2026'}</span>
                {storiesList.length > 1 && (
                  <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700 }}>
                    ({currentIndex + 1}/{storiesList.length})
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: '0.76rem',
                  color: '#fff',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {currentStory.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: '#fde68a' }}>
                <span>{formatTimeAgo(currentStory.createdAt)}</span>
                {formatRemaining(currentStory.expiresAt) && (
                  <>
                    <span>•</span>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>
                      ⏳ {formatRemaining(currentStory.expiresAt)}
                    </span>
                  </>
                )}
                {currentStory.isPinned && (
                  <>
                    <span>•</span>
                    <span style={{ color: '#fbbf24', fontWeight: 800 }}>📌 पिन</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            <button
              type="button"
              onClick={handleShare}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)'
              }}
              title="शेअर करा"
            >
              <Share2 size={14} />
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)'
              }}
              title="बंद करा"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Media Content Body (Photo or Video in Original Uncropped Aspect Ratio) */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#080205'
          }}
        >
          {/* Ambient Blurred Background Aura to cleanly fill Letterbox/Pillarbox space */}
          {mediaItem.url && (
            <div
              style={{
                position: 'absolute',
                inset: -25,
                backgroundImage: `url(${mediaItem.url})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                filter: 'blur(42px) brightness(0.32) saturate(1.25)',
                transform: 'scale(1.15)',
                opacity: 0.75,
                zIndex: 1,
                pointerEvents: 'none'
              }}
            />
          )}

          {/* Clean Dark Vignette Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, rgba(0,0,0,0) 40%, rgba(6, 2, 4, 0.78) 100%)',
              zIndex: 2,
              pointerEvents: 'none'
            }}
          />

          {/* Tap Zones for Next / Prev */}
          <div
            style={{
              position: 'absolute',
              top: '4.5rem',
              left: 0,
              width: '35%',
              bottom: '5.5rem',
              cursor: 'pointer',
              zIndex: 20
            }}
            onClick={handlePrev}
            title="मागील (Previous)"
          />
          <div
            style={{
              position: 'absolute',
              top: '4.5rem',
              right: 0,
              width: '65%',
              bottom: '5.5rem',
              cursor: 'pointer',
              zIndex: 20
            }}
            onClick={handleNext}
            title="पुढील (Next)"
          />

          {/* Exact Original Image / Video - Complete, Uncropped, Undistorted */}
          {mediaItem.type === 'video' ? (
            <video
              src={mediaItem.url}
              autoPlay
              playsInline
              muted
              loop
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                zIndex: 4,
                borderRadius: '8px',
                boxShadow: '0 10px 35px rgba(0, 0, 0, 0.75)'
              }}
            />
          ) : (
            <img
              src={mediaItem.url}
              alt={currentStory.title}
              onError={(e) => {
                e.target.src = '/logo.png';
              }}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                zIndex: 4,
                borderRadius: '8px',
                boxShadow: '0 10px 35px rgba(0, 0, 0, 0.75)',
                userSelect: 'none'
              }}
            />
          )}

          {/* Left / Right Chevron Nav Buttons for Desktop Ease */}
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              style={{
                position: 'absolute',
                top: '50%',
                left: '0.75rem',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 25,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
              }}
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {currentIndex < storiesList.length - 1 && (
            <button
              type="button"
              onClick={handleNext}
              style={{
                position: 'absolute',
                top: '50%',
                right: '0.75rem',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 25,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
              }}
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        {/* Bottom Caption, Location & Like Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '1.5rem 1rem 1rem',
            background: 'linear-gradient(0deg, rgba(12, 3, 7, 0.95) 0%, rgba(12, 3, 7, 0.75) 70%, transparent 100%)',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem'
          }}
        >
          {currentStory.caption && (
            <p
              style={{
                margin: 0,
                fontSize: '0.88rem',
                color: '#ffedd5',
                lineHeight: 1.35,
                fontWeight: 600,
                textShadow: '0 1px 4px rgba(0,0,0,0.8)'
              }}
            >
              {currentStory.caption}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-gold-light)', fontSize: '0.78rem', fontWeight: 600 }}>
              <MapPin size={13} />
              <span>शिंदे मळा, हिंगणी दुमाला</span>
            </div>

            {/* Like Button */}
            <button
              type="button"
              onClick={() => {
                if (currentStory.id) likeStatus(currentStory.id);
              }}
              style={{
                background: currentStory.isLikedByUser ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                border: currentStory.isLikedByUser ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.2)',
                color: currentStory.isLikedByUser ? '#ef4444' : '#ffffff',
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(8px)'
              }}
            >
              <Heart size={14} fill={currentStory.isLikedByUser ? '#ef4444' : 'none'} />
              <span>{currentStory.likes || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

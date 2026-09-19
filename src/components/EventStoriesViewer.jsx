import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Sparkles, MapPin } from 'lucide-react';

export const EventStoriesViewer = ({ isOpen, initialDay = 1, stories = [], onClose }) => {
  const { lang, t } = useLanguage();
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Group events by dayNumber
  const daysList = Array.from({ length: 11 }, (_, i) => i + 1);

  // Find day index based on initialDay
  useEffect(() => {
    const idx = daysList.indexOf(Number(initialDay));
    if (idx !== -1) {
      setCurrentDayIndex(idx);
      setCurrentMediaIndex(0);
      setProgress(0);
    }
  }, [initialDay, isOpen]);

  const currentDay = daysList[currentDayIndex];
  // Find event corresponding to this day
  const dayEvent = stories.find((s) => Number(s.dayNumber) === currentDay) || {
    title: `उत्सव दिवस ${currentDay}`,
    titleEn: `Festival Day ${currentDay}`,
    caption: 'श्री गणेश उत्सव २०२६ — शिंदे मळा, हिंगणी दुमाला',
    captionEn: 'Shri Ganesh Utsav 2026 - Shinde Mala, Hingani Dumala',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1567591974584-f1832dfa6291?auto=format&fit=crop&w=1000&q=80',
        caption: `दिवस ${currentDay} दर्शन`
      }
    ]
  };

  const mediaList = dayEvent.media && dayEvent.media.length > 0 ? dayEvent.media : [
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1567591974584-f1832dfa6291?auto=format&fit=crop&w=1000&q=80',
      caption: `दिवस ${currentDay}`
    }
  ];

  const currentMedia = mediaList[currentMediaIndex] || mediaList[0];

  // Auto-progress timer (5 seconds per slide)
  useEffect(() => {
    if (!isOpen || isPaused) return;

    const interval = 50; // ms
    const step = 100 / (5000 / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, currentDayIndex, currentMediaIndex]);

  const handleNext = () => {
    if (currentMediaIndex < mediaList.length - 1) {
      setCurrentMediaIndex((prev) => prev + 1);
      setProgress(0);
    } else if (currentDayIndex < daysList.length - 1) {
      setCurrentDayIndex((prev) => prev + 1);
      setCurrentMediaIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex((prev) => prev - 1);
      setProgress(0);
    } else if (currentDayIndex > 0) {
      setCurrentDayIndex((prev) => prev - 1);
      setCurrentMediaIndex(0);
      setProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 2500,
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(30px)',
        padding: 0
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          height: '100vh',
          maxHeight: '920px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#120810',
          overflow: 'hidden',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(230, 81, 0, 0.35)',
          border: '1px solid var(--glass-border)'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Top Story Header & Segmented Progress Bars */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            padding: '1rem 1rem 2rem',
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%)'
          }}
        >
          {/* Segmented Progress Bars */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '0.75rem' }}>
            {mediaList.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: '3px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#fbbf24',
                    width:
                      i < currentMediaIndex
                        ? '100%'
                        : i === currentMediaIndex
                        ? `${progress}%`
                        : '0%',
                    transition: i === currentMediaIndex ? 'width 0.05s linear' : 'none'
                  }}
                />
              </div>
            ))}
          </div>

          {/* User / Mandal Info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  padding: '2px',
                  background: 'linear-gradient(135deg, #ff7722, #fbbf24)',
                  boxShadow: '0 0 12px rgba(251, 191, 36, 0.5)'
                }}
              >
                <img
                  src="/logo.png"
                  onError={(e) => {
                    e.target.src = '/ganesh-icon.svg';
                  }}
                  alt="Logo"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#fff' }}>शिंदे मळा गणेश उत्सव</strong>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.1rem 0.5rem',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(245, 158, 11, 0.25)',
                      color: '#fbbf24',
                      fontWeight: 700
                    }}
                  >
                    दिवस {currentDay} (Day {currentDay})
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                  {dayEvent.startTime ? `${dayEvent.date} • ${dayEvent.startTime}` : '२०२६ उत्सव सोहळा'}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Media Display Area */}
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={currentMedia.url}
            alt="Story"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

          {/* Left & Right Touch Areas for Navigation */}
          <div
            onClick={handlePrev}
            style={{
              position: 'absolute',
              top: '80px',
              bottom: '120px',
              left: 0,
              width: '35%',
              cursor: 'pointer',
              zIndex: 5
            }}
          />
          <div
            onClick={handleNext}
            style={{
              position: 'absolute',
              top: '80px',
              bottom: '120px',
              right: 0,
              width: '35%',
              cursor: 'pointer',
              zIndex: 5
            }}
          />
        </div>

        {/* Bottom Caption & Day Details */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            padding: '2rem 1.25rem 1.25rem',
            background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0%, transparent 100%)',
            color: '#fff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            <Sparkles size={16} />
            <span>{lang === 'mr' ? dayEvent.title : dayEvent.titleEn || dayEvent.title}</span>
          </div>

          {dayEvent.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.75)', marginBottom: '0.5rem' }}>
              <MapPin size={13} color="#f59e0b" />
              <span>{dayEvent.location}</span>
            </div>
          )}

          <p style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'rgba(255, 255, 255, 0.9)', margin: 0, maxHeight: '85px', overflowY: 'auto' }}>
            {lang === 'mr' ? dayEvent.caption : dayEvent.captionEn || dayEvent.caption}
          </p>

          {/* Days Switcher Chips at the very bottom */}
          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              paddingTop: '0.85rem',
              scrollbarWidth: 'none'
            }}
          >
            {daysList.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setCurrentDayIndex(d - 1);
                  setCurrentMediaIndex(0);
                  setProgress(0);
                }}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '999px',
                  border: d === currentDay ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: d === currentDay ? 'rgba(245, 158, 11, 0.35)' : 'rgba(0, 0, 0, 0.4)',
                  color: d === currentDay ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                दिवस {d}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

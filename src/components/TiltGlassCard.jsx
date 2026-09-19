import React, { useRef, useState, useEffect } from 'react';

export const TiltGlassCard = ({ title, value, prefix = '', suffix = '', icon: Icon, color, isCurrency = false, subtitle = '' }) => {
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [displayValue, setDisplayValue] = useState(0);

  // Animated count-up numbers
  useEffect(() => {
    let start = 0;
    const end = Number(value) || 0;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 850;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = (end - start) / steps;

    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -9; // Max 9 deg tilt
    const rotateY = ((x - centerX) / centerX) * 9;

    setTransformStyle(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`
    );

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlarePos({ x: glareX, y: glareY, opacity: 0.25 });
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const formattedNumber = isCurrency
    ? displayValue.toLocaleString('en-IN')
    : displayValue.toLocaleString();

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: 'transform 0.18s ease-out, box-shadow 0.2s ease',
        transformStyle: 'preserve-3d',
        position: 'relative',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--glass-shadow), var(--glass-inner-glow)',
        padding: '1.75rem',
        overflow: 'hidden',
        cursor: 'default'
      }}
    >
      {/* Glare Reflection */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.45) 0%, transparent 60%)`,
          opacity: glarePos.opacity,
          transition: 'opacity 0.2s ease',
          zIndex: 2
        }}
      />

      {/* Ambient Color Glow in corner */}
      <div
        style={{
          position: 'absolute',
          top: '-25px',
          right: '-25px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: color || 'var(--primary)',
          filter: 'blur(50px)',
          opacity: 0.25,
          pointerEvents: 'none'
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-subtle)' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              backgroundColor: `${color || 'var(--primary)'}22`,
              border: `1px solid ${color || 'var(--primary)'}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color || 'var(--primary)',
              boxShadow: `0 4px 14px ${color || 'var(--primary)'}25`
            }}
          >
            <Icon size={24} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.4rem', position: 'relative', zIndex: 1 }}>
        {prefix && (
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: color || 'var(--text-main)' }}>
            {prefix}
          </span>
        )}
        <span
          style={{
            fontSize: '2.3rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: color || 'var(--text-main)',
            lineHeight: 1.1
          }}
        >
          {formattedNumber}
        </span>
        {suffix && (
          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {suffix}
          </span>
        )}
      </div>

      {subtitle && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', fontWeight: 600, position: 'relative', zIndex: 1 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

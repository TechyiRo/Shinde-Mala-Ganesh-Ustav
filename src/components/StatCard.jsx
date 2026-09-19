import React, { useState, useEffect } from 'react';

export const StatCard = ({ title, value, prefix = '', suffix = '', icon: Icon, color, isCurrency = false, subtitle = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(value) || 0;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 800; // ms
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

  const formattedNumber = isCurrency
    ? displayValue.toLocaleString('en-IN')
    : displayValue.toLocaleString();

  return (
    <div className="glass-panel glass-card-interactive" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Soft background ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: color || 'var(--primary)',
          filter: 'blur(45px)',
          opacity: 0.2,
          pointerEvents: 'none'
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-subtle)' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              backgroundColor: `${color || 'var(--primary)'}22`,
              border: `1px solid ${color || 'var(--primary)'}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color || 'var(--primary)'
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.35rem' }}>
        {prefix && <span style={{ fontSize: '1.4rem', fontWeight: 700, color: color || 'var(--text-main)' }}>{prefix}</span>}
        <span style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: color || 'var(--text-main)' }}>
          {formattedNumber}
        </span>
        {suffix && <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>{suffix}</span>}
      </div>

      {subtitle && (
        <div style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../i18n/numberToWords';

const CATEGORY_COLORS = {
  Murti: '#f59e0b',
  Mandap: '#e65100',
  Decoration: '#ec4899',
  SoundLight: '#3b82f6',
  Prasad: '#10b981',
  Electricity: '#8b5cf6',
  Security: '#6366f1',
  Visarjan: '#14b8a6',
  Misc: '#64748b'
};

export const ExpenseDonutChart = ({ expenseList }) => {
  const { t } = useLanguage();
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const categoryTotals = {};
  let totalExpense = 0;

  expenseList.forEach((e) => {
    const cat = e.category || 'Misc';
    const amt = Number(e.amount) || 0;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    totalExpense += amt;
  });

  const categories = Object.keys(categoryTotals);

  if (categories.length === 0 || totalExpense === 0) {
    return (
      <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)' }}>
        {t('noRecordsFound')}
      </div>
    );
  }

  // Calculate SVG donut angles
  const size = 180;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const slices = categories.map((cat) => {
    const amount = categoryTotals[cat];
    const percent = amount / totalExpense;
    const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
    const strokeDashoffset = -circumference * accumulatedPercent;
    accumulatedPercent += percent;
    return {
      cat,
      amount,
      percent: Math.round(percent * 100),
      color: CATEGORY_COLORS[cat] || '#f59e0b',
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem', minHeight: '220px' }}>
      {/* Donut SVG */}
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          {slices.map((slice, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              style={{
                cursor: 'pointer',
                transition: 'stroke-width 0.2s, opacity 0.2s',
                opacity: hoveredSlice && hoveredSlice.cat !== slice.cat ? 0.45 : 1
              }}
              onMouseEnter={() => setHoveredSlice(slice)}
              onMouseLeave={() => setHoveredSlice(null)}
            />
          ))}
        </svg>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
            {hoveredSlice ? t(`cat${hoveredSlice.cat}`) : t('dashTotalExpense')}
          </span>
          <span style={{ fontSize: '0.98rem', fontWeight: 800, color: hoveredSlice ? hoveredSlice.color : 'var(--text-main)' }}>
            {hoveredSlice ? `${hoveredSlice.percent}%` : formatCurrency(totalExpense)}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: '240px' }}>
        {slices.map((slice, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredSlice(slice)}
            onMouseLeave={() => setHoveredSlice(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              cursor: 'pointer',
              fontSize: '0.82rem',
              opacity: hoveredSlice && hoveredSlice.cat !== slice.cat ? 0.5 : 1
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: slice.color }} />
              <span style={{ color: 'var(--text-muted)' }}>{t(`cat${slice.cat}`)}</span>
            </div>
            <strong style={{ color: 'var(--text-main)' }}>{slice.percent}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

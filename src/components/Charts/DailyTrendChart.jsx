import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../i18n/numberToWords';

export const DailyTrendChart = ({ pavtiList }) => {
  const { t } = useLanguage();
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Group receipts by date
  const dateMap = {};
  pavtiList.forEach((p) => {
    if (!p.date) return;
    dateMap[p.date] = (dateMap[p.date] || 0) + (Number(p.amount) || 0);
  });

  const sortedDates = Object.keys(dateMap).sort();

  if (sortedDates.length === 0) {
    return (
      <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)' }}>
        {t('noRecordsFound')}
      </div>
    );
  }

  // Chart dimensions
  const width = 600;
  const height = 220;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 40;

  const maxVal = Math.max(...Object.values(dateMap), 1000);
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingTop - paddingBottom;

  const points = sortedDates.map((date, idx) => {
    const val = dateMap[date];
    const x = paddingX + (idx / Math.max(sortedDates.length - 1, 1)) * plotWidth;
    const y = paddingTop + plotHeight - (val / maxVal) * plotHeight;
    return { x, y, date, val };
  });

  // Build SVG path
  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + plotHeight} L ${points[0].x} ${paddingTop + plotHeight} Z`;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff7722" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ff7722" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ff7722" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.33, 0.66, 1].map((ratio, i) => {
          const y = paddingTop + plotHeight * (1 - ratio);
          return (
            <g key={i}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <text x={paddingX - 6} y={y + 4} textAnchor="end" fontSize="10" fill="var(--text-subtle)">
                {Math.round((maxVal * ratio) / 1000)}k
              </text>
            </g>
          );
        })}

        {/* Filled Area */}
        <path d={areaD} fill="url(#areaGradient)" />

        {/* Smooth Line */}
        <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((pt, idx) => (
          <g key={idx} onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)} style={{ cursor: 'pointer' }}>
            <circle cx={pt.x} cy={pt.y} r="5" fill="#fff" stroke="#ff7722" strokeWidth="2.5" />
            {/* Short date labels */}
            <text x={pt.x} y={height - 12} textAnchor="middle" fontSize="10" fill="var(--text-subtle)">
              {pt.date.slice(5)}
            </text>
          </g>
        ))}
      </svg>

      {/* Floating Tooltip */}
      {hoveredPoint && (
        <div
          style={{
            position: 'absolute',
            top: `${(hoveredPoint.y / height) * 100}%`,
            left: `${(hoveredPoint.x / width) * 100}%`,
            transform: 'translate(-50%, -120%)',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--accent-gold-light)',
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{hoveredPoint.date}</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-gold-light)' }}>
            {formatCurrency(hoveredPoint.val)}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../i18n/numberToWords';

export const PaymentModeBarChart = ({ pavtiList }) => {
  const { t } = useLanguage();

  const modes = ['Cash', 'UPI', 'Bank Transfer', 'Cheque'];
  const totals = { Cash: 0, UPI: 0, 'Bank Transfer': 0, Cheque: 0 };
  const counts = { Cash: 0, UPI: 0, 'Bank Transfer': 0, Cheque: 0 };

  let maxAmount = 1000;

  pavtiList.forEach((p) => {
    const m = p.paymentMode || 'Cash';
    const amt = Number(p.amount) || 0;
    if (totals[m] !== undefined) {
      totals[m] += amt;
      counts[m] += 1;
      if (totals[m] > maxAmount) maxAmount = totals[m];
    }
  });

  const modeColors = {
    Cash: '#10b981',
    UPI: '#3b82f6',
    'Bank Transfer': '#a855f7',
    Cheque: '#f59e0b'
  };

  const modeKeyMap = {
    Cash: 'modeCash',
    UPI: 'modeUPI',
    'Bank Transfer': 'modeBank',
    Cheque: 'modeCheque'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', minHeight: '200px' }}>
      {modes.map((mode) => {
        const amt = totals[mode] || 0;
        const count = counts[mode] || 0;
        const percent = Math.round((amt / maxAmount) * 100);
        const color = modeColors[mode];

        return (
          <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                {t(modeKeyMap[mode]) || mode} ({count})
              </span>
              <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(amt)}</strong>
            </div>

            {/* Bar Background Track */}
            <div
              style={{
                width: '100%',
                height: '10px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${percent}%`,
                  height: '100%',
                  borderRadius: '999px',
                  backgroundColor: color,
                  boxShadow: `0 0 10px ${color}88`,
                  transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

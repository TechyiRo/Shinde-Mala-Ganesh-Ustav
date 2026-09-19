import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { StatCard } from '../components/StatCard';
import { DailyTrendChart } from '../components/Charts/DailyTrendChart';
import { ExpenseDonutChart } from '../components/Charts/ExpenseDonutChart';
import { PaymentModeBarChart } from '../components/Charts/PaymentModeBarChart';
import { PavtiModal } from '../components/PavtiModal';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Receipt,
  FilePlus,
  PlusCircle,
  Eye,
  Trophy,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '../i18n/numberToWords';

export const Dashboard = ({ setActiveTab }) => {
  const { t } = useLanguage();
  const { pavtiList, expenseList, totalCollection, totalExpense, balance, pavtiCount } = useData();

  const [selectedPavti, setSelectedPavti] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const handleViewReceipt = (pavti) => {
    setSelectedPavti(pavti);
    setIsReceiptOpen(true);
  };

  // Compute Top 10 Donors
  const topDonors = [...pavtiList]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 10);

  // Recent 5 Pavti
  const recentPavti = pavtiList.slice(0, 5);

  // Recent 5 Expenses
  const recentExpenses = expenseList.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Quick Actions Header Bar */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'clamp(0.85rem, 3vw, 1.35rem)',
          gap: '0.85rem'
        }}
      >
        <div>
          <h2 className="text-page-title" style={{ fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--text-main)' }}>
            {t('navDashboard')}
          </h2>
          <p className="text-subtext-responsive" style={{ color: 'var(--text-subtle)', margin: 0 }}>
            {t('appSubtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('createPavti')} style={{ minHeight: '40px', padding: '0.45rem 0.9rem', fontSize: 'var(--font-btn)' }}>
            <FilePlus size={16} />
            <span>{t('navCreatePavti')}</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('expenses')} style={{ minHeight: '40px', padding: '0.45rem 0.9rem', fontSize: 'var(--font-btn)' }}>
            <PlusCircle size={16} />
            <span>{t('addExpenseBtn')}</span>
          </button>
        </div>
      </div>

      {/* Top Row: 4 3D Glass Stat Cards */}
      <div className="responsive-summary-grid">
        <StatCard
          title={t('dashTotalCollection')}
          value={totalCollection}
          prefix="₹"
          icon={TrendingUp}
          color="#ff7722"
          isCurrency={true}
          subtitle="एकूण देणगी व वर्गणी"
        />
        <StatCard
          title={t('dashTotalExpense')}
          value={totalExpense}
          prefix="₹"
          icon={TrendingDown}
          color="#f43f5e"
          isCurrency={true}
          subtitle="मंडळ उत्सव खर्च"
        />
        <StatCard
          title={t('dashBalance')}
          value={Math.abs(balance)}
          prefix={balance < 0 ? '- ₹' : '₹'}
          icon={Scale}
          color={balance >= 0 ? '#10b981' : '#ef4444'}
          isCurrency={true}
          subtitle={balance >= 0 ? t('dashSurplus') : t('dashDeficit')}
        />
        <StatCard
          title={t('dashTotalPavti')}
          value={pavtiCount}
          icon={Receipt}
          color="#fbbf24"
          subtitle="यशस्वी पावत्या"
        />
      </div>

      {/* Visual Analytics Row: Daily Trend Chart & Donut Chart */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'var(--gap-grid)'
        }}
      >
        {/* Daily Collection Trend */}
        <div className="glass-panel" style={{ padding: 'clamp(0.85rem, 3vw, 1.35rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 className="text-card-title" style={{ fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              {t('chartDailyTrend')}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>२०२६</span>
          </div>
          <DailyTrendChart pavtiList={pavtiList} />
        </div>

        {/* Expense Breakdown Donut */}
        <div className="glass-panel" style={{ padding: 'clamp(0.85rem, 3vw, 1.35rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 className="text-card-title" style={{ fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              {t('chartExpenseBreakdown')}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
              {formatCurrency(totalExpense)}
            </span>
          </div>
          <ExpenseDonutChart expenseList={expenseList} />
        </div>
      </div>

      {/* Payment Modes & Top 10 Donors Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'var(--gap-grid)'
        }}
      >
        {/* Payment Modes Bar Chart */}
        <div className="glass-panel" style={{ padding: 'clamp(0.85rem, 3vw, 1.35rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 className="text-card-title" style={{ fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              {t('chartPaymentModes')}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>पेमेंट प्रकार</span>
          </div>
          <PaymentModeBarChart pavtiList={pavtiList} />
        </div>

        {/* Top 10 Donors Leaderboard */}
        <div className="glass-panel" style={{ padding: 'clamp(0.85rem, 3vw, 1.35rem)', maxHeight: '420px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={20} color="#fbbf24" />
              <h3 className="text-card-title" style={{ fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                {t('topDonors')}
              </h3>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>TOP 10</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {topDonors.map((donor, index) => {
              let badgeClass = '';
              if (index === 0) badgeClass = 'badge-gold';
              else if (index === 1) badgeClass = 'badge-silver';
              else if (index === 2) badgeClass = 'badge-bronze';

              return (
                <div
                  key={donor.id}
                  onClick={() => handleViewReceipt(donor)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: index < 3 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--glass-border)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s, background 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.backgroundColor =
                      index < 3 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.03)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        backgroundColor:
                          index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'rgba(255,255,255,0.1)',
                        color: index < 3 ? '#fff' : 'var(--text-subtle)'
                      }}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {donor.donorName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                        {donor.pavtiNo} • {donor.date}
                      </div>
                    </div>
                  </div>

                  <strong style={{ fontSize: '0.95rem', color: 'var(--accent-gold-light)' }}>
                    {formatCurrency(donor.amount)}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side-by-Side: Recent 5 Pavti & Recent 5 Expenses */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'var(--gap-grid)'
        }}
      >
        {/* Recent 5 Pavti */}
        <div className="glass-panel" style={{ padding: 'clamp(0.85rem, 3vw, 1.35rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 className="text-card-title" style={{ fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              {t('recentPavti')}
            </h3>
            <button
              onClick={() => setActiveTab('managePavti')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              <span>{t('viewAll')}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {recentPavti.map((p) => (
              <div
                key={p.id}
                onClick={() => handleViewReceipt(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--glass-border)',
                  cursor: 'pointer',
                  transition: 'background 0.15s, transform 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {p.donorName}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                    {p.pavtiNo} • {p.date} • {p.paymentMode}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399' }}>
                    {formatCurrency(p.amount)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold-light)' }}>
                    {t(`type${p.donationType}`) || p.donationType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent 5 Expenses */}
        <div className="glass-panel" style={{ padding: 'clamp(0.85rem, 3vw, 1.35rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 className="text-card-title" style={{ fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              {t('recentExpenses')}
            </h3>
            <button
              onClick={() => setActiveTab('expenses')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              <span>{t('viewAll')}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {recentExpenses.map((exp) => (
              <div
                key={exp.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--glass-border)'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {exp.description}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                    {exp.paidTo} • {exp.date} • {t(`cat${exp.category}`)}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f87171' }}>
                    {formatCurrency(exp.amount)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    {exp.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* A5 Printable Receipt Modal */}
      <PavtiModal
        isOpen={isReceiptOpen}
        pavti={selectedPavti}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
};

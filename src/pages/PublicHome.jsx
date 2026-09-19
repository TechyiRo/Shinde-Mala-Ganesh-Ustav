import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { FlowerPetalsCanvas } from '../components/FlowerPetalsCanvas';
import { TiltGlassCard } from '../components/TiltGlassCard';
import { DailyTrendChart } from '../components/Charts/DailyTrendChart';
import { ExpenseDonutChart } from '../components/Charts/ExpenseDonutChart';
import { EventStoriesViewer } from '../components/EventStoriesViewer';
import { EventPostCard } from '../components/EventPostCard';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Receipt,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  Calendar,
  Clock,
  Sparkles,
  ChevronDown,
  Trophy,
  Image as ImageIcon,
  X,
  Lock,
  ArrowRight,
  Sun,
  Moon,
  Languages,
  Radio
} from 'lucide-react';
import { formatCurrency } from '../i18n/numberToWords';

export const PublicHome = ({ onOpenAdminPortal, onOpenLogin }) => {
  const { lang, toggleLang, t } = useLanguage();
  const { mandalSettings, pavtiList, expenseList, eventList = [], totalCollection, totalExpense, balance, pavtiCount, theme, toggleTheme } = useData();
  const [isStoriesViewerOpen, setIsStoriesViewerOpen] = useState(false);
  const [selectedDayStory, setSelectedDayStory] = useState(1);
  const [selectedPublicEventCat, setSelectedPublicEventCat] = useState('');
  const { user } = useAuth();

  // Target Budget (e.g., ₹2,50,000)
  const targetBudget = 250000;
  const targetPercent = Math.min(100, Math.round((totalCollection / targetBudget) * 100));

  // Live Visarjan Countdown (Anant Chaturdashi 2026: Sept 25, 2026 17:00:00)
  const [timeLeft, setTimeLeft] = useState({ days: 6, hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    const targetDate = new Date('2026-09-25T17:00:00');

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Public Pavti Filters & Privacy Masking
  const [pavtiSearch, setPavtiSearch] = useState('');
  const [selectedDonationType, setSelectedDonationType] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [pavtiPage, setPavtiPage] = useState(1);
  const pavtiPageSize = 10;

  // Extract distinct areas for filter
  const distinctAreas = useMemo(() => {
    const areas = new Set();
    pavtiList.forEach((p) => {
      if (p.address) {
        const parts = p.address.split(',');
        const areaName = parts[parts.length - 1].trim() || parts[0].trim();
        if (areaName) areas.add(areaName);
      }
    });
    return Array.from(areas);
  }, [pavtiList]);

  // Masking helper for privacy:
  // Mobile numbers are NEVER shown publicly; addresses only show area/locality
  const getMaskedAddress = (address) => {
    if (!address) return 'स्थानिक परिसर (Local)';
    const parts = address.split(',');
    return parts.length > 1 ? parts[parts.length - 1].trim() : address.replace(/घर क्र\..*?,|प्लॉट क्र\..*?,/gi, '').trim() || 'शिंदे मळा';
  };

  const filteredPublicPavti = useMemo(() => {
    return pavtiList.filter((p) => {
      if (selectedDonationType && p.donationType !== selectedDonationType) return false;
      if (selectedArea && !(p.address || '').includes(selectedArea)) return false;
      if (pavtiSearch.trim()) {
        const query = pavtiSearch.toLowerCase();
        const matchesName = (p.donorName || '').toLowerCase().includes(query);
        const matchesPavtiNo = (p.pavtiNo || '').toLowerCase().includes(query);
        if (!matchesName && !matchesPavtiNo) return false;
      }
      return true;
    });
  }, [pavtiList, selectedDonationType, selectedArea, pavtiSearch]);

  const paginatedPublicPavti = useMemo(() => {
    const start = (pavtiPage - 1) * pavtiPageSize;
    return filteredPublicPavti.slice(start, start + pavtiPageSize);
  }, [filteredPublicPavti, pavtiPage]);

  // Public Expenses Filters
  const [expenseSearch, setExpenseSearch] = useState('');
  const [selectedExpenseCat, setSelectedExpenseCat] = useState('');
  const [viewingBillPhoto, setViewingBillPhoto] = useState(null);

  const filteredPublicExpenses = useMemo(() => {
    return expenseList.filter((e) => {
      if (selectedExpenseCat && e.category !== selectedExpenseCat) return false;
      if (expenseSearch.trim()) {
        const query = expenseSearch.toLowerCase();
        const matchesDesc = (e.description || '').toLowerCase().includes(query);
        const matchesPaidTo = (e.paidTo || '').toLowerCase().includes(query);
        if (!matchesDesc && !matchesPaidTo) return false;
      }
      return true;
    });
  }, [expenseList, selectedExpenseCat, expenseSearch]);

  // Top Donors for Wall
  const topDonors = useMemo(() => {
    return [...pavtiList]
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 10);
  }, [pavtiList]);

  // Marquee donors
  const marqueeDonors = useMemo(() => {
    return pavtiList.slice(0, 15);
  }, [pavtiList]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Falling Flower Petals Particle Canvas */}
      <FlowerPetalsCanvas />

      {/* Sticky Top Public Glass Navbar */}
      <nav
        className="glass-panel no-print"
        style={{
          position: 'sticky',
          top: '1rem',
          margin: '1rem auto',
          maxWidth: '1280px',
          width: 'calc(100% - 2rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.5rem',
          borderRadius: 'var(--radius-xl)',
          zIndex: 100,
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)'
        }}
      >
        {/* Mandal Brand with Halo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img
            src="/logo.png"
            onError={(e) => {
              e.target.src = '/ganesh-icon.svg';
            }}
            alt="Mandal Logo"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              filter: 'drop-shadow(0 2px 10px rgba(230, 81, 0, 0.45))',
              objectFit: 'cover'
            }}
          />
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {mandalSettings.mandalName || t('appTitle')}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold-light)', fontWeight: 600 }}>
              {t('publicPortalTitle')}
            </div>
          </div>
        </div>

        {/* Section Quick Jump Links (Desktop) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }} className="desktop-links">
          <button
            onClick={() => scrollToSection('summary-section')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}
          >
            {t('navDashboard')}
          </button>
          <button
            onClick={() => scrollToSection('public-pavti-section')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}
          >
            {t('navManagePavti')}
          </button>
          <button
            onClick={() => scrollToSection('public-events-section')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}
          >
            {t('navEvents')}
          </button>
          <button
            onClick={() => scrollToSection('public-expenses-section')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}
          >
            {t('navExpenses')}
          </button>
          <button
            onClick={() => scrollToSection('donor-wall-section')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}
          >
            {t('topDonors')}
          </button>
        </div>

        {/* Right Controls: Lang, Theme & Admin Portal */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button onClick={toggleLang} className="btn btn-secondary btn-sm" title="Switch Language">
            <Languages size={15} color="#f59e0b" />
            <span>{lang === 'mr' ? 'English' : 'मराठी'}</span>
          </button>

          <button onClick={toggleTheme} className="btn btn-secondary btn-icon btn-sm" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#6366f1" />}
          </button>

          {user ? (
            <button className="btn btn-primary btn-sm" onClick={onOpenAdminPortal}>
              <ShieldCheck size={16} />
              <span>{t('navDashboard')} (Admin)</span>
            </button>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={onOpenLogin}>
              <Lock size={15} color="var(--primary-light)" />
              <span>{t('adminLoginLink')}</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main Container */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem 4rem', position: 'relative', zIndex: 1 }}>
        {/* ================================================================= */}
        {/* 1. HERO SECTION */}
        {/* ================================================================= */}
        <section
          style={{
            minHeight: '75vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '3rem 1rem 2rem',
            position: 'relative'
          }}
        >
          {/* Glowing Halo Murti / Logo */}
          <div
            style={{
              position: 'relative',
              width: '150px',
              height: '150px',
              margin: '0 auto 1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Halo Glow Pulse */}
            <div
              style={{
                position: 'absolute',
                inset: '-15px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, rgba(230, 81, 0, 0.2) 50%, transparent 75%)',
                filter: 'blur(16px)',
                animation: 'floatOrb 6s ease-in-out infinite alternate'
              }}
            />
            <img
              src="/logo.png"
              onError={(e) => {
                e.target.src = '/ganesh-icon.svg';
              }}
              alt="Ganesh Logo"
              style={{
                width: '135px',
                height: '135px',
                borderRadius: '50%',
                border: '3px solid rgba(251, 191, 36, 0.75)',
                boxShadow: '0 0 35px rgba(230, 81, 0, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.3)',
                objectFit: 'cover',
                position: 'relative',
                zIndex: 2
              }}
            />
          </div>

          {/* Devotion Tagline */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1.1rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: 'var(--accent-gold-light)',
              fontSize: '0.9rem',
              fontWeight: 700,
              marginBottom: '1rem',
              letterSpacing: '0.04em'
            }}
          >
            <Sparkles size={16} />
            <span>{mandalSettings.tagline || '॥ श्री गणेशाय नमः ॥ गणपती बाप्पा मोरया'}</span>
          </div>

          {/* Mandal Name in Prominent Devanagari Typography */}
          <h1
            style={{
              fontSize: 'clamp(2.1rem, 5vw, 3.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: '1.2',
              color: 'var(--text-main)',
              maxWidth: '960px',
              margin: '0 auto 0.75rem',
              textShadow: '0 4px 20px rgba(230, 81, 0, 0.25)'
            }}
          >
            {mandalSettings.mandalName || t('mandalDefaultName')}
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '750px', margin: '0 auto 2rem' }}>
            {t('publicPortalSubtitle')}
          </p>

          {/* Live Visarjan Countdown Box */}
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem 2rem',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.85rem',
              maxWidth: '620px',
              width: '100%',
              margin: '0 auto 2.5rem',
              border: '1px solid rgba(251, 191, 36, 0.4)',
              boxShadow: '0 16px 40px -10px rgba(230, 81, 0, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold-light)', fontWeight: 700, fontSize: '0.95rem' }}>
              <Clock size={18} />
              <span>{t('visarjanCountdownTitle')} (अनंत चतुर्दशी २०२६)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', width: '100%' }}>
              {[
                { val: timeLeft.days, label: t('days') },
                { val: timeLeft.hours, label: t('hours') },
                { val: timeLeft.minutes, label: t('minutes') },
                { val: timeLeft.seconds, label: t('seconds') }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.25rem',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-gold-light)', lineHeight: 1.1 }}>
                    {String(item.val).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600, marginTop: '2px' }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Down Bounce Indicator */}
          <div
            onClick={() => scrollToSection('summary-section')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              color: 'var(--accent-gold-light)',
              animation: 'bounce 2s infinite'
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>तपशील पहा (Explore Transparency)</span>
            <ChevronDown size={22} />
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. LIVE SUMMARY 3D TILT CARDS (HEADLINE NUMBERS) */}
        {/* ================================================================= */}
        <section id="summary-section" style={{ scrollMarginTop: '6rem', marginBottom: '3.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.35rem' }}>
              थोडक्यात जमाखर्च स्थिती (Live Financial Snapshot)
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-subtle)', margin: 0 }}>
              प्रत्येक पावती व खर्च नोंदीनुसार स्वयंचलित अपडेट होणारा लाइव्ह हिशोब
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}
          >
            <TiltGlassCard
              title={t('dashTotalCollection')}
              value={totalCollection}
              prefix="₹"
              icon={TrendingUp}
              color="#ff7722"
              isCurrency={true}
              subtitle="एकूण देणगी व वर्गणी जमा"
            />
            <TiltGlassCard
              title={t('dashTotalExpense')}
              value={totalExpense}
              prefix="₹"
              icon={TrendingDown}
              color="#f43f5e"
              isCurrency={true}
              subtitle="मंडळ अधिकृत खर्च"
            />
            <TiltGlassCard
              title={t('dashBalance')}
              value={Math.abs(balance)}
              prefix={balance < 0 ? '- ₹' : '₹'}
              icon={Scale}
              color={balance >= 0 ? '#10b981' : '#ef4444'}
              isCurrency={true}
              subtitle={balance >= 0 ? t('dashSurplus') : t('dashDeficit')}
            />
            <TiltGlassCard
              title={t('dashTotalPavti')}
              value={pavtiCount}
              icon={Receipt}
              color="#fbbf24"
              subtitle="अधिकृत देणगी पावत्या"
            />
          </div>

          {/* 3. Target Collection Progress Bar */}
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem 2rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(251, 191, 36, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {t('targetTitle')}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', marginLeft: '0.5rem' }}>
                  ({t('targetGoal')}: {formatCurrency(targetBudget)})
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong style={{ fontSize: '1.15rem', color: 'var(--accent-gold-light)' }}>
                  {formatCurrency(totalCollection)}
                </strong>
                <span
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    fontSize: '0.82rem',
                    fontWeight: 800
                  }}
                >
                  {targetPercent}% {t('targetAchieved')}
                </span>
              </div>
            </div>

            {/* Glowing Gradient Progress Track */}
            <div
              style={{
                width: '100%',
                height: '14px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)'
              }}
            >
              <div
                style={{
                  width: `${targetPercent}%`,
                  height: '100%',
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, #ff7722 0%, #f59e0b 50%, #10b981 100%)',
                  boxShadow: '0 0 14px rgba(245, 158, 11, 0.7)',
                  transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* THANK YOU MARQUEE RIBBON */}
        {/* ================================================================= */}
        <div
          className="glass-panel"
          style={{
            padding: '0.85rem 1rem',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            marginBottom: '3.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(251, 191, 36, 0.25)',
            backgroundColor: 'rgba(245, 158, 11, 0.08)'
          }}
        >
          <div style={{ display: 'inline-block', animation: 'marqueeScroll 28s linear infinite' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-gold-light)' }}>
              {t('thankYouMarquee')} &nbsp;&nbsp;&nbsp;
              {marqueeDonors.map((d, i) => (
                <span key={i} style={{ color: 'var(--text-main)', margin: '0 0.85rem' }}>
                  ★ {d.donorName} ({formatCurrency(d.amount)})
                </span>
              ))}
            </span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 4. PUBLIC PAVTI TRANSPARENCY SECTION */}
        {/* ================================================================= */}
        <section id="public-pavti-section" style={{ scrollMarginTop: '6rem', marginBottom: '3.5rem' }}>
          <div
            className="glass-panel"
            style={{
              padding: '1.75rem 2rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.35rem' }}>
                सर्व देणगी पावत्या (Public Pavti Ledger)
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', margin: 0 }}>
                {t('publicPrivacyNote')}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(230, 81, 0, 0.15)',
                  color: '#ff7722',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              >
                {filteredPublicPavti.length} पावत्या उपलब्ध
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="देणगीदाराचे नाव किंवा पावती क्र. शोधा..."
                  value={pavtiSearch}
                  onChange={(e) => {
                    setPavtiSearch(e.target.value);
                    setPavtiPage(1);
                  }}
                />
              </div>

              {/* Donation Type */}
              <select
                className="form-select"
                value={selectedDonationType}
                onChange={(e) => {
                  setSelectedDonationType(e.target.value);
                  setPavtiPage(1);
                }}
              >
                <option value="">{t('filterAllTypes')}</option>
                <option value="Vargani">{t('typeVargani')}</option>
                <option value="Denagi">{t('typeDenagi')}</option>
                <option value="Navas">{t('typeNavas')}</option>
                <option value="Other">{t('typeOther')}</option>
              </select>

              {/* Area Filter */}
              <select
                className="form-select"
                value={selectedArea}
                onChange={(e) => {
                  setSelectedArea(e.target.value);
                  setPavtiPage(1);
                }}
              >
                <option value="">{t('allAreas')}</option>
                {distinctAreas.map((area, idx) => (
                  <option key={idx} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Public Pavti Table (Desktop) & Cards (Mobile) */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
            <div className="table-container">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>{t('pavtiNo')}</th>
                    <th>{t('date')}</th>
                    <th>{t('donorName')}</th>
                    <th>{t('addressArea')} (परिसर)</th>
                    <th>{t('donationType')}</th>
                    <th style={{ textAlign: 'right' }}>{t('amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPublicPavti.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-subtle)' }}>
                        {t('noRecordsFound')}
                      </td>
                    </tr>
                  ) : (
                    paginatedPublicPavti.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong style={{ color: 'var(--accent-gold-light)' }}>{p.pavtiNo}</strong>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{p.date}</td>
                        <td style={{ fontWeight: 700 }}>{p.donorName}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {getMaskedAddress(p.address)}
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(245, 158, 11, 0.15)',
                              color: 'var(--accent-gold-light)',
                              fontSize: '0.82rem',
                              fontWeight: 600
                            }}
                          >
                            {t(`type${p.donationType}`) || p.donationType}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#34d399', fontSize: '1rem' }}>
                          {formatCurrency(p.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredPublicPavti.length > pavtiPageSize && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '1.25rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--glass-border)'
                }}
              >
                <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
                  पान {pavtiPage} पैकी {Math.ceil(filteredPublicPavti.length / pavtiPageSize)}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPavtiPage((prev) => Math.max(1, prev - 1))}
                    disabled={pavtiPage === 1}
                  >
                    मागे (Prev)
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPavtiPage((prev) => prev + 1)}
                    disabled={pavtiPage * pavtiPageSize >= filteredPublicPavti.length}
                  >
                    पुढे (Next)
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 5. PUBLIC EXPENSES TRANSPARENCY SECTION */}
        {/* ================================================================= */}
        
        {/* ================================================================= */}
        {/* INSTAGRAM-STYLE FESTIVAL EVENTS & STORIES FEED */}
        {/* ================================================================= */}
        <section id="public-events-section" style={{ scrollMarginTop: '6rem', marginBottom: '3.5rem' }}>
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem 2rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff7722', marginBottom: '0.25rem' }}>
                <Radio size={20} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  थेट क्षणचित्रे व अपडेट्स (LIVE MOMENTS)
                </span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
                {t('eventsFeedTitle')}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', margin: 0 }}>
                {t('eventsFeedSubtitle')}
              </p>
            </div>
          </div>

          {/* Stories Circular Row (Day 1 ... Day 11) with Glowing Saffron-Gold Rings */}
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem 1.5rem',
              marginBottom: '1.75rem',
              overflowX: 'auto',
              scrollbarWidth: 'none'
            }}
          >
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-gold-light)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={15} />
              <span>{t('storiesTitle')} — स्टोरी पाहण्यासाठी टॅप करा</span>
            </div>

            <div style={{ display: 'flex', gap: '1.1rem', alignItems: 'center' }}>
              {Array.from({ length: 11 }, (_, i) => i + 1).map((dayNum) => {
                const dayEvent = eventList.find((e) => Number(e.dayNumber) === dayNum);
                const isDayLive = dayEvent && (dayEvent.status === 'Live' || dayEvent.status === 'Live Now');

                return (
                  <div
                    key={dayNum}
                    onClick={() => {
                      setSelectedDayStory(dayNum);
                      setIsStoriesViewerOpen(true);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        padding: '2.5px',
                        background: isDayLive
                          ? 'linear-gradient(135deg, #ef4444, #f59e0b)'
                          : 'linear-gradient(135deg, #ff7722, #fbbf24, #d97706)',
                        boxShadow: isDayLive
                          ? '0 0 16px rgba(239, 68, 68, 0.7)'
                          : '0 0 14px rgba(251, 191, 36, 0.45)',
                        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          backgroundColor: '#1a0b12',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}
                      >
                        <img
                          src={dayEvent && dayEvent.media && dayEvent.media.length > 0 ? dayEvent.media[0].url : '/logo.png'}
                          onError={(e) => { e.target.src = '/ganesh-icon.svg'; }}
                          alt={'Day ' + dayNum}
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      </div>
                    </div>

                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isDayLive ? '#f87171' : 'var(--text-main)' }}>
                      दिवस {dayNum} {isDayLive ? '🔴' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Filter Pills for Feed */}
          <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                className="chip-btn"
                onClick={() => setSelectedPublicEventCat('')}
                style={{
                  backgroundColor: selectedPublicEventCat === '' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedPublicEventCat === '' ? '#fff' : 'var(--text-muted)'
                }}
              >
                सर्व क्षणचित्रे (All Posts)
              </button>
              {['आरती', 'महाप्रसाद', 'सांस्कृतिक कार्यक्रम', 'स्पर्धा', 'मिरवणूक'].map((cat) => (
                <button
                  key={cat}
                  className="chip-btn"
                  onClick={() => setSelectedPublicEventCat(cat)}
                  style={{
                    backgroundColor: selectedPublicEventCat === cat ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedPublicEventCat === cat ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Instagram Post Feed List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {eventList
              .filter((evt) => (selectedPublicEventCat ? evt.category === selectedPublicEventCat : true))
              .sort((a, b) => {
                const aLive = a.status === 'Live' || a.status === 'Live Now';
                const bLive = b.status === 'Live' || b.status === 'Live Now';
                if (aLive && !bLive) return -1;
                if (!aLive && bLive) return 1;
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return (b.dayNumber || 0) - (a.dayNumber || 0);
              })
              .map((evt) => (
                <EventPostCard key={evt.id} event={evt} />
              ))}
          </div>
        </section>

        {/* Stories Viewer Modal */}
        <EventStoriesViewer
          isOpen={isStoriesViewerOpen}
          initialDay={selectedDayStory}
          stories={eventList}
          onClose={() => setIsStoriesViewerOpen(false)}
        />

        <section id="public-expenses-section" style={{ scrollMarginTop: '6rem', marginBottom: '3.5rem' }}>
          <div
            className="glass-panel"
            style={{
              padding: '1.75rem 2rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.35rem' }}>
                उत्सव खर्च पारदर्शकता (Public Expense Transparency)
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', margin: 0 }}>
                मंडळाच्या प्रत्येक अधिकृत खर्चाचा तपशील, संबंधित दुकानदार/कारागीर व बिल फोटो
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              >
                {filteredPublicExpenses.length} खर्च नोंदी ({formatCurrency(totalExpense)})
              </span>
            </div>
          </div>

          {/* Category Chips */}
          <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button
                className="chip-btn"
                onClick={() => setSelectedExpenseCat('')}
                style={{
                  backgroundColor: selectedExpenseCat === '' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedExpenseCat === '' ? '#fff' : 'var(--text-muted)'
                }}
              >
                सर्व खर्च (All)
              </button>
              {['Decoration', 'Murti', 'SoundLight', 'Prasad', 'Mandap', 'Electricity', 'Security', 'Misc'].map((cat) => (
                <button
                  key={cat}
                  className="chip-btn"
                  onClick={() => setSelectedExpenseCat(cat)}
                  style={{
                    backgroundColor: selectedExpenseCat === cat ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedExpenseCat === cat ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  {t(`cat${cat}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Expense Table */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
            <div className="table-container">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>{t('date')}</th>
                    <th>{t('category')}</th>
                    <th>{t('description')}</th>
                    <th>{t('paidTo')} (दुकानदार/व्यक्ती)</th>
                    <th style={{ textAlign: 'right' }}>{t('amount')}</th>
                    <th style={{ textAlign: 'center' }}>बिल फोटो</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPublicExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-subtle)' }}>
                        {t('noRecordsFound')}
                      </td>
                    </tr>
                  ) : (
                    filteredPublicExpenses.map((e) => (
                      <tr key={e.id}>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{e.date}</td>
                        <td>
                          <span
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(230, 81, 0, 0.15)',
                              color: '#ff7722',
                              fontSize: '0.82rem',
                              fontWeight: 600
                            }}
                          >
                            {t(`cat${e.category}`) || e.category}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{e.description}</td>
                        <td style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{e.paidTo}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#f87171', fontSize: '1rem' }}>
                          {formatCurrency(e.amount)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {e.billPhoto ? (
                            <button
                              className="btn btn-secondary btn-icon btn-sm"
                              onClick={() => setViewingBillPhoto(e.billPhoto)}
                              title={t('viewPhoto')}
                            >
                              <ImageIcon size={15} color="#10b981" />
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 6. VISUAL BREAKDOWN CHARTS */}
        {/* ================================================================= */}
        <section style={{ marginBottom: '3.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.35rem' }}>
              आलेख व आर्थिक विश्लेषण (Visual Analytics)
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-subtle)', margin: 0 }}>
              दैनिक जमा व खर्च विभागणीचे थेट सादरीकरण
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {/* Daily Trend */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
                {t('chartDailyTrend')}
              </h3>
              <DailyTrendChart pavtiList={pavtiList} />
            </div>

            {/* Expense Donut */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
                {t('chartExpenseBreakdown')}
              </h3>
              <ExpenseDonutChart expenseList={expenseList} />
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 7. DONOR WALL (देणगीदार गौरव भिंत) */}
        {/* ================================================================= */}
        <section id="donor-wall-section" style={{ scrollMarginTop: '6rem', marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', marginBottom: '0.4rem' }}>
              <Trophy size={24} />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                सर्वोच्च देणगीदार
              </span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.35rem' }}>
              {t('donorWallTitle')}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-subtle)', margin: 0 }}>
              {t('donorWallSubtitle')}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {topDonors.map((donor, idx) => {
              const isTop3 = idx < 3;
              const medalColor = idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'var(--primary)';

              return (
                <div
                  key={donor.id}
                  className="glass-panel"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: isTop3 ? `1px solid ${medalColor}66` : '1px solid var(--glass-border)',
                    backgroundColor: isTop3 ? `${medalColor}11` : 'var(--glass-bg)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: medalColor,
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${medalColor}66`
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                        {donor.donorName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                        {getMaskedAddress(donor.address)}
                      </div>
                    </div>
                  </div>

                  <strong style={{ fontSize: '1.1rem', color: 'var(--accent-gold-light)' }}>
                    {formatCurrency(donor.amount)}
                  </strong>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ================================================================= */}
      {/* 8. PUBLIC FOOTER */}
      {/* ================================================================= */}
      <footer
        className="glass-panel no-print"
        style={{
          borderTop: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          padding: '3rem 2rem 2rem',
          maxWidth: '1280px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
            marginBottom: '2.5rem'
          }}
        >
          {/* Col 1: Mandal Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <img src="/logo.png" onError={(e) => { e.target.src = '/ganesh-icon.svg'; }} alt="Logo" style={{ width: '40px', height: '40px' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                {mandalSettings.mandalName || t('appTitle')}
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
              {mandalSettings.regNo || 'नोंदणी क्र. महा/१२४५/२०१२'}<br />
              {mandalSettings.address || 'शिंदे मळा, हिंगणी Dumala, शिंदे मळा, ४१२२१०'}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--accent-gold-light)', fontWeight: 600 }}>
              संपर्क: {mandalSettings.contact || '9822012345'}
            </p>
          </div>

          {/* Col 2: Committee Members */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              कार्यकारी पदाधिकारी २०२६
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <li><strong>अध्यक्ष:</strong> {mandalSettings.president || 'श्री. तुषार शिंदे'}</li>
              <li><strong>खजिनदार:</strong> {mandalSettings.treasurer || 'श्री. तुकाराम शिंदे व श्री. धनंजय शिंदे'}</li>
              <li><strong>कार्यवाह:</strong> {mandalSettings.secretary || 'श्री. मानस शिंदे'}</li>
            </ul>
          </div>

          {/* Col 3: Quick Links & Transparency */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              पारदर्शकता हमी
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', lineHeight: 1.6 }}>
              शिंदे मळा गणेश उत्सव मंडळाची सर्व जमा व खर्चाची नोंद डिजिटल स्वरूपात सुरक्षित ठेवली जाते. कोणत्याही देणगीदारास आपली पावती ऑनलाइन तपासता येते.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.8rem',
            color: 'var(--text-subtle)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            © २०२६ {mandalSettings.mandalName || 'शिंदे मळा गणेश उत्सव मंडळ'}. सर्व हक्क राखीव.
          </div>

          {/* Subtle Admin Login Link in the corner */}
          <div>
            {user ? (
              <button
                onClick={onOpenAdminPortal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-gold-light)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.82rem'
                }}
              >
                🔐 व्यवस्थापन पोर्टल (Admin Dashboard)
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  cursor: 'pointer',
                  fontSize: '0.82rem'
                }}
              >
                🔒 {t('adminLoginLink')}
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Bill Photo Lightbox */}
      {viewingBillPhoto && (
        <div className="modal-overlay" onClick={() => setViewingBillPhoto(null)}>
          <div className="modal-content" style={{ maxWidth: '600px', padding: '1rem' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <button onClick={() => setViewingBillPhoto(null)} style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>
            <img src={viewingBillPhoto} alt="Bill Photo" style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: '12px', objectFit: 'contain' }} />
          </div>
        </div>
      )}
    </div>
  );
};

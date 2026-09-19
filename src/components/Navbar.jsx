import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Sun, Moon, Languages, LogOut, ShieldCheck, UserCheck } from 'lucide-react';

export const Navbar = ({ onBackToPublic }) => {
  const { lang, toggleLang, t } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme, mandalSettings } = useData();

  return (
    <header
      className="glass-panel navbar-container no-print"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'clamp(0.5rem, 2vw, 0.9rem) clamp(0.65rem, 2.5vw, 1.25rem)',
        marginBottom: '1rem',
        borderRadius: 'var(--radius-lg)',
        gap: '0.5rem',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Left: Mandal Title & Icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.45rem, 1.8vw, 0.75rem)', minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}>
        <img
          src="/ganesh-icon.svg"
          alt="Ganesh Logo"
          style={{
            width: 'clamp(32px, 7vw, 40px)',
            height: 'clamp(32px, 7vw, 40px)',
            filter: 'drop-shadow(0 2px 8px rgba(230, 81, 0, 0.4))',
            flexShrink: 0
          }}
        />
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <h1
            style={{
              fontSize: 'clamp(0.88rem, 2.8vw, 1.15rem)',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              lineHeight: '1.2',
              color: 'var(--text-main)',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {mandalSettings.mandalName || t('appTitle')}
          </h1>
          <p
            className="mobile-hide-subtitle"
            style={{
              fontSize: 'var(--font-subtext)',
              color: 'var(--text-subtle)',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {t('appSubtitle')}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.3rem, 1.2vw, 0.6rem)', flexShrink: 0 }}>
        {/* Back to Public Transparency View Button */}
        {onBackToPublic && (
          <button
            onClick={onBackToPublic}
            className="btn btn-secondary btn-sm"
            title={t('publicViewLink')}
            style={{
              padding: '0.35rem 0.55rem',
              fontSize: 'var(--font-subtext)',
              borderColor: 'rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              backgroundColor: 'rgba(16, 185, 129, 0.12)'
            }}
          >
            <ShieldCheck size={14} color="#34d399" />
            <span className="hide-on-mobile-xs">{t('publicViewLink')}</span>
            <span className="show-on-mobile-xs">अहवाल</span>
          </button>
        )}

        {/* Language Toggle */}
        <button
          onClick={toggleLang}
          className="btn btn-secondary btn-sm"
          title="Switch Language"
          style={{ padding: '0.35rem 0.55rem', fontSize: 'var(--font-subtext)' }}
        >
          <Languages size={14} color="#f59e0b" />
          <span>{lang === 'mr' ? 'EN' : 'मराठी'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-icon"
          title={theme === 'dark' ? t('themeLight') : t('themeDark')}
          style={{ width: '34px', height: '34px', padding: 0 }}
        >
          {theme === 'dark' ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#6366f1" />}
        </button>

        {/* User Role Badge */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.3rem 0.55rem',
              borderRadius: '999px',
              backgroundColor: isAdmin ? 'rgba(230, 81, 0, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              border: `1px solid ${isAdmin ? 'rgba(230, 81, 0, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
              fontSize: 'var(--font-subtext)',
              fontWeight: 700,
              color: isAdmin ? '#ff7722' : '#60a5fa'
            }}
          >
            {isAdmin ? <ShieldCheck size={14} /> : <UserCheck size={14} />}
            <span className="hide-on-mobile-xs">{isAdmin ? t('roleBadgeAdmin') : t('roleBadgeMember')}</span>
          </div>
        )}

        {/* Logout Button */}
        {user && (
          <button
            onClick={logout}
            className="btn btn-secondary btn-icon"
            title={t('logout')}
            style={{ color: '#ef4444', width: '34px', height: '34px', padding: 0 }}
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </header>
  );
};

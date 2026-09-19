import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Sun, Moon, Languages, LogOut, ShieldCheck, UserCheck } from 'lucide-react';

export const Navbar = () => {
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
        padding: 'clamp(0.6rem, 2.2vw, 1rem) clamp(0.75rem, 3vw, 1.5rem)',
        marginBottom: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        gap: '0.75rem'
      }}
    >
      {/* Left: Mandal Title & Icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 0.85rem)', minWidth: 0, flex: '1 1 auto' }}>
        <img
          src="/ganesh-icon.svg"
          alt="Ganesh Logo"
          style={{
            width: 'clamp(32px, 8vw, 42px)',
            height: 'clamp(32px, 8vw, 42px)',
            filter: 'drop-shadow(0 2px 8px rgba(230, 81, 0, 0.4))',
            flexShrink: 0
          }}
        />
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: 'clamp(0.95rem, 3.2vw, 1.2rem)',
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
          <p style={{ fontSize: 'var(--font-subtext)', color: 'var(--text-subtle)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {t('appSubtitle')}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.35rem, 1.5vw, 0.75rem)', flexShrink: 0 }}>
        {/* Language Toggle */}
        <button
          onClick={toggleLang}
          className="btn btn-secondary btn-sm"
          title="Switch Language (मराठी / English)"
          style={{ padding: '0.35rem 0.65rem', fontSize: 'var(--font-subtext)' }}
        >
          <Languages size={15} color="#f59e0b" />
          <span>{lang === 'mr' ? 'EN' : 'मराठी'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-icon"
          title={theme === 'dark' ? t('themeLight') : t('themeDark')}
          style={{ width: '36px', height: '36px', padding: 0 }}
        >
          {theme === 'dark' ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#6366f1" />}
        </button>

        {/* User Role Badge */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '999px',
              backgroundColor: isAdmin ? 'rgba(230, 81, 0, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              border: `1px solid ${isAdmin ? 'rgba(230, 81, 0, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
              fontSize: 'var(--font-subtext)',
              fontWeight: 700,
              color: isAdmin ? '#ff7722' : '#60a5fa'
            }}
          >
            {isAdmin ? <ShieldCheck size={15} /> : <UserCheck size={15} />}
            <span>{isAdmin ? t('roleBadgeAdmin') : t('roleBadgeMember')}</span>
          </div>
        )}

        {/* Logout Button */}
        {user && (
          <button
            onClick={logout}
            className="btn btn-secondary btn-icon"
            title={t('logout')}
            style={{ color: '#ef4444', width: '36px', height: '36px', padding: 0 }}
          >
            <LogOut size={17} />
          </button>
        )}
      </div>
    </header>
  );
};

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
        padding: '0.85rem 1.5rem',
        marginBottom: '1.5rem',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      {/* Left: Mandal Title & Icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <img
          src="/ganesh-icon.svg"
          alt="Ganesh Logo"
          style={{
            width: '42px',
            height: '42px',
            filter: 'drop-shadow(0 2px 8px rgba(230, 81, 0, 0.4))'
          }}
        />
        <div>
          <h1
            style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              lineHeight: '1.2',
              color: 'var(--text-main)',
              margin: 0
            }}
          >
            {mandalSettings.mandalName || t('appTitle')}
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', margin: 0 }}>
            {t('appSubtitle')}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Language Toggle */}
        <button
          onClick={toggleLang}
          className="btn btn-secondary btn-sm"
          title="Switch Language (मराठी / English)"
          style={{ minWidth: '95px' }}
        >
          <Languages size={16} color="#f59e0b" />
          <span>{lang === 'mr' ? 'English' : 'मराठी'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-icon"
          title={theme === 'dark' ? t('themeLight') : t('themeDark')}
        >
          {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
        </button>

        {/* User Role Badge */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              backgroundColor: isAdmin ? 'rgba(230, 81, 0, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              border: `1px solid ${isAdmin ? 'rgba(230, 81, 0, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
              fontSize: '0.82rem',
              fontWeight: 700,
              color: isAdmin ? '#ff7722' : '#60a5fa'
            }}
          >
            {isAdmin ? <ShieldCheck size={16} /> : <UserCheck size={16} />}
            <span>{isAdmin ? t('roleBadgeAdmin') : t('roleBadgeMember')}</span>
          </div>
        )}

        {/* Logout Button */}
        {user && (
          <button
            onClick={logout}
            className="btn btn-secondary btn-icon"
            title={t('logout')}
            style={{ color: '#ef4444' }}
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </header>
  );
};

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FilePlus, ListOrdered, Wallet, Settings, Globe, Calendar } from 'lucide-react';
import { DeveloperBadge } from './DeveloperBadge';

export const Sidebar = ({ activeTab, setActiveTab, onBackToPublic }) => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard', label: t('navDashboard'), shortLabel: 'डॅशबोर्ड', icon: LayoutDashboard },
    { id: 'createPavti', label: t('navCreatePavti'), shortLabel: 'पावती +', icon: FilePlus, highlight: true },
    { id: 'managePavti', label: t('navManagePavti'), shortLabel: 'यादी', icon: ListOrdered },
    { id: 'expenses', label: t('navExpenses'), shortLabel: 'खर्च', icon: Wallet },
    { id: 'events', label: t('navEvents'), shortLabel: 'कार्यक्रम', icon: Calendar },
    { id: 'settings', label: t('navSettings'), shortLabel: 'सेटिंग्ज', icon: Settings }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="desktop-sidebar glass-panel no-print"
        style={{
          position: 'fixed',
          top: '1.5rem',
          left: '1.5rem',
          bottom: '1.5rem',
          width: '240px',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem 1rem',
          zIndex: 800,
          borderRadius: 'var(--radius-xl)'
        }}
      >
        {/* Brand header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0 0.5rem 1.25rem',
            borderBottom: '1px solid var(--glass-border)',
            marginBottom: '1.25rem'
          }}
        >
          <img
            src="/logo.png"
            onError={(e) => {
              e.target.src = '/ganesh-icon.svg';
            }}
            alt="Logo"
            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--accent-gold-light)', lineHeight: 1.2 }}>
              गणेश उत्सव
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
              पावती प्रणाली २०२६
            </div>
          </div>
        </div>

        {/* Back to Public Transparency View Button */}
        {onBackToPublic && (
          <button
            onClick={onBackToPublic}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              marginBottom: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'transform 0.15s, background 0.15s'
            }}
            title="Return to Public Transparency View"
          >
            <Globe size={16} />
            <span>{t('publicViewLink')}</span>
          </button>
        )}

        {/* Navigation list */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: isActive
                    ? '1px solid var(--primary-light)'
                    : '1px solid transparent',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(230,81,0,0.3) 0%, rgba(217,119,6,0.2) 100%)'
                    : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.92rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  boxShadow: isActive ? '0 4px 14px rgba(230,81,0,0.25)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                <Icon
                  size={19}
                  color={isActive ? '#fbbf24' : item.highlight ? '#ff7722' : 'currentColor'}
                />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.highlight && !isActive && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-light)',
                      boxShadow: '0 0 8px var(--primary-light)'
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Footer Mantra */}
        <div
          style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(230, 81, 0, 0.1)',
            border: '1px solid rgba(230, 81, 0, 0.2)',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-gold-light)' }}>
            ॥ गणपती बाप्पा मोरया ॥
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
            मंगळमूर्ती मोरया
          </div>
        </div>

        {/* Animated Compact Developer Credit */}
        <DeveloperBadge compact={true} />
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav-bar no-print">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                background: 'none',
                border: 'none',
                color: isActive ? 'var(--accent-gold-light)' : 'var(--text-subtle)',
                fontSize: 'clamp(0.6rem, 2vw, 0.72rem)',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                padding: '0.2rem 0.2rem',
                minWidth: 0,
                flex: '1 1 0',
                overflow: 'hidden'
              }}
            >
              <Icon size={18} color={isActive ? 'var(--accent-gold-light)' : 'currentColor'} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', lineHeight: 1.1 }}>
                {item.shortLabel || item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

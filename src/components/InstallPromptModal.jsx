import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Download, X, WifiOff, Sparkles, Smartphone } from 'lucide-react';

export const InstallPromptModal = () => {
  const { lang, t } = useLanguage();
  const { isOnline } = useData();

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if dismissed previously within 3 days
    const dismissedAt = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissedAt) {
      const days = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (days < 3) return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show after 3.5 seconds
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers without direct prompt
      alert(lang === 'mr' ? 'आपल्या ब्राउझरच्या मेनूवरून "Add to Home Screen" निवडा.' : 'Select "Add to Home Screen" from your browser menu.');
      setShowInstallPrompt(false);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', String(Date.now()));
  };

  return (
    <>
      {/* 1. Offline Mode Sticky Banner */}
      {!isOnline && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 4000,
            backgroundColor: 'rgba(239, 68, 68, 0.92)',
            backdropFilter: 'blur(12px)',
            color: '#fff',
            padding: '0.5rem 1rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
          }}
        >
          <WifiOff size={16} />
          <span>{t('offlineBanner')}</span>
        </div>
      )}

      {/* 2. Custom Glass Bottom Sheet Install Prompt */}
      {showInstallPrompt && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 2rem)',
            maxWidth: '480px',
            zIndex: 2200,
            animation: 'modalScaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(230, 81, 0, 0.4)',
              border: '1.5px solid rgba(251, 191, 36, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src="/logo.png"
                  onError={(e) => { e.target.src = '/ganesh-icon.svg'; }}
                  alt="Logo"
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 2px' }}>
                    {t('pwaInstallTitle')}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', margin: 0, lineHeight: 1.4 }}>
                    {t('pwaInstallSubtitle')}
                  </p>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleDismiss}>
                {t('dismissBtn')}
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleInstallClick}>
                <Smartphone size={16} />
                <span>{t('installBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { Dashboard } from './pages/Dashboard';
import { CreatePavti } from './pages/CreatePavti';
import { ManagePavti } from './pages/ManagePavti';
import { Expenses } from './pages/Expenses';
import { ManageEvents } from './pages/ManageEvents';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { PublicHome } from './pages/PublicHome';
import { InstallPromptModal } from './components/InstallPromptModal';
import { GaneshWelcomeIntro } from './components/GaneshWelcomeIntro';
import { Globe, Plus, FilePlus } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

export const App = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();

  // Ganesh Welcome Intro state (Shown once per browser session on initial open)
  const [showWelcomeIntro, setShowWelcomeIntro] = useState(() => {
    try {
      return !sessionStorage.getItem('shinde_welcome_shown');
    } catch {
      return false;
    }
  });

  // Mode: 'public' | 'admin' | 'login'
  // Default landing view is the public portal
  const [viewMode, setViewMode] = useState('public');
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleIntroComplete = () => {
    try {
      sessionStorage.setItem('shinde_welcome_shown', 'true');
    } catch {}
    setShowWelcomeIntro(false);
    setViewMode('public');
  };

  const handleOpenAdminPortal = () => {
    if (user) {
      setViewMode('admin');
    } else {
      setViewMode('login');
    }
  };

  const handleOpenLogin = () => {
    setViewMode('login');
  };

  const handleBackToPublic = () => {
    setViewMode('public');
  };

  return (
    <>
      {/* Animated Festive Mesh Background with Floating Glow Orbs */}
      <div className="mesh-background" />

      {/* Lord Ganesha Divine Welcome Intro Animation Screen */}
      {showWelcomeIntro && (
        <GaneshWelcomeIntro onComplete={handleIntroComplete} />
      )}
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />
      <div className="floating-orb orb-3" />

      {/* Slide-in Toasts */}
      <Toast />

      {/* PWA Install Prompt & Offline Detection Banner */}
      <InstallPromptModal />

      {/* View Switching */}
      {viewMode === 'public' && (
        <PublicHome
          onOpenAdminPortal={handleOpenAdminPortal}
          onOpenLogin={handleOpenLogin}
        />
      )}

      {viewMode === 'login' && (
        <div style={{ position: 'relative' }}>
          {/* Top Return to Public View Button */}
          <div
            style={{
              position: 'fixed',
              top: '1.5rem',
              left: '1.5rem',
              zIndex: 100
            }}
          >
            <button className="btn btn-secondary btn-sm" onClick={handleBackToPublic}>
              <Globe size={16} color="var(--primary-light)" />
              <span>← {t('publicViewLink')}</span>
            </button>
          </div>
          <Login onLoginSuccess={() => setViewMode('public')} />
        </div>
      )}

      {viewMode === 'admin' && (
        <div className="app-layout">
          {/* Sidebar & Mobile Bottom Nav */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onBackToPublic={handleBackToPublic}
          />

          {/* Main App Content Area */}
          <main className="main-content">
            <Navbar onBackToPublic={handleBackToPublic} />

            {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
            {activeTab === 'createPavti' && <CreatePavti />}
            {activeTab === 'managePavti' && <ManagePavti />}
            {activeTab === 'expenses' && <Expenses />}
            {activeTab === 'events' && <ManageEvents />}
            {activeTab === 'settings' && <Settings />}
          </main>
        </div>
      )}
    </>
  );
};

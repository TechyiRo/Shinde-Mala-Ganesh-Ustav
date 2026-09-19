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
import { Globe, Plus, FilePlus } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

export const App = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();

  // Mode: 'public' | 'admin' | 'login'
  const [viewMode, setViewMode] = useState('public');
  const [activeTab, setActiveTab] = useState('dashboard');

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
          <Login onLoginSuccess={() => setViewMode('admin')} />
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
            {/* Header with Switch to Public View & Mandal Brand */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleBackToPublic}
                title="View Public Transparency Portal"
              >
                <Globe size={15} color="#10b981" />
                <span>{t('publicViewLink')}</span>
              </button>
            </div>

            <Navbar />

            {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
            {activeTab === 'createPavti' && <CreatePavti />}
            {activeTab === 'managePavti' && <ManagePavti />}
            {activeTab === 'expenses' && <Expenses />}
            {activeTab === 'events' && <ManageEvents />}
            {activeTab === 'settings' && <Settings />}

            {/* Mobile Floating Action Button (FAB) for quick receipt creation */}
            {isAdmin && activeTab !== 'createPavti' && (
              <button
                className="btn btn-primary btn-icon mobile-fab no-print"
                onClick={() => setActiveTab('createPavti')}
                title="नवीन पावती तयार करा"
                style={{
                  position: 'fixed',
                  bottom: '5rem',
                  right: '1.5rem',
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  zIndex: 850,
                  boxShadow: '0 8px 24px rgba(230, 81, 0, 0.5), 0 0 20px rgba(251, 191, 36, 0.4)'
                }}
              >
                <FilePlus size={24} />
              </button>
            )}
          </main>
        </div>
      )}
    </>
  );
};

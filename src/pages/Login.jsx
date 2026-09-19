import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Lock, User, Sparkles } from 'lucide-react';

export const Login = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const { mandalSettings, addToast } = useData();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const res = login(username, password);
    if (res.success) {
      addToast(t('loginSuccess'), 'success');
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      setError(t(res.error) || 'Invalid login');
      addToast(t(res.error) || 'Invalid login', 'error');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Mandal Brand Icon */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/logo.png"
            onError={(e) => {
              e.target.src = '/ganesh-icon.svg';
            }}
            alt="Ganesh Logo"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              objectFit: 'cover',
              filter: 'drop-shadow(0 4px 16px rgba(230, 81, 0, 0.45))',
              marginBottom: '0.75rem'
            }}
          />
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.35rem' }}>
            {mandalSettings.mandalName || t('appTitle')}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-subtle)', margin: 0 }}>
            {t('loginSubtitle')}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">
              <User size={15} />
              <span>{t('username')}</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">
              <Lock size={15} />
              <span>{t('password')}</span>
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                textAlign: 'center'
              }}
            >
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}>
            <Sparkles size={18} />
            <span>{t('loginBtn')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

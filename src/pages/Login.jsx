import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { ShieldCheck, UserCheck, Lock, User, Sparkles } from 'lucide-react';

export const Login = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const { mandalSettings, addToast } = useData();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('ganpati2026');
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

  const setPreset = (role) => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('ganpati2026');
    } else {
      setUsername('member');
      setPassword('member123');
    }
    setError('');
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
          maxWidth: '460px',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Mandal Brand Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
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

        {/* Quick Role Fillers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setPreset('admin')}
            style={{
              borderColor: username === 'admin' ? 'var(--primary-light)' : 'var(--glass-border)',
              backgroundColor: username === 'admin' ? 'rgba(230, 81, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <ShieldCheck size={16} color="#ff7722" />
            <span>{t('adminRole')}</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setPreset('member')}
            style={{
              borderColor: username === 'member' ? '#60a5fa' : 'var(--glass-border)',
              backgroundColor: username === 'member' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <UserCheck size={16} color="#60a5fa" />
            <span>{t('memberRole')}</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <User size={15} />
              <span>{t('username')}</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin / member"
              required
            />
          </div>

          <div className="form-group">
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
              required
            />
          </div>

          {error && (
            <div
              style={{
                padding: '0.6rem 0.85rem',
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            <Sparkles size={18} />
            <span>{t('loginBtn')}</span>
          </button>
        </form>

        {/* Credentials hints */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--glass-border)',
            fontSize: '0.78rem',
            color: 'var(--text-subtle)',
            textAlign: 'center',
            lineHeight: '1.6'
          }}
        >
          <div><strong>Admin:</strong> admin / ganpati2026</div>
          <div><strong>Committee:</strong> member / member123</div>
        </div>
      </div>
    </div>
  );
};

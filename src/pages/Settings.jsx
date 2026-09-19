import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  Save,
  Download,
  RotateCcw,
  Trash2,
  Building,
  FileCheck,
  User,
  Phone,
  Calendar,
  AlertTriangle,
  Database,
  CheckCircle2
} from 'lucide-react';

export const Settings = () => {
  const { lang, t } = useLanguage();
  const {
    mandalSettings,
    updateSettings,
    resetToSampleData,
    clearAllData,
    pavtiList,
    expenseList,
    addToast,
    isMongoConnected
  } = useData();
  const { isAdmin } = useAuth();

  const [formData, setFormData] = useState({ ...mandalSettings });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast(t('readOnlyWarning'), 'error');
      return;
    }
    updateSettings(formData);
    addToast(t('toastSettingsSaved'), 'success');
  };

  // Download JSON Backup
  const handleDownloadBackup = () => {
    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      mandalSettings,
      pavtiList,
      expenseList
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `Ganesh_Mandal_Backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast(t('toastBackupDownloaded'), 'success');
  };

  const handleResetSample = () => {
    if (!isAdmin) {
      addToast(t('readOnlyWarning'), 'error');
      return;
    }
    if (window.confirm(t('dataResetConfirm'))) {
      resetToSampleData();
      setFormData(mandalSettings);
      addToast(t('toastDataRestored'), 'success');
    }
  };

  const handleClearAll = () => {
    if (!isAdmin) {
      addToast(t('readOnlyWarning'), 'error');
      return;
    }
    if (window.confirm('तुम्हाला खात्री आहे का? सर्व पावत्या आणि खर्च नोंदी नष्ट होतील!')) {
      clearAllData();
      addToast('सर्व डेटा नष्ट करण्यात आला आहे.', 'info');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Settings Header */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '16px',
                backgroundColor: 'rgba(230, 81, 0, 0.18)',
                border: '1px solid rgba(230, 81, 0, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff7722'
              }}
            >
              <SettingsIcon size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {t('settingsTitle')}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', margin: '2px 0 0' }}>
                मंडळ माहिती, पावती मजकूर आणि डेटाबेस क्लाउड जोडणी
              </p>
            </div>
          </div>

          {/* Cloud Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '999px',
              backgroundColor: isMongoConnected ? 'rgba(46, 125, 50, 0.15)' : 'rgba(230, 81, 0, 0.15)',
              border: `1px solid ${isMongoConnected ? 'rgba(46, 125, 50, 0.4)' : 'rgba(230, 81, 0, 0.4)'}`,
              color: isMongoConnected ? '#4caf50' : '#ff9800',
              fontSize: '0.82rem',
              fontWeight: 700
            }}
          >
            <Database size={15} />
            <span>{isMongoConnected ? 'MongoDB Atlas Live' : 'Offline / Local Cache'}</span>
          </div>
        </div>
      </div>

      {/* MongoDB Atlas Details Card */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(0, 30, 15, 0.3) 0%, rgba(10, 15, 25, 0.4) 100%)',
          border: '1px solid rgba(76, 175, 80, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#4caf50',
                boxShadow: '0 0 10px #4caf50'
              }}
            />
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#81c784' }}>
              MongoDB Atlas Cloud Connected
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>
            Cluster: cluster0.cosetsy.mongodb.net
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.7rem', color: '#9e9e9e' }}>DATABASE</div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>ganesh_utsav</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.7rem', color: '#9e9e9e' }}>COLLECTIONS</div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>pavtis, expenses, events, settings</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.7rem', color: '#9e9e9e' }}>STATUS</div>
            <div style={{ fontWeight: 700, color: '#4caf50', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> Active & Synced
            </div>
          </div>
        </div>
      </div>

      {/* Mandal Information Form */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--accent-gold-light)' }}>
          {t('generalSettings')}
        </h3>

        <form onSubmit={handleSaveSettings}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                <Building size={15} />
                <span>{t('mandalNameLabel')} (मराठी)</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.mandalName || ''}
                onChange={(e) => handleInputChange('mandalName', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Building size={15} />
                <span>{t('mandalNameLabel')} (English)</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.mandalNameEn || ''}
                onChange={(e) => handleInputChange('mandalNameEn', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                <FileCheck size={15} />
                <span>{t('regNoLabel')}</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.regNo || ''}
                onChange={(e) => handleInputChange('regNo', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={15} />
                <span>उत्सव वर्ष (Year)</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.year || '2026'}
                onChange={(e) => handleInputChange('year', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                <User size={15} />
                <span>{t('presidentLabel')}</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.president || ''}
                onChange={(e) => handleInputChange('president', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <User size={15} />
                <span>{t('treasurerLabel')}</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.treasurer || ''}
                onChange={(e) => handleInputChange('treasurer', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Phone size={15} />
                <span>{t('contactLabel')}</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.contact || ''}
                onChange={(e) => handleInputChange('contact', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="submit" className="btn btn-primary" disabled={!isAdmin} style={{ opacity: isAdmin ? 1 : 0.5 }}>
              <Save size={16} />
              <span>{t('saveSettings')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Data Management & Backup */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--accent-gold-light)' }}>
          {t('dataManagement')}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--glass-border)',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t('downloadBackup')}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                सर्व पावत्या, खर्च व सेटिंग्ज संगणकात JSON स्वरूपात सुरक्षित ठेवा
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleDownloadBackup}>
              <Download size={16} color="#3b82f6" />
              <span>डाउनलोड बॅकअप</span>
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--glass-border)',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t('resetSampleData')}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                शिंदे मळा गणेश उत्सव २०२६ चे मूळ नमुना रेकॉर्ड्स पुन्हा लोड करा
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleResetSample} disabled={!isAdmin}>
              <RotateCcw size={16} color="#f59e0b" />
              <span>{t('resetSampleData')}</span>
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f87171' }}>{t('clearAllData')}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                सर्व पावत्या आणि खर्चाचा डेटा त्वरित साफ करा
              </div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={handleClearAll} disabled={!isAdmin}>
              <Trash2 size={16} />
              <span>{t('clearAllData')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

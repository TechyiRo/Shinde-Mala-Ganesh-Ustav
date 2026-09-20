import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from './ConfirmModal';
import {
  Clock,
  PlusCircle,
  Pin,
  Trash2,
  Sparkles,
  RefreshCw,
  Eye,
  Heart,
  Upload,
  X,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

export const AdminStatusManager = () => {
  const { lang, t } = useLanguage();
  const {
    statusList = [],
    activeStatuses = [],
    createStatus,
    deleteStatus,
    togglePinStatus,
    reActivateStatus,
    compressImage,
    addToast
  } = useData();
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // New Status Form State
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    category: 'Ganesh Utsav 2026',
    customCategory: '',
    dayNumber: 1,
    isPinned: false,
    media: []
  });

  // Calculate expired statuses from statusList
  const now = Date.now();
  const expiredStatuses = statusList.filter((s) => {
    if (s.isActive === false || s.status === 'Expired') return true;
    if (s.expiresAt && new Date(s.expiresAt).getTime() <= now) return true;
    return false;
  });

  const handleOpenCreateModal = () => {
    if (!isAdmin) {
      addToast(t('readOnlyWarning'), 'error');
      return;
    }
    setFormData({
      title: '',
      caption: '',
      category: 'Ganesh Utsav 2026',
      customCategory: '',
      dayNumber: 1,
      isPinned: false,
      media: []
    });
    setIsModalOpen(true);
  };

  // Image / Media Upload with client compression
  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    try {
      const newMedia = [];
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const compressed = await compressImage(file, 1920, 0.90);
          newMedia.push({
            type: 'image',
            url: compressed,
            name: file.name
          });
        } else if (file.type.startsWith('video/')) {
          const reader = new FileReader();
          const p = new Promise((resolve) => {
            reader.onload = (ev) => {
              resolve({
                type: 'video',
                url: ev.target.result,
                name: file.name
              });
            };
            reader.readAsDataURL(file);
          });
          const vid = await p;
          newMedia.push(vid);
        }
      }
      setFormData((prev) => ({
        ...prev,
        media: [...prev.media, ...newMedia]
      }));
    } catch (err) {
      addToast('माध्यम अपलोड करताना त्रुटी आली: ' + err.message, 'error');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveMedia = (index) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!formData.title.trim()) {
      addToast('कृपया स्टेटसचे शीर्षक प्रविष्ट करा', 'error');
      return;
    }

    if (formData.media.length === 0) {
      addToast('कृपया किमान एक फोटो किंवा व्हिडिओ निवडा', 'error');
      return;
    }

    const finalCategory = formData.category === 'Other' && formData.customCategory.trim()
      ? formData.customCategory.trim()
      : (formData.category || 'Ganesh Utsav 2026');

    try {
      await createStatus({
        title: formData.title.trim(),
        caption: formData.caption.trim(),
        category: finalCategory,
        dayNumber: Number(formData.dayNumber) || 1,
        isPinned: formData.isPinned,
        media: formData.media
      });
      setIsModalOpen(false);
    } catch (err) {
      addToast('स्टेटस जतन करताना त्रुटी आली: ' + err.message, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      await deleteStatus(deleteTargetId);
      setDeleteTargetId(null);
      setIsConfirmDeleteOpen(false);
    }
  };

  // Remaining time calculation helper
  const getRemainingTimeData = (expiresAt) => {
    if (!expiresAt) return { text: 'काही मिनिटे', isUrgent: false, isWarning: false };
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (diffMs <= 0) {
      return { text: 'कालबाह्य (Expired)', isUrgent: true, isExpired: true };
    }
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let text = '';
    if (hours > 0) {
      text = `${hours} तास ${minutes} मि. शिल्लक`;
    } else {
      text = `${minutes} मिनिटे शिल्लक`;
    }

    return {
      text,
      isExpired: false,
      isUrgent: hours < 2,
      isWarning: hours >= 2 && hours < 6
    };
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('mr-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        day: 'numeric',
        month: 'short'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner & Quick Add Status */}
      <div
        className="glass-panel no-print"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'clamp(0.85rem, 3vw, 1.35rem)',
          gap: '1rem',
          background: 'linear-gradient(135deg, rgba(230, 81, 0, 0.18), rgba(20, 11, 26, 0.95))'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sparkles size={18} color="var(--accent-gold-light)" />
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>
              २४-तास थेट स्टेटस व स्टोरीज व्यवस्थापन
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
            दिवसभरात कितीही स्टेटस अपलोड करा. प्रत्येक स्टेटस बरोबर २४ तासांनंतर आपोआप कालबाह्य होईल.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="btn btn-primary"
          style={{
            padding: '0.55rem 1.25rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <PlusCircle size={18} />
          <span>नवीन स्टेटस जोडा (Upload Status)</span>
        </button>
      </div>

      {/* Subtabs: Active vs Expired History */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          style={{
            padding: '0.5rem 1.15rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: activeTab === 'active' ? '1.5px solid var(--accent-gold-light)' : '1px solid rgba(255,255,255,0.1)',
            background: activeTab === 'active' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'active' ? '#fff' : 'var(--text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <span>सक्रिय स्टेटस (Active Stories)</span>
          <span
            style={{
              padding: '0.1rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              background: activeTab === 'active' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)',
              color: '#fff'
            }}
          >
            {activeStatuses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          style={{
            padding: '0.5rem 1.15rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: activeTab === 'history' ? '1.5px solid var(--accent-gold-light)' : '1px solid rgba(255,255,255,0.1)',
            background: activeTab === 'history' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'history' ? '#fff' : 'var(--text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <span>कालबाह्य इतिहास (Expired History)</span>
          <span
            style={{
              padding: '0.1rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              background: activeTab === 'history' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)',
              color: '#fff'
            }}
          >
            {expiredStatuses.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. ACTIVE STATUSES GRID */}
      {/* ========================================================================= */}
      {activeTab === 'active' && (
        <>
          {activeStatuses.length === 0 ? (
            <div
              className="glass-panel"
              style={{
                padding: '3rem 1.5rem',
                textAlign: 'center',
                color: 'var(--text-muted)'
              }}
            >
              <Clock size={40} color="var(--primary-light)" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ margin: '0 0 0.35rem', color: 'var(--text-main)' }}>सध्या कोणताही सक्रिय स्टेटस नाही</h4>
              <p style={{ margin: '0 0 1.25rem', fontSize: '0.88rem' }}>
                नवीन फोटो किंवा व्हिडिओ स्टेटस अपलोड करण्यासाठी वरील बटणावर क्लिक करा.
              </p>
              <button className="btn btn-secondary btn-sm" onClick={handleOpenCreateModal}>
                <PlusCircle size={16} />
                <span>पहिला स्टेटस जोडा</span>
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.25rem'
              }}
            >
              {activeStatuses.map((status) => {
                const rem = getRemainingTimeData(status.expiresAt);
                const mediaItem = status.media && status.media[0];

                return (
                  <div
                    key={status.id}
                    className="glass-panel"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      border: status.isPinned ? '1.5px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.1)',
                      position: 'relative',
                      background: 'rgba(20, 11, 26, 0.75)'
                    }}
                  >
                    {/* Media Thumbnail with Instagram-style aspect */}
                    <div style={{ position: 'relative', width: '100%', height: '220px', backgroundColor: '#0f050d' }}>
                      {mediaItem && mediaItem.type === 'video' ? (
                        <video
                          src={mediaItem.url}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          muted
                        />
                      ) : (
                        <img
                          src={mediaItem ? mediaItem.url : '/logo.png'}
                          alt={status.title}
                          onError={(e) => {
                            e.target.src = '/logo.png';
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}

                      {/* Remaining Time Countdown Badge */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '0.65rem',
                          left: '0.65rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          backdropFilter: 'blur(8px)',
                          background: rem.isUrgent
                            ? 'rgba(239, 68, 68, 0.92)'
                            : rem.isWarning
                            ? 'rgba(245, 158, 11, 0.92)'
                            : 'rgba(16, 185, 129, 0.92)',
                          color: '#fff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                        }}
                      >
                        <Clock size={12} />
                        <span>⏳ {rem.text}</span>
                      </div>

                      {/* Pinned Badge */}
                      {status.isPinned && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '0.65rem',
                            right: '0.65rem',
                            background: '#fbbf24',
                            color: '#000',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '999px',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <Pin size={11} />
                          <span>पिन</span>
                        </div>
                      )}

                      {/* Category and Day Badge */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '0.65rem',
                          left: '0.65rem',
                          display: 'flex',
                          gap: '0.35rem'
                        }}
                      >
                        <span
                          style={{
                            background: 'rgba(230, 81, 0, 0.85)',
                            color: '#fff',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backdropFilter: 'blur(4px)'
                          }}
                        >
                          📁 {status.category || 'Ganesh Utsav 2026'}
                        </span>
                        <span
                          style={{
                            background: 'rgba(0, 0, 0, 0.75)',
                            color: 'var(--accent-gold-light)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}
                        >
                          दिवस {status.dayNumber || 1}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {status.title}
                      </h4>

                      {status.caption && (
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-subtle)', lineHeight: 1.4 }}>
                          {status.caption}
                        </p>
                      )}

                      {/* Exact Upload and Expiry Timestamps */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                          padding: '0.5rem 0.75rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>अपलोड वेळ:</span>
                          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                            {formatDateTime(status.createdAt)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>कालबाह्य वेळ:</span>
                          <span style={{ color: '#fbbf24', fontWeight: 600 }}>
                            {formatDateTime(status.expiresAt)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          marginTop: 'auto',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => togglePinStatus(status.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                          title={status.isPinned ? 'पिन काढा' : 'वर पिन करा'}
                        >
                          <Pin size={13} color={status.isPinned ? '#fbbf24' : 'inherit'} />
                          <span>{status.isPinned ? 'अनपिन' : 'पिन करा'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTargetId(status.id);
                            setIsConfirmDeleteOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.6rem', color: '#f87171' }}
                          title="स्टेटस हटवा"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. EXPIRED HISTORY SECTION */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <>
          {expiredStatuses.length === 0 ? (
            <div
              className="glass-panel"
              style={{
                padding: '3rem 1.5rem',
                textAlign: 'center',
                color: 'var(--text-muted)'
              }}
            >
              <CheckCircle2 size={40} color="#10b981" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ margin: '0 0 0.35rem', color: 'var(--text-main)' }}>कालबाह्य झालेला स्टेटस इतिहास उपलब्ध नाही</h4>
              <p style={{ margin: 0, fontSize: '0.88rem' }}>
                २४ तास पूर्ण झालेले सर्व स्टेटस येथे आपोआप सुरक्षित जतन केले जातात.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.25rem'
              }}
            >
              {expiredStatuses.map((status) => {
                const mediaItem = status.media && status.media[0];

                return (
                  <div
                    key={status.id}
                    className="glass-panel"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      opacity: 0.85,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      background: 'rgba(15, 8, 20, 0.7)'
                    }}
                  >
                    <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: '#0a0309' }}>
                      <img
                        src={mediaItem ? mediaItem.url : '/logo.png'}
                        alt={status.title}
                        onError={(e) => {
                          e.target.src = '/logo.png';
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.3)' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '0.65rem',
                          left: '0.65rem',
                          background: 'rgba(239, 68, 68, 0.9)',
                          color: '#fff',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}
                      >
                        ✓ कालबाह्य (Expired)
                      </div>
                    </div>

                    <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {status.title}
                      </h4>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                        <div>अपलोड: {formatDateTime(status.createdAt)}</div>
                        <div style={{ color: '#f87171' }}>कालबाह्य: {formatDateTime(status.expiresAt)}</div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginTop: 'auto',
                          paddingTop: '0.5rem'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => reActivateStatus(status.id)}
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                          title="पुन्हा २४ तासांसाठी सक्रिय करा"
                        >
                          <RefreshCw size={13} />
                          <span>पुन्हा सक्रिय करा (24h)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTargetId(status.id);
                            setIsConfirmDeleteOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.6rem', color: '#f87171' }}
                          title="कायमचे हटवा"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. CREATE NEW STATUS MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(10px)',
            padding: '1rem'
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.5rem',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              border: '1.5px solid rgba(251, 191, 36, 0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="var(--accent-gold-light)" />
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                  नवीन २४-तास स्टेटस जोडा
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-secondary btn-icon btn-sm"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Status Category */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  कॅटेगरी / स्टोरी ग्रुप (Status Category) *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <select
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem' }}
                  >
                    <option value="Ganesh Utsav 2026">Ganesh Utsav 2026</option>
                    <option value="Ganesh Chaturthi">Ganesh Chaturthi</option>
                    <option value="Aarti">Aarti (आरती)</option>
                    <option value="Mahaprasad">Mahaprasad (महाप्रसाद)</option>
                    <option value="Visarjan">Visarjan (विसर्जन)</option>
                    <option value="Cultural Events">Cultural Events (सांस्कृतिक कार्यक्रम)</option>
                    <option value="Other">+ इतर नवीन कॅटेगरी (Custom Category)</option>
                  </select>

                  {formData.category === 'Other' && (
                    <input
                      type="text"
                      placeholder="नवीन कॅटेगरीचे नाव लिहा (उदा. मिरवणूक २०२६)"
                      className="form-control"
                      value={formData.customCategory}
                      onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.9rem' }}
                      required
                    />
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
                  पब्लिक डॅशबोर्डवर प्रत्येक कॅटेगरीसाठी एकच Story Card दिसेल आणि क्लिक केल्यावर त्यातील सर्व स्टेटस दिसतील.
                </div>
              </div>

              {/* Status Title */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  स्टेटसचे शीर्षक (Status Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. सकाळची महाआरती व गणेश दर्शन"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
                />
              </div>

              {/* Status Caption */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  वर्णन / संदेश (Caption / Message)
                </label>
                <textarea
                  rows={2}
                  placeholder="उदा. सर्व भक्तांचे हार्दिक स्वागत! बाप्पाच्या आरतीचे पवित्र दर्शन घ्या."
                  className="form-control"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              {/* Festival Day Selector */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  उत्सवाचा दिवस (Festival Day)
                </label>
                <select
                  className="form-control"
                  value={formData.dayNumber}
                  onChange={(e) => setFormData({ ...formData, dayNumber: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem' }}
                >
                  {Array.from({ length: 11 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      दिवस {d} (Day {d})
                    </option>
                  ))}
                </select>
              </div>

              {/* Media Upload (Photo/Video) */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>फोटो किंवा व्हिडिओ (Photo / Video) *</span>
                  {isCompressing && <span style={{ color: '#fbbf24', fontSize: '0.78rem' }}>आकार अनुकूल करत आहे...</span>}
                </label>

                <div
                  style={{
                    border: '2px dashed rgba(251, 191, 36, 0.4)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaUpload}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                  <Upload size={28} color="var(--primary-light)" style={{ marginBottom: '0.35rem' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    क्लिक करा किंवा फोटो/व्हिडिओ ड्रॅग करा
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    PNG, JPG, MP4 (स्वयंचलित कम्प्रेशनसह)
                  </div>
                </div>

                {/* Uploaded Media Thumbnails */}
                {formData.media.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.65rem' }}>
                    {formData.media.map((m, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          width: '70px',
                          height: '70px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid rgba(251, 191, 36, 0.5)'
                        }}
                      >
                        <img
                          src={m.url}
                          alt="preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(idx)}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            background: 'rgba(0,0,0,0.75)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pin to Top Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0' }}>
                <input
                  type="checkbox"
                  id="statusPinned"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="statusPinned" style={{ fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                  📌 हा स्टेटस सर्वात वर पिन करा (Pin to Top)
                </label>
              </div>

              {/* 24-Hour Expiry Info Note */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: '#fef08a'
                }}
              >
                <Clock size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
                <span>
                  हा स्टेटस प्रसिद्ध झाल्यापासून बरोबर <strong>२४ तासांनंतर</strong> आपोआप कालबाह्य होईल.
                </span>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={isCompressing}
                  className="btn btn-primary"
                  style={{ minWidth: '130px' }}
                >
                  {isCompressing ? 'कम्प्रेशिंग...' : 'प्रसिद्ध करा (Publish)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        title="स्टेटस हटवायचा आहे का?"
        message="तुम्हाला खात्री आहे का की हा स्टेटस हटवायचा आहे? ही कृती पूर्ववत केली जाऊ शकत नाही."
        confirmText="होय, हटवा"
        cancelText="रद्द करा"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteTargetId(null);
          setIsConfirmDeleteOpen(false);
        }}
      />
    </div>
  );
};

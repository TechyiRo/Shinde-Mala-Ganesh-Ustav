import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Trophy,
  Users,
  Award,
  Crown,
  PlusCircle,
  Trash2,
  Upload,
  X,
  Check,
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';

export const ManageCompetitionsModal = ({ competition, onClose }) => {
  const { createCompetition, updateCompetition, addToast, compressImage } = useData();
  const { t } = useLanguage();

  const isCreatingNew = !competition?.id || Boolean(competition?.isNew);

  const [activeTab, setActiveTab] = useState(isCreatingNew ? 'details' : 'winners'); // 'winners' | 'organizers' | 'details'

  // Local Form State
  const [formData, setFormData] = useState({
    title: isCreatingNew ? '' : (competition?.title || ''),
    subtitle: isCreatingNew ? '' : (competition?.subtitle || ''),
    date: competition?.date || new Date().toISOString().split('T')[0],
    time: competition?.time || 'सायंकाळी ०६:०० ते रात्री १०:००',
    venue: competition?.venue || 'मुख्य सांस्कृतिक रंगमंच, शिंदे मळा गणेश मंडप',
    description: isCreatingNew ? '' : (competition?.description || ''),
    organizers: Array.isArray(competition?.organizers) ? [...competition.organizers] : [],
    winners: Array.isArray(competition?.winners) ? [...competition.winners] : []
  });

  const [isUploading, setIsUploading] = useState(false);

  // ================= ORGANIZERS HANDLERS =================
  const handleAddOrganizer = () => {
    const newOrg = {
      id: `ORG-${Date.now()}`,
      name: '',
      role: 'आयोजक / सूत्रसंचालक',
      photo: ''
    };
    setFormData((prev) => ({
      ...prev,
      organizers: [...prev.organizers, newOrg]
    }));
  };

  const handleUpdateOrganizer = (idx, field, value) => {
    setFormData((prev) => {
      const next = [...prev.organizers];
      next[idx] = { ...next[idx], [field]: value };
      return { ...prev, organizers: next };
    });
  };

  const handleDeleteOrganizer = (idx) => {
    setFormData((prev) => ({
      ...prev,
      organizers: prev.organizers.filter((_, i) => i !== idx)
    }));
  };

  const handleOrganizerPhotoUpload = async (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const compressed = await compressImage(file, 800, 0.85);
      handleUpdateOrganizer(idx, 'photo', compressed);
      addToast('फोटो यशस्वीरित्या जोडला!', 'success');
    } catch (err) {
      addToast('फोटो अपलोड करताना त्रुटी आली.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // ================= WINNERS HANDLERS =================
  const handleAddWinner = () => {
    const nextRank = formData.winners.length + 1;
    let rankLabel = `${nextRank}रा क्रमांक`;
    if (nextRank === 1) rankLabel = '🥇 प्रथम क्रमांक (मानाची पैठणी विजेती)';
    else if (nextRank === 2) rankLabel = '🥈 द्वितीय क्रमांक';
    else if (nextRank === 3) rankLabel = '🥉 तृतीय क्रमांक';

    const newWinner = {
      id: `WIN-${Date.now()}`,
      rank: nextRank,
      rankLabel,
      name: '',
      prize: nextRank === 1 ? 'मानाची शुद्ध जरी पैठणी साडी + मानाचा चषक 🏆' : 'आकर्षक भेटवस्तू संच 🎁',
      photo: '',
      notes: ''
    };
    setFormData((prev) => ({
      ...prev,
      winners: [...prev.winners, newWinner]
    }));
  };

  const handleUpdateWinner = (idx, field, value) => {
    setFormData((prev) => {
      const next = [...prev.winners];
      next[idx] = { ...next[idx], [field]: value };
      return { ...prev, winners: next };
    });
  };

  const handleDeleteWinner = (idx) => {
    setFormData((prev) => ({
      ...prev,
      winners: prev.winners.filter((_, i) => i !== idx)
    }));
  };

  const handleWinnerPhotoUpload = async (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const compressed = await compressImage(file, 800, 0.85);
      handleUpdateWinner(idx, 'photo', compressed);
      addToast('विजेत्याचा फोटो जोडला!', 'success');
    } catch (err) {
      addToast('फोटो अपलोड करताना त्रुटी आली.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // ================= SAVE SUBMIT =================
  const handleSave = () => {
    if (!formData.title?.trim()) {
      addToast('कृपया खेळाचे/स्पर्धेचे नाव टाका!', 'error');
      setActiveTab('details');
      return;
    }
    if (isCreatingNew) {
      createCompetition({
        id: `COMP-${Date.now()}`,
        ...formData
      });
      addToast('नवीन खेळ/स्पर्धा यशस्वीरित्या तयार झाली!', 'success');
    } else {
      updateCompetition(competition.id, formData);
      addToast('बदल यशस्वीरित्या सेव्ह झाले!', 'success');
    }
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        zIndex: 9999,
        padding: 'clamp(0.5rem, 2vw, 1.25rem)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className="modal-content glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          width: 'min(98vw, 820px)',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          border: '1.5px solid rgba(245, 158, 11, 0.45)',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '0.85rem 1.15rem',
            background: 'linear-gradient(135deg, rgba(180, 83, 9, 0.25), rgba(220, 38, 38, 0.15))',
            borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f59e0b, #dc2626)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
                flexShrink: 0
              }}
            >
              <Crown size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: 'clamp(0.92rem, 3.2vw, 1.12rem)',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  wordBreak: 'break-word',
                  lineHeight: 1.25
                }}
              >
                {isCreatingNew ? 'नवीन खेळ / स्पर्धा जोडा' : (formData.title || 'खेळ / स्पर्धा संपादन')}
              </h3>
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: 'clamp(0.72rem, 2.2vw, 0.78rem)',
                  color: 'var(--text-subtle)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {isCreatingNew ? 'येथे नवीन खेळ, आयोजक, निकाल व विजेते फोटो जोडा' : 'आयोजक, विजेते, मानाची पैठणी व फोटो व्यवस्थापन (Admin)'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              minWidth: '36px',
              minHeight: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '0.35rem 0.75rem',
            gap: '0.4rem',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            touchAction: 'pan-x'
          }}
        >
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'winners' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('winners')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: 'clamp(0.74rem, 2.2vw, 0.8rem)',
              flexShrink: 0,
              padding: '0.4rem 0.7rem',
              minHeight: '34px'
            }}
          >
            <Trophy size={13} style={{ flexShrink: 0 }} />
            <span>🏆 विजेत्यांची यादी ({formData.winners.length})</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'organizers' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('organizers')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: 'clamp(0.74rem, 2.2vw, 0.8rem)',
              flexShrink: 0,
              padding: '0.4rem 0.7rem',
              minHeight: '34px'
            }}
          >
            <Users size={13} style={{ flexShrink: 0 }} />
            <span>👥 आयोजक मंडळी ({formData.organizers.length})</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'details' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('details')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: 'clamp(0.74rem, 2.2vw, 0.8rem)',
              flexShrink: 0,
              padding: '0.4rem 0.7rem',
              minHeight: '34px'
            }}
          >
            <Calendar size={13} style={{ flexShrink: 0 }} />
            <span>तपशील (Details)</span>
          </button>
        </div>

        {/* Modal Body Scroll Area */}
        <div
          style={{
            padding: 'clamp(0.75rem, 3vw, 1.35rem)',
            overflowY: 'auto',
            flex: 1,
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* TAB 1: WINNERS MANAGEMENT */}
          {activeTab === 'winners' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.85rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: 'clamp(0.9rem, 3vw, 0.98rem)', fontWeight: 800, color: 'var(--text-main)' }}>
                    स्पर्धा विजेत्यांची यादी (Winners List)
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--text-subtle)' }}>
                    येथे विजेत्यांचे नाव, क्रमांक, मानाची पैठणी / पारितोषिक व फोटो जोडा.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAddWinner}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', minHeight: '34px', fontSize: '0.78rem' }}
                >
                  <PlusCircle size={14} />
                  <span>नवीन विजेता जोडा</span>
                </button>
              </div>

              {formData.winners.length === 0 ? (
                <div
                  style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-subtle)',
                    border: '1px dashed rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    fontSize: '0.84rem'
                  }}
                >
                  अद्याप कोणत्याही विजेत्यांची नोंद नाही. वरील "नवीन विजेता जोडा" बटणावर क्लिक करा.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {formData.winners.map((win, idx) => (
                    <div
                      key={win.id || idx}
                      style={{
                        padding: 'clamp(0.75rem, 2.5vw, 1rem)',
                        borderRadius: 'var(--radius-lg)',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: win.rank === 1 ? '1.5px solid rgba(251, 191, 36, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      {/* Top Bar of Winner Card */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                          <span
                            style={{
                              backgroundColor: win.rank === 1 ? '#f59e0b' : '#3b82f6',
                              color: '#fff',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              flexShrink: 0
                            }}
                          >
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            className="form-input"
                            value={win.rankLabel}
                            onChange={(e) => handleUpdateWinner(idx, 'rankLabel', e.target.value)}
                            placeholder="क्रमांक लेबल (उदा. प्रथम क्रमांक)"
                            style={{
                              fontSize: '0.82rem',
                              height: '32px',
                              flex: '1 1 auto',
                              minWidth: '110px',
                              maxWidth: '100%',
                              fontWeight: 700
                            }}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteWinner(idx)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            color: '#ef4444',
                            borderColor: 'rgba(239, 68, 68, 0.4)',
                            padding: '0.3rem 0.5rem',
                            minHeight: '32px',
                            minWidth: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="विजेता काढून टाका"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Main Fields: Name, Prize, Notes & Photo Upload */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                          gap: '0.65rem'
                        }}
                      >
                        <div>
                          <label style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '3px' }}>
                            विजेत्याचे नाव (Winner Name) *
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={win.name}
                            onChange={(e) => handleUpdateWinner(idx, 'name', e.target.value)}
                            placeholder="उदा. सौ. पूजा सचिन शिंदे"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '3px' }}>
                            बक्षीस / पारितोषिक (Prize) *
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={win.prize}
                            onChange={(e) => handleUpdateWinner(idx, 'prize', e.target.value)}
                            placeholder="उदा. मानाची शुद्ध जरी पैठणी + चषक 🏆"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '3px' }}>
                            विशेष शेरा / उखाणा / टिप्पणी (Notes)
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={win.notes || ''}
                            onChange={(e) => handleUpdateWinner(idx, 'notes', e.target.value)}
                            placeholder="उदा. सर्वोत्कृष्ट उखाणा व अंतिम फेरी विजेती"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      {/* Photo Upload Row with Preview */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                          flexWrap: 'wrap'
                        }}
                      >
                        {/* Preview Circle */}
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            backgroundColor: '#261219',
                            overflow: 'hidden',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1.5px solid #fbbf24'
                          }}
                        >
                          {win.photo ? (
                            <img src={win.photo} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <ImageIcon size={16} color="#fbbf24" style={{ opacity: 0.6 }} />
                          )}
                        </div>

                        {/* Upload Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <label
                            className="btn btn-secondary btn-sm"
                            style={{
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.76rem',
                              minHeight: '34px',
                              padding: '0.35rem 0.65rem'
                            }}
                          >
                            <Upload size={13} />
                            <span>{win.photo ? 'फोटो बदला (Change Photo)' : 'फोटो जोडा (Upload Photo)'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => handleWinnerPhotoUpload(idx, e)}
                            />
                          </label>

                          {win.photo && (
                            <button
                              type="button"
                              onClick={() => handleUpdateWinner(idx, 'photo', '')}
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#ef4444',
                                fontSize: '0.74rem',
                                cursor: 'pointer',
                                padding: '0.35rem 0.6rem',
                                borderRadius: '6px',
                                minHeight: '34px'
                              }}
                            >
                              काढा
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORGANIZERS MANAGEMENT */}
          {activeTab === 'organizers' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.85rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: 'clamp(0.9rem, 3vw, 0.98rem)', fontWeight: 800, color: 'var(--text-main)' }}>
                    आयोजक व सूत्रसंचालक यादी (Organizers List)
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--text-subtle)' }}>
                    कार्यक्रमाचे प्रमुख आयोजक व संयोजक यांची नावे व फोटो जोडा.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAddOrganizer}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', minHeight: '34px', fontSize: '0.78rem' }}
                >
                  <PlusCircle size={14} />
                  <span>नवीन आयोजक जोडा</span>
                </button>
              </div>

              {formData.organizers.length === 0 ? (
                <div
                  style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-subtle)',
                    border: '1px dashed rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    fontSize: '0.84rem'
                  }}
                >
                  अद्याप कोणत्याही आयोजकांची नोंद नाही. "नवीन आयोजक जोडा" वर क्लिक करा.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {formData.organizers.map((org, idx) => (
                    <div
                      key={org.id || idx}
                      style={{
                        padding: 'clamp(0.75rem, 2.5vw, 0.95rem)',
                        borderRadius: 'var(--radius-lg)',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        flexWrap: 'wrap'
                      }}
                    >
                      {/* Photo Thumbnail */}
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: '#261219',
                          overflow: 'hidden',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.5px solid #fbbf24'
                        }}
                      >
                        {org.photo ? (
                          <img src={org.photo} alt="Org" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.85rem' }}>
                            {org.name ? org.name.charAt(0) : 'आ'}
                          </span>
                        )}
                      </div>

                      {/* Inputs: Name & Role */}
                      <div style={{ display: 'flex', flex: '1 1 min(100%, 260px)', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 130px' }}>
                          <input
                            type="text"
                            className="form-input"
                            value={org.name}
                            onChange={(e) => handleUpdateOrganizer(idx, 'name', e.target.value)}
                            placeholder="आयोजकाचे नाव (Name)"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div style={{ flex: '1 1 120px' }}>
                          <input
                            type="text"
                            className="form-input"
                            value={org.role}
                            onChange={(e) => handleUpdateOrganizer(idx, 'role', e.target.value)}
                            placeholder="पद / जबाबदारी (Role)"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      {/* Photo Upload & Delete Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <label
                          className="btn btn-secondary btn-sm"
                          style={{
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.76rem',
                            minHeight: '34px',
                            padding: '0.35rem 0.65rem'
                          }}
                        >
                          <Upload size={13} />
                          <span>फोटो</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleOrganizerPhotoUpload(idx, e)}
                          />
                        </label>

                        {org.photo && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrganizer(idx, 'photo', '')}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              fontSize: '0.74rem',
                              cursor: 'pointer',
                              padding: '0.35rem 0.5rem',
                              borderRadius: '6px',
                              minHeight: '34px'
                            }}
                          >
                            काढा
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteOrganizer(idx)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            color: '#ef4444',
                            borderColor: 'rgba(239, 68, 68, 0.4)',
                            padding: '0.35rem 0.55rem',
                            minHeight: '34px',
                            minWidth: '34px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="काढून टाका"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DETAILS */}
          {activeTab === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '3px' }}>
                  कार्यक्रमाचे / खेळाचे नाव (Program / Game Title) *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="उदा. होम मिनिस्टर — खेळ पैठणीचा, रांगोळी स्पर्धा, संगीत खुर्ची"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '3px' }}>
                  उपशीर्षक / टॅगलाईन (Subtitle / Tagline)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="उदा. माहेरवाशिणींचा महासन्मान • मानाची पैठणी • रंगतदार खेळ"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                  gap: '0.65rem'
                }}
              >
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '3px' }}>
                    दिनांक (Date)
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '3px' }}>
                    वेळ (Time)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="उदा. सायंकाळी ०६:०० ते १०:००"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '3px' }}>
                    स्थळ / रंगमंच (Venue)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="उदा. मुख्य सांस्कृतिक रंगमंच"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '3px' }}>
                  कार्यक्रमाची सविस्तर माहिती / वृत्तांत (Description)
                </label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="खेळाविषयी किंवा कार्यक्रमाविषयी माहिती..."
                  style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '0.85rem 1.15rem',
            background: 'rgba(0, 0, 0, 0.4)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            gap: '0.65rem'
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ flex: '1 1 110px', minHeight: '42px', justifyContent: 'center' }}
          >
            रद्द करा (Cancel)
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              flex: '1 1 150px',
              minHeight: '42px'
            }}
          >
            <Check size={16} />
            <span>{isCreatingNew ? 'नवीन खेळ सेव्ह करा' : 'बदल सेव्ह करा'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

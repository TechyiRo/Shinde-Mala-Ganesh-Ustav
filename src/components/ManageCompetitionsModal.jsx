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
  const { updateCompetition, addToast, compressImage } = useData();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('winners'); // 'winners' | 'organizers' | 'details'

  // Local Form State
  const [formData, setFormData] = useState({
    title: competition.title || 'होम मिनिस्टर — खेळ पैठणीचा व महासन्मान सोहळा',
    subtitle: competition.subtitle || 'माहेरवाशिणींचा महासन्मान • मानाची पैठणी • रंगतदार खेळ व मनोरंजक स्पर्धा',
    date: competition.date || '2026-09-20',
    time: competition.time || 'सायंकाळी ०६:०० ते रात्री १०:००',
    venue: competition.venue || 'मुख्य सांस्कृतिक रंगमंच, शिंदे मळा गणेश मंडप',
    description: competition.description || '',
    organizers: Array.isArray(competition.organizers) ? [...competition.organizers] : [],
    winners: Array.isArray(competition.winners) ? [...competition.winners] : []
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
    updateCompetition(competition.id, formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          border: '1.5px solid rgba(245, 158, 11, 0.45)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(180, 83, 9, 0.25), rgba(220, 38, 38, 0.15))',
            borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b, #dc2626)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)'
              }}
            >
              <Crown size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                होम मिनिस्टर व सांस्कृतिक कार्यक्रम व्यवस्थापन
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                आयोजक, विजेते, मानाची पैठणी व फोटो व्यवस्थापन (Admin Panel)
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
              padding: '6px'
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
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            padding: '0.4rem 1.25rem',
            gap: '0.5rem',
            overflowX: 'auto'
          }}
        >
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'winners' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('winners')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
          >
            <Trophy size={14} />
            <span>🏆 विजेत्यांची यादी ({formData.winners.length})</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'organizers' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('organizers')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
          >
            <Users size={14} />
            <span>👥 आयोजक व सूत्रसंचालक ({formData.organizers.length})</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'details' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('details')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
          >
            <Calendar size={14} />
            <span>कार्यक्रम तपशील (Details)</span>
          </button>
        </div>

        {/* Modal Body Scroll Area */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: WINNERS MANAGEMENT */}
          {activeTab === 'winners' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    स्पर्धा विजेत्यांची यादी (Winners List)
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                    येथे विजेत्यांचे नाव, क्रमांक, मानाची पैठणी / पारितोषिक व फोटो जोडा.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAddWinner}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <PlusCircle size={15} />
                  <span>नवीन विजेता जोडा</span>
                </button>
              </div>

              {formData.winners.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-subtle)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '12px' }}>
                  अद्याप कोणत्याही विजेत्यांची नोंद नाही. "नवीन विजेता जोडा" वर क्लिक करा.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {formData.winners.map((win, idx) => (
                    <div
                      key={win.id || idx}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-lg)',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: win.rank === 1 ? '1.5px solid rgba(251, 191, 36, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem'
                      }}
                    >
                      {/* Top Bar of Winner Card */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                              fontSize: '0.75rem'
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
                            style={{ fontSize: '0.82rem', height: '32px', width: '220px', fontWeight: 700 }}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteWinner(idx)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', padding: '0.3rem 0.5rem' }}
                          title="विजेता काढून टाका"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Main Fields: Name, Prize, Notes & Photo Upload */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                        <div>
                          <label style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '3px' }}>
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
                          <label style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '3px' }}>
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
                          <label style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '3px' }}>
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
                          gap: '1rem',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                          flexWrap: 'wrap'
                        }}
                      >
                        {/* Preview Circle */}
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
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
                            <ImageIcon size={18} color="#fbbf24" style={{ opacity: 0.6 }} />
                          )}
                        </div>

                        {/* Upload Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <label
                            className="btn btn-secondary btn-sm"
                            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}
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
                              className="btn btn-sm"
                              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.78rem', cursor: 'pointer' }}
                            >
                              फोटो काढा
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    आयोजक व सूत्रसंचालक यादी (Organizers & Hosts)
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                    कार्यक्रमाचे संयोजक, सूत्रसंचालक आणि नियोजकांची नावे व फोटो जोडा.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAddOrganizer}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <PlusCircle size={15} />
                  <span>नवीन आयोजक जोडा</span>
                </button>
              </div>

              {formData.organizers.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-subtle)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '12px' }}>
                  अद्याप कोणत्याही आयोजकांची नोंद नाही. "नवीन आयोजक जोडा" वर क्लिक करा.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {formData.organizers.map((org, idx) => (
                    <div
                      key={org.id || idx}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-lg)',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        flexWrap: 'wrap'
                      }}
                    >
                      {/* Photo Thumbnail */}
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
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
                          <span style={{ color: '#fbbf24', fontWeight: 800 }}>{org.name ? org.name.charAt(0) : 'आ'}</span>
                        )}
                      </div>

                      {/* Inputs: Name & Role */}
                      <div style={{ display: 'flex', flex: '1 1 300px', gap: '0.65rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 160px' }}>
                          <input
                            type="text"
                            className="form-input"
                            value={org.name}
                            onChange={(e) => handleUpdateOrganizer(idx, 'name', e.target.value)}
                            placeholder="आयोजकाचे नाव (Name)"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div style={{ flex: '1 1 140px' }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label
                          className="btn btn-secondary btn-sm"
                          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
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
                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            काढा
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteOrganizer(idx)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', padding: '0.35rem 0.5rem' }}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '3px' }}>
                  कार्यक्रमाचे शीर्षक (Program Title) *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '3px' }}>
                  उपशीर्षक / टॅगलाईन (Subtitle / Tagline)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '3px' }}>
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
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '3px' }}>
                    वेळ (Time)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '3px' }}>
                    स्थळ / रंगमंच (Venue)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '3px' }}>
                  कार्यक्रमाची सविस्तर माहिती / वृत्तांत (Description)
                </label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="कार्यक्रमाविषयी माहिती..."
                  style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: 'rgba(0, 0, 0, 0.4)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}
        >
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            रद्द करा (Cancel)
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Check size={16} />
            <span>बदल सेव्ह करा (Save Changes)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  Calendar,
  PlusCircle,
  Clock,
  MapPin,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Radio,
  Pin,
  Sparkles,
  Upload,
  X,
  Eye,
  CheckCircle2,
  FileText
} from 'lucide-react';

const EVENT_CATEGORIES = [
  { key: 'Aarti', labelMr: 'आरती', labelEn: 'Aarti' },
  { key: 'Mahaprasad', labelMr: 'महाप्रसाद', labelEn: 'Mahaprasad' },
  { key: 'Cultural', labelMr: 'सांस्कृतिक कार्यक्रम', labelEn: 'Cultural Event' },
  { key: 'Competition', labelMr: 'स्पर्धा', labelEn: 'Competition' },
  { key: 'Miravnuk', labelMr: 'मिरवणूक', labelEn: 'Procession' },
  { key: 'Other', labelMr: 'इतर', labelEn: 'Other' }
];

export const ManageEvents = () => {
  const { lang, t } = useLanguage();
  const { eventList, createEvent, updateEvent, deleteEvent, togglePinEvent, addToast, compressImage } = useData();
  const { isAdmin } = useAuth();

  // Filters & State
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    dayNumber: 1,
    title: '',
    titleEn: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '07:30 PM',
    endTime: '09:00 PM',
    category: 'आरती',
    categoryKey: 'Aarti',
    location: 'शिंदे मळा गणेश उत्सव मंडप',
    status: 'Upcoming', // 'Upcoming' | 'Live' | 'Completed'
    isPinned: false,
    isPublished: true,
    caption: '',
    captionEn: '',
    media: []
  });

  const handleOpenCreate = () => {
    if (!isAdmin) {
      addToast(t('readOnlyWarning'), 'error');
      return;
    }
    setFormData({
      dayNumber: 1,
      title: '',
      titleEn: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '07:30 PM',
      endTime: '09:00 PM',
      category: 'आरती',
      categoryKey: 'Aarti',
      location: 'शिंदे मळा गणेश उत्सव मंडप',
      status: 'Upcoming',
      isPinned: false,
      isPublished: true,
      caption: '',
      captionEn: '',
      media: []
    });
    setEditingEvent(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (evt) => {
    if (!isAdmin) {
      addToast(t('readOnlyWarning'), 'error');
      return;
    }
    setEditingEvent(evt);
    setFormData({ ...evt });
    setIsCreateModalOpen(true);
  };

  // Multiple Media Upload with Client-Side Compression
  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    try {
      const newMediaList = [];
      for (const file of files) {
        const compressedUrl = await compressImage(file, 1000, 0.75);
        newMediaList.push({
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url: compressedUrl,
          caption: file.name
        });
      }
      setFormData((prev) => ({
        ...prev,
        media: [...(prev.media || []), ...newMediaList]
      }));
      addToast(`${files.length} फोटो यशस्वीरित्या जोडले!`, 'success');
    } catch {
      addToast('Error compressing image', 'error');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast(t('readOnlyWarning'), 'error');
      return;
    }

    if (!formData.title.trim()) {
      addToast('कार्यक्रमाचे नाव आवश्यक आहे (Title required)', 'error');
      return;
    }

    if (editingEvent) {
      updateEvent(editingEvent.id, formData);
      addToast(t('toastEventUpdated'), 'success');
    } else {
      createEvent(formData);
      addToast(t('toastEventCreated'), 'success');
    }

    setIsCreateModalOpen(false);
  };

  const handleDelete = (id) => {
    if (!isAdmin) {
      addToast(t('readOnlyWarning'), 'error');
      return;
    }
    setDeleteTargetId(id);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      deleteEvent(deleteTargetId);
      addToast(t('toastEventDeleted'), 'info');
      setDeleteTargetId(null);
      setIsConfirmDeleteOpen(false);
    }
  };

  // Filtered list
  const filteredEvents = eventList.filter((e) => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Live') return e.status === 'Live' || e.status === 'Live Now';
    return e.status === statusFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div
        className="glass-panel no-print"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.75rem',
          gap: '1rem'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--text-main)' }}>
            {t('manageEventsTitle')}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', margin: 0 }}>
            येथे जोडलेला प्रत्येक कार्यक्रम थेट सार्वजनिक पोर्टलवरील इन्स्टाग्राम फीड व स्टोरीजमध्ये दिसेल
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <PlusCircle size={18} />
          <span>{t('addEventBtn')}</span>
        </button>
      </div>

      {/* Status Filter Chips */}
      <div className="glass-panel no-print" style={{ padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
          {[
            { id: 'All', label: 'सर्व कार्यक्रम (All)' },
            { id: 'Live', label: '🔴 थेट सुरू (Live Now)' },
            { id: 'Upcoming', label: '⏳ आगामी (Upcoming)' },
            { id: 'Completed', label: '✓ संपन्न (Completed)' }
          ].map((f) => (
            <button
              key={f.id}
              className="chip-btn"
              onClick={() => setStatusFilter(f.id)}
              style={{
                backgroundColor: statusFilter === f.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                color: statusFilter === f.id ? '#fff' : 'var(--text-muted)'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {filteredEvents.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-subtle)', gridColumn: '1 / -1' }}>
            {t('noRecordsFound')}
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const isLive = evt.status === 'Live' || evt.status === 'Live Now';
            const firstImg = evt.media && evt.media.length > 0 ? evt.media[0].url : 'https://images.unsplash.com/photo-1567591974584-f1832dfa6291?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={evt.id}
                className="glass-panel"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderRadius: 'var(--radius-xl)',
                  border: isLive ? '1.5px solid #ef4444' : evt.isPinned ? '1.5px solid #f59e0b' : '1px solid var(--glass-border)'
                }}
              >
                {/* Event Image Banner */}
                <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: '#0a050d' }}>
                  <img
                    src={firstImg}
                    alt={evt.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Badges on image */}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '0.4rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        color: '#fbbf24',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backdropFilter: 'blur(6px)'
                      }}
                    >
                      दिवस {evt.dayNumber}
                    </span>

                    {isLive && (
                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px',
                          backgroundColor: 'rgba(239, 68, 68, 0.9)',
                          color: '#fff',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)'
                        }}
                      >
                        🔴 LIVE
                      </span>
                    )}

                    {evt.isPinned && (
                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px',
                          backgroundColor: 'rgba(245, 158, 11, 0.9)',
                          color: '#fff',
                          fontSize: '0.75rem',
                          fontWeight: 800
                        }}
                      >
                        📌 Pinned
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    ❤️ {evt.likes || 0} Likes
                  </div>
                </div>

                {/* Event Card Content */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#ff7722', fontWeight: 700 }}>
                      {evt.category}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                      {evt.date}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.4rem', lineHeight: 1.3 }}>
                    {evt.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    <Clock size={13} color="var(--primary-light)" />
                    <span>{evt.startTime} {evt.endTime ? `ते ${evt.endTime}` : ''}</span>
                  </div>

                  {evt.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-subtle)', marginBottom: '0.75rem' }}>
                      <MapPin size={13} color="#f59e0b" />
                      <span>{evt.location}</span>
                    </div>
                  )}

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1, margin: 0 }}>
                    {(evt.caption || '').slice(0, 100)}...
                  </p>

                  {/* Actions row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '1rem',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid var(--glass-border)'
                    }}
                  >
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => togglePinEvent(evt.id)}
                      title="Toggle Pin to Top"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <Pin size={13} color={evt.isPinned ? '#fbbf24' : 'currentColor'} />
                      <span>{evt.isPinned ? 'Unpin' : 'Pin'}</span>
                    </button>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        className="btn btn-secondary btn-icon btn-sm"
                        onClick={() => handleOpenEdit(evt)}
                        title={t('edit')}
                      >
                        <Edit2 size={15} color="#60a5fa" />
                      </button>
                      <button
                        className="btn btn-secondary btn-icon btn-sm"
                        onClick={() => handleDelete(evt.id)}
                        title={t('delete')}
                      >
                        <Trash2 size={15} color="#f87171" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create / Edit Event */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '680px', padding: '1.75rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {editingEvent ? 'कार्यक्रम संपादित करा (Edit Event)' : 'नवीन उत्सव कार्यक्रम जोडा (Create Event)'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Row 1: Title */}
              <div className="form-group">
                <label className="form-label">
                  <FileText size={15} />
                  <span>{t('eventTitleLabel')} (मराठी)</span>
                  <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="उदा. भव्य महाआरती व मोदक वाटप"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Row 2: Day Number, Category, Status */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">{t('dayNumberLabel')}</label>
                  <select
                    className="form-select"
                    value={formData.dayNumber}
                    onChange={(e) => setFormData({ ...formData, dayNumber: Number(e.target.value) })}
                  >
                    {Array.from({ length: 11 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        दिवस {i + 1} (Day {i + 1})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('eventCategoryLabel')}</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => {
                      const selected = EVENT_CATEGORIES.find((c) => c.labelMr === e.target.value);
                      setFormData({
                        ...formData,
                        category: e.target.value,
                        categoryKey: selected ? selected.key : 'Other'
                      });
                    }}
                  >
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c.key} value={c.labelMr}>
                        {c.labelMr} ({c.labelEn})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('eventStatusLabel')}</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Upcoming">{t('statusUpcoming')}</option>
                    <option value="Live">{t('statusLive')}</option>
                    <option value="Completed">{t('statusCompleted')}</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Date & Start/End Time */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">{t('date')}</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">सुरुवात वेळ (Start)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="उदा. 07:30 PM"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">समाप्ती वेळ (End)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="उदा. 09:30 PM"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 4: Location */}
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={15} />
                  <span>{t('eventLocationLabel')}</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="उदा. मुख्य उत्सव मंडप, शिंदे मळा चौक"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              {/* Row 5: Caption / Description */}
              <div className="form-group">
                <label className="form-label">कार्यक्रमाचा सविस्तर तपशील (Caption)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="कार्यक्रमाविषयी माहिती, आरती वेळ किंवा भाविकांसाठी आवाहन..."
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                />
              </div>

              {/* Media Upload with Client-Side Compression */}
              <div className="form-group">
                <label className="form-label">{t('uploadMediaLabel')}</label>
                <div
                  style={{
                    border: '1.5px dashed var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    textAlign: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)'
                  }}
                >
                  <label style={{ cursor: 'pointer', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <Upload size={24} color="var(--primary-light)" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {isCompressing ? 'फोटो कॉम्प्रेस होत आहेत...' : t('uploadMediaHint')}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      style={{ display: 'none' }}
                      onChange={handleMediaUpload}
                      disabled={isCompressing}
                    />
                  </label>

                  {/* Previews */}
                  {formData.media && formData.media.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
                      {formData.media.map((m, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden' }}>
                          <img src={m.url} alt="Upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(idx)}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              background: 'rgba(0,0,0,0.65)',
                              border: 'none',
                              color: '#fff',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pin to top toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', margin: '1rem 0' }}>
                <input
                  type="checkbox"
                  id="pinToggle"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="pinToggle" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}>
                  📌 {t('pinToTopLabel')}
                </label>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                  {t('confirmCancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={isCompressing}>
                  <Sparkles size={16} />
                  <span>{t('saveEventBtn')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </div>
  );
};

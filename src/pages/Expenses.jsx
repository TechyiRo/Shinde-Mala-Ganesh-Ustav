import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  PlusCircle,
  Wallet,
  Search,
  FileSpreadsheet,
  Printer,
  Edit2,
  Trash2,
  Image as ImageIcon,
  X,
  Upload,
  Calendar,
  IndianRupee,
  User,
  CreditCard,
  Eye
} from 'lucide-react';
import { formatCurrency } from '../i18n/numberToWords';

const EXPENSE_CATEGORIES = [
  'Decoration',
  'Murti',
  'SoundLight',
  'Prasad',
  'Mandap',
  'Electricity',
  'Security',
  'Visarjan',
  'Misc'
];

export const Expenses = () => {
  const { lang, t } = useLanguage();
  const { expenseList, createExpense, updateExpense, deleteExpense, getNextExpenseId, addToast } = useData();
  const { isAdmin } = useAuth();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [viewingBillPhoto, setViewingBillPhoto] = useState(null);

  // New Expense Form Data
  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    date: todayStr,
    category: 'Decoration',
    description: '',
    amount: '',
    paidTo: '',
    paymentMode: 'Cash',
    billPhoto: ''
  });

  const nextExpenseId = getNextExpenseId();

  // Handle Photo Upload (Base64)
  const handlePhotoUpload = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('File size must be under 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (isEdit) {
        setEditFormData((prev) => ({ ...prev, billPhoto: reader.result }));
      } else {
        setFormData((prev) => ({ ...prev, billPhoto: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit New Expense
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast(t('readOnlyWarning'), 'error');
      return;
    }

    if (!formData.description.trim()) {
      addToast(t('valDescriptionRequired'), 'error');
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      addToast(t('valAmountRequired'), 'error');
      return;
    }

    if (!formData.paidTo.trim()) {
      addToast(t('valPaidToRequired'), 'error');
      return;
    }

    createExpense(formData);
    addToast(t('toastExpenseAdded'), 'success');
    setIsAddModalOpen(false);

    // Reset
    setFormData({
      date: todayStr,
      category: 'Decoration',
      description: '',
      amount: '',
      paidTo: '',
      paymentMode: 'Cash',
      billPhoto: ''
    });
  };

  // Submit Edit Expense
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast(t('readOnlyWarning'), 'error');
      return;
    }

    updateExpense(editFormData.id, editFormData);
    addToast(t('toastExpenseUpdated'), 'success');
    setIsEditModalOpen(false);
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
      deleteExpense(deleteTargetId);
      addToast(t('toastExpenseDeleted'), 'info');
      setDeleteTargetId(null);
      setIsConfirmDeleteOpen(false);
    }
  };

  // Filtered Expense List
  const filteredExpenses = useMemo(() => {
    return expenseList.filter((item) => {
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesDesc = (item.description || '').toLowerCase().includes(query);
        const matchesPaidTo = (item.paidTo || '').toLowerCase().includes(query);
        const matchesId = (item.id || '').toLowerCase().includes(query);
        if (!matchesDesc && !matchesPaidTo && !matchesId) return false;
      }
      return true;
    });
  }, [expenseList, selectedCategory, searchTerm]);

  const totalFilteredAmount = filteredExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Expense ID', 'Date', 'Category', 'Description', 'Amount', 'Paid To', 'Payment Mode'];
    const rows = filteredExpenses.map((exp) => [
      `"${exp.id || ''}"`,
      `"${exp.date || ''}"`,
      `"${exp.category || ''}"`,
      `"${(exp.description || '').replace(/"/g, '""')}"`,
      exp.amount || 0,
      `"${(exp.paidTo || '').replace(/"/g, '""')}"`,
      `"${exp.paymentMode || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ganesh_Utsav_Expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Expenses exported successfully!', 'success');
  };

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
          padding: 'clamp(0.85rem, 3vw, 1.35rem)',
          gap: '0.85rem'
        }}
      >
        <div style={{ minWidth: '200px' }}>
          <h2 className="text-page-title" style={{ fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--text-main)' }}>
            {t('expensesTitle')}
          </h2>
          <p className="text-subtext-responsive" style={{ color: 'var(--text-subtle)', margin: 0 }}>
            एकूण खर्च नोंदी: <strong style={{ color: 'var(--accent-gold-light)' }}>{filteredExpenses.length}</strong> |{' '}
            एकूण रक्कम: <strong style={{ color: '#f87171' }}>{formatCurrency(totalFilteredAmount)}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV} style={{ padding: '0.45rem 0.85rem', fontSize: 'var(--font-btn)' }}>
            <FileSpreadsheet size={16} color="#10b981" />
            <span>{t('exportExcel')}</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)} style={{ padding: '0.45rem 0.95rem', fontSize: 'var(--font-btn)' }}>
            <PlusCircle size={17} />
            <span>{t('addExpenseBtn')}</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="glass-panel no-print" style={{ padding: 'clamp(0.85rem, 3vw, 1.35rem)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="खर्चाचा तपशील किंवा कोणास दिले ते शोधा..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            <button
              className="chip-btn"
              onClick={() => setSelectedCategory('')}
              style={{
                backgroundColor: selectedCategory === '' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategory === '' ? '#fff' : 'var(--text-muted)'
              }}
            >
              सर्व खर्च प्रकार (All)
            </button>
            {EXPENSE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className="chip-btn"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedCategory === cat ? '#fff' : 'var(--text-muted)'
                }}
              >
                {t(`cat${cat}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expenses Table & Mobile Cards Panel */}
      <div className="glass-panel" style={{ padding: 'clamp(0.85rem, 3vw, 1.35rem)' }}>
        {/* Desktop Table View */}
        <div className="desktop-table-view">
          <div className="table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>{t('expenseId')}</th>
                  <th>{t('date')}</th>
                  <th>{t('category')}</th>
                  <th>{t('description')}</th>
                  <th>{t('paidTo')}</th>
                  <th>{t('paymentMode')}</th>
                  <th style={{ textAlign: 'right' }}>{t('amount')}</th>
                  <th className="no-print" style={{ textAlign: 'center' }}>
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-subtle)' }}>
                      {t('noRecordsFound')}
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td>
                        <strong style={{ color: 'var(--accent-gold-light)', fontSize: '0.85rem' }}>{exp.id}</strong>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{exp.date}</td>
                      <td>
                        <span
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(230, 81, 0, 0.15)',
                            color: '#ff7722',
                            fontSize: '0.82rem',
                            fontWeight: 600
                          }}
                        >
                          {t(`cat${exp.category}`) || exp.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{exp.description}</td>
                      <td style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{exp.paidTo}</td>
                      <td>
                        <span className={`badge badge-${(exp.paymentMode || '').toLowerCase().replace(/\s+/g, '')}`}>
                          {t(`mode${exp.paymentMode}`) || exp.paymentMode}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#f87171', fontSize: '1rem' }}>
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="no-print" style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          {exp.billPhoto && (
                            <button
                              className="btn btn-secondary btn-icon btn-sm"
                              onClick={() => setViewingBillPhoto(exp.billPhoto)}
                              title={t('viewPhoto')}
                            >
                              <ImageIcon size={15} color="#10b981" />
                            </button>
                          )}
                          <button
                            className="btn btn-secondary btn-icon btn-sm"
                            onClick={() => {
                              if (!isAdmin) {
                                addToast(t('readOnlyWarning'), 'error');
                                return;
                              }
                              setEditFormData({ ...exp });
                              setIsEditModalOpen(true);
                            }}
                            title={t('edit')}
                          >
                            <Edit2 size={15} color="#60a5fa" />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon btn-sm"
                            onClick={() => handleDelete(exp.id)}
                            title={t('delete')}
                          >
                            <Trash2 size={15} color="#f87171" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards View (< 680px) */}
        <div className="mobile-cards-view no-print">
          {filteredExpenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-subtle)', fontSize: 'var(--font-body)' }}>
              {t('noRecordsFound')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredExpenses.map((exp) => (
                <div
                  key={exp.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.55rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-gold-light)' }}>
                          {exp.id}
                        </span>
                        <span
                          style={{
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(230, 81, 0, 0.15)',
                            color: '#ff7722',
                            fontSize: '0.72rem',
                            fontWeight: 600
                          }}
                        >
                          {t(`cat${exp.category}`) || exp.category}
                        </span>
                      </div>
                      <h4 style={{ margin: '0.25rem 0 0', fontSize: 'var(--font-card-title)', fontWeight: 700, color: 'var(--text-main)' }}>
                        {exp.description}
                      </h4>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="text-amount-responsive" style={{ fontWeight: 800, color: '#f87171', display: 'block' }}>
                        {formatCurrency(exp.amount)}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>{exp.date}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', fontSize: 'var(--font-subtext)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        👤 {exp.paidTo}
                      </span>
                      <span className={`badge badge-${(exp.paymentMode || '').toLowerCase().replace(/\s+/g, '')}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
                        {t(`mode${exp.paymentMode}`) || exp.paymentMode}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem', marginLeft: 'auto' }}>
                      {exp.billPhoto && (
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => setViewingBillPhoto(exp.billPhoto)}
                          title={t('viewPhoto')}
                          style={{ padding: '0.35rem', minWidth: '32px', minHeight: '32px' }}
                        >
                          <ImageIcon size={14} color="#10b981" />
                        </button>
                      )}
                      <button
                        className="btn btn-secondary btn-icon btn-sm"
                        onClick={() => {
                          if (!isAdmin) {
                            addToast(t('readOnlyWarning'), 'error');
                            return;
                          }
                          setEditFormData({ ...exp });
                          setIsEditModalOpen(true);
                        }}
                        title={t('edit')}
                        style={{ padding: '0.35rem', minWidth: '32px', minHeight: '32px' }}
                      >
                        <Edit2 size={14} color="#60a5fa" />
                      </button>
                      <button
                        className="btn btn-secondary btn-icon btn-sm"
                        onClick={() => handleDelete(exp.id)}
                        title={t('delete')}
                        style={{ padding: '0.35rem', minWidth: '32px', minHeight: '32px' }}
                      >
                        <Trash2 size={14} color="#f87171" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Expense */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ padding: 'clamp(1rem, 3.5vw, 1.75rem)', maxWidth: 'min(94vw, 560px)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 className="text-section-heading" style={{ fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {t('addExpenseBtn')} — <span style={{ color: 'var(--accent-gold-light)' }}>{nextExpenseId}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--font-subtext)' }}>{t('date')}</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--font-subtext)' }}>{t('category')}</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {t(`cat${cat}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: 'var(--font-subtext)' }}>{t('description')}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="उदा. आरती व प्रसाद मोदक खर्च"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--font-subtext)' }}>{t('amount')} (₹)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="form-input"
                    placeholder="उदा. 4500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--font-subtext)' }}>{t('paidTo')}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="दुकानदार / कारागीर नाव"
                    value={formData.paidTo}
                    onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: 'var(--font-subtext)' }}>{t('paymentMode')}</label>
                <select
                  className="form-select"
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                >
                  <option value="Cash">{t('modeCash')}</option>
                  <option value="UPI">{t('modeUPI')}</option>
                  <option value="Bank Transfer">{t('modeBank')}</option>
                  <option value="Cheque">{t('modeCheque')}</option>
                </select>
              </div>

              {/* Bill Photo Upload */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 'var(--font-subtext)' }}>{t('billUpload')}</label>
                <div
                  style={{
                    border: '1px dashed var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    textAlign: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)'
                  }}
                >
                  {formData.billPhoto ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <img
                        src={formData.billPhoto}
                        alt="Bill Preview"
                        style={{ maxHeight: '120px', borderRadius: '8px', objectFit: 'contain' }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setFormData({ ...formData, billPhoto: '' })}
                      >
                        {t('removePhoto')}
                      </button>
                    </div>
                  ) : (
                    <label style={{ cursor: 'pointer', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                      <Upload size={22} color="var(--primary-light)" />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('uploadHint')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handlePhotoUpload(e, false)}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)} style={{ flex: '1 1 110px', minHeight: '44px' }}>
                  {t('confirmCancel')}
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: '2 1 150px', minHeight: '44px' }}>
                  {t('saveExpense')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Expense */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" style={{ padding: 'clamp(1rem, 3.5vw, 1.75rem)', maxWidth: 'min(94vw, 560px)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 className="text-section-heading" style={{ fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {t('edit')} — {editFormData.id}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--font-subtext)' }}>{t('date')}</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editFormData.date || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--font-subtext)' }}>{t('category')}</label>
                  <select
                    className="form-select"
                    value={editFormData.category || 'Decoration'}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {t(`cat${cat}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: 'var(--font-subtext)' }}>{t('description')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--font-subtext)' }}>{t('amount')} (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editFormData.amount || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--font-subtext)' }}>{t('paidTo')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.paidTo || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, paidTo: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: 'var(--font-subtext)' }}>{t('paymentMode')}</label>
                <select
                  className="form-select"
                  value={editFormData.paymentMode || 'Cash'}
                  onChange={(e) => setEditFormData({ ...editFormData, paymentMode: e.target.value })}
                >
                  <option value="Cash">{t('modeCash')}</option>
                  <option value="UPI">{t('modeUPI')}</option>
                  <option value="Bank Transfer">{t('modeBank')}</option>
                  <option value="Cheque">{t('modeCheque')}</option>
                </select>
              </div>

              {/* Bill Photo Upload */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 'var(--font-subtext)' }}>{t('billUpload')}</label>
                <div
                  style={{
                    border: '1px dashed var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    textAlign: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)'
                  }}
                >
                  {editFormData.billPhoto ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <img
                        src={editFormData.billPhoto}
                        alt="Bill Preview"
                        style={{ maxHeight: '120px', borderRadius: '8px', objectFit: 'contain' }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditFormData({ ...editFormData, billPhoto: '' })}
                      >
                        {t('removePhoto')}
                      </button>
                    </div>
                  ) : (
                    <label style={{ cursor: 'pointer', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                      <Upload size={22} color="var(--primary-light)" />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('uploadHint')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handlePhotoUpload(e, true)}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)} style={{ flex: '1 1 110px', minHeight: '44px' }}>
                  {t('confirmCancel')}
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: '2 1 150px', minHeight: '44px' }}>
                  {t('updateExpense')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill Photo Viewer Lightbox */}
      {viewingBillPhoto && (
        <div className="modal-overlay" onClick={() => setViewingBillPhoto(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '600px', padding: '1rem', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <button
                onClick={() => setViewingBillPhoto(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>
            <img
              src={viewingBillPhoto}
              alt="Receipt Bill"
              style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: '12px', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </div>
  );
};

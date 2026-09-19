import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PavtiModal } from '../components/PavtiModal';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  Search,
  Filter,
  FileSpreadsheet,
  Printer,
  Eye,
  Edit2,
  Trash2,
  Share2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ArrowUpDown
} from 'lucide-react';
import { formatCurrency } from '../i18n/numberToWords';

export const ManagePavti = () => {
  const { lang, t } = useLanguage();
  const { pavtiList, updatePavti, deletePavti, addToast } = useData();
  const { isAdmin } = useAuth();

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [filterType, setFilterType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals state
  const [selectedPavti, setSelectedPavti] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Filtered & Sorted Data
  const filteredList = useMemo(() => {
    return pavtiList.filter((item) => {
      // 1. Text Search (name, mobile, pavtiNo, address)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = (item.donorName || '').toLowerCase().includes(query);
        const matchesMobile = (item.mobile || '').includes(query);
        const matchesPavtiNo = (item.pavtiNo || '').toLowerCase().includes(query);
        const matchesAddress = (item.address || '').toLowerCase().includes(query);
        if (!matchesName && !matchesMobile && !matchesPavtiNo && !matchesAddress) return false;
      }

      // 2. Payment Mode
      if (filterMode && item.paymentMode !== filterMode) return false;

      // 3. Donation Type
      if (filterType && item.donationType !== filterType) return false;

      // 4. Date Range
      if (dateFrom && item.date < dateFrom) return false;
      if (dateTo && item.date > dateTo) return false;

      // 5. Amount Range
      const amt = Number(item.amount) || 0;
      if (minAmount && amt < Number(minAmount)) return false;
      if (maxAmount && amt > Number(maxAmount)) return false;

      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'amount') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [pavtiList, searchTerm, filterMode, filterType, dateFrom, dateTo, minAmount, maxAmount, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredList.slice(startIndex, startIndex + pageSize);
  }, [filteredList, currentPage, pageSize]);

  const filteredTotalAmount = filteredList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterMode('');
    setFilterType('');
    setDateFrom('');
    setDateTo('');
    setMinAmount('');
    setMaxAmount('');
    setCurrentPage(1);
  };

  // Row Actions
  const handleView = (item) => {
    setSelectedPavti(item);
    setIsReceiptModalOpen(true);
  };

  const handleEditClick = (item) => {
    if (!isAdmin) {
      addToast(t('readOnlyWarning'), 'error');
      return;
    }
    setEditFormData({ ...item });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updatePavti(editFormData.id, editFormData);
    setIsEditModalOpen(false);
    addToast(t('toastPavtiUpdated'), 'success');
  };

  const handleDeleteClick = (id) => {
    if (!isAdmin) {
      addToast(t('readOnlyWarning'), 'error');
      return;
    }
    setDeleteTargetId(id);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      deletePavti(deleteTargetId);
      addToast(t('toastPavtiDeleted'), 'info');
      setDeleteTargetId(null);
      setIsConfirmDeleteOpen(false);
    }
  };

  // Export to Excel / CSV with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = [
      'Pavti No',
      'Date',
      'Donor Name',
      'Mobile',
      'Address',
      'Amount',
      'Payment Mode',
      'Reference No',
      'Donation Type',
      'Received By',
      'Remarks'
    ];

    const rows = filteredList.map((p) => [
      `"${p.pavtiNo || ''}"`,
      `"${p.date || ''}"`,
      `"${(p.donorName || '').replace(/"/g, '""')}"`,
      `"${p.mobile || ''}"`,
      `"${(p.address || '').replace(/"/g, '""')}"`,
      p.amount || 0,
      `"${p.paymentMode || ''}"`,
      `"${p.refNo || ''}"`,
      `"${p.donationType || ''}"`,
      `"${(p.receivedBy || '').replace(/"/g, '""')}"`,
      `"${(p.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ganesh_Utsav_Pavti_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Excel (CSV) file exported successfully!', 'success');
  };

  const handlePrintLedger = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Title & Export Bar */}
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
            {t('managePavtiTitle')}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', margin: 0 }}>
            {t('totalRecords')}: <strong style={{ color: 'var(--accent-gold-light)' }}>{filteredList.length}</strong> |{' '}
            {t('filteredSum')}: <strong style={{ color: '#34d399' }}>{formatCurrency(filteredTotalAmount)}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <FileSpreadsheet size={16} color="#10b981" />
            <span>{t('exportExcel')}</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handlePrintLedger}>
            <Printer size={16} color="#3b82f6" />
            <span>{t('exportPdf')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel no-print" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {/* Search Input */}
          <div style={{ gridColumn: 'span 2', minWidth: '220px' }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>
              <Search size={14} />
              <span>{t('searchPlaceholder')}</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Payment Mode Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>
              <span>{t('paymentMode')}</span>
            </label>
            <select
              className="form-select"
              value={filterMode}
              onChange={(e) => {
                setFilterMode(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">{t('filterAllModes')}</option>
              <option value="Cash">{t('modeCash')}</option>
              <option value="UPI">{t('modeUPI')}</option>
              <option value="Bank Transfer">{t('modeBank')}</option>
              <option value="Cheque">{t('modeCheque')}</option>
            </select>
          </div>

          {/* Donation Type Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>
              <span>{t('donationType')}</span>
            </label>
            <select
              className="form-select"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">{t('filterAllTypes')}</option>
              <option value="Vargani">{t('typeVargani')}</option>
              <option value="Denagi">{t('typeDenagi')}</option>
              <option value="Navas">{t('typeNavas')}</option>
              <option value="Other">{t('typeOther')}</option>
            </select>
          </div>

          {/* Date Range From */}
          <div>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>
              <span>{t('filterDateFrom')}</span>
            </label>
            <input
              type="date"
              className="form-input"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Date Range To */}
          <div>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>
              <span>{t('filterDateTo')}</span>
            </label>
            <input
              type="date"
              className="form-input"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Min Amount */}
          <div>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>
              <span>{t('filterMinAmount')}</span>
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="₹ Min"
              value={minAmount}
              onChange={(e) => {
                setMinAmount(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Max Amount */}
          <div>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>
              <span>{t('filterMaxAmount')}</span>
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="₹ Max"
              value={maxAmount}
              onChange={(e) => {
                setMaxAmount(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Clear Filters */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClearFilters}
              style={{ width: '100%' }}
            >
              <RotateCcw size={15} />
              <span>{t('clearFilters')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Receipts Table Panel */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div className="table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('pavtiNo')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>{t('pavtiNo')}</span>
                    <ArrowUpDown size={13} />
                  </div>
                </th>
                <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>{t('date')}</span>
                    <ArrowUpDown size={13} />
                  </div>
                </th>
                <th onClick={() => handleSort('donorName')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>{t('donorName')}</span>
                    <ArrowUpDown size={13} />
                  </div>
                </th>
                <th>{t('mobileNumber')}</th>
                <th>{t('paymentMode')}</th>
                <th>{t('donationType')}</th>
                <th onClick={() => handleSort('amount')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                    <span>{t('amount')}</span>
                    <ArrowUpDown size={13} />
                  </div>
                </th>
                <th className="no-print" style={{ textAlign: 'center' }}>
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-subtle)' }}>
                    {t('noRecordsFound')}
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ color: 'var(--accent-gold-light)' }}>{item.pavtiNo}</strong>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{item.date}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{item.donorName}</div>
                      {item.address && (
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)' }}>{item.address}</div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{item.mobile || '—'}</td>
                    <td>
                      <span className={`badge badge-${(item.paymentMode || '').toLowerCase().replace(/\s+/g, '')}`}>
                        {t(`mode${item.paymentMode}`) || item.paymentMode}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {t(`type${item.donationType}`) || item.donationType}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#34d399', fontSize: '1rem' }}>
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="no-print" style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => handleView(item)}
                          title={t('view')}
                        >
                          <Eye size={15} color="#fbbf24" />
                        </button>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => handleEditClick(item)}
                          title={t('edit')}
                          disabled={!isAdmin}
                          style={{ opacity: isAdmin ? 1 : 0.4 }}
                        >
                          <Edit2 size={15} color="#60a5fa" />
                        </button>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => handleDeleteClick(item.id)}
                          title={t('delete')}
                          disabled={!isAdmin}
                          style={{ opacity: isAdmin ? 1 : 0.4 }}
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

        {/* Pagination Bar */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--glass-border)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
            <span>
              {t('page')} {currentPage} {t('of')} {totalPages} ({filteredList.length} नोंदी)
            </span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.82rem' }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0 0.5rem' }}>
              {currentPage}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* View / Print A5 Modal */}
      <PavtiModal
        isOpen={isReceiptModalOpen}
        pavti={selectedPavti}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      {/* Edit Pavti Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" style={{ padding: '1.75rem' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
              {t('edit')} — {editFormData.pavtiNo}
            </h3>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label className="form-label">{t('donorName')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.donorName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, donorName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">{t('mobileNumber')}</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editFormData.mobile || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('amount')} (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editFormData.amount || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">{t('paymentMode')}</label>
                  <select
                    className="form-select"
                    value={editFormData.paymentMode}
                    onChange={(e) => setEditFormData({ ...editFormData, paymentMode: e.target.value })}
                  >
                    <option value="Cash">{t('modeCash')}</option>
                    <option value="UPI">{t('modeUPI')}</option>
                    <option value="Bank Transfer">{t('modeBank')}</option>
                    <option value="Cheque">{t('modeCheque')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('donationType')}</label>
                  <select
                    className="form-select"
                    value={editFormData.donationType}
                    onChange={(e) => setEditFormData({ ...editFormData, donationType: e.target.value })}
                  >
                    <option value="Vargani">{t('typeVargani')}</option>
                    <option value="Denagi">{t('typeDenagi')}</option>
                    <option value="Navas">{t('typeNavas')}</option>
                    <option value="Other">{t('typeOther')}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('addressArea')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.address || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('remarks')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.remarks || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, remarks: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                  {t('confirmCancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('updateExpense')}
                </button>
              </div>
            </form>
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

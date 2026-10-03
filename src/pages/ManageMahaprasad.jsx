import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  UtensilsCrossed,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Share2,
  Printer,
  X,
  Phone,
  MapPin,
  IndianRupee,
  Users,
  Settings,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Calendar,
  User,
  CreditCard,
  FileText
} from 'lucide-react';
import { formatCurrency } from '../i18n/numberToWords';

export const ManageMahaprasad = () => {
  const { lang, t } = useLanguage();
  const {
    mahaprasadData,
    mahaprasadTotalExpense,
    manakariList,
    manakariCount,
    perHeadShare,
    totalMahaprasadCollected,
    totalMahaprasadPending,
    paidManakariCount,
    pendingManakariCount,
    updateMahaprasadSettings,
    addManakari,
    updateManakari,
    deleteManakari,
    toggleManakariPaidStatus,
    addToast
  } = useData();

  const { isAdmin } = useAuth();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'Paid' | 'Pending'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedManakari, setSelectedManakari] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Form Data for Add Manakari
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    address: '',
    status: 'Paid',
    paidAmount: '',
    paymentMode: 'Cash',
    paidDate: new Date().toISOString().split('T')[0],
    remarks: 'मानकरी वाटा'
  });

  // Form Data for Edit Manakari
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: '',
    status: 'Paid',
    paidAmount: '',
    paymentMode: 'Cash',
    paidDate: '',
    remarks: ''
  });

  // Form Data for Mahaprasad Settings
  const [settingsForm, setSettingsForm] = useState({
    title: mahaprasadData?.title || 'श्री गणेश जयंती व अनंत चतुर्दशी महाप्रसाद अन्नदान सोहळा',
    totalExpense: mahaprasadData?.totalExpense || 45000,
    date: mahaprasadData?.date || '2026-09-24',
    notes: mahaprasadData?.notes || ''
  });

  // Filtered List
  const filteredList = useMemo(() => {
    return manakariList.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.phone && m.phone.includes(searchTerm)) ||
        (m.address && m.address.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'Paid' && m.status === 'Paid') ||
        (filterStatus === 'Pending' && m.status !== 'Paid');

      return matchesSearch && matchesStatus;
    });
  }, [manakariList, searchTerm, filterStatus]);

  // Open Edit Modal
  const handleOpenEdit = (m) => {
    setSelectedManakari(m);
    setEditForm({
      name: m.name,
      phone: m.phone || '',
      address: m.address || '',
      status: m.status || 'Paid',
      paidAmount: m.paidAmount ?? perHeadShare,
      paymentMode: m.paymentMode || 'Cash',
      paidDate: m.paidDate || new Date().toISOString().split('T')[0],
      remarks: m.remarks || ''
    });
    setIsEditModalOpen(true);
  };

  // Submit Add
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast(t('readOnlyWarning'), 'error');
      return;
    }
    if (!addForm.name.trim()) {
      addToast('कृपया मानकऱ्याचे नाव टाका', 'error');
      return;
    }

    addManakari({
      ...addForm,
      paidAmount: addForm.status === 'Pending' ? 0 : Number(addForm.paidAmount || perHeadShare)
    });

    setAddForm({
      name: '',
      phone: '',
      address: '',
      status: 'Paid',
      paidAmount: '',
      paymentMode: 'Cash',
      paidDate: new Date().toISOString().split('T')[0],
      remarks: 'मानकरी वाटा'
    });
    setFilterStatus('all');
    setSearchTerm('');
    setIsAddModalOpen(false);
  };

  // Submit Edit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast(t('readOnlyWarning'), 'error');
      return;
    }
    if (!editForm.name.trim()) {
      addToast('कृपया मानकऱ्याचे नाव टाका', 'error');
      return;
    }

    updateManakari(selectedManakari.id, {
      ...editForm,
      paidAmount: Number(editForm.paidAmount || 0)
    });
    setIsEditModalOpen(false);
  };

  // Submit Settings
  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast(t('readOnlyWarning'), 'error');
      return;
    }
    const totalExp = Number(settingsForm.totalExpense) || 0;
    updateMahaprasadSettings({
      ...settingsForm,
      totalExpense: totalExp
    });
    setIsSettingsModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!isAdmin) {
      addToast(t('readOnlyWarning'), 'error');
      return;
    }
    if (deleteTargetId) {
      deleteManakari(deleteTargetId);
      setDeleteTargetId(null);
      setIsConfirmDeleteOpen(false);
    }
  };

  return (
    <div className="manage-mahaprasad-page" style={{ paddingBottom: '3rem' }}>
      {/* Top Header Card */}
      <div
        className="glass-panel"
        style={{
          padding: 'clamp(1rem, 2.5vw, 1.5rem)',
          marginBottom: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.05))',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #d97706, #ea580c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)',
              flexShrink: 0
            }}
          >
            <UtensilsCrossed size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                ॥ अन्नदान हेच श्रेष्ठ दान ॥
              </span>
            </div>
            <h1
              style={{
                fontSize: 'clamp(1.15rem, 3.2vw, 1.45rem)',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: '2px 0 0',
                lineHeight: 1.2
              }}
            >
              महाप्रसाद मानकरी व हिशोब व्यवस्थापन
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
              {mahaprasadData?.title || 'श्री गणेश महाप्रसाद अन्नदान सोहळा २०२६'}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSettingsForm({
                title: mahaprasadData?.title || '',
                totalExpense: mahaprasadTotalExpense,
                date: mahaprasadData?.date || '2026-09-24',
                notes: mahaprasadData?.notes || ''
              });
              setIsSettingsModalOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Settings size={15} color="#f59e0b" />
            <span>महाप्रसाद खर्च बदला</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setAddForm({
                name: '',
                phone: '',
                address: '',
                status: 'Paid',
                paidAmount: perHeadShare || '',
                paymentMode: 'Cash',
                paidDate: new Date().toISOString().split('T')[0],
                remarks: 'मानकरी वाटा'
              });
              setIsAddModalOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <PlusCircle size={15} />
            <span>नवीन मानकरी जोडा</span>
          </button>
        </div>
      </div>

      {/* Analytics & Per-Head Division Metrics (Pure Mobile-Friendly Grid) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'clamp(0.6rem, 1.8vw, 1rem)',
          marginBottom: '1.25rem'
        }}
      >
        {/* Metric 1: Total Mahaprasad Expense */}
        <div
          className="glass-panel"
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            borderLeft: '4px solid #ea580c',
            background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.08), rgba(0,0,0,0.15))'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ea580c', fontSize: '0.8rem', fontWeight: 700 }}>
            <span>एकूण महाप्रसाद खर्च</span>
            <UtensilsCrossed size={16} />
          </div>
          <div style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.6rem)', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
            {formatCurrency(mahaprasadTotalExpense)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '3px' }}>
            महाप्रसादाचा संपूर्ण नियोजित खर्च
          </div>
        </div>

        {/* Metric 2: Total Participants (Manakari Count) */}
        <div
          className="glass-panel"
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            borderLeft: '4px solid #f59e0b',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(0,0,0,0.15))'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700 }}>
            <span>सहभागी मानकरी</span>
            <Users size={16} />
          </div>
          <div style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.6rem)', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
            {manakariCount} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>मानकरी</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '3px' }}>
            {paidManakariCount} जमा • {pendingManakariCount} बाकी
          </div>
        </div>

        {/* Metric 3: PER-HEAD SHARE (प्रत्येकी खर्च / वाटा) - HIGHLIGHTED */}
        <div
          className="glass-panel"
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid #10b981',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.05))',
            boxShadow: '0 4px 18px rgba(16, 185, 129, 0.18)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#10b981', fontSize: '0.8rem', fontWeight: 800 }}>
            <span>⭐ प्रत्येकी खर्च (वाटा)</span>
            <Sparkles size={16} />
          </div>
          <div style={{ fontSize: 'clamp(1.35rem, 4vw, 1.75rem)', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
            {formatCurrency(perHeadShare)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-main)', fontWeight: 600, marginTop: '3px' }}>
            {manakariCount > 0 ? `₹${mahaprasadTotalExpense.toLocaleString('en-IN')} ÷ ${manakariCount} मानकरी` : 'मानकरी जोडा'}
          </div>
        </div>

        {/* Metric 4: Total Collected so far */}
        <div
          className="glass-panel"
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            borderLeft: '4px solid #3b82f6',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(0,0,0,0.15))'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#3b82f6', fontSize: '0.8rem', fontWeight: 700 }}>
            <span>एकूण जमा रक्कम</span>
            <IndianRupee size={16} />
          </div>
          <div style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.6rem)', fontWeight: 900, color: '#3b82f6', marginTop: '4px' }}>
            {formatCurrency(totalMahaprasadCollected)}
          </div>
          <div style={{ fontSize: '0.72rem', color: totalMahaprasadPending > 0 ? '#ef4444' : '#10b981', fontWeight: 700, marginTop: '3px' }}>
            {totalMahaprasadPending > 0 ? `शिल्लक: ${formatCurrency(totalMahaprasadPending)}` : '✅ १००% पूर्ण जमा!'}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px', minWidth: '200px' }}>
          <Search
            size={16}
            color="var(--text-subtle)"
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="मानकऱ्याचे नाव किंवा मोबाईल शोधा..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem', width: '100%', boxSizing: 'border-box' }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus('all')}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
          >
            सर्व ({manakariList.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterStatus === 'Paid' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus('Paid')}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.8rem',
              borderColor: filterStatus === 'Paid' ? 'transparent' : 'rgba(16, 185, 129, 0.4)',
              color: filterStatus === 'Paid' ? '#ffffff' : '#10b981'
            }}
          >
            ✅ जमा ({paidManakariCount})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterStatus === 'Pending' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus('Pending')}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.8rem',
              borderColor: filterStatus === 'Pending' ? 'transparent' : 'rgba(239, 68, 68, 0.4)',
              color: filterStatus === 'Pending' ? '#ffffff' : '#ef4444'
            }}
          >
            ⏳ बाकी ({pendingManakariCount})
          </button>
        </div>
      </div>

      {/* Manakari List / Table */}
      {filteredList.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--text-subtle)'
          }}
        >
          <UtensilsCrossed size={42} color="var(--accent-gold-light)" style={{ opacity: 0.5, margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            कोणतेही मानकरी सापडले नाहीत
          </h3>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            शोध निकष बदला किंवा नवीन मानकरी जोडा.
          </p>
        </div>
      ) : (
        <div className="manakari-cards-container">
          {/* Mobile First Devotional Cards (Visible on all screens, responsive) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '0.85rem'
            }}
          >
            {filteredList.map((m, idx) => {
              const isPaid = m.status === 'Paid';
              const shareDiff = (Number(m.paidAmount) || 0) - perHeadShare;

              return (
                <div
                  key={m.id || idx}
                  className="glass-panel"
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    position: 'relative',
                    transition: 'transform 0.15s, border-color 0.15s',
                    border: isPaid
                      ? '1px solid rgba(16, 185, 129, 0.35)'
                      : '1px solid rgba(239, 68, 68, 0.35)',
                    background: isPaid
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(0,0,0,0.18))'
                      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(0,0,0,0.18))'
                  }}
                >
                  {/* Card Top: Avatar & Name */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: isPaid
                            ? 'linear-gradient(135deg, #059669, #10b981)'
                            : 'linear-gradient(135deg, #dc2626, #ef4444)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          flexShrink: 0
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: '0.96rem',
                            color: 'var(--text-main)',
                            lineHeight: 1.25,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {m.name}
                        </div>
                        {m.address && (
                          <div
                            style={{
                              fontSize: '0.74rem',
                              color: 'var(--text-subtle)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              marginTop: '2px'
                            }}
                          >
                            <MapPin size={11} color="var(--primary-light)" />
                            <span>{m.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Paid / Pending Status Badge (Clickable toggle) */}
                    <button
                      type="button"
                      onClick={() => toggleManakariPaidStatus(m.id)}
                      title="स्थिती बदलण्यासाठी क्लिक करा"
                      style={{
                        background: isPaid ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)',
                        border: isPaid ? '1px solid #10b981' : '1px solid #ef4444',
                        color: isPaid ? '#10b981' : '#ef4444',
                        borderRadius: '999px',
                        padding: '0.2rem 0.55rem',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        flexShrink: 0
                      }}
                    >
                      {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      <span>{isPaid ? 'पूर्ण जमा' : 'शिल्लक'}</span>
                    </button>
                  </div>

                  {/* Financial Breakdown (Share vs Paid) */}
                  <div
                    style={{
                      margin: '0.85rem 0',
                      padding: '0.65rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>प्रत्येकी वाटा</div>
                      <div style={{ fontWeight: 800, color: 'var(--accent-gold-light)', fontSize: '0.92rem' }}>
                        {formatCurrency(perHeadShare)}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>पेमेंट मोड</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.78rem' }}>
                        {m.paymentMode || 'Cash'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>जमा रक्कम</div>
                      <div style={{ fontWeight: 900, color: isPaid ? '#10b981' : '#ef4444', fontSize: '0.95rem' }}>
                        {formatCurrency(m.paidAmount || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Info & Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                      {m.phone ? (
                        <a href={`tel:${m.phone}`} style={{ color: 'var(--primary-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Phone size={11} /> {m.phone}
                        </a>
                      ) : (
                        <span>दिनांक: {m.paidDate || '—'}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-icon btn-sm"
                        onClick={() => handleOpenEdit(m)}
                        title="संपादन करा"
                        style={{ width: '30px', height: '30px', padding: 0 }}
                      >
                        <Edit2 size={13} color="var(--primary-light)" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-icon btn-sm"
                        onClick={() => {
                          setDeleteTargetId(m.id);
                          setIsConfirmDeleteOpen(true);
                        }}
                        title="काढून टाका"
                        style={{ width: '30px', height: '30px', padding: 0 }}
                      >
                        <Trash2 size={13} color="#ef4444" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW MANAKARI                                                  */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '520px',
              borderRadius: '18px',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 25px rgba(16, 185, 129, 0.15)',
              overflow: 'hidden'
            }}
          >
            <div
              className="modal-header"
              style={{
                padding: '1.15rem 1.4rem',
                borderBottom: '1px solid rgba(16, 185, 129, 0.25)',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(245, 158, 11, 0.04) 100%)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                    flexShrink: 0
                  }}
                >
                  <PlusCircle size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '0.01em' }}>
                    नवीन महाप्रसाद मानकरी जोडा
                  </h2>
                  <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
                    सहभागी मानकरी व वाटा नोंदणी
                  </span>
                </div>
              </div>
              <button type="button" className="btn-close" onClick={() => setIsAddModalOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.35rem 1.4rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                    <User size={15} color="var(--accent-gold-light)" />
                    <span>मानकऱ्याचे पूर्ण नाव</span>
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="उदा. श्री. सचिन विठ्ठल शिंदे"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                      <Phone size={15} color="var(--accent-gold-light)" />
                      <span>मोबाईल क्रमांक</span>
                    </label>
                    <input
                      type="tel"
                      maxLength="10"
                      className="form-input"
                      placeholder="९८XXXXXXXX"
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                      <MapPin size={15} color="var(--accent-gold-light)" />
                      <span>पत्ता / गल्ली</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="उदा. शिंदे मळा, लेन २"
                      value={addForm.address}
                      onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                      <CheckCircle2 size={15} color="var(--accent-gold-light)" />
                      <span>जमा स्थिती (Status)</span>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setAddForm({
                            ...addForm,
                            status: 'Paid',
                            paidAmount: addForm.paidAmount || perHeadShare
                          });
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          padding: '0.62rem 0.5rem',
                          borderRadius: '9px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: addForm.status === 'Paid' ? 'rgba(16, 185, 129, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1.5px solid ${addForm.status === 'Paid' ? '#10b981' : 'var(--glass-border)'}`,
                          color: addForm.status === 'Paid' ? '#10b981' : 'var(--text-subtle)'
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>पूर्ण जमा</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddForm({
                            ...addForm,
                            status: 'Pending',
                            paidAmount: 0
                          });
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          padding: '0.62rem 0.5rem',
                          borderRadius: '9px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: addForm.status === 'Pending' ? 'rgba(245, 158, 11, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1.5px solid ${addForm.status === 'Pending' ? '#f59e0b' : 'var(--glass-border)'}`,
                          color: addForm.status === 'Pending' ? '#f59e0b' : 'var(--text-subtle)'
                        }}
                      >
                        <Clock size={14} />
                        <span>बाकी</span>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        <IndianRupee size={15} color="var(--accent-gold-light)" />
                        <span>जमा रक्कम (₹)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setAddForm({ ...addForm, paidAmount: perHeadShare, status: 'Paid' })}
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '5px',
                          background: 'rgba(251, 191, 36, 0.15)',
                          border: '1px solid rgba(251, 191, 36, 0.35)',
                          color: 'var(--accent-gold-light)',
                          cursor: 'pointer',
                          fontWeight: 700
                        }}
                        title="प्रत्येकी वाटा रक्कम भरा"
                      >
                        वाटा ₹{perHeadShare}
                      </button>
                    </div>
                    <input
                      type="number"
                      className="form-input"
                      placeholder={`उदा. ₹${perHeadShare}`}
                      value={addForm.paidAmount}
                      onChange={(e) => setAddForm({ ...addForm, paidAmount: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                      <CreditCard size={15} color="var(--accent-gold-light)" />
                      <span>पेमेंट मोड</span>
                    </label>
                    <select
                      className="form-select"
                      value={addForm.paymentMode}
                      onChange={(e) => setAddForm({ ...addForm, paymentMode: e.target.value })}
                    >
                      <option value="Cash">💵 रोख (Cash)</option>
                      <option value="UPI">📱 Google Pay / PhonePe (UPI)</option>
                      <option value="Cheque">🏦 चेक (Cheque)</option>
                      <option value="Bank Transfer">💳 बँक ट्रान्सफर (NEFT/IMPS)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                      <Calendar size={15} color="var(--accent-gold-light)" />
                      <span>जमा तारीख</span>
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={addForm.paidDate}
                      onChange={(e) => setAddForm({ ...addForm, paidDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                    <FileText size={15} color="var(--accent-gold-light)" />
                    <span>शेरा / टिप्पणी (Remarks)</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="उदा. मानकरी वाटा पूर्ण जमा"
                    value={addForm.remarks}
                    onChange={(e) => setAddForm({ ...addForm, remarks: e.target.value })}
                  />
                </div>
              </div>

              <div
                className="modal-footer"
                style={{
                  padding: '1rem 1.4rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem'
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ minHeight: '40px', padding: '0.5rem 1.15rem' }}
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    minHeight: '40px',
                    padding: '0.5rem 1.35rem',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    borderColor: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 700
                  }}
                >
                  <PlusCircle size={16} />
                  <span>मानकरी जोडा</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT MANAKARI                                                     */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div
            className="modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '520px',
              borderRadius: '18px',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 25px rgba(234, 88, 12, 0.15)',
              overflow: 'hidden'
            }}
          >
            <div
              className="modal-header"
              style={{
                padding: '1.15rem 1.4rem',
                borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
                background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.14) 0%, rgba(245, 158, 11, 0.04) 100%)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #ea580c, #f59e0b)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.35)',
                    flexShrink: 0
                  }}
                >
                  <Edit2 size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '0.01em' }}>
                    मानकरी माहिती संपादन करा
                  </h2>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold-light)', fontWeight: 600 }}>
                    वाटा हिशोब व देयक स्थिती अपडेट करा
                  </span>
                </div>
              </div>
              <button type="button" className="btn-close" onClick={() => setIsEditModalOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.35rem 1.4rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                    <User size={15} color="var(--accent-gold-light)" />
                    <span>मानकऱ्याचे नाव</span>
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                      <Phone size={15} color="var(--accent-gold-light)" />
                      <span>मोबाईल क्रमांक</span>
                    </label>
                    <input
                      type="tel"
                      maxLength="10"
                      className="form-input"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                      <MapPin size={15} color="var(--accent-gold-light)" />
                      <span>पत्ता / गल्ली</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                      <CheckCircle2 size={15} color="var(--accent-gold-light)" />
                      <span>जमा स्थिती (Status)</span>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditForm({
                            ...editForm,
                            status: 'Paid',
                            paidAmount: editForm.paidAmount || perHeadShare
                          });
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          padding: '0.62rem 0.5rem',
                          borderRadius: '9px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: editForm.status === 'Paid' ? 'rgba(16, 185, 129, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1.5px solid ${editForm.status === 'Paid' ? '#10b981' : 'var(--glass-border)'}`,
                          color: editForm.status === 'Paid' ? '#10b981' : 'var(--text-subtle)'
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>पूर्ण जमा</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditForm({
                            ...editForm,
                            status: 'Pending',
                            paidAmount: 0
                          });
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          padding: '0.62rem 0.5rem',
                          borderRadius: '9px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: editForm.status === 'Pending' ? 'rgba(245, 158, 11, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1.5px solid ${editForm.status === 'Pending' ? '#f59e0b' : 'var(--glass-border)'}`,
                          color: editForm.status === 'Pending' ? '#f59e0b' : 'var(--text-subtle)'
                        }}
                      >
                        <Clock size={14} />
                        <span>बाकी</span>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        <IndianRupee size={15} color="var(--accent-gold-light)" />
                        <span>जमा रक्कम (₹)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, paidAmount: perHeadShare, status: 'Paid' })}
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '5px',
                          background: 'rgba(251, 191, 36, 0.15)',
                          border: '1px solid rgba(251, 191, 36, 0.35)',
                          color: 'var(--accent-gold-light)',
                          cursor: 'pointer',
                          fontWeight: 700
                        }}
                        title="प्रत्येकी वाटा रक्कम भरा"
                      >
                        वाटा ₹{perHeadShare}
                      </button>
                    </div>
                    <input
                      type="number"
                      className="form-input"
                      value={editForm.paidAmount}
                      onChange={(e) => setEditForm({ ...editForm, paidAmount: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                      <CreditCard size={15} color="var(--accent-gold-light)" />
                      <span>पेमेंट मोड</span>
                    </label>
                    <select
                      className="form-select"
                      value={editForm.paymentMode}
                      onChange={(e) => setEditForm({ ...editForm, paymentMode: e.target.value })}
                    >
                      <option value="Cash">💵 रोख (Cash)</option>
                      <option value="UPI">📱 Google Pay / PhonePe (UPI)</option>
                      <option value="Cheque">🏦 चेक (Cheque)</option>
                      <option value="Bank Transfer">💳 बँक ट्रान्सफर (NEFT/IMPS)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                      <Calendar size={15} color="var(--accent-gold-light)" />
                      <span>जमा तारीख</span>
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={editForm.paidDate}
                      onChange={(e) => setEditForm({ ...editForm, paidDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                    <FileText size={15} color="var(--accent-gold-light)" />
                    <span>शेरा (Remarks)</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.remarks}
                    onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                  />
                </div>
              </div>

              <div
                className="modal-footer"
                style={{
                  padding: '1rem 1.4rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem'
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ minHeight: '40px', padding: '0.5rem 1.15rem' }}
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    minHeight: '40px',
                    padding: '0.5rem 1.35rem',
                    background: 'linear-gradient(135deg, #ea580c, #f59e0b)',
                    borderColor: '#ea580c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 700
                  }}
                >
                  <Check size={16} />
                  <span>अपडेट करा</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MAHAPRASAD SETTINGS & TOTAL EXPENSE                               */}
      {/* ========================================================================= */}
      {isSettingsModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingsModalOpen(false)}>
          <div
            className="modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '520px',
              borderRadius: '18px',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 25px rgba(245, 158, 11, 0.15)',
              overflow: 'hidden'
            }}
          >
            <div
              className="modal-header"
              style={{
                padding: '1.15rem 1.4rem',
                borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(234, 88, 12, 0.04) 100%)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
                    flexShrink: 0
                  }}
                >
                  <Settings size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '0.01em' }}>
                    महाप्रसाद हिशोब व एकूण खर्च सेटिंग्ज
                  </h2>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold-light)', fontWeight: 600 }}>
                    एकूण खर्च व प्रत्येकी वाटा व्यवस्थापन
                  </span>
                </div>
              </div>
              <button type="button" className="btn-close" onClick={() => setIsSettingsModalOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSettingsSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.35rem 1.4rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                    <UtensilsCrossed size={15} color="var(--accent-gold-light)" />
                    <span>महाप्रसाद कार्यक्रमाचे नाव</span>
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={settingsForm.title}
                    onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                    <IndianRupee size={15} color="var(--accent-gold-light)" />
                    <span>एकूण महाप्रसाद खर्च (Total Expense ₹)</span>
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={settingsForm.totalExpense}
                    onChange={(e) => setSettingsForm({ ...settingsForm, totalExpense: e.target.value })}
                  />
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: '#10b981',
                      fontWeight: 700,
                      marginTop: '6px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>💡</span>
                    <span>
                      नवीन प्रत्येकी खर्च: <strong>₹{manakariCount > 0 ? Math.round(Number(settingsForm.totalExpense || 0) / manakariCount).toLocaleString('en-IN') : 0}</strong> (एकूण {manakariCount} मानकऱ्यांमध्ये समसमान विभागणी)
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                    <Calendar size={15} color="var(--accent-gold-light)" />
                    <span>महाप्रसाद तारीख</span>
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={settingsForm.date}
                    onChange={(e) => setSettingsForm({ ...settingsForm, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                    <FileText size={15} color="var(--accent-gold-light)" />
                    <span>अधिकृत संदेश / नोंद (Notes)</span>
                  </label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="उदा. सर्व भाविक व मानकऱ्यांचे मनःपूर्वक आभार..."
                    value={settingsForm.notes}
                    onChange={(e) => setSettingsForm({ ...settingsForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div
                className="modal-footer"
                style={{
                  padding: '1rem 1.4rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem'
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsSettingsModalOpen(false)}
                  style={{ minHeight: '40px', padding: '0.5rem 1.15rem' }}
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    minHeight: '40px',
                    padding: '0.5rem 1.35rem',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    borderColor: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 700
                  }}
                >
                  <Check size={16} />
                  <span>सेव्ह करा</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="मानकरी काढून टाका?"
        message="तुम्हाला खात्री आहे का की हा मानकरी यादीतून काढून टाकायचा आहे?"
      />
    </div>
  );
};

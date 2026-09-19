import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PavtiModal } from '../components/PavtiModal';
import confetti from 'canvas-confetti';
import {
  FilePlus,
  RotateCcw,
  Printer,
  Calendar,
  User,
  Phone,
  MapPin,
  IndianRupee,
  CreditCard,
  HeartHandshake,
  UserCheck,
  FileText
} from 'lucide-react';
import { numberToWordsMr, numberToWordsEn, formatCurrency } from '../i18n/numberToWords';

export const CreatePavti = () => {
  const { lang, t } = useLanguage();
  const { getNextPavtiNo, createPavti, mandalSettings, addToast } = useData();
  const { isAdmin } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const [formData, setFormData] = useState({
    date: todayStr,
    time: currentTime,
    donorName: '',
    mobile: '',
    address: '',
    amount: '',
    paymentMode: 'Cash',
    refNo: '',
    donationType: 'Vargani',
    receivedBy: mandalSettings.treasurer || 'श्री. तुकाराम शिंदे',
    remarks: ''
  });

  const [errors, setErrors] = useState({});
  const [createdPavti, setCreatedPavti] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextPavtiNo = getNextPavtiNo();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleQuickAmount = (val) => {
    const current = Number(formData.amount) || 0;
    handleInputChange('amount', current + val);
  };

  const validate = () => {
    const errs = {};
    if (!formData.donorName.trim()) {
      errs.donorName = t('valNameRequired');
    }
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (formData.mobile && cleanMobile.length !== 10) {
      errs.mobile = t('valMobileInvalid');
    }
    const amt = Number(formData.amount);
    if (!amt || amt <= 0 || isNaN(amt)) {
      errs.amount = t('valAmountRequired');
    }
    if (!formData.receivedBy.trim()) {
      errs.receivedBy = t('valReceivedByRequired');
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isAdmin) {
      addToast(t('readOnlyWarning'), 'error');
      return;
    }

    if (!validate()) {
      return;
    }

    const saved = createPavti(formData);
    setCreatedPavti(saved);
    addToast(t('toastPavtiCreated'), 'success');

    // Launch festive confetti celebration!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff7722', '#f59e0b', '#10b981', '#fbbf24']
      });
    } catch {
      // Ignore if confetti fails
    }

    // Open A5 receipt modal immediately
    setIsModalOpen(true);

    // Reset form for next donor
    setFormData({
      date: todayStr,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      donorName: '',
      mobile: '',
      address: '',
      amount: '',
      paymentMode: 'Cash',
      refNo: '',
      donationType: 'Vargani',
      receivedBy: mandalSettings.treasurer || 'श्री. तुकाराम शिंदे',
      remarks: ''
    });
  };

  const handleReset = () => {
    setFormData({
      date: todayStr,
      time: currentTime,
      donorName: '',
      mobile: '',
      address: '',
      amount: '',
      paymentMode: 'Cash',
      refNo: '',
      donationType: 'Vargani',
      receivedBy: mandalSettings.treasurer || 'श्री. तुकाराम शिंदे',
      remarks: ''
    });
    setErrors({});
  };

  const amountInWords = formData.amount
    ? lang === 'mr'
      ? numberToWordsMr(formData.amount)
      : numberToWordsEn(formData.amount)
    : '';

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '2rem 2.25rem' }}>
        {/* Form Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--glass-border)',
            paddingBottom: '1.25rem',
            marginBottom: '1.75rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
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
              <FilePlus size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {t('createPavtiTitle')}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', margin: '2px 0 0' }}>
                {mandalSettings.mandalName || t('mandalDefaultName')}
              </p>
            </div>
          </div>

          {/* Sequential Auto Pavti Badge */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              background: 'rgba(251, 191, 36, 0.12)',
              border: '1px solid rgba(251, 191, 36, 0.35)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-subtle)' }}>
              {t('pavtiNo')} (Auto)
            </span>
            <strong style={{ fontSize: '1.15rem', color: 'var(--accent-gold-light)', letterSpacing: '0.04em' }}>
              {nextPavtiNo}
            </strong>
          </div>
        </div>

        {/* Create Pavti Form */}
        <form onSubmit={handleSubmit}>
          {/* Row 1: Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                <Calendar size={15} />
                <span>{t('date')}</span>
                <span className="required-star">*</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FileText size={15} />
                <span>{t('pavtiNo')}</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={nextPavtiNo}
                disabled
                style={{ opacity: 0.8, cursor: 'not-allowed', backgroundColor: 'rgba(255,255,255,0.04)' }}
              />
            </div>
          </div>

          {/* Row 2: Donor Name & Mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                <User size={15} />
                <span>{t('donorName')} (देणगीदाराचे नाव)</span>
                <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="उदा. श्री. सचिन रमेश पाटील"
                value={formData.donorName}
                onChange={(e) => handleInputChange('donorName', e.target.value)}
                style={{ borderColor: errors.donorName ? '#f87171' : '' }}
              />
              {errors.donorName && <span className="form-error">{errors.donorName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Phone size={15} />
                <span>{t('mobileNumber')} (१० अंकी)</span>
              </label>
              <input
                type="tel"
                className="form-input"
                placeholder="उदा. 9822123456"
                maxLength={10}
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                style={{ borderColor: errors.mobile ? '#f87171' : '' }}
              />
              {errors.mobile && <span className="form-error">{errors.mobile}</span>}
            </div>
          </div>

          {/* Row 3: Address / Area */}
          <div className="form-group">
            <label className="form-label">
              <MapPin size={15} />
              <span>{t('addressArea')} (पत्ता / परिसर)</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="उदा. प्लॉट क्र. १२, शिंदे मळा, सातारा"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </div>

          {/* Row 4: Amount & Words */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                <IndianRupee size={15} />
                <span>{t('amount')} (रक्कम ₹)</span>
                <span className="required-star">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                className="form-input"
                placeholder="उदा. 501"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  borderColor: errors.amount ? '#f87171' : ''
                }}
              />
              {errors.amount && <span className="form-error">{errors.amount}</span>}

              {/* Quick Amount Chips */}
              <div className="quick-chips-grid">
                {[101, 251, 501, 1001, 2100, 5001, 11000].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className="chip-btn"
                    onClick={() => handleQuickAmount(chip)}
                  >
                    +₹{chip.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <FileText size={15} />
                <span>{t('amountInWords')} (अक्षरी)</span>
              </label>
              <div
                style={{
                  minHeight: '48px',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px dashed var(--glass-border)',
                  color: 'var(--accent-gold-light)',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {amountInWords || 'रक्कम प्रविष्ट केल्यावर येथे अक्षरी दिसेल'}
              </div>
            </div>
          </div>

          {/* Row 5: Payment Mode, Ref No & Donation Type */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                <CreditCard size={15} />
                <span>{t('paymentMode')}</span>
              </label>
              <select
                className="form-select"
                value={formData.paymentMode}
                onChange={(e) => handleInputChange('paymentMode', e.target.value)}
              >
                <option value="Cash">{t('modeCash')}</option>
                <option value="UPI">{t('modeUPI')}</option>
                <option value="Bank Transfer">{t('modeBank')}</option>
                <option value="Cheque">{t('modeCheque')}</option>
              </select>
            </div>

            {formData.paymentMode !== 'Cash' && (
              <div className="form-group">
                <label className="form-label">
                  <CreditCard size={15} />
                  <span>{t('chequeOrRefNo')}</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="UPI UTR / Cheque / Ref ID"
                  value={formData.refNo}
                  onChange={(e) => handleInputChange('refNo', e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <HeartHandshake size={15} />
                <span>{t('donationType')}</span>
              </label>
              <select
                className="form-select"
                value={formData.donationType}
                onChange={(e) => handleInputChange('donationType', e.target.value)}
              >
                <option value="Vargani">{t('typeVargani')}</option>
                <option value="Denagi">{t('typeDenagi')}</option>
                <option value="Navas">{t('typeNavas')}</option>
                <option value="Other">{t('typeOther')}</option>
              </select>
            </div>
          </div>

          {/* Row 6: Received By & Remarks */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                <UserCheck size={15} />
                <span>{t('receivedBy')}</span>
                <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="स्वीकारणाऱ्याचे नाव"
                value={formData.receivedBy}
                onChange={(e) => handleInputChange('receivedBy', e.target.value)}
                style={{ borderColor: errors.receivedBy ? '#f87171' : '' }}
              />
              {errors.receivedBy && <span className="form-error">{errors.receivedBy}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <FileText size={15} />
                <span>{t('remarks')}</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="उदा. आरती प्रायोजक, महाप्रसाद देणगी"
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
              />
            </div>
          </div>

          {/* Form Submit & Reset Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '1rem',
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--glass-border)'
            }}
          >
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              <RotateCcw size={16} />
              <span>{t('resetForm')}</span>
            </button>

            <button type="submit" className="btn btn-primary" style={{ minWidth: '180px' }}>
              <Printer size={18} />
              <span>{t('saveAndPrint')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* A5 Printable Pavti Modal */}
      <PavtiModal
        isOpen={isModalOpen}
        pavti={createdPavti}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
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
  FileText,
  Share2,
  Download,
  CheckCircle2,
  X,
  Eye
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
  const [quickSharePavti, setQuickSharePavti] = useState(null);

  // Auto-dismiss the quick WhatsApp & Download PDF banner after 3.5 seconds
  useEffect(() => {
    if (!quickSharePavti) return;
    const timer = setTimeout(() => {
      setQuickSharePavti(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [quickSharePavti]);

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

  const handleQuickWhatsApp = (pavti) => {
    const rawMobile = (pavti.mobile || '').replace(/\D/g, '');
    const cleanMobile = rawMobile.length === 10 ? `91${rawMobile}` : rawMobile;

    const wordsMr = numberToWordsMr(pavti.amount);
    const wordsEn = numberToWordsEn(pavti.amount);
    const formattedAmt = formatCurrency(pavti.amount);

    const mandalTitle = mandalSettings.mandalName || 'शिंदे मळा गणेश उत्सव मंडळ';
    const textMarathi = `॥ गणपती बाप्पा मोरया ॥\n\nसस्नेह नमस्कार,\n*${mandalTitle}* कडून आपल्या देणगीची पावती तपशील:\n\n📜 *पावती क्र.:* ${pavti.pavtiNo}\n📅 *तारीख:* ${pavti.date}\n👤 *देणगीदार:* ${pavti.donorName}\n💰 *रक्कम:* ${formattedAmt}\n📝 *अक्षरी:* ${wordsMr}\n💳 *पेमेंट मोड:* ${pavti.paymentMode} ${pavti.refNo ? `(${pavti.refNo})` : ''}\n🙏 *देणगी प्रकार:* ${pavti.donationType}\n✍️ *स्वीकारकर्ता:* ${pavti.receivedBy || mandalSettings.treasurer || 'व्यवस्थापक'}\n\nआपल्या मोलाच्या योगदानाबद्दल मनःपूर्वक धन्यवाद! श्री गणरायाच्या कृपेने आपल्या सर्व मनोकामना पूर्ण होवोत!\n\n_शिंदे मळा गणेश उत्सव मंडळ, शिंदे मळा_`;

    const textEnglish = `|| Ganpati Bappa Morya ||\n\nDear Devotee,\n*${mandalSettings.mandalNameEn || mandalTitle}* has received your generous contribution:\n\n📜 *Receipt No.:* ${pavti.pavtiNo}\n📅 *Date:* ${pavti.date}\n👤 *Donor:* ${pavti.donorName}\n💰 *Amount:* ${formattedAmt}\n📝 *In Words:* ${wordsEn}\n💳 *Mode:* ${pavti.paymentMode} ${pavti.refNo ? `(${pavti.refNo})` : ''}\n🙏 *Type:* ${pavti.donationType}\n✍️ *Received By:* ${pavti.receivedBy || mandalSettings.treasurer || 'Manager'}\n\nThank you heartfelt for your support! May Lord Ganesha bless you and your family!\n\n_Shinde Mala Ganesh Utsav Mandal_`;

    const message = lang === 'mr' ? textMarathi : textEnglish;
    const url = `https://wa.me/${cleanMobile}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
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
    setQuickSharePavti(saved);
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

    // Reset form for next donor immediately without requiring refresh
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
    <div style={{ maxWidth: '920px', margin: '0 auto', width: '100%', position: 'relative' }}>
      {/* Immediate Quick WhatsApp Share & PDF Download Banner (Active for 3.5 seconds) */}
      {quickSharePavti && (
        <div
          style={{
            position: 'fixed',
            top: '75px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2000,
            width: '92%',
            maxWidth: '520px',
            backgroundColor: 'rgba(20, 10, 28, 0.96)',
            backdropFilter: 'blur(20px)',
            border: '2px solid #10b981',
            borderRadius: '16px',
            padding: '1.1rem 1.25rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 35px rgba(16, 185, 129, 0.4)',
            animation: 'slideDownQuick 0.35s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.25)', border: '1.5px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.01em' }}>
                  पावती यशस्वीरीत्या तयार झाली! 🎉
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  <strong style={{ color: 'var(--accent-gold-light)' }}>{quickSharePavti.pavtiNo}</strong> • {quickSharePavti.donorName} (<strong style={{ color: '#34d399' }}>₹{quickSharePavti.amount}</strong>)
                </p>
              </div>
            </div>
            <button
              onClick={() => setQuickSharePavti(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '4px' }}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Prominent Action Buttons: WhatsApp Share & Download PDF */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.65rem' }}>
            <button
              className="btn btn-whatsapp"
              onClick={() => handleQuickWhatsApp(quickSharePavti)}
              style={{ justifyContent: 'center', padding: '0.65rem 0.85rem', fontSize: '0.9rem', fontWeight: 800 }}
              title="Share on WhatsApp"
            >
              <Share2 size={17} />
              <span>{t('shareWhatsApp')}</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setCreatedPavti(quickSharePavti);
                setIsModalOpen(true);
                setQuickSharePavti(null);
              }}
              style={{ justifyContent: 'center', padding: '0.65rem 0.85rem', fontSize: '0.9rem', fontWeight: 800, backgroundColor: '#2563eb', borderColor: '#3b82f6' }}
              title="Download PDF"
            >
              <Download size={17} />
              <span>{t('downloadPdf')}</span>
            </button>
          </div>

          {/* Quick link & Timer indication */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
            <button
              onClick={() => {
                setCreatedPavti(quickSharePavti);
                setIsModalOpen(true);
                setQuickSharePavti(null);
              }}
              style={{ background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <Eye size={13} />
              <span>संपूर्ण पावती पाहा (View Pavti)</span>
            </button>
            <span>३ सेकंदात बंद होईल...</span>
          </div>

          {/* 3.5s Progress Bar */}
          <div style={{ height: '3px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '2px', marginTop: '0.55rem', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                backgroundColor: '#10b981',
                animation: 'shrinkWidth 3.5s linear forwards'
              }}
            />
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ padding: 'clamp(0.85rem, 3.5vw, 1.75rem)' }}>
        {/* Form Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--glass-border)',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                backgroundColor: 'rgba(230, 81, 0, 0.18)',
                border: '1px solid rgba(230, 81, 0, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff7722',
                flexShrink: 0
              }}
            >
              <FilePlus size={22} />
            </div>
            <div>
              <h2 className="text-page-title" style={{ fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {t('createPavtiTitle')}
              </h2>
              <p className="text-subtext-responsive" style={{ color: 'var(--text-subtle)', margin: '2px 0 0' }}>
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
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <span style={{ fontSize: 'var(--font-subtext)', fontWeight: 600, color: 'var(--text-subtle)' }}>
              {t('pavtiNo')} (Auto)
            </span>
            <strong style={{ fontSize: 'clamp(1rem, 3.5vw, 1.25rem)', color: 'var(--accent-gold-light)', letterSpacing: '0.04em' }}>
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
              placeholder="उदा. प्लॉट क्र. १२, शिंदे मळा, हिंगणी दुमाला"
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
              gap: '0.75rem',
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--glass-border)',
              flexWrap: 'wrap'
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              style={{ flex: '1 1 120px', minHeight: '44px', fontSize: 'var(--font-btn)' }}
            >
              <RotateCcw size={16} />
              <span>{t('resetForm')}</span>
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: '2 1 180px', minHeight: '44px', fontSize: 'var(--font-btn)' }}
            >
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

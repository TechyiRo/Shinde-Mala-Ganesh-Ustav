import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Printer, Download, Share2, X } from 'lucide-react';
import { numberToWordsMr, numberToWordsEn, formatCurrency } from '../i18n/numberToWords';

export const PavtiModal = ({ isOpen, pavti, onClose }) => {
  const { lang, t } = useLanguage();
  const { mandalSettings } = useData();

  if (!isOpen || !pavti) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const rawMobile = (pavti.mobile || '').replace(/\D/g, '');
    const cleanMobile = rawMobile.length === 10 ? `91${rawMobile}` : rawMobile;

    const wordsMr = numberToWordsMr(pavti.amount);
    const wordsEn = numberToWordsEn(pavti.amount);
    const formattedAmt = formatCurrency(pavti.amount);

    const mandalTitle = mandalSettings.mandalName || 'शिंदे मळा गणेश उत्सव मंडळ';
    const textMarathi = `॥ गणपती बाप्पा मोरया ॥\n\nसस्नेह नमस्कार,\n*${mandalTitle}* कडून आपल्या देणगीची पावती तपशील:\n\n📜 *पावती क्र.:* ${pavti.pavtiNo}\n📅 *तारीख:* ${pavti.date}\n👤 *देणगीदार:* ${pavti.donorName}\n💰 *रक्कम:* ${formattedAmt}\n📝 *अक्षरी:* ${wordsMr}\n💳 *पेमेंट मोड:* ${pavti.paymentMode} ${pavti.refNo ? `(${pavti.refNo})` : ''}\n🙏 *देणगी प्रकार:* ${pavti.donationType}\n✍️ *स्वीकारकर्ता:* ${pavti.receivedBy}\n\nआपल्या मोलाच्या योगदानाबद्दल मनःपूर्वक धन्यवाद! श्री गणरायाच्या कृपेने आपल्या सर्व मनोकामना पूर्ण होवोत!\n\n_शिंदे मळा गणेश उत्सव मंडळ, सातारा_`;

    const textEnglish = `|| Ganpati Bappa Morya ||\n\nDear Devotee,\n*${mandalSettings.mandalNameEn || mandalTitle}* has received your generous contribution:\n\n📜 *Receipt No.:* ${pavti.pavtiNo}\n📅 *Date:* ${pavti.date}\n👤 *Donor:* ${pavti.donorName}\n💰 *Amount:* ${formattedAmt}\n📝 *In Words:* ${wordsEn}\n💳 *Mode:* ${pavti.paymentMode} ${pavti.refNo ? `(${pavti.refNo})` : ''}\n🙏 *Type:* ${pavti.donationType}\n✍️ *Received By:* ${pavti.receivedBy}\n\nThank you heartfelt for your support! May Lord Ganesha bless you and your family!\n\n_Shinde Mala Ganesh Utsav Mandal_`;

    const message = lang === 'mr' ? textMarathi : textEnglish;
    const url = `https://wa.me/${cleanMobile}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const amountInWordsText = lang === 'mr' ? numberToWordsMr(pavti.amount) : numberToWordsEn(pavti.amount);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px', padding: '1.25rem', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Header (Hidden on Print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--glass-border)',
            paddingBottom: '0.85rem',
            marginBottom: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/ganesh-icon.svg" alt="Ganesh" style={{ width: '32px', height: '32px' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              {t('receiptTitle')} — <span style={{ color: 'var(--accent-gold-light)' }}>{pavti.pavtiNo}</span>
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn btn-whatsapp btn-sm" onClick={handleWhatsApp} title="Share on WhatsApp">
              <Share2 size={16} />
              <span>{t('shareWhatsApp')}</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={handlePrint} title="Print A5">
              <Printer size={16} />
              <span>{t('printReceipt')}</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-subtle)',
                cursor: 'pointer',
                padding: '4px',
                marginLeft: '4px'
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Printable A5 Pavti Sheet */}
        <div
          className="a5-receipt-sheet"
          style={{
            background: 'linear-gradient(180deg, #fffdf8 0%, #fff7eb 100%)',
            color: '#1a1006',
            border: '2px solid #b45309',
            borderRadius: '16px',
            padding: '1.5rem',
            position: 'relative',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
            fontFamily: "'Mukta', 'Noto Sans Devanagari', sans-serif"
          }}
        >
          {/* Watermark Motif */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.05,
              pointerEvents: 'none',
              zIndex: 0
            }}
          >
            <img src="/ganesh-icon.svg" alt="Watermark" style={{ width: '280px', height: '280px' }} />
          </div>

          {/* Top Tagline */}
          <div
            style={{
              textAlign: 'center',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#c2410c',
              letterSpacing: '0.05em',
              marginBottom: '0.25rem'
            }}
          >
            {mandalSettings.tagline || '॥ श्री गणेशाय नमः ॥ गणपती बाप्पा मोरया'}
          </div>

          {/* Mandal Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px dashed #d97706',
              paddingBottom: '0.75rem',
              marginBottom: '1rem',
              position: 'relative',
              zIndex: 1
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <img
                src="/ganesh-icon.svg"
                alt="Logo"
                style={{ width: '56px', height: '56px', filter: 'drop-shadow(0 2px 4px rgba(230,81,0,0.25))' }}
              />
              <div>
                <h1
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    color: '#7c2d12',
                    lineHeight: '1.2',
                    margin: 0
                  }}
                >
                  {mandalSettings.mandalName || 'शिंदे मळा गणेश उत्सव मंडळ'}
                </h1>
                <p style={{ fontSize: '0.82rem', color: '#78350f', margin: '2px 0 0' }}>
                  {mandalSettings.regNo || 'नोंदणी क्र. महा/१२४५/२०१२'} | {mandalSettings.address || 'सातारा'}
                </p>
              </div>
            </div>

            <div
              style={{
                textAlign: 'right',
                border: '1px solid #d97706',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(254, 243, 199, 0.6)'
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9a3412', textTransform: 'uppercase' }}>
                {t('receiptDevoteeCopy')}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#b45309' }}>
                {mandalSettings.year || '2026'}
              </div>
            </div>
          </div>

          {/* Receipt Info Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(254, 243, 199, 0.7)',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #fde68a',
              marginBottom: '1rem',
              position: 'relative',
              zIndex: 1
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: '#78350f', fontWeight: 600 }}>{t('pavtiNo')}: </span>
              <strong style={{ fontSize: '1rem', color: '#b45309' }}>{pavti.pavtiNo}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#78350f', fontWeight: 600 }}>{t('receiptDate')}: </span>
              <strong style={{ fontSize: '0.92rem', color: '#1a1006' }}>
                {pavti.date} {pavti.time ? `(${pavti.time})` : ''}
              </strong>
            </div>
          </div>

          {/* Donor Details Table */}
          <div style={{ position: 'relative', zIndex: 1, marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '0.35rem 0', width: '28%', color: '#78350f', fontWeight: 600, fontSize: '0.92rem' }}>
                    {t('donorName')}:
                  </td>
                  <td style={{ padding: '0.35rem 0', fontWeight: 700, fontSize: '1.05rem', color: '#1a1006' }}>
                    {pavti.donorName}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.35rem 0', color: '#78350f', fontWeight: 600, fontSize: '0.92rem' }}>
                    {t('mobileNumber')}:
                  </td>
                  <td style={{ padding: '0.35rem 0', fontWeight: 600, fontSize: '0.95rem', color: '#1a1006' }}>
                    {pavti.mobile || '—'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.35rem 0', color: '#78350f', fontWeight: 600, fontSize: '0.92rem' }}>
                    {t('addressArea')}:
                  </td>
                  <td style={{ padding: '0.35rem 0', color: '#332211', fontSize: '0.92rem' }}>
                    {pavti.address || 'स्थानिक'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.35rem 0', color: '#78350f', fontWeight: 600, fontSize: '0.92rem' }}>
                    {t('donationType')}:
                  </td>
                  <td style={{ padding: '0.35rem 0', color: '#1a1006', fontWeight: 600 }}>
                    <span
                      style={{
                        padding: '0.15rem 0.55rem',
                        borderRadius: '6px',
                        backgroundColor: '#fed7aa',
                        color: '#9a3412',
                        fontSize: '0.85rem'
                      }}
                    >
                      {t(`type${pavti.donationType}`) || pavti.donationType}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.35rem 0', color: '#78350f', fontWeight: 600, fontSize: '0.92rem' }}>
                    {t('paymentMode')}:
                  </td>
                  <td style={{ padding: '0.35rem 0', color: '#1a1006', fontWeight: 600, fontSize: '0.92rem' }}>
                    {t(`mode${pavti.paymentMode}`) || pavti.paymentMode} {pavti.refNo ? `[${pavti.refNo}]` : ''}
                  </td>
                </tr>
                {pavti.remarks && (
                  <tr>
                    <td style={{ padding: '0.35rem 0', color: '#78350f', fontWeight: 600, fontSize: '0.92rem' }}>
                      {t('remarks')}:
                    </td>
                    <td style={{ padding: '0.35rem 0', color: '#4b3b2b', fontStyle: 'italic', fontSize: '0.88rem' }}>
                      {pavti.remarks}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Big Highlight Amount Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fef3c7',
              border: '2px solid #f59e0b',
              borderRadius: '12px',
              padding: '0.75rem 1.25rem',
              marginBottom: '1rem',
              position: 'relative',
              zIndex: 1
            }}
          >
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>
                {t('amountInWords')}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#78350f' }}>
                {amountInWordsText}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400e' }}>
                {t('amount')}
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b45309' }}>
                {formatCurrency(pavti.amount)}
              </div>
            </div>
          </div>

          {/* Blessing Message */}
          <div
            style={{
              textAlign: 'center',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#9a3412',
              fontStyle: 'italic',
              marginBottom: '1.25rem',
              position: 'relative',
              zIndex: 1
            }}
          >
            {t('receiptBlessing')}
          </div>

          {/* Signatures */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              paddingTop: '1.25rem',
              borderTop: '1px solid #e5e7eb',
              position: 'relative',
              zIndex: 1
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '35px' }}></div>
              <div style={{ width: '150px', borderTop: '1px solid #78350f', margin: '0 auto 4px' }}></div>
              <div style={{ fontSize: '0.82rem', color: '#78350f', fontWeight: 600 }}>
                {t('receiptDevoteeSign')}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: '#1a1006', fontWeight: 700, marginBottom: '4px' }}>
                {pavti.receivedBy || mandalSettings.treasurer}
              </div>
              <div style={{ width: '180px', borderTop: '1px solid #78350f', margin: '0 auto 4px' }}></div>
              <div style={{ fontSize: '0.82rem', color: '#78350f', fontWeight: 600 }}>
                {t('receiptAuthorizedSign')}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Close Footer (Hidden on Print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.25rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--glass-border)'
          }}
        >
          <button className="btn btn-secondary" onClick={onClose}>
            {t('close')}
          </button>
          <button className="btn btn-whatsapp" onClick={handleWhatsApp}>
            <Share2 size={16} />
            <span>{t('shareWhatsApp')}</span>
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>{t('printReceipt')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

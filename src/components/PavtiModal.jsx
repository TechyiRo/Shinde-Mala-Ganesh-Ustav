import React, { useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Printer, Download, Share2, X, Loader2 } from 'lucide-react';
import { numberToWordsMr, numberToWordsEn, formatCurrency } from '../i18n/numberToWords';
import html2pdf from 'html2pdf.js';

export const PavtiModal = ({ isOpen, pavti, onClose, isPublic = false }) => {
  const { lang, t } = useLanguage();
  const { mandalSettings } = useData();
  const receiptRef = useRef(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen || !pavti) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsGeneratingPdf(true);
    try {
      // Ensure web fonts are completely loaded before rendering canvas
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const element = receiptRef.current;
      const cleanPavtiNo = (pavti.pavtiNo || 'Receipt').replace(/[^a-zA-Z0-9_-]/g, '_');
      
      const opt = {
        margin: [4, 4, 4, 4], // mm margins
        filename: `Pavti_${cleanPavtiNo}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2.5,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          letterRendering: true,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: {
          unit: 'mm',
          format: 'a5',
          orientation: 'landscape',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF download error:', err);
      // Fallback to native print / save as PDF
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleWhatsApp = () => {
    const rawMobile = (pavti.mobile || '').replace(/\D/g, '');
    const cleanMobile = rawMobile.length === 10 ? `91${rawMobile}` : rawMobile;

    const wordsMr = numberToWordsMr(pavti.amount);
    const wordsEn = numberToWordsEn(pavti.amount);
    const formattedAmt = formatCurrency(pavti.amount);

    const mandalTitle = mandalSettings.mandalName || 'शिंदे मळा गणेश उत्सव मंडळ';
    const textMarathi =
`🚩 *॥ श्री गणेशाय नमः ॥* 🚩
🌸 *॥ गणपती बाप्पा मोरया ॥* 🌸

सस्नेह नमस्कार, *${pavti.donorName}* जी 🙏
*${mandalTitle}* कडून आपल्या देणगीची अधिकृत पावती तपशील खालीलप्रमाणे:

━━━━━━━━━━━━━━━━━━━━
📜 *पावती क्रमांक:* *${pavti.pavtiNo}*
📅 *दिनांक:* ${pavti.date}
👤 *देणगीदार:* *${pavti.donorName}*
💰 *देणगी रक्कम:* *${formattedAmt}*
📝 *अक्षरी रक्कम:* ${wordsMr}
💳 *पेमेंट पद्धत:* ${pavti.paymentMode}${pavti.refNo ? ` (Ref: ${pavti.refNo})` : ''}
🙏 *देणगी प्रकार:* ${pavti.donationType || 'वर्गणी'}
✍️ *पावती देणारे:* ${pavti.receivedBy || mandalSettings.treasurer || 'व्यवस्थापक'}
━━━━━━━━━━━━━━━━━━━━

🌺 *आपल्या मोलाच्या सहकार्याबद्दल मनःपूर्वक धन्यवाद!*
श्री गणरायाच्या कृपेने आपल्या कुटुंबात सुख, समृद्धी, उत्तम आरोग्य व भरभराट लाभो, हीच बाप्पाच्या चरणी प्रार्थना! 🙏✨

━━━━━━━━━━━━━━━━━━━━
🌐 *मंडळाच्या अधिकृत वेबसाईटला अवश्य भेट द्या:*
👉 *https://shindemala.vercel.app/*

_(थेट उत्सव दर्शन, दैनंदिन फोटो, जमा-खर्च हिशोब व महाप्रसाद यादी पाहण्यासाठी वरील लिंकवर क्लिक करा)_
━━━━━━━━━━━━━━━━━━━━
_🚩 शिंदे मळा गणेश उत्सव मंडळ, शिंदे मळा (हिंगणी दुमाला) 🚩_`;

    const textEnglish =
`🚩 *|| Shree Ganeshay Namah ||* 🚩
🌸 *|| Ganpati Bappa Morya ||* 🌸

Dear *${pavti.donorName}* Devotee 🙏
Thank you for your generous contribution to *${mandalSettings.mandalNameEn || mandalTitle}*. Here is your official donation receipt:

━━━━━━━━━━━━━━━━━━━━
📜 *Receipt No.:* *${pavti.pavtiNo}*
📅 *Date:* ${pavti.date}
👤 *Donor Name:* *${pavti.donorName}*
💰 *Amount Received:* *${formattedAmt}*
📝 *Amount in Words:* ${wordsEn}
💳 *Payment Mode:* ${pavti.paymentMode}${pavti.refNo ? ` (Ref: ${pavti.refNo})` : ''}
🙏 *Donation Type:* ${pavti.donationType || 'Donation'}
✍️ *Received By:* ${pavti.receivedBy || mandalSettings.treasurer || 'Manager'}
━━━━━━━━━━━━━━━━━━━━

🌺 *Thank you heartfelt for your devoted support!*
May Lord Ganesha shower supreme health, wealth, peace, and prosperity upon you and your entire family! 🙏✨

━━━━━━━━━━━━━━━━━━━━
🌐 *Visit Our Official Mandal Website:*
👉 *https://shindemala.vercel.app/*

_(Click the link above to view Live Darshan, Event Gallery, Financial Balance Sheet & Mahaprasad List)_
━━━━━━━━━━━━━━━━━━━━
_🚩 Shinde Mala Ganesh Utsav Mandal, Hingani Dumala 🚩_`;

    const message = lang === 'mr' ? textMarathi : textEnglish;
    const url = `https://wa.me/${cleanMobile}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const amountInWordsText = lang === 'mr' ? numberToWordsMr(pavti.amount) : numberToWordsEn(pavti.amount);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: '720px',
          width: '95%',
          padding: 'clamp(0.75rem, 3vw, 1.25rem)',
          position: 'relative',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
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
            paddingBottom: '0.75rem',
            marginBottom: '0.9rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/ganesh-icon.svg" alt="Ganesh" style={{ width: '30px', height: '30px' }} />
            <h3
              style={{
                fontSize: 'clamp(1rem, 3.5vw, 1.15rem)',
                fontWeight: 800,
                margin: 0,
                fontFamily: "'Yatra One', 'Anek Devanagari', sans-serif"
              }}
            >
              {t('receiptTitle')} — <span style={{ color: 'var(--accent-gold-light)' }}>{pavti.pavtiNo}</span>
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {!isPublic && (
              <button
                className="btn btn-whatsapp btn-sm"
                onClick={handleWhatsApp}
                title="Share on WhatsApp"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
              >
                <Share2 size={15} />
                <span>{t('shareWhatsApp')}</span>
              </button>
            )}
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              title="Download PDF"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem', borderColor: '#3b82f6', color: '#60a5fa' }}
            >
              {isGeneratingPdf ? <Loader2 size={15} className="spin-slow" /> : <Download size={15} />}
              <span>{isGeneratingPdf ? 'PDF तयार होत आहे...' : t('downloadPdf')}</span>
            </button>
            {!isPublic && (
              <button
                className="btn btn-primary btn-sm"
                onClick={handlePrint}
                title="Print A5 Receipt"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
              >
                <Printer size={15} />
                <span>{t('printReceipt')}</span>
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-subtle)',
                cursor: 'pointer',
                padding: '4px',
                marginLeft: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              title={t('close')}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable & Downloadable A5 Pavti Sheet */}
        <div
          ref={receiptRef}
          className="a5-receipt-sheet"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #fffdf8 60%, #fffbf2 100%)',
            color: '#1a1006',
            border: '2.5px solid #b45309',
            borderRadius: '14px',
            padding: 'clamp(0.85rem, 3vw, 1.35rem)',
            position: 'relative',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            fontFamily: "'Yatra One', 'Anek Devanagari', 'Baloo 2', 'Mukta', sans-serif",
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          {/* Decorative Corner Ornaments (Traditional Mandal Pavti Style) */}
          <div
            style={{
              position: 'absolute',
              top: '4px',
              left: '6px',
              color: '#d97706',
              fontSize: '11px',
              lineHeight: 1,
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          >
            ❖
          </div>
          <div
            style={{
              position: 'absolute',
              top: '4px',
              right: '6px',
              color: '#d97706',
              fontSize: '11px',
              lineHeight: 1,
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          >
            ❖
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              left: '6px',
              color: '#d97706',
              fontSize: '11px',
              lineHeight: 1,
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          >
            ❖
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '6px',
              color: '#d97706',
              fontSize: '11px',
              lineHeight: 1,
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          >
            ❖
          </div>

          {/* Central Watermark Motif */}
          <div
            style={{
              position: 'absolute',
              top: '52%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.045,
              pointerEvents: 'none',
              zIndex: 0
            }}
          >
            <img src="/ganesh-icon.svg" alt="Watermark" style={{ width: '260px', height: '260px' }} />
          </div>

          {/* Top Auspicious Tagline */}
          <div
            style={{
              textAlign: 'center',
              fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
              fontWeight: 800,
              color: '#c2410c',
              letterSpacing: '0.04em',
              marginBottom: '0.35rem',
              fontFamily: "'Yatra One', 'Anek Devanagari', sans-serif"
            }}
          >
            {mandalSettings.tagline || '॥ श्री गणेशाय नमः ॥ गणपती बाप्पा मोरया ॥'}
          </div>

          {/* Mandal Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid #b45309',
              paddingBottom: '0.65rem',
              marginBottom: '0.85rem',
              position: 'relative',
              zIndex: 1,
              gap: '0.65rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
              <img
                src="/ganesh-icon.svg"
                alt="Logo"
                style={{
                  width: 'clamp(44px, 8vw, 56px)',
                  height: 'clamp(44px, 8vw, 56px)',
                  flexShrink: 0,
                  filter: 'drop-shadow(0 2px 4px rgba(230,81,0,0.3))'
                }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <h1
                  style={{
                    fontSize: 'clamp(1.15rem, 4vw, 1.45rem)',
                    fontWeight: 800,
                    color: '#7c2d12',
                    lineHeight: '1.25',
                    margin: 0,
                    fontFamily: "'Yatra One', 'Anek Devanagari', sans-serif",
                    letterSpacing: '0.01em',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word'
                  }}
                >
                  {mandalSettings.mandalName || 'शिंदे मळा गणेश उत्सव मंडळ'}
                </h1>
                <p
                  style={{
                    fontSize: 'clamp(0.75rem, 2.2vw, 0.82rem)',
                    fontWeight: 700,
                    color: '#92400e',
                    margin: '2px 0 0',
                    fontFamily: "'Anek Devanagari', sans-serif"
                  }}
                >
                  {mandalSettings.regNo || 'नोंदणी क्र. महा/१२४५/२०१२'} | {(mandalSettings.address || 'शिंदे मळा, हिंगणी दुमाला, ४१२२१०').replace(/,?\s*ता\.\s*दौंड/g, '').replace(/,?\s*जि\.\s*पुणे\s*-?/g, '').replace(/,?\s*दौंड/g, '').trim()}
                </p>
              </div>
            </div>

            <div
              style={{
                textAlign: 'right',
                border: '1.5px solid #d97706',
                padding: '0.3rem 0.65rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(254, 243, 199, 0.85)',
                flexShrink: 0
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(0.72rem, 2vw, 0.78rem)',
                  fontWeight: 800,
                  color: '#9a3412',
                  fontFamily: "'Anek Devanagari', 'Yatra One', sans-serif"
                }}
              >
                {t('receiptDevoteeCopy')}
              </div>
              <div
                style={{
                  fontSize: 'clamp(0.8rem, 2.2vw, 0.9rem)',
                  fontWeight: 800,
                  color: '#b45309',
                  fontFamily: "'Yatra One', sans-serif"
                }}
              >
                उत्सव {mandalSettings.year || '२०२६'}
              </div>
            </div>
          </div>

          {/* Receipt Info Ribbon */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#fef3c7',
              padding: '0.4rem 0.75rem',
              borderRadius: '7px',
              border: '1px solid #fde68a',
              marginBottom: '0.85rem',
              position: 'relative',
              zIndex: 1,
              flexWrap: 'wrap',
              gap: '0.4rem',
              fontFamily: "'Anek Devanagari', 'Yatra One', sans-serif"
            }}
          >
            <div>
              <span style={{ fontSize: '0.88rem', color: '#78350f', fontWeight: 700 }}>
                {t('pavtiNo')}:{' '}
              </span>
              <strong
                style={{
                  fontSize: '1rem',
                  color: '#b45309',
                  fontWeight: 800,
                  fontFamily: "'Yatra One', sans-serif"
                }}
              >
                {pavti.pavtiNo}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#78350f', fontWeight: 700 }}>
                {t('receiptDate')}:{' '}
              </span>
              <strong style={{ fontSize: '0.9rem', color: '#1a1006', fontWeight: 800 }}>
                {pavti.date} {pavti.time ? `(${pavti.time})` : ''}
              </strong>
            </div>
          </div>

          {/* Devotee Details Table */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              marginBottom: '0.85rem',
              fontFamily: "'Anek Devanagari', 'Mukta', sans-serif"
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {/* Devotee Name - Highlighted in Blue & Bold */}
                <tr style={{ borderBottom: '1px dashed #fde68a' }}>
                  <td
                    style={{
                      padding: '0.4rem 0',
                      width: '30%',
                      color: '#78350f',
                      fontWeight: 800,
                      fontSize: 'clamp(0.88rem, 2.5vw, 0.95rem)',
                      fontFamily: "'Anek Devanagari', 'Yatra One', sans-serif"
                    }}
                  >
                    {t('donorName')}:
                  </td>
                  <td
                    style={{
                      padding: '0.4rem 0',
                      fontFamily: "'Anek Devanagari', 'Yatra One', sans-serif"
                    }}
                  >
                    <span
                      style={{
                        color: '#1d4ed8', // Vibrant Blue Color
                        fontWeight: 800, // Bold Font
                        fontSize: 'clamp(1.05rem, 3.2vw, 1.25rem)',
                        letterSpacing: '0.01em',
                        display: 'inline-block'
                      }}
                    >
                      {pavti.donorName}
                    </span>
                  </td>
                </tr>

                {/* Mobile Number */}
                <tr style={{ borderBottom: '1px dashed #fde68a' }}>
                  <td
                    style={{
                      padding: '0.35rem 0',
                      color: '#78350f',
                      fontWeight: 700,
                      fontSize: 'clamp(0.85rem, 2.4vw, 0.92rem)',
                      fontFamily: "'Anek Devanagari', sans-serif"
                    }}
                  >
                    {t('mobileNumber')}:
                  </td>
                  <td
                    style={{
                      padding: '0.35rem 0',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      color: '#1a1006'
                    }}
                  >
                    {pavti.mobile || '—'}
                  </td>
                </tr>

                {/* Address */}
                <tr style={{ borderBottom: '1px dashed #fde68a' }}>
                  <td
                    style={{
                      padding: '0.35rem 0',
                      color: '#78350f',
                      fontWeight: 700,
                      fontSize: 'clamp(0.85rem, 2.4vw, 0.92rem)',
                      fontFamily: "'Anek Devanagari', sans-serif"
                    }}
                  >
                    {t('addressArea')}:
                  </td>
                  <td
                    style={{
                      padding: '0.35rem 0',
                      color: '#261b11',
                      fontWeight: 700,
                      fontSize: '0.92rem'
                    }}
                  >
                    {pavti.address || 'स्थानिक (शिंदे मळा)'}
                  </td>
                </tr>

                {/* Donation Type & Payment Mode */}
                <tr style={{ borderBottom: '1px dashed #fde68a' }}>
                  <td
                    style={{
                      padding: '0.35rem 0',
                      color: '#78350f',
                      fontWeight: 700,
                      fontSize: 'clamp(0.85rem, 2.4vw, 0.92rem)',
                      fontFamily: "'Anek Devanagari', sans-serif"
                    }}
                  >
                    {t('donationType')}:
                  </td>
                  <td style={{ padding: '0.35rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          padding: '0.12rem 0.55rem',
                          borderRadius: '5px',
                          backgroundColor: '#fed7aa',
                          color: '#9a3412',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          fontFamily: "'Anek Devanagari', 'Yatra One', sans-serif"
                        }}
                      >
                        {t(`type${pavti.donationType}`) || pavti.donationType}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#78350f', fontWeight: 600 }}>
                        ({t('paymentMode')}:{' '}
                        <strong style={{ color: '#1a1006' }}>
                          {t(`mode${pavti.paymentMode}`) || pavti.paymentMode}
                          {pavti.refNo ? ` - ${pavti.refNo}` : ''}
                        </strong>
                        )
                      </span>
                    </div>
                  </td>
                </tr>

                {pavti.remarks && (
                  <tr>
                    <td
                      style={{
                        padding: '0.35rem 0',
                        color: '#78350f',
                        fontWeight: 700,
                        fontSize: 'clamp(0.85rem, 2.4vw, 0.92rem)',
                        fontFamily: "'Anek Devanagari', sans-serif"
                      }}
                    >
                      {t('remarks')}:
                    </td>
                    <td
                      style={{
                        padding: '0.35rem 0',
                        color: '#4b3b2b',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        fontStyle: 'italic'
                      }}
                    >
                      {pavti.remarks}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Prominent Amount Box - Price in Vibrant Blue & Bold */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fef3c7',
              border: '2px solid #3b82f6', // Accent blue border pairing
              borderRadius: '10px',
              padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 2.5vw, 1.25rem)',
              marginBottom: '0.85rem',
              position: 'relative',
              zIndex: 1,
              flexWrap: 'wrap',
              gap: '0.5rem',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)'
            }}
          >
            <div style={{ flex: '1 1 200px', minWidth: 0 }}>
              <div
                style={{
                  fontSize: 'clamp(0.75rem, 2vw, 0.82rem)',
                  fontWeight: 800,
                  color: '#92400e',
                  textTransform: 'uppercase',
                  fontFamily: "'Anek Devanagari', 'Yatra One', sans-serif"
                }}
              >
                {t('amountInWords')}
              </div>
              <div
                style={{
                  fontSize: 'clamp(0.88rem, 2.4vw, 1rem)',
                  fontWeight: 800,
                  color: '#1e40af', // Blue font for words
                  fontFamily: "'Anek Devanagari', 'Yatra One', sans-serif",
                  marginTop: '1px'
                }}
              >
                {amountInWordsText}
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div
                style={{
                  fontSize: 'clamp(0.75rem, 2vw, 0.82rem)',
                  fontWeight: 800,
                  color: '#92400e',
                  fontFamily: "'Anek Devanagari', sans-serif"
                }}
              >
                {t('amount')}
              </div>
              <div
                style={{
                  fontSize: 'clamp(1.5rem, 4.5vw, 1.95rem)',
                  fontWeight: 900, // Extra Bold
                  color: '#1d4ed8', // Vibrant Blue Color
                  lineHeight: '1.1',
                  fontFamily: "'Anek Devanagari', 'Yatra One', sans-serif",
                  letterSpacing: '0.01em'
                }}
              >
                {formatCurrency(pavti.amount)}
              </div>
            </div>
          </div>

          {/* Blessing Message */}
          <div
            style={{
              textAlign: 'center',
              fontSize: 'clamp(0.78rem, 2.2vw, 0.86rem)',
              fontWeight: 700,
              color: '#9a3412',
              fontStyle: 'italic',
              marginBottom: '1rem',
              position: 'relative',
              zIndex: 1,
              fontFamily: "'Anek Devanagari', 'Yatra One', sans-serif",
              lineHeight: 1.35
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
              paddingTop: '0.85rem',
              borderTop: '1px solid #d97706',
              position: 'relative',
              zIndex: 1,
              fontFamily: "'Anek Devanagari', sans-serif"
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '36px' }}></div>
              <div style={{ width: 'clamp(110px, 25vw, 150px)', borderTop: '1px solid #78350f', margin: '0 auto 4px' }}></div>
              <div style={{ fontSize: '0.82rem', color: '#78350f', fontWeight: 700 }}>
                {t('receiptDevoteeSign')}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
                <img
                  src={
                    pavti.receivedBy?.includes('तुकाराम') ? '/signatures/tukaram-signature.png' :
                    pavti.receivedBy?.includes('तुषार') ? '/signatures/tushar-signature.png' :
                    pavti.receivedBy?.includes('मानस') ? '/signatures/manas-signature.png' :
                    pavti.receivedBy?.includes('मयूर') ? '/signatures/mayur-signature.png' :
                    '/signatures/tukaram-signature.png'
                  }
                  alt="अधिकृत स्वाक्षरी"
                  style={{
                    maxHeight: '34px',
                    maxWidth: '120px',
                    objectFit: 'contain'
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div
                style={{
                  fontSize: '0.85rem',
                  color: '#1a1006',
                  fontWeight: 800,
                  marginBottom: '2px',
                  fontFamily: "'Anek Devanagari', 'Yatra One', sans-serif"
                }}
              >
                {pavti.receivedBy || mandalSettings.treasurer || 'खजिनदार'}
              </div>
              <div style={{ width: 'clamp(130px, 30vw, 170px)', borderTop: '1px solid #78350f', margin: '0 auto 4px' }}></div>
              <div style={{ fontSize: '0.82rem', color: '#78350f', fontWeight: 700 }}>
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
            gap: '0.65rem',
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--glass-border)',
            flexWrap: 'wrap'
          }}
        >
          <button className="btn btn-secondary" onClick={onClose}>
            {t('close')}
          </button>
          {!isPublic && (
            <button className="btn btn-whatsapp" onClick={handleWhatsApp}>
              <Share2 size={16} />
              <span>{t('shareWhatsApp')}</span>
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            style={{ backgroundColor: '#2563eb', borderColor: '#3b82f6' }}
          >
            {isGeneratingPdf ? <Loader2 size={16} className="spin-slow" /> : <Download size={16} />}
            <span>{isGeneratingPdf ? 'PDF तयार होत आहे...' : t('downloadPdf')}</span>
          </button>
          {!isPublic && (
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={16} />
              <span>{t('printReceipt')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

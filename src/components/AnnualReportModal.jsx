import React, { useRef, useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  Download,
  Share2,
  Printer,
  X,
  Loader2,
  FileText,
  TrendingUp,
  TrendingDown,
  Scale,
  Receipt,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Building,
  UserCheck,
  ShieldCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import { formatCurrency, numberToWordsMr } from '../i18n/numberToWords';
import html2pdf from 'html2pdf.js';

export const AnnualReportModal = ({ isOpen, onClose, defaultScope = 'all' }) => {
  const { lang, t } = useLanguage();
  const { mandalSettings, pavtiList, expenseList, totalCollection, totalExpense, balance, pavtiCount } = useData();
  const reportRef = useRef(null);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [reportScope, setReportScope] = useState(defaultScope); // 'all' | 'summary' | 'ledger'
  const [includeReceipts, setIncludeReceipts] = useState(true);

  // Grouping by Donation Type
  const donationTypeStats = useMemo(() => {
    const stats = {
      Vargani: { label: 'घरगुती वार्षिक वर्गणी', count: 0, amount: 0 },
      Denagi: { label: 'ऐच्छिक देणगी', count: 0, amount: 0 },
      Navas: { label: 'नवसाची देणगी', count: 0, amount: 0 },
      Other: { label: 'इतर सहाय्य / जमा', count: 0, amount: 0 }
    };

    pavtiList.forEach((p) => {
      const type = stats[p.donationType] ? p.donationType : 'Other';
      stats[type].count += 1;
      stats[type].amount += Number(p.amount || 0);
    });

    return Object.entries(stats).map(([key, data]) => ({
      key,
      ...data,
      percent: totalCollection > 0 ? Math.round((data.amount / totalCollection) * 100) : 0
    }));
  }, [pavtiList, totalCollection]);

  // Grouping by Payment Mode (Income)
  const paymentModeStats = useMemo(() => {
    const modes = {
      Cash: { label: 'रोख (Cash)', count: 0, amount: 0 },
      UPI: { label: 'यूपीआय (Online UPI)', count: 0, amount: 0 },
      Cheque: { label: 'चेक (Cheque)', count: 0, amount: 0 },
      'Bank Transfer': { label: 'बँक ट्रान्सफर (NEFT/RTGS)', count: 0, amount: 0 }
    };

    pavtiList.forEach((p) => {
      const mode = modes[p.paymentMode] ? p.paymentMode : 'Cash';
      modes[mode].count += 1;
      modes[mode].amount += Number(p.amount || 0);
    });

    return Object.entries(modes).map(([key, data]) => ({
      key,
      ...data,
      percent: totalCollection > 0 ? Math.round((data.amount / totalCollection) * 100) : 0
    }));
  }, [pavtiList, totalCollection]);

  // Grouping by Expense Category
  const expenseCategoryStats = useMemo(() => {
    const catMap = {
      Murti: { label: 'श्रींची मूर्ती व पूजा साहित्य', count: 0, amount: 0 },
      Mandap: { label: 'मंडप, स्टेज व छत व्यवस्था', count: 0, amount: 0 },
      Decoration: { label: 'डेकोरेशन व विद्युत रोषणाई', count: 0, amount: 0 },
      SoundLight: { label: 'ध्वनी (Sound) व लाईट व्यवस्था', count: 0, amount: 0 },
      Prasad: { label: 'महाप्रसाद व अन्नदान', count: 0, amount: 0 },
      Electricity: { label: 'वीज बिल व जनरेटर खर्च', count: 0, amount: 0 },
      Security: { label: 'सुरक्षा व स्वयंसेवक व्यवस्था', count: 0, amount: 0 },
      Misc: { label: 'किरकोळ व इतर उत्सव खर्च', count: 0, amount: 0 }
    };

    expenseList.forEach((e) => {
      const cat = catMap[e.category] ? e.category : 'Misc';
      catMap[cat].count += 1;
      catMap[cat].amount += Number(e.amount || 0);
    });

    return Object.entries(catMap)
      .map(([key, data]) => ({
        key,
        ...data,
        percent: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0
      }))
      .filter((c) => c.amount > 0 || c.count > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [expenseList, totalExpense]);

  // Top Donors (Top 10)
  const topDonorsList = useMemo(() => {
    return [...pavtiList]
      .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
      .slice(0, 10);
  }, [pavtiList]);

  // Formatted Generation Date & Time
  const generatedDateTime = useMemo(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  }, []);

  if (!isOpen) return null;

  // Handle Download PDF via html2pdf.js
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const element = reportRef.current;
      const cleanYear = mandalSettings.year || '2026';
      const filename = `Shinde_Mala_Ganesh_Utsav_Ahaval_${cleanYear}.pdf`;

      const opt = {
        margin: [8, 8, 8, 8], // mm
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2.2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          letterRendering: true,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy'],
          avoid: ['.report-section-avoid-break', '.report-summary-card', '.report-sig-box', '.report-table-row']
        }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Report PDF generation error:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // WhatsApp Share with Complete Marathi Summary
  const handleWhatsAppShare = () => {
    const mandalTitle = mandalSettings.mandalName || 'शिंदे मळा सार्वजनिक गणेश उत्सव मंडळ';
    const year = mandalSettings.year || '२०२६';

    const msg =
      `॥ गणपती बाप्पा मोरया ॥\n\n` +
      `🚩 *${mandalTitle}*\n` +
      `📋 *वार्षिक जमा-खर्च हिशोब अहवाल व ताळेबंद (${year})*\n\n` +
      `सर्व भाविक व ग्रामस्थांच्या माहितीस्तव मंडळाचा अधिकृत हिशोब खालीलप्रमाणे:\n\n` +
      `💰 *एकूण जमा रक्कम:* ${formatCurrency(totalCollection)} (${pavtiCount} पावत्या)\n` +
      `💸 *एकूण झालेला खर्च:* ${formatCurrency(totalExpense)} (${expenseList.length} खर्च नोंदी)\n` +
      `⚖️ *शिल्लक निधी / बचत:* ${formatCurrency(balance)} (${balance >= 0 ? 'शिल्लक' : 'तूट'})\n\n` +
      `✨ *मंडळ पदाधिकारी:*\n` +
      `• अध्यक्ष: ${mandalSettings.president || 'श्री. तुषार शिंदे'}\n` +
      `• खजिनदार: ${mandalSettings.treasurer || 'श्री. तुकाराम शिंदे व श्री. धनंजय शिंदे'}\n` +
      `• सचिव: ${mandalSettings.secretary || 'श्री. मानस शिंदे'}\n\n` +
      `📄 संपूर्ण अधिकृत पावती व खर्चाच्या नोंदी पाहण्यासाठी मंडळाच्या सार्वजनिक पारदर्शकता पोर्टलला भेट द्या.\n` +
      `_शिंदे मळा गणेश उत्सव मंडळ, शिंदे मळा, हिंगणी दुमाला_`;

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        zIndex: 1100,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(0.5rem, 2vw, 1.25rem)'
      }}
    >
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '1020px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface)',
          border: '1.5px solid rgba(251, 191, 36, 0.4)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65), 0 0 40px rgba(245, 158, 11, 0.25)'
        }}
      >
        {/* Top Control Header Bar (Sticky) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: 'clamp(0.75rem, 2.5vw, 1.25rem)',
            borderBottom: '1px solid var(--glass-border)',
            background: 'linear-gradient(135deg, rgba(230, 81, 0, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ff7722, #b45309)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(230, 81, 0, 0.35)',
                flexShrink: 0
              }}
            >
              <FileText size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontSize: 'clamp(0.95rem, 3vw, 1.25rem)',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                वार्षिक जमा-खर्च हिशोब अहवाल २०२६
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--accent-gold-light)', margin: 0 }}>
                सार्वजनिक ताळेबंद • संपूर्ण हिशोब व अधिकृत PDF
              </p>
            </div>
          </div>

          {/* Action Buttons: Zoom, Share, Print, Download PDF, Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Zoom Controls for Mobile / Desktop reading */}
            <div
              className="zoom-pill-group"
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '999px',
                border: '1px solid var(--glass-border)',
                padding: '2px 6px',
                marginRight: '0.25rem'
              }}
            >
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(0.65, Number((prev - 0.1).toFixed(2))))}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </button>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: '40px', textAlign: 'center', color: 'var(--text-main)' }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(1.4, Number((prev + 0.1).toFixed(2))))}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="Zoom In"
              >
                <ZoomIn size={15} />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '4px' }}
                title="Reset Zoom"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            {/* WhatsApp Share Button */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleWhatsAppShare}
              title="व्हॉट्सॲपवर शेअर करा"
              style={{
                borderColor: 'rgba(37, 211, 102, 0.4)',
                color: '#25d366',
                padding: '0.4rem 0.75rem',
                fontSize: '0.82rem'
              }}
            >
              <Share2 size={15} />
              <span className="hide-on-mobile-xs">WhatsApp</span>
            </button>

            {/* Browser Print Button */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => window.print()}
              title="प्रिंट / सेव्ह"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
            >
              <Printer size={15} />
              <span className="hide-on-mobile-xs">प्रिंट</span>
            </button>

            {/* Primary Action: Download PDF */}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              style={{
                padding: '0.4rem 0.95rem',
                fontSize: '0.84rem',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(230, 81, 0, 0.4)'
              }}
            >
              {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              <span>{isGeneratingPdf ? 'PDF तयार होत आहे...' : 'PDF डाउनलोड करा'}</span>
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: 'var(--text-muted)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginLeft: '0.25rem'
              }}
              title="बंद करा"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scope Filter Bar (View/Download Customization) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.65rem',
            padding: '0.65rem 1.25rem',
            borderBottom: '1px solid var(--glass-border)',
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            fontSize: '0.82rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-subtle)', fontWeight: 600 }}>दाखवा:</span>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                className={`chip-btn ${reportScope === 'all' ? 'active' : ''}`}
                onClick={() => setReportScope('all')}
                style={{
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.78rem',
                  borderRadius: '999px',
                  backgroundColor: reportScope === 'all' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                  color: reportScope === 'all' ? '#fff' : 'var(--text-muted)',
                  border: 'none'
                }}
              >
                संपूर्ण अहवाल (Full Report)
              </button>
              <button
                className={`chip-btn ${reportScope === 'summary' ? 'active' : ''}`}
                onClick={() => setReportScope('summary')}
                style={{
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.78rem',
                  borderRadius: '999px',
                  backgroundColor: reportScope === 'summary' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                  color: reportScope === 'summary' ? '#fff' : 'var(--text-muted)',
                  border: 'none'
                }}
              >
                थोडक्यात ताळेबंद (Summary)
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--text-main)' }}>
              <input
                type="checkbox"
                checked={includeReceipts}
                onChange={(e) => setIncludeReceipts(e.target.checked)}
                style={{ accentColor: '#ff7722', width: '15px', height: '15px' }}
              />
              <span style={{ fontSize: '0.78rem' }}>सर्व देणगी पावत्या यादी समाविष्ट करा</span>
            </label>
          </div>
        </div>

        {/* Scrollable Document Container with Responsive Zooming */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'auto',
            padding: 'clamp(0.5rem, 2vw, 1.5rem)',
            backgroundColor: 'var(--bg-base)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}
        >
          {/* Zoom Wrapper */}
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
              maxWidth: '100%'
            }}
          >
            {/* ========================================================================= */}
            {/* THE FORMAL ANNUAL AUDIT REPORT DOCUMENT (Captured by html2pdf.js)         */}
            {/* ========================================================================= */}
            <div
              id="annual-report-pdf-doc"
              ref={reportRef}
              className="annual-report-pdf-doc"
              style={{
                width: '794px', // standard A4 @ 96dpi (210mm)
                minHeight: '1123px', // standard A4 height
                backgroundColor: '#ffffff',
                color: '#1a1006',
                fontFamily: "'Noto Sans Devanagari', 'Mukta', 'Anek Devanagari', 'Baloo 2', sans-serif",
                padding: '24px 28px',
                boxSizing: 'border-box',
                position: 'relative',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
                borderRadius: '4px'
              }}
            >
              {/* Decorative Traditional Marathi Border */}
              <div
                style={{
                  border: '3px double #b45309',
                  padding: '16px 20px',
                  borderRadius: '6px',
                  position: 'relative',
                  backgroundColor: '#ffffff'
                }}
              >
                {/* Auspicious Vedic Top Tag */}
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#c2410c',
                    letterSpacing: '0.08em',
                    marginBottom: '4px'
                  }}
                >
                  {mandalSettings.tagline || '॥ श्री गणेशाय नमः ॥ गणपती बाप्पा मोरया ॥'}
                </div>

                {/* Mandal Official Header Block */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '2px solid #ea580c',
                    paddingBottom: '10px',
                    marginBottom: '12px',
                    gap: '12px'
                  }}
                >
                  {/* Left: Emblem / Logo */}
                  <div style={{ flexShrink: 0 }}>
                    <img
                      src="/logo.png"
                      onError={(e) => {
                        e.target.src = '/ganesh-icon.svg';
                      }}
                      alt="Ganesh Logo"
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        border: '2px solid #d97706',
                        objectFit: 'cover'
                      }}
                    />
                  </div>

                  {/* Center: Mandal Name & Details */}
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <h1
                      style={{
                        fontSize: '22px',
                        fontWeight: 900,
                        color: '#9a3412',
                        margin: '0 0 2px',
                        lineHeight: 1.2
                      }}
                    >
                      {mandalSettings.mandalName || 'शिंदे मळा गणेश उत्सव मंडळ'}
                    </h1>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#451a03', marginBottom: '2px' }}>
                      📍 {mandalSettings.address || 'शिंदे मळा, हिंगणी दुमाला, ता. दौंड, जि. पुणे - ४१२२१०'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#78350f', fontWeight: 600 }}>
                      {mandalSettings.regNo || 'नोंदणी क्र. महा/१२४५/२०१२'} • संपर्क: {mandalSettings.contact || '9922466579'}
                    </div>
                  </div>

                  {/* Right: Year Badge & Report ID */}
                  <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '110px' }}>
                    <div
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#ea580c',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: 900,
                        fontSize: '13px',
                        letterSpacing: '0.04em'
                      }}
                    >
                      उत्सव {mandalSettings.year || '२०२६'}
                    </div>
                    <div style={{ fontSize: '9px', color: '#78350f', marginTop: '4px', fontWeight: 600 }}>
                      दिनांक: {generatedDateTime}
                    </div>
                  </div>
                </div>

                {/* Report Title Ribbon */}
                <div
                  style={{
                    backgroundColor: '#fff7ed',
                    border: '1.5px solid #fdba74',
                    borderRadius: '6px',
                    padding: '8px 14px',
                    textAlign: 'center',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#9a3412' }}>
                      📋 वार्षिक जमा-खर्च हिशोब अहवाल व आर्थिक ताळेबंद
                    </div>
                    <div style={{ fontSize: '10px', color: '#c2410c', fontWeight: 600 }}>
                      (ANNUAL FINANCIAL AUDIT & BALANCE SHEET REPORT)
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCircle2 size={12} />
                    <span>अधिकृत व प्रमाणित हिशोब</span>
                  </div>
                </div>

                {/* ================================================================= */}
                {/* 1. KEY EXECUTIVE FINANCIAL SNAPSHOT (४ प्रमुख आकडे)              */}
                {/* ================================================================= */}
                <div
                  className="report-section-avoid-break"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    marginBottom: '16px'
                  }}
                >
                  {/* Total Receipts */}
                  <div
                    className="report-summary-card"
                    style={{
                      backgroundColor: '#f0fdf4',
                      border: '1.5px solid #86efac',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534', marginBottom: '2px' }}>
                      एकूण पावती जमा (Total Receipts)
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#15803d', lineHeight: 1.2 }}>
                      {formatCurrency(totalCollection)}
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#166534', marginTop: '3px', fontWeight: 600 }}>
                      एकूण {pavtiCount} अधिकृत पावत्या
                    </div>
                  </div>

                  {/* Total Expenses */}
                  <div
                    className="report-summary-card"
                    style={{
                      backgroundColor: '#fef2f2',
                      border: '1.5px solid #fca5a5',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#991b1b', marginBottom: '2px' }}>
                      एकूण उत्सव खर्च (Total Expenses)
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#dc2626', lineHeight: 1.2 }}>
                      {formatCurrency(totalExpense)}
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#991b1b', marginTop: '3px', fontWeight: 600 }}>
                      एकूण {expenseList.length} खर्च नोंदी / व्हाउचर्स
                    </div>
                  </div>

                  {/* Net Balance */}
                  <div
                    className="report-summary-card"
                    style={{
                      backgroundColor: balance >= 0 ? '#fffbeb' : '#fef2f2',
                      border: balance >= 0 ? '1.5px solid #fde68a' : '1.5px solid #fca5a5',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 700, color: balance >= 0 ? '#92400e' : '#991b1b', marginBottom: '2px' }}>
                      {balance >= 0 ? 'निव्वळ शिल्लक निधी (Surplus)' : 'तूट रक्कम (Deficit)'}
                    </div>
                    <div
                      style={{
                        fontSize: '20px',
                        fontWeight: 900,
                        color: balance >= 0 ? '#b45309' : '#dc2626',
                        lineHeight: 1.2
                      }}
                    >
                      {formatCurrency(Math.abs(balance))}
                    </div>
                    <div style={{ fontSize: '9.5px', color: balance >= 0 ? '#92400e' : '#991b1b', marginTop: '3px', fontWeight: 600 }}>
                      अक्षरी: {numberToWordsMr(Math.abs(balance))}
                    </div>
                  </div>
                </div>

                {/* ================================================================= */}
                {/* 2. SUMMARY BALANCE SHEET (ताळेबंद गोषवारा)                          */}
                {/* ================================================================= */}
                <div
                  className="report-section-avoid-break"
                  style={{
                    border: '1px solid #fed7aa',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    marginBottom: '16px'
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#ea580c',
                      color: '#ffffff',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 800,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>📊 आर्थिक ताळेबंद गोषवारा (Balance Sheet Summary)</span>
                    <span style={{ fontSize: '10px', opacity: 0.9 }}>उत्सव वर्ष २०२६</span>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#fff7ed', borderBottom: '1px solid #fed7aa', color: '#7c2d12', fontWeight: 800 }}>
                        <th style={{ padding: '6px 10px', textAlign: 'left', width: '38%' }}>जमा तपशील (Receipts / Income)</th>
                        <th style={{ padding: '6px 10px', textAlign: 'right', width: '12%' }}>रक्कम (₹)</th>
                        <th style={{ padding: '6px 10px', textAlign: 'left', width: '38%', borderLeft: '1px solid #fed7aa' }}>
                          खर्च तपशील (Expenditure)
                        </th>
                        <th style={{ padding: '6px 10px', textAlign: 'right', width: '12%' }}>रक्कम (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Row 1: Types */}
                      <tr>
                        <td style={{ padding: '5px 10px', borderBottom: '1px solid #ffedd5' }}>
                          <strong>१. घरगुती वार्षिक वर्गणी (Vargani)</strong>
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700 }}>
                          {formatCurrency(donationTypeStats.find((d) => d.key === 'Vargani')?.amount || 0)}
                        </td>
                        <td style={{ padding: '5px 10px', borderBottom: '1px solid #ffedd5', borderLeft: '1px solid #fed7aa' }}>
                          <strong>१. श्री गणेश मूर्ती व पूजा साहित्य</strong>
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700 }}>
                          {formatCurrency(expenseCategoryStats.find((c) => c.key === 'Murti')?.amount || 0)}
                        </td>
                      </tr>
                      {/* Row 2 */}
                      <tr style={{ backgroundColor: '#fffcf9' }}>
                        <td style={{ padding: '5px 10px', borderBottom: '1px solid #ffedd5' }}>
                          <strong>२. ऐच्छिक देणगी (Denagi)</strong>
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700 }}>
                          {formatCurrency(donationTypeStats.find((d) => d.key === 'Denagi')?.amount || 0)}
                        </td>
                        <td style={{ padding: '5px 10px', borderBottom: '1px solid #ffedd5', borderLeft: '1px solid #fed7aa' }}>
                          <strong>२. मंडप, स्टेज व छत व्यवस्था</strong>
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700 }}>
                          {formatCurrency(expenseCategoryStats.find((c) => c.key === 'Mandap')?.amount || 0)}
                        </td>
                      </tr>
                      {/* Row 3 */}
                      <tr>
                        <td style={{ padding: '5px 10px', borderBottom: '1px solid #ffedd5' }}>
                          <strong>३. नवस पावती देणगी (Navas)</strong>
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700 }}>
                          {formatCurrency(donationTypeStats.find((d) => d.key === 'Navas')?.amount || 0)}
                        </td>
                        <td style={{ padding: '5px 10px', borderBottom: '1px solid #ffedd5', borderLeft: '1px solid #fed7aa' }}>
                          <strong>३. डेकोरेशन व विद्युत रोषणाई</strong>
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700 }}>
                          {formatCurrency(expenseCategoryStats.find((c) => c.key === 'Decoration')?.amount || 0)}
                        </td>
                      </tr>
                      {/* Row 4 */}
                      <tr style={{ backgroundColor: '#fffcf9' }}>
                        <td style={{ padding: '5px 10px', borderBottom: '1px solid #ffedd5' }}>
                          <strong>४. इतर सहाय्य व जमा (Other)</strong>
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700 }}>
                          {formatCurrency(donationTypeStats.find((d) => d.key === 'Other')?.amount || 0)}
                        </td>
                        <td style={{ padding: '5px 10px', borderBottom: '1px solid #ffedd5', borderLeft: '1px solid #fed7aa' }}>
                          <strong>४. ध्वनी (Sound System) व प्रकाश</strong>
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700 }}>
                          {formatCurrency(expenseCategoryStats.find((c) => c.key === 'SoundLight')?.amount || 0)}
                        </td>
                      </tr>
                      {/* Row 5 */}
                      <tr>
                        <td style={{ padding: '5px 10px', borderBottom: '1px solid #ffedd5', color: '#78350f' }}>
                          <span>• रोख जमा: {formatCurrency(paymentModeStats.find((m) => m.key === 'Cash')?.amount || 0)}</span>
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontSize: '9.5px' }}>
                          ({paymentModeStats.find((m) => m.key === 'Cash')?.count || 0} पावत्या)
                        </td>
                        <td style={{ padding: '5px 10px', borderBottom: '1px solid #ffedd5', borderLeft: '1px solid #fed7aa' }}>
                          <strong>५. महाप्रसाद व अन्नदान भोजन</strong>
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700 }}>
                          {formatCurrency(expenseCategoryStats.find((c) => c.key === 'Prasad')?.amount || 0)}
                        </td>
                      </tr>
                      {/* Row 6 */}
                      <tr style={{ backgroundColor: '#fffcf9' }}>
                        <td style={{ padding: '5px 10px', borderBottom: '1px solid #ffedd5', color: '#78350f' }}>
                          <span>• ऑनलाइन UPI: {formatCurrency(paymentModeStats.find((m) => m.key === 'UPI')?.amount || 0)}</span>
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontSize: '9.5px' }}>
                          ({paymentModeStats.find((m) => m.key === 'UPI')?.count || 0} पावत्या)
                        </td>
                        <td style={{ padding: '5px 10px', borderBottom: '1px solid #ffedd5', borderLeft: '1px solid #fed7aa' }}>
                          <strong>६. वीज, जनरेटर, सुरक्षा व इतर</strong>
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700 }}>
                          {formatCurrency(
                            (expenseCategoryStats.find((c) => c.key === 'Electricity')?.amount || 0) +
                              (expenseCategoryStats.find((c) => c.key === 'Security')?.amount || 0) +
                              (expenseCategoryStats.find((c) => c.key === 'Misc')?.amount || 0)
                          )}
                        </td>
                      </tr>
                      {/* Row 7: Grand Totals & Balance Row */}
                      <tr style={{ backgroundColor: '#ffedd5', fontWeight: 900, borderTop: '2px solid #ea580c' }}>
                        <td style={{ padding: '7px 10px', color: '#9a3412', fontSize: '11px' }}>
                          एकूण जमा रक्कम (Total A)
                        </td>
                        <td style={{ padding: '7px 10px', textAlign: 'right', color: '#15803d', fontSize: '12px' }}>
                          {formatCurrency(totalCollection)}
                        </td>
                        <td style={{ padding: '7px 10px', color: '#9a3412', fontSize: '11px', borderLeft: '1px solid #fed7aa' }}>
                          एकूण खर्च रक्कम (Total B)
                        </td>
                        <td style={{ padding: '7px 10px', textAlign: 'right', color: '#dc2626', fontSize: '12px' }}>
                          {formatCurrency(totalExpense)}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: '#fff7ed', fontWeight: 900 }}>
                        <td colSpan={2} style={{ padding: '6px 10px', color: '#451a03', fontSize: '10.5px' }}>
                          अंतिम आर्थिक स्थिती: <strong>{balance >= 0 ? 'शिल्लक निधी (Surplus Funds)' : 'तूट (Deficit)'}</strong>
                        </td>
                        <td colSpan={2} style={{ padding: '6px 10px', textAlign: 'right', color: balance >= 0 ? '#b45309' : '#dc2626', fontSize: '12px' }}>
                          {balance >= 0 ? `+ ${formatCurrency(balance)}` : `- ${formatCurrency(Math.abs(balance))}`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ================================================================= */}
                {/* 3. ITEMIZED EXPENSES TABLE (खर्च तपशील)                           */}
                {/* ================================================================= */}
                <div
                  className="report-section-avoid-break"
                  style={{
                    border: '1px solid #fed7aa',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    marginBottom: '16px'
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#c2410c',
                      color: '#ffffff',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 800,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>💸 तपशीलवार उत्सव खर्च यादी (Itemized Expense Vouchers)</span>
                    <span style={{ fontSize: '10px' }}>एकूण {expenseList.length} खर्च नोंदी</span>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#fff7ed', borderBottom: '1px solid #fed7aa', color: '#7c2d12', fontWeight: 800 }}>
                        <th style={{ padding: '5px 8px', textAlign: 'center', width: '6%' }}>अ.क्र.</th>
                        <th style={{ padding: '5px 8px', textAlign: 'left', width: '12%' }}>दिनांक</th>
                        <th style={{ padding: '5px 8px', textAlign: 'left', width: '18%' }}>विभाग / प्रकार</th>
                        <th style={{ padding: '5px 8px', textAlign: 'left', width: '32%' }}>खर्चाचे विवरण व तपशील</th>
                        <th style={{ padding: '5px 8px', textAlign: 'left', width: '18%' }}>दुकानदार / व्यक्ती</th>
                        <th style={{ padding: '5px 8px', textAlign: 'right', width: '14%' }}>रक्कम (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenseList.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '12px', color: '#78350f' }}>
                            कोणतीही खर्च नोंद आढळली नाही.
                          </td>
                        </tr>
                      ) : (
                        expenseList.map((e, idx) => (
                          <tr
                            key={e.id || idx}
                            className="report-table-row"
                            style={{
                              backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fffcf9',
                              borderBottom: '1px solid #ffedd5'
                            }}
                          >
                            <td style={{ padding: '4px 8px', textAlign: 'center', color: '#78350f' }}>{idx + 1}</td>
                            <td style={{ padding: '4px 8px', whiteSpace: 'nowrap' }}>{e.date}</td>
                            <td style={{ padding: '4px 8px', fontWeight: 600 }}>{t(`cat${e.category}`) || e.category}</td>
                            <td style={{ padding: '4px 8px' }}>{e.description}</td>
                            <td style={{ padding: '4px 8px', color: '#451a03' }}>{e.paidTo || '—'}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>
                              {formatCurrency(e.amount)}
                            </td>
                          </tr>
                        ))
                      )}
                      <tr style={{ backgroundColor: '#fef2f2', fontWeight: 900, borderTop: '2px solid #dc2626' }}>
                        <td colSpan={5} style={{ padding: '6px 8px', textAlign: 'right', color: '#991b1b', fontSize: '11px' }}>
                          एकूण उत्सव खर्च बेरीज (Total Expenditure):
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#dc2626', fontSize: '11.5px' }}>
                          {formatCurrency(totalExpense)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ================================================================= */}
                {/* 4. TOP DONORS HONORS WALL (सर्वोच्च देणगीदार गौरव यादी)             */}
                {/* ================================================================= */}
                <div
                  className="report-section-avoid-break"
                  style={{
                    border: '1px solid #fde68a',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    marginBottom: '16px'
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#d97706',
                      color: '#ffffff',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 800,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>🏆 सर्वोच्च देणगीदार सन्मान यादी (Top Donors List)</span>
                    <span style={{ fontSize: '10px' }}>देणगी व वर्गणी</span>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#fffbeb', borderBottom: '1px solid #fde68a', color: '#92400e', fontWeight: 800 }}>
                        <th style={{ padding: '5px 8px', textAlign: 'center', width: '6%' }}>क्रमांक</th>
                        <th style={{ padding: '5px 8px', textAlign: 'left', width: '14%' }}>पावती क्र.</th>
                        <th style={{ padding: '5px 8px', textAlign: 'left', width: '38%' }}>देणगीदाराचे नाव</th>
                        <th style={{ padding: '5px 8px', textAlign: 'left', width: '24%' }}>पत्ता / परिसर</th>
                        <th style={{ padding: '5px 8px', textAlign: 'right', width: '18%' }}>देणगी रक्कम (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topDonorsList.map((d, idx) => (
                        <tr
                          key={d.id || idx}
                          className="report-table-row"
                          style={{
                            backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fffdf5',
                            borderBottom: '1px solid #fef3c7'
                          }}
                        >
                          <td style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 800, color: '#b45309' }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: '4px 8px', fontWeight: 700, color: '#92400e' }}>{d.pavtiNo}</td>
                          <td style={{ padding: '4px 8px', fontWeight: 700 }}>{d.donorName}</td>
                          <td style={{ padding: '4px 8px', color: '#78350f' }}>{d.address || 'स्थानिक परिसर'}</td>
                          <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 900, color: '#15803d' }}>
                            {formatCurrency(d.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ================================================================= */}
                {/* 5. FULL PAVTI RECEIPTS LEDGER (OPTIONAL TOGGLE / MULTI-PAGE FLOW) */}
                {/* ================================================================= */}
                {includeReceipts && reportScope !== 'summary' && (
                  <div
                    className="report-section-avoid-break"
                    style={{
                      border: '1px solid #fed7aa',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      marginBottom: '16px'
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: '#ea580c',
                        color: '#ffffff',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 800,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>📜 संपूर्ण देणगी पावत्या यादी (Complete Pavti Ledger)</span>
                      <span style={{ fontSize: '10px' }}>एकूण {pavtiList.length} पावत्या</span>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#fff7ed', borderBottom: '1px solid #fed7aa', color: '#7c2d12', fontWeight: 800 }}>
                          <th style={{ padding: '4px 6px', textAlign: 'center', width: '5%' }}>क्र.</th>
                          <th style={{ padding: '4px 6px', textAlign: 'left', width: '15%' }}>पावती क्र.</th>
                          <th style={{ padding: '4px 6px', textAlign: 'left', width: '12%' }}>दिनांक</th>
                          <th style={{ padding: '4px 6px', textAlign: 'left', width: '32%' }}>देणगीदाराचे नाव</th>
                          <th style={{ padding: '4px 6px', textAlign: 'left', width: '14%' }}>प्रकार</th>
                          <th style={{ padding: '4px 6px', textAlign: 'center', width: '10%' }}>मोड</th>
                          <th style={{ padding: '4px 6px', textAlign: 'right', width: '12%' }}>रक्कम (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pavtiList.map((p, idx) => (
                          <tr
                            key={p.id || idx}
                            className="report-table-row"
                            style={{
                              backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fffcf9',
                              borderBottom: '1px solid #ffedd5'
                            }}
                          >
                            <td style={{ padding: '3.5px 6px', textAlign: 'center', color: '#78350f' }}>{idx + 1}</td>
                            <td style={{ padding: '3.5px 6px', fontWeight: 700, color: '#9a3412' }}>{p.pavtiNo}</td>
                            <td style={{ padding: '3.5px 6px', whiteSpace: 'nowrap' }}>{p.date}</td>
                            <td style={{ padding: '3.5px 6px', fontWeight: 600 }}>{p.donorName}</td>
                            <td style={{ padding: '3.5px 6px' }}>{t(`type${p.donationType}`) || p.donationType}</td>
                            <td style={{ padding: '3.5px 6px', textAlign: 'center' }}>{p.paymentMode}</td>
                            <td style={{ padding: '3.5px 6px', textAlign: 'right', fontWeight: 800, color: '#15803d' }}>
                              {formatCurrency(p.amount)}
                            </td>
                          </tr>
                        ))}
                        <tr style={{ backgroundColor: '#f0fdf4', fontWeight: 900, borderTop: '2px solid #16a34a' }}>
                          <td colSpan={6} style={{ padding: '6px', textAlign: 'right', color: '#166534', fontSize: '11px' }}>
                            एकूण जमा पावती रक्कम बेरीज (Total Collection):
                          </td>
                          <td style={{ padding: '6px', textAlign: 'right', color: '#15803d', fontSize: '11.5px' }}>
                            {formatCurrency(totalCollection)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ================================================================= */}
                {/* 6. AUDIT DECLARATION & OFFICIAL SIGNATURE BLOCK                   */}
                {/* ================================================================= */}
                <div
                  className="report-sig-box"
                  style={{
                    border: '1.5px solid #fdba74',
                    backgroundColor: '#fffaf5',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    marginTop: '12px',
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid'
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#7c2d12',
                      textAlign: 'center',
                      lineHeight: 1.5,
                      marginBottom: '16px',
                      fontStyle: 'italic',
                      fontWeight: 600
                    }}
                  >
                    "आम्ही याद्वारे प्रमाणित करतो की वरील वार्षिक अहवालातील सर्व पावती जमा व उत्सव खर्चाचा हिशोब हा मूळ पावती पुस्तके व अधिकृत बिलांनुसार अचूक व परिपूर्ण आहे. सदर हिशोब सर्व भाविक, देणगीदार व ग्रामस्थांच्या अवलोकनार्थ प्रसिद्ध करण्यात येत आहे."
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '12px',
                      textAlign: 'center',
                      paddingTop: '6px'
                    }}
                  >
                    {/* President */}
                    <div>
                      <div style={{ height: '36px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <span style={{ borderBottom: '1px dashed #c2410c', width: '80%', display: 'inline-block' }} />
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#451a03', marginTop: '4px' }}>
                        {mandalSettings.president || 'श्री. तुषार शिंदे'}
                      </div>
                      <div style={{ fontSize: '9.5px', color: '#ea580c', fontWeight: 700 }}>
                        अध्यक्ष (President)
                      </div>
                    </div>

                    {/* Treasurer */}
                    <div>
                      <div style={{ height: '36px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <span style={{ borderBottom: '1px dashed #c2410c', width: '80%', display: 'inline-block' }} />
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#451a03', marginTop: '4px' }}>
                        {mandalSettings.treasurer || 'श्री. तुकाराम शिंदे व श्री. धनंजय शिंदे'}
                      </div>
                      <div style={{ fontSize: '9.5px', color: '#ea580c', fontWeight: 700 }}>
                        खजिनदार (Treasurer)
                      </div>
                    </div>

                    {/* Secretary */}
                    <div>
                      <div style={{ height: '36px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <span style={{ borderBottom: '1px dashed #c2410c', width: '80%', display: 'inline-block' }} />
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#451a03', marginTop: '4px' }}>
                        {mandalSettings.secretary || 'श्री. मानस शिंदे'}
                      </div>
                      <div style={{ fontSize: '9.5px', color: '#ea580c', fontWeight: 700 }}>
                        सचिव (Secretary)
                      </div>
                    </div>
                  </div>

                  {/* Stamp & Seal Footer Note */}
                  <div
                    style={{
                      borderTop: '1px solid #fed7aa',
                      marginTop: '12px',
                      paddingTop: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '9px',
                      color: '#9a3412',
                      fontWeight: 600
                    }}
                  >
                    <span>मंडळ अधिकृत शिक्का व स्वाक्षरी प्रमाणित</span>
                    <span>गणपती बाप्पा मोरया • मंगलमूर्ती मोरया</span>
                    <span>शिंदे मळा गणेश उत्सव मंडळ, दौंड, पुणे</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Mobile Quick Action bar */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderTop: '1px solid var(--glass-border)',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-subtle)', fontSize: '0.8rem' }}>
            <ShieldCheck size={16} color="#10b981" />
            <span>हा अधिकृत हिशोब अहवाल मोबाईलवर वाचण्यासाठी व WhatsApp वर पाठवण्यासाठी अनुकूल आहे.</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: '0.4rem 0.85rem' }}>
              {t('close') || 'बंद करा'}
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              style={{ padding: '0.4rem 1.1rem', fontWeight: 700 }}
            >
              {isGeneratingPdf ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              <span>{isGeneratingPdf ? 'PDF तयार होत आहे...' : 'PDF डाउनलोड करा'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

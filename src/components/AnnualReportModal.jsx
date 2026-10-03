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
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { formatCurrency, numberToWordsMr } from '../i18n/numberToWords';
import html2pdf from 'html2pdf.js';

export const AnnualReportModal = ({ isOpen, onClose, defaultScope = 'all' }) => {
  const { t } = useLanguage();
  const { mandalSettings, pavtiList, expenseList, totalCollection, totalExpense, balance, pavtiCount } = useData();
  const reportRef = useRef(null);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [reportScope, setReportScope] = useState(defaultScope); // 'all' | 'summary'
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
      UPI: { label: 'ऑनलाइन यूपीआय (UPI)', count: 0, amount: 0 },
      Cheque: { label: 'चेक (Cheque)', count: 0, amount: 0 },
      'Bank Transfer': { label: 'बँक ट्रान्सफर', count: 0, amount: 0 }
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
      Murti: { label: 'श्रींची मूर्ती व पूजा', count: 0, amount: 0 },
      Mandap: { label: 'मंडप, स्टेज व छत', count: 0, amount: 0 },
      Decoration: { label: 'डेकोरेशन व विद्युत रोषणाई', count: 0, amount: 0 },
      SoundLight: { label: 'ध्वनी व लाईट व्यवस्था', count: 0, amount: 0 },
      Prasad: { label: 'महाप्रसाद व अन्नदान', count: 0, amount: 0 },
      Electricity: { label: 'वीज बिल व जनरेटर', count: 0, amount: 0 },
      Security: { label: 'सुरक्षा व स्वयंसेवक', count: 0, amount: 0 },
      Misc: { label: 'किरकोळ व इतर खर्च', count: 0, amount: 0 }
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

  // Top Donors (Top 6 for Page 1)
  const topDonorsList = useMemo(() => {
    return [...pavtiList]
      .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
      .slice(0, 6);
  }, [pavtiList]);

  // Chunking Pavti list into pages (20 pavtis per page so rows never get cut)
  const pavtiChunks = useMemo(() => {
    const chunkSize = 20;
    const chunks = [];
    for (let i = 0; i < pavtiList.length; i += chunkSize) {
      chunks.push(pavtiList.slice(i, i + chunkSize));
    }
    return chunks.length > 0 ? chunks : [[]];
  }, [pavtiList]);

  // Total pages calculation
  const totalPagesCount = useMemo(() => {
    if (reportScope === 'summary') return 1;
    let count = 2; // Page 1: Summary, Page 2: Expenses & Signatures
    if (includeReceipts) {
      count += pavtiChunks.length;
    }
    return count;
  }, [reportScope, includeReceipts, pavtiChunks.length]);

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

  // Handle Download PDF via html2pdf.js with mobile protection & explicit windowWidth
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // Temporarily store current zoom and reset to 1 for un-distorted canvas capture
      const prevZoom = zoomLevel;
      setZoomLevel(1);
      await new Promise((resolve) => setTimeout(resolve, 120));

      const element = reportRef.current;
      const cleanYear = mandalSettings.year || '2026';
      const filename = `Shinde_Mala_Ganesh_Utsav_Ahaval_${cleanYear}.pdf`;

      const opt = {
        margin: [6, 8, 6, 8], // mm (safe margins: 8mm on left & right ensures complete borders)
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          letterRendering: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 800, // Desktop width emulation so mobile browsers never clip right border
          width: 690        // Exact pixel width of .pdf-page
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        },
        pagebreak: {
          mode: ['css', 'legacy'],
          after: '.pdf-page-break-after'
        }
      };

      await html2pdf().set(opt).from(element).save();

      // Restore zoom
      setZoomLevel(prevZoom);
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
      `सर्व भाविक व ग्रामस्थांच्या माहितीस्तव मंडळाचा अधिकृत हिशोब:\n\n` +
      `💰 *एकूण पावती जमा:* ${formatCurrency(totalCollection)} (${pavtiCount} पावत्या)\n` +
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
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(0.4rem, 2vw, 1.25rem)'
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
          border: '1.5px solid rgba(251, 191, 36, 0.45)',
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
            gap: '0.65rem',
            padding: 'clamp(0.65rem, 2vw, 1rem) clamp(0.75rem, 2.5vw, 1.25rem)',
            borderBottom: '1px solid var(--glass-border)',
            background: 'linear-gradient(135deg, rgba(230, 81, 0, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ff7722, #b45309)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0
              }}
            >
              <FileText size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontSize: 'clamp(0.92rem, 2.8vw, 1.2rem)',
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
              <p style={{ fontSize: '0.75rem', color: 'var(--accent-gold-light)', margin: 0 }}>
                सार्वजनिक ताळेबंद • एकूण {totalPagesCount} पाने (A4 Portrait)
              </p>
            </div>
          </div>

          {/* Action Buttons: Zoom, Share, Print, Download PDF, Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
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
                marginRight: '0.2rem'
              }}
            >
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(0.65, Number((prev - 0.1).toFixed(2))))}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, minWidth: '38px', textAlign: 'center', color: 'var(--text-main)' }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(1.4, Number((prev + 0.1).toFixed(2))))}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '4px' }}
                title="Reset Zoom"
              >
                <RotateCcw size={12} />
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
                padding: '0.35rem 0.65rem',
                fontSize: '0.8rem'
              }}
            >
              <Share2 size={14} />
              <span className="hide-on-mobile-xs">WhatsApp</span>
            </button>

            {/* Browser Print Button */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => window.print()}
              title="प्रिंट / सेव्ह"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
            >
              <Printer size={14} />
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
              {isGeneratingPdf ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              <span>{isGeneratingPdf ? 'PDF तयार होत आहे...' : 'PDF डाउनलोड'}</span>
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
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="बंद करा"
            >
              <X size={17} />
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
            gap: '0.5rem',
            padding: '0.5rem 1.25rem',
            borderBottom: '1px solid var(--glass-border)',
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            fontSize: '0.8rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ color: 'var(--text-subtle)', fontWeight: 600 }}>दाखवा:</span>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button
                className={`chip-btn ${reportScope === 'all' ? 'active' : ''}`}
                onClick={() => setReportScope('all')}
                style={{
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.76rem',
                  borderRadius: '999px',
                  backgroundColor: reportScope === 'all' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                  color: reportScope === 'all' ? '#fff' : 'var(--text-muted)',
                  border: 'none'
                }}
              >
                संपूर्ण अहवाल (Full Audit Report)
              </button>
              <button
                className={`chip-btn ${reportScope === 'summary' ? 'active' : ''}`}
                onClick={() => setReportScope('summary')}
                style={{
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.76rem',
                  borderRadius: '999px',
                  backgroundColor: reportScope === 'summary' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                  color: reportScope === 'summary' ? '#fff' : 'var(--text-muted)',
                  border: 'none'
                }}
              >
                १-पानी ताळेबंद (Single Page Summary)
              </button>
            </div>
          </div>

          {reportScope === 'all' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--text-main)' }}>
              <input
                type="checkbox"
                checked={includeReceipts}
                onChange={(e) => setIncludeReceipts(e.target.checked)}
                style={{ accentColor: '#ff7722', width: '14px', height: '14px' }}
              />
              <span style={{ fontSize: '0.78rem' }}>सर्व देणगी पावत्या यादी समाविष्ट करा</span>
            </label>
          )}
        </div>

        {/* Scrollable Document Container with Responsive Zooming */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'auto',
            padding: 'clamp(0.4rem, 2vw, 1.25rem)',
            backgroundColor: '#0c0f16',
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
              transition: 'transform 0.15s ease-out'
            }}
          >
            {/* ========================================================================= */}
            {/* THE FORMAL ANNUAL AUDIT REPORT DOCUMENT (Captured by html2pdf.js)         */}
            {/* Width: 690px with generous margins ensures NO RIGHT CUT on any mobile     */}
            {/* ========================================================================= */}
            <div
              id="annual-report-pdf-doc"
              ref={reportRef}
              className="annual-report-pdf-doc"
              style={{
                width: '690px',
                backgroundColor: '#ffffff',
                color: '#1a1006',
                fontFamily: "'Noto Sans Devanagari', 'Mukta', 'Anek Devanagari', 'Baloo 2', sans-serif",
                boxSizing: 'border-box',
                margin: '0 auto',
                padding: 0
              }}
            >
              {/* ========================================================================= */}
              {/* PAGE 1: EXECUTIVE AUDIT SUMMARY & TAALEBAND (मुख्य ताळेबंद व गोषवारा)    */}
              {/* ========================================================================= */}
              <div
                className="pdf-page pdf-page-break-after"
                style={{
                  width: '690px',
                  minHeight: '970px',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  pageBreakAfter: reportScope === 'summary' ? 'auto' : 'always',
                  breakAfter: reportScope === 'summary' ? 'auto' : 'page',
                  position: 'relative'
                }}
              >
                {/* Decorative Marathi Outer Frame */}
                <div
                  style={{
                    border: '2px solid #b45309',
                    borderRadius: '6px',
                    padding: '12px 14px',
                    boxSizing: 'border-box',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#ffffff',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Auspicious Vedic Top Tag */}
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#c2410c',
                      letterSpacing: '0.06em',
                      marginBottom: '3px'
                    }}
                  >
                    {mandalSettings.tagline || '॥ श्री गणेशाय नमः ॥ गणपती बाप्पा मोरया ॥'}
                  </div>

                  {/* Mandal Header Block */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '2px solid #ea580c',
                      paddingBottom: '8px',
                      marginBottom: '10px',
                      gap: '10px'
                    }}
                  >
                    {/* Left: Emblem Logo */}
                    <div style={{ flexShrink: 0 }}>
                      <img
                        src="/logo.png"
                        onError={(e) => {
                          e.target.src = '/ganesh-icon.svg';
                        }}
                        alt="Ganesh Logo"
                        style={{
                          width: '62px',
                          height: '62px',
                          borderRadius: '50%',
                          border: '2px solid #d97706',
                          objectFit: 'cover'
                        }}
                      />
                    </div>

                    {/* Center: Mandal Name & Address */}
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <h1
                        style={{
                          fontSize: '20px',
                          fontWeight: 900,
                          color: '#9a3412',
                          margin: '0 0 2px',
                          lineHeight: 1.2
                        }}
                      >
                        {mandalSettings.mandalName || 'शिंदे मळा गणेश उत्सव मंडळ'}
                      </h1>
                      <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#451a03', marginBottom: '2px' }}>
                        📍 {mandalSettings.address || 'शिंदे मळा, हिंगणी दुमाला, ता. दौंड, जि. पुणे - ४१२२१०'}
                      </div>
                      <div style={{ fontSize: '9.5px', color: '#78350f', fontWeight: 600 }}>
                        {mandalSettings.regNo || 'नोंदणी क्र. महा/१२४५/२०१२'} • संपर्क: {mandalSettings.contact || '9922466579'}
                      </div>
                    </div>

                    {/* Right: Year Badge & Date */}
                    <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '100px' }}>
                      <div
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#ea580c',
                          color: '#ffffff',
                          padding: '3px 8px',
                          borderRadius: '5px',
                          fontWeight: 900,
                          fontSize: '12px'
                        }}
                      >
                        उत्सव {mandalSettings.year || '२०२६'}
                      </div>
                      <div style={{ fontSize: '8.5px', color: '#78350f', marginTop: '3px', fontWeight: 600 }}>
                        दिनांक: {generatedDateTime}
                      </div>
                    </div>
                  </div>

                  {/* Report Title Ribbon */}
                  <div
                    style={{
                      backgroundColor: '#fff7ed',
                      border: '1px solid #fdba74',
                      borderRadius: '5px',
                      padding: '6px 12px',
                      textAlign: 'center',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', fontWeight: 900, color: '#9a3412' }}>
                        📋 वार्षिक जमा-खर्च हिशोब अहवाल व आर्थिक ताळेबंद
                      </div>
                      <div style={{ fontSize: '9.5px', color: '#c2410c', fontWeight: 600 }}>
                        (ANNUAL FINANCIAL AUDIT & BALANCE SHEET REPORT)
                      </div>
                    </div>
                    <div
                      style={{
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        fontSize: '9.5px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <CheckCircle2 size={11} />
                      <span>अधिकृत व प्रमाणित हिशोब</span>
                    </div>
                  </div>

                  {/* 3 Executive Stat Cards */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px',
                      marginBottom: '12px'
                    }}
                  >
                    {/* Total Receipts */}
                    <div
                      style={{
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #86efac',
                        borderRadius: '5px',
                        padding: '8px 10px',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#166534', marginBottom: '2px' }}>
                        एकूण पावती जमा (Total Receipts)
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#15803d', lineHeight: 1.2 }}>
                        {formatCurrency(totalCollection)}
                      </div>
                      <div style={{ fontSize: '9px', color: '#166534', marginTop: '2px', fontWeight: 600 }}>
                        एकूण {pavtiCount} अधिकृत पावत्या
                      </div>
                    </div>

                    {/* Total Expenses */}
                    <div
                      style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fca5a5',
                        borderRadius: '5px',
                        padding: '8px 10px',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#991b1b', marginBottom: '2px' }}>
                        एकूण उत्सव खर्च (Total Expenses)
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#dc2626', lineHeight: 1.2 }}>
                        {formatCurrency(totalExpense)}
                      </div>
                      <div style={{ fontSize: '9px', color: '#991b1b', marginTop: '2px', fontWeight: 600 }}>
                        एकूण {expenseList.length} खर्च नोंदी
                      </div>
                    </div>

                    {/* Net Balance */}
                    <div
                      style={{
                        backgroundColor: balance >= 0 ? '#fffbeb' : '#fef2f2',
                        border: balance >= 0 ? '1px solid #fde68a' : '1px solid #fca5a5',
                        borderRadius: '5px',
                        padding: '8px 10px',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '10px', fontWeight: 700, color: balance >= 0 ? '#92400e' : '#991b1b', marginBottom: '2px' }}>
                        {balance >= 0 ? 'निव्वळ शिल्लक निधी (Surplus)' : 'तूट रक्कम (Deficit)'}
                      </div>
                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: 900,
                          color: balance >= 0 ? '#b45309' : '#dc2626',
                          lineHeight: 1.2
                        }}
                      >
                        {formatCurrency(Math.abs(balance))}
                      </div>
                      <div style={{ fontSize: '9px', color: balance >= 0 ? '#92400e' : '#991b1b', marginTop: '2px', fontWeight: 600 }}>
                        अक्षरी: {numberToWordsMr(Math.abs(balance))}
                      </div>
                    </div>
                  </div>

                  {/* Summary Balance Sheet Table */}
                  <div
                    style={{
                      border: '1px solid #fed7aa',
                      borderRadius: '5px',
                      overflow: 'hidden',
                      marginBottom: '12px'
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: '#ea580c',
                        color: '#ffffff',
                        padding: '5px 10px',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>📊 आर्थिक ताळेबंद गोषवारा (Balance Sheet Summary)</span>
                      <span style={{ fontSize: '9.5px', opacity: 0.95 }}>उत्सव वर्ष २०२६</span>
                    </div>

                    <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '10px', boxSizing: 'border-box' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#fff7ed', borderBottom: '1px solid #fed7aa', color: '#7c2d12', fontWeight: 800 }}>
                          <th style={{ padding: '5px 8px', textAlign: 'left', width: '36%' }}>जमा तपशील (Receipts)</th>
                          <th style={{ padding: '5px 8px', textAlign: 'right', width: '14%' }}>रक्कम (₹)</th>
                          <th style={{ padding: '5px 8px', textAlign: 'left', width: '36%', borderLeft: '1px solid #fed7aa' }}>
                            खर्च तपशील (Expenditure)
                          </th>
                          <th style={{ padding: '5px 8px', textAlign: 'right', width: '14%' }}>रक्कम (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: '4px 8px', borderBottom: '1px solid #ffedd5' }}>
                            <strong>१. घरगुती वार्षिक वर्गणी</strong>
                          </td>
                          <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700, color: '#15803d' }}>
                            {formatCurrency(donationTypeStats.find((d) => d.key === 'Vargani')?.amount || 0)}
                          </td>
                          <td style={{ padding: '4px 8px', borderBottom: '1px solid #ffedd5', borderLeft: '1px solid #fed7aa' }}>
                            <strong>१. श्री गणेश मूर्ती व पूजा साहित्य</strong>
                          </td>
                          <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700, color: '#dc2626' }}>
                            {formatCurrency(expenseCategoryStats.find((c) => c.key === 'Murti')?.amount || 0)}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#fffcf9' }}>
                          <td style={{ padding: '4px 8px', borderBottom: '1px solid #ffedd5' }}>
                            <strong>२. ऐच्छिक देणगी (Denagi)</strong>
                          </td>
                          <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700, color: '#15803d' }}>
                            {formatCurrency(donationTypeStats.find((d) => d.key === 'Denagi')?.amount || 0)}
                          </td>
                          <td style={{ padding: '4px 8px', borderBottom: '1px solid #ffedd5', borderLeft: '1px solid #fed7aa' }}>
                            <strong>२. मंडप, स्टेज व छत व्यवस्था</strong>
                          </td>
                          <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700, color: '#dc2626' }}>
                            {formatCurrency(expenseCategoryStats.find((c) => c.key === 'Mandap')?.amount || 0)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '4px 8px', borderBottom: '1px solid #ffedd5' }}>
                            <strong>३. नवस पावती देणगी (Navas)</strong>
                          </td>
                          <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700, color: '#15803d' }}>
                            {formatCurrency(donationTypeStats.find((d) => d.key === 'Navas')?.amount || 0)}
                          </td>
                          <td style={{ padding: '4px 8px', borderBottom: '1px solid #ffedd5', borderLeft: '1px solid #fed7aa' }}>
                            <strong>३. डेकोरेशन व विद्युत रोषणाई</strong>
                          </td>
                          <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700, color: '#dc2626' }}>
                            {formatCurrency(expenseCategoryStats.find((c) => c.key === 'Decoration')?.amount || 0)}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#fffcf9' }}>
                          <td style={{ padding: '4px 8px', borderBottom: '1px solid #ffedd5' }}>
                            <strong>४. इतर जमा व सहाय्य</strong>
                          </td>
                          <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700, color: '#15803d' }}>
                            {formatCurrency(donationTypeStats.find((d) => d.key === 'Other')?.amount || 0)}
                          </td>
                          <td style={{ padding: '4px 8px', borderBottom: '1px solid #ffedd5', borderLeft: '1px solid #fed7aa' }}>
                            <strong>४. ध्वनी (Sound System) व लाईट</strong>
                          </td>
                          <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700, color: '#dc2626' }}>
                            {formatCurrency(expenseCategoryStats.find((c) => c.key === 'SoundLight')?.amount || 0)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '4px 8px', borderBottom: '1px solid #ffedd5', color: '#78350f' }}>
                            <span>• रोख जमा: {formatCurrency(paymentModeStats.find((m) => m.key === 'Cash')?.amount || 0)}</span>
                          </td>
                          <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontSize: '9px' }}>
                            ({paymentModeStats.find((m) => m.key === 'Cash')?.count || 0} पावत्या)
                          </td>
                          <td style={{ padding: '4px 8px', borderBottom: '1px solid #ffedd5', borderLeft: '1px solid #fed7aa' }}>
                            <strong>५. महाप्रसाद व अन्नदान भोजन</strong>
                          </td>
                          <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700, color: '#dc2626' }}>
                            {formatCurrency(expenseCategoryStats.find((c) => c.key === 'Prasad')?.amount || 0)}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#fffcf9' }}>
                          <td style={{ padding: '4px 8px', borderBottom: '1px solid #ffedd5', color: '#78350f' }}>
                            <span>• ऑनलाइन UPI: {formatCurrency(paymentModeStats.find((m) => m.key === 'UPI')?.amount || 0)}</span>
                          </td>
                          <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontSize: '9px' }}>
                            ({paymentModeStats.find((m) => m.key === 'UPI')?.count || 0} पावत्या)
                          </td>
                          <td style={{ padding: '4px 8px', borderBottom: '1px solid #ffedd5', borderLeft: '1px solid #fed7aa' }}>
                            <strong>६. वीज, जनरेटर, सुरक्षा व इतर</strong>
                          </td>
                          <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700, color: '#dc2626' }}>
                            {formatCurrency(
                              (expenseCategoryStats.find((c) => c.key === 'Electricity')?.amount || 0) +
                                (expenseCategoryStats.find((c) => c.key === 'Security')?.amount || 0) +
                                (expenseCategoryStats.find((c) => c.key === 'Misc')?.amount || 0)
                            )}
                          </td>
                        </tr>
                        {/* Totals Row */}
                        <tr style={{ backgroundColor: '#ffedd5', fontWeight: 900, borderTop: '1.5px solid #ea580c' }}>
                          <td style={{ padding: '6px 8px', color: '#9a3412', fontSize: '10.5px' }}>
                            एकूण जमा रक्कम (Total A)
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', color: '#15803d', fontSize: '11px' }}>
                            {formatCurrency(totalCollection)}
                          </td>
                          <td style={{ padding: '6px 8px', color: '#9a3412', fontSize: '10.5px', borderLeft: '1px solid #fed7aa' }}>
                            एकूण खर्च रक्कम (Total B)
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', color: '#dc2626', fontSize: '11px' }}>
                            {formatCurrency(totalExpense)}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#fff7ed', fontWeight: 900 }}>
                          <td colSpan={2} style={{ padding: '5px 8px', color: '#451a03', fontSize: '10px' }}>
                            अंतिम आर्थिक ताळेबंद स्थिती:
                          </td>
                          <td colSpan={2} style={{ padding: '5px 8px', textAlign: 'right', color: balance >= 0 ? '#b45309' : '#dc2626', fontSize: '11px' }}>
                            {balance >= 0 ? `शिल्लक निधी: + ${formatCurrency(balance)}` : `तूट: - ${formatCurrency(Math.abs(balance))}`}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Top Donors Honors List (Top 6) */}
                  <div
                    style={{
                      border: '1px solid #fde68a',
                      borderRadius: '5px',
                      overflow: 'hidden',
                      marginBottom: '8px'
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: '#d97706',
                        color: '#ffffff',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>🏆 सर्वोच्च देणगीदार सन्मान यादी (Top Donors)</span>
                      <span style={{ fontSize: '9px' }}>देणगी व वर्गणी</span>
                    </div>

                    <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '9.5px', boxSizing: 'border-box' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#fffbeb', borderBottom: '1px solid #fde68a', color: '#92400e', fontWeight: 800 }}>
                          <th style={{ padding: '4px 6px', textAlign: 'center', width: '8%' }}>क्र.</th>
                          <th style={{ padding: '4px 6px', textAlign: 'left', width: '18%' }}>पावती क्र.</th>
                          <th style={{ padding: '4px 6px', textAlign: 'left', width: '36%' }}>देणगीदाराचे नाव</th>
                          <th style={{ padding: '4px 6px', textAlign: 'left', width: '22%' }}>पत्ता / परिसर</th>
                          <th style={{ padding: '4px 6px', textAlign: 'right', width: '16%' }}>रक्कम (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topDonorsList.map((d, idx) => (
                          <tr
                            key={d.id || idx}
                            style={{
                              backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fffdf5',
                              borderBottom: '1px solid #fef3c7'
                            }}
                          >
                            <td style={{ padding: '3.5px 6px', textAlign: 'center', fontWeight: 800, color: '#b45309' }}>
                              {idx + 1}
                            </td>
                            <td style={{ padding: '3.5px 6px', fontWeight: 700, color: '#92400e' }}>{d.pavtiNo}</td>
                            <td style={{ padding: '3.5px 6px', fontWeight: 700 }}>{d.donorName}</td>
                            <td style={{ padding: '3.5px 6px', color: '#78350f' }}>{d.address || 'स्थानिक परिसर'}</td>
                            <td style={{ padding: '3.5px 6px', textAlign: 'right', fontWeight: 900, color: '#15803d', whiteSpace: 'nowrap' }}>
                              {formatCurrency(d.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Scope Single Page Signatures */}
                  {reportScope === 'summary' && (
                    <div
                      style={{
                        border: '1px solid #fdba74',
                        backgroundColor: '#fffaf5',
                        borderRadius: '5px',
                        padding: '8px 12px',
                        marginTop: 'auto'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '9px',
                          color: '#7c2d12',
                          textAlign: 'center',
                          marginBottom: '10px',
                          fontStyle: 'italic',
                          fontWeight: 600
                        }}
                      >
                        "सदर हिशोब मूळ पावती पुस्तके व अधिकृत बिलांनुसार अचूक तपासला असून प्रमाणित करण्यात येत आहे."
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                        <div>
                          <div style={{ height: '22px', borderBottom: '1px dashed #c2410c', margin: '0 auto', width: '80%' }} />
                          <div style={{ fontSize: '10px', fontWeight: 800, color: '#451a03', marginTop: '3px' }}>
                            {mandalSettings.president || 'श्री. तुषार शिंदे'}
                          </div>
                          <div style={{ fontSize: '8.5px', color: '#ea580c', fontWeight: 700 }}>अध्यक्ष</div>
                        </div>
                        <div>
                          <div style={{ height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                              src="/signatures/mayur-signature.png"
                              alt="खजिनदार स्वाक्षरी"
                              style={{ maxHeight: '24px', maxWidth: '90px', objectFit: 'contain' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                          <div style={{ height: '1px', borderBottom: '1px dashed #c2410c', margin: '2px auto 3px', width: '80%' }} />
                          <div style={{ fontSize: '10px', fontWeight: 800, color: '#451a03' }}>
                            {mandalSettings.treasurer || 'श्री. तुकाराम शिंदे व श्री. धनंजय शिंदे'}
                          </div>
                          <div style={{ fontSize: '8.5px', color: '#ea580c', fontWeight: 700 }}>खजिनदार</div>
                        </div>
                        <div>
                          <div style={{ height: '22px', borderBottom: '1px dashed #c2410c', margin: '0 auto', width: '80%' }} />
                          <div style={{ fontSize: '10px', fontWeight: 800, color: '#451a03', marginTop: '3px' }}>
                            {mandalSettings.secretary || 'श्री. मानस शिंदे'}
                          </div>
                          <div style={{ fontSize: '8.5px', color: '#ea580c', fontWeight: 700 }}>सचिव</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Page 1 Bottom Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #fed7aa',
                      marginTop: 'auto',
                      paddingTop: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '8.5px',
                      color: '#9a3412',
                      fontWeight: 600
                    }}
                  >
                    <span>शिंदे मळा गणेश उत्सव मंडळ • अधिकृत ताळेबंद</span>
                    <span>गणपती बाप्पा मोरया • मंगलमूर्ती मोरया</span>
                    <span>पान १ / {totalPagesCount}</span>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* PAGE 2: ITEMIZED EXPENSES & OFFICIAL SIGNATURES (तपशीलवार खर्च व स्वाक्षऱ्या) */}
              {/* ========================================================================= */}
              {reportScope !== 'summary' && (
                <div
                  className="pdf-page pdf-page-break-after"
                  style={{
                    width: '690px',
                    minHeight: '970px',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    pageBreakAfter: includeReceipts ? 'always' : 'auto',
                    breakAfter: includeReceipts ? 'page' : 'auto',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      border: '2px solid #b45309',
                      borderRadius: '6px',
                      padding: '12px 14px',
                      boxSizing: 'border-box',
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#ffffff',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Page 2 Mini Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '2px solid #ea580c',
                        paddingBottom: '6px',
                        marginBottom: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src="/logo.png"
                          onError={(e) => {
                            e.target.src = '/ganesh-icon.svg';
                          }}
                          alt="Logo"
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 900, color: '#9a3412' }}>
                            {mandalSettings.mandalName || 'शिंदे मळा गणेश उत्सव मंडळ'}
                          </div>
                          <div style={{ fontSize: '9px', color: '#c2410c', fontWeight: 600 }}>
                            भाग २: तपशीलवार उत्सव खर्च व्हाउचर्स व मंडळ प्रमाणिकरण
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '9px', color: '#78350f', fontWeight: 700 }}>
                        उत्सव वर्ष २०२६ • एकूण खर्च: <strong style={{ color: '#dc2626' }}>{formatCurrency(totalExpense)}</strong>
                      </div>
                    </div>

                    {/* Itemized Expenses Table */}
                    <div
                      style={{
                        border: '1px solid #fed7aa',
                        borderRadius: '5px',
                        overflow: 'hidden',
                        marginBottom: '14px'
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: '#c2410c',
                          color: '#ffffff',
                          padding: '5px 10px',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>💸 तपशीलवार उत्सव खर्च यादी (Itemized Expense Vouchers)</span>
                        <span style={{ fontSize: '9.5px' }}>एकूण {expenseList.length} खर्च नोंदी</span>
                      </div>

                      <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '9.5px', boxSizing: 'border-box' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#fff7ed', borderBottom: '1px solid #fed7aa', color: '#7c2d12', fontWeight: 800 }}>
                            <th style={{ padding: '4px 6px', textAlign: 'center', width: '6%' }}>अ.क्र.</th>
                            <th style={{ padding: '4px 6px', textAlign: 'left', width: '14%' }}>दिनांक</th>
                            <th style={{ padding: '4px 6px', textAlign: 'left', width: '20%' }}>विभाग / प्रकार</th>
                            <th style={{ padding: '4px 6px', textAlign: 'left', width: '30%' }}>खर्चाचे विवरण व तपशील</th>
                            <th style={{ padding: '4px 6px', textAlign: 'left', width: '16%' }}>दुकानदार / व्यक्ती</th>
                            <th style={{ padding: '4px 6px', textAlign: 'right', width: '14%' }}>रक्कम (₹)</th>
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
                                style={{
                                  backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fffcf9',
                                  borderBottom: '1px solid #ffedd5'
                                }}
                              >
                                <td style={{ padding: '4px 6px', textAlign: 'center', color: '#78350f' }}>{idx + 1}</td>
                                <td style={{ padding: '4px 6px', whiteSpace: 'nowrap' }}>{e.date}</td>
                                <td style={{ padding: '4px 6px', fontWeight: 600 }}>{t(`cat${e.category}`) || e.category}</td>
                                <td style={{ padding: '4px 6px', wordBreak: 'break-word' }}>{e.description}</td>
                                <td style={{ padding: '4px 6px', color: '#451a03', wordBreak: 'break-word' }}>{e.paidTo || '—'}</td>
                                <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 800, color: '#dc2626', whiteSpace: 'nowrap' }}>
                                  {formatCurrency(e.amount)}
                                </td>
                              </tr>
                            ))
                          )}
                          <tr style={{ backgroundColor: '#fef2f2', fontWeight: 900, borderTop: '1.5px solid #dc2626' }}>
                            <td colSpan={5} style={{ padding: '5px 8px', textAlign: 'right', color: '#991b1b', fontSize: '10.5px' }}>
                              एकूण उत्सव खर्च बेरीज (Total Expenditure):
                            </td>
                            <td style={{ padding: '5px 8px', textAlign: 'right', color: '#dc2626', fontSize: '11px', whiteSpace: 'nowrap' }}>
                              {formatCurrency(totalExpense)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Official Audit Declaration & Signatures Block */}
                    <div
                      style={{
                        border: '1.5px solid #fdba74',
                        backgroundColor: '#fffaf5',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        marginTop: 'auto',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '9.5px',
                          color: '#7c2d12',
                          textAlign: 'center',
                          lineHeight: 1.5,
                          marginBottom: '14px',
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
                          gap: '10px',
                          textAlign: 'center',
                          paddingTop: '4px'
                        }}
                      >
                        {/* President */}
                        <div>
                          <div style={{ height: '30px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                            <span style={{ borderBottom: '1px dashed #c2410c', width: '80%', display: 'inline-block' }} />
                          </div>
                          <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#451a03', marginTop: '3px' }}>
                            {mandalSettings.president || 'श्री. तुषार शिंदे'}
                          </div>
                          <div style={{ fontSize: '9px', color: '#ea580c', fontWeight: 700 }}>
                            अध्यक्ष (President)
                          </div>
                        </div>

                        {/* Treasurer */}
                        <div>
                          <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                              src="/signatures/mayur-signature.png"
                              alt="खजिनदार स्वाक्षरी"
                              style={{ maxHeight: '32px', maxWidth: '105px', objectFit: 'contain' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                          <div style={{ height: '1px', borderBottom: '1px dashed #c2410c', margin: '2px auto 3px', width: '80%' }} />
                          <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#451a03' }}>
                            {mandalSettings.treasurer || 'श्री. तुकाराम शिंदे व श्री. धनंजय शिंदे'}
                          </div>
                          <div style={{ fontSize: '9px', color: '#ea580c', fontWeight: 700 }}>
                            खजिनदार (Treasurer)
                          </div>
                        </div>

                        {/* Secretary */}
                        <div>
                          <div style={{ height: '30px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                            <span style={{ borderBottom: '1px dashed #c2410c', width: '80%', display: 'inline-block' }} />
                          </div>
                          <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#451a03', marginTop: '3px' }}>
                            {mandalSettings.secretary || 'श्री. मानस शिंदे'}
                          </div>
                          <div style={{ fontSize: '9px', color: '#ea580c', fontWeight: 700 }}>
                            सचिव (Secretary)
                          </div>
                        </div>
                      </div>

                      {/* Official Seal Line */}
                      <div
                        style={{
                          borderTop: '1px solid #fed7aa',
                          marginTop: '10px',
                          paddingTop: '5px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '8.5px',
                          color: '#9a3412',
                          fontWeight: 600
                        }}
                      >
                        <span>मंडळ अधिकृत शिक्का व स्वाक्षरी प्रमाणित</span>
                        <span>शिंदे मळा गणेश उत्सव मंडळ, हिंगणी दुमाला, दौंड</span>
                      </div>
                    </div>

                    {/* Page 2 Bottom Footer */}
                    <div
                      style={{
                        borderTop: '1px solid #fed7aa',
                        marginTop: '8px',
                        paddingTop: '5px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '8.5px',
                        color: '#9a3412',
                        fontWeight: 600
                      }}
                    >
                      <span>शिंदे मळा गणेश उत्सव मंडळ • खर्च अहवाल</span>
                      <span>गणपती बाप्पा मोरया • मंगलमूर्ती मोरया</span>
                      <span>पान २ / {totalPagesCount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* PAGE 3+ : DETAILED PAVTI RECEIPTS LEDGER (संपूर्ण देणगी पावत्या यादी)      */}
              {/* Cleanly paginated in chunks of 20 so tables never get cut awkwardly        */}
              {/* ========================================================================= */}
              {reportScope !== 'summary' && includeReceipts && (
                pavtiChunks.map((chunk, chunkIdx) => {
                  const currentPageNum = 3 + chunkIdx;
                  const isLastChunk = chunkIdx === pavtiChunks.length - 1;
                  const startIndex = chunkIdx * 20;

                  return (
                    <div
                      key={`pavti-page-${chunkIdx}`}
                      className={`pdf-page ${isLastChunk ? '' : 'pdf-page-break-after'}`}
                      style={{
                        width: '690px',
                        minHeight: '970px',
                        boxSizing: 'border-box',
                        backgroundColor: '#ffffff',
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        pageBreakAfter: isLastChunk ? 'auto' : 'always',
                        breakAfter: isLastChunk ? 'auto' : 'page',
                        position: 'relative'
                      }}
                    >
                      <div
                        style={{
                          border: '2px solid #b45309',
                          borderRadius: '6px',
                          padding: '12px 14px',
                          boxSizing: 'border-box',
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#ffffff',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        {/* Page 3 Mini Header */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '2px solid #ea580c',
                            paddingBottom: '6px',
                            marginBottom: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                              src="/logo.png"
                              onError={(e) => {
                                e.target.src = '/ganesh-icon.svg';
                              }}
                              alt="Logo"
                              style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 900, color: '#9a3412' }}>
                                {mandalSettings.mandalName || 'शिंदे मळा गणेश उत्सव मंडळ'}
                              </div>
                              <div style={{ fontSize: '9px', color: '#c2410c', fontWeight: 600 }}>
                                भाग ३: संपूर्ण देणगी पावत्या यादी (Receipts Ledger)
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '9px', color: '#78350f', fontWeight: 700 }}>
                            एकूण पावत्या: {pavtiList.length} • एकूण जमा: <strong style={{ color: '#15803d' }}>{formatCurrency(totalCollection)}</strong>
                          </div>
                        </div>

                        {/* Pavti Table Chunk */}
                        <div
                          style={{
                            border: '1px solid #fed7aa',
                            borderRadius: '5px',
                            overflow: 'hidden',
                            marginBottom: '8px'
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: '#ea580c',
                              color: '#ffffff',
                              padding: '5px 10px',
                              fontSize: '11px',
                              fontWeight: 800,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <span>📜 देणगी पावत्या तपशील (नोंद क्र. {startIndex + 1} ते {startIndex + chunk.length})</span>
                            <span style={{ fontSize: '9.5px' }}>उत्सव २०२६</span>
                          </div>

                          <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '9px', boxSizing: 'border-box' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#fff7ed', borderBottom: '1px solid #fed7aa', color: '#7c2d12', fontWeight: 800 }}>
                                <th style={{ padding: '4px 5px', textAlign: 'center', width: '7%' }}>क्र.</th>
                                <th style={{ padding: '4px 5px', textAlign: 'left', width: '17%' }}>पावती क्र.</th>
                                <th style={{ padding: '4px 5px', textAlign: 'left', width: '13%' }}>दिनांक</th>
                                <th style={{ padding: '4px 5px', textAlign: 'left', width: '29%' }}>देणगीदाराचे नाव</th>
                                <th style={{ padding: '4px 5px', textAlign: 'left', width: '14%' }}>प्रकार</th>
                                <th style={{ padding: '4px 5px', textAlign: 'center', width: '8%' }}>मोड</th>
                                <th style={{ padding: '4px 5px', textAlign: 'right', width: '12%' }}>रक्कम (₹)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {chunk.map((p, idx) => (
                                <tr
                                  key={p.id || idx}
                                  style={{
                                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fffcf9',
                                    borderBottom: '1px solid #ffedd5'
                                  }}
                                >
                                  <td style={{ padding: '3px 5px', textAlign: 'center', color: '#78350f' }}>{startIndex + idx + 1}</td>
                                  <td style={{ padding: '3px 5px', fontWeight: 700, color: '#9a3412', whiteSpace: 'nowrap' }}>{p.pavtiNo}</td>
                                  <td style={{ padding: '3px 5px', whiteSpace: 'nowrap' }}>{p.date}</td>
                                  <td style={{ padding: '3px 5px', fontWeight: 600, wordBreak: 'break-word' }}>{p.donorName}</td>
                                  <td style={{ padding: '3px 5px', whiteSpace: 'nowrap' }}>{t(`type${p.donationType}`) || p.donationType}</td>
                                  <td style={{ padding: '3px 5px', textAlign: 'center', whiteSpace: 'nowrap' }}>{p.paymentMode}</td>
                                  <td style={{ padding: '3px 5px', textAlign: 'right', fontWeight: 800, color: '#15803d', whiteSpace: 'nowrap' }}>
                                    {formatCurrency(p.amount)}
                                  </td>
                                </tr>
                              ))}
                              {isLastChunk && (
                                <tr style={{ backgroundColor: '#f0fdf4', fontWeight: 900, borderTop: '1.5px solid #16a34a' }}>
                                  <td colSpan={6} style={{ padding: '5px 8px', textAlign: 'right', color: '#166534', fontSize: '10px' }}>
                                    एकूण जमा पावती रक्कम बेरीज (Total Collection):
                                  </td>
                                  <td style={{ padding: '5px 8px', textAlign: 'right', color: '#15803d', fontSize: '10.5px', whiteSpace: 'nowrap' }}>
                                    {formatCurrency(totalCollection)}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Page Bottom Footer */}
                        <div
                          style={{
                            borderTop: '1px solid #fed7aa',
                            marginTop: 'auto',
                            paddingTop: '5px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '8.5px',
                            color: '#9a3412',
                            fontWeight: 600
                          }}
                        >
                          <span>शिंदे मळा गणेश उत्सव मंडळ • पावती वही</span>
                          <span>गणपती बाप्पा मोरया • मंगलमूर्ती मोरया</span>
                          <span>पान {currentPageNum} / {totalPagesCount}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer with Mobile Quick Action bar */}
        <div
          style={{
            padding: '0.65rem 1.25rem',
            borderTop: '1px solid var(--glass-border)',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.65rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-subtle)', fontSize: '0.78rem' }}>
            <ShieldCheck size={15} color="#10b981" />
            <span>हा अधिकृत अहवाल सर्व मोबाईल, टॅब्लेट व कॉम्प्युटरवर योग्य फॉरमॅटमध्ये डाउनलोड होतो.</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: '0.35rem 0.8rem' }}>
              {t('close') || 'बंद करा'}
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              style={{ padding: '0.35rem 1.1rem', fontWeight: 700 }}
            >
              {isGeneratingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span>{isGeneratingPdf ? 'PDF तयार होत आहे...' : 'PDF डाउनलोड करा'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

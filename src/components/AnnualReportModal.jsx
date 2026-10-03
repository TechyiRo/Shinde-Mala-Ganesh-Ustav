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
  Sparkles,
  UtensilsCrossed
} from 'lucide-react';
import { formatCurrency, numberToWordsMr } from '../i18n/numberToWords';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const AnnualReportModal = ({ isOpen, onClose, defaultScope = 'all' }) => {
  const { t } = useLanguage();
  const {
    mandalSettings,
    pavtiList,
    expenseList,
    totalCollection,
    totalExpense,
    balance,
    pavtiCount,
    mahaprasadData,
    mahaprasadTotalExpense,
    manakariList,
    manakariCount,
    perHeadShare,
    totalMahaprasadCollected,
    totalMahaprasadPending
  } = useData();
  const reportRef = useRef(null);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 680) {
      return Math.max(0.48, Math.min(0.85, Number(((window.innerWidth - 32) / 670).toFixed(2))));
    }
    return 1;
  });
  const [reportScope, setReportScope] = useState(defaultScope); // 'all' | 'summary'
  const [includeReceipts, setIncludeReceipts] = useState(true);

  // Auto-adjust initial zoom when opened on a mobile device
  React.useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && window.innerWidth < 680) {
      setZoomLevel(Math.max(0.48, Math.min(0.85, Number(((window.innerWidth - 32) / 670).toFixed(2)))));
    }
  }, [isOpen]);

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

  // Dynamic Pavti Chunking:
  // If <= 19 pavtis, all fit on the final page together with the Signatures block!
  // If > 19, chunk into pages so the final page always has at most 18 pavtis + Signatures.
  const pavtiChunks = useMemo(() => {
    if (pavtiList.length <= 19) {
      return [pavtiList];
    }
    const chunks = [];
    let i = 0;
    while (i < pavtiList.length) {
      const remaining = pavtiList.length - i;
      if (remaining <= 19) {
        chunks.push(pavtiList.slice(i));
        break;
      }
      const take = 22;
      chunks.push(pavtiList.slice(i, i + take));
      i += take;
    }
    return chunks.length > 0 ? chunks : [[]];
  }, [pavtiList]);

  // Total pages calculation
  const totalPagesCount = useMemo(() => {
    if (reportScope === 'summary') return 1;
    if (reportScope === 'mahaprasad') return 1;
    if (!includeReceipts) return 3;
    return 3 + pavtiChunks.length;
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

  // Handle Download PDF via isolated per-page capture (Guarantees exact page count & 100% full borders on mobile)
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);

    let renderHost = null;
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const cleanYear = mandalSettings.year || '2026';
      const filename = reportScope === 'mahaprasad'
        ? `Shinde_Mala_Mahaprasad_Ahaval_${cleanYear}.pdf`
        : `Shinde_Mala_Ganesh_Utsav_Ahaval_${cleanYear}.pdf`;

      // Select all individual pages from the report
      const pageElements = reportRef.current.querySelectorAll('.pdf-page');
      if (!pageElements || pageElements.length === 0) {
        throw new Error('No PDF pages found to generate');
      }

      // Create an isolated, fixed-size off-screen render host attached to document.body
      // This completely shields canvas rendering from mobile viewport clipping, parent scroll, and flex centering!
      renderHost = document.createElement('div');
      renderHost.setAttribute('id', 'pdf-export-isolated-host');
      renderHost.style.position = 'fixed';
      renderHost.style.left = '0';
      renderHost.style.top = '0';
      renderHost.style.width = '670px';
      renderHost.style.height = '960px';
      renderHost.style.margin = '0';
      renderHost.style.padding = '0';
      renderHost.style.zIndex = '-99999';
      renderHost.style.backgroundColor = '#ffffff';
      renderHost.style.color = '#1a1006';
      renderHost.style.overflow = 'visible';
      renderHost.style.pointerEvents = 'none';
      document.body.appendChild(renderHost);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];

        // Clear and append clone of this exact page
        renderHost.innerHTML = '';
        const clone = pageEl.cloneNode(true);
        clone.style.margin = '0';
        clone.style.position = 'relative';
        clone.style.width = '670px';
        clone.style.minHeight = '960px';
        clone.style.maxHeight = '960px';
        clone.style.boxSizing = 'border-box';
        clone.style.overflow = 'hidden';
        clone.style.transform = 'none';
        clone.style.color = '#1a1006';
        clone.style.backgroundColor = '#ffffff';
        renderHost.appendChild(clone);

        // Wait for images in the clone to be ready
        const imgs = Array.from(clone.querySelectorAll('img'));
        await Promise.all(
          imgs.map((img) => {
            if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
            return new Promise((res) => {
              img.onload = res;
              img.onerror = res;
            });
          })
        );

        // Small tick for layout stabilization
        await new Promise((resolve) => setTimeout(resolve, 60));

        // High-definition render of the clean isolated page
        const canvas = await html2canvas(clone, {
          scale: 2.2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          letterRendering: true,
          width: 670,
          height: 960,
          windowWidth: 1024,
          scrollX: 0,
          scrollY: 0,
          x: 0,
          y: 0
        });

        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        const imgData = canvas.toDataURL('image/jpeg', 0.98);

        // Exact symmetrical placement on A4 (210mm x 297mm)
        // 8mm left margin & 8mm right margin -> printWidth = 194mm
        const printWidth = 194;
        const canvasAspect = canvas.height / canvas.width;
        const printHeight = Math.min(278, printWidth * canvasAspect);
        const marginX = (210 - printWidth) / 2; // Exactly 8.0 mm
        const marginY = (297 - printHeight) / 2; // Exactly ~9.5 mm (vertically centered)

        pdf.addImage(imgData, 'JPEG', marginX, marginY, printWidth, printHeight, undefined, 'FAST');
      }

      pdf.save(filename);
    } catch (err) {
      console.error('Report PDF generation error:', err);
      window.print();
    } finally {
      if (renderHost && renderHost.parentNode) {
        renderHost.parentNode.removeChild(renderHost);
      }
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

  // Reusable Signatures Block Component
  const renderSignaturesBlock = () => (
    <div
      style={{
        border: '1.5px solid #fdba74',
        backgroundColor: '#fffaf5',
        borderRadius: '6px',
        padding: '8px 12px',
        boxSizing: 'border-box',
        width: '100%',
        marginTop: '8px'
      }}
    >
      <div
        style={{
          fontSize: '9.5px',
          color: '#7c2d12',
          textAlign: 'center',
          lineHeight: 1.4,
          marginBottom: '10px',
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
          gap: '8px',
          textAlign: 'center'
        }}
      >
        {/* President (With Tushar Signature) */}
        <div>
          <div style={{ height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src="/signatures/tushar-signature.png"
              alt="अध्यक्ष स्वाक्षरी"
              style={{ maxHeight: '30px', maxWidth: '100px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div style={{ height: '1px', borderBottom: '1px dashed #c2410c', margin: '1px auto 3px', width: '80%' }} />
          <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#451a03' }}>
            {mandalSettings.president || 'श्री. तुषार शिंदे'}
          </div>
          <div style={{ fontSize: '9px', color: '#ea580c', fontWeight: 700 }}>
            अध्यक्ष (President)
          </div>
        </div>

        {/* Treasurer (With Tukaram & Dhananjay/Mayur Signatures) */}
        <div>
          <div style={{ height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <img
              src="/signatures/tukaram-signature.png"
              alt="तुकाराम शिंदे स्वाक्षरी"
              title="श्री. तुकाराम शिंदे स्वाक्षरी"
              style={{ maxHeight: '30px', maxWidth: '58px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <img
              src="/signatures/mayur-signature.png"
              alt="धनंजय (मयूर) शिंदे स्वाक्षरी"
              title="श्री. धनंजय शिंदे स्वाक्षरी"
              style={{ maxHeight: '30px', maxWidth: '58px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div style={{ height: '1px', borderBottom: '1px dashed #c2410c', margin: '1px auto 3px', width: '80%' }} />
          <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#451a03' }}>
            {mandalSettings.treasurer || 'श्री. तुकाराम शिंदे व श्री. धनंजय शिंदे'}
          </div>
          <div style={{ fontSize: '9px', color: '#ea580c', fontWeight: 700 }}>
            खजिनदार (Treasurer)
          </div>
        </div>

        {/* Secretary (With Manas Signature) */}
        <div>
          <div style={{ height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src="/signatures/manas-signature.png"
              alt="सचिव स्वाक्षरी"
              style={{ maxHeight: '30px', maxWidth: '100px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div style={{ height: '1px', borderBottom: '1px dashed #c2410c', margin: '1px auto 3px', width: '80%' }} />
          <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#451a03' }}>
            {mandalSettings.secretary || 'श्री. मानस शिंदे'}
          </div>
          <div style={{ fontSize: '9px', color: '#ea580c', fontWeight: 700 }}>
            सचिव (Secretary)
          </div>
        </div>
      </div>

      {/* Official Seal & Digital Verification Line */}
      <div
        style={{
          borderTop: '1px solid #fed7aa',
          marginTop: '6px',
          paddingTop: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '8px',
          color: '#9a3412',
          fontWeight: 600
        }}
      >
        <span>मंडळ अधिकृत शिक्का व स्वाक्षरी प्रमाणित</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <img
            src="/rs-logo.svg"
            alt="RS"
            style={{ width: '15px', height: '15px', objectFit: 'contain', verticalAlign: 'middle', borderRadius: '3px' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span style={{ fontSize: '7.8px', color: '#78350f' }}>
            Report generated by:{' '}
            <a
              href="https://shindemala.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#c2410c', fontWeight: 800, textDecoration: 'none' }}
            >
              shindemala.vercel.app
            </a>
          </span>
        </div>
        <span>शिंदे मळा गणेश उत्सव मंडळ, हिंगणी दुमाला</span>
      </div>
    </div>
  );

  // Reusable PDF Page Footer Component with official branding, RS Logo & Link
  const renderPdfPageFooter = (title, pageNum) => (
    <div
      style={{
        borderTop: '1px solid #fed7aa',
        paddingTop: '3px',
        marginTop: '3px',
        fontSize: '8.5px',
        color: '#9a3412',
        fontWeight: 600
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{title}</span>
        <span>गणपती बाप्पा मोरया • मंगलमूर्ती मोरया</span>
        <span>पान {pageNum} / {totalPagesCount}</span>
      </div>
      <div
        style={{
          borderTop: '1px dashed #fed7aa',
          marginTop: '2.5px',
          paddingTop: '2px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '7.8px',
          color: '#78350f'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <img
            src="/rs-logo.svg"
            alt="RS"
            style={{ width: '14px', height: '14px', objectFit: 'contain', verticalAlign: 'middle', borderRadius: '3px' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span>
            Report generated by:{' '}
            <a
              href="https://shindemala.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#c2410c', fontWeight: 800, textDecoration: 'none' }}
            >
              shindemala.vercel.app
            </a>
          </span>
        </div>
        <span style={{ fontSize: '7.5px', color: '#9a3412', fontStyle: 'italic', fontWeight: 600 }}>
          शिंदे मळा गणेश उत्सव मंडळ • डिजिटल प्रणाली
        </span>
      </div>
    </div>
  );

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
                onClick={() => setZoomLevel((prev) => Math.max(0.45, Number((prev - 0.08).toFixed(2))))}
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
                onClick={() => setZoomLevel((prev) => Math.min(1.5, Number((prev + 0.08).toFixed(2))))}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 680) {
                    setZoomLevel(Math.max(0.48, Math.min(0.85, Number(((window.innerWidth - 32) / 670).toFixed(2)))));
                  } else {
                    setZoomLevel(1);
                  }
                }}
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
              <button
                className={`chip-btn ${reportScope === 'mahaprasad' ? 'active' : ''}`}
                onClick={() => setReportScope('mahaprasad')}
                style={{
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.76rem',
                  borderRadius: '999px',
                  backgroundColor: reportScope === 'mahaprasad' ? '#d97706' : 'rgba(255, 255, 255, 0.06)',
                  color: reportScope === 'mahaprasad' ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                🍲 महाप्रसाद अहवाल (Mahaprasad Statement)
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
            padding: 'clamp(0.35rem, 2vw, 1.25rem)',
            backgroundColor: '#0c0f16',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Centering host: ensures full left-to-right horizontal scrollability on mobile without negative coordinate clipping */}
          <div
            style={{
              width: 'max-content',
              minWidth: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              padding: '0 4px',
              boxSizing: 'border-box'
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
              {/* Width: 670px, Height: 960px ensures NO extra page spillover & NO right cut */}
              {/* ========================================================================= */}
              <div
                id="annual-report-pdf-doc"
                ref={reportRef}
                className="annual-report-pdf-doc"
                style={{
                  width: '670px',
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
                {reportScope !== 'mahaprasad' && (
                <div
                  className="pdf-page pdf-page-break-after"
                  style={{
                    width: '670px',
                    minHeight: '960px',
                    maxHeight: '960px',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                    color: '#1a1006',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    pageBreakAfter: reportScope === 'summary' ? 'auto' : 'always',
                    breakAfter: reportScope === 'summary' ? 'auto' : 'page',
                    position: 'relative',
                    overflow: 'hidden'
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
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  {/* Top Block: Auspicious Tag, Header, Ribbon, Stat Cards, Taaleband, Donors */}
                  <div>
                    {/* Auspicious Vedic Top Tag */}
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#c2410c',
                        letterSpacing: '0.06em',
                        marginBottom: '4px'
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
                            width: '58px',
                            height: '58px',
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
                            fontSize: '19px',
                            fontWeight: 900,
                            color: '#9a3412',
                            margin: '0 0 2px',
                            lineHeight: 1.2
                          }}
                        >
                          {mandalSettings.mandalName || 'शिंदे मळा गणेश उत्सव मंडळ'}
                        </h1>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#451a03', marginBottom: '2px' }}>
                          📍 {(mandalSettings.address || 'शिंदे मळा, हिंगणी दुमाला, ४१२२१०').replace(/,?\s*ता\.\s*दौंड/g, '').replace(/,?\s*जि\.\s*पुणे\s*-?/g, '').replace(/,?\s*दौंड/g, '').trim()}
                        </div>
                        <div style={{ fontSize: '9px', color: '#78350f', fontWeight: 600 }}>
                          {mandalSettings.regNo || 'नोंदणी क्र. महा/१२४५/२०१२'} • संपर्क: {mandalSettings.contact || '9922466579'}
                        </div>
                      </div>

                      {/* Right: Year Badge & Date */}
                      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '95px' }}>
                        <div
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#ea580c',
                            color: '#ffffff',
                            padding: '3px 8px',
                            borderRadius: '5px',
                            fontWeight: 900,
                            fontSize: '11.5px'
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
                        padding: '6px 10px',
                        textAlign: 'center',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 900, color: '#9a3412' }}>
                          📋 वार्षिक जमा-खर्च हिशोब अहवाल व आर्थिक ताळेबंद
                        </div>
                        <div style={{ fontSize: '9px', color: '#c2410c', fontWeight: 600 }}>
                          (ANNUAL FINANCIAL AUDIT & BALANCE SHEET REPORT)
                        </div>
                      </div>
                      <div
                        style={{
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          fontSize: '9px',
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
                        marginBottom: '10px'
                      }}
                    >
                      {/* Total Receipts */}
                      <div
                        style={{
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #86efac',
                          borderRadius: '5px',
                          padding: '7px 10px',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#166534', marginBottom: '2px' }}>
                          एकूण पावती जमा (Total Receipts)
                        </div>
                        <div style={{ fontSize: '17px', fontWeight: 900, color: '#15803d', lineHeight: 1.2 }}>
                          {formatCurrency(totalCollection)}
                        </div>
                        <div style={{ fontSize: '8.5px', color: '#166534', marginTop: '2px', fontWeight: 600 }}>
                          एकूण {pavtiCount} अधिकृत पावत्या
                        </div>
                      </div>

                      {/* Total Expenses */}
                      <div
                        style={{
                          backgroundColor: '#fef2f2',
                          border: '1px solid #fca5a5',
                          borderRadius: '5px',
                          padding: '7px 10px',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#991b1b', marginBottom: '2px' }}>
                          एकूण उत्सव खर्च (Total Expenses)
                        </div>
                        <div style={{ fontSize: '17px', fontWeight: 900, color: '#dc2626', lineHeight: 1.2 }}>
                          {formatCurrency(totalExpense)}
                        </div>
                        <div style={{ fontSize: '8.5px', color: '#991b1b', marginTop: '2px', fontWeight: 600 }}>
                          एकूण {expenseList.length} खर्च नोंदी
                        </div>
                      </div>

                      {/* Net Balance */}
                      <div
                        style={{
                          backgroundColor: balance >= 0 ? '#fffbeb' : '#fef2f2',
                          border: balance >= 0 ? '1px solid #fde68a' : '1px solid #fca5a5',
                          borderRadius: '5px',
                          padding: '7px 10px',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: '9.5px', fontWeight: 700, color: balance >= 0 ? '#92400e' : '#991b1b', marginBottom: '2px' }}>
                          {balance >= 0 ? 'निव्वळ शिल्लक निधी (Surplus)' : 'तूट रक्कम (Deficit)'}
                        </div>
                        <div
                          style={{
                            fontSize: '17px',
                            fontWeight: 900,
                            color: balance >= 0 ? '#b45309' : '#dc2626',
                            lineHeight: 1.2
                          }}
                        >
                          {formatCurrency(Math.abs(balance))}
                        </div>
                        <div style={{ fontSize: '8.5px', color: balance >= 0 ? '#92400e' : '#991b1b', marginTop: '2px', fontWeight: 600 }}>
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
                        marginBottom: '10px'
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: '#ea580c',
                          color: '#ffffff',
                          padding: '5px 10px',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>📊 आर्थिक ताळेबंद गोषवारा (Balance Sheet Summary)</span>
                        <span style={{ fontSize: '9px', opacity: 0.95 }}>उत्सव वर्ष २०२६</span>
                      </div>

                      <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '9.5px', color: '#1a1006', boxSizing: 'border-box' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#fff7ed', borderBottom: '1px solid #fed7aa', color: '#7c2d12', fontWeight: 800 }}>
                            <th style={{ padding: '4px 6px', textAlign: 'left', width: '36%', color: '#7c2d12' }}>जमा तपशील (Receipts)</th>
                            <th style={{ padding: '4px 8px', textAlign: 'right', width: '14%', color: '#7c2d12' }}>रक्कम (₹)</th>
                            <th style={{ padding: '4px 6px', textAlign: 'left', width: '36%', borderLeft: '1px solid #fed7aa', color: '#7c2d12' }}>
                              खर्च तपशील (Expenditure)
                            </th>
                            <th style={{ padding: '4px 8px', textAlign: 'right', width: '14%', color: '#7c2d12' }}>रक्कम (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #ffedd5', color: '#1a1006' }}>
                              <strong style={{ color: '#261a0e' }}>१. घरगुती वार्षिक वर्गणी</strong>
                            </td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700, color: '#15803d' }}>
                              {formatCurrency(donationTypeStats.find((d) => d.key === 'Vargani')?.amount || 0)}
                            </td>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #ffedd5', borderLeft: '1px solid #fed7aa', color: '#1a1006' }}>
                              <strong style={{ color: '#261a0e' }}>१. श्री गणेश मूर्ती व पूजा साहित्य</strong>
                            </td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700, color: '#dc2626' }}>
                              {formatCurrency(expenseCategoryStats.find((c) => c.key === 'Murti')?.amount || 0)}
                            </td>
                          </tr>
                          <tr style={{ backgroundColor: '#fffcf9' }}>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #ffedd5', color: '#1a1006' }}>
                              <strong style={{ color: '#261a0e' }}>२. ऐच्छिक देणगी (Denagi)</strong>
                            </td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700, color: '#15803d' }}>
                              {formatCurrency(donationTypeStats.find((d) => d.key === 'Denagi')?.amount || 0)}
                            </td>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #ffedd5', borderLeft: '1px solid #fed7aa', color: '#1a1006' }}>
                              <strong style={{ color: '#261a0e' }}>२. मंडप, स्टेज व छत व्यवस्था</strong>
                            </td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700, color: '#dc2626' }}>
                              {formatCurrency(expenseCategoryStats.find((c) => c.key === 'Mandap')?.amount || 0)}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #ffedd5', color: '#1a1006' }}>
                              <strong style={{ color: '#261a0e' }}>३. नवस पावती देणगी (Navas)</strong>
                            </td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700, color: '#15803d' }}>
                              {formatCurrency(donationTypeStats.find((d) => d.key === 'Navas')?.amount || 0)}
                            </td>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #ffedd5', borderLeft: '1px solid #fed7aa', color: '#1a1006' }}>
                              <strong style={{ color: '#261a0e' }}>३. डेकोरेशन व विद्युत रोषणाई</strong>
                            </td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700, color: '#dc2626' }}>
                              {formatCurrency(expenseCategoryStats.find((c) => c.key === 'Decoration')?.amount || 0)}
                            </td>
                          </tr>
                          <tr style={{ backgroundColor: '#fffcf9' }}>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #ffedd5', color: '#1a1006' }}>
                              <strong style={{ color: '#261a0e' }}>४. इतर जमा व सहाय्य</strong>
                            </td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700, color: '#15803d' }}>
                              {formatCurrency(donationTypeStats.find((d) => d.key === 'Other')?.amount || 0)}
                            </td>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #ffedd5', borderLeft: '1px solid #fed7aa', color: '#1a1006' }}>
                              <strong style={{ color: '#261a0e' }}>४. ध्वनी (Sound System) व लाईट</strong>
                            </td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700, color: '#dc2626' }}>
                              {formatCurrency(expenseCategoryStats.find((c) => c.key === 'SoundLight')?.amount || 0)}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #ffedd5', color: '#78350f' }}>
                              <span style={{ color: '#451a03', fontWeight: 600 }}>• रोख जमा: {formatCurrency(paymentModeStats.find((m) => m.key === 'Cash')?.amount || 0)}</span>
                            </td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontSize: '8.5px', color: '#78350f' }}>
                              ({paymentModeStats.find((m) => m.key === 'Cash')?.count || 0} पावत्या)
                            </td>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #ffedd5', borderLeft: '1px solid #fed7aa', color: '#1a1006' }}>
                              <strong style={{ color: '#261a0e' }}>५. महाप्रसाद व अन्नदान भोजन</strong>
                            </td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontWeight: 700, color: '#dc2626' }}>
                              {formatCurrency(expenseCategoryStats.find((c) => c.key === 'Prasad')?.amount || 0)}
                            </td>
                          </tr>
                          <tr style={{ backgroundColor: '#fffcf9' }}>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #ffedd5', color: '#78350f' }}>
                              <span style={{ color: '#451a03', fontWeight: 600 }}>• ऑनलाइन UPI: {formatCurrency(paymentModeStats.find((m) => m.key === 'UPI')?.amount || 0)}</span>
                            </td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', borderBottom: '1px solid #ffedd5', fontSize: '8.5px', color: '#78350f' }}>
                              ({paymentModeStats.find((m) => m.key === 'UPI')?.count || 0} पावत्या)
                            </td>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #ffedd5', borderLeft: '1px solid #fed7aa', color: '#1a1006' }}>
                              <strong style={{ color: '#261a0e' }}>६. वीज, जनरेटर, सुरक्षा व इतर</strong>
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
                            <td style={{ padding: '5px 6px', color: '#9a3412', fontSize: '10px' }}>
                              एकूण जमा रक्कम (Total A)
                            </td>
                            <td style={{ padding: '5px 8px', textAlign: 'right', color: '#15803d', fontSize: '10.5px' }}>
                              {formatCurrency(totalCollection)}
                            </td>
                            <td style={{ padding: '5px 6px', color: '#9a3412', fontSize: '10px', borderLeft: '1px solid #fed7aa' }}>
                              एकूण खर्च रक्कम (Total B)
                            </td>
                            <td style={{ padding: '5px 8px', textAlign: 'right', color: '#dc2626', fontSize: '10.5px' }}>
                              {formatCurrency(totalExpense)}
                            </td>
                          </tr>
                          <tr style={{ backgroundColor: '#fff7ed', fontWeight: 900 }}>
                            <td colSpan={2} style={{ padding: '4px 6px', color: '#451a03', fontSize: '9.5px' }}>
                              अंतिम आर्थिक ताळेबंद स्थिती:
                            </td>
                            <td colSpan={2} style={{ padding: '4px 8px', textAlign: 'right', color: balance >= 0 ? '#b45309' : '#dc2626', fontSize: '10.5px' }}>
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
                        marginBottom: '6px'
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: '#d97706',
                          color: '#ffffff',
                          padding: '4px 8px',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>🏆 सर्वोच्च देणगीदार सन्मान यादी (Top Donors)</span>
                        <span style={{ fontSize: '8.5px' }}>देणगी व वर्गणी</span>
                      </div>

                      <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '9px', color: '#1a1006', boxSizing: 'border-box' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#fffbeb', borderBottom: '1px solid #fde68a', color: '#92400e', fontWeight: 800 }}>
                            <th style={{ padding: '3.5px 5px', textAlign: 'center', width: '8%', color: '#92400e' }}>क्र.</th>
                            <th style={{ padding: '3.5px 5px', textAlign: 'left', width: '18%', color: '#92400e' }}>पावती क्र.</th>
                            <th style={{ padding: '3.5px 5px', textAlign: 'left', width: '36%', color: '#92400e' }}>देणगीदाराचे नाव</th>
                            <th style={{ padding: '3.5px 5px', textAlign: 'left', width: '22%', color: '#92400e' }}>पत्ता / परिसर</th>
                            <th style={{ padding: '3.5px 8px', textAlign: 'right', width: '16%', color: '#92400e' }}>रक्कम (₹)</th>
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
                              <td style={{ padding: '3px 5px', textAlign: 'center', fontWeight: 800, color: '#b45309' }}>
                                {idx + 1}
                              </td>
                              <td style={{ padding: '3px 5px', fontWeight: 700, color: '#92400e' }}>{d.pavtiNo}</td>
                              <td style={{ padding: '3px 5px', fontWeight: 800, color: '#1a1006' }}>{d.donorName}</td>
                              <td style={{ padding: '3px 5px', color: '#451a03', fontWeight: 600 }}>{d.address || 'स्थानिक परिसर'}</td>
                              <td style={{ padding: '3px 8px', textAlign: 'right', fontWeight: 900, color: '#15803d', whiteSpace: 'nowrap' }}>
                                {formatCurrency(d.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary Scope Single Page Signatures (Only if Single Page Summary Mode) */}
                  {reportScope === 'summary' && renderSignaturesBlock()}

                  {/* Page 1 Bottom Footer */}
                  {renderPdfPageFooter('शिंदे मळा गणेश उत्सव मंडळ • अधिकृत ताळेबंद', 1)}
                </div>
              </div>
              )}

              {/* ========================================================================= */}
              {/* PAGE 2: ITEMIZED EXPENSES TABLE (तपशीलवार खर्च व्हाउचर्स यादी)            */}
              {/* ========================================================================= */}
              {reportScope !== 'summary' && reportScope !== 'mahaprasad' && (
                <div
                  className="pdf-page pdf-page-break-after"
                  style={{
                    width: '670px',
                    minHeight: '960px',
                    maxHeight: '960px',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                    color: '#1a1006',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    pageBreakAfter: 'always',
                    breakAfter: 'page',
                    position: 'relative',
                    overflow: 'hidden'
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
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    {/* Top Content: Mini Header + Expenses Table */}
                    <div>
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
                            <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#9a3412' }}>
                              {mandalSettings.mandalName || 'शिंदे मळा गणेश उत्सव मंडळ'}
                            </div>
                            <div style={{ fontSize: '9px', color: '#c2410c', fontWeight: 600 }}>
                              भाग २: तपशीलवार उत्सव खर्च व्हाउचर्स (Itemized Expense Vouchers)
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '9px', color: '#78350f', fontWeight: 700 }}>
                          उत्सव वर्ष २०२६ • एकूण खर्च: <strong style={{ color: '#dc2626' }}>{formatCurrency(totalExpense)}</strong>
                        </div>
                      </div>

                      {/* Category Breakdown Highlights Row */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: '6px',
                          marginBottom: '10px'
                        }}
                      >
                        {expenseCategoryStats.slice(0, 4).map((c) => (
                          <div
                            key={c.key}
                            style={{
                              backgroundColor: '#fff7ed',
                              border: '1px solid #fed7aa',
                              borderRadius: '4px',
                              padding: '5px 7px',
                              textAlign: 'center'
                            }}
                          >
                            <div style={{ fontSize: '8.5px', color: '#7c2d12', fontWeight: 700 }}>{c.label}</div>
                            <div style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', marginTop: '1px' }}>
                              {formatCurrency(c.amount)}
                            </div>
                            <div style={{ fontSize: '7.5px', color: '#9a3412' }}>{c.percent}% वाटा ({c.count} व्हाउचर्स)</div>
                          </div>
                        ))}
                      </div>

                      {/* Itemized Expenses Table */}
                      <div
                        style={{
                          border: '1px solid #fed7aa',
                          borderRadius: '5px',
                          overflow: 'hidden',
                          marginBottom: '10px'
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: '#c2410c',
                            color: '#ffffff',
                            padding: '5px 10px',
                            fontSize: '10.5px',
                            fontWeight: 800,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span>💸 तपशीलवार उत्सव खर्च यादी</span>
                          <span style={{ fontSize: '9px' }}>एकूण {expenseList.length} खर्च नोंदी</span>
                        </div>

                        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '9px', color: '#1a1006', boxSizing: 'border-box' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#fff7ed', borderBottom: '1px solid #fed7aa', color: '#7c2d12', fontWeight: 800 }}>
                              <th style={{ padding: '4px 5px', textAlign: 'center', width: '6%', color: '#7c2d12' }}>अ.क्र.</th>
                              <th style={{ padding: '4px 5px', textAlign: 'left', width: '14%', color: '#7c2d12' }}>दिनांक</th>
                              <th style={{ padding: '4px 5px', textAlign: 'left', width: '18%', color: '#7c2d12' }}>विभाग / प्रकार</th>
                              <th style={{ padding: '4px 5px', textAlign: 'left', width: '32%', color: '#7c2d12' }}>खर्चाचे विवरण व तपशील</th>
                              <th style={{ padding: '4px 5px', textAlign: 'left', width: '16%', color: '#7c2d12' }}>दुकानदार / व्यक्ती</th>
                              <th style={{ padding: '4px 8px', textAlign: 'right', width: '14%', color: '#7c2d12' }}>रक्कम (₹)</th>
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
                                  <td style={{ padding: '4px 5px', textAlign: 'center', color: '#78350f', fontWeight: 700 }}>{idx + 1}</td>
                                  <td style={{ padding: '4px 5px', whiteSpace: 'nowrap', color: '#451a03' }}>{e.date}</td>
                                  <td style={{ padding: '4px 5px', fontWeight: 700, color: '#261a0e' }}>{t(`cat${e.category}`) || e.category}</td>
                                  <td style={{ padding: '4px 5px', wordBreak: 'break-word', color: '#1a1006', fontWeight: 600 }}>{e.description}</td>
                                  <td style={{ padding: '4px 5px', color: '#451a03', wordBreak: 'break-word' }}>{e.paidTo || '—'}</td>
                                  <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 800, color: '#dc2626', whiteSpace: 'nowrap' }}>
                                    {formatCurrency(e.amount)}
                                  </td>
                                </tr>
                              ))
                            )}
                            <tr style={{ backgroundColor: '#fef2f2', fontWeight: 900, borderTop: '1.5px solid #dc2626' }}>
                              <td colSpan={5} style={{ padding: '5px 6px', textAlign: 'right', color: '#991b1b', fontSize: '10px' }}>
                                एकूण उत्सव खर्च बेरीज (Total Expenditure):
                              </td>
                              <td style={{ padding: '5px 8px', textAlign: 'right', color: '#dc2626', fontSize: '10.5px', whiteSpace: 'nowrap' }}>
                                {formatCurrency(totalExpense)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Official Verification Note */}
                      <div
                        style={{
                          backgroundColor: '#fef3c7',
                          border: '1px solid #fde68a',
                          borderRadius: '5px',
                          padding: '6px 10px',
                          fontSize: '8.5px',
                          color: '#92400e',
                          fontWeight: 600,
                          lineHeight: 1.4
                        }}
                      >
                        📌 <strong>खर्च नोंदणी नियम व पडताळणी:</strong> मंडळाचे सर्व खर्च अधिकृत व्हाउचर्स, मूळ बिले, पावती व बँक/UPI ट्रान्सफर पावत्यांनुसार तपासले असून सर्व व्हाउचर्स मंडळाच्या कार्यालयात सुरक्षीत जतन केले आहेत.
                      </div>
                    </div>

                    {/* Page 2 Bottom Footer */}
                    {renderPdfPageFooter('शिंदे मळा गणेश उत्सव मंडळ • खर्च अहवाल', 2)}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* PAGE 3: MAHAPRASAD STATEMENT & MANAKARI CONTRIBUTION LEDGER                */}
              {/* ========================================================================= */}
              {(reportScope === 'all' || reportScope === 'mahaprasad') && (
                <div
                  className="pdf-page pdf-page-break-after"
                  style={{
                    width: '670px',
                    minHeight: '960px',
                    maxHeight: '960px',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                    color: '#1a1006',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    pageBreakAfter: (reportScope === 'all' && includeReceipts) ? 'always' : 'auto',
                    breakAfter: (reportScope === 'all' && includeReceipts) ? 'page' : 'auto',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      border: '2px solid #b45309',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      boxSizing: 'border-box',
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#ffffff',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    {/* Top Content */}
                    <div>
                      {/* Mini Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '2px solid #ea580c',
                          paddingBottom: '4px',
                          marginBottom: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img
                            src="/logo.png"
                            onError={(e) => {
                              e.target.src = '/ganesh-icon.svg';
                            }}
                            alt="Logo"
                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontSize: '11.5px', fontWeight: 900, color: '#9a3412', lineHeight: 1.1 }}>
                              {mandalSettings.mandalName}
                            </div>
                            <div style={{ fontSize: '7.8px', color: '#78350f', fontWeight: 600 }}>
                              {(mandalSettings.address || 'शिंदे मळा, हिंगणी दुमाला, ४१२२१०').replace(/,?\s*ता\.\s*दौंड/g, '').replace(/,?\s*जि\.\s*पुणे\s*-?/g, '').replace(/,?\s*दौंड/g, '').trim()} • {mandalSettings.regNo}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '9px', fontWeight: 800, color: '#c2410c' }}>
                            महाप्रसाद मानकरी व खर्च विभागणी
                          </div>
                          <div style={{ fontSize: '7.8px', color: '#78350f' }}>
                            वर्ष: {mandalSettings.year || '२०२६'}
                          </div>
                        </div>
                      </div>

                      {/* Sacred Mantra & Section Title */}
                      <div
                        style={{
                          backgroundColor: '#fffbeb',
                          border: '1px solid #fde68a',
                          borderRadius: '4px',
                          padding: '3.5px 8px',
                          marginBottom: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#b45309' }}>
                          ॥ अन्नदान हेच श्रेष्ठ दान ॥ महाप्रसाद मानकरी हिशोब अहवाल
                        </span>
                        <span style={{ fontSize: '8px', color: '#92400e', fontWeight: 600 }}>
                          तारीख: {mahaprasadData?.date || '२४ सप्टेंबर २०२६'}
                        </span>
                      </div>

                      {/* 4-Column Mahaprasad Analytics Banner */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: '5px',
                          marginBottom: '6px'
                        }}
                      >
                        <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '4px', padding: '3.5px 6px', textAlign: 'center' }}>
                          <div style={{ fontSize: '7.2px', color: '#c2410c', fontWeight: 700 }}>एकूण महाप्रसाद खर्च</div>
                          <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#9a3412' }}>{formatCurrency(mahaprasadTotalExpense)}</div>
                        </div>
                        <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '4px', padding: '3.5px 6px', textAlign: 'center' }}>
                          <div style={{ fontSize: '7.2px', color: '#b45309', fontWeight: 700 }}>सहभागी मानकरी</div>
                          <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#78350f' }}>{manakariCount} मानकरी</div>
                        </div>
                        <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '4px', padding: '3.5px 6px', textAlign: 'center' }}>
                          <div style={{ fontSize: '7.2px', color: '#15803d', fontWeight: 800 }}>⭐ प्रत्येकी खर्च (वाटा)</div>
                          <div style={{ fontSize: '11px', fontWeight: 900, color: '#166534' }}>{formatCurrency(perHeadShare)}</div>
                        </div>
                        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '3.5px 6px', textAlign: 'center' }}>
                          <div style={{ fontSize: '7.2px', color: '#1d4ed8', fontWeight: 700 }}>जमा स्थिती</div>
                          <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#1e40af' }}>{formatCurrency(totalMahaprasadCollected)} (१००%)</div>
                        </div>
                      </div>

                      {/* Manakari Statement Table */}
                      <div style={{ border: '1px solid #fed7aa', borderRadius: '4px', overflow: 'hidden', marginBottom: '5px' }}>
                        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '8px', color: '#1a1006' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#ffedd5', borderBottom: '1.5px solid #fdba74', color: '#9a3412', fontWeight: 800 }}>
                              <th style={{ padding: '2.5px 4px', textAlign: 'center', width: '6%' }}>क्र.</th>
                              <th style={{ padding: '2.5px 6px', textAlign: 'left', width: '33%' }}>मानकऱ्याचे नाव</th>
                              <th style={{ padding: '2.5px 6px', textAlign: 'left', width: '22%' }}>पत्ता / परिसर</th>
                              <th style={{ padding: '2.5px 6px', textAlign: 'right', width: '13%' }}>प्रत्येकी वाटा</th>
                              <th style={{ padding: '2.5px 6px', textAlign: 'right', width: '13%' }}>जमा रक्कम</th>
                              <th style={{ padding: '2.5px 4px', textAlign: 'center', width: '13%' }}>स्थिती</th>
                            </tr>
                          </thead>
                          <tbody>
                            {manakariList.map((m, idx) => {
                              const isPaid = m.status === 'Paid';
                              return (
                                <tr
                                  key={m.id || idx}
                                  style={{
                                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fffdfa',
                                    borderBottom: '1px solid #fed7aa'
                                  }}
                                >
                                  <td style={{ padding: '2px 4px', textAlign: 'center', color: '#78350f', fontWeight: 700 }}>{idx + 1}</td>
                                  <td style={{ padding: '2px 6px', fontWeight: 800, color: '#1a1006' }}>{m.name}</td>
                                  <td style={{ padding: '2px 6px', color: '#451a03', fontWeight: 600 }}>{m.address || 'स्थानिक परिसर'}</td>
                                  <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 800, color: '#9a3412' }}>{formatCurrency(perHeadShare)}</td>
                                  <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 900, color: isPaid ? '#15803d' : '#dc2626' }}>
                                    {formatCurrency(m.paidAmount || 0)}
                                  </td>
                                  <td style={{ padding: '2px 4px', textAlign: 'center', fontWeight: 800, color: isPaid ? '#15803d' : '#dc2626' }}>
                                    {isPaid ? '✅ पूर्ण जमा' : '⏳ बाकी'}
                                  </td>
                                </tr>
                              );
                            })}
                            <tr style={{ backgroundColor: '#fff7ed', fontWeight: 900, borderTop: '1.5px solid #ea580c' }}>
                              <td colSpan={3} style={{ padding: '3.5px 6px', textAlign: 'right', color: '#9a3412', fontSize: '8.5px' }}>
                                एकूण महाप्रसाद मानकरी जमा बेरीज:
                              </td>
                              <td style={{ padding: '3.5px 6px', textAlign: 'right', color: '#9a3412', fontSize: '8.8px' }}>
                                {formatCurrency(mahaprasadTotalExpense)}
                              </td>
                              <td style={{ padding: '3.5px 6px', textAlign: 'right', color: '#15803d', fontSize: '8.8px' }}>
                                {formatCurrency(totalMahaprasadCollected)}
                              </td>
                              <td style={{ padding: '3.5px 4px', textAlign: 'center', color: '#15803d', fontSize: '8px' }}>
                                {totalMahaprasadPending === 0 ? '१००% पूर्ण' : 'शिल्लक'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Devotional Note */}
                      <div
                        style={{
                          backgroundColor: '#fef3c7',
                          border: '1px solid #fde68a',
                          borderRadius: '4px',
                          padding: '3.5px 8px',
                          fontSize: '7.5px',
                          color: '#92400e',
                          fontWeight: 600,
                          lineHeight: 1.3
                        }}
                      >
                        📌 <strong>महाप्रसाद मानकरी नोंदणी नियम:</strong> महाप्रसादाचा एकूण खर्च सर्व सहभागी मानकऱ्यांमध्ये समसमान विभागला असून प्रत्येकी आलेला खर्च मंडळाच्या बँक/रोख खात्यात जमा झाला आहे. सर्व अन्नदात्यांचे मनःपूर्वक आभार!
                      </div>
                    </div>

                    {/* If this is the LAST page, render Signatures Block */}
                    {(reportScope === 'mahaprasad' || !includeReceipts) && renderSignaturesBlock()}

                    {/* Page Bottom Footer with RS Logo & Link */}
                    {renderPdfPageFooter(
                      'शिंदे मळा गणेश उत्सव मंडळ • महाप्रसाद अहवाल',
                      reportScope === 'mahaprasad' ? 1 : 3
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* PAGE 4+ : DETAILED PAVTI LEDGER & FINAL SIGNATURES BLOCK                  */}
              {/* The Signatures Section is ALWAYS placed on the LAST page!                */}
              {/* ========================================================================= */}
              {reportScope !== 'summary' && reportScope !== 'mahaprasad' && includeReceipts && (
                pavtiChunks.map((chunk, chunkIdx) => {
                  const currentPageNum = 4 + chunkIdx;
                  const isLastChunk = chunkIdx === pavtiChunks.length - 1;
                  const startIndex = chunkIdx * 20;

                  return (
                    <div
                      key={`pavti-page-${chunkIdx}`}
                      className={`pdf-page ${isLastChunk ? '' : 'pdf-page-break-after'}`}
                      style={{
                        width: '670px',
                        minHeight: '960px',
                        maxHeight: '960px',
                        boxSizing: 'border-box',
                        backgroundColor: '#ffffff',
                        color: '#1a1006',
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        pageBreakAfter: isLastChunk ? 'auto' : 'always',
                        breakAfter: isLastChunk ? 'auto' : 'page',
                        position: 'relative',
                        overflow: 'hidden'
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
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        {/* Top Content: Mini Header + Pavti Table */}
                        <div>
                          {/* Page 3 Mini Header */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderBottom: '2px solid #ea580c',
                              paddingBottom: '6px',
                              marginBottom: '8px'
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
                                  भाग ३: संपूर्ण देणगी पावत्या यादी (Receipts Ledger) {isLastChunk && '& अधिकृत प्रमाणिकरण'}
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
                              marginBottom: '6px'
                            }}
                          >
                            <div
                              style={{
                                backgroundColor: '#ea580c',
                                color: '#ffffff',
                                padding: '4px 8px',
                                fontSize: '10px',
                                fontWeight: 800,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <span>📜 देणगी पावत्या तपशील (नोंद क्र. {startIndex + 1} ते {startIndex + chunk.length})</span>
                              <span style={{ fontSize: '8.5px' }}>उत्सव २०२६</span>
                            </div>

                            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '8.5px', color: '#1a1006', boxSizing: 'border-box' }}>
                              <thead>
                                <tr style={{ backgroundColor: '#fff7ed', borderBottom: '1px solid #fed7aa', color: '#7c2d12', fontWeight: 800 }}>
                                  <th style={{ padding: '3px 4px', textAlign: 'center', width: '6%', color: '#7c2d12' }}>क्र.</th>
                                  <th style={{ padding: '3px 5px', textAlign: 'left', width: '18%', color: '#7c2d12' }}>पावती क्र.</th>
                                  <th style={{ padding: '3px 5px', textAlign: 'left', width: '13%', color: '#7c2d12' }}>दिनांक</th>
                                  <th style={{ padding: '3px 5px', textAlign: 'left', width: '29%', color: '#7c2d12' }}>देणगीदाराचे नाव</th>
                                  <th style={{ padding: '3px 5px', textAlign: 'left', width: '14%', color: '#7c2d12' }}>प्रकार</th>
                                  <th style={{ padding: '3px 4px', textAlign: 'center', width: '8%', color: '#7c2d12' }}>मोड</th>
                                  <th style={{ padding: '3px 8px', textAlign: 'right', width: '12%', color: '#7c2d12' }}>रक्कम (₹)</th>
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
                                    <td style={{ padding: '2.5px 4px', textAlign: 'center', color: '#78350f', fontWeight: 700 }}>{startIndex + idx + 1}</td>
                                    <td style={{ padding: '2.5px 5px', fontWeight: 700, color: '#9a3412', whiteSpace: 'nowrap' }}>{p.pavtiNo}</td>
                                    <td style={{ padding: '2.5px 5px', whiteSpace: 'nowrap', color: '#451a03' }}>{p.date}</td>
                                    <td style={{ padding: '2.5px 5px', fontWeight: 700, color: '#1a1006', wordBreak: 'break-word' }}>{p.donorName}</td>
                                    <td style={{ padding: '2.5px 5px', whiteSpace: 'nowrap', color: '#451a03' }}>{t(`type${p.donationType}`) || p.donationType}</td>
                                    <td style={{ padding: '2.5px 4px', textAlign: 'center', whiteSpace: 'nowrap', color: '#451a03' }}>{p.paymentMode}</td>
                                    <td style={{ padding: '2.5px 8px', textAlign: 'right', fontWeight: 800, color: '#15803d', whiteSpace: 'nowrap' }}>
                                      {formatCurrency(p.amount)}
                                    </td>
                                  </tr>
                                ))}
                                {isLastChunk && (
                                  <tr style={{ backgroundColor: '#f0fdf4', fontWeight: 900, borderTop: '1.5px solid #16a34a' }}>
                                    <td colSpan={6} style={{ padding: '4px 6px', textAlign: 'right', color: '#166534', fontSize: '9.5px' }}>
                                      एकूण जमा पावती रक्कम बेरीज (Total Collection):
                                    </td>
                                    <td style={{ padding: '4px 8px', textAlign: 'right', color: '#15803d', fontSize: '10px', whiteSpace: 'nowrap' }}>
                                      {formatCurrency(totalCollection)}
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* ========================================================================= */}
                        {/* SIGNATURES SECTION: ALWAYS ON THE VERY LAST PAGE OF THE REPORT!            */}
                        {/* ========================================================================= */}
                        {isLastChunk && renderSignaturesBlock()}

                        {/* Page Bottom Footer */}
                        {renderPdfPageFooter('शिंदे मळा गणेश उत्सव मंडळ • पावती वही', currentPageNum)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
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

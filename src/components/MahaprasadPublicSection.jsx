import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  UtensilsCrossed,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Search,
  X,
  MapPin,
  IndianRupee,
  Share2,
  Award,
  Heart,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { formatCurrency } from '../i18n/numberToWords';

export const MahaprasadPublicSection = () => {
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
    pendingManakariCount
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'Paid' | 'Pending'

  // Filtered List
  const filteredManakari = useMemo(() => {
    return manakariList.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.address && m.address.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchFilter =
        activeFilter === 'all' ||
        (activeFilter === 'Paid' && m.status === 'Paid') ||
        (activeFilter === 'Pending' && m.status !== 'Paid');

      return matchSearch && matchFilter;
    });
  }, [manakariList, searchTerm, activeFilter]);

  return (
    <section
      id="mahaprasad-section"
      style={{
        scrollMarginTop: '6rem',
        marginBottom: '3.5rem',
        position: 'relative'
      }}
    >
      {/* Decorative Warm Devotional Background Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(600px, 90vw)',
          height: '240px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, rgba(217, 119, 6, 0.04) 50%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Distinct Devotional Hero Container */}
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          zIndex: 1,
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(1rem, 3.5vw, 2rem)',
          border: '1.5px solid rgba(245, 158, 11, 0.35)',
          background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.09) 0%, rgba(180, 83, 9, 0.05) 50%, rgba(0, 0, 0, 0.35) 100%)',
          boxShadow: '0 8px 32px rgba(217, 119, 6, 0.12)'
        }}
      >
        {/* Section Sacred Badge & Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.3rem 0.85rem',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.3))',
              border: '1px solid rgba(251, 191, 36, 0.5)',
              color: '#f59e0b',
              fontSize: 'clamp(0.72rem, 2.2vw, 0.82rem)',
              fontWeight: 800,
              letterSpacing: '0.4px',
              marginBottom: '0.65rem',
              boxShadow: '0 2px 10px rgba(245, 158, 11, 0.2)'
            }}
          >
            <UtensilsCrossed size={14} />
            <span>॥ अन्नदान हेच श्रेष्ठ दान • महाप्रसाद मानकरी सन्मान ॥</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.35rem, 4vw, 1.95rem)',
              fontWeight: 900,
              color: 'var(--text-main)',
              margin: '0 0 0.4rem',
              lineHeight: 1.25,
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
            }}
          >
            श्री गणेश महाप्रसाद मानकरी व खर्च विभागणी
          </h2>

          <p
            style={{
              fontSize: 'clamp(0.82rem, 2.4vw, 0.94rem)',
              color: 'var(--text-subtle)',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.5
            }}
          >
            महाप्रसादाच्या एकूण खर्चाची सर्व सहभागी मानकऱ्यांमध्ये समसमान विभागणी करण्यात आली असून प्रत्येक मानकऱ्याचा वाटा व जमा स्थिती खालीलप्रमाणे पारदर्शकपणे दर्शविली आहे.
          </p>
        </div>

        {/* 4 Highlight Stat Cards (Pure Mobile-Friendly Responsive Grid) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 45vw, 220px), 1fr))',
            gap: 'clamp(0.6rem, 2vw, 1rem)',
            marginBottom: '1.75rem'
          }}
        >
          {/* Card 1: Total Expense */}
          <div
            style={{
              padding: 'clamp(0.85rem, 2.5vw, 1.2rem)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(234, 88, 12, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ea580c', fontSize: '0.78rem', fontWeight: 700 }}>
              <span>एकूण महाप्रसाद खर्च</span>
              <UtensilsCrossed size={16} />
            </div>
            <div style={{ fontSize: 'clamp(1.25rem, 3.8vw, 1.65rem)', fontWeight: 900, color: 'var(--text-main)', margin: '6px 0 2px' }}>
              {formatCurrency(mahaprasadTotalExpense)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
              अन्नदान संपूर्ण खर्च
            </div>
          </div>

          {/* Card 2: Participants */}
          <div
            style={{
              padding: 'clamp(0.85rem, 2.5vw, 1.2rem)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f59e0b', fontSize: '0.78rem', fontWeight: 700 }}>
              <span>सहभागी मानकरी</span>
              <Users size={16} />
            </div>
            <div style={{ fontSize: 'clamp(1.25rem, 3.8vw, 1.65rem)', fontWeight: 900, color: 'var(--text-main)', margin: '6px 0 2px' }}>
              {manakariCount} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>मानकरी</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
              समसमान सहभाग
            </div>
          </div>

          {/* Card 3: Per-Head Share (KEY USER REQUIREMENT - HIGHLIGHTED) */}
          <div
            style={{
              padding: 'clamp(0.85rem, 2.5vw, 1.2rem)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '2px solid #10b981',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              boxShadow: '0 4px 18px rgba(16, 185, 129, 0.22)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#10b981', fontSize: '0.8rem', fontWeight: 800 }}>
              <span>⭐ प्रत्येकी आलेला खर्च</span>
              <Sparkles size={16} />
            </div>
            <div style={{ fontSize: 'clamp(1.35rem, 4.2vw, 1.8rem)', fontWeight: 900, color: '#10b981', margin: '6px 0 2px' }}>
              {formatCurrency(perHeadShare)}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-main)', fontWeight: 700 }}>
              प्रत्येकाचा वाटा ({manakariCount > 0 ? `₹${mahaprasadTotalExpense.toLocaleString('en-IN')} ÷ ${manakariCount}` : '—'})
            </div>
          </div>

          {/* Card 4: Collection Status */}
          <div
            style={{
              padding: 'clamp(0.85rem, 2.5vw, 1.2rem)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#3b82f6', fontSize: '0.78rem', fontWeight: 700 }}>
              <span>जमा स्थिती</span>
              <ShieldCheck size={16} />
            </div>
            <div style={{ fontSize: 'clamp(1.25rem, 3.8vw, 1.65rem)', fontWeight: 900, color: '#3b82f6', margin: '6px 0 2px' }}>
              {formatCurrency(totalMahaprasadCollected)}
            </div>
            <div style={{ fontSize: '0.72rem', color: totalMahaprasadPending === 0 ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
              {totalMahaprasadPending === 0 ? '✅ १००% पूर्ण संकलित' : `शिल्लक: ${formatCurrency(totalMahaprasadPending)}`}
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0.75rem 0.85rem',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '180px' }}>
            <Search
              size={15}
              color="var(--text-subtle)"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="मानकऱ्याचे नाव किंवा परिसर शोधा..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                paddingLeft: '2.3rem',
                paddingRight: '2rem',
                fontSize: '0.84rem',
                height: '38px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '0.65rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveFilter('all')}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
            >
              सर्व ({manakariList.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeFilter === 'Paid' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveFilter('Paid')}
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.78rem',
                borderColor: activeFilter === 'Paid' ? 'transparent' : 'rgba(16, 185, 129, 0.4)',
                color: activeFilter === 'Paid' ? '#ffffff' : '#10b981'
              }}
            >
              ✅ जमा ({paidManakariCount})
            </button>
            {pendingManakariCount > 0 && (
              <button
                type="button"
                className={`btn btn-sm ${activeFilter === 'Pending' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveFilter('Pending')}
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.78rem',
                  borderColor: activeFilter === 'Pending' ? 'transparent' : 'rgba(239, 68, 68, 0.4)',
                  color: activeFilter === 'Pending' ? '#ffffff' : '#ef4444'
                }}
              >
                ⏳ बाकी ({pendingManakariCount})
              </button>
            )}
          </div>
        </div>

        {/* Manakari List Display */}
        {filteredManakari.length === 0 ? (
          <div
            style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              color: 'var(--text-subtle)'
            }}
          >
            <UtensilsCrossed size={36} color="#f59e0b" style={{ opacity: 0.5, margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
              {manakariList.length === 0 ? 'अद्याप कोणत्याही मानकऱ्यांची नोंद झालेली नाही' : 'कोणतेही मानकरी सापडले नाहीत'}
            </div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
              {manakariList.length === 0
                ? 'व्यवस्थापकांनी (Admin) मानकरी व महाप्रसाद हिशोब जोडल्यावर ही यादी येथे पारदर्शकपणे दिसेल.'
                : 'कृपया शोध शब्द तपासा किंवा फिल्टर बदला.'}
            </div>
          </div>
        ) : (
          <div>
            {/* Pure Mobile Friendly Responsive Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(260px, 48vw, 360px), 1fr))',
                gap: 'clamp(0.6rem, 1.8vw, 0.9rem)'
              }}
            >
              {filteredManakari.map((m, idx) => {
                const isPaid = m.status === 'Paid';

                return (
                  <div
                    key={m.id || idx}
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      padding: 'clamp(0.85rem, 2vw, 1rem)',
                      border: isPaid ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
                      backgroundColor: 'rgba(0, 0, 0, 0.35)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      transition: 'transform 0.15s, border-color 0.15s'
                    }}
                  >
                    {/* Devotee Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: isPaid
                            ? 'linear-gradient(135deg, #059669, #10b981)'
                            : 'linear-gradient(135deg, #dc2626, #ef4444)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          flexShrink: 0,
                          boxShadow: isPaid ? '0 2px 8px rgba(16, 185, 129, 0.35)' : '0 2px 8px rgba(239, 68, 68, 0.35)'
                        }}
                      >
                        {idx + 1}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: 'clamp(0.88rem, 2.5vw, 0.96rem)',
                            color: 'var(--text-main)',
                            lineHeight: 1.25,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {m.name}
                        </div>
                        <div
                          style={{
                            fontSize: '0.74rem',
                            color: 'var(--text-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            marginTop: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          <MapPin size={11} color="#f59e0b" />
                          <span>{m.address || 'शिंदे मळा'}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          backgroundColor: isPaid ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)',
                          color: isPaid ? '#10b981' : '#ef4444',
                          border: isPaid ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          flexShrink: 0
                        }}
                      >
                        {isPaid ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        <span>{isPaid ? 'पूर्ण' : 'बाकी'}</span>
                      </span>
                    </div>

                    {/* Financial Share Breakdown */}
                    <div
                      style={{
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>प्रत्येकी वाटा</div>
                        <div style={{ fontWeight: 800, color: 'var(--accent-gold-light)', fontSize: '0.9rem' }}>
                          {formatCurrency(perHeadShare)}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>जमा रक्कम</div>
                        <div style={{ fontWeight: 900, color: isPaid ? '#10b981' : '#ef4444', fontSize: '0.94rem' }}>
                          {formatCurrency(m.paidAmount || 0)}
                        </div>
                      </div>
                    </div>

                    {/* Footer Details: Mode & Date */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        color: 'var(--text-subtle)',
                        paddingTop: '0.2rem'
                      }}
                    >
                      <span>मोड: <strong style={{ color: 'var(--text-main)' }}>{m.paymentMode || 'Cash'}</strong></span>
                      <span>{m.paidDate ? `तारीख: ${m.paidDate}` : 'दिनांक: —'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Gratitude & Transparency Footer Note */}
            <div
              style={{
                marginTop: '1.5rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))',
                border: '1px dashed rgba(245, 158, 11, 0.4)',
                textAlign: 'center',
                fontSize: '0.84rem',
                color: 'var(--text-subtle)',
                lineHeight: 1.5
              }}
            >
              🌸 <strong>सर्व महाप्रसाद अन्नदात्यांचे मनःपूर्वक आभार!</strong> आपल्या सर्वांच्या सहकार्याने बाप्पाच्या चरणी हजारो भाविकांना महाप्रसादाचा लाभ मिळाला. गणपती बाप्पा आपल्या सर्वांच्या संसारावर सदैव कृपा ठेवोत! 🌸
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

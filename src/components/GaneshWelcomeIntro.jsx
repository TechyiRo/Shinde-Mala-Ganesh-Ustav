import React, { useState, useEffect } from 'react';
import { useMusic } from '../context/MusicContext';
import { Sparkles, ArrowRight } from 'lucide-react';

export const GaneshWelcomeIntro = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const { isPlaying, playMusic } = useMusic();

  useEffect(() => {
    // Attempt gentle background music play when welcome intro starts
    if (!isPlaying && playMusic) {
      playMusic().catch(() => {});
    }

    // Schedule 5-second completion with smooth fade-out
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 4350);

    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 350);
  };

  return (
    <div
      className={`ganesh-welcome-overlay ${isFadingOut ? 'fade-out' : ''}`}
      onClick={handleSkip}
    >
      {/* Background Animated Saffron-Gold Ambient Halo Rays */}
      <div className="welcome-rays-glow" />
      <div className="welcome-orb orb-top" />
      <div className="welcome-orb orb-bottom" />

      {/* Floating Golden Dust Particles Canvas / Orbs */}
      <div className="welcome-particles-wrap" aria-hidden="true">
        {[...Array(16)].map((_, i) => (
          <span
            key={i}
            className={`welcome-particle p-${i + 1}`}
            style={{
              left: `${(i * 6.2 + 5) % 95}%`,
              animationDelay: `${(i * 0.22).toFixed(2)}s`,
              animationDuration: `${(2.8 + (i % 4) * 0.5).toFixed(2)}s`
            }}
          />
        ))}
      </div>

      {/* Top Right Quick Skip Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleSkip();
        }}
        className="welcome-skip-btn no-print"
        title="थेट लॉगिन पृष्ठावर जा"
      >
        <span>पुढे जा (Skip)</span>
        <ArrowRight size={13} />
      </button>

      {/* Main Center Sacred Presentation */}
      <div className="welcome-center-card">
        {/* Lord Ganesha Illuminated Divine Mūrti Frame */}
        <div className="welcome-murti-container">
          <div className="welcome-murti-halo" />
          <img
            src="/logo.png"
            onError={(e) => {
              e.target.src = '/ganesh-icon.svg';
            }}
            alt="भगवान श्री गणेश - शिंदे मळा"
            className="welcome-murti-img"
          />
        </div>

        {/* Sacred Shlok */}
        <div className="welcome-shlok">
          <span>॥ श्री गणेशाय नमः ॥</span>
        </div>

        {/* Welcome Greeting */}
        <div className="welcome-mandal-text">
          <h1 className="welcome-mandal-title">
            शिंदे मळा गणेश उत्सव मंडळात
          </h1>
          <p className="welcome-greeting-sub">
            आपले हार्दिक स्वागत आहे 🙏
          </p>
        </div>

        {/* Ganpati Bappa Morya Tagline with Heartbeat Pulse */}
        <div className="welcome-cheer-tag">
          <Sparkles size={15} color="#fbbf24" className="sparkle-left" />
          <span>गणपती बाप्पा मोरया! ❤️</span>
          <Sparkles size={15} color="#fbbf24" className="sparkle-right" />
        </div>
      </div>
    </div>
  );
};

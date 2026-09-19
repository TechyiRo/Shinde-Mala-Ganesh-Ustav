import React, { useState, useEffect } from 'react';
import { Sparkles, Phone, MessageCircle, Heart, Code2 } from 'lucide-react';

export const DeveloperBadge = ({ compact = false }) => {
  const [activeLangIndex, setActiveLangIndex] = useState(0);

  // Toggle animation every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLangIndex((prev) => (prev === 0 ? 1 : 0));
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  if (compact) {
    return (
      <div className="dev-badge-compact-container">
        <div className="dev-badge-animated-border">
          <div className="dev-badge-compact-content">
            <span className="dev-pulse-icon">✨</span>
            <div className="dev-compact-text-switcher">
              <span className={`dev-flip-text ${activeLangIndex === 0 ? 'visible' : 'hidden'}`}>
                Dev by <strong className="dev-highlight-name">Rohidas Shinde</strong>
              </span>
              <span className={`dev-flip-text ${activeLangIndex === 1 ? 'visible' : 'hidden'}`}>
                निर्मिती: <strong className="dev-highlight-name">रोहिदास शिंदे</strong>
              </span>
            </div>
            <a
              href="tel:9922466579"
              className="dev-phone-pill"
              title="Call Rohidas Shinde"
              aria-label="Call 9922466579"
            >
              <Phone size={11} />
              <span>9922466579</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dev-badge-container">
      <div className="dev-badge-animated-border">
        <div className="dev-badge-inner-card">
          {/* Animated Header with Glowing Pulse */}
          <div className="dev-badge-header">
            <span className="dev-pulse-badge">
              <Code2 size={14} className="dev-spin-icon" />
              <span>Developer Credit</span>
            </span>
            <div className="dev-badge-heart">
              <span>Made with</span>
              <Heart size={14} color="#ef4444" fill="#ef4444" className="dev-heart-beat" />
            </div>
          </div>

          {/* Dual Language Animated Developer Names */}
          <div className="dev-names-row">
            {/* English Version */}
            <div className="dev-name-card dev-en">
              <div className="dev-role-label">Developed by</div>
              <div className="dev-developer-name shimmer-text">Rohidas Shinde</div>
            </div>

            <div className="dev-name-divider">
              <Sparkles size={16} color="#fbbf24" className="dev-sparkle-anim" />
            </div>

            {/* Marathi Version */}
            <div className="dev-name-card dev-mr">
              <div className="dev-role-label">संकल्पना व निर्मिती</div>
              <div className="dev-developer-name shimmer-text">रोहिदास शिंदे</div>
            </div>
          </div>

          {/* Quick Contact & Action Buttons */}
          <div className="dev-contact-actions">
            <a
              href="tel:9922466579"
              className="dev-contact-btn dev-call-btn"
              title="Direct Call to Rohidas Shinde"
            >
              <Phone size={14} />
              <span>संपर्क: 9922466579</span>
            </a>

            <a
              href="https://wa.me/919922466579?text=Hello%20Rohidas,%20regarding%20Shinde%20Mala%20Ganesh%20Utsav%20App"
              target="_blank"
              rel="noopener noreferrer"
              className="dev-contact-btn dev-wa-btn"
              title="Chat on WhatsApp"
            >
              <MessageCircle size={14} />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

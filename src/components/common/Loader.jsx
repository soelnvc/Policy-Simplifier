import React from 'react';
import './Loader.css';

/**
 * Loader — Skeleton shimmer + pulsing orb variants.
 * 
 * @param {'skeleton'|'orb'|'spinner'} variant
 * @param {string} text - Optional loading message (for orb variant)
 * @param {number} lines - Number of skeleton lines (for skeleton variant)
 */
function Loader({ variant = 'orb', text = '', lines = 3, className = '' }) {
  if (variant === 'skeleton') {
    return (
      <div className={`loader-skeleton ${className}`}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className="loader-skeleton__line"
            style={{
              width: i === lines - 1 ? '60%' : i % 2 === 0 ? '100%' : '85%',
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'spinner') {
    return (
      <div className={`loader-spinner ${className}`}>
        <svg viewBox="0 0 50 50" className="loader-spinner__svg">
          <circle cx="25" cy="25" r="20" fill="none" strokeWidth="3" />
        </svg>
      </div>
    );
  }

  // Default: Pulsing orb
  return (
    <div className={`loader-orb ${className}`}>
      <div className="loader-orb__container">
        <div className="loader-orb__ring loader-orb__ring--outer" />
        <div className="loader-orb__ring loader-orb__ring--middle" />
        <div className="loader-orb__core" />
      </div>
      {text && <p className="loader-orb__text">{text}</p>}
    </div>
  );
}

export default Loader;

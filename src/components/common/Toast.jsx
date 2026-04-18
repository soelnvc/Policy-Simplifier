import React, { useEffect } from 'react';
import './Toast.css';

/**
 * Toast — Minimalist notification popup.
 *
 * @param {Object} toast - { id, message, type: 'default' | 'success' | 'error' | 'warning' }
 * @param {Function} onClose - Callback to close manually
 */
function Toast({ toast, onClose }) {
  const { message, type = 'default' } = toast;

  let icon = '🔔';
  if (type === 'success') icon = '✓';
  if (type === 'error') icon = '✕';
  if (type === 'warning') icon = '⚠️';

  return (
    <div className={`toast toast--${type}`}>
      <span className="toast__icon">{icon}</span>
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Close">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}

export default Toast;

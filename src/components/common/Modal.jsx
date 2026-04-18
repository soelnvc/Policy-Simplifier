import React, { useEffect, useCallback } from 'react';
import './Modal.css';

/**
 * Modal — Animated overlay with backdrop blur.
 * 
 * @param {boolean} isOpen - Controls visibility
 * @param {function} onClose - Called on backdrop click or Escape
 * @param {string} title - Optional modal title
 * @param {'sm'|'md'|'lg'} size - Modal width preset
 */
function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  className = '',
}) {
  // Close on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`modal modal--${size} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div className="modal__header">
            {title && <h3 className="modal__title">{title}</h3>}
            {showClose && (
              <button
                className="modal__close"
                onClick={onClose}
                aria-label="Close modal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="modal__body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;

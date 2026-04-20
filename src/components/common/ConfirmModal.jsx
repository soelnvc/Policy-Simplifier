import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './ConfirmModal.css';

/**
 * ConfirmModal — A premium, glassmorphic confirmation dialog used to replace `window.confirm`.
 * Safe against bubbling click events that cause native dialogs to dismiss in Chrome.
 * 
 * @param {boolean} isOpen - Controls visibility
 * @param {string} title - The header text
 * @param {string} message - The body description
 * @param {string} confirmText - Text for the destructive button
 * @param {Function} onConfirm - Called when the user confirms
 * @param {Function} onCancel - Called when the user cancels or clicks outside
 */
function ConfirmModal({ isOpen, title, message, confirmText = 'Delete', onConfirm, onCancel }) {
  
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="confirm-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onCancel} // Clicking the background cancels
        >
          <motion.div 
            className="confirm-modal"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            <div className="confirm-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            
            <div>
              <h3 className="confirm-title">{title}</h3>
              <p className="confirm-message">{message}</p>
            </div>

            <div className="confirm-actions">
              <button className="btn-cancel" onClick={onCancel}>
                Cancel
              </button>
              <button className="btn-danger" onClick={onConfirm}>
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default ConfirmModal;

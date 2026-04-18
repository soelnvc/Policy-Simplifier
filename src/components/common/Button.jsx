import React from 'react';
import './Button.css';

/**
 * Button — Reusable button with Onyx & Snow aesthetic.
 * 
 * @param {'primary'|'secondary'|'ghost'|'danger'} variant - Visual style
 * @param {'sm'|'md'|'lg'} size - Button size
 * @param {boolean} loading - Shows spinner, disables interaction
 * @param {boolean} fullWidth - Stretches to container width
 * @param {React.ReactNode} icon - Optional leading icon
 * @param {React.ReactNode} children - Button label
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const classNames = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full',
    loading && 'btn--loading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className="btn__spinner" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="btn__spinner-svg">
            <circle cx="12" cy="12" r="10" fill="none" strokeWidth="2.5" />
          </svg>
        </span>
      )}
      {icon && !loading && <span className="btn__icon">{icon}</span>}
      <span className="btn__label">{children}</span>
    </button>
  );
}

export default Button;

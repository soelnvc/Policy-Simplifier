import React from 'react';
import './Card.css';

/**
 * Card — Glassmorphic container with the Onyx & Snow layering system.
 * 
 * @param {'glass'|'lifted'|'onyx'|'surface'} variant - Card surface style
 * @param {boolean} hoverable - Adds lift animation on hover
 * @param {boolean} padding - Adds default interior padding
 * @param {string} className - Additional CSS classes
 */
function Card({
  children,
  variant = 'glass',
  hoverable = false,
  padding = true,
  className = '',
  onClick,
  ...props
}) {
  const classNames = [
    'card',
    `card--${variant}`,
    hoverable && 'card--hoverable',
    padding && 'card--padded',
    onClick && 'card--clickable',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} onClick={onClick} {...props}>
      {children}
    </div>
  );
}

export default Card;

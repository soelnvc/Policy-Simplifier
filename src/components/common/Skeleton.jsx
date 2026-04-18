import React from 'react';
import './Skeleton.css';

/**
 * Skeleton Loader Component
 * Renders a shimmering placeholder block.
 * 
 * @param {string} variant - 'text', 'circular', 'rectangular', or 'rounded'
 * @param {string|number} width - custom width (e.g. '100%', '200px')
 * @param {string|number} height - custom height 
 * @param {string} className - extra classes
 */
function Skeleton({ 
  variant = 'text', 
  width, 
  height, 
  className = '',
  style = {}
}) {
  const combinedStyle = {
    width,
    height,
    ...style
  };

  return (
    <span 
      className={`skeleton skeleton--${variant} ${className}`} 
      style={combinedStyle}
      aria-hidden="true"
    />
  );
}

export default Skeleton;

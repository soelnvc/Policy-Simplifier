import { motion } from 'framer-motion';
import './Card.css';

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

  // Default lift interaction if hoverable is true and no whileHover is provided
  const defaultHover = hoverable ? { 
    y: -6,
    scale: 1.01,
    boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.12)"
  } : undefined;

  return (
    <motion.div 
      className={classNames} 
      onClick={onClick} 
      whileHover={props.whileHover || defaultHover}
      transition={props.transition || { type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default Card;

import React, { useState, useId } from 'react';
import './Input.css';

/**
 * Input — Minimalist text input & textarea with floating labels.
 * Follows the Stitch "No-Line Rule": soft-tinted box, white on focus.
 * 
 * @param {'text'|'email'|'password'|'textarea'} type
 * @param {string} label - Floating label text
 * @param {string} error - Error message string
 * @param {number} rows - Textarea rows (only when type="textarea")
 */
function Input({
  type = 'text',
  label,
  value,
  onChange,
  error = '',
  placeholder = ' ',
  rows = 5,
  disabled = false,
  className = '',
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const id = useId();
  const hasValue = value && value.length > 0;
  const isTextarea = type === 'textarea';

  const wrapperClass = [
    'input-field',
    focused && 'input-field--focused',
    hasValue && 'input-field--has-value',
    error && 'input-field--error',
    disabled && 'input-field--disabled',
    className,
  ].filter(Boolean).join(' ');

  const sharedProps = {
    id,
    value,
    onChange,
    placeholder,
    disabled,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    className: 'input-field__control',
    'aria-invalid': !!error,
    'aria-describedby': error ? `${id}-error` : undefined,
    ...props,
  };

  return (
    <div className={wrapperClass}>
      {isTextarea ? (
        <textarea {...sharedProps} rows={rows} />
      ) : (
        <input {...sharedProps} type={type} />
      )}
      {label && (
        <label htmlFor={id} className="input-field__label">
          {label}
        </label>
      )}
      <div className="input-field__highlight" />
      {error && (
        <span id={`${id}-error`} className="input-field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default Input;

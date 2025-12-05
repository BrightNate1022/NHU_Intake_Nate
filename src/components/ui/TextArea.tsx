'use client';

import { TextareaHTMLAttributes, forwardRef, useState } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  locked?: boolean;
  lockedBy?: string;
  highlight?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, locked, lockedBy: _lockedBy, highlight, className = '', id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className={`input-wrapper ${className}`}>
        {label && (
          <label htmlFor={textareaId} className="input-label">
            {label}
            {locked && (
              <span 
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: 'var(--warning)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Editing...
              </span>
            )}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            className={`input-field ${locked ? 'locked' : ''} ${highlight ? 'field-updated' : ''}`}
            style={{ minHeight: '140px', resize: 'vertical' }}
            disabled={locked || props.disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          {isFocused && !locked && !props.disabled && (
            <div 
              className="absolute right-4 top-4 w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--success)' }}
            />
          )}
        </div>
        {error && (
          <p className="input-error">{error}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

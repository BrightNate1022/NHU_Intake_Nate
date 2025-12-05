'use client';

import { useState, KeyboardEvent, forwardRef } from 'react';

interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  error?: string;
  locked?: boolean;
  placeholder?: string;
}

export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  ({ label, value = [], onChange, error, locked, placeholder = 'Type and press Enter to add...' }, ref) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault();
        if (!value.includes(inputValue.trim())) {
          onChange([...value, inputValue.trim()]);
        }
        setInputValue('');
      } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
        onChange(value.slice(0, -1));
      }
    };

    const removeTag = (tagToRemove: string) => {
      onChange(value.filter(tag => tag !== tagToRemove));
    };

    return (
      <div className="input-wrapper">
        {label && (
          <label className="input-label">{label}</label>
        )}
        <div 
          className={`input-field ${locked ? 'locked' : ''}`}
          style={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center',
            minHeight: '52px',
            padding: '10px 14px'
          }}
        >
          {value.map((tag) => (
            <span 
              key={tag}
              className="tag"
            >
              {tag}
              {!locked && (
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="tag-remove"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </span>
          ))}
          {!locked && (
            <input
              ref={ref}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={value.length === 0 ? placeholder : ''}
              style={{ 
                flex: 1,
                minWidth: '120px',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.9375rem',
                color: 'var(--stone-800)',
                fontFamily: "'Outfit', sans-serif"
              }}
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

TagInput.displayName = 'TagInput';

'use client';

import { useState } from 'react';
import type { KeyboardEvent } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder = 'Lägg till tagg…' }: TagInputProps) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && input === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-[oklch(18%_0.012_265)] border border-[oklch(28%_0.015_265)] focus-within:border-[oklch(55%_0.12_265)] transition-colors min-h-[42px] cursor-text">
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[oklch(55%_0.12_265)/15] text-[oklch(75%_0.08_265)] text-xs font-medium"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="text-[oklch(50%_0.08_265)] hover:text-[oklch(80%_0.08_265)] transition-colors leading-none"
            aria-label={`Ta bort ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[140px] bg-transparent text-sm text-[oklch(88%_0.01_265)] placeholder:text-[oklch(40%_0.02_265)] outline-none"
      />
    </div>
  );
}

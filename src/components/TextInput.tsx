import { useRef, useState, useLayoutEffect } from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextInput({ value, onChange, placeholder = 'Escribe aquí...' }: TextInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Derive hasText from props instead of state
  const hasText = value.length > 0;

  // Auto-focus al montar - using useLayoutEffect to focus after render
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (input) {
      requestAnimationFrame(() => input.focus());
    }
  }, []);

  return (
    <div className="input-container">
      {/* Glow effect behind input */}
      <div className={`input-glow ${isFocused ? 'focused' : ''}`} />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`text-input ${hasText ? 'has-text' : ''}`}
      />

      {/* Floating particles effect when focused */}
      {isFocused && (
        <>
          <span className="input-particle" />
          <span className="input-particle" />
        </>
      )}
    </div>
  );
}
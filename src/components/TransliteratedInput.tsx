import React, { useState, useEffect, useRef } from 'react';
import { detectScript, getTransliterations, ScriptDetectionResult } from '../utils/transliteration';
import { Languages, Sparkles } from 'lucide-react';

interface TransliteratedInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  isTextArea?: boolean;
  rows?: number;
  autoTransliterate?: boolean;
  showSuggestions?: boolean;
}

export const TransliteratedInput: React.FC<TransliteratedInputProps> = ({
  id,
  name,
  value,
  onChange,
  onKeyDown,
  placeholder,
  className = '',
  label,
  required = false,
  isTextArea = false,
  rows = 3,
  autoTransliterate = true,
  showSuggestions = true
}) => {
  const [scriptInfo, setScriptInfo] = useState<ScriptDetectionResult>(detectScript(value));
  const [suggestions, setSuggestions] = useState<{ hindi: string; urdu: string }>({ hindi: '', urdu: '' });
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setScriptInfo(detectScript(value));
    if (value && value.trim()) {
      const translit = getTransliterations(value);
      setSuggestions({ hindi: translit.hindi, urdu: translit.urdu });
    } else {
      setSuggestions({ hindi: '', urdu: '' });
    }
  }, [value]);

  const handleApplyTransliteration = (text: string) => {
    onChange(text);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const InputElement = isTextArea ? 'textarea' : 'input';

  // High contrast badge styling
  const getBadgeStyle = () => {
    if (scriptInfo.script === 'urdu_arabic') {
      return 'bg-purple-100 text-purple-950 border-purple-400 dark:bg-purple-900/60 dark:text-purple-200 dark:border-purple-500';
    }
    if (scriptInfo.script === 'devanagari') {
      return 'bg-amber-100 text-amber-950 border-amber-400 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-500';
    }
    if (scriptInfo.script === 'mixed') {
      return 'bg-cyan-100 text-cyan-950 border-cyan-400 dark:bg-cyan-900/60 dark:text-cyan-200 dark:border-cyan-500';
    }
    return 'bg-emerald-100 text-emerald-950 border-emerald-400 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-500';
  };

  return (
    <div className="relative w-full space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="form-label">
            {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
          </label>
          {value && (
            <div className="flex items-center gap-1.5 animate-fadeIn">
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-sm flex items-center gap-1 ${getBadgeStyle()}`}>
                <span>{scriptInfo.flag}</span>
                <span>{scriptInfo.label}</span>
              </span>
            </div>
          )}
        </div>
      )}

      <div className="relative group">
        <InputElement
          ref={inputRef as any}
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDownInternal}
          placeholder={placeholder}
          required={required}
          rows={isTextArea ? rows : undefined}
          dir={scriptInfo.script === 'urdu_arabic' ? 'rtl' : 'ltr'}
          className={`royal-input ${
            scriptInfo.script === 'urdu_arabic' ? 'font-urdu text-base' : scriptInfo.script === 'devanagari' ? 'font-devanagari' : 'font-sans'
          } ${className}`}
        />

        {/* Floating script indicator icon */}
        <div className="absolute right-3 top-3 pointer-events-none text-neutral-400 dark:text-neutral-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          <Languages className="w-4 h-4 opacity-70" />
        </div>
      </div>

      {/* Real-time Phonetic Auto-Conversion Ribbon for Hindi and Urdu with High-Contrast Buttons */}
      {showSuggestions && value && scriptInfo.script === 'latin' && (suggestions.hindi || suggestions.urdu) && (
        <div className="flex flex-wrap items-center gap-2 pt-1 animate-fadeIn">
          <span className="text-[11px] font-extrabold text-[#78350F] dark:text-amber-300 flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Auto-Type:
          </span>

          {suggestions.hindi && suggestions.hindi !== value && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleApplyTransliteration(suggestions.hindi);
              }}
              className="translit-btn-hi cursor-pointer"
              title="Click to insert Hindi (Devanagari) script"
            >
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FDE68A] text-[#78350F] font-black">हि:</span>
              <span className="font-extrabold text-sm font-devanagari">{suggestions.hindi}</span>
            </button>
          )}

          {suggestions.urdu && suggestions.urdu !== value && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleApplyTransliteration(suggestions.urdu);
              }}
              className="translit-btn-ur cursor-pointer"
              title="Click to insert Urdu (Nastaliq) script"
            >
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E9D5FF] text-[#581C87] font-black font-sans">اردو:</span>
              <span className="font-extrabold text-base font-urdu">{suggestions.urdu}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

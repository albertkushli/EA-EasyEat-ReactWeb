import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LanguageDropdown() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', label: 'Inglés (en)' },
    { code: 'es', label: 'Español (es)' },
    { code: 'ca', label: 'Catalán (ca)' },
  ];

  const currentLanguage = languages.find((l) => l.code === i18n.language) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-bold transition-all hover:bg-white/10 rounded-lg focus:outline-none"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{ color: 'var(--clr-text, currentColor)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <Globe size={14} />
        <span>{currentLanguage.code.toUpperCase()}</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-[10000] w-40 mt-2 origin-top-right bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden"
          style={{ backgroundColor: '#ffffff', borderColor: '#ddd', borderWidth: '1px' }}
        >
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(lang.code);
                }}
                className={`block w-full px-4 py-2 text-sm text-left transition-colors ${
                  i18n.language === lang.code
                    ? 'bg-orange-50 text-orange-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={{
                  color: i18n.language === lang.code ? 'var(--clr-primary, #f97316)' : '#1a1a1a',
                  backgroundColor: i18n.language === lang.code ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

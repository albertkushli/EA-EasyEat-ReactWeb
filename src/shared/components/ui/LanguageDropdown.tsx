import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

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
    <div className="ee-language-dropdown relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        className="ee-language-dropdown__trigger"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <Globe size={14} />
        <span>{currentLanguage.code.toUpperCase()}</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="ee-language-dropdown__menu">
          <div className="py-1">
            {languages.map((lang) => {
              const selected = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(lang.code);
                  }}
                  className={`ee-language-dropdown__option ${selected ? 'active' : ''}`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

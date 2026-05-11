import i18n from "i18next";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function LanguageSwitcher() {
  const currentLanguage = i18n.language;

  const languages = [
    { code: "ca", label: "CA" },
    { code: "es", label: "ES" },
    { code: "en", label: "EN" },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50 backdrop-blur-sm">
      <div className="px-2 text-gray-400">
        <Globe className="w-3.5 h-3.5" />
      </div>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`relative px-3 py-1 text-[10px] font-black transition-all duration-300 rounded-lg ${
            currentLanguage === lang.code
              ? "text-white"
              : "text-gray-500 hover:text-gray-800 hover:bg-white/50"
          }`}
        >
          {currentLanguage === lang.code && (
            <motion.div
              layoutId="activeLang"
              className="absolute inset-0 bg-orange-500 rounded-lg shadow-sm"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">{lang.label}</span>
        </button>
      ))}
    </div>
  );
}
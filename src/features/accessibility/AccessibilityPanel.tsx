import React, { useEffect, useState } from 'react';
import './accessibility.css';

type AccessibilitySettings = {
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  fontFamily: string;
  hideImages: boolean;
};

const DEFAULT_SETTINGS: AccessibilitySettings = {
  backgroundColor: '#ffffff',
  textColor: '#000000',
  fontSize: 16,
  letterSpacing: 0,
  lineHeight: 1.2,
  fontFamily: 'Arial, sans-serif',
  hideImages: false,
};

export default function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Error parsing accessibility settings from localStorage', e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    // Activa la clase global de accesibilidad en el body
    document.body.classList.add('accessibility-enabled');

    // Aplica las variables CSS al root/html
    document.documentElement.style.setProperty(
      '--accessibility-bg-color',
      settings.backgroundColor,
    );
    document.documentElement.style.setProperty('--accessibility-text-color', settings.textColor);
    document.documentElement.style.setProperty(
      '--accessibility-font-size',
      `${settings.fontSize}px`,
    );
    document.documentElement.style.setProperty(
      '--accessibility-letter-spacing',
      `${settings.letterSpacing}px`,
    );
    document.documentElement.style.setProperty(
      '--accessibility-line-height',
      `${settings.lineHeight}`,
    );
    document.documentElement.style.setProperty('--accessibility-font-family', settings.fontFamily);

    if (settings.hideImages) {
      document.body.classList.add('accessibility-hide-images');
    } else {
      document.body.classList.remove('accessibility-hide-images');
    }

    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K],
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetSetting = <K extends keyof AccessibilitySettings>(key: K) => {
    updateSetting(key, DEFAULT_SETTINGS[key]);
  };

  const resetAllSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <>
      {/* Botón flotante de accesibilidad */}
      <button
        className="accessibility-floating-button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú de accesibilidad"
      >
        <svg className="accessibility-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="4" r="2.2" />
          <path d="M4.5 8.2C4.5 7.5 5.1 6.9 5.8 6.9H18.2C18.9 6.9 19.5 7.5 19.5 8.2C19.5 8.9 18.9 9.5 18.2 9.5H14.8V20C14.8 20.8 14.1 21.5 13.3 21.5C12.5 21.5 11.8 20.8 11.8 20V15.4H11.3L9.6 20.4C9.3 21.2 8.5 21.6 7.7 21.3C6.9 21 6.5 20.2 6.8 19.4L8.9 13.3V9.5H5.8C5.1 9.5 4.5 8.9 4.5 8.2Z" />
        </svg>
      </button>

      {/* Modal / Panel */}
      {open && (
        <div className="accessibility-overlay" onClick={() => setOpen(false)}>
          <div className="accessibility-modal" onClick={(e) => e.stopPropagation()}>
            <div className="accessibility-header">
              <h2>Accesibilidad</h2>
              <button
                className="accessibility-close-button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar panel de accesibilidad"
              >
                ✕
              </button>
            </div>

            <div className="accessibility-content">
              {/* Botón reiniciar todo */}
              <button className="accessibility-reset-all" onClick={resetAllSettings}>
                Reiniciarlo todo
              </button>

              {/* 1. Color de fondo */}
              <div className="accessibility-section">
                <h3>Color de fondo</h3>
                <div className="accessibility-control-row">
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                  />
                  <button onClick={() => resetSetting('backgroundColor')}>Reiniciar</button>
                </div>
              </div>

              {/* 2. Color del texto */}
              <div className="accessibility-section">
                <h3>Color del texto</h3>
                <div className="accessibility-control-row">
                  <input
                    type="color"
                    value={settings.textColor}
                    onChange={(e) => updateSetting('textColor', e.target.value)}
                  />
                  <button onClick={() => resetSetting('textColor')}>Reiniciar</button>
                </div>
              </div>

              {/* 3. Tipo de letra */}
              <div className="accessibility-section">
                <h3>Tipo de letra</h3>
                <div className="accessibility-font-buttons">
                  <button
                    className={settings.fontFamily.includes('Georgia') ? 'active' : ''}
                    onClick={() => updateSetting('fontFamily', 'Georgia, serif')}
                  >
                    Serif
                  </button>
                  <button
                    className={settings.fontFamily.includes('Arial') ? 'active' : ''}
                    onClick={() => updateSetting('fontFamily', 'Arial, sans-serif')}
                  >
                    Sans Serif
                  </button>
                  <button
                    className={settings.fontFamily.includes('Comic Sans') ? 'active' : ''}
                    onClick={() =>
                      updateSetting('fontFamily', "'Comic Sans MS', 'Chalkboard SE', cursive")
                    }
                  >
                    Dislèxic
                  </button>
                </div>
              </div>

              {/* 4. Tamaño de letra */}
              <div className="accessibility-section">
                <h3>Tamaño de letra</h3>
                <div className="accessibility-control-row-slider">
                  <button
                    onClick={() => updateSetting('fontSize', Math.max(12, settings.fontSize - 1))}
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="12"
                    max="32"
                    value={settings.fontSize}
                    onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
                  />
                  <button
                    onClick={() => updateSetting('fontSize', Math.min(32, settings.fontSize + 1))}
                  >
                    +
                  </button>
                  <span className="value-display">{settings.fontSize}px</span>
                </div>
                <button className="section-reset-btn" onClick={() => resetSetting('fontSize')}>
                  Reiniciar
                </button>
              </div>

              {/* 5. Espaciado entre letras */}
              <div className="accessibility-section">
                <h3>Espaciado entre letras</h3>
                <div className="accessibility-control-row-slider">
                  <button
                    onClick={() =>
                      updateSetting(
                        'letterSpacing',
                        Math.max(0, Number((settings.letterSpacing - 0.5).toFixed(1))),
                      )
                    }
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={settings.letterSpacing}
                    onChange={(e) => updateSetting('letterSpacing', Number(e.target.value))}
                  />
                  <button
                    onClick={() =>
                      updateSetting(
                        'letterSpacing',
                        Math.min(10, Number((settings.letterSpacing + 0.5).toFixed(1))),
                      )
                    }
                  >
                    +
                  </button>
                  <span className="value-display">{settings.letterSpacing}px</span>
                </div>
                <button className="section-reset-btn" onClick={() => resetSetting('letterSpacing')}>
                  Reiniciar
                </button>
              </div>

              {/* 6. Altura de línea */}
              <div className="accessibility-section">
                <h3>Altura de línea</h3>
                <div className="accessibility-control-row-slider">
                  <button
                    onClick={() =>
                      updateSetting(
                        'lineHeight',
                        Math.max(1, Number((settings.lineHeight - 0.1).toFixed(1))),
                      )
                    }
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={settings.lineHeight}
                    onChange={(e) => updateSetting('lineHeight', Number(e.target.value))}
                  />
                  <button
                    onClick={() =>
                      updateSetting(
                        'lineHeight',
                        Math.min(3, Number((settings.lineHeight + 0.1).toFixed(1))),
                      )
                    }
                  >
                    +
                  </button>
                  <span className="value-display">{settings.lineHeight}</span>
                </div>
                <button className="section-reset-btn" onClick={() => resetSetting('lineHeight')}>
                  Reiniciar
                </button>
              </div>

              {/* 7. Visibilidad de imágenes */}
              <div className="accessibility-section image-visibility-section">
                <h3>Visibilidad de imágenes</h3>
                <button
                  className={`toggle-images-btn ${settings.hideImages ? 'hidden' : ''}`}
                  onClick={() => updateSetting('hideImages', !settings.hideImages)}
                >
                  {settings.hideImages ? 'Mostrar imágenes' : 'Ocultar imágenes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

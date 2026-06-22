import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Shield, Info, Gavel, Mail, Scale, ChevronRight } from 'lucide-react';
import Footer from '@/shared/components/Footer';
import logoImg from '@/assets/logo.svg';

export default function LegalNotice() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar Minimalist */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-black text-orange-600 tracking-tight flex items-center gap-2"
          >
            <img src={logoImg} alt="EasyEat Logo" style={{ height: '32px' }} />
          </Link>
          <Link
            to="/"
            className="text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-1"
          >
            {t('navbar.back')} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="bg-gradient-to-br from-orange-600 to-red-600 py-20 px-6 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Aviso Legal</h1>
          <p className="text-orange-100 text-lg font-medium opacity-90">
            Información legal, términos de uso y responsabilidades de la plataforma Easy Eat.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow max-w-4xl mx-auto py-16 px-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 space-y-12">
          {/* Section 1: Titularidad */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-orange-600 mb-6">
              <div className="p-3 bg-orange-100 rounded-2xl">
                <Info className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">1. Titularidad del sitio web</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              En cumplimiento del deber de información recogido en el artículo 10 de la Ley 34/2002,
              de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio
              Electrónico (LSSI-CE), se facilitan a continuación los siguientes datos
              identificativos del titular del sitio web:
            </p>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Nombre Comercial
                </p>
                <p className="font-bold text-slate-700 text-lg">
                  <img src={logoImg} alt="Easy Eat Logo" style={{ height: '24px' }} />
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Nombre Fiscal / Razón Social
                </p>
                <p className="font-bold text-slate-700">[Nombre de la empresa]</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  NIF / CIF
                </p>
                <p className="font-bold text-slate-700">[CIF/NIF]</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Domicilio Fiscal
                </p>
                <p className="font-bold text-slate-700">[Dirección fiscal]</p>
              </div>
            </div>
          </section>

          {/* Section 2: Objeto */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-orange-600 mb-6">
              <div className="p-3 bg-orange-100 rounded-2xl">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">2. Objeto del sitio web</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              El presente sitio web, Easy Eat, tiene como objeto proporcionar una plataforma de
              fidelización para el sector de la restauración, permitiendo a los usuarios acumular
              puntos por sus visitas y a los restaurantes gestionar sus programas de recompensas y
              analizar el rendimiento de su negocio.
            </p>
          </section>

          {/* Section 3: Condiciones de uso */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-orange-600 mb-6">
              <div className="p-3 bg-orange-100 rounded-2xl">
                <Gavel className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">3. Condiciones generales de uso</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              El acceso y/o uso de este portal de Easy Eat atribuye la condición de USUARIO, que
              acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas.
              Las citadas Condiciones serán de aplicación independientemente de las Condiciones
              Generales de Contratación que en su caso resulten de obligado cumplimiento.
            </p>
            <p className="text-slate-600 leading-relaxed">
              El usuario se compromete a hacer un uso adecuado de los contenidos y servicios que
              Easy Eat ofrece a través de su portal y con carácter enunciativo pero no limitativo, a
              no emplearlos para incurrir en actividades ilícitas, ilegales o contrarias a la buena
              fe y al orden público.
            </p>
          </section>

          {/* Section 4: Propiedad Intelectual */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-orange-600 mb-6">
              <div className="p-3 bg-orange-100 rounded-2xl">
                <Scale className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">
                4. Propiedad intelectual e industrial
              </h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Easy Eat por sí o como cesionaria, es titular de todos los derechos de propiedad
              intelectual e industrial de su página web, así como de los elementos contenidos en la
              misma (a título enunciativo, imágenes, sonido, audio, vídeo, software o textos; marcas
              o logotipos, combinaciones de colores, estructura y diseño, selección de materiales
              usados, programas de ordenador necesarios para su funcionamiento, acceso y uso, etc.).
            </p>
            <p className="text-slate-600 leading-relaxed">
              Todos los derechos reservados. En virtud de lo dispuesto en los artículos 8 y 32.1,
              párrafo segundo, de la Ley de Propiedad Intelectual, quedan expresamente prohibidas la
              reproducción, la distribución y la comunicación pública, incluida su modalidad de
              puesta a disposición, de la totalidad o parte de los contenidos de esta página web,
              con fines comerciales, en cualquier soporte y por cualquier medio técnico, sin la
              autorización de Easy Eat.
            </p>
          </section>

          {/* Section 5: Protección de Datos */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-orange-600 mb-6">
              <div className="p-3 bg-orange-100 rounded-2xl">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">
                5. Protección de datos personales
              </h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Easy Eat cumple con las directrices del Reglamento (UE) 2016/679 del Parlamento
              Europeo y del Consejo de 27 de abril de 2016 relativo a la protección de las personas
              físicas en lo que respecta al tratamiento de datos personales y a la libre circulación
              de estos datos (RGPD), velando por garantizar un correcto uso y tratamiento de los
              datos personales del usuario.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Para más información, puede consultar nuestra Política de Privacidad y nuestra
              Política de Cookies.
            </p>
          </section>

          {/* Section 6: Legislación */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-orange-600 mb-6">
              <div className="p-3 bg-orange-100 rounded-2xl">
                <Scale className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">
                6. Legislación aplicable y jurisdicción
              </h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              La relación entre Easy Eat y el USUARIO se regirá por la normativa española vigente y
              cualquier controversia se someterá a los Juzgados y tribunales de la ciudad de
              Barcelona, salvo que la ley aplicable disponga otra cosa.
            </p>
          </section>

          {/* Section 7: Contacto */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-orange-600 mb-6">
              <div className="p-3 bg-orange-100 rounded-2xl">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">7. Contacto</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Para cualquier duda o consulta sobre este aviso legal, puede ponerse en contacto con
              nosotros a través del siguiente correo electrónico:
            </p>
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-6 py-3 rounded-2xl font-bold border border-orange-100">
              <Mail className="w-5 h-5" />
              [email@empresa.com]
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

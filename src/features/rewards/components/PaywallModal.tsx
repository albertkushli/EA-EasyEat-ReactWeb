import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Zap, BarChart3, MessageSquare, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export default function PaywallModal({ isOpen, onClose, onUpgrade }: PaywallModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const features = [
    {
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      title: 'Recompensas Ilimitadas',
      description: 'Crea y mantén activas tantas promociones como desees sin restricciones.',
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-indigo-500" />,
      title: 'Estadísticas Avanzadas',
      description:
        'Analiza el retorno, horas de mayor consumo y el comportamiento de tus clientes.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-emerald-500" />,
      title: 'IA de Soporte y Promociones',
      description: 'Asistente inteligente integrado para optimizar tus campañas de fidelización.',
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-rose-500" />,
      title: 'Prioridad e Integraciones',
      description: 'Prioridad en las búsquedas de clientes y opciones de dominios personalizados.',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative bg-white/90 dark:bg-slate-900/90 border border-white/20 rounded-[2.5rem] w-full max-w-xl shadow-3xl overflow-hidden p-8 md:p-10 text-center"
        >
          {/* Decorative gradients */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Crown Animation */}
          <motion.div
            initial={{ rotate: -15, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-amber-400 via-orange-500 to-red-600 rounded-3xl shadow-xl shadow-orange-500/20 text-white mb-6"
          >
            <Crown className="w-10 h-10 animate-pulse" />
          </motion.div>

          {/* Header */}
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
            Límite de Recompensas Alcanzado
          </h2>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
            Los restaurantes en el plan gratuito pueden tener hasta **5 recompensas activas**
            simultáneamente. Actualiza a un plan superior para desbloquear todo el potencial.
          </p>

          {/* Premium Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 text-left">
            {features.map((feat, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/60 rounded-2xl flex gap-3 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl h-fit shadow-sm">
                  {feat.icon}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-700 dark:text-slate-200">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed font-bold">
                    {feat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={onUpgrade}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white" />
              Pasarse a Premium
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-4 bg-slate-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-black text-sm uppercase tracking-wider rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Quizás más tarde
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

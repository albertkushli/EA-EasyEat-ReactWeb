import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getRewardsByRestaurant } from '@/services/reward.service';
import apiClient from '@/services/apiClient';
import { motion } from 'framer-motion';
import {
  Check,
  Crown,
  Zap,
  HelpCircle,
  ArrowRight,
  Sparkles,
  BarChart3,
  TrendingUp,
  FileCheck,
  CreditCard,
  Loader2,
} from 'lucide-react';

export default function BillingPanel() {
  const { restaurant, reloadRestaurant } = useAuth() as any;
  const [searchParams] = useSearchParams();

  const [activeCount, setActiveCount] = useState<number>(0);
  const [loadingUsage, setLoadingUsage] = useState<boolean>(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [billingPlanUrlParam, setBillingPlanUrlParam] = useState<string | null>(null);

  const restaurantId = restaurant?._id || restaurant?.id || '';
  const currentPlan = restaurant?.plan || 'free';

  useEffect(() => {
    if (restaurantId) {
      loadRewardsUsage();
    }
  }, [restaurantId]);

  useEffect(() => {
    const isSuccess = searchParams.get('success') === 'true';
    const planParam = searchParams.get('plan');

    if (isSuccess && planParam) {
      setShowCelebration(true);
      setBillingPlanUrlParam(planParam);
      // Reactive reload of restaurant state to update currentPlan immediately
      reloadRestaurant();
    }
  }, [searchParams, reloadRestaurant]);

  const loadRewardsUsage = async () => {
    try {
      setLoadingUsage(true);
      const rewards = await getRewardsByRestaurant(restaurantId);
      const active = rewards.filter((r: any) => r.active).length;
      setActiveCount(active);
    } catch (err) {
      console.error('Error loading usage stats:', err);
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleUpgrade = async (plan: 'premium' | 'business') => {
    try {
      setCheckoutLoading(plan);
      const res = await apiClient.post('/stripe/create-checkout-session', {
        plan,
        restaurantId,
      });

      if (res.data?.url) {
        // Redirection to the secure Stripe-hosted Checkout Page
        window.location.href = res.data.url;
      } else {
        alert('No se pudo iniciar la sesión de Stripe Checkout.');
      }
    } catch (err: any) {
      console.error('Stripe Session Error:', err);
      alert(err.response?.data?.error || 'Error al conectar con Stripe.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Plan Free',
      price: '0€',
      period: 'para siempre',
      description:
        'Ideal para pequeños restaurantes que quieren empezar a digitalizar su fidelización.',
      features: [
        'Hasta 5 recompensas activas',
        'Estadísticas básicas de consumo',
        'Códigos QR dinámicos',
        'Soporte por email estándar',
      ],
      cta: 'Plan Actual',
      disabled: true,
      popular: false,
      color: 'from-slate-500 to-slate-700',
    },
    {
      id: 'premium',
      name: 'Plan Premium',
      price: '29€',
      period: '/ mes',
      description:
        'Para restaurantes en crecimiento que quieren fidelizar clientes ilimitadamente.',
      features: [
        'Recompensas activas ilimitadas',
        'Estadísticas avanzadas e históricos',
        'Prioridad de visibilidad en la app',
        'Personalización de colores y logo',
        'Soporte Premium 24/7',
      ],
      cta: 'Actualizar a Premium',
      disabled: false,
      popular: true,
      color: 'from-orange-500 to-red-600',
    },
    {
      id: 'business',
      name: 'Plan Business',
      price: '79€',
      period: '/ mes',
      description:
        'La solución total para franquicias y restaurantes enfocados en maximizar ingresos.',
      features: [
        'Todo lo incluido en Premium',
        'Asistente inteligente con IA de Gemini',
        'Dominio personalizado para tu web',
        'Integración API completa con tu TPV',
        'Gestor de cuenta exclusivo',
      ],
      cta: 'Actualizar a Business',
      disabled: false,
      popular: false,
      color: 'from-indigo-600 to-violet-700',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-0 mb-12">
      {/* Confetti & Success Banner */}
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-8 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-700 text-white rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden"
        >
          {/* Confetti effect using simple decorative nodes */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-8 h-8 animate-bounce" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">
              ¡Suscripción Completada con Éxito!
            </h2>
            <p className="text-sm font-semibold opacity-90 mt-1 max-w-2xl leading-relaxed">
              Tu restaurante ha sido actualizado exitosamente al plan{' '}
              <span className="underline uppercase font-black">{billingPlanUrlParam}</span>. Ahora
              disfrutas de todos los privilegios premium de EasyEat.
            </p>
          </div>
          <button
            onClick={() => setShowCelebration(false)}
            className="md:ml-auto px-6 py-2.5 bg-white text-emerald-800 font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-md"
          >
            Entendido
          </button>
        </motion.div>
      )}

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-orange-500" />
          <span>Gestión de Suscripción</span>
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          Controla tu plan actual, límite de recompensas y facturación.
        </p>
      </div>

      {/* Usage Meter & Current Plan Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Current Plan status */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Plan Actual
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {currentPlan === 'free' ? 'Plan Gratuito' : `Plan ${currentPlan}`}
              </h3>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">Suscripción activa</p>
            </div>
          </div>
        </div>

        {/* Rewards Limit Meter */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 md:col-span-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Límite de Recompensas Activas
              </p>
              <h3 className="text-xl font-black text-slate-800 tracking-tight mt-1">
                {currentPlan === 'free' ? `${activeCount} / 5 Usadas` : 'Ilimitadas'}
              </h3>
            </div>
            {loadingUsage && <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: currentPlan === 'free' ? `${(activeCount / 5) * 100}%` : '100%' }}
              transition={{ duration: 0.8 }}
              className={`h-full rounded-full ${
                currentPlan === 'free'
                  ? activeCount >= 5
                    ? 'bg-red-500 shadow-lg shadow-red-500/20'
                    : 'bg-orange-500 shadow-lg shadow-orange-500/20'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg'
              }`}
            />
          </div>

          <p className="text-xs text-gray-400 font-medium">
            {currentPlan === 'free'
              ? 'Has alcanzado el número máximo de recompensas activas permitidas en el plan gratis.'
              : 'Disfrutas de recompensas activas sin límites para potenciar tu fidelización al máximo.'}
          </p>
        </div>
      </div>

      {/* SaaS Subscription Plans Grid */}
      <h2 className="text-xl font-black text-gray-800 tracking-tight mb-6">
        Elige el plan ideal para tu restaurante
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`relative bg-white rounded-[2.5rem] p-8 shadow-sm border ${
                plan.popular ? 'border-orange-500 shadow-xl shadow-orange-500/5' : 'border-gray-100'
              } flex flex-col justify-between overflow-hidden`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-6 right-6 px-4 py-1.5 bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-md shadow-orange-500/10">
                  Más Popular
                </div>
              )}

              {/* Top Details */}
              <div>
                <h3 className="text-lg font-black text-slate-800">{plan.name}</h3>
                <div className="flex items-baseline mt-4 mb-2">
                  <span className="text-5xl font-black text-slate-900 tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm font-semibold text-gray-400 ml-1">{plan.period}</span>
                </div>
                <p className="text-xs font-semibold text-gray-500 leading-relaxed mb-6">
                  {plan.description}
                </p>

                <div className="border-t border-slate-100 my-6" />

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-xs font-bold text-slate-600"
                    >
                      <div
                        className={`p-1 bg-gray-50 rounded-full shrink-0 ${plan.popular ? 'text-orange-500' : 'text-slate-500'}`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Upgrade Action Button */}
              {isCurrent ? (
                <button
                  disabled
                  className="w-full py-4 bg-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider rounded-2xl cursor-default transition-all flex items-center justify-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  Tu Plan Actual
                </button>
              ) : (
                <button
                  disabled={plan.disabled || checkoutLoading !== null}
                  onClick={() => handleUpgrade(plan.id as any)}
                  className={`w-full py-4 font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-xl shadow-orange-500/20 hover:scale-105'
                      : 'bg-slate-900 hover:bg-slate-800 text-white hover:scale-105'
                  } disabled:opacity-50`}
                >
                  {checkoutLoading === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{plan.cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Security notice */}
      <div className="mt-12 text-center p-6 bg-slate-50 rounded-3xl border border-slate-100 max-w-xl mx-auto flex items-center justify-center gap-3 text-gray-500">
        <HelpCircle className="w-5 h-5 text-gray-400 shrink-0" />
        <p className="text-xs font-semibold text-left leading-relaxed">
          Los pagos se procesan de forma segura a través de **Stripe Checkout**. No guardamos datos
          bancarios ni de tarjetas de crédito en nuestros servidores corporativos de EasyEat.
        </p>
      </div>
    </div>
  );
}

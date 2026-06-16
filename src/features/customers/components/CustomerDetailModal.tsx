import { useState, useEffect, useMemo } from 'react';
import { Customer } from '@/types/Customer';
import { fetchRestaurantReviews } from '@/services/review.service';
import * as customerService from '@/services/customer.service';
import { IReview } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Star,
  TrendingUp,
  History,
  Award,
  Mail,
  Loader2,
  ThumbsUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  restaurantId: string;
  restaurantVisits: any[];
}

export default function CustomerDetailModal({
  isOpen,
  onClose,
  customer,
  restaurantId,
  restaurantVisits,
}: CustomerDetailModalProps) {
  const { t } = useTranslation();
  const [fullCustomer, setFullCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [restaurantReviews, setRestaurantReviews] = useState<IReview[]>([]);

  useEffect(() => {
    if (isOpen && customer) {
      loadData();
    }
  }, [isOpen, customer, restaurantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await customerService.fetchCustomerFull(customer!._id);
      setFullCustomer(data);

      const reviews = await fetchRestaurantReviews(restaurantId);
      setRestaurantReviews(reviews);
    } catch (error) {
      console.error('Error loading full customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!customer) return null;

    const customerVisits = restaurantVisits.filter(
      (visit: any) =>
        String(visit.restaurant_id?._id || visit.restaurant_id) === String(restaurantId) &&
        String(visit.customer_id?._id || visit.customer_id) === String(customer._id),
    );

    const totalVisits = customerVisits.length;
    const totalSpent = customerVisits.reduce(
      (sum, visit) => sum + Number(visit.billAmount || 0),
      0,
    );
    const totalPoints = customerVisits.reduce(
      (sum, visit) => sum + Number(visit.pointsEarned || 0),
      0,
    );

    const sortedVisits = [...customerVisits].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const lastVisit = sortedVisits[0];

    const filteredReviews = restaurantReviews.filter(
      (review: any) =>
        String(review.restaurant_id?._id || review.restaurant_id) === String(restaurantId) &&
        String(review.customer_id?._id || review.customer_id) === String(customer._id),
    );

    const ratings = filteredReviews
      .map((review: any) => Number(review.globalRating))
      .filter((rating) => !Number.isNaN(rating));

    const averageRating =
      ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null;

    return {
      totalVisits,
      totalSpent: totalSpent.toFixed(2),
      totalPoints,
      avgRating: averageRating !== null ? averageRating.toFixed(1) : null,
      lastVisit: lastVisit
        ? new Date(lastVisit.date).toLocaleDateString()
        : t('clients.details.noHistory'),
      recentHistory: sortedVisits.slice(0, 5),
      recentReviews: filteredReviews
        .sort(
          (a, b) =>
            new Date(b.date || b.createdAt!).getTime() - new Date(a.date || a.createdAt!).getTime(),
        )
        .slice(0, 3),
    };
  }, [customer, restaurantId, restaurantVisits, restaurantReviews, t]);

  if (!customer) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header / Banner */}
            <div className="relative h-32 sm:h-40 bg-gradient-to-r from-orange-500 to-red-600 p-6 sm:p-8 flex items-end">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="flex items-center gap-4 sm:gap-6 translate-y-10 sm:translate-y-12">
                <div className="relative">
                  <img
                    src={
                      customer.profilePictures?.[0] ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=f97316&color=fff`
                    }
                    alt={customer.name}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] object-cover border-4 border-white shadow-xl bg-white"
                  />
                  {customer.isActive && (
                    <div className="absolute bottom-2 right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 border-4 border-white rounded-full shadow-sm"></div>
                  )}
                </div>
                <div className="pb-2 sm:pb-4">
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">
                    {customer.name}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-500 mt-1">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">{customer.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pt-16 sm:pt-20 p-6 sm:p-10">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                    Cargando datos reales...
                  </p>
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                  {/* Left Column: Stats Cards */}
                  <div className="md:col-span-1 space-y-4">
                    <div className="bg-orange-50 rounded-3xl p-5 border border-orange-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                          <TrendingUp className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">
                          {t('clients.details.stats')}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 font-medium">
                            {t('clients.details.totalVisits')}
                          </span>
                          <span className="text-lg font-black text-gray-800">
                            {stats.totalVisits}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 font-medium">
                            {t('clients.details.lastVisit')}
                          </span>
                          <span className="text-sm font-black text-gray-700">
                            {stats.lastVisit}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 font-medium">
                            {t('clients.details.avgRating')}
                          </span>
                          <div className="flex items-center gap-1">
                            {stats.avgRating !== null ? (
                              <>
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-lg font-black text-gray-800">
                                  {stats.avgRating}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium italic">
                                Sin valoraciones
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 font-medium">
                            {t('clients.details.totalSpent')}
                          </span>
                          <span className="text-lg font-black text-gray-800">
                            {stats.totalSpent}€
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 font-medium">Puntos ganados</span>
                          <span className="text-lg font-black text-orange-600">
                            {stats.totalPoints}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                          <Award className="w-5 h-5 text-slate-600" />
                        </div>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                          FIDELIZACIÓN
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-gray-400 block mb-1">
                            Puntos acumulados
                          </span>
                          <span className="text-lg font-black text-gray-800">
                            {stats.totalPoints}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: History & Reviews */}
                  <div className="md:col-span-2 space-y-8">
                    {/* Recent Visits */}
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-100 rounded-xl">
                          <History className="w-5 h-5 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-black text-gray-800 tracking-tight uppercase italic">
                          {t('clients.details.visitHistory')}
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {stats.recentHistory.length > 0 ? (
                          stats.recentHistory.map((visit, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-orange-200 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-orange-50 rounded-lg">
                                  <Calendar className="w-4 h-4 text-orange-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-800">
                                    Visita al restaurante
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {new Date(visit.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <span className="text-sm font-black text-gray-700">
                                {visit.billAmount?.toFixed(2)}€
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400 italic p-4">
                            {t('clients.details.noHistory')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reviews */}
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-100 rounded-xl">
                          <Star className="w-5 h-5 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-black text-gray-800 tracking-tight uppercase italic">
                          {t('clients.details.lastReviews')}
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {stats.recentReviews.length > 0 ? (
                          stats.recentReviews.map((review, i) => (
                            <div
                              key={i}
                              className="p-5 bg-gray-50 rounded-3xl border border-gray-100"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, j) => (
                                      <Star
                                        key={j}
                                        className={`w-3.5 h-3.5 ${j < Math.round(review.globalRating / 2) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs font-black text-gray-800 ml-1">
                                    {review.globalRating}
                                  </span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase">
                                  {new Date(review.date || review.createdAt!).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                {review.comment ? `"${review.comment}"` : 'Sin comentario'}
                              </p>
                              {(review.likes || 0) > 0 && (
                                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-gray-400 font-black uppercase tracking-wider">
                                  <ThumbsUp className="w-3 h-3 text-orange-500" />
                                  <span>{review.likes} likes</span>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400 italic p-4">
                            No ha realizado reseñas todavía
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-400 font-medium">
                    No se pudieron cargar los detalles del cliente.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {t('clients.memberSince')} {new Date(customer.createdAt).toLocaleDateString()}
              </div>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-white border border-gray-200 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all shadow-sm"
              >
                {t('clients.details.close')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

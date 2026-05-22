import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Clock, DollarSign, X, ArrowRight } from 'lucide-react';
import type { Restaurant } from '@/types/Restaurant';
import { MAP_THEME } from '@/constants/mapTheme';

interface RestaurantPreviewCardProps {
  restaurant: Restaurant | null;
  onClose: () => void;
  onViewDetails: (restaurantId: string) => void;
}

function getImage(r: Restaurant): string {
  return (
    r.profile?.image?.[0] ||
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop&q=70'
  );
}

function getCuisine(r: Restaurant): string {
  return r.profile?.category?.slice(0, 2).join(' · ') || 'Restaurant';
}

function getPrice(r: Restaurant): string {
  const len = r.profile?.description?.length ?? 0;
  return len > 100 ? '€€€' : len > 40 ? '€€' : '€';
}

function estimatedTime(restaurantId?: string): string {
  const times = ['12-18', '15-25', '20-30', '25-35'];
  if (!restaurantId) return times[0];

  // Keep value deterministic per restaurant to avoid visual jitter on rerenders.
  const idx = restaurantId
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % times.length;

  return times[idx];
}

export const RestaurantPreviewCard: React.FC<RestaurantPreviewCardProps> = ({
  restaurant,
  onClose,
  onViewDetails,
}) => {
  return (
    <AnimatePresence mode="popLayout">
      {restaurant && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Image Section */}
            <div className="relative w-full h-40 overflow-hidden bg-gray-200">
              <img
                src={getImage(restaurant)}
                alt={restaurant.profile?.name || 'Restaurant'}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Nearby Badge */}
              {(restaurant as any).isNearby && (
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: MAP_THEME.accent }}>
                  Nearby
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Rating Badge */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 text-white px-2.5 py-1 rounded-lg">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold">{(restaurant.profile?.globalRating ?? 0).toFixed(1)}</span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4">
              {/* Name & Cuisine */}
              <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
                {restaurant.profile?.name || 'Restaurant'}
              </h3>
              <p className="text-xs text-gray-500 mb-3">{getCuisine(restaurant)}</p>

              {/* Info Row */}
              <div className="flex flex-wrap gap-2 mb-4">
                {((restaurant as any).distanceKm ?? null) !== null && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                    <MapPin className="w-3 h-3" />
                    {((restaurant as any).distanceKm).toFixed(1)} km
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                  <Clock className="w-3 h-3" />
                  {estimatedTime(restaurant._id)} min
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                  <DollarSign className="w-3 h-3" />
                  {getPrice(restaurant)}
                </div>
              </div>

              {/* Description */}
              {restaurant.profile?.description && (
                <p className="text-xs text-gray-600 line-clamp-2 mb-4">
                  {restaurant.profile.description}
                </p>
              )}

              {/* View Details Button */}
              <button
                onClick={() => restaurant._id && onViewDetails(restaurant._id)}
                className="w-full text-white font-semibold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, ${MAP_THEME.primary}, ${MAP_THEME.accent})` }}
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RestaurantPreviewCard;


import * as React from 'react';
import type { Restaurant } from '@/types/Restaurant';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, Flame, Star, X } from 'lucide-react';

type RestaurantCardData = Restaurant & {
  distanceKm?: number;
  isNearby?: boolean;
};

type Props = {
  restaurant: RestaurantCardData;
  onClick?: () => void;
  onClose?: () => void;
};

export const RestaurantCard: React.FC<Props> = ({ restaurant, onClick, onClose }) => {
  const rating = restaurant.profile?.globalRating ?? 0;
  const ratingRounded = Math.round(rating * 10) / 10;
  const cuisines = restaurant.profile?.category?.slice(0, 2).join(' • ') || 'Restaurant';
  const distance = restaurant.distanceKm;
  const restaurantName = restaurant.profile?.name || 'Restaurant';
  const imageUrl = restaurant.profile?.image?.[0] || 'https://images.unsplash.com/photo-1564758106888-fcb0b8d8e44e?w=300&h=200&fit=crop';
  const distanceLabel = typeof distance === 'number' ? `${distance} km` : '—';
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  // Determine price level from description or default
  const priceLevel = (restaurant.profile?.description?.length || 0) > 50 ? '€€€' : '€€';

  return (
    <motion.div
      initial={{ y: 400, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 400, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 40, mass: 0.5 }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
      className={`fixed inset-0 z-50 flex items-end justify-center pointer-events-auto ${onClick ? 'cursor-pointer' : ''}`}
      aria-label={`Open ${restaurantName} details`}
    >
      {/* Backdrop with glass effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Card container */}
      <motion.div
        className="relative z-10 mx-auto w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-t-3xl border border-white/20 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag indicator */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header with image */}
        <div className="relative h-56 overflow-hidden rounded-t-2xl">
          <motion.img
            src={imageUrl}
            alt={restaurantName}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

           {/* Rating badge */}
           <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.2 }}
             className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 shadow-lg"
           >
             <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
             <span className="font-semibold text-gray-900">{ratingRounded}</span>
           </motion.div>

           {/* Close button */}
           <motion.button
             type="button"
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.2 }}
             onClick={(e) => {
               e.stopPropagation();
               onClose?.();
             }}
             className="absolute top-4 left-4 bg-white/90 backdrop-blur-md rounded-full p-2 shadow-lg hover:bg-white/100 transition-all z-10"
             aria-label="Close card"
           >
             <X className="w-5 h-5 text-gray-900" />
           </motion.button>

          {/* Trending badge if nearby */}
          {restaurant.isNearby && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="absolute top-4 left-4 bg-orange-500/90 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1 shadow-lg"
            >
              <Flame className="w-4 h-4 text-white" />
              <span className="text-xs font-semibold text-white">Nearby</span>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Restaurant name and cuisine */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 truncate">
              {restaurantName}
            </h2>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {cuisines}
            </p>
          </motion.div>

          {/* Info grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-3 gap-3"
          >
            {/* Distance */}
            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 transition-colors hover:bg-gray-100">
              <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-gray-500">Distance</span>
                <span className="font-semibold text-gray-900 text-sm truncate">
                  {distanceLabel}
                </span>
              </div>
            </div>

            {/* Delivery time (estimated) */}
            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 transition-colors hover:bg-gray-100">
              <Clock className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-gray-500">Delivery</span>
                <span className="font-semibold text-gray-900 text-sm truncate">
                  15-25 min
                </span>
              </div>
            </div>

            {/* Price level */}
            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 transition-colors hover:bg-gray-100">
              <DollarSign className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-gray-500">Price</span>
                <span className="font-semibold text-gray-900 text-sm truncate">
                  {priceLevel}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Description */}
          {restaurant.profile?.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-gray-600 line-clamp-2 leading-relaxed"
            >
              {restaurant.profile.description}
            </motion.p>
          )}

          {/* CTA Button */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl active:shadow-md touch-manipulation"
          >
            View Details
          </motion.button>

          {/* Safe area spacer for mobile */}
          <div className="h-4" />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RestaurantCard;


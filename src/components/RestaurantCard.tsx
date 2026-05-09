import React from 'react';
import type { Restaurant } from '@/types/Restaurant';
import { motion } from 'framer-motion';

type Props = {
  restaurant: Restaurant;
  onClick?: () => void;
};

export const RestaurantCard: React.FC<Props> = ({ restaurant, onClick }) => {
  return (
    <motion.div
      initial={{ y: 200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 200, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full max-w-xl mx-auto bg-white rounded-t-2xl shadow-xl p-4"
      role="button"
      onClick={onClick}
      aria-label={`Open ${restaurant.name} details`}
    >
      <div className="flex gap-4">
        <img src={restaurant.image} alt={restaurant.name} className="w-28 h-20 rounded-lg object-cover" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{restaurant.name}</h3>
            <div className="text-sm text-yellow-500 font-medium">{restaurant.rating} ★</div>
          </div>
          <p className="text-sm text-gray-500">{restaurant.cuisine}</p>
          <p className="text-sm text-gray-400 mt-2">{restaurant.distanceKm ? `${restaurant.distanceKm} km` : '—'}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default RestaurantCard;


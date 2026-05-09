import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp } from 'lucide-react';

interface MapOverlayProps {
  restaurantCount?: number;
  nearbyCount?: number;
  isLoading?: boolean;
}

export const MapOverlay: React.FC<MapOverlayProps> = ({
  restaurantCount = 0,
  nearbyCount = 0,
  isLoading = false,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-30 pointer-events-none"
      >
        {/* Top gradient fade */}
        <div className="h-32 bg-gradient-to-b from-black/20 to-transparent" />
      </motion.div>

      {/* Stats card - top left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ delay: 0.1 }}
        className="fixed top-6 left-4 z-30 pointer-events-auto"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20 max-w-xs">
          <div className="space-y-3">
            {/* Total restaurants */}
            <motion.div
              className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity"
              whileHover={{ scale: 1.02 }}
            >
              <div className="bg-blue-100 rounded-lg p-2">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600">Restaurants</p>
                <p className="text-lg font-bold text-gray-900 tabular-nums">
                  {isLoading ? '—' : restaurantCount}
                </p>
              </div>
            </motion.div>

            {/* Nearby count */}
            {nearbyCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity pt-3 border-t border-gray-100"
              >
                <div className="bg-orange-100 rounded-lg p-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600">Nearby</p>
                  <p className="text-lg font-bold text-gray-900 tabular-nums">
                    {nearbyCount}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MapOverlay;


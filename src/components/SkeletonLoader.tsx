import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonLoader: React.FC<{ show?: boolean }> = ({ show = true }) => {
  if (!show) return null;

  return (
    <div className="space-y-3 p-4">
      {/* Image skeleton */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl"
      />

      {/* Title skeleton */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
        className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-3/4"
      />

      {/* Text skeleton */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-1/2"
      />

      {/* Info grid skeleton */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0.1 * (i + 1),
            }}
            className="h-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg"
          />
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;

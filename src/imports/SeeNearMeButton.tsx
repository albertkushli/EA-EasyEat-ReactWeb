import React, { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  onClick: () => void;
  title?: string;
  loading?: boolean;
};

export const SeeNearMeButton: React.FC<Props> = ({ onClick, title = 'Show Near Me', loading = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={loading}
      className="fixed right-4 bottom-32 z-40 group touch-manipulation"
      aria-label={title}
    >
      {/* Glow effect */}
      <motion.div
        animate={{ scale: isHovered ? 1.2 : 1 }}
        className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity"
      />

      {/* Button container */}
      <motion.div
        className="relative bg-white/95 backdrop-blur-xl rounded-full p-4 shadow-xl border border-white/20 hover:shadow-2xl transition-shadow"
      >
        {/* Icon with loading animation */}
        <motion.div
          animate={{ rotate: loading ? 360 : 0 }}
          transition={{ duration: loading ? 2 : 0, repeat: loading ? Infinity : 0, ease: 'linear' }}
        >
          {loading ? (
            <Loader2 className="w-6 h-6 text-orange-500" />
          ) : (
            <MapPin className="w-6 h-6 text-orange-500" />
          )}
        </motion.div>
      </motion.div>

      {/* Expanded label on hover (desktop) */}
      <motion.div
        initial={false}
        animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? -16 : 0 }}
        transition={{ duration: 0.2 }}
        className="hidden sm:block absolute right-20 top-1/2 -translate-y-1/2 bg-gray-900/90 backdrop-blur-md text-white px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium pointer-events-none"
      >
        {loading ? 'Showing nearby restaurants...' : title}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-2 h-2 bg-gray-900/90 rotate-45" />
      </motion.div>
    </motion.button>
  );
};

export default SeeNearMeButton;


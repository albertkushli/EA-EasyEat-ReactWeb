import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface FloatingControlProps {
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
  isActive?: boolean;
  tooltip?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface FloatingControlBarProps {
  controls: FloatingControlProps[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  compact?: boolean;
}

const variantStyles = {
  primary: 'bg-white/95 hover:bg-white text-orange-500 border-white/20',
  secondary: 'bg-white/95 hover:bg-white text-gray-700 border-white/20',
  danger: 'bg-red-500/95 hover:bg-red-600 text-white border-red-400/20',
};

const positionStyles = {
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
};

export const FloatingControlButton: React.FC<FloatingControlProps> = ({
  icon,
  label,
  onClick,
  isActive = false,
  tooltip,
  variant = 'primary',
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative p-3 rounded-full backdrop-blur-xl border transition-all ${variantStyles[variant]} ${
        isActive ? 'ring-2 ring-offset-2 ring-orange-500' : ''
      }`}
      title={tooltip || label}
      aria-label={label || tooltip}
    >
      <motion.div
        animate={{ rotate: isActive ? 360 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {icon}
      </motion.div>

      {tooltip && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-900/90 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap pointer-events-none"
        >
          {tooltip}
        </motion.div>
      )}
    </motion.button>
  );
};

export const FloatingControlBar: React.FC<FloatingControlBarProps> = ({
  controls,
  position = 'bottom-right',
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(!compact);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed ${positionStyles[position]} z-40`}
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col gap-2 mb-4"
          >
            {controls.map((control, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <FloatingControlButton {...control} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {compact && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3 rounded-full bg-white/95 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isExpanded ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <div className="w-6 h-6 flex flex-col justify-center items-center gap-1">
                <div className="w-1 h-1 bg-gray-700 rounded-full" />
                <div className="w-1 h-1 bg-gray-700 rounded-full" />
                <div className="w-1 h-1 bg-gray-700 rounded-full" />
              </div>
            )}
          </motion.div>
        </motion.button>
      )}
    </motion.div>
  );
};

export default FloatingControlBar;


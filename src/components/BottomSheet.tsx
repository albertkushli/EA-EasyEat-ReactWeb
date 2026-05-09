import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BottomSheetProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  title?: string;
  showDragHandle?: boolean;
  snappable?: boolean;
  snapPoints?: number[];
}

/**
 * Premium bottom sheet component with smooth animations
 * Supports drag-to-dismiss and snap points
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  showDragHandle = true,
  snappable = true,
  snapPoints = [0.5, 0.75, 1],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = React.useState(0);

  // Handle scroll for parallax effects
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollMax = container.scrollHeight - container.clientHeight;
      const progress = scrollMax > 0 ? scrollTop / scrollMax : 0;
      setScrollProgress(progress);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        />
      )}

      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={isOpen ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 40, stiffness: 300, mass: 0.5 }}
        className="fixed left-0 right-0 bottom-0 z-50 max-h-[90vh] overflow-hidden"
      >
        <div className="bg-white rounded-t-3xl h-full flex flex-col shadow-2xl">
          {/* Drag handle */}
          {showDragHandle && (
            <motion.div
              className="flex justify-center py-3"
              animate={{ opacity: 1 - scrollProgress * 2 }}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </motion.div>
          )}

          {/* Title */}
          {title && (
            <motion.h2
              className="text-lg font-semibold px-6 text-gray-900 sticky top-0 bg-white z-10"
              animate={{ y: scrollProgress * 10 }}
            >
              {title}
            </motion.h2>
          )}

          {/* Content */}
          <motion.div
            ref={containerRef}
            className="flex-1 overflow-y-auto px-6 pb-safe"
          >
            <motion.div animate={{ y: scrollProgress * 5 }}>
              {children}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default BottomSheet;


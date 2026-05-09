/**
 * Animation Utilities & Preset Configurations
 * Pre-configured animation variants for consistent motion design
 */

import { Variants } from 'framer-motion';

// Spring animation presets
export const ANIMATION_PRESETS = {
  // Smooth spring animation
  smooth: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 0.5,
  },

  // Bouncy spring animation
  bouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
    mass: 0.5,
  },

  // Tight spring animation
  tight: {
    type: 'spring',
    stiffness: 500,
    damping: 40,
    mass: 0.5,
  },

  // Slow spring animation
  slow: {
    type: 'spring',
    stiffness: 200,
    damping: 40,
    mass: 1,
  },

  // Tween animation (linear)
  linear: {
    type: 'tween',
    duration: 0.3,
    ease: 'linear',
  },

  // Tween ease-in-out
  easeInOut: {
    type: 'tween',
    duration: 0.3,
    ease: 'easeInOut',
  },
} as const;

// Common animation variants
export const FADE_IN_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const SCALE_IN_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: ANIMATION_PRESETS.smooth,
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

export const SLIDE_UP_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: ANIMATION_PRESETS.smooth,
  },
  exit: { opacity: 0, y: 30, transition: { duration: 0.2 } },
};

export const SLIDE_DOWN_VARIANTS: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: ANIMATION_PRESETS.smooth,
  },
  exit: { opacity: 0, y: -30, transition: { duration: 0.2 } },
};

export const SLIDE_LEFT_VARIANTS: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: ANIMATION_PRESETS.smooth,
  },
  exit: { opacity: 0, x: 30, transition: { duration: 0.2 } },
};

export const SLIDE_RIGHT_VARIANTS: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: ANIMATION_PRESETS.smooth,
  },
  exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
};

export const ROTATE_IN_VARIANTS: Variants = {
  hidden: { opacity: 0, rotate: -10 },
  visible: {
    opacity: 1,
    rotate: 0,
    transition: ANIMATION_PRESETS.smooth,
  },
  exit: { opacity: 0, rotate: 10, transition: { duration: 0.2 } },
};

// Card animation variants
export const CARD_HOVER_VARIANTS: Variants = {
  rest: { y: 0, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
  hover: {
    y: -4,
    boxShadow: '0 12px 16px rgba(0, 0, 0, 0.15)',
  },
};

export const BUTTON_HOVER_VARIANTS: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// Stagger children animation
export const STAGGER_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const STAGGER_ITEM: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: ANIMATION_PRESETS.smooth,
  },
};

// Pulse animation
export const PULSE_VARIANTS: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: 1,
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      duration: 2,
    },
  },
};

// Shimmer animation
export const SHIMMER_VARIANTS: Variants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      repeat: Infinity,
      repeatType: 'loop',
      duration: 2,
    },
  },
};

// Bounce animation
export const BOUNCE_VARIANTS: Variants = {
  initial: { y: 0 },
  animate: {
    y: -10,
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

// Rotation animation
export const ROTATE_VARIANTS: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: 'linear',
    },
  },
};

// Transition configuration for page changes
export const PAGE_TRANSITION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

// Modal/Dialog variants
export const MODAL_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

// Bottom sheet variants
export const BOTTOM_SHEET_VARIANTS: Variants = {
  hidden: {
    y: '100%',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      mass: 0.5,
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// Tooltip variants
export const TOOLTIP_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -10,
    transition: { duration: 0.15 },
  },
};

// Dropdown/Menu variants
export const DROPDOWN_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: -10,
    pointerEvents: 'none',
  },
  visible: {
    opacity: 1,
    y: 0,
    pointerEvents: 'auto',
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    y: -10,
    pointerEvents: 'none',
    transition: { duration: 0.15 },
  },
};

export default {
  ANIMATION_PRESETS,
  FADE_IN_VARIANTS,
  SCALE_IN_VARIANTS,
  SLIDE_UP_VARIANTS,
  SLIDE_DOWN_VARIANTS,
  SLIDE_LEFT_VARIANTS,
  SLIDE_RIGHT_VARIANTS,
  ROTATE_IN_VARIANTS,
  CARD_HOVER_VARIANTS,
  BUTTON_HOVER_VARIANTS,
  STAGGER_CONTAINER,
  STAGGER_ITEM,
  PULSE_VARIANTS,
  SHIMMER_VARIANTS,
  BOUNCE_VARIANTS,
  ROTATE_VARIANTS,
  PAGE_TRANSITION,
  MODAL_VARIANTS,
  BOTTOM_SHEET_VARIANTS,
  TOOLTIP_VARIANTS,
  DROPDOWN_VARIANTS,
};


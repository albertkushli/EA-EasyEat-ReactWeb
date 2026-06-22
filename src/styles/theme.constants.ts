/**
 * Premium Theme Configuration
 * Centralized theme colors and styling constants
 */

import React from 'react';

export const PREMIUM_THEME = {
  // Primary colors
  colors: {
    primary: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    secondary: {
      main: '#e53935',
      light: '#ef5350',
      dark: '#c62828',
    },
    accent: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1e40af',
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    status: {
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#2196f3',
    },
  },

  // Shadows
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
    md: '0 4px 16px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.15)',
    xl: '0 12px 32px rgba(0, 0, 0, 0.18)',
    elevated: '0 20px 40px rgba(0, 0, 0, 0.25)',
  },

  // Border radius
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    full: '9999px',
  },

  // Typography
  typography: {
    fontFamily: {
      base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"Menlo", "Monaco", "Courier New", monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
  },

  // Transitions
  transitions: {
    fast: '150ms ease-out',
    normal: '250ms ease-out',
    slow: '350ms ease-out',
    slowest: '500ms ease-out',
  },

  // Animations
  animations: {
    button: {
      duration: 200,
      scale: 1.02,
    },
    card: {
      duration: 300,
      stiffness: 400,
      damping: 40,
    },
    modal: {
      duration: 250,
      stiffness: 300,
      damping: 30,
    },
  },

  // Z-index
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    notification: 1600,
  },

  // Breakpoints
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Duration for animations (ms)
  duration: {
    instant: 0,
    fast: 100,
    normal: 200,
    slow: 300,
    slowest: 500,
  },
} as const;

// Export individual theme elements for easier use
export const {
  colors,
  shadows,
  radius,
  typography,
  spacing,
  transitions,
  animations,
  zIndex,
  breakpoints,
  duration,
} = PREMIUM_THEME;

// Helper function to apply theme to component
export const withTheme = (Component: React.ComponentType<Record<string, unknown>>) => {
  return (props: Record<string, unknown>) =>
    React.createElement(Component, { ...props, theme: PREMIUM_THEME });
};

// Helper for responsive breakpoints
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = React.useState('md');

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('xs');
      else if (width < 768) setBreakpoint('sm');
      else if (width < 1024) setBreakpoint('md');
      else if (width < 1280) setBreakpoint('lg');
      else if (width < 1536) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial breakpoint
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint as keyof typeof breakpoints;
};

export default PREMIUM_THEME;

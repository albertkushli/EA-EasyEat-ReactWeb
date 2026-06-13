/**
 * Responsive Design & Mobile Optimization Utilities
 * Provides hooks and utilities for responsive layouts
 */

import { useEffect, useState, useCallback } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Hook to get current breakpoint
 */
export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('md');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < breakpoints.sm) setBreakpoint('xs');
      else if (width < breakpoints.md) setBreakpoint('sm');
      else if (width < breakpoints.lg) setBreakpoint('md');
      else if (width < breakpoints.xl) setBreakpoint('lg');
      else if (width < breakpoints['2xl']) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};

/**
 * Hook to check if current breakpoint is at least the given size
 */
export const useIsAtLeast = (minBreakpoint: Breakpoint): boolean => {
  const currentBreakpoint = useBreakpoint();
  return breakpoints[currentBreakpoint] >= breakpoints[minBreakpoint];
};

/**
 * Hook to check if current breakpoint is at most the given size
 */
export const useIsAtMost = (maxBreakpoint: Breakpoint): boolean => {
  const currentBreakpoint = useBreakpoint();
  return breakpoints[currentBreakpoint] <= breakpoints[maxBreakpoint];
};

/**
 * Hook for viewport size
 */
export const useViewportSize = () => {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
};

/**
 * Hook to detect if device is mobile
 */
export const useIsMobile = (): boolean => {
  return useIsAtMost('sm');
};

/**
 * Hook to detect if device is tablet
 */
export const useIsTablet = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'md' || breakpoint === 'lg';
};

/**
 * Hook to detect if device is desktop
 */
export const useIsDesktop = (): boolean => {
  return useIsAtLeast('xl');
};

/**
 * Hook for device orientation
 */
export const useOrientation = (): 'portrait' | 'landscape' => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
  );

  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return orientation;
};

/**
 * Hook to detect touch device
 */
export const useHasTouchScreen = (): boolean => {
  const [hasTouch, setHasTouch] = useState(
    typeof window !== 'undefined' ? 'ontouchstart' in window : false,
  );

  useEffect(() => {
    setHasTouch('ontouchstart' in window);
  }, []);

  return hasTouch;
};

/**
 * Hook for safe area insets (iPhone notch support)
 */
export const useSafeAreaInsets = () => {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateInsets = () => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);

      setInsets({
        top: getCSSVariablePixels(styles, '--safe-area-inset-top'),
        right: getCSSVariablePixels(styles, '--safe-area-inset-right'),
        bottom: getCSSVariablePixels(styles, '--safe-area-inset-bottom'),
        left: getCSSVariablePixels(styles, '--safe-area-inset-left'),
      });
    };

    updateInsets();
    window.addEventListener('resize', updateInsets);
    return () => window.removeEventListener('resize', updateInsets);
  }, []);

  return insets;
};

/**
 * Helper to get CSS variable pixel value
 */
function getCSSVariablePixels(styles: CSSStyleDeclaration, variableName: string): number {
  const value = styles.getPropertyValue(variableName).trim();
  return parseInt(value, 10) || 0;
}

/**
 * Hook for media query
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handler = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

/**
 * Hook to detect dark mode preference
 */
export const useDarkMode = (): boolean => {
  return useMediaQuery('(prefers-color-scheme: dark)');
};

/**
 * Hook to detect reduced motion preference
 */
export const usePrefersReducedMotion = (): boolean => {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
};

/**
 * Hook to detect hover support
 */
export const useSupportsHover = (): boolean => {
  return useMediaQuery('(hover: hover)');
};

/**
 * Responsive value mapper
 * Returns appropriate value based on current breakpoint
 */
export const useResponsiveValue = <T>(
  values: Partial<Record<Breakpoint, T>>,
  defaultValue: T,
): T => {
  const breakpoint = useBreakpoint();

  // Return the value for the current breakpoint or the largest smaller breakpoint
  for (const bp of Object.keys(values) as Breakpoint[]) {
    if (breakpoints[bp] <= breakpoints[breakpoint]) {
      return values[bp] ?? defaultValue;
    }
  }

  return defaultValue;
};

/**
 * Utility functions for responsive classes
 */

export const conditionalClass = (
  condition: boolean,
  trueClass: string,
  falseClass?: string,
): string => {
  return condition ? trueClass : falseClass || '';
};

export const responsiveClass = (
  breakpoint: Breakpoint,
  classMap: Partial<Record<Breakpoint, string>>,
): string => {
  return classMap[breakpoint] || '';
};

/**
 * Safe area padding utilities
 */
export const safeAreaStyle = (type: 'padding' | 'margin' = 'padding'): React.CSSProperties => {
  const insets = useSafeAreaInsets();

  return {
    [`${type}Top`]: `max(${insets.top}px, 1rem)`,
    [`${type}Right`]: `max(${insets.right}px, 1rem)`,
    [`${type}Bottom`]: `max(${insets.bottom}px, 1rem)`,
    [`${type}Left`]: `max(${insets.left}px, 1rem)`,
  } as React.CSSProperties;
};

/**
 * Breakpoint query builder
 */
export const breakpointQuery = (bp: Breakpoint): string => {
  return `(min-width: ${breakpoints[bp]}px)`;
};

export default {
  useBreakpoint,
  useIsAtLeast,
  useIsAtMost,
  useViewportSize,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useOrientation,
  useHasTouchScreen,
  useSafeAreaInsets,
  useMediaQuery,
  useDarkMode,
  usePrefersReducedMotion,
  useSupportsHover,
  useResponsiveValue,
  conditionalClass,
  responsiveClass,
  safeAreaStyle,
  breakpointQuery,
};

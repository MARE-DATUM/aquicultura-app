import { useState, useEffect, useCallback } from 'react';

interface ResponsiveMapConfig {
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  markerSize: number;
  zoomLevel: number;
  showControls: boolean;
}

interface UseResponsiveMapOptions {
  minHeight?: number;
  maxHeight?: number;
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
  desktopBreakpoint?: number;
}

const useResponsiveMap = (options: UseResponsiveMapOptions = {}) => {
  const {
    minHeight = 300,
    maxHeight = 600,
    mobileBreakpoint = 768,
    tabletBreakpoint = 1024,
    desktopBreakpoint = 1280
  } = options;

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  const [config, setConfig] = useState<ResponsiveMapConfig>({
    height: 400,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    markerSize: 12,
    zoomLevel: 6,
    showControls: true
  });

  // Debounced resize handler
  const handleResize = useCallback(() => {
    const timeoutId = setTimeout(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }, 150);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    const { width, height } = windowSize;
    
    // Figure out device
    const isMobile = width < mobileBreakpoint;
    const isTablet = width >= mobileBreakpoint && width < tabletBreakpoint;
    const isDesktop = width >= desktopBreakpoint;

    // Calculate responsive height
    let calculatedHeight: number;
    
    if (isMobile) {
      // Mobile: use 60% of viewport height, with min/max constraints
      calculatedHeight = Math.max(minHeight, Math.min(maxHeight, height * 0.6));
    } else if (isTablet) {
      // Tablet: use 50% of viewport height
      calculatedHeight = Math.max(minHeight, Math.min(maxHeight, height * 0.5));
    } else {
      // Desktop: use 40% of viewport height
      calculatedHeight = Math.max(minHeight, Math.min(maxHeight, height * 0.4));
    }

    // Calculate marker size based on screen size
    let markerSize: number;
    if (isMobile) {
      markerSize = 10; // Smaller on mobile
    } else if (isTablet) {
      markerSize = 12; // Medium on tablet
    } else {
      markerSize = 14; // Larger on desktop
    }

    // Calculate zoom level based on screen size
    let zoomLevel: number;
    if (isMobile) {
      zoomLevel = 5; // Zoom out more on mobile to show more area
    } else if (isTablet) {
      zoomLevel = 6; // Standard zoom
    } else {
      zoomLevel = 7; // Zoom in more on desktop
    }

    setConfig({
      height: calculatedHeight,
      isMobile,
      isTablet,
      isDesktop,
      markerSize,
      zoomLevel,
      showControls: true
    });
  }, [windowSize, minHeight, maxHeight, mobileBreakpoint, tabletBreakpoint, desktopBreakpoint]);

  // Helper functions
  const getResponsivePadding = () => {
    if (config.isMobile) return 'p-2';
    if (config.isTablet) return 'p-4';
    return 'p-6';
  };

  const getResponsiveMargin = () => {
    if (config.isMobile) return 'm-2';
    if (config.isTablet) return 'm-4';
    return 'm-6';
  };

  const getControlSize = () => {
    if (config.isMobile) return 'h-11 w-11'; // 44px least for touch
    if (config.isTablet) return 'h-10 w-10';
    return 'h-8 w-8';
  };

  const getMarkerRadius = (projectCount: number) => {
    const baseRadius = config.markerSize;
    const multiplier = Math.min(2, Math.max(0.5, projectCount * 0.3));
    return Math.max(6, Math.min(24, baseRadius * multiplier));
  };

  const getMarkerColor = (activeProjects: number) => {
    if (activeProjects === 0) return '#9ca3af'; // Gray
    if (activeProjects <= 2) return '#f59e0b'; // Amber
    if (activeProjects <= 5) return '#3b82f6'; // Blue
    return '#22c55e'; // Green
  };

  return {
    config,
    windowSize,
    getResponsivePadding,
    getResponsiveMargin,
    getControlSize,
    getMarkerRadius,
    getMarkerColor,
    // Utility functions
    isSmallScreen: config.isMobile,
    isMediumScreen: config.isTablet,
    isLargeScreen: config.isDesktop
  };
};

export default useResponsiveMap;

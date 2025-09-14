import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'card' | 'fullscreen';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  margin?: 'none' | 'sm' | 'md' | 'lg';
  height?: 'auto' | 'screen' | 'full' | number;
  width?: 'auto' | 'full' | 'screen' | number;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';
  center?: boolean;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  margin = 'none',
  height = 'auto',
  width = 'full',
  maxWidth = '7xl',
  center = false
}) => {
  const variantClasses = {
    default: 'bg-transparent',
    card: 'bg-white rounded-lg shadow-sm border border-gray-200',
    fullscreen: 'fixed inset-0 z-50 bg-white'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  const marginClasses = {
    none: '',
    sm: 'm-2',
    md: 'm-4',
    lg: 'm-6'
  };

  const heightClasses = {
    auto: '',
    screen: 'h-screen',
    full: 'h-full'
  };

  const widthClasses = {
    auto: 'w-auto',
    full: 'w-full',
    screen: 'w-screen'
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  const containerStyle = typeof height === 'number' ? { height: `${height}px` } : {};
  const containerWidth = typeof width === 'number' ? { width: `${width}px` } : {};

  return (
    <div
      className={cn(
        // Base classes
        'relative',
        // Variant
        variantClasses[variant],
        // Padding
        paddingClasses[padding],
        // Margin
        marginClasses[margin],
        // Height
        heightClasses[height],
        // Width
        widthClasses[width],
        // Max width
        maxWidthClasses[maxWidth],
        // Center
        center && 'mx-auto',
        // Custom className
        className
      )}
      style={{
        ...containerStyle,
        ...containerWidth
      }}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;

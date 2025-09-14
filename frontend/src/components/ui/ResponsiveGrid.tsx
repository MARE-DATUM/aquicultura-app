import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = {
    default: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5
  },
  gap = 'md'
}) => {
  const gapVariants = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const getGridCols = () => {
    const classes = [];
    
    if (cols.default) {
      classes.push(`grid-cols-${cols.default}`);
    }
    if (cols.sm) {
      classes.push(`sm:grid-cols-${cols.sm}`);
    }
    if (cols.md) {
      classes.push(`md:grid-cols-${cols.md}`);
    }
    if (cols.lg) {
      classes.push(`lg:grid-cols-${cols.lg}`);
    }
    if (cols.xl) {
      classes.push(`xl:grid-cols-${cols.xl}`);
    }
    if (cols['2xl']) {
      classes.push(`2xl:grid-cols-${cols['2xl']}`);
    }

    return classes.join(' ');
  };

  return (
    <div 
      className={cn(
        'grid',
        getGridCols(),
        gapVariants[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;

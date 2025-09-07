import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-lg';
      case 'text':
      default:
        return 'rounded';
    }
  };
  
  const getDefaultDimensions = () => {
    switch (variant) {
      case 'circular':
        return { width: '40px', height: '40px' };
      case 'rectangular':
        return { width: '100%', height: '200px' };
      case 'text':
      default:
        return { width: '100%', height: '20px' };
    }
  };
  
  const defaults = getDefaultDimensions();
  const style = {
    width: width || defaults.width,
    height: height || defaults.height
  };
  
  if (variant === 'text' && lines > 1) {
    return (
      <div className={className}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getVariantClasses()} ${
              index < lines - 1 ? 'mb-2' : ''
            } ${index === lines - 1 ? 'w-3/4' : ''}`}
            style={{ height: style.height }}
          />
        ))}
      </div>
    );
  }
  
  return (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${className}`}
      style={style}
    />
  );
};

// Componentes pré-configurados para casos comuns
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" className="mt-2" />
      </div>
    </div>
    <Skeleton variant="rectangular" height={200} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; className?: string }> = ({ 
  rows = 5, 
  className = '' 
}) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    <div className="p-6">
      <Skeleton variant="text" width="30%" height={24} className="mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton variant="circular" width={32} height={32} />
            <div className="flex-1 grid grid-cols-4 gap-4">
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="60%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Skeleton;

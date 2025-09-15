import React from 'react';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CustomButton as Button } from './ui';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

/**
 * Spinner de loading otimizado
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(({
  size = 'md',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
        {text && (
          <p className="text-sm text-gray-600">{text}</p>
        )}
      </div>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

interface LoadingCardProps {
  title?: string;
  description?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

/**
 * Card de loading para páginas
 */
export const LoadingCard: React.FC<LoadingCardProps> = React.memo(({
  title = 'Carregando...',
  description = 'Aguarde enquanto carregamos os dados',
  showRetry = false,
  onRetry
}) => {
  return (
    <Card className="p-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600">
            {description}
          </p>
        </div>
        {showRetry && onRetry && (
          <Button
            variant="outline"
            onClick={onRetry}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Tentar Novamente
          </Button>
        )}
      </div>
    </Card>
  );
});

LoadingCard.displayName = 'LoadingCard';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

/**
 * Skeleton loading otimizado
 */
export const Skeleton: React.FC<SkeletonProps> = React.memo(({
  className = '',
  lines = 1
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded mb-2"
          style={{
            width: `${Math.random() * 40 + 60}%`
          }}
        />
      ))}
    </div>
  );
});

Skeleton.displayName = 'Skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

/**
 * Skeleton para tabelas
 */
export const TableSkeleton: React.FC<TableSkeletonProps> = React.memo(({
  rows = 5,
  columns = 4
}) => {
  return (
    <div className="overflow-hidden">
      <div className="animate-pulse">
        {/* Header */}
        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" />
          ))}
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 mb-2"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-3 bg-gray-100 rounded"
                style={{
                  width: `${Math.random() * 30 + 70}%`
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

TableSkeleton.displayName = 'TableSkeleton';

interface ChartSkeletonProps {
  height?: number;
  type?: 'bar' | 'line' | 'pie';
}

/**
 * Skeleton para gráficos
 */
export const ChartSkeleton: React.FC<ChartSkeletonProps> = React.memo(({
  height = 300,
  type = 'bar'
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'bar':
        return (
          <div className="flex items-end space-x-2 h-full">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-t"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                  width: '12%'
                }}
              />
            ))}
          </div>
        );
      case 'line':
        return (
          <div className="relative h-full">
            <svg className="w-full h-full">
              <path
                d="M 0,80 Q 50,20 100,40 T 200,60 T 300,30 T 400,50"
                stroke="#e5e7eb"
                strokeWidth="3"
                fill="none"
                className="animate-pulse"
              />
            </svg>
          </div>
        );
      case 'pie':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse" />
          </div>
        );
      default:
        return <div className="h-full bg-gray-200 rounded animate-pulse" />;
    }
  };

  return (
    <div
      className="w-full bg-gray-50 rounded-lg p-4"
      style={{ height: `${height}px` }}
    >
      {renderSkeleton()}
    </div>
  );
});

ChartSkeleton.displayName = 'ChartSkeleton';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * Estado vazio otimizado
 */
export const EmptyState: React.FC<EmptyStateProps> = React.memo(({
  icon,
  title,
  description,
  action
}) => {
  return (
    <div className="text-center py-12">
      <div className="flex flex-col items-center space-y-4">
        {icon && (
          <div className="p-3 bg-gray-100 rounded-full">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-gray-600">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';



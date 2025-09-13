import React, { Suspense, lazy, ComponentType } from 'react';
import { Skeleton } from './ui';

interface LazyPageProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Componente para lazy loading de páginas com fallback otimizado
 */
const LazyPage: React.FC<LazyPageProps> = ({ 
  fallback = <PageSkeleton />, 
  children 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

/**
 * Skeleton otimizado para loading de páginas
 */
const PageSkeleton: React.FC = React.memo(() => (
  <div className="p-6 space-y-6">
    {/* Header skeleton */}
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>

    {/* Stats cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
      ))}
    </div>

    {/* Charts skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      ))}
    </div>
  </div>
));

PageSkeleton.displayName = 'PageSkeleton';

/**
 * HOC para criar componentes lazy com fallback otimizado
 */
export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return React.memo((props: P) => (
    <LazyPage fallback={fallback}>
      <LazyComponent {...props} />
    </LazyPage>
  ));
};

/**
 * Hook para lazy loading de componentes
 */
export const useLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = React.useMemo(
    () => lazy(importFn),
    [importFn]
  );

  return React.useMemo(
    () => (props: React.ComponentProps<T>) => (
      <LazyPage fallback={fallback}>
        <LazyComponent {...props} />
      </LazyPage>
    ),
    [LazyComponent, fallback]
  );
};

export default LazyPage;



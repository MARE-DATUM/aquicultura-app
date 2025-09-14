import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './Card';
import { cn } from '@/lib/utils';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'outline' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className,
  title,
  description,
  actions,
  variant = 'default',
  size = 'md'
}) => {
  const cardVariants = {
    default: 'bg-white border border-gray-200 shadow-sm hover:shadow-md',
    outline: 'bg-white border-2 border-gray-300 shadow-none hover:shadow-sm',
    elevated: 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
  };

  const sizeVariants = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <Card 
      className={cn(
        'transition-all duration-200 hover:scale-[1.02]',
        cardVariants[variant],
        sizeVariants[size],
        className
      )}
    >
      {(title || description || actions) && (
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="min-w-0 flex-1">
              {title && (
                <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription className="text-sm text-gray-600 mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
            {actions && (
              <div className="flex-shrink-0 flex flex-wrap items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(
        title || description || actions ? 'pt-0' : ''
      )}>
        {children}
      </CardContent>
    </Card>
  );
};

export default ResponsiveCard;

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const CardComponent: React.FC<CardProps> = React.memo(({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const baseClasses = 'gradient-card rounded-3xl border border-white border-opacity-20 backdrop-blur-sm';
  const hoverClasses = hover ? 'hover-lift hover:shadow-modern-lg transition-all duration-300' : '';
  const classes = `${baseClasses} ${paddingClasses[padding]} ${hoverClasses} ${className}`;
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
});

const CardHeader: React.FC<CardHeaderProps> = React.memo(({ children, className = '' }) => {
  return (
    <div className={`border-b border-gray-200 pb-4 mb-6 ${className}`}>
      {children}
    </div>
  );
});

const CardContent: React.FC<CardContentProps> = React.memo(({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
});

const CardFooter: React.FC<CardFooterProps> = React.memo(({ children, className = '' }) => {
  return (
    <div className={`border-t border-gray-200 pt-4 mt-6 ${className}`}>
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

// Create the compound component
const Card = Object.assign(CardComponent, {
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter
});

export default Card;

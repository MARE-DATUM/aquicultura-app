import React from 'react';
import Breadcrumbs from './Breadcrumbs';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs = [],
  actions,
  className = ''
}) => {
  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="px-6 py-4">
        {breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} className="mb-4" />
        )}
        
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-gray-600 max-w-2xl">
                {description}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="ml-4 flex-shrink-0 flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;

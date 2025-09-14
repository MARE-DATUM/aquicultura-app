import React, { ReactNode, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  submitText?: string;
  cancelText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  onSubmit,
  isLoading = false,
  error = null,
  submitText = 'Salvar',
  cancelText = 'Cancelar',
  size = 'md'
}) => {
  // Prevenir scroll da página de fundo quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function para restaurar scroll quando componente desmonta
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(e);
  };

  // Handler para capturar scroll da roda do mouse
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Encontrar a área de scroll do modal
    const scrollableArea = e.currentTarget.querySelector('.overflow-y-auto') as HTMLElement;
    if (scrollableArea) {
      // Aplicar o scroll na área correta
      const delta = e.deltaY;
      scrollableArea.scrollTop += delta;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-2 sm:p-4 z-50"
      onWheel={handleWheel}
    >
      <Card className={`w-full ${sizeClasses[size]} max-h-[95vh] sm:max-h-[90vh] overflow-hidden my-4 sm:my-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between p-4 sm:p-6 border-b">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{title}</h2>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 hover:bg-gray-100 transition-colors flex-shrink-0 ml-2"
              disabled={isLoading}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              {children}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  submitText
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

// Componente auxiliar para seções do formulário
export const FormSection: React.FC<{
  title?: string;
  children: ReactNode;
  className?: string;
}> = ({ title, children, className = '' }) => {
  return (
    <div className={`mb-6 ${className}`}>
      {title && (
        <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

// Componente auxiliar para grupos de campos
export const FormGroup: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
  helpText?: string;
}> = ({ label, required = false, error, children, className = '', helpText }) => {
  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

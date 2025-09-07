import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  required,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-900"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <div className="text-white text-opacity-70 group-focus-within:text-white transition-colors duration-200">
              {icon}
            </div>
          </div>
        )}
        
        <input
          id={inputId}
          className={`
            block w-full rounded-2xl glass border border-white border-opacity-30 px-4 py-4 text-white 
            placeholder-white placeholder-opacity-60 focus:border-white focus:border-opacity-50 focus:outline-none focus:ring-2 
            focus:ring-white focus:ring-opacity-30 transition-all duration-300 backdrop-blur-sm
            hover:border-opacity-40 hover:shadow-modern
            ${icon ? 'pl-12' : ''}
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}
            ${className}
          `}
          {...props}
        />
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;

import React from 'react';
import { Input } from './Input';

interface CustomInputProps extends React.ComponentProps<"input"> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  icon,
  error,
  className,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <Input
          className={`${icon ? 'pl-10' : ''} ${error ? 'border-red-300' : ''} ${className || ''}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default CustomInput;


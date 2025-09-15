import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './Select';

interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  value?: string | number;
  onChange?: (e: { target: { value: string } }) => void;
  onValueChange?: (value: string) => void;
  options?: Option[];
  placeholder?: string;
  className?: string;
  name?: string;
  error?: string;
  children?: React.ReactNode;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  onValueChange,
  options = [],
  placeholder,
  className,
  name,
  error,
  children,
  ...props
}) => {
  const handleValueChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    }
    if (onChange) {
      onChange({ target: { value: newValue } });
    }
  };

  const stringValue = value?.toString() || '';

  return (
    <div className={className}>
      <Select value={stringValue} onValueChange={handleValueChange} {...props}>
        <SelectTrigger className={error ? 'border-red-300' : ''}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children || options.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default CustomSelect;


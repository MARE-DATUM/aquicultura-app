import React from 'react';
import { Textarea } from './TextArea';

interface CustomTextAreaProps extends React.ComponentProps<"textarea"> {
  error?: string;
}

export const CustomTextArea: React.FC<CustomTextAreaProps> = ({
  error,
  className,
  ...props
}) => {
  return (
    <div className="space-y-2">
      <Textarea
        className={`${error ? 'border-red-300' : ''} ${className || ''}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default CustomTextArea;


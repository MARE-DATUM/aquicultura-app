import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  className = '',
  disabled = false,
  required = false,
  rows = 4,
  ...props
}, ref) => {
  const baseClasses = `
    w-full px-3 py-2
    bg-white border rounded-lg
    text-gray-900 text-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    transition-all duration-200
    resize-vertical
  `;

  const borderClasses = error
    ? 'border-red-300 focus:ring-red-500'
    : 'border-gray-300 hover:border-gray-400';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        className={`${baseClasses} ${borderClasses} ${className}`}
        disabled={disabled}
        required={required}
        rows={rows}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;

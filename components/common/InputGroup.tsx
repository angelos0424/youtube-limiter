import React from 'react';

interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  hideLabel?: boolean;
}

export const InputGroup: React.FC<InputGroupProps> = ({ label, id, hideLabel = false, ...props }) => {
  return (
    <div>
      {!hideLabel && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
        </label>
      )}
      <input
        id={id}
        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50"
        {...props}
      />
    </div>
  );
};

import React from 'react';
import { UseFormRegister, FieldError, Path, RegisterOptions, FieldValues } from 'react-hook-form';

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  label: string;
  options: Option[];
  register: UseFormRegister<TFormValues>;
  rules?: RegisterOptions<TFormValues, Path<TFormValues>>;
  error?: FieldError;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export const FormSelect = <TFormValues extends FieldValues>({
  name,
  label,
  options,
  register,
  rules,
  error,
  required = false,
  className = '',
  placeholder,
}: FormSelectProps<TFormValues>): JSX.Element => {
  return (
    <div className={`mb-4 ${className}`}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        className={`w-full px-3 py-2 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white`}
        {...register(name, rules)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
}; 
import React from 'react';
import { UseFormRegister, FieldError, Path, RegisterOptions, FieldValues } from 'react-hook-form';

interface FormCheckboxProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  label: string;
  register: UseFormRegister<TFormValues>;
  rules?: RegisterOptions<TFormValues, Path<TFormValues>>;
  error?: FieldError;
  className?: string;
}

export const FormCheckbox = <TFormValues extends FieldValues>({
  name,
  label,
  register,
  rules,
  error,
  className = '',
}: FormCheckboxProps<TFormValues>): JSX.Element => {
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center">
        <input
          id={name}
          type="checkbox"
          className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${
            error ? 'border-red-500' : ''
          }`}
          {...register(name, rules)}
        />
        <label
          htmlFor={name}
          className="ml-2 block text-sm text-gray-900"
        >
          {label}
        </label>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
}; 
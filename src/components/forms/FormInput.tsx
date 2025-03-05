import React, { ChangeEvent } from 'react';
import { UseFormRegister, FieldError, Path, RegisterOptions, FieldValues } from 'react-hook-form';

interface FormInputProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  label: string;
  register: UseFormRegister<TFormValues>;
  rules?: RegisterOptions<TFormValues, Path<TFormValues>>;
  error?: FieldError;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const FormInput = <TFormValues extends FieldValues>({
  name,
  label,
  register,
  rules,
  error,
  type = 'text',
  placeholder,
  required = false,
  className = '',
  onChange,
}: FormInputProps<TFormValues>): JSX.Element => {
  // Create a handler that calls both the register's onChange and our custom onChange
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { onChange: registerOnChange } = register(name, rules);
    // Call register's onChange
    registerOnChange(e);
    // Call custom onChange if provided
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
        {...register(name, rules)}
        onChange={onChange ? handleChange : undefined}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
}; 
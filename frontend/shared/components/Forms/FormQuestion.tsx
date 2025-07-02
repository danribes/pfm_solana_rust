// Task 7.2.2: Community Join Request Interface
// Form question component for rendering different input types

'use client';

import React from 'react';
import {
  FormQuestion as FormQuestionType,
  ValidationError
} from '../../types/joinRequest';

interface FormQuestionProps {
  question: FormQuestionType;
  value?: any;
  onChange: (value: any) => void;
  errors?: ValidationError[];
  disabled?: boolean;
}

export default function FormQuestion({
  question,
  value,
  onChange,
  errors = [],
  disabled = false
}: FormQuestionProps) {
  const hasErrors = errors.length > 0;

  const renderInput = () => {
    const baseInputClass = `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      hasErrors ? 'border-red-300' : 'border-gray-300'
    } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`;

    switch (question.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <input
            type={question.type === 'text' ? 'text' : question.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            disabled={disabled}
            className={baseInputClass}
            maxLength={question.validation.maxLength}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            disabled={disabled}
            rows={4}
            className={baseInputClass}
            maxLength={question.validation.maxLength}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            disabled={disabled}
            className={baseInputClass}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseInputClass}
          />
        );

      case 'single_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option.id} className="flex items-center">
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className={disabled ? 'text-gray-400' : 'text-gray-700'}>
                  {option.label}
                </span>
                {option.description && (
                  <span className="ml-2 text-sm text-gray-500">
                    {option.description}
                  </span>
                )}
              </label>
            ))}
          </div>
        );

      case 'multiple_choice':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option.id} className="flex items-center">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedValues, option.value]);
                    } else {
                      onChange(selectedValues.filter((v: string) => v !== option.value));
                    }
                  }}
                  disabled={disabled}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className={disabled ? 'text-gray-400' : 'text-gray-700'}>
                  {option.label}
                </span>
                {option.description && (
                  <span className="ml-2 text-sm text-gray-500">
                    {option.description}
                  </span>
                )}
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseInputClass}
          >
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'file_upload':
        return (
          <div className="space-y-2">
            <input
              type="file"
              multiple={question.validation.maxFiles ? question.validation.maxFiles > 1 : false}
              accept={question.validation.fileTypes?.join(',')}
              onChange={(e) => {
                // For now, just pass the file list
                // In a real implementation, you would upload files and get URLs
                const files = Array.from(e.target.files || []);
                onChange(files);
              }}
              disabled={disabled}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {question.validation.fileTypes && (
              <p className="text-xs text-gray-500">
                Allowed types: {question.validation.fileTypes.join(', ')}
              </p>
            )}
            {question.validation.maxFileSize && (
              <p className="text-xs text-gray-500">
                Max size: {Math.round(question.validation.maxFileSize / 1024 / 1024)}MB per file
              </p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className={disabled ? 'text-gray-400' : 'text-gray-700'}>
              {question.title}
            </span>
          </label>
        );

      case 'rating':
        const rating = Number(value) || 0;
        const maxRating = 5;
        return (
          <div className="flex space-x-1">
            {[...Array(maxRating)].map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onChange(index + 1)}
                disabled={disabled}
                className={`w-8 h-8 rounded ${
                  index < rating
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                } ${disabled ? 'cursor-not-allowed' : 'hover:text-yellow-400'}`}
              >
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={value || 0}
              onChange={(e) => onChange(Number(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>0</span>
              <span className="font-medium">{value || 0}</span>
              <span>100</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-gray-500 italic">
            Unsupported question type: {question.type}
          </div>
        );
    }
  };

  return (
    <div className="form-question">
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-900">
          {question.title}
          {question.isRequired && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
        {question.description && (
          <p className="mt-1 text-sm text-gray-600">{question.description}</p>
        )}
      </div>

      <div className="mb-2">
        {renderInput()}
      </div>

      {hasErrors && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error.message}
            </p>
          ))}
        </div>
      )}

      {question.validation.maxLength && question.type === 'textarea' && (
        <div className="mt-1 text-xs text-gray-500 text-right">
          {(value?.length || 0)} / {question.validation.maxLength} characters
        </div>
      )}
    </div>
  );
} 
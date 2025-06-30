// Question Type Selector Component
import React from 'react';
import { QuestionType } from '../../../admin/types/campaign';

interface QuestionTypeSelectorProps {
  value: QuestionType;
  onChange: (type: QuestionType) => void;
  disabled?: boolean;
}

export const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const questionTypes = [
    {
      value: QuestionType.SINGLE_CHOICE,
      label: 'Single Choice',
      description: 'Participants can select only one option',
      icon: '◉'
    },
    {
      value: QuestionType.MULTIPLE_CHOICE,
      label: 'Multiple Choice',
      description: 'Participants can select multiple options',
      icon: '☑️'
    },
    {
      value: QuestionType.YES_NO,
      label: 'Yes/No',
      description: 'Simple yes or no question',
      icon: '✓'
    },
    {
      value: QuestionType.TEXT_INPUT,
      label: 'Text Input',
      description: 'Free text response',
      icon: '✏️'
    }
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Question Type
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {questionTypes.map((type) => (
          <div
            key={type.value}
            className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
              value === type.value
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                : 'border-gray-300 bg-white hover:border-gray-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onChange(type.value)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="questionType"
                value={type.value}
                checked={value === type.value}
                onChange={() => onChange(type.value)}
                disabled={disabled}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{type.icon}</span>
                  <span className="font-medium text-gray-900">
                    {type.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {type.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from "react";
import { VotingQuestion, VoteType } from "../../types/voting";

interface VoteOptionsProps {
  question: VotingQuestion;
  selectedOptions: string[];
  onOptionSelect: (optionId: string) => void;
  disabled?: boolean;
  showResults?: boolean;
}

const VoteOptions: React.FC<VoteOptionsProps> = ({
  question,
  selectedOptions,
  onOptionSelect,
  disabled = false,
  showResults = false
}) => {
  const isMultipleChoice = question.type === VoteType.MULTIPLE_CHOICE;

  const handleOptionClick = (optionId: string) => {
    if (disabled || showResults) return;
    onOptionSelect(optionId);
  };

  return (
    <div className="space-y-3">
      {question.options.map((option) => {
        const isSelected = selectedOptions.includes(option.id);
        
        return (
          <div key={option.id} className="cursor-pointer" onClick={() => handleOptionClick(option.id)}>
            <div className={`p-4 border rounded-lg ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
              <div className="flex items-start space-x-3">
                <input
                  type={isMultipleChoice ? "checkbox" : "radio"}
                  name={`voting-option-${question.id}`}
                  value={option.id}
                  checked={isSelected}
                  onChange={() => handleOptionClick(option.id)}
                  disabled={disabled}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.text}</div>
                  {option.description && (
                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VoteOptions;

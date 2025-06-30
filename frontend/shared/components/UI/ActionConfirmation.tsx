// Action Confirmation Component for Critical Actions
import React from 'react';

interface ActionConfirmationProps {
  isOpen: boolean;
  title: string;
  message: string;
  actionType: 'approve' | 'reject' | 'delete' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  requireInput?: boolean;
  inputPlaceholder?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
}

export const ActionConfirmation: React.FC<ActionConfirmationProps> = ({
  isOpen,
  title,
  message,
  actionType,
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  requireInput = false,
  inputPlaceholder = 'Enter reason...',
  inputValue = '',
  onInputChange
}) => {
  if (!isOpen) return null;

  const getActionConfig = () => {
    const configs = {
      approve: {
        icon: '✅',
        confirmText: 'Approve',
        buttonClass: 'bg-green-600 hover:bg-green-700 text-white'
      },
      reject: {
        icon: '❌',
        confirmText: 'Reject',
        buttonClass: 'bg-red-600 hover:bg-red-700 text-white'
      },
      delete: {
        icon: '🗑️',
        confirmText: 'Delete',
        buttonClass: 'bg-red-600 hover:bg-red-700 text-white'
      },
      warning: {
        icon: '⚠️',
        confirmText: 'Continue',
        buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white'
      },
      info: {
        icon: 'ℹ️',
        confirmText: 'OK',
        buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white'
      }
    };
    return configs[actionType];
  };

  const config = getActionConfig();
  const finalConfirmText = confirmText || config.confirmText;
  const canConfirm = !requireInput || (inputValue?.trim().length > 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">{config.icon}</span>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Input Field (if required) */}
        {requireInput && (
          <div className="mb-6">
            <textarea
              value={inputValue}
              onChange={(e) => onInputChange?.(e.target.value)}
              placeholder={inputPlaceholder}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            disabled={loading || !canConfirm}
            className={`px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed ${config.buttonClass}`}
          >
            {loading ? 'Processing...' : finalConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

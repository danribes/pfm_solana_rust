// Message Composer Component for Custom Messages
import React, { useState } from 'react';

interface MessageComposerProps {
  placeholder?: string;
  maxLength?: number;
  showCharCount?: boolean;
  templates?: MessageTemplate[];
  onSend: (message: string) => void;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  variables?: string[];
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  placeholder = 'Write your message...',
  maxLength = 500,
  showCharCount = true,
  templates = [],
  onSend,
  onCancel,
  loading = false,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setMessage(template.content);
      setSelectedTemplate(templateId);
    }
  };

  const handleSend = () => {
    if (message.trim() && !loading) {
      onSend(message.trim());
      setMessage('');
      setSelectedTemplate('');
    }
  };

  const handleCancel = () => {
    setMessage('');
    setSelectedTemplate('');
    onCancel?.();
  };

  const isValid = message.trim().length > 0 && message.length <= maxLength;

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4">
      {/* Template Selector */}
      {templates.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Use Template (Optional)
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <option value="">Select a template...</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Message Input */}
      <div className="mb-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={4}
          disabled={disabled || loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        {/* Character Count */}
        {showCharCount && (
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-gray-500">
              {message.length > maxLength * 0.8 && (
                <span className={message.length > maxLength ? 'text-red-500' : 'text-yellow-500'}>
                  Character limit: {message.length}/{maxLength}
                </span>
              )}
            </div>
            <div className={`text-xs ${
              message.length > maxLength ? 'text-red-500' : 
              message.length > maxLength * 0.8 ? 'text-yellow-500' : 'text-gray-500'
            }`}>
              {message.length}/{maxLength}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        
        <button
          onClick={handleSend}
          disabled={!isValid || loading || disabled}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </div>

      {/* Preview */}
      {message && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
          <div className="text-sm text-gray-600 whitespace-pre-wrap">
            {message}
          </div>
        </div>
      )}
    </div>
  );
};

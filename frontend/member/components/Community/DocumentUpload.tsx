import React, { useState, useRef, useCallback } from 'react';

interface DocumentUploadProps {
  onFileSelect: (file: File | null) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in bytes
  currentFile?: File | null;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
}

interface UploadedFile {
  file: File;
  preview?: string;
  progress?: number;
  error?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onFileSelect,
  acceptedFileTypes = ['.pdf', '.doc', '.docx', '.txt'],
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  currentFile,
  placeholder = 'Upload a document',
  error,
  required = false,
  disabled = false,
  multiple = false
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size must be less than ${Math.round(maxFileSize / (1024 * 1024))}MB`;
    }

    // Check file type
    if (acceptedFileTypes.length > 0) {
      const fileName = file.name.toLowerCase();
      const hasValidExtension = acceptedFileTypes.some(type => 
        fileName.endsWith(type.toLowerCase().replace('.', ''))
      );
      if (!hasValidExtension) {
        return `File must be one of: ${acceptedFileTypes.join(', ')}`;
      }
    }

    return null;
  }, [acceptedFileTypes, maxFileSize]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0]; // For now, handle single file
    const validationError = validateFile(file);

    if (validationError) {
      onFileSelect(null);
      // You might want to show this error in the parent component
      console.error('File validation error:', validationError);
      return;
    }

    onFileSelect(file);

    // Create preview for certain file types
    const newUploadedFile: UploadedFile = {
      file,
      progress: 0
    };

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        newUploadedFile.preview = e.target?.result as string;
        setUploadedFiles([newUploadedFile]);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadedFiles([newUploadedFile]);
    }

    // Simulate upload progress (in real app, this would be actual upload)
    simulateUploadProgress(file.name);
  }, [validateFile, onFileSelect]);

  const simulateUploadProgress = (fileName: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      
      setUploadProgress(prev => ({ ...prev, [fileName]: progress }));
      
      if (progress === 100) {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file.name === fileName 
              ? { ...f, progress: 100 }
              : f
          )
        );
      }
    }, 200);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [disabled, handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback((fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== fileToRemove));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileToRemove.name];
      return newProgress;
    });
    onFileSelect(null);
  }, [onFileSelect]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return (
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'doc':
      case 'docx':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
          multiple={multiple}
          className="hidden"
        />

        <div className="space-y-2">
          <svg 
            className={`mx-auto h-12 w-12 ${dragOver ? 'text-blue-400' : 'text-gray-400'}`} 
            stroke="currentColor" 
            fill="none" 
            viewBox="0 0 48 48"
          >
            <path 
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
              strokeWidth={2} 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
          
          <div>
            <p className="text-sm text-gray-600">
              {dragOver ? 'Drop your file here' : placeholder}
              {required && <span className="text-red-500 ml-1">*</span>}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {acceptedFileTypes.join(', ')} up to {Math.round(maxFileSize / (1024 * 1024))}MB
            </p>
          </div>

          {!disabled && (
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Choose File
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
          {uploadedFiles.map((uploadedFile, index) => (
            <div 
              key={`${uploadedFile.file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(uploadedFile.file.name)}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Progress Bar */}
                {uploadProgress[uploadedFile.file.name] !== undefined && 
                 uploadProgress[uploadedFile.file.name] < 100 && (
                  <div className="w-20">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress[uploadedFile.file.name]}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      {Math.round(uploadProgress[uploadedFile.file.name])}%
                    </p>
                  </div>
                )}

                {/* Success/Remove Button */}
                {uploadProgress[uploadedFile.file.name] === 100 && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <button
                      onClick={() => handleRemoveFile(uploadedFile.file)}
                      className="text-red-500 hover:text-red-700"
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current File Display (for controlled component) */}
      {currentFile && uploadedFiles.length === 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
          <div className="flex items-center space-x-3">
            {getFileIcon(currentFile.name)}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {currentFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(currentFile.size)}
              </p>
            </div>
          </div>
          <button
            onClick={() => onFileSelect(null)}
            className="text-red-500 hover:text-red-700"
            type="button"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
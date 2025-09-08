// Excel Analysis Service for Admin Portal
import axios from 'axios';

// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const EXCEL_ENDPOINT = `${API_BASE_URL}/excel`;

// Create axios instance with default configuration
const excelApi = axios.create({
  baseURL: EXCEL_ENDPOINT,
  timeout: 30000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Request interceptor for authentication
excelApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    config.headers['X-Client-Type'] = 'admin-portal';
    config.headers['X-Container-ID'] = process.env.CONTAINER_ID || 'admin-frontend';
    
    return config;
  },
  (error) => {
    console.error('Excel API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
excelApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Excel API Response Error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to Excel service. Please check connectivity.');
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      window.location.href = '/admin/login';
    }
    
    return Promise.reject(error);
  }
);

// Types for Excel analysis
export interface ExcelAnalysisResult {
  file_info: {
    filename: string;
    original_name: string;
    analyzed_at: string;
    file_format: string;
    total_sheets: number;
    size_bytes: number;
    mime_type: string;
  };
  structure: {
    sheets: SheetAnalysis[];
    relationships: Relationship[] | null;
    data_quality: DataQuality;
  };
  summary: {
    total_rows: number;
    total_columns: number;
    total_cells: number;
    sheets_with_data: number;
    tabular_sheets: number;
    total_formulas: number;
    data_types_found: string[];
    average_data_quality: number;
  };
}

export interface SheetAnalysis {
  name: string;
  dimensions: {
    rows: number;
    columns: number;
    used_range: string;
  };
  content: {
    has_data: boolean;
    estimated_header_row: number | null;
    data_start_row: number | null;
    columns: ColumnAnalysis[];
  };
  structure_analysis: {
    is_tabular: boolean;
    table_regions: any[];
    merged_cells: any[];
    formulas: Formula[];
  };
  data_quality: DataQuality;
  sample_data?: any[][];
}

export interface ColumnAnalysis {
  index: number;
  letter: string;
  header: string;
  data_type: {
    primary: string;
    confidence: number;
    distribution: Record<string, number>;
  };
  statistics: {
    total_count: number;
    non_empty_count: number;
    empty_count: number;
    unique_count: number;
    completeness_ratio: number;
    numeric_stats?: {
      min: number;
      max: number;
      mean: number;
      median: number;
    };
  };
  quality: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
}

export interface Formula {
  address: string;
  formula: string;
  value: any;
  type: string;
}

export interface Relationship {
  type: string;
  confidence: number;
  from_sheet: string;
  from_column: string;
  to_sheet: string;
  to_column: string;
  reason: string;
}

export interface DataQuality {
  overall_score: number;
  issues: string[];
  recommendations: string[];
  sheet_scores?: Record<string, any>;
}

export interface ImportResult {
  sheet_name: string;
  total_sheets: number;
  available_sheets: string[];
  row_count: number;
  column_count: number;
  has_headers: boolean;
  data: any[];
  imported_at: string;
  file_info: {
    original_name: string;
    size_bytes: number;
    mime_type: string;
  };
}

export interface SupportedFormat {
  extension: string;
  description: string;
  mime_types: string[];
}

export interface ExcelAnalysisOptions {
  includeDataSample?: boolean;
  maxSampleRows?: number;
  analyzeFormulas?: boolean;
  detectRelationships?: boolean;
}

export interface ExcelImportOptions {
  sheetName?: string;
  hasHeaders?: boolean;
  skipRows?: number;
  maxRows?: number;
}

export class ExcelService {
  /**
   * Analyze uploaded Excel file structure
   */
  static async analyzeFile(
    file: File,
    options: ExcelAnalysisOptions = {}
  ): Promise<ExcelAnalysisResult> {
    try {
      const formData = new FormData();
      formData.append('excelFile', file);
      
      // Add analysis options as form fields
      if (options.includeDataSample !== undefined) {
        formData.append('includeDataSample', options.includeDataSample.toString());
      }
      if (options.maxSampleRows !== undefined) {
        formData.append('maxSampleRows', options.maxSampleRows.toString());
      }
      if (options.analyzeFormulas !== undefined) {
        formData.append('analyzeFormulas', options.analyzeFormulas.toString());
      }
      if (options.detectRelationships !== undefined) {
        formData.append('detectRelationships', options.detectRelationships.toString());
      }
      
      const response = await excelApi.post('/analyze', formData);
      return response.data.analysis;
    } catch (error) {
      console.error('Error analyzing Excel file:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Import data from Excel file
   */
  static async importFile(
    file: File,
    options: ExcelImportOptions = {}
  ): Promise<ImportResult> {
    try {
      const formData = new FormData();
      formData.append('excelFile', file);
      
      // Add import options as form fields
      if (options.sheetName !== undefined) {
        formData.append('sheetName', options.sheetName);
      }
      if (options.hasHeaders !== undefined) {
        formData.append('hasHeaders', options.hasHeaders.toString());
      }
      if (options.skipRows !== undefined) {
        formData.append('skipRows', options.skipRows.toString());
      }
      if (options.maxRows !== undefined) {
        formData.append('maxRows', options.maxRows.toString());
      }
      
      const response = await excelApi.post('/import', formData);
      return response.data.import_result;
    } catch (error) {
      console.error('Error importing Excel file:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Get supported file formats
   */
  static async getSupportedFormats(): Promise<SupportedFormat[]> {
    try {
      const response = await excelApi.get('/formats');
      return response.data.supported_formats;
    } catch (error) {
      console.error('Error getting supported formats:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Export analysis results to Excel format
   */
  static async exportAnalysis(
    analysisData: ExcelAnalysisResult,
    filename?: string
  ): Promise<Blob> {
    try {
      const response = await excelApi.post('/export-analysis', {
        analysisData,
        filename
      }, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exporting analysis:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Check service health
   */
  static async checkHealth(): Promise<any> {
    try {
      const response = await excelApi.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking Excel service health:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push('File size exceeds 10MB limit');
    }
    
    // Check file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/csv',
      'application/vnd.oasis.opendocument.spreadsheet' // .ods
    ];
    
    const allowedExtensions = ['.xlsx', '.xls', '.csv', '.ods'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      errors.push('Invalid file type. Supported formats: Excel (.xlsx, .xls), CSV (.csv), OpenDocument (.ods)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Download file with proper filename
   */
  static downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get data type icon/color for UI
   */
  static getDataTypeInfo(dataType: string): { icon: string; color: string; label: string } {
    const typeMap: Record<string, { icon: string; color: string; label: string }> = {
      'number': { icon: '🔢', color: '#3b82f6', label: 'Number' },
      'integer': { icon: '🔢', color: '#3b82f6', label: 'Integer' },
      'decimal': { icon: '🔢', color: '#6366f1', label: 'Decimal' },
      'text': { icon: '📝', color: '#6b7280', label: 'Text' },
      'email': { icon: '📧', color: '#f59e0b', label: 'Email' },
      'url': { icon: '🔗', color: '#10b981', label: 'URL' },
      'date': { icon: '📅', color: '#ef4444', label: 'Date' },
      'datetime': { icon: '🕒', color: '#ef4444', label: 'Date/Time' },
      'time': { icon: '⏰', color: '#f59e0b', label: 'Time' },
      'boolean': { icon: '✅', color: '#22c55e', label: 'Boolean' },
      'phone': { icon: '📞', color: '#8b5cf6', label: 'Phone' },
      'empty': { icon: '⚪', color: '#d1d5db', label: 'Empty' }
    };
    
    return typeMap[dataType] || { icon: '❓', color: '#6b7280', label: 'Unknown' };
  }

  /**
   * Get quality score color for UI
   */
  static getQualityScoreColor(score: number): string {
    if (score >= 80) return '#22c55e'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    if (score >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  }

  /**
   * Helper method to extract error messages
   */
  private static getErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
}

export default ExcelService;
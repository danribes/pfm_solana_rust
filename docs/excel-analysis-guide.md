# Excel File Structure Analysis Guide

This guide covers the comprehensive Excel file structure analysis capabilities added to the PFM Community Management System.

## Overview

The Excel Analysis Service provides powerful capabilities to analyze, understand, and work with Excel files. It can detect data types, assess data quality, identify table structures, and provide detailed insights into spreadsheet content.

## Features

### 🔍 **File Structure Analysis**
- **Multi-sheet support**: Analyze all sheets in an Excel workbook
- **Data type detection**: Automatically identify numbers, dates, emails, URLs, phones, booleans, and text
- **Table detection**: Identify tabular data regions and header rows
- **Quality assessment**: Score data completeness and consistency
- **Formula analysis**: Extract and categorize Excel formulas

### 📊 **Supported File Formats**
- Excel 2007+ (`.xlsx`)
- Excel 97-2003 (`.xls`)
- Comma Separated Values (`.csv`)
- OpenDocument Spreadsheet (`.ods`)

### 🎯 **Data Quality Assessment**
- Completeness ratio calculation
- Missing data identification
- Format consistency checking
- Data variability analysis
- Quality recommendations

### 🔗 **Relationship Detection**
- Cross-sheet relationship identification
- Potential foreign key detection
- Column similarity analysis

## API Endpoints

### Upload and Analyze File
```http
POST /api/excel/analyze
Content-Type: multipart/form-data

Parameters:
- excelFile: File (required)
- includeDataSample: boolean (default: true)
- maxSampleRows: number (default: 10)
- analyzeFormulas: boolean (default: true)
- detectRelationships: boolean (default: true)
```

### Import Excel Data
```http
POST /api/excel/import
Content-Type: multipart/form-data

Parameters:
- excelFile: File (required)
- sheetName: string (optional, default: first sheet)
- hasHeaders: boolean (default: true)
- skipRows: number (default: 0)
- maxRows: number (optional)
```

### Get Supported Formats
```http
GET /api/excel/formats
```

### Export Analysis Results
```http
POST /api/excel/export-analysis
Content-Type: application/json

Body:
{
  "analysisData": ExcelAnalysisResult,
  "filename": string (optional)
}
```

### Health Check
```http
GET /api/excel/health
```

## Frontend Integration

### TypeScript Service

```typescript
import { ExcelService } from './services/excel';

// Analyze a file
const analysis = await ExcelService.analyzeFile(file, {
  includeDataSample: true,
  maxSampleRows: 5,
  analyzeFormulas: true,
  detectRelationships: true
});

// Import data
const importResult = await ExcelService.importFile(file, {
  sheetName: 'Data',
  hasHeaders: true,
  skipRows: 0
});

// Validate file before upload
const validation = ExcelService.validateFile(file);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
```

### File Upload Component Example

```tsx
import React, { useState } from 'react';
import { ExcelService } from '../services/excel';

const ExcelAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const validation = ExcelService.validateFile(selectedFile);
      if (validation.isValid) {
        setFile(selectedFile);
      } else {
        alert('Invalid file: ' + validation.errors.join(', '));
      }
    }
  };

  const analyzeFile = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      const result = await ExcelService.analyzeFile(file);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".xlsx,.xls,.csv,.ods" onChange={handleFileChange} />
      <button onClick={analyzeFile} disabled={!file || loading}>
        {loading ? 'Analyzing...' : 'Analyze File'}
      </button>
      {analysis && <AnalysisResults analysis={analysis} />}
    </div>
  );
};
```

## Response Format

### Analysis Result Structure

```typescript
interface ExcelAnalysisResult {
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
```

### Sheet Analysis Structure

```typescript
interface SheetAnalysis {
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
```

### Column Analysis Structure

```typescript
interface ColumnAnalysis {
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
```

## Data Type Detection

The system can detect the following data types with confidence scoring:

| Type | Description | Examples |
|------|-------------|----------|
| `number` | Numeric values | 123, 45.67, "89" |
| `integer` | Whole numbers | 1, 2, 100 |
| `decimal` | Decimal numbers | 3.14, 99.99 |
| `text` | Text strings | "Hello", "Product Name" |
| `email` | Email addresses | user@example.com |
| `url` | Web URLs | https://example.com |
| `date` | Date values | 2023-01-01, 12/25/2023 |
| `datetime` | Date with time | 2023-01-01 14:30:00 |
| `time` | Time values | 14:30:00 |
| `boolean` | Boolean values | true, false, yes, no |
| `phone` | Phone numbers | +1-555-123-4567 |

## Quality Scoring

Data quality is scored on a scale of 0-100 based on:

- **Completeness** (40 points): Percentage of non-empty cells
- **Consistency** (20 points): Data format uniformity
- **Variability** (40 points): Appropriate data diversity

### Quality Thresholds
- **80-100**: Excellent quality
- **60-79**: Good quality with minor issues
- **40-59**: Fair quality, needs attention
- **0-39**: Poor quality, requires cleanup

## Usage Examples

### Basic Analysis

```bash
# Using curl to analyze a file
curl -X POST "http://localhost:3000/api/excel/analyze" \
  -F "excelFile=@data.xlsx" \
  -F "includeDataSample=true" \
  -F "maxSampleRows=5"
```

### Import Specific Sheet

```bash
# Import data from a specific sheet
curl -X POST "http://localhost:3000/api/excel/import" \
  -F "excelFile=@data.xlsx" \
  -F "sheetName=Users" \
  -F "hasHeaders=true" \
  -F "skipRows=0"
```

### Health Check

```bash
# Check service health
curl -X GET "http://localhost:3000/api/excel/health"
```

## Error Handling

The service provides detailed error messages for common issues:

- **File too large**: Files exceeding 10MB limit
- **Invalid format**: Unsupported file types
- **Corrupted file**: Malformed Excel files
- **Missing sheet**: Requested sheet not found
- **Analysis failure**: Internal processing errors

## Performance Considerations

- **File size limit**: 10MB maximum upload size
- **Processing time**: Varies with file size and complexity
- **Memory usage**: Large files require more memory
- **Concurrent uploads**: Service handles multiple simultaneous analyses

## Security Features

- **File type validation**: Only allows safe Excel formats
- **Size limits**: Prevents resource exhaustion
- **Content scanning**: Analyzes structure, not executable content
- **Authentication**: Requires valid session tokens
- **CORS protection**: Configured for specific origins

## Testing

Run the demo script to see all features in action:

```bash
cd backend
node demo_excel.js
```

This will demonstrate:
- Multi-sheet analysis
- Data type detection
- Quality assessment
- Sample data generation
- Comprehensive reporting

## Troubleshooting

### Common Issues

1. **"File too large" error**
   - Reduce file size or split into smaller files
   - Check the 10MB limit

2. **"Invalid file type" error**
   - Ensure file has correct extension (.xlsx, .xls, .csv, .ods)
   - Verify file is not corrupted

3. **"Analysis failed" error**
   - Check file integrity
   - Ensure file contains readable data
   - Review server logs for detailed error information

4. **Empty analysis results**
   - Verify file contains data
   - Check if sheets have proper structure
   - Ensure data is in expected format

### Performance Optimization

- Use smaller sample sizes for large files
- Disable relationship detection for faster processing
- Skip formula analysis if not needed
- Process files in batches for bulk operations

## Integration with Existing Reports

The Excel export functionality integrates seamlessly with the existing reports service:

```javascript
// Export existing report to Excel format
const reportData = await reportService.generateCommunityOverviewReport(communityId);
const excelFile = await reportService.exportToExcel(reportData, 'community-report.xlsx');
```

## Future Enhancements

Planned improvements include:

- **Chart detection**: Identify and analyze embedded charts
- **Pivot table analysis**: Support for pivot table structures
- **Data validation**: Excel data validation rule detection
- **Conditional formatting**: Format rule analysis
- **Macro detection**: Identify VBA macros (security scanning)
- **Advanced relationships**: More sophisticated relationship detection
- **Real-time collaboration**: Multi-user analysis sessions

---

For technical support or feature requests, please refer to the main project documentation or contact the development team.
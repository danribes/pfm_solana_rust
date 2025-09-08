const request = require('supertest');
const express = require('express');
const XLSX = require('xlsx');
const excelRoutes = require('../../routes/excel');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/excel', excelRoutes);

describe('Excel Routes', () => {
  let testExcelBuffer;

  beforeAll(() => {
    // Create a test Excel file in memory
    const workbook = XLSX.utils.book_new();
    const testData = [
      ['ID', 'Name', 'Age', 'Email'],
      [1, 'John Doe', 30, 'john@example.com'],
      [2, 'Jane Smith', 25, 'jane@example.com'],
      [3, 'Bob Johnson', 35, 'bob@example.com']
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(testData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TestSheet');
    
    testExcelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  });

  describe('POST /api/excel/analyze', () => {
    test('should analyze uploaded Excel file successfully', async () => {
      const response = await request(app)
        .post('/api/excel/analyze')
        .attach('excelFile', testExcelBuffer, 'test.xlsx')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.analysis).toHaveProperty('file_info');
      expect(response.body.analysis).toHaveProperty('structure');
      expect(response.body.analysis).toHaveProperty('summary');
      
      expect(response.body.analysis.file_info.original_name).toBe('test.xlsx');
      expect(response.body.analysis.file_info.total_sheets).toBe(1);
    });

    test('should handle missing file upload', async () => {
      const response = await request(app)
        .post('/api/excel/analyze')
        .expect(400);

      expect(response.body.error).toBe('No file uploaded');
      expect(response.body.message).toContain('Please upload an Excel file');
    });

    test('should handle analysis options correctly', async () => {
      const response = await request(app)
        .post('/api/excel/analyze')
        .attach('excelFile', testExcelBuffer, 'test.xlsx')
        .field('includeDataSample', 'false')
        .field('maxSampleRows', '5')
        .field('analyzeFormulas', 'false')
        .field('detectRelationships', 'false')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.analysis.structure.relationships).toBeNull();
    });

    test('should reject non-Excel files', async () => {
      const textBuffer = Buffer.from('This is not an Excel file');
      
      const response = await request(app)
        .post('/api/excel/analyze')
        .attach('excelFile', textBuffer, 'test.txt')
        .expect(400);

      expect(response.body.error).toBe('Invalid file type');
      expect(response.body.message).toContain('Only Excel files');
    });
  });

  describe('POST /api/excel/import', () => {
    test('should import Excel data successfully', async () => {
      const response = await request(app)
        .post('/api/excel/import')
        .attach('excelFile', testExcelBuffer, 'test.xlsx')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.import_result).toHaveProperty('data');
      expect(response.body.import_result).toHaveProperty('row_count');
      expect(response.body.import_result).toHaveProperty('column_count');
      
      expect(response.body.import_result.row_count).toBe(3); // 3 data rows (excluding header)
      expect(response.body.import_result.column_count).toBe(4); // 4 columns
      expect(response.body.import_result.has_headers).toBe(true);
    });

    test('should handle import options correctly', async () => {
      const response = await request(app)
        .post('/api/excel/import')
        .attach('excelFile', testExcelBuffer, 'test.xlsx')
        .field('hasHeaders', 'false')
        .field('skipRows', '1')
        .field('maxRows', '2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.import_result.has_headers).toBe(false);
      expect(response.body.import_result.row_count).toBeLessThanOrEqual(2);
    });

    test('should handle missing file for import', async () => {
      const response = await request(app)
        .post('/api/excel/import')
        .expect(400);

      expect(response.body.error).toBe('No file uploaded');
    });
  });

  describe('GET /api/excel/formats', () => {
    test('should return supported file formats', async () => {
      const response = await request(app)
        .get('/api/excel/formats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.supported_formats).toBeInstanceOf(Array);
      expect(response.body.supported_formats.length).toBeGreaterThan(0);
      expect(response.body.max_file_size).toBe('10MB');

      // Check for expected formats
      const formats = response.body.supported_formats.map(f => f.extension);
      expect(formats).toContain('.xlsx');
      expect(formats).toContain('.xls');
      expect(formats).toContain('.csv');
    });
  });

  describe('POST /api/excel/export-analysis', () => {
    test('should export analysis results to Excel', async () => {
      // First get analysis data
      const analysisResponse = await request(app)
        .post('/api/excel/analyze')
        .attach('excelFile', testExcelBuffer, 'test.xlsx');

      const analysisData = analysisResponse.body.analysis;

      // Then export the analysis
      const response = await request(app)
        .post('/api/excel/export-analysis')
        .send({ 
          analysisData: analysisData,
          filename: 'test-analysis.xlsx'
        })
        .expect(200);

      expect(response.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.body).toBeInstanceOf(Buffer);
    });

    test('should handle missing analysis data for export', async () => {
      const response = await request(app)
        .post('/api/excel/export-analysis')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('No analysis data provided');
    });
  });

  describe('GET /api/excel/health', () => {
    test('should return service health status', async () => {
      const response = await request(app)
        .get('/api/excel/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.service).toBe('Excel Analysis Service');
      expect(response.body.status).toBe('healthy');
      expect(response.body.features).toBeInstanceOf(Array);
      expect(response.body.features.length).toBeGreaterThan(0);
    });
  });

  describe('File size and type validation', () => {
    test('should accept valid Excel file types', async () => {
      // Test .xlsx
      const response1 = await request(app)
        .post('/api/excel/analyze')
        .attach('excelFile', testExcelBuffer, 'test.xlsx')
        .expect(200);

      expect(response1.body.success).toBe(true);
    });

    test('should reject files that are too large', async () => {
      // Create a large buffer (simulating file > 10MB)
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024, 'x'); // 11MB
      
      const response = await request(app)
        .post('/api/excel/analyze')
        .attach('excelFile', largeBuffer, 'large.xlsx')
        .expect(400);

      expect(response.body.error).toBe('File too large');
      expect(response.body.message).toContain('10MB limit');
    });

    test('should reject unsupported file types', async () => {
      const textBuffer = Buffer.from('plain text content');
      
      const response = await request(app)
        .post('/api/excel/analyze')
        .attach('excelFile', textBuffer, 'document.txt')
        .expect(400);

      expect(response.body.error).toBe('Invalid file type');
    });
  });

  describe('Error handling', () => {
    test('should handle malformed Excel files gracefully', async () => {
      const malformedBuffer = Buffer.from('PK'); // Partial ZIP header to fool file detection
      
      const response = await request(app)
        .post('/api/excel/analyze')
        .attach('excelFile', malformedBuffer, 'malformed.xlsx')
        .expect(500);

      expect(response.body.error).toBe('Analysis failed');
      expect(response.body.message).toContain('failed');
    });

    test('should handle empty files', async () => {
      const emptyBuffer = Buffer.alloc(0);
      
      const response = await request(app)
        .post('/api/excel/analyze')
        .attach('excelFile', emptyBuffer, 'empty.xlsx')
        .expect(500);

      expect(response.body.error).toBe('Analysis failed');
    });
  });
});
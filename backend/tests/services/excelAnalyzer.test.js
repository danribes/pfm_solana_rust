const XLSX = require('xlsx');
const excelAnalyzer = require('../../services/excelAnalyzer');
const fs = require('fs').promises;
const path = require('path');

describe('Excel Analyzer Service', () => {
  let testWorkbook;
  let testBuffer;

  beforeAll(async () => {
    // Create a test Excel workbook in memory
    testWorkbook = XLSX.utils.book_new();
    
    // Create test data for multiple sheets
    const testData1 = [
      ['ID', 'Name', 'Age', 'Email', 'Join Date'],
      [1, 'John Doe', 30, 'john@example.com', '2023-01-15'],
      [2, 'Jane Smith', 25, 'jane@example.com', '2023-02-20'],
      [3, 'Bob Johnson', 35, 'bob@example.com', '2023-03-10'],
      [4, '', 28, 'alice@example.com', '2023-04-05'], // Missing name to test data quality
      [5, 'Charlie Brown', '', 'charlie@example.com', '2023-05-12'] // Missing age
    ];
    
    const testData2 = [
      ['Product ID', 'Product Name', 'Price', 'In Stock'],
      [1, 'Laptop', 999.99, true],
      [2, 'Mouse', 25.50, true],
      [3, 'Keyboard', 75.00, false],
      [4, 'Monitor', 299.99, true]
    ];
    
    // Create worksheets
    const ws1 = XLSX.utils.aoa_to_sheet(testData1);
    const ws2 = XLSX.utils.aoa_to_sheet(testData2);
    
    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(testWorkbook, ws1, 'Users');
    XLSX.utils.book_append_sheet(testWorkbook, ws2, 'Products');
    
    // Convert to buffer for testing
    testBuffer = XLSX.write(testWorkbook, { type: 'buffer', bookType: 'xlsx' });
  });

  describe('analyzeFile', () => {
    test('should analyze Excel file from buffer successfully', async () => {
      const analysis = await excelAnalyzer.analyzeFile(testBuffer);
      
      expect(analysis).toHaveProperty('file_info');
      expect(analysis).toHaveProperty('structure');
      expect(analysis).toHaveProperty('summary');
      
      expect(analysis.file_info.filename).toBe('uploaded_file');
      expect(analysis.file_info.total_sheets).toBe(2);
      expect(analysis.structure.sheets).toHaveLength(2);
    });

    test('should detect file format correctly', async () => {
      const analysis = await excelAnalyzer.analyzeFile(testBuffer);
      
      expect(analysis.file_info.file_format).toBe('Unknown'); // Buffer doesn't have extension
    });

    test('should calculate summary statistics correctly', async () => {
      const analysis = await excelAnalyzer.analyzeFile(testBuffer);
      
      expect(analysis.summary).toHaveProperty('total_sheets', 2);
      expect(analysis.summary).toHaveProperty('sheets_with_data', 2);
      expect(analysis.summary).toHaveProperty('tabular_sheets');
      expect(analysis.summary.tabular_sheets).toBeGreaterThan(0);
    });

    test('should handle analysis options correctly', async () => {
      const options = {
        includeDataSample: false,
        maxSampleRows: 5,
        analyzeFormulas: false,
        detectRelationships: false
      };
      
      const analysis = await excelAnalyzer.analyzeFile(testBuffer, options);
      
      expect(analysis.structure.sheets[0]).not.toHaveProperty('sample_data');
      expect(analysis.structure.relationships).toBeNull();
    });
  });

  describe('analyzeSheet', () => {
    let worksheet;

    beforeAll(() => {
      worksheet = testWorkbook.Sheets['Users'];
    });

    test('should analyze sheet dimensions correctly', async () => {
      const sheetAnalysis = await excelAnalyzer.analyzeSheet(worksheet, 'Users');
      
      expect(sheetAnalysis.dimensions.rows).toBe(6); // 5 data rows + 1 header
      expect(sheetAnalysis.dimensions.columns).toBe(5);
      expect(sheetAnalysis.content.has_data).toBe(true);
    });

    test('should detect tabular structure', async () => {
      const sheetAnalysis = await excelAnalyzer.analyzeSheet(worksheet, 'Users');
      
      expect(sheetAnalysis.structure_analysis.is_tabular).toBe(true);
      expect(sheetAnalysis.content.estimated_header_row).toBe(0);
      expect(sheetAnalysis.content.data_start_row).toBe(1);
    });

    test('should analyze columns correctly', async () => {
      const sheetAnalysis = await excelAnalyzer.analyzeSheet(worksheet, 'Users');
      
      expect(sheetAnalysis.content.columns).toHaveLength(5);
      
      const idColumn = sheetAnalysis.content.columns[0];
      expect(idColumn.header).toBe('ID');
      expect(idColumn.data_type.primary).toBe('number');
      
      const nameColumn = sheetAnalysis.content.columns[1];
      expect(nameColumn.header).toBe('Name');
      expect(nameColumn.data_type.primary).toBe('text');
      
      const emailColumn = sheetAnalysis.content.columns[3];
      expect(emailColumn.header).toBe('Email');
      expect(emailColumn.data_type.primary).toBe('email');
    });
  });

  describe('detectTableStructure', () => {
    test('should detect headers correctly', () => {
      const sheetData = [
        ['ID', 'Name', 'Age'],
        [1, 'John', 30],
        [2, 'Jane', 25]
      ];
      
      const result = excelAnalyzer.detectTableStructure(sheetData);
      
      expect(result.isTabular).toBe(true);
      expect(result.headerRow).toBe(0);
      expect(result.dataStartRow).toBe(1);
    });

    test('should handle non-tabular data', () => {
      const sheetData = [
        ['Report Title'],
        ['Generated: 2023-01-01'],
        [''],
        ['Summary Data'],
        ['Total Users: 150']
      ];
      
      const result = excelAnalyzer.detectTableStructure(sheetData);
      
      expect(result.isTabular).toBe(false);
    });

    test('should handle empty data', () => {
      const result = excelAnalyzer.detectTableStructure([]);
      
      expect(result.isTabular).toBe(false);
      expect(result.headerRow).toBeNull();
      expect(result.dataStartRow).toBeNull();
    });
  });

  describe('detectDataType', () => {
    test('should detect number type correctly', () => {
      const values = [1, 2, 3.5, '4', '5.7'];
      const result = excelAnalyzer.detectDataType(values);
      
      expect(result.primary).toBe('number');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test('should detect email type correctly', () => {
      const values = ['user@example.com', 'test@domain.org', 'admin@site.net'];
      const result = excelAnalyzer.detectDataType(values);
      
      expect(result.primary).toBe('email');
      expect(result.confidence).toBe(1.0);
    });

    test('should detect date type correctly', () => {
      const values = ['2023-01-01', '2023-12-25', '01/15/2023'];
      const result = excelAnalyzer.detectDataType(values);
      
      expect(result.primary).toBe('date');
    });

    test('should detect boolean type correctly', () => {
      const values = [true, false, 'yes', 'no', 'Y', 'N'];
      const result = excelAnalyzer.detectDataType(values);
      
      expect(result.primary).toBe('boolean');
    });

    test('should default to text for mixed types', () => {
      const values = ['text', 123, 'more text', true];
      const result = excelAnalyzer.detectDataType(values);
      
      expect(result.primary).toBe('text');
    });

    test('should handle empty values', () => {
      const values = [];
      const result = excelAnalyzer.detectDataType(values);
      
      expect(result.primary).toBe('empty');
      expect(result.confidence).toBe(1.0);
    });
  });

  describe('calculateColumnStatistics', () => {
    test('should calculate basic statistics correctly', () => {
      const columnData = [1, 2, 3, '', null, 4, 5];
      const stats = excelAnalyzer.calculateColumnStatistics(columnData);
      
      expect(stats.total_count).toBe(7);
      expect(stats.non_empty_count).toBe(5);
      expect(stats.empty_count).toBe(2);
      expect(stats.unique_count).toBe(5);
      expect(stats.completeness_ratio).toBeCloseTo(5/7);
    });

    test('should calculate numeric statistics for numbers', () => {
      const columnData = [1, 2, 3, 4, 5];
      const stats = excelAnalyzer.calculateColumnStatistics(columnData);
      
      expect(stats.numeric_stats).toEqual({
        min: 1,
        max: 5,
        mean: 3,
        median: 3
      });
    });

    test('should handle all empty column', () => {
      const columnData = ['', null, undefined, ''];
      const stats = excelAnalyzer.calculateColumnStatistics(columnData);
      
      expect(stats.non_empty_count).toBe(0);
      expect(stats.completeness_ratio).toBe(0);
      expect(stats.unique_count).toBe(0);
    });
  });

  describe('assessColumnQuality', () => {
    test('should give high score for complete data', () => {
      const columnData = [1, 2, 3, 4, 5];
      const quality = excelAnalyzer.assessColumnQuality(columnData);
      
      expect(quality.score).toBeGreaterThan(50);
      expect(quality.issues).toHaveLength(0);
    });

    test('should penalize incomplete data', () => {
      const columnData = [1, '', 3, null, 5, '', ''];
      const quality = excelAnalyzer.assessColumnQuality(columnData);
      
      expect(quality.score).toBeLessThan(50);
      expect(quality.issues.length).toBeGreaterThan(0);
      expect(quality.recommendations.length).toBeGreaterThan(0);
    });

    test('should handle low variability data', () => {
      const columnData = ['A', 'A', 'A', 'A', 'B'];
      const quality = excelAnalyzer.assessColumnQuality(columnData);
      
      expect(quality.issues.some(issue => issue.includes('low data variability'))).toBe(true);
    });
  });

  describe('classifyValue', () => {
    test('should classify numbers correctly', () => {
      expect(excelAnalyzer.classifyValue(123)).toContain('number');
      expect(excelAnalyzer.classifyValue(123)).toContain('integer');
      expect(excelAnalyzer.classifyValue(123.45)).toContain('decimal');
    });

    test('should classify dates correctly', () => {
      expect(excelAnalyzer.classifyValue('2023-01-01')).toContain('date');
      expect(excelAnalyzer.classifyValue('01/15/2023')).toContain('date');
    });

    test('should classify times correctly', () => {
      expect(excelAnalyzer.classifyValue('14:30:00')).toContain('time');
      expect(excelAnalyzer.classifyValue('2023-01-01 14:30:00')).toContain('datetime');
    });

    test('should classify emails correctly', () => {
      expect(excelAnalyzer.classifyValue('user@example.com')).toContain('email');
    });

    test('should classify URLs correctly', () => {
      expect(excelAnalyzer.classifyValue('https://www.example.com')).toContain('url');
    });

    test('should classify booleans correctly', () => {
      expect(excelAnalyzer.classifyValue('true')).toContain('boolean');
      expect(excelAnalyzer.classifyValue('yes')).toContain('boolean');
      expect(excelAnalyzer.classifyValue('Y')).toContain('boolean');
    });

    test('should default to text for unrecognized values', () => {
      expect(excelAnalyzer.classifyValue('random text')).toContain('text');
    });
  });

  describe('analyzeSheetRelationships', () => {
    test('should detect potential relationships between sheets', async () => {
      const analysis = await excelAnalyzer.analyzeFile(testBuffer, { detectRelationships: true });
      
      expect(analysis.structure.relationships).toBeInstanceOf(Array);
      // Note: Our test data might not have obvious relationships, but the structure should be there
    });
  });

  describe('assessDataQuality', () => {
    test('should provide overall quality assessment', async () => {
      const analysis = await excelAnalyzer.analyzeFile(testBuffer);
      
      expect(analysis.structure.data_quality).toHaveProperty('overall_score');
      expect(analysis.structure.data_quality).toHaveProperty('issues');
      expect(analysis.structure.data_quality).toHaveProperty('recommendations');
      
      expect(typeof analysis.structure.data_quality.overall_score).toBe('number');
      expect(analysis.structure.data_quality.overall_score).toBeGreaterThanOrEqual(0);
      expect(analysis.structure.data_quality.overall_score).toBeLessThanOrEqual(100);
    });
  });

  describe('error handling', () => {
    test('should handle invalid Excel data gracefully', async () => {
      const invalidBuffer = Buffer.from('not an excel file');
      
      await expect(excelAnalyzer.analyzeFile(invalidBuffer)).rejects.toThrow();
    });

    test('should handle empty buffer', async () => {
      const emptyBuffer = Buffer.alloc(0);
      
      await expect(excelAnalyzer.analyzeFile(emptyBuffer)).rejects.toThrow();
    });
  });

  describe('helper methods', () => {
    test('looksLikeColumnName should identify column names correctly', () => {
      expect(excelAnalyzer.looksLikeColumnName('UserID')).toBe(true);
      expect(excelAnalyzer.looksLikeColumnName('First Name')).toBe(true);
      expect(excelAnalyzer.looksLikeColumnName('user_email')).toBe(true);
      expect(excelAnalyzer.looksLikeColumnName('123')).toBe(false);
      expect(excelAnalyzer.looksLikeColumnName('!@#$')).toBe(false);
    });

    test('containsHeaderWords should identify header words correctly', () => {
      expect(excelAnalyzer.containsHeaderWords('User ID')).toBe(true);
      expect(excelAnalyzer.containsHeaderWords('Email Address')).toBe(true);
      expect(excelAnalyzer.containsHeaderWords('Total Count')).toBe(true);
      expect(excelAnalyzer.containsHeaderWords('Random Text')).toBe(false);
    });

    test('calculateMedian should calculate median correctly', () => {
      expect(excelAnalyzer.calculateMedian([1, 2, 3, 4, 5])).toBe(3);
      expect(excelAnalyzer.calculateMedian([1, 2, 3, 4])).toBe(2.5);
      expect(excelAnalyzer.calculateMedian([5])).toBe(5);
    });

    test('levenshteinDistance should calculate edit distance correctly', () => {
      expect(excelAnalyzer.levenshteinDistance('cat', 'bat')).toBe(1);
      expect(excelAnalyzer.levenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(excelAnalyzer.levenshteinDistance('same', 'same')).toBe(0);
    });

    test('toTitleCase should convert to title case correctly', () => {
      expect(excelAnalyzer.toTitleCase('hello world')).toBe('Hello World');
      expect(excelAnalyzer.toTitleCase('UPPERCASE TEXT')).toBe('Uppercase Text');
      expect(excelAnalyzer.toTitleCase('mixedCase text')).toBe('MixedCase Text');
    });
  });
});
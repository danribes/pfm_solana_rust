const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs').promises;

/**
 * Excel File Structure Analysis Service
 * Provides comprehensive analysis of Excel file structure, data types, and content
 */
class ExcelAnalyzer {
  constructor() {
    this.supportedFormats = ['.xlsx', '.xls', '.csv', '.ods'];
  }

  /**
   * Analyze Excel file structure comprehensively
   * @param {string|Buffer} filePath - Path to Excel file or Buffer containing file data
   * @param {Object} options - Analysis options
   * @returns {Object} Comprehensive analysis results
   */
  async analyzeFile(filePath, options = {}) {
    try {
      const {
        includeDataSample = true,
        maxSampleRows = 10,
        analyzeFormulas = true,
        detectRelationships = true
      } = options;

      let workbook;
      let filename;
      
      // Read the Excel file
      if (Buffer.isBuffer(filePath)) {
        workbook = XLSX.read(filePath, { type: 'buffer', cellFormula: analyzeFormulas });
        filename = 'uploaded_file';
      } else {
        workbook = XLSX.readFile(filePath, { cellFormula: analyzeFormulas });
        filename = path.basename(filePath);
      }
      
      const analysis = {
        file_info: {
          filename: filename,
          analyzed_at: new Date().toISOString(),
          file_format: this.detectFileFormat(filename),
          total_sheets: workbook.SheetNames.length
        },
        structure: {
          sheets: [],
          relationships: detectRelationships ? [] : null,
          data_quality: {
            overall_score: 0,
            issues: [],
            recommendations: []
          }
        },
        summary: {}
      };
      
      // Analyze each sheet
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const sheetAnalysis = await this.analyzeSheet(worksheet, sheetName, {
          includeDataSample,
          maxSampleRows,
          analyzeFormulas
        });
        analysis.structure.sheets.push(sheetAnalysis);
      }
      
      // Calculate overall statistics
      analysis.summary = this.calculateOverallSummary(analysis.structure.sheets);
      
      // Analyze relationships between sheets if requested
      if (detectRelationships) {
        analysis.structure.relationships = this.analyzeSheetRelationships(analysis.structure.sheets);
      }
      
      // Calculate data quality score
      analysis.structure.data_quality = this.assessDataQuality(analysis.structure.sheets);
      
      return analysis;
    } catch (error) {
      console.error('Failed to analyze Excel file:', error.message);
      throw new Error(`Excel analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze individual sheet structure
   * @param {Object} worksheet - XLSX worksheet object
   * @param {string} sheetName - Name of the sheet
   * @param {Object} options - Analysis options
   * @returns {Object} Detailed sheet analysis
   */
  async analyzeSheet(worksheet, sheetName, options = {}) {
    try {
      const { includeDataSample, maxSampleRows, analyzeFormulas } = options;
      
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
      
      const analysis = {
        name: sheetName,
        dimensions: {
          rows: range.e.r + 1,
          columns: range.e.c + 1,
          used_range: worksheet['!ref'] || 'A1:A1'
        },
        content: {
          has_data: sheetData.length > 0,
          estimated_header_row: null,
          data_start_row: null,
          columns: []
        },
        structure_analysis: {
          is_tabular: false,
          table_regions: [],
          merged_cells: worksheet['!merges'] || [],
          formulas: analyzeFormulas ? this.extractFormulas(worksheet) : []
        },
        data_quality: {
          completeness: 0,
          consistency: 0,
          issues: []
        }
      };
      
      if (analysis.content.has_data) {
        // Detect table structure
        const tableDetection = this.detectTableStructure(sheetData);
        analysis.content.estimated_header_row = tableDetection.headerRow;
        analysis.content.data_start_row = tableDetection.dataStartRow;
        analysis.structure_analysis.is_tabular = tableDetection.isTabular;
        
        // Analyze columns
        if (tableDetection.isTabular) {
          analysis.content.columns = this.analyzeColumns(
            sheetData, 
            tableDetection.headerRow,
            tableDetection.dataStartRow
          );
        }
        
        // Add sample data if requested
        if (includeDataSample) {
          analysis.sample_data = this.extractSampleData(sheetData, maxSampleRows);
        }
        
        // Assess data quality for this sheet
        analysis.data_quality = this.assessSheetDataQuality(sheetData, analysis.content.columns);
      }
      
      return analysis;
    } catch (error) {
      console.error(`Failed to analyze sheet ${sheetName}:`, error.message);
      throw error;
    }
  }

  /**
   * Detect table structure within the sheet
   * @param {Array} sheetData - Sheet data as array of arrays
   * @returns {Object} Table detection results
   */
  detectTableStructure(sheetData) {
    if (!sheetData || sheetData.length === 0) {
      return { isTabular: false, headerRow: null, dataStartRow: null };
    }
    
    // Look for the most likely header row
    let bestHeaderRowIndex = -1;
    let bestScore = 0;
    
    for (let i = 0; i < Math.min(5, sheetData.length); i++) {
      const row = sheetData[i];
      if (!row || row.length === 0) continue;
      
      const score = this.scoreAsHeaderRow(row, sheetData[i + 1]);
      if (score > bestScore) {
        bestScore = score;
        bestHeaderRowIndex = i;
      }
    }
    
    const isTabular = bestScore > 0.3; // At least 30% confidence it's tabular
    const headerRow = isTabular ? bestHeaderRowIndex : null;
    const dataStartRow = isTabular ? bestHeaderRowIndex + 1 : 0;
    
    return { isTabular, headerRow, dataStartRow };
  }

  /**
   * Score a row as potential header row
   * @param {Array} row - Row to score
   * @param {Array} nextRow - Next row for comparison
   * @returns {number} Score between 0 and 1
   */
  scoreAsHeaderRow(row, nextRow) {
    if (!row || row.length === 0) return 0;
    
    let score = 0;
    const totalColumns = row.length;
    
    for (let i = 0; i < totalColumns; i++) {
      const cell = row[i];
      const nextCell = nextRow && nextRow[i];
      
      // String in header, number in next row = good header indicator
      if (typeof cell === 'string' && nextCell && !isNaN(parseFloat(nextCell))) {
        score += 0.4;
      }
      
      // Non-empty header cell
      if (cell && cell.toString().trim()) {
        score += 0.2;
      }
      
      // Looks like a column name
      if (typeof cell === 'string' && this.looksLikeColumnName(cell)) {
        score += 0.3;
      }
      
      // Contains common header words
      if (typeof cell === 'string' && this.containsHeaderWords(cell)) {
        score += 0.1;
      }
    }
    
    return Math.min(score / totalColumns, 1);
  }

  /**
   * Check if string looks like a column name
   * @param {string} str - String to check
   * @returns {boolean} True if looks like column name
   */
  looksLikeColumnName(str) {
    if (typeof str !== 'string') return false;
    
    // Common patterns for column names
    const patterns = [
      /^[a-zA-Z][a-zA-Z0-9_\s]*$/,  // Starts with letter, contains letters, numbers, underscore, spaces
      /^[A-Z][a-z\s]+$/,            // Title case
      /^[a-zA-Z_]+$/                // Letters and underscores only
    ];
    
    return patterns.some(pattern => pattern.test(str.trim()));
  }

  /**
   * Check if string contains common header words
   * @param {string} str - String to check
   * @returns {boolean} True if contains header words
   */
  containsHeaderWords(str) {
    if (typeof str !== 'string') return false;
    
    const headerWords = [
      'id', 'name', 'title', 'date', 'time', 'count', 'total', 'amount', 'value',
      'type', 'status', 'email', 'phone', 'address', 'description', 'category',
      'price', 'quantity', 'code', 'number', 'reference', 'score', 'rating'
    ];
    
    const lowerStr = str.toLowerCase();
    return headerWords.some(word => lowerStr.includes(word));
  }

  /**
   * Analyze columns in detail
   * @param {Array} sheetData - Sheet data
   * @param {number} headerRow - Header row index
   * @param {number} dataStartRow - Data start row index
   * @returns {Array} Column analysis results
   */
  analyzeColumns(sheetData, headerRow, dataStartRow) {
    if (headerRow === null || !sheetData[headerRow]) return [];
    
    const headers = sheetData[headerRow];
    const columns = [];
    
    for (let colIndex = 0; colIndex < headers.length; colIndex++) {
      const header = headers[colIndex] || `Column_${colIndex + 1}`;
      const columnData = this.extractColumnData(sheetData, colIndex, dataStartRow);
      
      const columnAnalysis = {
        index: colIndex,
        letter: XLSX.utils.encode_col(colIndex),
        header: header,
        data_type: this.detectDataType(columnData),
        statistics: this.calculateColumnStatistics(columnData),
        quality: this.assessColumnQuality(columnData)
      };
      
      columns.push(columnAnalysis);
    }
    
    return columns;
  }

  /**
   * Extract column data from sheet
   * @param {Array} sheetData - Sheet data
   * @param {number} colIndex - Column index
   * @param {number} startRow - Start row for data
   * @returns {Array} Column values
   */
  extractColumnData(sheetData, colIndex, startRow) {
    const columnData = [];
    
    for (let rowIndex = startRow; rowIndex < sheetData.length; rowIndex++) {
      const row = sheetData[rowIndex];
      const value = row && row[colIndex];
      columnData.push(value);
    }
    
    return columnData;
  }

  /**
   * Detect data type of column values with confidence scoring
   * @param {Array} values - Column values
   * @returns {Object} Data type analysis
   */
  detectDataType(values) {
    const nonEmptyValues = values.filter(val => val !== null && val !== undefined && val !== '');
    
    if (nonEmptyValues.length === 0) {
      return { primary: 'empty', confidence: 1.0, distribution: {} };
    }
    
    const typeCount = {
      number: 0,
      integer: 0,
      decimal: 0,
      date: 0,
      datetime: 0,
      time: 0,
      boolean: 0,
      text: 0,
      email: 0,
      url: 0,
      phone: 0
    };
    
    for (const value of nonEmptyValues) {
      const detectedTypes = this.classifyValue(value);
      detectedTypes.forEach(type => typeCount[type]++);
    }
    
    // Calculate percentages
    const total = nonEmptyValues.length;
    const distribution = {};
    let primaryType = 'text';
    let maxPercentage = 0;
    
    for (const [type, count] of Object.entries(typeCount)) {
      const percentage = count / total;
      distribution[type] = percentage;
      
      if (percentage > maxPercentage) {
        maxPercentage = percentage;
        primaryType = type;
      }
    }
    
    return {
      primary: primaryType,
      confidence: maxPercentage,
      distribution: distribution
    };
  }

  /**
   * Classify a single value into possible types
   * @param {any} value - Value to classify
   * @returns {Array} Array of possible types
   */
  classifyValue(value) {
    const types = [];
    const strValue = String(value).trim();
    
    if (!strValue) return ['empty'];
    
    // Number checks
    if (!isNaN(parseFloat(strValue)) && isFinite(strValue)) {
      types.push('number');
      if (Number.isInteger(parseFloat(strValue))) {
        types.push('integer');
      } else {
        types.push('decimal');
      }
    }
    
    // Boolean checks
    if (/^(true|false|yes|no|y|n|1|0)$/i.test(strValue)) {
      types.push('boolean');
    }
    
    // Date/time checks
    const dateValue = new Date(strValue);
    if (!isNaN(dateValue.getTime())) {
      if (/\d{1,4}[-\/]\d{1,2}[-\/]\d{1,4}/.test(strValue)) {
        types.push('date');
      }
      if (/\d{1,2}:\d{2}(:\d{2})?/.test(strValue)) {
        if (/\d{1,4}[-\/]\d{1,2}[-\/]\d{1,4}.*\d{1,2}:\d{2}/.test(strValue)) {
          types.push('datetime');
        } else {
          types.push('time');
        }
      }
    }
    
    // Email check
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue)) {
      types.push('email');
    }
    
    // URL check
    if (/^https?:\/\/[^\s]+$/.test(strValue)) {
      types.push('url');
    }
    
    // Phone check (simple pattern)
    if (/^[\+]?[\d\s\-\(\)]{10,}$/.test(strValue)) {
      types.push('phone');
    }
    
    // Default to text if no specific type found
    if (types.length === 0) {
      types.push('text');
    }
    
    return types;
  }

  /**
   * Calculate column statistics
   * @param {Array} columnData - Column data
   * @returns {Object} Column statistics
   */
  calculateColumnStatistics(columnData) {
    const stats = {
      total_count: columnData.length,
      non_empty_count: 0,
      empty_count: 0,
      unique_count: 0,
      completeness_ratio: 0
    };
    
    const nonEmptyValues = columnData.filter(val => 
      val !== null && val !== undefined && val !== ''
    );
    
    stats.non_empty_count = nonEmptyValues.length;
    stats.empty_count = stats.total_count - stats.non_empty_count;
    stats.unique_count = new Set(nonEmptyValues).size;
    stats.completeness_ratio = stats.total_count > 0 ? 
      stats.non_empty_count / stats.total_count : 0;
    
    // Type-specific statistics
    const numbers = nonEmptyValues
      .map(val => parseFloat(val))
      .filter(num => !isNaN(num));
    
    if (numbers.length > 0) {
      stats.numeric_stats = {
        min: Math.min(...numbers),
        max: Math.max(...numbers),
        mean: numbers.reduce((sum, num) => sum + num, 0) / numbers.length,
        median: this.calculateMedian(numbers)
      };
    }
    
    return stats;
  }

  /**
   * Calculate median of numeric array
   * @param {Array} numbers - Sorted array of numbers
   * @returns {number} Median value
   */
  calculateMedian(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? 
      (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  /**
   * Assess column data quality
   * @param {Array} columnData - Column data
   * @returns {Object} Quality assessment
   */
  assessColumnQuality(columnData) {
    const quality = {
      score: 0,
      issues: [],
      recommendations: []
    };
    
    const nonEmptyValues = columnData.filter(val => 
      val !== null && val !== undefined && val !== ''
    );
    
    const completeness = nonEmptyValues.length / columnData.length;
    
    // Completeness scoring
    if (completeness >= 0.95) {
      quality.score += 40;
    } else if (completeness >= 0.8) {
      quality.score += 30;
    } else if (completeness >= 0.5) {
      quality.score += 15;
      quality.issues.push('Moderate amount of missing data');
      quality.recommendations.push('Review and fill missing values where possible');
    } else {
      quality.score += 5;
      quality.issues.push('High amount of missing data');
      quality.recommendations.push('Consider if this column is necessary or needs data cleanup');
    }
    
    // Consistency scoring
    const uniqueRatio = new Set(nonEmptyValues).size / nonEmptyValues.length;
    if (uniqueRatio === 1) {
      quality.score += 20; // All unique values
    } else if (uniqueRatio > 0.8) {
      quality.score += 18;
    } else if (uniqueRatio > 0.5) {
      quality.score += 15;
    } else if (uniqueRatio < 0.1) {
      quality.score += 5;
      quality.issues.push('Very low data variability');
    } else {
      quality.score += 10;
    }
    
    // Format consistency (for strings)
    const strings = nonEmptyValues.filter(val => typeof val === 'string');
    if (strings.length > 0) {
      const formatConsistency = this.assessFormatConsistency(strings);
      quality.score += formatConsistency.score;
      quality.issues.push(...formatConsistency.issues);
      quality.recommendations.push(...formatConsistency.recommendations);
    }
    
    return quality;
  }

  /**
   * Assess format consistency for string values
   * @param {Array} strings - Array of string values
   * @returns {Object} Format consistency assessment
   */
  assessFormatConsistency(strings) {
    const assessment = {
      score: 0,
      issues: [],
      recommendations: []
    };
    
    // Check for consistent casing
    const lowerCount = strings.filter(s => s === s.toLowerCase()).length;
    const upperCount = strings.filter(s => s === s.toUpperCase()).length;
    const titleCount = strings.filter(s => s === this.toTitleCase(s)).length;
    
    const totalStrings = strings.length;
    const maxCaseRatio = Math.max(lowerCount, upperCount, titleCount) / totalStrings;
    
    if (maxCaseRatio >= 0.8) {
      assessment.score += 15;
    } else if (maxCaseRatio >= 0.6) {
      assessment.score += 10;
      assessment.issues.push('Inconsistent text casing');
      assessment.recommendations.push('Standardize text casing for consistency');
    } else {
      assessment.score += 5;
      assessment.issues.push('Very inconsistent text casing');
    }
    
    // Check for leading/trailing whitespace
    const trimmedCount = strings.filter(s => s === s.trim()).length;
    if (trimmedCount / totalStrings >= 0.95) {
      assessment.score += 10;
    } else {
      assessment.issues.push('Text values contain extra whitespace');
      assessment.recommendations.push('Trim whitespace from text values');
    }
    
    return assessment;
  }

  /**
   * Convert string to title case
   * @param {string} str - String to convert
   * @returns {string} Title case string
   */
  toTitleCase(str) {
    return str.replace(/\w\S*/g, txt => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /**
   * Extract formulas from worksheet
   * @param {Object} worksheet - XLSX worksheet
   * @returns {Array} Array of formula information
   */
  extractFormulas(worksheet) {
    const formulas = [];
    
    for (const cellAddress in worksheet) {
      if (cellAddress[0] === '!') continue; // Skip special properties
      
      const cell = worksheet[cellAddress];
      if (cell && cell.f) {
        formulas.push({
          address: cellAddress,
          formula: cell.f,
          value: cell.v,
          type: this.classifyFormula(cell.f)
        });
      }
    }
    
    return formulas;
  }

  /**
   * Classify formula type
   * @param {string} formula - Formula string
   * @returns {string} Formula type
   */
  classifyFormula(formula) {
    const upperFormula = formula.toUpperCase();
    
    if (upperFormula.includes('SUM(')) return 'mathematical';
    if (upperFormula.includes('COUNT(') || upperFormula.includes('AVERAGE(')) return 'statistical';
    if (upperFormula.includes('IF(')) return 'logical';
    if (upperFormula.includes('VLOOKUP(') || upperFormula.includes('INDEX(')) return 'lookup';
    if (upperFormula.includes('DATE(') || upperFormula.includes('TODAY(')) return 'date_time';
    if (upperFormula.includes('CONCATENATE(') || upperFormula.includes('MID(')) return 'text';
    
    return 'other';
  }

  /**
   * Extract sample data from sheet
   * @param {Array} sheetData - Sheet data
   * @param {number} maxRows - Maximum sample rows
   * @returns {Array} Sample data
   */
  extractSampleData(sheetData, maxRows = 10) {
    return sheetData.slice(0, Math.min(maxRows, sheetData.length));
  }

  /**
   * Calculate overall summary statistics
   * @param {Array} sheets - Array of sheet analyses
   * @returns {Object} Overall summary
   */
  calculateOverallSummary(sheets) {
    const summary = {
      total_rows: 0,
      total_columns: 0,
      total_cells: 0,
      sheets_with_data: 0,
      tabular_sheets: 0,
      total_formulas: 0,
      data_types_found: new Set(),
      average_data_quality: 0
    };
    
    for (const sheet of sheets) {
      summary.total_rows += sheet.dimensions.rows;
      summary.total_columns += sheet.dimensions.columns;
      summary.total_cells += sheet.dimensions.rows * sheet.dimensions.columns;
      
      if (sheet.content.has_data) {
        summary.sheets_with_data++;
      }
      
      if (sheet.structure_analysis.is_tabular) {
        summary.tabular_sheets++;
      }
      
      summary.total_formulas += sheet.structure_analysis.formulas.length;
      
      // Collect data types
      if (sheet.content.columns) {
        sheet.content.columns.forEach(col => {
          summary.data_types_found.add(col.data_type.primary);
        });
      }
      
      // Average data quality
      if (sheet.data_quality && typeof sheet.data_quality.overall_score === 'number') {
        summary.average_data_quality += sheet.data_quality.overall_score;
      }
    }
    
    summary.data_types_found = Array.from(summary.data_types_found);
    summary.average_data_quality = sheets.length > 0 ? 
      summary.average_data_quality / sheets.length : 0;
    
    return summary;
  }

  /**
   * Analyze relationships between sheets
   * @param {Array} sheets - Array of sheet analyses
   * @returns {Array} Detected relationships
   */
  analyzeSheetRelationships(sheets) {
    const relationships = [];
    
    // Look for potential foreign key relationships
    for (let i = 0; i < sheets.length; i++) {
      for (let j = i + 1; j < sheets.length; j++) {
        const sheet1 = sheets[i];
        const sheet2 = sheets[j];
        
        if (!sheet1.content.columns || !sheet2.content.columns) continue;
        
        const potentialRelationships = this.findPotentialRelationships(sheet1, sheet2);
        relationships.push(...potentialRelationships);
      }
    }
    
    return relationships;
  }

  /**
   * Find potential relationships between two sheets
   * @param {Object} sheet1 - First sheet analysis
   * @param {Object} sheet2 - Second sheet analysis
   * @returns {Array} Potential relationships
   */
  findPotentialRelationships(sheet1, sheet2) {
    const relationships = [];
    
    for (const col1 of sheet1.content.columns) {
      for (const col2 of sheet2.content.columns) {
        // Look for similar column names that might indicate relationships
        const similarity = this.calculateColumnNameSimilarity(col1.header, col2.header);
        
        if (similarity > 0.8) {
          relationships.push({
            type: 'potential_foreign_key',
            confidence: similarity,
            from_sheet: sheet1.name,
            from_column: col1.header,
            to_sheet: sheet2.name,
            to_column: col2.header,
            reason: 'Similar column names'
          });
        }
      }
    }
    
    return relationships;
  }

  /**
   * Calculate similarity between column names
   * @param {string} name1 - First column name
   * @param {string} name2 - Second column name
   * @returns {number} Similarity score (0-1)
   */
  calculateColumnNameSimilarity(name1, name2) {
    const clean1 = name1.toLowerCase().replace(/[^a-z]/g, '');
    const clean2 = name2.toLowerCase().replace(/[^a-z]/g, '');
    
    if (clean1 === clean2) return 1.0;
    
    // Simple Levenshtein distance ratio
    const maxLen = Math.max(clean1.length, clean2.length);
    const distance = this.levenshteinDistance(clean1, clean2);
    
    return 1 - (distance / maxLen);
  }

  /**
   * Calculate Levenshtein distance between strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Edit distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + substitutionCost // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Assess overall data quality
   * @param {Array} sheets - Array of sheet analyses
   * @returns {Object} Overall data quality assessment
   */
  assessDataQuality(sheets) {
    const assessment = {
      overall_score: 0,
      issues: [],
      recommendations: [],
      sheet_scores: {}
    };
    
    let totalScore = 0;
    let sheetCount = 0;
    
    for (const sheet of sheets) {
      if (!sheet.content.has_data) continue;
      
      const sheetQuality = this.assessSheetDataQuality([], sheet.content.columns);
      assessment.sheet_scores[sheet.name] = sheetQuality;
      totalScore += sheetQuality.overall_score;
      sheetCount++;
      
      // Collect issues and recommendations
      assessment.issues.push(...sheetQuality.issues.map(issue => 
        `${sheet.name}: ${issue}`
      ));
      assessment.recommendations.push(...sheetQuality.recommendations.map(rec => 
        `${sheet.name}: ${rec}`
      ));
    }
    
    assessment.overall_score = sheetCount > 0 ? totalScore / sheetCount : 0;
    
    // Remove duplicate recommendations
    assessment.recommendations = [...new Set(assessment.recommendations)];
    
    return assessment;
  }

  /**
   * Assess data quality for individual sheet
   * @param {Array} sheetData - Sheet data (not used currently, kept for interface consistency)
   * @param {Array} columns - Column analyses
   * @returns {Object} Sheet quality assessment
   */
  assessSheetDataQuality(sheetData, columns) {
    const assessment = {
      overall_score: 0,
      issues: [],
      recommendations: []
    };
    
    if (!columns || columns.length === 0) {
      return { overall_score: 0, issues: ['No analyzable columns'], recommendations: [] };
    }
    
    let totalScore = 0;
    
    for (const column of columns) {
      if (column.quality && typeof column.quality.score === 'number') {
        totalScore += column.quality.score;
        assessment.issues.push(...column.quality.issues.map(issue => 
          `Column '${column.header}': ${issue}`
        ));
        assessment.recommendations.push(...column.quality.recommendations.map(rec => 
          `Column '${column.header}': ${rec}`
        ));
      }
    }
    
    assessment.overall_score = totalScore / columns.length;
    
    return assessment;
  }

  /**
   * Detect file format from filename
   * @param {string} filename - Filename
   * @returns {string} Detected format
   */
  detectFileFormat(filename) {
    const ext = path.extname(filename).toLowerCase();
    
    switch (ext) {
      case '.xlsx': return 'Excel 2007+ (XLSX)';
      case '.xls': return 'Excel 97-2003 (XLS)';
      case '.csv': return 'Comma Separated Values (CSV)';
      case '.ods': return 'OpenDocument Spreadsheet (ODS)';
      default: return 'Unknown';
    }
  }
}

// Create and export singleton instance
const excelAnalyzer = new ExcelAnalyzer();

module.exports = excelAnalyzer;
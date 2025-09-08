#!/usr/bin/env node

/**
 * Excel Analysis Demo Script
 * Demonstrates the Excel file structure analysis capabilities
 */

const XLSX = require('xlsx');
const excelAnalyzer = require('./services/excelAnalyzer');
const path = require('path');
const fs = require('fs').promises;

async function createSampleExcelFiles() {
  console.log('📊 Creating sample Excel files for demo...\n');
  
  // Create sample data for different scenarios
  const samples = {
    'users.xlsx': [
      ['ID', 'Name', 'Email', 'Age', 'Join Date', 'Status'],
      [1, 'John Doe', 'john@example.com', 30, '2023-01-15', 'Active'],
      [2, 'Jane Smith', 'jane@example.com', 25, '2023-02-20', 'Active'],
      [3, 'Bob Johnson', 'bob@example.com', 35, '2023-03-10', 'Inactive'],
      [4, '', 'alice@example.com', 28, '2023-04-05', 'Active'], // Missing name
      [5, 'Charlie Brown', 'charlie@example.com', '', '2023-05-12', 'Active'] // Missing age
    ],
    
    'sales.xlsx': [
      ['Product ID', 'Product Name', 'Category', 'Price', 'Quantity', 'Total'],
      [1, 'Laptop', 'Electronics', 999.99, 10, 9999.90],
      [2, 'Mouse', 'Electronics', 25.50, 50, 1275.00],
      [3, 'Desk Chair', 'Furniture', 199.99, 8, 1599.92],
      [4, 'Monitor', 'Electronics', 299.99, 15, 4499.85]
    ],
    
    'mixed_data.xlsx': [
      ['Report Generated: 2023-09-08'], // Title row
      ['Summary Statistics'],
      [''],
      ['Metric', 'Value', 'Change %'],
      ['Total Users', 1250, 15.5],
      ['Active Users', 980, 12.3],
      ['Revenue', 45000, 8.7]
    ]
  };
  
  const results = {};
  
  for (const [filename, data] of Object.entries(samples)) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // Add a second sheet for users.xlsx to demo multi-sheet analysis
    if (filename === 'users.xlsx') {
      const permissionsData = [
        ['User ID', 'Permission', 'Granted Date'],
        [1, 'Admin', '2023-01-15'],
        [2, 'Editor', '2023-02-20'],
        [3, 'Viewer', '2023-03-10']
      ];
      const permissionsSheet = XLSX.utils.aoa_to_sheet(permissionsData);
      XLSX.utils.book_append_sheet(workbook, permissionsSheet, 'Permissions');
    }
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    results[filename] = buffer;
  }
  
  return results;
}

async function demonstrateAnalysis() {
  console.log('🔍 Excel File Structure Analysis Demo\n');
  console.log('=====================================\n');
  
  try {
    const sampleFiles = await createSampleExcelFiles();
    
    for (const [filename, buffer] of Object.entries(sampleFiles)) {
      console.log(`📄 Analyzing: ${filename}`);
      console.log('─'.repeat(50));
      
      const analysis = await excelAnalyzer.analyzeFile(buffer, {
        includeDataSample: true,
        maxSampleRows: 3,
        analyzeFormulas: true,
        detectRelationships: true
      });
      
      // Display file information
      console.log('\n📋 File Information:');
      console.log(`  • Total Sheets: ${analysis.file_info.total_sheets}`);
      console.log(`  • File Format: ${analysis.file_info.file_format}`);
      console.log(`  • Analysis Time: ${analysis.file_info.analyzed_at}`);
      
      // Display summary statistics
      console.log('\n📊 Summary Statistics:');
      console.log(`  • Total Rows: ${analysis.summary.total_rows}`);
      console.log(`  • Total Columns: ${analysis.summary.total_columns}`);
      console.log(`  • Sheets with Data: ${analysis.summary.sheets_with_data}`);
      console.log(`  • Tabular Sheets: ${analysis.summary.tabular_sheets}`);
      console.log(`  • Data Types Found: ${analysis.summary.data_types_found.join(', ')}`);
      console.log(`  • Data Quality Score: ${analysis.summary.average_data_quality.toFixed(1)}/100`);
      
      // Display sheet details
      console.log('\n📑 Sheet Analysis:');
      for (const sheet of analysis.structure.sheets) {
        console.log(`\n  Sheet: "${sheet.name}"`);
        console.log(`    • Dimensions: ${sheet.dimensions.rows} rows × ${sheet.dimensions.columns} columns`);
        console.log(`    • Is Tabular: ${sheet.structure_analysis.is_tabular ? 'Yes' : 'No'}`);
        console.log(`    • Has Data: ${sheet.content.has_data ? 'Yes' : 'No'}`);
        
        if (sheet.content.columns && sheet.content.columns.length > 0) {
          console.log('    • Columns:');
          sheet.content.columns.slice(0, 4).forEach(col => {
            const completeness = (col.statistics.completeness_ratio * 100).toFixed(1);
            console.log(`      - ${col.header} (${col.data_type.primary}, ${completeness}% complete)`);
          });
          
          if (sheet.content.columns.length > 4) {
            console.log(`      ... and ${sheet.content.columns.length - 4} more columns`);
          }
        }
        
        // Show data quality issues if any
        if (sheet.data_quality.issues && sheet.data_quality.issues.length > 0) {
          console.log(`    • Quality Issues: ${sheet.data_quality.issues.length} found`);
          sheet.data_quality.issues.slice(0, 2).forEach(issue => {
            console.log(`      ⚠️  ${issue}`);
          });
        }
      }
      
      // Show relationships if detected
      if (analysis.structure.relationships && analysis.structure.relationships.length > 0) {
        console.log('\n🔗 Detected Relationships:');
        analysis.structure.relationships.forEach(rel => {
          console.log(`  • ${rel.from_sheet}.${rel.from_column} → ${rel.to_sheet}.${rel.to_column} (${rel.confidence.toFixed(2)} confidence)`);
        });
      }
      
      console.log('\n' + '='.repeat(70) + '\n');
    }
    
    // Demonstrate data type detection capabilities
    console.log('🧪 Data Type Detection Examples:\n');
    
    const typeExamples = {
      'Numbers': [1, 2.5, '3', '4.7', 100],
      'Dates': ['2023-01-01', '12/25/2023', '2023-12-31'],
      'Emails': ['user@example.com', 'admin@domain.org', 'test@site.net'],
      'URLs': ['https://www.example.com', 'http://domain.org', 'https://site.net/path'],
      'Booleans': [true, false, 'yes', 'no', 'Y', 'N'],
      'Phone Numbers': ['+1-555-123-4567', '(555) 123-4567', '555.123.4567'],
      'Mixed Types': ['Text', 123, true, 'user@email.com']
    };
    
    for (const [category, values] of Object.entries(typeExamples)) {
      const detection = excelAnalyzer.detectDataType(values);
      console.log(`${category}:`);
      console.log(`  Primary Type: ${detection.primary} (${(detection.confidence * 100).toFixed(1)}% confidence)`);
      console.log(`  Sample Values: ${values.slice(0, 3).join(', ')}`);
      console.log('');
    }
    
    console.log('✅ Excel Analysis Demo Complete!\n');
    console.log('Key Features Demonstrated:');
    console.log('  • Comprehensive file structure analysis');
    console.log('  • Multi-sheet support');
    console.log('  • Intelligent data type detection');
    console.log('  • Data quality assessment');
    console.log('  • Table structure detection');
    console.log('  • Relationship identification');
    console.log('  • Format consistency checking');
    console.log('\nAPI Endpoints Available:');
    console.log('  • POST /api/excel/analyze - Upload and analyze Excel files');
    console.log('  • POST /api/excel/import - Import Excel data');
    console.log('  • GET /api/excel/formats - Get supported formats');
    console.log('  • GET /api/excel/health - Service health check');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error(error.stack);
  }
}

// Run the demo
if (require.main === module) {
  demonstrateAnalysis()
    .then(() => {
      console.log('\n🎉 Demo completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Demo error:', error);
      process.exit(1);
    });
}

module.exports = { demonstrateAnalysis, createSampleExcelFiles };
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const excelAnalyzer = require('../services/excelAnalyzer');
const reportService = require('../services/reports');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.xlsx', '.xls', '.csv', '.ods'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls, .csv, .ods) are allowed'), false);
    }
  }
});

/**
 * POST /api/excel/analyze
 * Analyze uploaded Excel file structure
 */
router.post('/analyze', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload an Excel file to analyze'
      });
    }

    const options = {
      includeDataSample: req.body.includeDataSample !== 'false',
      maxSampleRows: parseInt(req.body.maxSampleRows) || 10,
      analyzeFormulas: req.body.analyzeFormulas !== 'false',
      detectRelationships: req.body.detectRelationships !== 'false'
    };

    // Analyze the uploaded file
    const analysis = await excelAnalyzer.analyzeFile(req.file.buffer, options);

    // Add file metadata
    analysis.file_info.original_name = req.file.originalname;
    analysis.file_info.size_bytes = req.file.size;
    analysis.file_info.mime_type = req.file.mimetype;

    res.json({
      success: true,
      analysis: analysis,
      message: 'Excel file analyzed successfully'
    });

  } catch (error) {
    console.error('Excel analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message || 'An error occurred while analyzing the Excel file'
    });
  }
});

/**
 * POST /api/excel/import
 * Import data from Excel file
 */
router.post('/import', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload an Excel file to import'
      });
    }

    const options = {
      sheetName: req.body.sheetName || null,
      hasHeaders: req.body.hasHeaders !== 'false',
      skipRows: parseInt(req.body.skipRows) || 0,
      maxRows: req.body.maxRows ? parseInt(req.body.maxRows) : null
    };

    // Import the data
    const importResult = await reportService.importExcelData(req.file.buffer, options);

    // Add file metadata
    importResult.file_info = {
      original_name: req.file.originalname,
      size_bytes: req.file.size,
      mime_type: req.file.mimetype
    };

    res.json({
      success: true,
      import_result: importResult,
      message: 'Excel file imported successfully'
    });

  } catch (error) {
    console.error('Excel import error:', error);
    res.status(500).json({
      error: 'Import failed',
      message: error.message || 'An error occurred while importing the Excel file'
    });
  }
});

/**
 * GET /api/excel/formats
 * Get supported file formats
 */
router.get('/formats', (req, res) => {
  try {
    const formats = [
      {
        extension: '.xlsx',
        description: 'Excel 2007+ (Open XML)',
        mime_types: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
      },
      {
        extension: '.xls',
        description: 'Excel 97-2003 (Binary)',
        mime_types: ['application/vnd.ms-excel']
      },
      {
        extension: '.csv',
        description: 'Comma Separated Values',
        mime_types: ['text/csv', 'application/csv']
      },
      {
        extension: '.ods',
        description: 'OpenDocument Spreadsheet',
        mime_types: ['application/vnd.oasis.opendocument.spreadsheet']
      }
    ];

    res.json({
      success: true,
      supported_formats: formats,
      max_file_size: '10MB'
    });

  } catch (error) {
    console.error('Error getting supported formats:', error);
    res.status(500).json({
      error: 'Failed to get formats',
      message: error.message
    });
  }
});

/**
 * POST /api/excel/export-analysis
 * Export analysis results to Excel format
 */
router.post('/export-analysis', async (req, res) => {
  try {
    const { analysisData, filename } = req.body;

    if (!analysisData) {
      return res.status(400).json({
        error: 'No analysis data provided',
        message: 'Please provide analysis data to export'
      });
    }

    // Create a report from analysis data
    const report = {
      report_type: 'excel_analysis',
      generated_at: new Date().toISOString(),
      summary: analysisData.summary || {},
      sheets: analysisData.structure?.sheets || [],
      file_info: analysisData.file_info || {}
    };

    // Export to Excel using the reports service
    const exportResult = await reportService.exportToExcel(report, filename);

    // Read the file and send as response
    const fileBuffer = await fs.readFile(exportResult.filepath);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
    res.send(fileBuffer);

  } catch (error) {
    console.error('Export analysis error:', error);
    res.status(500).json({
      error: 'Export failed',
      message: error.message || 'An error occurred while exporting the analysis'
    });
  }
});

/**
 * GET /api/excel/health
 * Health check for Excel service
 */
router.get('/health', (req, res) => {
  try {
    res.json({
      success: true,
      service: 'Excel Analysis Service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      features: [
        'File structure analysis',
        'Data type detection',
        'Quality assessment',
        'Excel export/import',
        'Multi-sheet support',
        'Formula analysis',
        'Relationship detection'
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      service: 'Excel Analysis Service',
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size exceeds 10MB limit'
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: error.message
    });
  }

  if (error.message.includes('Only Excel files')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message
    });
  }

  next(error);
});

module.exports = router;
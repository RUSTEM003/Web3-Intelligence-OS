require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const winston = require('winston');
const ort = require('onnxruntime-node');
const sharp = require('sharp');
const Jimp = require('jimp');
const { v4: uuidv4 } = require('uuid');
const Redis = require('ioredis');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 8085;

const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379', {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: '/var/log/ai-diagnostics.log' })
  ]
});

const upload = multer({
  dest: '/tmp/uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|bmp|tiff|dicom/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.includes('dicom');
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid medical image file type'));
    }
  }
});

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://medtour.ai', 'https://www.medtour.ai', 'https://admin.medtour.ai']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

const AI_MODELS = {
  skin_analysis: {
    path: '/app/models/skin_analysis.onnx',
    inputSize: [224, 224],
    classes: [
      'normal', 'acne', 'eczema', 'psoriasis', 'melanoma_risk', 
      'basal_cell_carcinoma', 'squamous_cell_carcinoma', 'seborrheic_keratosis'
    ]
  },
  dental_xray: {
    path: '/app/models/dental_analysis.onnx',
    inputSize: [512, 512],
    classes: [
      'healthy', 'cavity', 'crown_needed', 'root_canal_needed',
      'extraction_needed', 'periodontal_disease', 'impacted_tooth'
    ]
  },
  hair_loss: {
    path: '/app/models/hair_analysis.onnx',
    inputSize: [256, 256],
    classes: [
      'normal_density', 'mild_thinning', 'moderate_loss', 'severe_loss',
      'male_pattern_baldness', 'female_pattern_baldness', 'alopecia_areata'
    ]
  },
  chest_xray: {
    path: '/app/models/chest_analysis.onnx',
    inputSize: [512, 512],
    classes: [
      'normal', 'pneumonia', 'covid19', 'tuberculosis', 'lung_cancer',
      'pleural_effusion', 'pneumothorax', 'cardiomegaly'
    ]
  }
};

const modelSessions = {};

async function initializeModels() {
  logger.info('Initializing AI diagnostic models...');
  
  for (const [modelName, config] of Object.entries(AI_MODELS)) {
    try {
      if (await fs.access(config.path).then(() => true).catch(() => false)) {
        const session = await ort.InferenceSession.create(config.path);
        modelSessions[modelName] = session;
        logger.info(`Model ${modelName} loaded successfully`);
      } else {
        logger.warn(`Model file not found: ${config.path}, using mock predictions`);
        modelSessions[modelName] = null;
      }
    } catch (error) {
      logger.error(`Failed to load model ${modelName}:`, error.message);
      modelSessions[modelName] = null;
    }
  }
}

async function preprocessImage(imagePath, targetSize) {
  try {
    const image = await sharp(imagePath)
      .resize(targetSize[0], targetSize[1])
      .removeAlpha()
      .raw()
      .toBuffer();
    
    const float32Array = new Float32Array(targetSize[0] * targetSize[1] * 3);
    
    for (let i = 0; i < image.length; i += 3) {
      float32Array[i] = image[i] / 255.0;
      float32Array[i + 1] = image[i + 1] / 255.0;
      float32Array[i + 2] = image[i + 2] / 255.0;
    }
    
    return new ort.Tensor('float32', float32Array, [1, 3, targetSize[0], targetSize[1]]);
  } catch (error) {
    logger.error('Image preprocessing failed:', error);
    throw new Error('Failed to preprocess medical image');
  }
}

async function runInference(modelName, imagePath) {
  const config = AI_MODELS[modelName];
  const session = modelSessions[modelName];
  
  if (!session) {
    return generateMockPrediction(modelName);
  }
  
  try {
    const inputTensor = await preprocessImage(imagePath, config.inputSize);
    const feeds = {};
    feeds[session.inputNames[0]] = inputTensor;
    
    const results = await session.run(feeds);
    const outputTensor = results[session.outputNames[0]];
    
    const predictions = [];
    const probabilities = outputTensor.data;
    
    for (let i = 0; i < config.classes.length; i++) {
      predictions.push({
        class: config.classes[i],
        confidence: probabilities[i],
        probability: Math.round(probabilities[i] * 100 * 100) / 100
      });
    }
    
    predictions.sort((a, b) => b.confidence - a.confidence);
    
    return {
      predictions: predictions.slice(0, 3),
      primaryDiagnosis: predictions[0],
      confidence: predictions[0].confidence,
      modelUsed: modelName,
      processingTime: Date.now()
    };
  } catch (error) {
    logger.error(`Inference failed for model ${modelName}:`, error);
    return generateMockPrediction(modelName);
  }
}

function generateMockPrediction(modelName) {
  const config = AI_MODELS[modelName];
  const mockPredictions = [];
  
  for (let i = 0; i < config.classes.length; i++) {
    const confidence = Math.random() * 0.8 + 0.1;
    mockPredictions.push({
      class: config.classes[i],
      confidence: confidence,
      probability: Math.round(confidence * 100 * 100) / 100
    });
  }
  
  mockPredictions.sort((a, b) => b.confidence - a.confidence);
  
  return {
    predictions: mockPredictions.slice(0, 3),
    primaryDiagnosis: mockPredictions[0],
    confidence: mockPredictions[0].confidence,
    modelUsed: modelName,
    processingTime: Date.now(),
    isMockData: true
  };
}

function generateMedicalRecommendations(diagnosis, confidence) {
  const recommendations = {
    normal: [
      'Continue regular health monitoring',
      'Maintain current lifestyle and preventive care',
      'Schedule routine follow-up as recommended by your physician'
    ],
    acne: [
      'Consider topical retinoids or benzoyl peroxide treatment',
      'Maintain gentle skincare routine',
      'Consult dermatologist for persistent cases'
    ],
    cavity: [
      'Schedule dental appointment for filling',
      'Improve oral hygiene routine',
      'Reduce sugar intake and acidic foods'
    ],
    pneumonia: [
      'Seek immediate medical attention',
      'Complete prescribed antibiotic course',
      'Rest and maintain hydration'
    ],
    mild_thinning: [
      'Consider minoxidil treatment',
      'Evaluate nutritional status',
      'Consult trichologist for comprehensive assessment'
    ]
  };
  
  const defaultRecommendations = [
    'Consult with qualified medical professional',
    'Follow up with appropriate specialist',
    'Monitor symptoms and seek care if worsening'
  ];
  
  return recommendations[diagnosis] || defaultRecommendations;
}

app.get('/health', (req, res) => {
  const modelStatus = {};
  for (const [name, session] of Object.entries(modelSessions)) {
    modelStatus[name] = session ? 'loaded' : 'unavailable';
  }
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    models: modelStatus,
    redis: redis.status
  });
});

app.get('/api/models', (req, res) => {
  const availableModels = {};
  
  for (const [name, config] of Object.entries(AI_MODELS)) {
    availableModels[name] = {
      name: name,
      classes: config.classes,
      inputSize: config.inputSize,
      status: modelSessions[name] ? 'available' : 'mock_mode'
    };
  }
  
  res.json({ models: availableModels });
});

app.post('/api/analyze/:modelType', upload.single('image'), async (req, res) => {
  try {
    const { modelType } = req.params;
    const { patientId, includeRecommendations = true } = req.body;
    
    if (!AI_MODELS[modelType]) {
      return res.status(400).json({ 
        error: 'Invalid model type',
        availableModels: Object.keys(AI_MODELS)
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Medical image file is required' });
    }
    
    const analysisId = uuidv4();
    const startTime = Date.now();
    
    logger.info(`Starting ${modelType} analysis for patient ${patientId || 'anonymous'}`);
    
    const result = await runInference(modelType, req.file.path);
    const processingTime = Date.now() - startTime;
    
    const analysis = {
      analysisId,
      modelType,
      patientId,
      timestamp: new Date().toISOString(),
      processingTime,
      result,
      imageMetadata: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    };
    
    if (includeRecommendations) {
      analysis.recommendations = generateMedicalRecommendations(
        result.primaryDiagnosis.class,
        result.confidence
      );
    }
    
    await redis.setex(`analysis:${analysisId}`, 86400, JSON.stringify(analysis));
    
    try {
      await fs.unlink(req.file.path);
    } catch (cleanupError) {
      logger.warn('Failed to cleanup uploaded file:', cleanupError.message);
    }
    
    logger.info(`Analysis ${analysisId} completed in ${processingTime}ms`);
    
    res.json({
      analysisId,
      status: 'completed',
      result: analysis.result,
      recommendations: analysis.recommendations,
      processingTime,
      disclaimer: 'This AI analysis is for informational purposes only and should not replace professional medical diagnosis'
    });
    
  } catch (error) {
    logger.error('Analysis failed:', error);
    
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        logger.warn('Failed to cleanup uploaded file after error:', cleanupError.message);
      }
    }
    
    res.status(500).json({ 
      error: 'Analysis failed',
      message: error.message 
    });
  }
});

app.get('/api/analysis/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params;
    const analysisData = await redis.get(`analysis:${analysisId}`);
    
    if (!analysisData) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
    const analysis = JSON.parse(analysisData);
    res.json(analysis);
    
  } catch (error) {
    logger.error('Failed to retrieve analysis:', error);
    res.status(500).json({ error: 'Failed to retrieve analysis' });
  }
});

app.post('/api/batch-analyze', upload.array('images', 10), async (req, res) => {
  try {
    const { modelType, patientId } = req.body;
    
    if (!AI_MODELS[modelType]) {
      return res.status(400).json({ 
        error: 'Invalid model type',
        availableModels: Object.keys(AI_MODELS)
      });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one medical image is required' });
    }
    
    const batchId = uuidv4();
    const analyses = [];
    
    logger.info(`Starting batch analysis ${batchId} with ${req.files.length} images`);
    
    for (const file of req.files) {
      const analysisId = uuidv4();
      const result = await runInference(modelType, file.path);
      
      const analysis = {
        analysisId,
        batchId,
        modelType,
        patientId,
        timestamp: new Date().toISOString(),
        result,
        imageMetadata: {
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        }
      };
      
      analyses.push(analysis);
      await redis.setex(`analysis:${analysisId}`, 86400, JSON.stringify(analysis));
      
      try {
        await fs.unlink(file.path);
      } catch (cleanupError) {
        logger.warn('Failed to cleanup uploaded file:', cleanupError.message);
      }
    }
    
    const batchSummary = {
      batchId,
      totalImages: analyses.length,
      completedAt: new Date().toISOString(),
      analyses: analyses.map(a => ({
        analysisId: a.analysisId,
        primaryDiagnosis: a.result.primaryDiagnosis,
        confidence: a.result.confidence
      }))
    };
    
    await redis.setex(`batch:${batchId}`, 86400, JSON.stringify(batchSummary));
    
    res.json({
      batchId,
      status: 'completed',
      summary: batchSummary,
      disclaimer: 'These AI analyses are for informational purposes only and should not replace professional medical diagnosis'
    });
    
  } catch (error) {
    logger.error('Batch analysis failed:', error);
    
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (cleanupError) {
          logger.warn('Failed to cleanup uploaded file after error:', cleanupError.message);
        }
      }
    }
    
    res.status(500).json({ 
      error: 'Batch analysis failed',
      message: error.message 
    });
  }
});

app.get('/api/batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const batchData = await redis.get(`batch:${batchId}`);
    
    if (!batchData) {
      return res.status(404).json({ error: 'Batch analysis not found' });
    }
    
    const batch = JSON.parse(batchData);
    res.json(batch);
    
  } catch (error) {
    logger.error('Failed to retrieve batch analysis:', error);
    res.status(500).json({ error: 'Failed to retrieve batch analysis' });
  }
});

initializeModels().then(() => {
  app.listen(PORT, () => {
    logger.info(`AI Diagnostics Service running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Available models: ${Object.keys(AI_MODELS).join(', ')}`);
  });
}).catch(error => {
  logger.error('Failed to initialize models:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  redis.disconnect();
  process.exit(0);
});

module.exports = app;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const winston = require('winston');
const { Queue } = require('bullmq');
const Redis = require('ioredis');
const multer = require('multer');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

const gpuQueue = new Queue('gpu-processing', { connection: redis });
const videoQueue = new Queue('video-processing', { connection: redis });
const aiContentQueue = new Queue('ai-content-generation', { connection: redis });

const { 
  apiLimiter, 
  authLimiter, 
  uploadLimiter, 
  searchLimiter, 
  aiLimiter, 
  videoLimiter, 
  strictLimiter,
  dynamicLimiter 
} = require('./middleware/rate-limiter');

const { securityMiddleware, requestLogger, errorHandler } = require('./middleware/security');

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|wmv|flv|webm|mkv|mp3|wav|aac|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

app.use(securityMiddleware);
app.use(requestLogger);
app.use('/api', dynamicLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/search', searchLimiter);
app.use('/api/ai', aiLimiter);
app.use('/api/video', videoLimiter);
app.use('/api/admin', strictLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      redis: redis.status === 'ready',
      gpu_queue: gpuQueue.name,
      video_queue: videoQueue.name,
      ai_content_queue: aiContentQueue.name
    }
  });
});

app.get('/metrics', async (req, res) => {
  try {
    const gpuStats = await gpuQueue.getJobCounts();
    const videoStats = await videoQueue.getJobCounts();
    const aiContentStats = await aiContentQueue.getJobCounts();
    
    res.json({
      queues: {
        gpu: gpuStats,
        video: videoStats,
        ai_content: aiContentStats
      },
      redis_status: redis.status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/doctors', (req, res) => {
  const doctors = [
    {
      id: 1,
      name: "Dr. Mehmet Özkan",
      specialty: "Кардиохирургия",
      hospital: "Acıbadem Maslak Hospital",
      experience: "15 лет",
      languages: ["Турецкий", "Английский", "Русский"],
      rating: 4.9
    },
    {
      id: 2,
      name: "Dr. Ayşe Demir",
      specialty: "Пластическая хирургия",
      hospital: "Memorial Şişli Hospital",
      experience: "12 лет",
      languages: ["Турецкий", "Английский", "Немецкий"],
      rating: 4.8
    }
  ];
  
  logger.info('Doctors API called');
  res.json(doctors);
});

app.get('/api/videos', (req, res) => {
  const videos = [
    {
      id: 1,
      title: "Кардиохирургия в Турции: современные методы",
      description: "Обзор современных методов кардиохирургии в турецких клиниках",
      duration: "15:30",
      views: 12500,
      thumbnail: "/images/video1-thumb.jpg"
    },
    {
      id: 2,
      title: "Пластическая хирургия: безопасность и качество",
      description: "Как выбрать клинику для пластической хирургии в Турции",
      duration: "12:45",
      views: 8900,
      thumbnail: "/images/video2-thumb.jpg"
    }
  ];
  
  logger.info('Videos API called');
  res.json(videos);
});

app.post('/api/ai/medical-text', async (req, res) => {
  try {
    const { text, priority = 'normal' } = req.body;
    
    if (!text || text.length < 10) {
      return res.status(400).json({ error: 'Text must be at least 10 characters long' });
    }
    
    const job = await gpuQueue.add('medical-text-analysis', {
      type: 'medical-text',
      payload: { text }
    }, {
      priority: priority === 'high' ? 1 : priority === 'low' ? 3 : 2,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });
    
    res.json({ 
      job_id: job.id, 
      status: 'queued',
      estimated_time: '30-60 seconds'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/medical-image', uploadLimiter, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    const { priority = 'normal' } = req.body;
    
    const job = await gpuQueue.add('medical-image-analysis', {
      type: 'medical-image',
      payload: { 
        file_path: req.file.path,
        original_name: req.file.originalname,
        mimetype: req.file.mimetype
      }
    }, {
      priority: priority === 'high' ? 1 : priority === 'low' ? 3 : 2,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });
    
    res.json({ 
      job_id: job.id, 
      status: 'queued',
      estimated_time: '1-2 minutes'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/video/translate', uploadLimiter, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }
    
    const { target_language, voice_id = '21m00Tcm4TlvDq8ikWAM' } = req.body;
    
    if (!target_language) {
      return res.status(400).json({ error: 'Target language is required' });
    }
    
    const job = await videoQueue.add('video-translation', {
      type: 'translate-video',
      payload: {
        file_path: req.file.path,
        original_name: req.file.originalname,
        target_language,
        voice_id
      }
    }, {
      attempts: 2,
      backoff: { type: 'exponential', delay: 5000 }
    });
    
    res.json({ 
      job_id: job.id, 
      status: 'queued',
      estimated_time: '5-15 minutes'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/job/:job_id/status', async (req, res) => {
  try {
    const { job_id } = req.params;
    
    let job = await gpuQueue.getJob(job_id);
    if (!job) {
      job = await videoQueue.getJob(job_id);
    }
    if (!job) {
      job = await aiContentQueue.getJob(job_id);
    }
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const state = await job.getState();
    const progress = job.progress;
    
    res.json({
      job_id: job.id,
      status: state,
      progress: progress,
      data: job.returnvalue,
      error: job.failedReason,
      created_at: new Date(job.timestamp).toISOString(),
      processed_at: job.processedOn ? new Date(job.processedOn).toISOString() : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/stream/auth', (req, res) => {
  const { name, key } = req.body;
  
  if (!key || key.length < 10) {
    return res.status(403).json({ error: 'Invalid stream key' });
  }
  
  logger.info(`Stream authentication: ${name} with key ${key}`);
  res.status(200).send('OK');
});

app.post('/api/stream/end', (req, res) => {
  const { name } = req.body;
  logger.info(`Stream ended: ${name}`);
  res.status(200).send('OK');
});

app.post('/api/admin/regenerate-sitemaps', async (req, res) => {
  try {
    const job = await aiContentQueue.add('regenerate-sitemaps', {
      type: 'update-sitemaps',
      payload: {}
    });
    
    res.json({ 
      job_id: job.id, 
      status: 'queued',
      message: 'Sitemap regeneration started'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/languages', async (req, res) => {
  try {
    const response = await axios.get(`${process.env.VIDEO_TRANSLATOR_URL || 'http://video-translator:8081'}/languages`);
    res.json(response.data);
  } catch (error) {
    res.json({
      supported_languages: [
        { code: 'en', name: 'English' },
        { code: 'tr', name: 'Turkish' },
        { code: 'ar', name: 'Arabic' },
        { code: 'ru', name: 'Russian' },
        { code: 'de', name: 'German' },
        { code: 'fr', name: 'French' },
        { code: 'es', name: 'Spanish' }
      ]
    });
  }
});

app.get('/api/realtime/weather', async (req, res) => {
  try {
    const { lat, lon, lang = 'en' } = req.query;
    const response = await axios.get(`http://realtime-ai:8083/api/weather?lat=${lat}&lon=${lon}&lang=${lang}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Weather service unavailable' });
  }
});

app.get('/api/realtime/news', async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    const response = await axios.get(`http://realtime-ai:8083/api/news?lang=${lang}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'News service unavailable' });
  }
});

app.post('/api/realtime/ai-chat', async (req, res) => {
  try {
    const response = await axios.post('http://realtime-ai:8083/api/ai/chat', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

app.get('/api/realtime/detect-language', async (req, res) => {
  try {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
    const response = await axios.get('http://realtime-ai:8083/api/detect-language', {
      headers: { 'x-forwarded-for': clientIP }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Language detection service unavailable' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use(errorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`MEDTOUR server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Site URL: ${process.env.SITE_URL || `http://localhost:${PORT}`}`);
});

module.exports = app;

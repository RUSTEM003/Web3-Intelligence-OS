const { Worker, Queue } = require('bullmq');
const Redis = require('ioredis');
const axios = require('axios');
const express = require('express');
const winston = require('winston');
require('dotenv').config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: '/var/log/bullmq-worker.log' })
  ]
});

const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379', {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100
});

const gpuQueue = new Queue('gpu-processing', { connection: redis });
const videoQueue = new Queue('video-processing', { connection: redis });
const aiContentQueue = new Queue('ai-content-generation', { connection: redis });

const gpuWorker = new Worker('gpu-processing', async (job) => {
  logger.info(`Processing GPU job ${job.id}`, { jobData: job.data });
  
  try {
    const { type, payload } = job.data;
    
    await job.updateProgress(10);
    
    let result;
    switch (type) {
      case 'medical-text':
        result = await processWithGPUService('/process/medical-text', payload);
        break;
      case 'medical-image':
        result = await processWithGPUService('/process/medical-image', payload);
        break;
      case 'ai-diagnosis':
        result = await processAIDiagnosis(payload);
        break;
      default:
        throw new Error(`Unknown GPU job type: ${type}`);
    }
    
    await job.updateProgress(100);
    logger.info(`GPU job ${job.id} completed successfully`);
    
    return result;
  } catch (error) {
    logger.error(`GPU job ${job.id} failed`, { error: error.message });
    throw error;
  }
}, {
  connection: redis,
  concurrency: parseInt(process.env.GPU_WORKER_CONCURRENCY || '4'),
  limiter: {
    max: 10,
    duration: 60000
  }
});

const videoWorker = new Worker('video-processing', async (job) => {
  logger.info(`Processing video job ${job.id}`, { jobData: job.data });
  
  try {
    const { type, payload } = job.data;
    
    await job.updateProgress(10);
    
    let result;
    switch (type) {
      case 'translate-video':
        result = await processWithVideoService('/translate/video', payload);
        break;
      case 'translate-audio':
        result = await processWithVideoService('/translate/audio', payload);
        break;
      case 'generate-subtitles':
        result = await generateSubtitles(payload);
        break;
      default:
        throw new Error(`Unknown video job type: ${type}`);
    }
    
    await job.updateProgress(100);
    logger.info(`Video job ${job.id} completed successfully`);
    
    return result;
  } catch (error) {
    logger.error(`Video job ${job.id} failed`, { error: error.message });
    throw error;
  }
}, {
  connection: redis,
  concurrency: parseInt(process.env.VIDEO_WORKER_CONCURRENCY || '2'),
  limiter: {
    max: 5,
    duration: 60000
  }
});

const aiContentWorker = new Worker('ai-content-generation', async (job) => {
  logger.info(`Processing AI content job ${job.id}`, { jobData: job.data });
  
  try {
    const { type, payload } = job.data;
    
    await job.updateProgress(10);
    
    let result;
    switch (type) {
      case 'generate-doctor-content':
        result = await generateDoctorContent(payload);
        break;
      case 'generate-medical-article':
        result = await generateMedicalArticle(payload);
        break;
      case 'update-sitemaps':
        result = await updateSitemaps();
        break;
      default:
        throw new Error(`Unknown AI content job type: ${type}`);
    }
    
    await job.updateProgress(100);
    logger.info(`AI content job ${job.id} completed successfully`);
    
    return result;
  } catch (error) {
    logger.error(`AI content job ${job.id} failed`, { error: error.message });
    throw error;
  }
}, {
  connection: redis,
  concurrency: parseInt(process.env.AI_WORKER_CONCURRENCY || '3'),
  limiter: {
    max: 20,
    duration: 60000
  }
});

async function processWithGPUService(endpoint, payload) {
  const response = await axios.post(
    `${process.env.GPU_QUEUE_URL || 'http://gpu-queue:8080'}${endpoint}`,
    payload,
    { timeout: 300000 }
  );
  
  const taskId = response.data.task_id;
  
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const statusResponse = await axios.get(
      `${process.env.GPU_QUEUE_URL || 'http://gpu-queue:8080'}/task/${taskId}`
    );
    
    const status = statusResponse.data.status;
    
    if (status === 'completed') {
      return statusResponse.data.result;
    } else if (status === 'failed') {
      throw new Error(statusResponse.data.error || 'GPU processing failed');
    }
  }
}

async function processWithVideoService(endpoint, payload) {
  const response = await axios.post(
    `${process.env.VIDEO_TRANSLATOR_URL || 'http://video-translator:8081'}${endpoint}`,
    payload,
    { 
      timeout: 600000,
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  );
  
  const taskId = response.data.task_id;
  
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const statusResponse = await axios.get(
      `${process.env.VIDEO_TRANSLATOR_URL || 'http://video-translator:8081'}/task/${taskId}`
    );
    
    const status = statusResponse.data.status;
    
    if (status === 'completed') {
      return statusResponse.data.result;
    } else if (status === 'failed') {
      throw new Error(statusResponse.data.error || 'Video processing failed');
    }
  }
}

async function processAIDiagnosis(payload) {
  const { symptoms, patientData, medicalHistory } = payload;
  
  const diagnosisPrompt = `
    Patient Symptoms: ${symptoms}
    Patient Data: ${JSON.stringify(patientData)}
    Medical History: ${medicalHistory}
    
    Provide a preliminary medical assessment and recommended next steps.
    This is for informational purposes only and should not replace professional medical advice.
  `;
  
  return await processWithGPUService('/process/medical-text', { text: diagnosisPrompt });
}

async function generateSubtitles(payload) {
  const { videoUrl, targetLanguages } = payload;
  
  const subtitles = {};
  
  for (const language of targetLanguages) {
    const result = await processWithVideoService('/translate/video', {
      file: videoUrl,
      target_language: language
    });
    
    subtitles[language] = result.translated_text;
  }
  
  return { subtitles };
}

async function generateDoctorContent(payload) {
  const { doctorId, specialty, location } = payload;
  
  const contentPrompt = `
    Generate professional medical content for a doctor profile:
    Specialty: ${specialty}
    Location: ${location}
    
    Include: professional bio, expertise areas, treatment approaches, patient testimonials template.
  `;
  
  return await processWithGPUService('/process/medical-text', { text: contentPrompt });
}

async function generateMedicalArticle(payload) {
  const { topic, targetAudience, keywords } = payload;
  
  const articlePrompt = `
    Write a comprehensive medical article about: ${topic}
    Target Audience: ${targetAudience}
    Keywords to include: ${keywords.join(', ')}
    
    Structure: Introduction, Main Content, Key Takeaways, Disclaimer
  `;
  
  return await processWithGPUService('/process/medical-text', { text: articlePrompt });
}

async function updateSitemaps() {
  try {
    await axios.post(`${process.env.MEDTOUR_BACKEND_URL || 'http://medtour:3000'}/api/admin/regenerate-sitemaps`);
    return { success: true, message: 'Sitemaps updated successfully' };
  } catch (error) {
    throw new Error(`Failed to update sitemaps: ${error.message}`);
  }
}

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    workers: {
      gpu: gpuWorker.isRunning(),
      video: videoWorker.isRunning(),
      aiContent: aiContentWorker.isRunning()
    },
    queues: {
      gpu: gpuQueue.name,
      video: videoQueue.name,
      aiContent: aiContentQueue.name
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/metrics', async (req, res) => {
  try {
    const gpuStats = await gpuQueue.getJobCounts();
    const videoStats = await videoQueue.getJobCounts();
    const aiContentStats = await aiContentQueue.getJobCounts();
    
    res.json({
      gpu_queue: gpuStats,
      video_queue: videoStats,
      ai_content_queue: aiContentStats,
      workers_active: {
        gpu: gpuWorker.isRunning(),
        video: videoWorker.isRunning(),
        aiContent: aiContentWorker.isRunning()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/queue/gpu', async (req, res) => {
  try {
    const job = await gpuQueue.add('gpu-task', req.body, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
    
    res.json({ jobId: job.id, status: 'queued' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/queue/video', async (req, res) => {
  try {
    const job = await videoQueue.add('video-task', req.body, {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    });
    
    res.json({ jobId: job.id, status: 'queued' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/queue/ai-content', async (req, res) => {
  try {
    const job = await aiContentQueue.add('ai-content-task', req.body, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });
    
    res.json({ jobId: job.id, status: 'queued' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  logger.info(`BullMQ Worker API listening on port ${PORT}`);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down workers...');
  await Promise.all([
    gpuWorker.close(),
    videoWorker.close(),
    aiContentWorker.close()
  ]);
  process.exit(0);
});

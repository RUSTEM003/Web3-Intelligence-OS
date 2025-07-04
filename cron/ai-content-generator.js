const cron = require('node-cron');
const { Queue } = require('bullmq');
const Redis = require('ioredis');
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
    new winston.transports.File({ filename: '/var/log/ai-content-generator.log' })
  ]
});

const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379', {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100
});

const aiContentQueue = new Queue('ai-content-generation', { connection: redis });

const CONTENT_GENERATION_SCHEDULES = {
  'doctor-profiles': '0 2 * * *',
  'medical-articles': '0 4 * * 1,3,5',
  'health-tips': '0 6 * * *',
  'sitemap-updates': '0 1 * * *',
  'trending-topics': '0 */6 * * *',
  'patient-testimonials': '0 3 * * 2,4,6'
};

const MEDICAL_SPECIALTIES = [
  'cardiology', 'neurology', 'oncology', 'orthopedics', 'dermatology',
  'gastroenterology', 'endocrinology', 'psychiatry', 'pediatrics', 'gynecology',
  'urology', 'ophthalmology', 'otolaryngology', 'radiology', 'anesthesiology'
];

const HEALTH_TOPICS = [
  'diabetes management', 'heart health', 'mental wellness', 'nutrition',
  'exercise and fitness', 'preventive care', 'cancer screening',
  'women health', 'men health', 'pediatric care', 'elderly care',
  'chronic disease management', 'surgical procedures', 'medical technology'
];

async function generateDoctorProfiles() {
  logger.info('Starting doctor profile generation');
  
  const profileCount = Math.floor(Math.random() * 5) + 3;
  
  for (let i = 0; i < profileCount; i++) {
    const specialty = MEDICAL_SPECIALTIES[Math.floor(Math.random() * MEDICAL_SPECIALTIES.length)];
    const location = ['Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Bursa'][Math.floor(Math.random() * 5)];
    
    await aiContentQueue.add('ai-content-task', {
      type: 'generate-doctor-content',
      payload: {
        doctorId: `doc_${Date.now()}_${i}`,
        specialty: specialty,
        location: location,
        language: 'en'
      }
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
    
    logger.info(`Queued doctor profile generation for ${specialty} in ${location}`);
  }
}

async function generateMedicalArticles() {
  logger.info('Starting medical article generation');
  
  const articleCount = Math.floor(Math.random() * 3) + 2;
  
  for (let i = 0; i < articleCount; i++) {
    const topic = HEALTH_TOPICS[Math.floor(Math.random() * HEALTH_TOPICS.length)];
    const targetAudience = ['patients', 'healthcare professionals', 'general public'][Math.floor(Math.random() * 3)];
    const keywords = HEALTH_TOPICS.filter(t => t !== topic).slice(0, 3);
    
    await aiContentQueue.add('ai-content-task', {
      type: 'generate-medical-article',
      payload: {
        topic: topic,
        targetAudience: targetAudience,
        keywords: keywords,
        language: 'en',
        wordCount: Math.floor(Math.random() * 1000) + 800
      }
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
    
    logger.info(`Queued medical article generation for topic: ${topic}`);
  }
}

async function generateHealthTips() {
  logger.info('Starting health tips generation');
  
  const tipCount = Math.floor(Math.random() * 8) + 5;
  
  for (let i = 0; i < tipCount; i++) {
    const category = HEALTH_TOPICS[Math.floor(Math.random() * HEALTH_TOPICS.length)];
    
    await aiContentQueue.add('ai-content-task', {
      type: 'generate-health-tip',
      payload: {
        category: category,
        format: ['short', 'detailed'][Math.floor(Math.random() * 2)],
        language: 'en'
      }
    }, {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });
  }
  
  logger.info(`Queued ${tipCount} health tips generation`);
}

async function updateSitemaps() {
  logger.info('Starting sitemap update');
  
  await aiContentQueue.add('ai-content-task', {
    type: 'update-sitemaps',
    payload: {
      regenerate: true,
      notify_search_engines: true
    }
  }, {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  });
  
  logger.info('Queued sitemap update task');
}

async function generateTrendingTopics() {
  logger.info('Starting trending topics analysis and content generation');
  
  await aiContentQueue.add('ai-content-task', {
    type: 'analyze-trending-topics',
    payload: {
      sources: ['medical-news', 'research-papers', 'social-media'],
      generate_content: true,
      language: 'en'
    }
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000
    }
  });
  
  logger.info('Queued trending topics analysis');
}

async function generatePatientTestimonials() {
  logger.info('Starting patient testimonial generation');
  
  const testimonialCount = Math.floor(Math.random() * 4) + 2;
  
  for (let i = 0; i < testimonialCount; i++) {
    const specialty = MEDICAL_SPECIALTIES[Math.floor(Math.random() * MEDICAL_SPECIALTIES.length)];
    const treatment = HEALTH_TOPICS[Math.floor(Math.random() * HEALTH_TOPICS.length)];
    
    await aiContentQueue.add('ai-content-task', {
      type: 'generate-patient-testimonial',
      payload: {
        specialty: specialty,
        treatment: treatment,
        rating: Math.floor(Math.random() * 2) + 4,
        language: 'en'
      }
    }, {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 1500
      }
    });
  }
  
  logger.info(`Queued ${testimonialCount} patient testimonials generation`);
}

cron.schedule(CONTENT_GENERATION_SCHEDULES['doctor-profiles'], async () => {
  try {
    await generateDoctorProfiles();
  } catch (error) {
    logger.error('Error in doctor profiles generation:', error);
  }
});

cron.schedule(CONTENT_GENERATION_SCHEDULES['medical-articles'], async () => {
  try {
    await generateMedicalArticles();
  } catch (error) {
    logger.error('Error in medical articles generation:', error);
  }
});

cron.schedule(CONTENT_GENERATION_SCHEDULES['health-tips'], async () => {
  try {
    await generateHealthTips();
  } catch (error) {
    logger.error('Error in health tips generation:', error);
  }
});

cron.schedule(CONTENT_GENERATION_SCHEDULES['sitemap-updates'], async () => {
  try {
    await updateSitemaps();
  } catch (error) {
    logger.error('Error in sitemap updates:', error);
  }
});

cron.schedule(CONTENT_GENERATION_SCHEDULES['trending-topics'], async () => {
  try {
    await generateTrendingTopics();
  } catch (error) {
    logger.error('Error in trending topics generation:', error);
  }
});

cron.schedule(CONTENT_GENERATION_SCHEDULES['patient-testimonials'], async () => {
  try {
    await generatePatientTestimonials();
  } catch (error) {
    logger.error('Error in patient testimonials generation:', error);
  }
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down AI content generator...');
  await redis.disconnect();
  process.exit(0);
});

logger.info('AI Content Generator started with schedules:', CONTENT_GENERATION_SCHEDULES);

module.exports = {
  generateDoctorProfiles,
  generateMedicalArticles,
  generateHealthTips,
  updateSitemaps,
  generateTrendingTopics,
  generatePatientTestimonials
};

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const Redis = require('ioredis');
const geoip = require('geoip-lite');
const acceptLanguage = require('accept-language-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8086;

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
    new winston.transports.File({ filename: '/var/log/localization.log' })
  ]
});

const SUPPORTED_LANGUAGES = {
  'tr': {
    name: 'Türkçe',
    country: 'Turkey',
    domain: 'tr.medtour.ai',
    currency: 'TRY',
    timezone: 'Europe/Istanbul',
    flag: '🇹🇷'
  },
  'en': {
    name: 'English',
    country: 'International',
    domain: 'medtour.ai',
    currency: 'USD',
    timezone: 'UTC',
    flag: '🇺🇸'
  },
  'de': {
    name: 'Deutsch',
    country: 'Germany',
    domain: 'de.medtour.ai',
    currency: 'EUR',
    timezone: 'Europe/Berlin',
    flag: '🇩🇪'
  },
  'ru': {
    name: 'Русский',
    country: 'Russia',
    domain: 'ru.medtour.ai',
    currency: 'RUB',
    timezone: 'Europe/Moscow',
    flag: '🇷🇺'
  },
  'ar': {
    name: 'العربية',
    country: 'Arab Countries',
    domain: 'ar.medtour.ai',
    currency: 'USD',
    timezone: 'Asia/Dubai',
    flag: '🇸🇦'
  },
  'fr': {
    name: 'Français',
    country: 'France',
    domain: 'fr.medtour.ai',
    currency: 'EUR',
    timezone: 'Europe/Paris',
    flag: '🇫🇷'
  },
  'es': {
    name: 'Español',
    country: 'Spain',
    domain: 'es.medtour.ai',
    currency: 'EUR',
    timezone: 'Europe/Madrid',
    flag: '🇪🇸'
  },
  'it': {
    name: 'Italiano',
    country: 'Italy',
    domain: 'it.medtour.ai',
    currency: 'EUR',
    timezone: 'Europe/Rome',
    flag: '🇮🇹'
  }
};

const COUNTRY_TO_LANGUAGE = {
  'TR': 'tr',
  'DE': 'de',
  'RU': 'ru',
  'SA': 'ar',
  'AE': 'ar',
  'QA': 'ar',
  'KW': 'ar',
  'BH': 'ar',
  'OM': 'ar',
  'JO': 'ar',
  'LB': 'ar',
  'SY': 'ar',
  'IQ': 'ar',
  'EG': 'ar',
  'FR': 'fr',
  'ES': 'es',
  'IT': 'it',
  'US': 'en',
  'GB': 'en',
  'CA': 'en',
  'AU': 'en',
  'NZ': 'en'
};

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: Object.keys(SUPPORTED_LANGUAGES),
    preload: Object.keys(SUPPORTED_LANGUAGES),
    
    backend: {
      loadPath: '/app/locales/{{lng}}/{{ns}}.json'
    },
    
    detection: {
      order: ['path', 'header', 'querystring', 'cookie'],
      caches: ['cookie']
    },
    
    interpolation: {
      escapeValue: false
    }
  });

app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    const allowedDomains = Object.values(SUPPORTED_LANGUAGES).map(lang => `https://${lang.domain}`);
    allowedDomains.push('https://www.medtour.ai');
    
    if (process.env.NODE_ENV === 'development') {
      allowedDomains.push('http://localhost:3000', 'http://localhost:5173');
    }
    
    if (!origin || allowedDomains.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(middleware.handle(i18next));

function detectLanguageFromIP(ip) {
  try {
    const geo = geoip.lookup(ip);
    if (geo && geo.country) {
      const language = COUNTRY_TO_LANGUAGE[geo.country];
      if (language) {
        logger.info(`Detected language ${language} for country ${geo.country} from IP ${ip}`);
        return language;
      }
    }
  } catch (error) {
    logger.warn(`Failed to detect language from IP ${ip}:`, error.message);
  }
  return 'en';
}

function detectLanguageFromDomain(host) {
  if (!host) return 'en';
  
  for (const [lang, config] of Object.entries(SUPPORTED_LANGUAGES)) {
    if (host.includes(config.domain.replace('https://', ''))) {
      return lang;
    }
  }
  return 'en';
}

function detectLanguageFromHeaders(acceptLanguageHeader) {
  if (!acceptLanguageHeader) return 'en';
  
  try {
    const languages = acceptLanguage.parse(acceptLanguageHeader);
    for (const lang of languages) {
      const code = lang.code.toLowerCase();
      if (SUPPORTED_LANGUAGES[code]) {
        return code;
      }
    }
  } catch (error) {
    logger.warn('Failed to parse Accept-Language header:', error.message);
  }
  return 'en';
}

async function getClinicsByLanguage(language, specialization = null) {
  const cacheKey = `clinics:${language}:${specialization || 'all'}`;
  
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    const mockClinics = [
      {
        id: 1,
        name: language === 'tr' ? 'Acıbadem Hastanesi' : 'Acibadem Hospital',
        specialization: 'cardiology',
        language: language,
        location: language === 'tr' ? 'İstanbul, Türkiye' : 'Istanbul, Turkey',
        rating: 4.8,
        price: language === 'tr' ? '15000 TL' : '$2500',
        description: language === 'tr' ? 'Kalp cerrahisinde uzman hastane' : 'Specialized cardiac surgery hospital'
      },
      {
        id: 2,
        name: language === 'de' ? 'Charité Universitätsmedizin' : 'Medical Center Berlin',
        specialization: 'oncology',
        language: language,
        location: language === 'de' ? 'Berlin, Deutschland' : 'Berlin, Germany',
        rating: 4.9,
        price: language === 'de' ? '8000 EUR' : '$8500',
        description: language === 'de' ? 'Führende Krebsbehandlung' : 'Leading cancer treatment center'
      }
    ];
    
    const filteredClinics = specialization 
      ? mockClinics.filter(c => c.specialization === specialization)
      : mockClinics;
    
    await redis.setex(cacheKey, 3600, JSON.stringify(filteredClinics));
    return filteredClinics;
    
  } catch (error) {
    logger.error('Failed to get clinics by language:', error);
    return [];
  }
}

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    supportedLanguages: Object.keys(SUPPORTED_LANGUAGES),
    redis: redis.status
  });
});

app.get('/api/languages', (req, res) => {
  res.json({
    supported: SUPPORTED_LANGUAGES,
    default: 'en'
  });
});

app.get('/api/detect-language', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
  const host = req.headers.host;
  const acceptLanguage = req.headers['accept-language'];
  
  const detectedLanguages = {
    fromIP: detectLanguageFromIP(ip),
    fromDomain: detectLanguageFromDomain(host),
    fromHeaders: detectLanguageFromHeaders(acceptLanguage)
  };
  
  const finalLanguage = detectedLanguages.fromDomain !== 'en' 
    ? detectedLanguages.fromDomain 
    : detectedLanguages.fromIP !== 'en' 
      ? detectedLanguages.fromIP 
      : detectedLanguages.fromHeaders;
  
  res.json({
    detected: detectedLanguages,
    recommended: finalLanguage,
    config: SUPPORTED_LANGUAGES[finalLanguage],
    clientInfo: {
      ip: ip,
      host: host,
      userAgent: req.headers['user-agent']
    }
  });
});

app.get('/api/localize/:language', async (req, res) => {
  try {
    const { language } = req.params;
    
    if (!SUPPORTED_LANGUAGES[language]) {
      return res.status(400).json({ 
        error: 'Unsupported language',
        supported: Object.keys(SUPPORTED_LANGUAGES)
      });
    }
    
    const config = SUPPORTED_LANGUAGES[language];
    const clinics = await getClinicsByLanguage(language);
    
    const localizationData = {
      language: language,
      config: config,
      clinics: clinics,
      translations: {
        common: {
          welcome: req.t('welcome'),
          search: req.t('search'),
          book_appointment: req.t('book_appointment'),
          contact_us: req.t('contact_us'),
          about: req.t('about'),
          services: req.t('services')
        },
        medical: {
          specializations: req.t('specializations'),
          doctors: req.t('doctors'),
          hospitals: req.t('hospitals'),
          treatments: req.t('treatments')
        }
      },
      formatting: {
        currency: config.currency,
        timezone: config.timezone,
        dateFormat: language === 'en' ? 'MM/DD/YYYY' : 'DD.MM.YYYY'
      }
    };
    
    await redis.setex(`localization:${language}`, 1800, JSON.stringify(localizationData));
    
    res.json(localizationData);
    
  } catch (error) {
    logger.error('Localization failed:', error);
    res.status(500).json({ error: 'Localization failed' });
  }
});

app.post('/api/match-clinic', async (req, res) => {
  try {
    const { patientPreferences } = req.body;
    const { language, specialization, budget, location } = patientPreferences;
    
    if (!language || !SUPPORTED_LANGUAGES[language]) {
      return res.status(400).json({ error: 'Valid language is required' });
    }
    
    const clinics = await getClinicsByLanguage(language, specialization);
    
    const rankedClinics = clinics
      .filter(clinic => {
        if (specialization && clinic.specialization !== specialization) return false;
        if (budget && parseInt(clinic.price.replace(/[^\d]/g, '')) > budget) return false;
        return true;
      })
      .map(clinic => ({
        ...clinic,
        matchScore: Math.random() * 0.3 + 0.7,
        reasons: [
          `Language match: ${SUPPORTED_LANGUAGES[language].name}`,
          specialization ? `Specialization: ${specialization}` : 'General medicine',
          'High patient satisfaction rating'
        ]
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
    
    res.json({
      matches: rankedClinics,
      total: rankedClinics.length,
      language: language,
      criteria: patientPreferences
    });
    
  } catch (error) {
    logger.error('Clinic matching failed:', error);
    res.status(500).json({ error: 'Clinic matching failed' });
  }
});

app.get('/api/content/:language/:type', async (req, res) => {
  try {
    const { language, type } = req.params;
    
    if (!SUPPORTED_LANGUAGES[language]) {
      return res.status(400).json({ error: 'Unsupported language' });
    }
    
    const cacheKey = `content:${language}:${type}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    const content = {
      homepage: {
        hero: {
          title: language === 'tr' ? 'Türkiye\'de Dünya Standartında Sağlık Hizmeti' : 'World-Class Healthcare in Turkey',
          subtitle: language === 'tr' ? 'AI destekli platform ile en iyi doktorları bulun' : 'Find the best doctors with AI-powered platform',
          cta: language === 'tr' ? 'Hemen Başla' : 'Get Started Now'
        },
        features: [
          {
            title: language === 'tr' ? 'AI Doktor Eşleştirme' : 'AI Doctor Matching',
            description: language === 'tr' ? 'Yapay zeka ile size en uygun doktoru bulun' : 'Find the most suitable doctor with artificial intelligence'
          },
          {
            title: language === 'tr' ? 'Video Konsültasyon' : 'Video Consultation',
            description: language === 'tr' ? 'Güvenli video görüşme ile doktorlarla iletişim' : 'Secure video communication with doctors'
          }
        ]
      },
      doctors: {
        title: language === 'tr' ? 'Uzman Doktorlarımız' : 'Our Specialist Doctors',
        specializations: language === 'tr' 
          ? ['Kardiyoloji', 'Onkoloji', 'Plastik Cerrahi', 'Göz Hastalıkları']
          : ['Cardiology', 'Oncology', 'Plastic Surgery', 'Ophthalmology']
      }
    };
    
    const responseData = content[type] || { error: 'Content type not found' };
    
    await redis.setex(cacheKey, 3600, JSON.stringify(responseData));
    res.json(responseData);
    
  } catch (error) {
    logger.error('Content retrieval failed:', error);
    res.status(500).json({ error: 'Content retrieval failed' });
  }
});

app.get('/api/redirect-domain/:language', (req, res) => {
  const { language } = req.params;
  const config = SUPPORTED_LANGUAGES[language];
  
  if (!config) {
    return res.status(400).json({ error: 'Unsupported language' });
  }
  
  const redirectUrl = `https://${config.domain}`;
  
  res.json({
    redirectUrl: redirectUrl,
    language: language,
    domain: config.domain,
    country: config.country
  });
});

app.listen(PORT, () => {
  logger.info(`Localization Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Supported languages: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  redis.disconnect();
  process.exit(0);
});

module.exports = app;

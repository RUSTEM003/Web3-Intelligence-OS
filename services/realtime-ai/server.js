require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const cron = require('node-cron');
const geoip = require('geoip-lite');
const winston = require('winston');
const Parser = require('rss-parser');
const moment = require('moment-timezone');
const OpenAI = require('openai');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8083;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const parser = new Parser();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

app.use(helmet());
app.use(cors());
app.use(express.json());

const weatherCache = new Map();
const newsCache = new Map();
const aiResponseCache = new Map();

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

const MEDICAL_NEWS_SOURCES = [
  'https://www.medicalnewstoday.com/rss',
  'https://feeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC',
  'https://www.healthline.com/rss',
  'https://rss.cnn.com/rss/edition.rss'
];

const LANGUAGE_MAPPINGS = {
  'TR': 'tr',
  'US': 'en',
  'GB': 'en',
  'RU': 'ru',
  'DE': 'de',
  'FR': 'fr',
  'ES': 'es',
  'AR': 'ar',
  'SA': 'ar',
  'AE': 'ar'
};

const MEDICAL_TRANSLATIONS = {
  'en': {
    weather: 'Current Weather',
    news: 'Medical News',
    ai_assistant: 'AI Medical Assistant',
    ask_question: 'Ask a medical question...',
    processing: 'Processing your request...'
  },
  'tr': {
    weather: 'Güncel Hava Durumu',
    news: 'Tıbbi Haberler',
    ai_assistant: 'AI Tıbbi Asistan',
    ask_question: 'Tıbbi bir soru sorun...',
    processing: 'İsteğiniz işleniyor...'
  },
  'ru': {
    weather: 'Текущая Погода',
    news: 'Медицинские Новости',
    ai_assistant: 'ИИ Медицинский Ассистент',
    ask_question: 'Задайте медицинский вопрос...',
    processing: 'Обрабатываем ваш запрос...'
  },
  'ar': {
    weather: 'الطقس الحالي',
    news: 'الأخبار الطبية',
    ai_assistant: 'المساعد الطبي الذكي',
    ask_question: 'اسأل سؤالاً طبياً...',
    processing: 'جاري معالجة طلبك...'
  },
  'de': {
    weather: 'Aktuelles Wetter',
    news: 'Medizinische Nachrichten',
    ai_assistant: 'KI-Medizinischer Assistent',
    ask_question: 'Stellen Sie eine medizinische Frage...',
    processing: 'Ihre Anfrage wird bearbeitet...'
  },
  'fr': {
    weather: 'Météo Actuelle',
    news: 'Actualités Médicales',
    ai_assistant: 'Assistant Médical IA',
    ask_question: 'Posez une question médicale...',
    processing: 'Traitement de votre demande...'
  },
  'es': {
    weather: 'Clima Actual',
    news: 'Noticias Médicas',
    ai_assistant: 'Asistente Médico IA',
    ask_question: 'Haga una pregunta médica...',
    processing: 'Procesando su solicitud...'
  }
};

function detectLanguageFromIP(ip) {
  const geo = geoip.lookup(ip);
  if (geo && geo.country) {
    return LANGUAGE_MAPPINGS[geo.country] || 'en';
  }
  return 'en';
}

function getLocalizedText(lang, key) {
  return MEDICAL_TRANSLATIONS[lang] && MEDICAL_TRANSLATIONS[lang][key] 
    ? MEDICAL_TRANSLATIONS[lang][key] 
    : MEDICAL_TRANSLATIONS['en'][key];
}

async function getWeatherData(lat, lon, lang = 'en') {
  const cacheKey = `${lat}_${lon}_${lang}`;
  
  if (weatherCache.has(cacheKey)) {
    const cached = weatherCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 600000) {
      return cached.data;
    }
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=${lang}`
    );
    
    const weatherData = {
      temperature: Math.round(response.data.main.temp),
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      city: response.data.name,
      country: response.data.sys.country,
      icon: response.data.weather[0].icon,
      timestamp: Date.now()
    };

    weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
    return weatherData;
  } catch (error) {
    logger.error('Weather API error:', error.message);
    return null;
  }
}

async function getMedicalNews(lang = 'en') {
  const cacheKey = `news_${lang}`;
  
  if (newsCache.has(cacheKey)) {
    const cached = newsCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 1800000) {
      return cached.data;
    }
  }

  try {
    const allNews = [];
    
    for (const source of MEDICAL_NEWS_SOURCES) {
      try {
        const feed = await parser.parseURL(source);
        const newsItems = feed.items.slice(0, 5).map(item => ({
          title: item.title,
          description: item.contentSnippet || item.description,
          link: item.link,
          pubDate: item.pubDate,
          source: feed.title
        }));
        allNews.push(...newsItems);
      } catch (sourceError) {
        logger.warn(`Failed to fetch from ${source}:`, sourceError.message);
      }
    }

    const sortedNews = allNews
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 10);

    if (lang !== 'en') {
      for (const item of sortedNews) {
        try {
          const translatedTitle = await translateText(item.title, lang);
          const translatedDesc = await translateText(item.description, lang);
          item.title = translatedTitle;
          item.description = translatedDesc;
        } catch (translateError) {
          logger.warn('Translation error:', translateError.message);
        }
      }
    }

    newsCache.set(cacheKey, { data: sortedNews, timestamp: Date.now() });
    return sortedNews;
  } catch (error) {
    logger.error('News fetch error:', error.message);
    return [];
  }
}

async function translateText(text, targetLang) {
  if (targetLang === 'en') return text;
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Translate the following text to ${targetLang}. Return only the translation, no explanations.`
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    logger.error('Translation error:', error.message);
    return text;
  }
}

async function getMedicalAIResponse(question, lang = 'en') {
  const cacheKey = `ai_${question}_${lang}`;
  
  if (aiResponseCache.has(cacheKey)) {
    const cached = aiResponseCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 3600000) {
      return cached.data;
    }
  }

  try {
    const systemPrompt = lang === 'en' 
      ? "You are a medical AI assistant. Provide helpful, accurate medical information while always recommending users consult with healthcare professionals for serious concerns. Keep responses concise and informative."
      : `You are a medical AI assistant. Respond in ${lang}. Provide helpful, accurate medical information while always recommending users consult with healthcare professionals for serious concerns. Keep responses concise and informative.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: question
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    });

    const aiResponse = response.choices[0].message.content.trim();
    aiResponseCache.set(cacheKey, { data: aiResponse, timestamp: Date.now() });
    return aiResponse;
  } catch (error) {
    logger.error('OpenAI API error:', error.message);
    return lang === 'en' 
      ? "I'm sorry, I'm currently unable to process your request. Please try again later."
      : "Üzgünüm, şu anda isteğinizi işleyemiyorum. Lütfen daha sonra tekrar deneyin.";
  }
}

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      openai: !!process.env.OPENAI_API_KEY,
      weather: !!process.env.OPENWEATHER_API_KEY,
      news: !!process.env.NEWS_API_KEY
    }
  });
});

app.get('/api/detect-language', (req, res) => {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
  const language = detectLanguageFromIP(clientIP);
  const geo = geoip.lookup(clientIP);
  
  res.json({
    language,
    country: geo ? geo.country : null,
    city: geo ? geo.city : null,
    timezone: geo ? geo.timezone : null,
    translations: MEDICAL_TRANSLATIONS[language] || MEDICAL_TRANSLATIONS['en']
  });
});

app.get('/api/weather', async (req, res) => {
  const { lat, lon, lang = 'en' } = req.query;
  
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  const weather = await getWeatherData(parseFloat(lat), parseFloat(lon), lang);
  
  if (weather) {
    res.json(weather);
  } else {
    res.status(500).json({ error: 'Unable to fetch weather data' });
  }
});

app.get('/api/news', async (req, res) => {
  const { lang = 'en' } = req.query;
  const news = await getMedicalNews(lang);
  res.json(news);
});

app.post('/api/ai/chat', async (req, res) => {
  const { question, lang = 'en' } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const response = await getMedicalAIResponse(question, lang);
  res.json({ response, timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  logger.info('Client connected:', socket.id);

  socket.on('join-realtime', async (data) => {
    const { lat, lon, lang = 'en' } = data;
    
    socket.join('realtime-updates');
    
    if (lat && lon) {
      const weather = await getWeatherData(lat, lon, lang);
      socket.emit('weather-update', weather);
    }
    
    const news = await getMedicalNews(lang);
    socket.emit('news-update', news);
  });

  socket.on('ai-question', async (data) => {
    const { question, lang = 'en' } = data;
    
    socket.emit('ai-thinking', { message: getLocalizedText(lang, 'processing') });
    
    const response = await getMedicalAIResponse(question, lang);
    socket.emit('ai-response', { 
      question, 
      response, 
      timestamp: new Date().toISOString() 
    });
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

cron.schedule('*/10 * * * *', async () => {
  logger.info('Broadcasting real-time updates to all connected clients');
  
  const news = await getMedicalNews('en');
  io.to('realtime-updates').emit('news-update', news);
});

cron.schedule('0 */6 * * *', () => {
  logger.info('Clearing caches');
  weatherCache.clear();
  newsCache.clear();
  aiResponseCache.clear();
});

server.listen(PORT, () => {
  logger.info(`Real-time AI service running on port ${PORT}`);
});

module.exports = app;

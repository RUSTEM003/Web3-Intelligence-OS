require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 3000;

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

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

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

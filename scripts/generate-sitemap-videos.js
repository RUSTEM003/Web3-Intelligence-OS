const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const path = require('path');

const videos = [
  {
    id: 1,
    title: "Кардиохирургия в Турции: современные методы",
    slug: "cardiosurgery-turkey-modern-methods",
    category: "cardiosurgery"
  },
  {
    id: 2,
    title: "Пластическая хирургия: безопасность и качество",
    slug: "plastic-surgery-safety-quality",
    category: "plastic-surgery"
  },
  {
    id: 3,
    title: "Ортопедия в Турции: инновационные решения",
    slug: "orthopedics-turkey-innovations",
    category: "orthopedics"
  },
  {
    id: 4,
    title: "Онкология: передовые методы лечения",
    slug: "oncology-advanced-treatments",
    category: "oncology"
  },
  {
    id: 5,
    title: "Нейрохирургия: точность и безопасность",
    slug: "neurosurgery-precision-safety",
    category: "neurosurgery"
  },
  {
    id: 6,
    title: "Медицинский туризм в Турции: полный гид",
    slug: "medical-tourism-turkey-complete-guide",
    category: "general"
  }
];

async function generateVideosSitemap() {
  const siteUrl = process.env.SITE_URL || 'https://medtour.ai';
  const sitemap = new SitemapStream({ hostname: siteUrl });
  
  sitemap.write({
    url: '/videos',
    changefreq: 'daily',
    priority: 0.8,
    lastmod: new Date().toISOString()
  });

  videos.forEach(video => {
    sitemap.write({
      url: `/videos/${video.slug}`,
      changefreq: 'monthly',
      priority: 0.7,
      lastmod: new Date().toISOString()
    });
  });

  const categories = [...new Set(videos.map(v => v.category))];
  categories.forEach(category => {
    sitemap.write({
      url: `/videos/category/${category}`,
      changefreq: 'weekly',
      priority: 0.6,
      lastmod: new Date().toISOString()
    });
  });

  sitemap.end();

  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap-videos.xml');
  const writeStream = createWriteStream(sitemapPath);
  
  try {
    const data = await streamToPromise(sitemap);
    writeStream.write(data);
    writeStream.end();
    
    console.log('Videos sitemap generated successfully at:', sitemapPath);
    console.log(`Generated ${videos.length + categories.length + 1} URLs for videos and categories`);
  } catch (error) {
    console.error('Error generating videos sitemap:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  generateVideosSitemap();
}

module.exports = { generateVideosSitemap, videos };

const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const path = require('path');

const doctors = [
  {
    id: 1,
    name: "Dr. Mehmet Özkan",
    specialty: "cardiosurgery",
    slug: "dr-mehmet-ozkan-cardiosurgery"
  },
  {
    id: 2,
    name: "Dr. Ayşe Demir", 
    specialty: "plastic-surgery",
    slug: "dr-ayse-demir-plastic-surgery"
  },
  {
    id: 3,
    name: "Dr. Ali Yılmaz",
    specialty: "orthopedics",
    slug: "dr-ali-yilmaz-orthopedics"
  },
  {
    id: 4,
    name: "Dr. Fatma Kaya",
    specialty: "oncology",
    slug: "dr-fatma-kaya-oncology"
  },
  {
    id: 5,
    name: "Dr. Emre Şahin",
    specialty: "neurosurgery",
    slug: "dr-emre-sahin-neurosurgery"
  }
];

async function generateDoctorsSitemap() {
  const siteUrl = process.env.SITE_URL || 'https://medtour.ai';
  const sitemap = new SitemapStream({ hostname: siteUrl });
  
  sitemap.write({
    url: '/doctors',
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: new Date().toISOString()
  });

  doctors.forEach(doctor => {
    sitemap.write({
      url: `/doctors/${doctor.slug}`,
      changefreq: 'monthly',
      priority: 0.7,
      lastmod: new Date().toISOString()
    });
    
    sitemap.write({
      url: `/specialties/${doctor.specialty}`,
      changefreq: 'weekly',
      priority: 0.6,
      lastmod: new Date().toISOString()
    });
  });

  sitemap.end();

  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap-doctors.xml');
  const writeStream = createWriteStream(sitemapPath);
  
  try {
    const data = await streamToPromise(sitemap);
    writeStream.write(data);
    writeStream.end();
    
    console.log('Doctors sitemap generated successfully at:', sitemapPath);
    console.log(`Generated ${doctors.length * 2 + 1} URLs for doctors and specialties`);
  } catch (error) {
    console.error('Error generating doctors sitemap:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  generateDoctorsSitemap();
}

module.exports = { generateDoctorsSitemap, doctors };

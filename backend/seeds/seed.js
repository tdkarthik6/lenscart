require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const SERVICES = [
  {
    name: 'Wedding Photography',
    description: 'Capture your most precious wedding moments with our professional candid and traditional photography. We tell the story of your special day through stunning, emotionally rich photographs that you will cherish forever.',
    price: 35000,
    duration_minutes: 480,
    image_url: '/images/service-wedding-photography.jpg',
    included_features: JSON.stringify([
      'Full day coverage (8 hours)',
      'Candid & traditional photography',
      '500+ edited digital photos',
      'Online photo gallery',
      'USB with all photos',
      'Print-ready resolution',
    ]),
  },
  {
    name: 'Wedding Videography',
    description: 'Relive your wedding day through a beautifully crafted cinematic film. Our videographers capture every laugh, tear, and dance move in stunning 4K quality with professional audio.',
    price: 45000,
    duration_minutes: 600,
    image_url: '/images/service-wedding-videography.jpg',
    included_features: JSON.stringify([
      'Full day coverage (10 hours)',
      '4K cinematic wedding film',
      'Ceremony & reception highlights',
      'Drone footage (if permitted)',
      'Professional audio',
      'Same day edit teaser',
    ]),
  },
  {
    name: 'Pre-Wedding Shoot',
    description: 'Create stunning pre-wedding memories at iconic Indian locations. From Rajasthan palaces to Kerala backwaters, we capture your love story in the most beautiful settings across India.',
    price: 18000,
    duration_minutes: 240,
    image_url: '/images/service-prewedding.jpg',
    included_features: JSON.stringify([
      '4-hour shoot session',
      'Multiple outfit changes',
      '150+ edited digital photos',
      'Location scouting assistance',
      'Props arrangement',
      'Online gallery delivery',
    ]),
  },
  {
    name: 'Birthday Photography',
    description: 'Make your birthday celebration unforgettable with our vibrant photography. From intimate gatherings to grand parties, we capture every joyful moment with artistic flair.',
    price: 12000,
    duration_minutes: 180,
    image_url: '/images/service-birthday.jpg',
    included_features: JSON.stringify([
      '3-hour event coverage',
      '200+ edited photos',
      'Candid & portrait shots',
      'Cake cutting ceremony',
      'Group photos',
      'Online gallery delivery',
    ]),
  },
  {
    name: 'Event Videography',
    description: 'Professional video coverage for corporate events, conferences, product launches, and cultural festivals. We deliver broadcast-quality videos that showcase your event at its best.',
    price: 25000,
    duration_minutes: 360,
    image_url: '/images/service-event-videography.jpg',
    included_features: JSON.stringify([
      '6-hour coverage',
      '4K video production',
      'Multi-camera setup',
      'Professional audio recording',
      'Highlight reel',
      'Full event film',
    ]),
  },
  {
    name: 'Corporate Event Photography',
    description: 'Elevate your brand with professional corporate photography. We cover conferences, product launches, team events, and promotional shoots with sharp, polished imagery.',
    price: 20000,
    duration_minutes: 300,
    image_url: '/images/service-corporate.jpg',
    included_features: JSON.stringify([
      '5-hour coverage',
      '300+ edited photos',
      'Headshot portraits',
      'Event documentation',
      'Brand-consistent editing',
      'Quick 48-hour delivery',
    ]),
  },
  {
    name: 'Product Photography',
    description: 'Showcase your products in the best light with our commercial product photography. Perfect for e-commerce, catalogues, and advertising campaigns.',
    price: 8000,
    duration_minutes: 120,
    image_url: '/images/service-product.jpg',
    included_features: JSON.stringify([
      'Studio/location setup',
      'Up to 20 products',
      '5 angles per product',
      'White & lifestyle backgrounds',
      'Retouched & edited images',
      'Commercial usage rights',
    ]),
  },
];

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'lenscraft_db',
  });

  console.log('🌱 Seeding database...');

  // Seed owner
  console.log('  👤 Creating owner account...');
  const ownerHash = await bcrypt.hash('owner@123', 12);
  await connection.execute(
    `INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name=VALUES(name)`,
    ['Vikram Sharma', 'owner@lenscraftphotography.com', '9876543210', ownerHash, 'OWNER']
  );

  // Seed demo customer
  console.log('  👤 Creating demo customer...');
  const customerHash = await bcrypt.hash('customer@123', 12);
  await connection.execute(
    `INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name=VALUES(name)`,
    ['Priya Patel', 'customer@example.com', '9123456789', customerHash, 'CUSTOMER']
  );

  // Seed services
  console.log('  📸 Creating services...');
  for (const service of SERVICES) {
    await connection.execute(
      `INSERT INTO services (name, description, price, duration_minutes, image_url, included_features, active)
       VALUES (?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE description=VALUES(description)`,
      [service.name, service.description, service.price, service.duration_minutes, service.image_url, service.included_features]
    );
  }

  // Seed sample bookings
  console.log('  📅 Creating sample bookings...');
  const [customers] = await connection.execute("SELECT id FROM users WHERE email = 'customer@example.com'");
  const [services] = await connection.execute("SELECT id FROM services LIMIT 3");
  
  if (customers.length && services.length) {
    const customerId = customers[0].id;
    const sampleBookings = [
      {
        ref: 'BK-SAMPLE1',
        service_id: services[0].id,
        event_date: '2026-10-15',
        start_time: '10:00:00',
        end_time: '18:00:00',
        location: 'Taj Hotel, Mumbai',
        notes: 'Traditional + candid wedding photography',
        status: 'CONFIRMED',
      },
      {
        ref: 'BK-SAMPLE2',
        service_id: services[1]?.id || services[0].id,
        event_date: '2026-11-20',
        start_time: '14:00:00',
        end_time: '20:00:00',
        location: 'ITC Grand, Hyderabad',
        notes: 'Wedding reception videography',
        status: 'PENDING',
      },
    ];

    for (const booking of sampleBookings) {
      await connection.execute(
        `INSERT IGNORE INTO bookings 
         (booking_reference, customer_id, service_id, event_date, start_time, end_time, location, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [booking.ref, customerId, booking.service_id, booking.event_date, booking.start_time, booking.end_time, booking.location, booking.notes, booking.status]
      );
    }
  }

  await connection.end();
  
  console.log('\n✅ Database seeded successfully!');
  console.log('\n📋 Development Credentials (CHANGE FOR PRODUCTION):');
  console.log('  Owner:    owner@lenscraftphotography.com / owner@123');
  console.log('  Customer: customer@example.com / customer@123');
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});

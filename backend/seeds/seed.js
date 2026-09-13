/**
 * seeds/seed.js
 * Seeds owner account + all 6 services. Works with both MySQL and SQLite.
 */
require('dotenv').config();
const bcrypt = require('bcrypt');

const OWNER = {
  name:     'Studio Owner',
  email:    'owner@lenscraftphotography.com',
  password: 'owner@123',
  phone:    '+91 9032443967',
  role:     'OWNER',
};

const SERVICES = [
  {
    name: 'Wedding Photography',
    description: 'Full-day wedding coverage with a team of 2 photographers. Candid and traditional shots, drone footage, and same-day highlight reel.',
    price: 75000,
    duration_minutes: 600,
    image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    included_features: JSON.stringify(['2 Photographers', '600+ Edited Photos', 'Drone Coverage', 'Same-day Highlights', 'Online Gallery', 'USB Drive Delivery']),
  },
  {
    name: 'Pre-Wedding Shoot',
    description: 'Romantic outdoor or studio pre-wedding session capturing your love story with cinematic editing.',
    price: 25000,
    duration_minutes: 240,
    image_url: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80',
    included_features: JSON.stringify(['4 Hours Session', '150+ Edited Photos', '1 Location', 'Styling Guidance', 'Online Gallery']),
  },
  {
    name: 'Wedding Videography',
    description: 'Cinematic wedding film with 4K resolution, colour grading, and a beautiful background score.',
    price: 55000,
    duration_minutes: 600,
    image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    included_features: JSON.stringify(['4K Cinematic Film', 'Highlight Reel', 'Raw Footage', 'Drone Aerial', 'Background Score', 'USB Delivery']),
  },
  {
    name: 'Birthday Photography',
    description: 'Joyful birthday celebration coverage for kids or adults — candid moments, cake cutting, and group shots.',
    price: 12000,
    duration_minutes: 180,
    image_url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80',
    included_features: JSON.stringify(['3 Hours Coverage', '100+ Edited Photos', '1 Photographer', 'Online Gallery']),
  },
  {
    name: 'Corporate Events',
    description: 'Professional coverage for corporate conferences, product launches, and team events with quick turnaround.',
    price: 20000,
    duration_minutes: 480,
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    included_features: JSON.stringify(['Full Day Coverage', '500+ Edited Photos', 'Logo Watermark Option', '48hr Delivery', 'Commercial License']),
  },
  {
    name: 'Event Videography',
    description: 'Complete video coverage for any event — corporate, cultural, or social — edited as a professional film.',
    price: 18000,
    duration_minutes: 360,
    image_url: 'https://images.unsplash.com/photo-1574717025058-2f8737d2e2b7?w=800&q=80',
    included_features: JSON.stringify(['6 Hours Coverage', '4K Recording', 'Highlight Reel', 'Background Music', 'Online Delivery']),
  },
];

async function seedMySQL() {
  const mysql = require('mysql2/promise');
  const conn = await mysql.createConnection({
    host:     process.env.DATABASE_HOST,
    port:     parseInt(process.env.DATABASE_PORT) || 3306,
    user:     process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME || 'lenscraft_db',
  });
  try {
    const hash = await bcrypt.hash(OWNER.password, 12);
    await conn.execute(
      'INSERT IGNORE INTO users (name,email,phone,password_hash,role) VALUES (?,?,?,?,?)',
      [OWNER.name, OWNER.email, OWNER.phone, hash, OWNER.role]
    );
    for (const s of SERVICES) {
      await conn.execute(
        `INSERT IGNORE INTO services (name,description,price,duration_minutes,image_url,included_features)
         VALUES (?,?,?,?,?,?)`,
        [s.name, s.description, s.price, s.duration_minutes, s.image_url, s.included_features]
      );
    }
    console.log('✅ MySQL seed complete');
  } finally {
    await conn.end();
  }
}

function seedSQLite() {
  const BetterSQLite = require('better-sqlite3');
  const path = require('path');
  const dbPath = process.env.SQLITE_PATH || path.join(__dirname, '../data/lenscraft.db');
  const db = new BetterSQLite(dbPath);
  db.pragma('foreign_keys = ON');

  const hash = require('child_process').execSync(
    `node -e "const b=require('bcrypt');b.hash('${OWNER.password}',12).then(h=>process.stdout.write(h))"`
  ).toString().trim();

  db.prepare(
    `INSERT OR IGNORE INTO users (name,email,phone,password_hash,role) VALUES (?,?,?,?,?)`
  ).run(OWNER.name, OWNER.email, OWNER.phone, hash, OWNER.role);

  const insertService = db.prepare(
    `INSERT OR IGNORE INTO services (name,description,price,duration_minutes,image_url,included_features)
     VALUES (?,?,?,?,?,?)`
  );

  for (const s of SERVICES) {
    insertService.run(s.name, s.description, s.price, s.duration_minutes, s.image_url, s.included_features);
  }

  console.log('✅ SQLite seed complete');
  db.close();
}

(async () => {
  try {
    if (process.env.DATABASE_HOST) {
      await seedMySQL();
    } else {
      seedSQLite();
    }
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
})();

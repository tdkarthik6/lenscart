require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 5000;

async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 LensCraft API running on port ${PORT}`);
    console.log(`📸 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🕐 Business Timezone: ${process.env.BUSINESS_TIMEZONE || 'Asia/Kolkata'}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

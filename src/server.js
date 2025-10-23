require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./services/socket.service');
const { sequelize } = require('./models');
const redisClient = require('./config/redisClient');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('✅ MySQL connected and synced');

    await redisClient.connect();
    console.log('✅ Redis connected');

    const server = http.createServer(app);
    await initSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    process.on('SIGINT', async () => {
      console.log('🔻 Closing connections...');
      try { await redisClient.quit(); } catch(e){}
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Startup error:', err);
    process.exit(1);
  }
}

startServer();

const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
  socket: { host: process.env.REDIS_HOST || '127.0.0.1', port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379 }
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

module.exports = redisClient;

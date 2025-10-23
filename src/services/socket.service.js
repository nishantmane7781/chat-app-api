const { Server } = require('socket.io');
const redisClient = require('../config/redisClient');
const { Message } = require('../models');

let io;

async function initSocket(server) {
  io = new Server(server, { cors: { origin: '*' } });

  // create a subscriber because redis publish can't be read by same client reliably in some setups
  const sub = redisClient.duplicate();
  await sub.connect();

  // pattern subscribe to all conversation channels
  await sub.pSubscribe('conversation:*', (message, channel) => {
    try {
      const payload = JSON.parse(message);
      const conversationId = channel.split(':')[1];
      io.to(`conversation_${conversationId}`).emit('message', payload.data);
    } catch (err) {
      console.error('pSubscribe parse', err);
    }
  });

  io.on('connection', (socket) => {
    socket.on('joinConversation', ({ conversationId }) => {
      socket.join(`conversation_${conversationId}`);
    });

    socket.on('sendMessage', async ({ conversationId, content, senderId }) => {
      const msg = await Message.create({ conversationId, senderId, content });
      await redisClient.publish(`conversation:${conversationId}`, JSON.stringify({ type: 'message', data: msg }));
    });

    socket.on('disconnect', () => {});
  });
}

module.exports = { initSocket };

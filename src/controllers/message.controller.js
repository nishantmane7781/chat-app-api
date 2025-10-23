const { Message } = require('../models');
const redisClient = require('../config/redisClient');
const { Op } = require('sequelize');


async function sendMessage(req, res) {
  const { conversationId, content } = req.body;
  const senderId = req.user.id;

  if (!conversationId || !content) {
    return res.status(400).json({ message: 'Missing conversationId or content' });
  }

  try {
    /* const message = await Message.create({ conversationId, senderId, content });

    // Publish to Redis so Socket.IO or other subscribers get the message
    await redisClient.publish(
      `conversation:${conversationId}`,
      JSON.stringify({ type: 'message', data: message })
    ); */
const messages = await Message.findAll({
  where: {
    conversationId,
    senderId: { [Op.ne]: req.user.id } // messages NOT from current user
  },
  order: [['createdAt', 'ASC']]
});
    return res.json({ message });
  } catch (err) {
    console.error('sendMessage error', err);
    return res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
}

async function fetchMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.id;

    // Fetch messages NOT sent by the current user
    const messages = await Message.findAll({
      where: {
        conversationId,
        senderId: { [Op.ne]: currentUserId } // "not equal" to current user
      },
      order: [['createdAt', 'ASC']]
    });

    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching messages' });
  }
}


module.exports = { sendMessage, fetchMessages };

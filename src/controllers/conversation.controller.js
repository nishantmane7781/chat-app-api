const { Conversation, ConversationUser, User } = require('../models');

async function createConversation(req, res) {
  const { participantIds, title } = req.body;
  if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 1) return res.status(400).json({ message: 'Need participants' });
  try {
    const conversation = await Conversation.create({ title });
    await Promise.all(participantIds.map(async (id) => {
      await ConversationUser.create({ conversationId: conversation.id, userId: id });
    }));
    return res.json({ conversation });
  } catch (err) {
    console.error('createConversation error', err);
    return res.status(500).json({ message: 'Failed to create conversation', error: err.message });
  }
}

async function listConversations(req, res) {
  const userId = req.user.id;
  try {
    const convs = await Conversation.findAll({
      include: [{ model: User, as: 'participants', through: { attributes: [] } }]
    });
    return res.json({ conversations: convs });
  } catch (err) {
    console.error('listConversations error', err);
    return res.status(500).json({ message: 'Failed to list conversations', error: err.message });
  }
}

module.exports = { createConversation, listConversations };

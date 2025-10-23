const sequelize = require('../config/db');
const User = require('./user.model');
const Conversation = require('./conversation.model');
const ConversationUser = require('./conversationUser.model');
const Message = require('./message.model');
const RefreshToken = require('./refreshToken.model');

// Associations
User.belongsToMany(Conversation, { through: ConversationUser, as: 'conversations', foreignKey: 'userId' });
Conversation.belongsToMany(User, { through: ConversationUser, as: 'participants', foreignKey: 'conversationId' });

Conversation.hasMany(Message, { as: 'messages', foreignKey: 'conversationId' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

RefreshToken.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(RefreshToken, { foreignKey: 'userId' });

module.exports = { sequelize, User, Conversation, ConversationUser, Message, RefreshToken };

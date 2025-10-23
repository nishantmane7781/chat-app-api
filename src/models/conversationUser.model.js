const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ConversationUser = sequelize.define('ConversationUser', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  conversationId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, { timestamps: false });

module.exports = ConversationUser;

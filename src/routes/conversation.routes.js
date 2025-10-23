const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { createConversation, listConversations } = require('../controllers/conversation.controller');

router.post('/', auth, createConversation);
router.get('/', auth, listConversations);

module.exports = router;

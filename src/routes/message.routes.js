const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { sendMessage, fetchMessages } = require('../controllers/message.controller');

router.post('/', auth, sendMessage);
router.get('/:conversationId', auth, fetchMessages);

module.exports = router;

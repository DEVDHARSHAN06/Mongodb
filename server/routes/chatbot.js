// server/routes/chatbot.js
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const auth = require('../middleware/auth');

// Process chatbot message
router.post('/message', auth, chatbotController.processMessage);

// Get chat history
router.get('/history', auth, chatbotController.getChatHistory);

module.exports = router;
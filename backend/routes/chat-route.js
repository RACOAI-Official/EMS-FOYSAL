const router = require('express').Router();
const chatController = require('../controllers/chat-controller');
const asyncMiddleware = require('../middlewares/async-middleware');
const { auth } = require('../middlewares/auth-middleware');
const upload = require('../middlewares/multer-cloudinary-config');

router.post('/send', auth, upload.single('image'), asyncMiddleware(chatController.sendMessage));
router.get('/messages/:userId', auth, asyncMiddleware(chatController.getMessages));
router.get('/contacts', auth, asyncMiddleware(chatController.getContacts));
router.patch('/mark-read/:userId', auth, asyncMiddleware(chatController.markAsRead));
router.delete('/:id', auth, asyncMiddleware(chatController.deleteMessage));
router.delete('/conversation/:userId', auth, asyncMiddleware(chatController.deleteConversation));

module.exports = router;

const router = require('express').Router();
const notificationController = require('../controllers/notification-controller');
const asyncMiddleware = require('../middlewares/async-middleware');
const { auth } = require('../middlewares/auth-middleware');

// Protected notification routes - require authentication
router.get('/', auth, asyncMiddleware(notificationController.getNotifications));
router.patch('/:id/read', auth, asyncMiddleware(notificationController.markAsRead));
router.delete('/:id', auth, asyncMiddleware(notificationController.deleteNotification));

module.exports = router;

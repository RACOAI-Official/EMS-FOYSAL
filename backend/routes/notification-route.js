const router = require('express').Router();
const notificationController = require('../controllers/notification-controller');
const asyncMiddleware = require('../middlewares/async-middleware');

router.get('/', asyncMiddleware(notificationController.getNotifications));
router.patch('/:id/read', asyncMiddleware(notificationController.markAsRead));

module.exports = router;

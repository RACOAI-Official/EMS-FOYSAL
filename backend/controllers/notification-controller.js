const Notification = require('../models/notification-model');
const ErrorHandler = require('../utils/error-handler');

class NotificationController {
    getNotifications = async (req, res, next) => {
        try {
            const notifications = await Notification.find({ user: req.user._id, isRead: false })
                .sort({ createdAt: -1 });
            res.json({ success: true, data: notifications });
        } catch (err) {
            next(err);
        }
    }

    markAsRead = async (req, res, next) => {
        try {
            const { id } = req.params;
            if (id === 'all') {
                await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
            } else {
                await Notification.findByIdAndUpdate(id, { isRead: true });
            }
            res.json({ success: true, message: 'Marked as read' });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new NotificationController();

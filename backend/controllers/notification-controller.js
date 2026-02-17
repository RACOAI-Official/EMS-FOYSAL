const Notification = require('../models/notification-model');
const ErrorHandler = require('../utils/error-handler');

class NotificationController {
    getNotifications = async (req, res, next) => {
        try {
            if (!req.user || !req.user._id) return next(ErrorHandler.unAuthorized());

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
            if (!req.user || !req.user._id) return next(ErrorHandler.unAuthorized());

            if (id === 'all') {
                await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
            } else {
                // ensure notification belongs to user before marking
                const notif = await Notification.findById(id);
                if (!notif) return next(ErrorHandler.badRequest('Notification not found'));
                if (String(notif.user) !== String(req.user._id)) return next(ErrorHandler.notAllowed());
                await Notification.findByIdAndUpdate(id, { isRead: true });
            }
            res.json({ success: true, message: 'Marked as read' });
        } catch (err) {
            next(err);
        }
    }

    deleteNotification = async (req, res, next) => {
        try {
            const { id } = req.params;
            if (!req.user || !req.user._id) return next(ErrorHandler.unAuthorized());

            const notif = await Notification.findById(id);
            if (!notif) return next(ErrorHandler.badRequest('Notification not found'));
            if (String(notif.user) !== String(req.user._id)) return next(ErrorHandler.notAllowed());
            await Notification.findByIdAndDelete(id);
            res.json({ success: true, message: 'Notification deleted' });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new NotificationController();

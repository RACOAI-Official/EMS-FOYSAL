const mongoose = require('mongoose');
const Chat = require('../models/chat-model');
const User = require('../models/user-model');
const Team = require('../models/team-model');
const ErrorHandler = require('../utils/error-handler');
const fileService = require('../services/file-service');

class ChatController {
  sendMessage = async (req, res, next) => {
    const { receiverId, message } = req.body;
    const file = req.file;
    if (!receiverId) return next(ErrorHandler.badRequest('Receiver is required'));
    if (!message && !file) return next(ErrorHandler.badRequest('Message or File is required'));

    const chat = await Chat.create({
      sender: req.user._id,
      receiver: receiverId,
      message,
      file: file ? file.path : null
    });

    // Notify Receiver
    const Notification = require('../models/notification-model');
    await Notification.create({
      title: 'New Message',
      message: `You have a new message from ${req.user.name}`,
      type: 'chat',
      link: '/chat',
      user: receiverId
    });
    // Emit Real-time Message to Receiver
    const socketService = require('../services/socket-service');
    socketService.emitToUser(receiverId, 'notification', {
      title: 'New Message',
      message: `You have a new message from ${req.user.name}`,
      type: 'chat',
      link: '/chat'
    });
    socketService.emitToUser(receiverId, 'message', chat);
    socketService.emitToUser(receiverId, 'updateContacts', {});

    res.json({ success: true, data: chat });
  }

  getMessages = async (req, res, next) => {
    const { userId } = req.params;
    // Fetch conversation between logged-in user and target user
    const messages = await Chat.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    }).sort({ createdAt: 1 }); // Oldest first

    res.json({ success: true, data: messages });
  }

  getContacts = async (req, res, next) => {
    try {
      let contacts = [];
      const myId = req.user._id;

      // Fetch full user details to get team and full type
      const me = await User.findById(myId);
      if (!me) return next(ErrorHandler.unauthorized('User not found'));

      const myType = me.type.toLowerCase();
      const myTeams = me.team || [];

      // Base query: Not me
      let query = { _id: { $ne: myId } };

      // Role-based filtering (using $in with multiple cases for robustness)
      // Role-based filtering - Removed to allow full communication
      // if (myType === 'admin') {
      //   query.type = { $nin: ['admin', 'Admin'] };
      // } else if (myType === 'leader') {
      //   query.type = { $nin: ['leader', 'Leader'] };
      // }

      contacts = await User.find(query).select('name email type image isOnline position');

      // Get unread message counts and LAST MESSAGE for each contact
      const contactsWithDetails = await Promise.all(contacts.map(async (contact) => {
        // Unread Count
        const unreadCount = await Chat.countDocuments({
          sender: contact._id,
          receiver: myId,
          isRead: false
        });

        // Last Message
        const lastMsg = await Chat.findOne({
          $or: [
            { sender: myId, receiver: contact._id },
            { sender: contact._id, receiver: myId }
          ]
        }).sort({ createdAt: -1 });

        return {
          ...contact.toObject(),
          unreadCount,
          lastMessage: lastMsg ? lastMsg.message : null,
          lastMessageTime: lastMsg ? lastMsg.createdAt : null
        };
      }));

      // Sort by lastMessageTime DESC (newest first)
      // If no message, push to bottom or sort by name? Let's push no-message users to bottom
      contactsWithDetails.sort((a, b) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
        return timeB - timeA;
      });

      res.json({ success: true, data: contactsWithDetails });
    } catch (err) {
      next(err);
    }
  }

  markAsRead = async (req, res, next) => {
    try {
      const { userId } = req.params;

      // Mark all messages from userId to current user as read
      await Chat.updateMany(
        { sender: userId, receiver: req.user._id, isRead: false },
        { $set: { isRead: true } }
      );

      res.json({ success: true, message: 'Messages marked as read' });
    } catch (err) {
      next(err);
    }
  }

  deleteMessage = async (req, res, next) => {
    try {
      const { id } = req.params;
      const message = await Chat.findById(id);

      // Authorization: Only sender can delete (or Admin if needed later)
      if (message.sender.toString() !== req.user._id.toString() && req.user.type !== 'admin') {
        return next(ErrorHandler.unauthorized('You can only delete your own messages'));
      }

      // --- FILE CLEANUP START ---
      if (message.file) {
        fileService.deleteChatFile(message.file);
      }
      // --- FILE CLEANUP END ---

      await message.deleteOne();
      res.json({ success: true, message: 'Message deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  deleteConversation = async (req, res, next) => {
    try {
      const { userId } = req.params; // Target user to delete conversation with
      const myId = req.user._id;

      // Delete ONLY messages SENT by me to this user
      await Chat.deleteMany({
        sender: myId,
        receiver: userId
      });

      res.json({ success: true, message: 'Your sent messages deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ChatController();

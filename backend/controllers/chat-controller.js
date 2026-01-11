const mongoose = require('mongoose');
const Chat = require('../models/chat-model');
const User = require('../models/user-model');
const Team = require('../models/team-model');
const ErrorHandler = require('../utils/error-handler');

class ChatController {
  sendMessage = async (req, res, next) => {
    const { receiverId, message } = req.body;
    if (!receiverId || !message) return next(ErrorHandler.badRequest('Receiver and Message are required'));

    const chat = await Chat.create({
      sender: req.user._id,
      receiver: receiverId,
      message
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

      // Everyone can chat with everyone who is active
      contacts = await User.find({ _id: { $ne: myId }, status: 'active' }).select('name email type image');

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

      if (!message) {
        return next(ErrorHandler.notFound('Message not found'));
      }

      // Authorization: Only sender can delete (or Admin if needed later)
      if (message.sender.toString() !== req.user._id.toString()) {
        return next(ErrorHandler.unauthorized('You can only delete your own messages'));
      }

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

      // Delete ALL messages between these two users
      await Chat.deleteMany({
        $or: [
          { sender: myId, receiver: userId },
          { sender: userId, receiver: myId }
        ]
      });

      res.json({ success: true, message: 'Conversation deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ChatController();

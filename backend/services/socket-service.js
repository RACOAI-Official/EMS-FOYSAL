let io;
const users = new Map(); // Store userId -> Set of socketIds mapping

const init = (socketIo) => {
  io = socketIo;

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join', async (userId) => {
      if (userId) {
        const uid = userId.toString();
        const User = require('../models/user-model');

        if (!users.has(uid)) {
          users.set(uid, new Set());
          // Mark as active on first connection
          try {
            await User.findByIdAndUpdate(uid, { isOnline: true });
            console.log(`User ${uid} marked as ONLINE`);
            // Broadcast to all that this user is online
            emitToAll('user-status-update', { userId: uid, isOnline: true });
          } catch (err) {
            console.error(`Failed to update online status for user ${uid}:`, err);
          }
        }
        users.get(uid).add(socket.id);
        console.log(`User ${uid} joined with socket ${socket.id}. Total sockets for user: ${users.get(uid).size}`);
      } else {
        console.log('Join attempt with no userId');
      }
    });

    socket.on('share-location', (data) => {
      // data: { userId, lat, long }
      // console.log(`Location update from user ${data.userId}: ${data.lat}, ${data.long}`);
      // Broadcast to all admins
      emitToAdmins('user-location-update', data);
    });

    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
      for (const [userId, socketIds] of users.entries()) {
        if (socketIds.has(socket.id)) {
          socketIds.delete(socket.id);
          console.log(`Socket ${socket.id} removed for user ${userId}`);

          if (socketIds.size === 0) {
            const User = require('../models/user-model');
            try {
              await User.findByIdAndUpdate(userId, { isOnline: false });
              console.log(`User ${userId} marked as OFFLINE`);
              // Broadcast to all that this user is offline
              emitToAll('user-status-update', { userId, isOnline: false });
            } catch (err) {
              console.error(`Failed to update online status for user ${userId}:`, err);
            }
            users.delete(userId);
            console.log(`User ${userId} mapping removed (no more sockets)`);
          }
          break;
        }
      }
    });
  });
};

const emitToUser = (userId, event, data) => {
  if (!io) return;
  const uid = userId.toString();
  const socketIds = users.get(uid);
  if (socketIds && socketIds.size > 0) {
    console.log(`Emitting ${event} to user ${uid} (${socketIds.size} sockets)`);
    socketIds.forEach(socketId => {
      io.to(socketId).emit(event, data);
    });
  } else {
    console.log(`Failed to emit ${event} to user ${uid} - User not connected`);
  }
};

const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

const emitToAdmins = async (event, data) => {
  if (!io) return;
  const User = require('../models/user-model');
  const admins = await User.find({ type: 'Admin' });
  admins.forEach(admin => {
    emitToUser(admin._id, event, data);
  });
};

module.exports = {
  init,
  emitToUser,
  emitToAll,
  emitToAdmins
};

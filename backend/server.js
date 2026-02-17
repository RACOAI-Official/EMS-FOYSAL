const express = require('express');
const multer = require('multer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');

const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const cloudinary = require('cloudinary').v2;
const dbConnection = require('./configs/db-config');

// Initialize Express app
const app = express();
const server = http.createServer(app);

const defaultOrigins = ['http://192.168.10.13:3000', 'http://127.0.0.1:3000', 'http://localhost:3000'];
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

// ==========================
// 1️⃣ Middleware
// ==========================
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,               // Allow cookies / auth headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight OPTIONS requests
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// ==========================
// 2️⃣ Cloudinary Setup
// ==========================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log('>>> [Cloudinary] Configured for:', cloudinary.config().cloud_name);

// ==========================
// 3️⃣ Routes
// ==========================
const uploadRoute = require('./routes/upload-route');
const employeeRoute = require('./routes/employee-route');
const adminRoute = require('./routes/admin-route');
const authRoute = require('./routes/auth-route');
const taskRoute = require('./routes/task-route');
const userListRoute = require('./routes/user-list-route');
const profileRoute = require('./routes/profile-route');
const problemRoute = require('./routes/problem-route');
const leaderRoute = require('./routes/leader-route');
const employerRoute = require('./routes/employer-route');
const chatRoute = require('./routes/chat-route');
const notificationRoute = require('./routes/notification-route');
const invitationRoute = require('./routes/invitation-route');

app.use('/api/upload', uploadRoute);
app.use('/api/employee', employeeRoute);
app.use('/api/admin', adminRoute);
app.use('/api/auth', authRoute);
app.use('/api/tasks', taskRoute);
app.use('/api/users', userListRoute);
app.use('/api/profile', profileRoute);
app.use('/api/problems', problemRoute);
// Also support legacy singular path used by older frontend code: '/api/problem'
app.use('/api/problem', problemRoute);
app.use('/api/leaders', leaderRoute);
// Also support legacy singular path used by frontend: '/api/leader'
app.use('/api/leader', leaderRoute);
app.use('/api/employers', employerRoute);
app.use('/api/chat', chatRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/invitations', invitationRoute);

// Test route
app.get('/', (req, res) => {
  res.status(200).json({
    status: "EMS Backend Running Successfully"
  });
});
app.get('/api/test', (req, res) => res.json({ message: 'API is working' }));

// ==========================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('message', (msg) => {
    console.log('Message from client:', msg);
    socket.emit('message', `Server received: ${msg}`);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// ==========================
// Start server
// ==========================
const PORT = process.env.PORT || 5500;

// Function to connect to database with retry logic
const connectDatabase = async (retries = 5, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📡 Connecting to MongoDB... (Attempt ${attempt}/${retries})`);
      await dbConnection();
      console.log('✅ Database connection established');
      return true;
    } catch (err) {
      console.error(`❌ Database connection failed (Attempt ${attempt}/${retries}):`, err.message);

      if (attempt < retries) {
        const waitTime = delay * attempt; // Exponential backoff
        console.log(`⏳ Retrying in ${waitTime / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.error('⚠️ Failed to connect to database after all retries. Server will continue, but database operations may fail.');
        console.log('💡 Tip: Check MongoDB connection string in .env file or verify MongoDB Atlas whitelist settings.');
        return false;
      }
    }
  }
};

// Start server with database connection
(async () => {
  // Try to connect to database first
  await connectDatabase();

  // Robust server start: handle EADDRINUSE by trying next ports
  const maxPortAttempts = 10;
  let port = Number(PORT) || 5500;

  const tryListen = (attempt = 1) => {
    server.once('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use.`);
        if (attempt < maxPortAttempts) {
          port += 1;
          console.log(`Trying next port: ${port} (attempt ${attempt + 1}/${maxPortAttempts})`);
          // remove the previous listener and try again
          setTimeout(() => tryListen(attempt + 1), 100);
        } else {
          console.error(`Failed to bind after ${maxPortAttempts} attempts. Exiting.`);
          process.exit(1);
        }
      } else {
        // Re-throw other errors so they are visible
        console.error('Server error during listen:', err);
        process.exit(1);
      }
    });

    server.listen(port, () => {
      console.log(`\n✅ Server running on http://192.168.10.13:${port}`);
      console.log('📝 Routes available at http://192.168.10.13:' + port + '/api/*\n');
    });
  };

  tryListen();
})();

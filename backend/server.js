require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 5500;
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const dbConnection = require('./configs/db-config');
const authRoute = require('./routes/auth-route');
const adminRoute = require('./routes/admin-route');
const employeeRoute = require('./routes/employee-route');
const leaderRoute = require('./routes/leader-route');
const errorMiddleware = require('./middlewares/error-middleware');
const ErrorHandler = require('./utils/error-handler');
const { auth, authRole } = require('./middlewares/auth-middleware');
const app = express();
const http = require('http').createServer(app);
const socketIo = require('socket.io')(http, {
    cors: {
        origin: true, // Allow all origins for easier development/docker access
        credentials: true
    }
});

// Initialize Socket Service
const socketService = require('./services/socket-service');
socketService.init(socketIo);

// Database Connection
dbConnection();

const { CLIENT_URL } = process.env;
console.log(CLIENT_URL);

//Cors Option
const corsOption = {
    credentials: true,
    origin: true // Allow all origins for easier development/docker access
}

//Configuration
app.use(cors(corsOption));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Test Route
app.get('/api/test', (req, res) => res.json({ message: 'API is working' }));

// Routes
app.use('/api/auth', authRoute);
app.use('/api/admin', auth, authRole(['super_admin', 'sub_admin']), adminRoute);
app.use('/api/employee', auth, authRole(['super_admin', 'sub_admin', 'employee', 'leader']), employeeRoute);
app.use('/api/leader', auth, authRole(['super_admin', 'sub_admin', 'leader']), leaderRoute);
app.use('/api/tasks', auth, require('./routes/task-route'));
app.use('/api/users', auth, require('./routes/user-list-route'));
app.use('/api/problems', auth, require('./routes/problem-route'));
app.use('/api/chat', auth, require('./routes/chat-route'));
app.use('/api/employers', auth, authRole(['super_admin', 'sub_admin']), require('./routes/employer-route'));
app.use('/api/notifications', auth, require('./routes/notification-route'));
app.use('/api/invitation', require('./routes/invitation-route'));


app.use('/storage', express.static('storage'))

//Middlewares;
app.use((req, res, next) => {
    return next(ErrorHandler.notFound('The Requested Resources Not Found'));
});

// Error Handling Middleware (must be last)
app.use(errorMiddleware);

// Export app for serverless
module.exports = app;

if (process.env.NODE_ENV !== 'production' && !process.env.NETLIFY) {
    http.listen(PORT, () => console.log(`Listening On Port : ${PORT}`));
}


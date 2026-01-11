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

// Database Connection
dbConnection();

const { CLIENT_URL } = process.env;
console.log(CLIENT_URL);

//Cors Option
const corsOption = {
    credentials: true,
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://1.1.1.111:3000', CLIENT_URL]
}

//Configuration
app.use(cors(corsOption));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoute);
app.use('/api/admin', auth, authRole(['admin']), adminRoute);
app.use('/api/employee', auth, authRole(['employee', 'leader']), employeeRoute);
app.use('/api/leader', auth, authRole(['leader']), leaderRoute);
app.use('/api/tasks', auth, require('./routes/task-route'));
app.use('/api/users', auth, require('./routes/user-list-route'));
app.use('/api/problems', auth, require('./routes/problem-route'));
app.use('/api/chat', auth, require('./routes/chat-route'));
app.use('/api/employers', auth, authRole(['admin']), require('./routes/employer-route'));
app.use('/api/notifications', auth, require('./routes/notification-route'));


app.use('/storage', express.static('storage'))

//Middlewares;
app.use((req, res, next) => {
    return next(ErrorHandler.notFound('The Requested Resources Not Found'));
});

// Error Handling Middleware (must be last)
app.use(errorMiddleware);

app.listen(PORT, () => console.log(`Listening On Port : ${PORT}`));

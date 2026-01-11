const mongoose = require('mongoose');

const DB_URL = process.env.DB_URL || "mongodb+srv://RACO:P2zbjmPN2Az80ai3@invertory.lhz7idi.mongodb.net/easy-employee?retryWrites=true&w=majority&appName=Invertory";

mongoose.set('strictQuery', true);
mongoose.set('bufferCommands', false);

const dbConnection = async () => {
    try {
        await mongoose.connect(DB_URL, {
            maxPoolSize: 10,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4,
            heartbeatFrequencyMS: 10000, // Send heartbeat every 10 seconds
            autoIndex: true,
            maxIdleTimeMS: 10000, // Close idle connections after 10 seconds
            retryWrites: true,
            retryReads: true,
        });

        console.log('Database Connection Successful');

        // Set up connection event handlers BEFORE attempting connection
        mongoose.connection.on('error', (err) => {
            console.log('MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
            // Auto-reconnect after 5 seconds
            setTimeout(() => {
                mongoose.connect(DB_URL).catch(err => {
                    console.error('Reconnection failed:', err.message);
                });
            }, 5000);
        });

        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (err) {
        console.log('Failed To Connect With Database, \nReason : ' + err.message);
        // Exit process if initial connection fails
        process.exit(1);
    }
};

module.exports = dbConnection;

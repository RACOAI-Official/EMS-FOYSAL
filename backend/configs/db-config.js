const mongoose = require('mongoose');

const DB_URL = process.env.MONGODB_URI || process.env.DB_URL;

mongoose.set('strictQuery', true);
mongoose.set('bufferCommands', true); // Changed to true to allow buffering
mongoose.set('bufferTimeoutMS', 30000); // Buffer commands for 30 seconds before timing out

let cachedDb = null;

const dbConnection = async () => {
    if (cachedDb && mongoose.connection.readyState === 1) {
        return cachedDb;
    }

    try {
        const db = await mongoose.connect(DB_URL, {
            maxPoolSize: 10,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 120000, // Increased from 30s to 120s
            socketTimeoutMS: 120000, // Increased from 45s to 120s
            connectTimeoutMS: 120000, // Additional connection timeout
            family: 4,
            heartbeatFrequencyMS: 30000, // Increased from 10s to 30s
            autoIndex: true,
            maxIdleTimeMS: 60000, // Increased from 10s to 60s
            retryWrites: true,
            retryReads: true,
            waitQueueTimeoutMS: 30000, // Wait 30s for connection from pool
            monitorCommands: true, // Monitor connection commands for debugging
        });

        cachedDb = db;
        console.log('✅ Database Connection Successful');

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
            cachedDb = null;
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });

        return cachedDb;
    } catch (err) {
        console.error('❌ Failed to Connect to Database');
        console.error('Error:', err.message);
        if (err.reason) console.error('Reason:', err.reason);
        console.error('\n💡 Solutions to try:');
        console.error('1. Check if MongoDB is running');
        console.error('2. Verify DB_URL in .env file');
        console.error('3. If using MongoDB Atlas, whitelist your IP in Network Access');
        console.error('4. Check your internet connection\n');
        throw err;
    }
};

module.exports = dbConnection;

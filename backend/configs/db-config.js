const mongoose = require('mongoose');

const DB_URL = process.env.MONGODB_URI || process.env.DB_URL;

mongoose.set('strictQuery', true);
mongoose.set('bufferCommands', false);

let cachedDb = null;

const dbConnection = async () => {
    if (cachedDb && mongoose.connection.readyState === 1) {
        return cachedDb;
    }

    try {
        const db = await mongoose.connect(DB_URL, {
            maxPoolSize: 10,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4,
            heartbeatFrequencyMS: 10000,
            autoIndex: true,
            maxIdleTimeMS: 10000,
            retryWrites: true,
            retryReads: true,
        });

        cachedDb = db;
        console.log('Database Connection Successful');

        mongoose.connection.on('error', (err) => {
            console.log('MongoDB connection error:', err.message);
        });

        return cachedDb;
    } catch (err) {
        console.log('Failed To Connect With Database, \nReason : ' + err.message);
        throw err;
    }
};

module.exports = dbConnection;

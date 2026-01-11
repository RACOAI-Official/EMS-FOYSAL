require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const DB_URL = process.env.DB_URL;

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    username: String,
    mobile: Number,
    password: String,
    type: String,
    status: String,
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    image: String,
    address: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema, 'users');

async function createAdminUser() {
    try {
        await mongoose.connect(DB_URL);
        console.log('Connected to database');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@admin.com' });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: admin@admin.com');
            console.log('Username: admin');
            process.exit(0);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create admin user
        const admin = new User({
            name: 'Admin',
            email: 'admin@admin.com',
            username: 'admin',
            mobile: 1234567890,
            password: hashedPassword,
            type: 'admin',
            status: 'active',
            team: null,
            image: 'user.png',
            address: 'Admin Office'
        });

        await admin.save();
        console.log('✅ Admin user created successfully!');
        console.log('==================================');
        console.log('Email: admin@admin.com');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('==================================');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();

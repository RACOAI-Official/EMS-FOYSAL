const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 25,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Enter Email Address'],
        unique: [true, 'Email Already Exist'],
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 4,
        maxlength: 15,
        trim: true
    },
    mobile: {
        type: Number,
        required: true,
        minlength: 10,
        maxlength: 13,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    type: {
        type: String,
        enum: ['admin', 'employee', 'leader', 'employer', 'team']
    },
    empire: {
        type: Schema.Types.ObjectId,
        ref: 'Empire'
    },
    designation: {
        type: String,
        default: 'Not Specified'
    },
    project: {
        type: String,
        default: 'Not Assigned'
    },
    status: {
        type: String,
        enum: ['active', 'banned'],
        default: 'active'
    },
    team: [{
        type: Schema.Types.ObjectId,
        ref: 'Team'
    }],
    image: {
        type: String,
        required: false,
        default: 'user.png'
    },
    address: {
        type: String,
        default: 'No Address Specified',
        maxlength: 100,
        trim: true
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    progressNote: {
        type: String,
        required: false,
        default: ''
    }
}, {
    timestamps: true
});

// const SALT_FACTOR = process.env.BCRYPT_PASSWORD_SALT_FACTOR || 10;
const SALT_FACTOR = 10


userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password'))
        return next();

    try {
        const salt = await bcrypt.genSalt(SALT_FACTOR);
        user.password = await bcrypt.hash(user.password, salt);
        return next();
    } catch (err) {
        console.log('Password hashing error:', err);
        return next(err);
    }
});


userSchema.pre('updateOne', function (done) {
    const user = this.getUpdate();
    if (!user.password)
        return done();
    bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
        if (err)
            return done(err);
        bcrypt.hash(user.password, salt, (err, hashedPassword) => {
            if (err) return done(err);
            user.password = hashedPassword;
            return done();
        });
    });
});

module.exports = mongoose.model('User', userSchema, 'users');

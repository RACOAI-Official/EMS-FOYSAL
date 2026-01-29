const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: false, // Optional during invitation
        minlength: 2,
        maxlength: 50,
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
        required: false, // Generated or entered during registration
        unique: true,
        sparse: true, // Allow multiple nulls
        minlength: 4,
        maxlength: 25,
        trim: true
    },
    mobile: {
        type: String, // Changed to String for better phone number support
        required: false,
        minlength: 10,
        maxlength: 15,
    },
    password: {
        type: String,
        required: false, // Optional during initial creation
        minlength: 8,
    },
    type: {
        type: String,
        enum: ['super_admin', 'sub_admin', 'leader', 'employee', 'employer', 'team']
    },
    invited_role: {
        type: String,
        enum: ['sub_admin', 'leader', 'employee'],
        required: false
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
    position: {
        type: String,
        enum: [
            'AI Engineer', 'AI Developer',
            'Full Stack Developer', 'Full Stack Engineer',
            'HR', 'CEO', 'COO', 'Not Specified'
        ],
        default: 'Not Specified'
    },
    status: {
        type: String,
        enum: ['active', 'deactive', 'banned'],
        default: 'deactive'
    },
    isOnline: {
        type: Boolean,
        default: false
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
    },
    employeeId: {
        type: String,
        unique: true,
        sparse: true
    },
    fatherName: String,
    motherName: String,
    presentAddress: String,

    bloodGroup: String,
    nid: {
        type: String,
        unique: true,
        sparse: true
    },
    companyName: {
        type: String,
        default: 'RACOAI'
    },
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

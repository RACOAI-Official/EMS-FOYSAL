const multer = require('multer');
const fs = require('fs');


const storageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('Multer Storage Engine - Processing:', file.fieldname);
        let dir = './storage/images/profile/';

        if (file.fieldname === 'profile') {
            dir = './storage/images/profile/';
        }
        else if (file.fieldname === 'image') {
            dir = './storage/images/teams/';
        }
        else if (file.fieldname === 'taskFile') {
            dir = './storage/files/tasks/';
        }
        else if (file.fieldname === 'problemImage') {
            dir = './storage/images/problems/';
        }
        else {
            console.log('Unknown fieldname, rejecting upload');
            return cb(null, false);
        }

        console.log(`Ensuring directory exists: ${dir}`);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const filename = file.fieldname + "-" + uniqueSuffix + "-" + file.originalname;
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
})


const fileFilter = (req, file, cb) => {
    console.log('File Filter Method Called');
    console.log('File fieldname:', file.fieldname);
    console.log('File mimetype:', file.mimetype);

    if (file === 'undefined') {
        console.log('File is undefined');
        cb(null, false);
    }
    // Check for profile image (user profile pictures)
    else if (file.fieldname === 'profile') {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
            console.log('Profile image accepted:', file.originalname);
            cb(null, true);
        }
        else {
            console.log('Profile image rejected - invalid mimetype:', file.mimetype);
            cb(null, false);
        }
    }
    // Check for team image
    else if (file.fieldname === 'image') {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
            console.log('Team image accepted:', file.originalname);
            cb(null, true)
        }
        else {
            console.log('Team image rejected - invalid mimetype:', file.mimetype);
            cb(null, false)
        }
    }
    // Check for task file (allow pdf, doc, images)
    else if (file.fieldname === 'taskFile') {
        // Allow common document types and images
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/jpg', 'text/plain'];
        if (allowedTypes.includes(file.mimetype)) {
            console.log('Task file accepted:', file.originalname);
            cb(null, true)
        }
        else {
            console.log('Task file rejected - invalid mimetype:', file.mimetype);
            cb(null, false)
        }
    }
    else if (file.fieldname === 'problemImage') {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
            console.log('Problem image accepted:', file.originalname);
            cb(null, true)
        }
        else {
            console.log('Problem image rejected - invalid mimetype:', file.mimetype);
            cb(null, false)
        }
    }
    else if (file.fieldname === 'video') {
        if (file.mimetype === 'video/mp4') {
            console.log('Video accepted:', file.originalname);
            cb(null, true)
        }
        else {
            console.log('Video rejected - invalid mimetype:', file.mimetype);
            cb(null, false)
        }
    }
    else {
        console.log('Unknown fieldname:', file.fieldname);
        cb(null, false);
    }
}


const upload = multer({
    storage: storageEngine,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

console.log('Multer configured successfully');

module.exports = upload;

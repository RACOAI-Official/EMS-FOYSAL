const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storageEngine = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = 'ems/other';

        if (file.fieldname === 'profile') {
            folder = 'ems/profiles';
        }
        else if (file.fieldname === 'image') {
            folder = 'ems/teams';
        }
        else if (file.fieldname === 'taskFile') {
            folder = 'ems/tasks';
        }
        else if (file.fieldname === 'problemImage') {
            folder = 'ems/problems';
        }
        else if (file.fieldname === 'chatFile') {
            folder = 'ems/chat';
        }

        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const public_id = file.fieldname + "-" + uniqueSuffix;

        return {
            folder: folder,
            public_id: public_id,
            resource_type: 'auto', // Important for non-image files like PDF
        };
    }
});

const fileFilter = (req, file, cb) => {
    console.log('File Filter - Processing:', file.fieldname, file.mimetype);

    if (!file) {
        return cb(null, false);
    }

    if (file.fieldname === 'profile' || file.fieldname === 'image' || file.fieldname === 'problemImage') {
        const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid image format'), false);
        }
    }
    else if (file.fieldname === 'taskFile' || file.fieldname === 'chatFile') {
        // Allow all file types for task and chat files
        cb(null, true);
    }
    else if (file.fieldname === 'video') {
        if (file.mimetype === 'video/mp4') {
            cb(null, true);
        } else {
            cb(new Error('Invalid video format'), false);
        }
    }
    else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storageEngine,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Increased limit to 10MB for cloud storage
});

console.log('Multer-Cloudinary configured successfully');

module.exports = upload;

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage
const storage = multer.memoryStorage();

// Optional: filter only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files are allowed.'), false);
  }
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

const resolveFolder = (req) => {
  const url = `${req.baseUrl || ''}${req.path || ''}`.toLowerCase();

  if (url.includes('/admin/team')) return 'ems/teams';
  if (url.includes('/problem') || url.includes('/problems')) return 'ems/problems';
  if (url.includes('/chat')) return 'ems/chat';
  if (url.includes('/task') || url.includes('/tasks')) return 'ems/tasks';

  return 'ems/profiles';
};

const uploadBufferToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    stream.end(file.buffer);
  });

const upload = {
  single: (fieldName) => (req, res, next) => {
    multerUpload.single(fieldName)(req, res, async (err) => {
      if (err) return next(err);
      if (!req.file) return next();

      try {
        const folder = resolveFolder(req);
        const result = await uploadBufferToCloudinary(req.file, folder);

        // Keep compatibility with existing controllers that read req.file.path
        req.file.path = result.secure_url;
        req.file.url = result.secure_url;
        req.file.secure_url = result.secure_url;
        req.file.filename = result.public_id;
        req.file.public_id = result.public_id;

        return next();
      } catch (uploadError) {
        return next(uploadError);
      }
    });
  },
};

module.exports = upload;

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,   // your Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY,         // your Cloudinary API key
  api_secret: process.env.CLOUDINARY_API_SECRET,   // your Cloudinary API secret
  secure: true
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - file buffer from Multer
 * @param {string} folder - folder in Cloudinary
 * @returns {Promise<Object>} - result with secure_url, public_id, etc.
 */
const uploadBuffer = (fileBuffer, folder = 'profile_images') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

/**
 * Delete a file from Cloudinary by public_id
 * @param {string} publicId
 */
const deleteFile = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

module.exports = {
  cloudinary,
  uploadBuffer,
  deleteFile
};

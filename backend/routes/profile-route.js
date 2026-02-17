const express = require('express');
const router = express.Router();
const multer = require('multer');
const asyncMiddleware = require('../middlewares/async-middleware');
const cloudinary = require('../configs/cloudinary');
const User = require('../models/user-model');
const { auth } = require('../middlewares/auth-middleware');

// --- Multer memory storage (no disk) ---
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only JPEG, PNG, GIF, WEBP allowed'));
  },
});

// --- Profile Update ---
router.post(
  '/update',
  auth,
  upload.single('image'), // multer middleware
  asyncMiddleware(async (req, res) => {
    const updateData = { ...req.body };

    // --- Upload image to Cloudinary if present ---
    if (req.file) {
      const result = await cloudinary.uploader.upload_stream(
        { folder: 'profiles', resource_type: 'image' },
        async (error, result) => {
          if (error) throw new Error('Cloudinary upload failed');

          updateData.image = result.secure_url; // save Cloudinary URL
          const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true }
          );
          res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
        }
      );
      result.end(req.file.buffer); // send buffer to Cloudinary
    } else {
      // no image, just update other fields
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true }
      );
      res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
    }
  })
);

module.exports = router;

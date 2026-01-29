const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class FileService {
  constructor() {
    this.basePath = path.join(__dirname, '../storage');
  }

  async deleteFile(folder, filename) {
    if (!filename || filename === 'user.png' || filename === 'team.png') return;

    // 1. Check if it's a Cloudinary URL
    if (filename.includes('cloudinary.com')) {
      try {
        // Extract public_id from URL
        // Example: https://res.cloudinary.com/cloudname/image/upload/v12345/ems/profiles/profile-123.jpg
        const parts = filename.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex !== -1) {
          // public_id starts after version (starts with 'v') or immediately after 'upload/'
          let startIndex = uploadIndex + 1;
          if (parts[startIndex].startsWith('v')) {
            startIndex++;
          }
          // The rest is the public_id + extension
          const publicIdWithExt = parts.slice(startIndex).join('/');
          // Remove extension
          const publicId = publicIdWithExt.split('.').slice(0, -1).join('.');

          console.log(`Attempting to delete from Cloudinary: ${publicId}`);

          // Determine resource type (auto-detect doesn't work well for destroy, default to 'image' or use folder names)
          const resourceType = folder.includes('files') || folder.includes('tasks') || folder.includes('chat') ? 'raw' : 'image';

          const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

          // If NOT deleted as image, try as raw (for PDFs/docs)
          if (result.result !== 'ok' && resourceType === 'image') {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
          }

          console.log(`Cloudinary deletion result for ${publicId}:`, result);
          return result.result === 'ok';
        }
      } catch (error) {
        console.error(`Error deleting Cloudinary file ${filename}:`, error.message);
      }
      return false;
    }

    // 2. Legacy Local File Deletion
    const filePath = path.join(this.basePath, folder, filename);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Successfully deleted local file: ${filePath}`);
        return true;
      }
    } catch (error) {
      console.error(`Error deleting local file ${filePath}:`, error.message);
    }
    return false;
  }

  deleteProfileImage(filename) {
    return this.deleteFile('images/profile', filename);
  }

  deleteProblemImage(filename) {
    return this.deleteFile('images/problems', filename);
  }

  deleteTeamImage(filename) {
    return this.deleteFile('images/teams', filename);
  }

  deleteChatFile(filename) {
    return this.deleteFile('files/chat', filename);
  }

  async deleteUserFiles(user, problemService) {
    if (!user) return;

    // 1. Delete Profile Image
    if (user.image) {
      await this.deleteProfileImage(user.image);
    }

    // 2. Delete Problem Images associated with this user
    if (problemService) {
      try {
        const problems = await problemService.findProblems({ user: user._id });
        if (problems && problems.length > 0) {
          for (const problem of problems) {
            if (problem.image) {
              await this.deleteProblemImage(problem.image);
            }
          }
        }
      } catch (error) {
        console.error(`Error deleting user's problem images for ${user._id}:`, error.message);
      }
    }
  }
}

module.exports = new FileService();

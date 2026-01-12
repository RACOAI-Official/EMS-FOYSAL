const fs = require('fs');
const path = require('path');

class FileService {
  constructor() {
    this.basePath = path.join(__dirname, '../storage/images');
  }

  deleteFile(folder, filename) {
    if (!filename || filename === 'user.png' || filename === 'team.png') return;

    const filePath = path.join(this.basePath, folder, filename);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Successfully deleted file: ${filePath}`);
        return true;
      }
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error.message);
    }
    return false;
  }

  deleteProfileImage(filename) {
    return this.deleteFile('profile', filename);
  }

  deleteProblemImage(filename) {
    return this.deleteFile('problems', filename);
  }

  deleteTeamImage(filename) {
    return this.deleteFile('teams', filename);
  }

  async deleteUserFiles(user, problemService) {
    if (!user) return;

    // 1. Delete Profile Image
    if (user.image) {
      this.deleteProfileImage(user.image);
    }

    // 2. Delete Problem Images associated with this user
    if (problemService) {
      try {
        const problems = await problemService.findProblems({ user: user._id });
        if (problems && problems.length > 0) {
          for (const problem of problems) {
            if (problem.image) {
              this.deleteProblemImage(problem.image);
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

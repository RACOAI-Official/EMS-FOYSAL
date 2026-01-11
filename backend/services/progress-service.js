const ProgressModel = require('../models/progress-model');

class ProgressService {
    // Upsert progress for a user for today
    upsertForUser = async (userId, progress, progressNote = '') => {
        const today = new Date().toISOString().slice(0,10); // YYYY-MM-DD
        const update = { progress, progressNote: progressNote || '', date: today };
        return await ProgressModel.findOneAndUpdate(
            { user: userId, date: today },
            { $set: update },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }

    getForUser = async (userId, limit = 30) => {
        return await ProgressModel.find({ user: userId })
            .sort({ date: -1, updatedAt: -1 })
            .limit(limit);
    }

    getAll = async (limit = 200) => {
        return await ProgressModel.find({})
            .populate('user', 'name email username type')
            .sort({ date: -1, updatedAt: -1 })
            .limit(limit);
    }
}

module.exports = new ProgressService();

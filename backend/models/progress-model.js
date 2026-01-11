const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    progress: { type: Number, required: true, min: 0, max: 100 },
    progressNote: { type: String, default: '' },
    date: { type: String, required: true } // ISO date (YYYY-MM-DD)
}, { timestamps: true });

// Ensure one progress entry per user per day
progressSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);

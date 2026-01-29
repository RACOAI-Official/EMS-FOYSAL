const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HolidaySchema = new Schema({
  date: { type: Number, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  name: { type: String, required: true },
  type: { type: String, default: 'Government' }
});

// Add index for faster queries
HolidaySchema.index({ year: 1, month: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Holiday', HolidaySchema);

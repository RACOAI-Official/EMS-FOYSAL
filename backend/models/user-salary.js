const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSalarySchema = new Schema({
    employeeID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    salary: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    reasonForBonus: { type: String, default: 'N/A' },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    assignedDate: { type: String, required: true }
});


module.exports = mongoose.model('UserSalary', UserSalarySchema);

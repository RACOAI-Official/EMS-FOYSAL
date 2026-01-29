const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AttendanceSchema = new Schema({
    employeeID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    date: { type: Number, required: true },
    day: { type: String, required: true },
    present: { type: Boolean, required: true },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Leave'],
        default: function () { return this.present ? 'Present' : 'Absent'; }
    },
    checkInTime: { type: String, required: false },
    checkOutTime: { type: String, required: false },
    checkInLocation: { type: String, required: false }, // Stores "lat,long"
    checkOutLocation: { type: String, required: false }, // Stores "lat,long"
    leaveId: { type: Schema.Types.ObjectId, ref: 'Leave', required: false } // Reference to leave if status is 'Leave'
});

// Add index for faster queries
AttendanceSchema.index({ employeeID: 1, year: 1, month: 1, date: 1 });


module.exports = mongoose.model('Attendance', AttendanceSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AttendanceSchema = new Schema({
    employeeID: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    year: {type: Number, required: true},
    month: {type: Number, required: true},
    date: {type: Number, required: true},
    day: {type: String, required: true},
    present: {type: Boolean, required: true},
    checkInTime: {type: String, required: false},
    checkOutTime: {type: String, required: false}
});


module.exports = mongoose.model('Attendance', AttendanceSchema);
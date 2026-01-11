const Attendance = require('../models/attendance-model');

class AttendanceService{
    markAttendance = async data => Attendance.create(data);
    findAttendance = async (data) => Attendance.findOne(data);
    findAllAttendance = async (data) => Attendance.find(data);
    updateAttendance = async (id, data) => Attendance.findByIdAndUpdate(id, data, {new: true});
}

module.exports = new AttendanceService();
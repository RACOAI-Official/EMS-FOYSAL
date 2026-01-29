const Attendance = require('../models/attendance-model');

class AttendanceService {
    markAttendance = async data => Attendance.create(data);
    findAttendance = async (data) => Attendance.findOne(data);
    findAllAttendance = async (data) => Attendance.find(data).sort({ year: -1, month: -1, date: -1 });
    updateAttendance = async (id, data) => Attendance.findByIdAndUpdate(id, data, { new: true });
    deleteAttendance = async (id) => Attendance.findByIdAndDelete(id);
    updateMany = async (filter, update) => Attendance.updateMany(filter, update);
    countAttendance = async (query) => Attendance.countDocuments(query);
}

module.exports = new AttendanceService();

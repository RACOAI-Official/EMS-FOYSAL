const Attendance = require('../models/attendance-model');
const Leave = require('../models/leave-model');
const Holiday = require('../models/holiday-model');
const User = require('../models/user-model');

class AttendanceSummaryService {
  /**
   * Calculate attendance summary for a user
   * @param {String} employeeID - User ID
   * @param {Object} dateRange - Optional { startDate, endDate } as Date objects
   * @returns {Object} Summary with presentDays, absentDays, leaveDays, totalDays
   */
  async getAttendanceSummary(employeeID, dateRange = null) {
    try {
      const user = await User.findById(employeeID);
      if (!user) throw new Error('User not found');

      const registrationDate = new Date(user.createdAt);
      const today = new Date();

      // Set time to start of day for accurate comparison
      registrationDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      // Determine date range
      let startDate = dateRange?.startDate ? new Date(dateRange.startDate) : registrationDate;
      let endDate = dateRange?.endDate ? new Date(dateRange.endDate) : today;

      // Ensure we don't start before registration
      if (startDate < registrationDate) startDate = registrationDate;

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999); // Cover full end day

      // Build query for attendance records
      const query = {
        employeeID: employeeID,
        $expr: {
          $and: [
            {
              $gte: [
                { $dateFromParts: { year: '$year', month: '$month', day: '$date' } },
                startDate
              ]
            },
            {
              $lte: [
                { $dateFromParts: { year: '$year', month: '$month', day: '$date' } },
                endDate
              ]
            }
          ]
        }
      };

      const attendanceRecords = await Attendance.find(query);

      // Calculate totals
      let presentDays = 0;
      let absentDays = 0;
      let leaveDays = 0;
      const recordedDateKeys = new Set();

      attendanceRecords.forEach(record => {
        const dateKey = `${record.year}-${record.month}-${record.date}`;
        recordedDateKeys.add(dateKey);

        if (record.status === 'Leave') {
          leaveDays++;
          presentDays++; // Approved leaves count as present
        } else if (record.status === 'Present' || record.present === true) {
          presentDays++;
        } else if (record.status === 'Absent') {
          absentDays++;
        }
      });

      // Calculate total working days
      // For auto-absent logic, we only count days that are COMPLETED (before today)
      // or if the user actually has a record for today.

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59, 999);

      // Days that are fully passed
      const lastCompletedDay = endDate < yesterday ? endDate : yesterday;
      let totalCompletedDays = 0;
      if (lastCompletedDay >= startDate) {
        totalCompletedDays = Math.round((lastCompletedDay - startDate) / (24 * 60 * 60 * 1000)) + 1;
      }

      // Count records that occurred during completed days
      let recordsInCompletedDays = 0;
      for (const record of attendanceRecords) {
        const recordDate = new Date(record.year, record.month - 1, record.date);
        if (recordDate <= lastCompletedDay) {
          recordsInCompletedDays++;
        }
      }

      // Absents = Expected days in past - records in past
      absentDays += Math.max(0, totalCompletedDays - recordsInCompletedDays);

      // Fetch holidays for the year
      const holidayRecords = await Holiday.find({ year: endDate.getFullYear() });
      let holidayDays = 0;
      holidayRecords.forEach(h => {
        const holidayDate = new Date(h.year, h.month - 1, h.date);
        if (holidayDate >= startDate && holidayDate <= endDate) {
          holidayDays++;
        }
      });

      // Total days in summary should match the filtered period's completed days + today (if in range)
      let totalDays = totalCompletedDays;
      const isTodayInRange = today >= startDate && today <= endDate;
      if (isTodayInRange) {
        // Check if user has record today
        const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        if (recordedDateKeys.has(todayKey)) {
          totalDays += 1; // User did something today, count it
        }
      }

      // Logic: 365 is one year. 
      // Present % = (Present + Leaves + Holidays) / 365 * 100
      const totalEffectivePresent = presentDays + holidayDays; // Note: presentDays already includes leaves in existing logic
      const presentPercentage = Math.min(100, (totalEffectivePresent / 365) * 100).toFixed(1);
      const absentPercentage = Math.min(100, (absentDays / 365) * 100).toFixed(1);
      const leavePercentage = Math.min(100, (leaveDays / 365) * 100).toFixed(1);
      const totalReportedPercentage = Math.min(100, (totalDays / 365) * 100).toFixed(1);

      return {
        presentDays,
        absentDays,
        leaveDays,
        holidayDays,
        totalDays,
        registrationDate: user.createdAt,
        summary: {
          present: presentDays,
          absent: absentDays,
          leave: leaveDays,
          holiday: holidayDays,
          total: totalDays,
          percentages: {
            present: presentPercentage,
            absent: absentPercentage,
            leave: leavePercentage,
            total: totalReportedPercentage
          }
        }
      };
    } catch (error) {
      console.error('Error calculating attendance summary:', error);
      throw error;
    }
  }

  /**
   * Calculate number of days between two dates
   */
  _calculateWorkingDays(startDate, endDate) {
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
    const diffDays = Math.round((endDate - startDate) / oneDay) + 1; // +1 to include both start and end
    return diffDays > 0 ? diffDays : 0;
  }

  /**
   * Create attendance records for approved leave dates
   */
  async createLeaveAttendanceRecords(leaveId, leaveData) {
    try {
      const { applicantID, startDate, endDate } = leaveData;

      const start = new Date(startDate);
      const end = new Date(endDate);

      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const createdRecords = [];

      // Iterate through each day in the leave period
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const dayOfMonth = date.getDate();
        const dayName = days[date.getDay()];

        // Check if attendance already exists for this date
        const existingAttendance = await Attendance.findOne({
          employeeID: applicantID,
          year,
          month,
          date: dayOfMonth
        });

        if (existingAttendance) {
          // Update existing record to Leave status
          existingAttendance.status = 'Leave';
          existingAttendance.present = true;
          existingAttendance.leaveId = leaveId;
          await existingAttendance.save();
          createdRecords.push(existingAttendance);
        } else {
          // Create new attendance record with Leave status
          const newAttendance = await Attendance.create({
            employeeID: applicantID,
            year,
            month,
            date: dayOfMonth,
            day: dayName,
            present: true,
            status: 'Leave',
            leaveId: leaveId
          });
          createdRecords.push(newAttendance);
        }
      }

      return createdRecords;
    } catch (error) {
      console.error('Error creating leave attendance records:', error);
      throw error;
    }
  }

  /**
   * Remove leave attendance records when leave is rejected/cancelled
   */
  async removeLeaveAttendanceRecords(leaveId) {
    try {
      // Find all attendance records for this leave
      const attendanceRecords = await Attendance.find({ leaveId });

      for (const record of attendanceRecords) {
        // If the record was created solely for the leave (no check-in time), delete it
        if (!record.checkInTime) {
          await Attendance.findByIdAndDelete(record._id);
        } else {
          // Otherwise, just revert the status
          record.status = 'Present';
          record.leaveId = null;
          await record.save();
        }
      }

      return { deletedCount: attendanceRecords.length };
    } catch (error) {
      console.error('Error removing leave attendance records:', error);
      throw error;
    }
  }

  /**
   * Get detailed attendance data with leave information
   */
  async getDetailedAttendance(employeeID, dateRange = null) {
    try {
      const query = { employeeID };

      if (dateRange) {
        if (dateRange.year) query.year = dateRange.year;
        if (dateRange.month) query.month = dateRange.month;
        if (dateRange.date) query.date = dateRange.date;
      }

      const attendanceRecords = await Attendance.find(query)
        .populate('leaveId', 'type reason adminResponse')
        .sort({ year: -1, month: -1, date: -1 });

      return attendanceRecords;
    } catch (error) {
      console.error('Error fetching detailed attendance:', error);
      throw error;
    }
  }
}

module.exports = new AttendanceSummaryService();

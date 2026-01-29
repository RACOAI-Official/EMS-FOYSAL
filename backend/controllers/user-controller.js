const ErrorHandler = require('../utils/error-handler');
const bcrypt = require('bcrypt');
const userService = require('../services/user-service');
const UserDto = require('../dtos/user-dto');
const mongoose = require('mongoose');
const crypto = require('crypto');
const teamService = require('../services/team-service');
const attendanceService = require('../services/attendance-service');
const problemService = require('../services/problem-service');
const fs = require('fs');
const path = require('path');
const fileService = require('../services/file-service');
const InvitationModel = require('../models/invitation-model'); // Import Invitation Model


class UserController {

    createUser = async (req, res, next) => {
        try {
            const file = req.file;
            let { name, email, password, type, address, mobile } = req.body;
            const username = 'user' + crypto.randomInt(11111111, 999999999);

            console.log('=== CREATE USER REQUEST ===');
            console.log('Body:', req.body);
            console.log('File:', file);

            // Validation
            if (!name) return next(ErrorHandler.badRequest('Name is required'));
            if (!email) return next(ErrorHandler.badRequest('Email is required'));
            if (!password) return next(ErrorHandler.badRequest('Password is required'));
            if (!type) return next(ErrorHandler.badRequest('User type is required'));
            if (!address) return next(ErrorHandler.badRequest('Address is required'));
            if (!mobile) return next(ErrorHandler.badRequest('Mobile number is required'));
            if (!file) return next(ErrorHandler.badRequest('Profile image is required'));

            type = type.toLowerCase();

            // Check if user already exists
            const existingUser = await userService.findUser({ email });
            if (existingUser) return next(ErrorHandler.badRequest('Email already exists'));

            if (['super_admin', 'sub_admin'].includes(type)) {
                const adminPassword = req.body.adminPassword;
                if (!adminPassword)
                    return next(ErrorHandler.badRequest(`Please Enter Your Password to Add ${name} as an Admin`));
                const { _id } = req.user;
                const { password: hashPassword } = await userService.findUser({ _id });
                const isPasswordValid = await userService.verifyPassword(adminPassword, hashPassword);
                if (!isPasswordValid) return next(ErrorHandler.unAuthorized('You have entered a wrong password'));
            }

            const user = {
                name,
                email,
                username,
                mobile: Number(mobile),  // Convert to number
                password,
                type,
                address,
                image: file.path
            }

            console.log('Creating user:', user);
            const userResp = await userService.createUser(user);

            console.log('User created:', userResp);
            if (!userResp) return next(ErrorHandler.serverError('Failed To Create An Account'));
            res.json({ success: true, message: 'User has been Added', user: new UserDto(userResp) });
        } catch (error) {
            console.error('=== CREATE USER ERROR ===', error);
            return next(ErrorHandler.serverError('Failed To Create User: ' + error.message));
        }
    }

    updateUser = async (req, res, next) => {
        try {
            const file = req.file;
            const filename = file && file.path;
            let user, id;
            console.log('Update User Request');
            console.log('File:', file);
            console.log('Filename:', filename);
            console.log('User Type:', req.user.type);

            if (['super_admin', 'sub_admin'].includes(req.user.type)) {
                const { id: paramId } = req.params;
                id = paramId;
                let { name, username, email, password, type, status, address, mobile } = req.body;
                // Optional progress updates
                let { progress, progressNote } = req.body;

                if (!mongoose.Types.ObjectId.isValid(id)) return next(ErrorHandler.badRequest('Invalid User Id'));

                // Fetch the user first to check if type is actually changing
                const dbUser = await userService.findUser({ _id: id });
                if (!dbUser) return next(ErrorHandler.badRequest('No User Found'));

                // Normalize type for comparison (trim and lowercase)
                const newType = type ? type.trim().toLowerCase() : null;
                const currentType = dbUser.type ? dbUser.type.trim().toLowerCase() : null;

                console.log('Type comparison:', { newType, currentType, areEqual: newType === currentType });

                // Track if we need to remove from team
                let removeFromTeam = false;

                // Only require admin password if type is ACTUALLY changing
                if (newType && currentType && newType !== currentType) {
                    console.log('Type is changing, requiring admin password');
                    const { _id } = req.user;
                    if (_id.toString() === id.toString()) return next(ErrorHandler.badRequest(`You Can't Change Your Own Position`));
                    const { adminPassword } = req.body;
                    if (!adminPassword)
                        return next(ErrorHandler.badRequest(`Please Enter Your Password To Change The Type`));
                    const { password: hashPassword } = await userService.findUser({ _id });
                    const isPasswordValid = await userService.verifyPassword(adminPassword, hashPassword);
                    if (!isPasswordValid) return next(ErrorHandler.unAuthorized('You have entered a wrong password'));

                    // Handle team constraints when changing type
                    if ((currentType === 'employee') && (['super_admin', 'sub_admin', 'leader'].includes(newType))) {
                        // Automatically remove from team when promoting employee to admin/leader
                        if (dbUser.team != null) {
                            console.log(`Removing ${dbUser.name} from team due to type change`);
                            removeFromTeam = true;
                        }
                    }

                    if ((currentType === 'leader') && (['super_admin', 'sub_admin', 'employee'].includes(newType))) {
                        // Check if they're leading a team
                        const leadingTeam = await teamService.findTeam({ leader: id });
                        if (leadingTeam) {
                            return next(ErrorHandler.badRequest(`Error : ${dbUser.name} is leading a team. Please assign a new leader first.`));
                        }
                    }
                } else if (newType && currentType) {
                    console.log('Type is not changing, skipping password check');
                }

                // Build update object - only include fields that are provided
                user = {};
                if (name !== undefined) user.name = name;
                if (email !== undefined) user.email = email;
                if (status !== undefined) user.status = status ? status.toLowerCase() : status;
                if (username !== undefined) user.username = username;
                if (mobile !== undefined) user.mobile = mobile;
                if (password !== undefined) user.password = password;
                if (newType !== null) user.type = newType;
                if (address !== undefined) user.address = address;
                if (progress !== undefined) user.progress = Number(progress);
                if (progressNote !== undefined) user.progressNote = progressNote;
                if (removeFromTeam) user.team = null; // Remove from team if type changed

                // New profile fields
                if (req.body.fatherName !== undefined) user.fatherName = req.body.fatherName;
                if (req.body.motherName !== undefined) user.motherName = req.body.motherName;
                if (req.body.presentAddress !== undefined) user.presentAddress = req.body.presentAddress;

                if (req.body.bloodGroup !== undefined) user.bloodGroup = req.body.bloodGroup;
                if (req.body.employeeId !== undefined) user.employeeId = req.body.employeeId;
                // Only update image if a new file was uploaded
                if (filename) {
                    user.image = filename;
                }
            }
            else {
                // Self update
                id = req.user._id;
                user = {};

                const allowedFields = [
                    'name', 'username', 'email', 'mobile', 'address',
                    'fatherName', 'motherName', 'presentAddress',
                    'bloodGroup'
                ];

                allowedFields.forEach(field => {
                    if (req.body[field] !== undefined) {
                        user[field] = req.body[field];
                    }
                });

                if (req.body.progress !== undefined) user.progress = Number(req.body.progress);
                if (req.body.progressNote !== undefined) user.progressNote = req.body.progressNote;

                // Handle password update with manual hashing
                if (req.body.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(req.body.password, salt);
                }

                // Only update image if a new file was uploaded
                if (filename) {
                    user.image = filename;
                }
            }
            console.log('Update data:', user);
            const userResp = await userService.updateUser(id, user);
            console.log('Update response:', userResp);
            if (!userResp) return next(ErrorHandler.serverError('Failed To Update Account'));
            console.log('✅ MongoDB Persistence Confirmed - Updated user type:', userResp.type);
            res.json({ success: true, message: 'Account Updated', user: new UserDto(userResp) });
        } catch (error) {
            console.error('=== UPDATE USER ERROR ===', error);
            return next(ErrorHandler.serverError('Failed To Update Account: ' + error.message));
        }
    }

    updateUserProgress = async (req, res, next) => {
        return next(ErrorHandler.unAuthorized('Progress updates must be submitted by the authenticated user only'));
    }

    getUsers = async (req, res, next) => {
        const type = req.path.split('/').pop().replace('s', '');
        const emps = await userService.findUsers({ type });
        const employees = emps ? emps.map((o) => new UserDto(o)) : [];
        res.json({ success: true, message: `${type.charAt(0).toUpperCase() + type.slice(1).replace(' ', '')} List Found`, data: employees })
    }


    getFreeEmployees = async (req, res, next) => {
        try {
            // Return all employees since they can now be in multiple teams
            const emps = await userService.findUsers({ type: 'employee' });
            const employees = emps ? emps.map((o) => new UserDto(o)) : [];
            res.json({ success: true, message: 'Employees List Found', data: employees });
        } catch (error) {
            next(error);
        }
    }


    getUser = async (req, res, next) => {
        const { id } = req.params;
        const type = req.path.replace(id, '').replace('/', '').replace('/', '');
        console.log(`Fetching user with ID: ${id}, Type: ${type}`);
        if (!mongoose.Types.ObjectId.isValid(id)) return next(ErrorHandler.badRequest(`Invalid ${type.charAt(0).toUpperCase() + type.slice(1).replace(' ', '')} Id`));
        const emp = await userService.findUser({ _id: id, type });
        console.log(`User found: ${emp ? emp.name : 'NOT FOUND'}`);
        if (!emp) return next(ErrorHandler.notFound(`No ${type.charAt(0).toUpperCase() + type.slice(1).replace(' ', '')} Found`));
        const userData = new UserDto(emp);
        console.log(`Returning user with image: ${userData.image}`);
        res.json({ success: true, message: 'Employee Found', data: userData })
    }

    getUserNoFilter = async (req, res, next) => {
        const { id } = req.params;
        console.log(`Fetching user (no filter) with ID: ${id}`);
        if (!mongoose.Types.ObjectId.isValid(id)) return next(ErrorHandler.badRequest('Invalid User Id'));

        // Authorization: Admin, Super Admin, or Sub Admin
        const allowedRoles = ['super_admin', 'sub_admin'];
        if (!req.user || !allowedRoles.includes(req.user.type.toLowerCase())) {
            return next(ErrorHandler.unAuthorized('Access denied: Unauthorized role'));
        }

        const emp = await userService.findUser({ _id: id });
        console.log(`User found: ${emp ? emp.name : 'NOT FOUND'}`);
        if (!emp) return next(ErrorHandler.notFound('No User Found'));
        const userData = new UserDto(emp);
        console.log(`Returning user with image: ${userData.image}`);
        res.json({ success: true, message: 'User Found', data: userData })
    }

    getLeaders = async (req, res, next) => {
        const leaders = await userService.findLeaders();
        const data = leaders.map((o) => new UserDto(o));
        res.json({ success: true, message: 'Leaders Found', data })
    }

    getFreeLeaders = async (req, res, next) => {
        try {
            // Return all leaders since they can now be in multiple teams
            const leaders = await userService.findUsers({ type: 'leader' });
            const data = leaders ? leaders.map((o) => new UserDto(o)) : [];
            res.json({ success: true, message: 'Leaders Found', data });
        } catch (error) {
            next(error);
        }
    }

    markEmployeeAttendance = async (req, res, next) => {
        try {
            const { employeeID, location } = req.body;
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const d = new Date();

            // Format check-in time as HH:MM:SS with Asia/Dhaka timezone
            const checkInTime = d.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Dhaka' });

            const newAttendance = {
                employeeID,
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                date: d.getDate(),
                day: days[d.getDay()],
                present: true,
                checkInTime: checkInTime,
                checkInLocation: location || null
            };

            const isAttendanceMarked = await attendanceService.findAttendance({
                employeeID,
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                date: d.getDate()
            });
            if (isAttendanceMarked) return next(ErrorHandler.notAllowed(d.toLocaleDateString() + " " + days[d.getDay()] + " " + "Attendance Already Marked!"));

            const resp = await attendanceService.markAttendance(newAttendance);
            console.log(resp);
            if (!resp) return next(ErrorHandler.serverError('Failed to mark attendance'));

            const msg = d.toLocaleDateString() + " " + days[d.getDay()] + " " + "Attendance Marked! Check-in: " + checkInTime;

            res.json({ success: true, newAttendance, message: msg });

        } catch (error) {
            res.json({ success: false, error });
        }
    }

    markEmployeeCheckOut = async (req, res, next) => {
        try {
            const { employeeID, location } = req.body;
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const d = new Date();

            // Format check-out time as HH:MM:SS with Asia/Dhaka timezone
            const checkOutTime = d.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Dhaka' });

            // Find today's attendance record
            const todayAttendance = await attendanceService.findAttendance({
                employeeID,
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                date: d.getDate()
            });

            if (!todayAttendance) return next(ErrorHandler.notFound('No attendance record found for today. Please mark attendance first.'));
            if (todayAttendance.checkOutTime) return next(ErrorHandler.notAllowed('Check-out already marked!'));

            // Update with checkout time
            const updated = await attendanceService.updateAttendance(todayAttendance._id, {
                checkOutTime,
                checkOutLocation: location || null
            });
            if (!updated) return next(ErrorHandler.serverError('Failed to mark check-out'));

            const msg = d.toLocaleDateString() + " " + days[d.getDay()] + " " + "Check-out Marked! Time: " + checkOutTime;

            res.json({ success: true, checkOutTime, message: msg });

        } catch (error) {
            res.json({ success: false, error });
        }
    }

    viewEmployeeAttendance = async (req, res, next) => {
        try {
            const data = req.body;
            const resp = await attendanceService.findAllAttendance(data);
            if (!resp) return next(ErrorHandler.notFound('No Attendance found'));

            res.json({ success: true, data: resp });

        } catch (error) {
            res.json({ success: false, error });
        }
    }

    applyLeaveApplication = async (req, res, next) => {
        try {
            const data = req.body;
            const { applicantID, title, type, startDate, endDate, appliedDate, period, reason } = data;
            const newLeaveApplication = {
                applicantID,
                title,
                type,
                startDate,
                endDate,
                appliedDate,
                period,
                reason,
                adminResponse: "Pending"
            };

            const isLeaveApplied = await userService.findLeaveApplication({ applicantID, startDate, endDate, appliedDate });
            if (isLeaveApplied) return next(ErrorHandler.notAllowed('Leave Already Applied'));

            const resp = await userService.createLeaveApplication(newLeaveApplication);
            if (!resp) return next(ErrorHandler.serverError('Failed to apply leave'));

            res.json({ success: true, data: resp });

        } catch (error) {
            res.json({ success: false, error });
        }
    }

    viewLeaveApplications = async (req, res, next) => {
        try {
            const data = req.body;
            const resp = await userService.findAllLeaveApplications(data);
            if (!resp) return next(ErrorHandler.notFound('No Leave Applications found'));

            res.json({ success: true, data: resp });

        } catch (error) {
            res.json({ success: false, error });
        }
    }

    updateLeaveApplication = async (req, res, next) => {
        try {
            const { id } = req.params;
            const body = req.body;

            // Fetch the leave application
            const leaveApp = await userService.findLeaveApplication({ _id: id });
            if (!leaveApp) return next(ErrorHandler.notFound('Leave application not found'));

            const previousStatus = leaveApp.adminResponse;
            const newStatus = body.adminResponse;

            // If admin edited dates, recalculate period
            if (body.startDate || body.endDate) {
                const start = new Date(body.startDate || leaveApp.startDate);
                const end = new Date(body.endDate || leaveApp.endDate);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                body.period = diffDays;
            }

            // Update the leave application
            const isLeaveUpdated = await userService.updateLeaveApplication(id, body);
            if (!isLeaveUpdated) return next(ErrorHandler.serverError('Failed to update leave'));

            // Handle attendance integration based on status change
            const attendanceSummaryService = require('../services/attendance-summary-service');

            if (newStatus === 'Approved') {
                // Fetch the updated leave app to get correct dates/period for attendance records
                const updatedLeaveApp = await userService.findLeaveApplication({ _id: id });

                // Create attendance records for approved leave
                await attendanceSummaryService.createLeaveAttendanceRecords(id, {
                    applicantID: updatedLeaveApp.applicantID,
                    startDate: updatedLeaveApp.startDate,
                    endDate: updatedLeaveApp.endDate
                });
            } else if (previousStatus === 'Approved' && newStatus !== 'Approved') {
                // Remove attendance records if leave was unapproved/rejected
                await attendanceSummaryService.removeLeaveAttendanceRecords(id);
            }

            res.json({ success: true, message: 'Leave Updated' });
        } catch (error) {
            console.error('Error updating leave:', error);
            res.json({ success: false, error });
        }
    }

    deleteLeaveApplication = async (req, res, next) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) return next(ErrorHandler.badRequest('Invalid Leave Application Id'));

            // Cleanup associated attendance records if any
            const attendanceSummaryService = require('../services/attendance-summary-service');
            await attendanceSummaryService.removeLeaveAttendanceRecords(id);

            const result = await userService.deleteLeaveApplication(id);
            if (!result) return next(ErrorHandler.serverError('Failed to delete leave application'));

            res.json({ success: true, message: 'Leave application deleted successfully' });
        } catch (error) {
            console.error('Error deleting leave application:', error);
            res.json({ success: false, error: error.message });
        }
    }

    assignEmployeeSalary = async (req, res, next) => {
        try {
            const data = req.body;
            if (!data.bonus) data.bonus = 0;
            if (!data.reasonForBonus) data.reasonForBonus = 'N/A';
            const d = new Date();
            const year = data.year || d.getFullYear();
            const month = data.month || (d.getMonth() + 1);

            const isSalaryAssigned = await userService.findSalary({
                employeeID: data.employeeID,
                year,
                month
            });
            if (isSalaryAssigned) return next(ErrorHandler.serverError('Salary already assigned for this month'));

            data["year"] = year;
            data["month"] = month;
            data["assignedDate"] = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
            const resp = await userService.assignSalary(data);
            if (!resp) return next(ErrorHandler.serverError('Failed to assign salary'));

            // Notify User
            const Notification = require('../models/notification-model');
            await Notification.create({
                title: 'Salary Assigned',
                message: `Your salary for ${month}/${year} has been assigned.`,
                type: 'salary',
                link: '/userSalary',
                user: data.employeeID
            });

            // Emit Real-time Notification to User
            const socketService = require('../services/socket-service');
            socketService.emitToUser(data.employeeID, 'notification', {
                title: 'Salary Assigned',
                message: `Your salary for ${month}/${year} has been assigned.`,
                type: 'salary',
                link: '/userSalary'
            });

            res.json({ success: true, data: resp });
        } catch (error) {
            res.json({ success: false, error });
        }
    }

    updateEmployeeSalary = async (req, res, next) => {
        try {
            const body = req.body;
            const { employeeID, month, year } = body;
            const d = new Date();

            // Use provided month/year or fallback to current (fallback is risky if not provided)
            const targetMonth = month || (d.getMonth() + 1);
            const targetYear = year || d.getFullYear();

            body["assignedDate"] = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();

            const isSalaryUpdated = await userService.updateSalary({
                employeeID,
                month: targetMonth,
                year: targetYear
            }, body);
            console.log(isSalaryUpdated);
            if (!isSalaryUpdated) return next(ErrorHandler.serverError('Failed to update salary'));

            // Notify User
            const Notification = require('../models/notification-model');
            await Notification.create({
                title: 'Salary Updated',
                message: `Your salary for ${(month || d.getMonth() + 1)}/${year || d.getFullYear()} has been updated.`,
                type: 'salary',
                link: '/userSalary',
                user: employeeID
            });

            // Emit Real-time Notification to User
            const socketService = require('../services/socket-service');
            socketService.emitToUser(employeeID, 'notification', {
                title: 'Salary Updated',
                message: `Your salary for ${(month || d.getMonth() + 1)}/${year || d.getFullYear()} has been updated.`,
                type: 'salary',
                link: '/userSalary'
            });

            res.json({ success: true, message: 'Salary Updated' });

        } catch (error) {
            res.json({ success: false, error });
        }
    }

    viewSalary = async (req, res, next) => {
        try {
            const data = req.body;
            const resp = await userService.findAllSalary(data);
            if (!resp) return next(ErrorHandler.notFound('No Salary Found'));
            res.json({ success: true, data: resp });

        } catch (error) {
            res.json({ success: false, error });
        }
    }

    // Get users filtered by type
    getUsersByType = async (req, res, next) => {
        try {
            const { type } = req.params;
            if (!type) return next(ErrorHandler.badRequest('Type parameter is required'));

            const users = await userService.findUsersByType(type);
            const usersDto = users ? users.map(user => new UserDto(user)) : [];
            res.json({ success: true, data: usersDto });
        } catch (error) {
            next(error);
        }
    }

    // Get all admin users
    getAdminUsers = async (req, res, next) => {
        try {
            const users = await userService.findAdmins();
            const usersDto = users ? users.map(user => new UserDto(user)) : [];
            res.json({ success: true, data: usersDto });
        } catch (error) {
            next(error);
        }
    }

    // Get all leader users
    getLeaderUsers = async (req, res, next) => {
        try {
            const users = await userService.findLeaders();
            const usersDto = users ? users.map(user => new UserDto(user)) : [];
            res.json({ success: true, data: usersDto });
        } catch (error) {
            next(error);
        }
    }

    // Get all employee users
    getEmployeeUsers = async (req, res, next) => {
        try {
            const users = await userService.findAllEmployees();
            const usersDto = users ? users.map(user => new UserDto(user)) : [];
            res.json({ success: true, data: usersDto });
        } catch (error) {
            next(error);
        }
    }

    // Get all employee users
    getFreeEmployees = async (req, res, next) => {
        try {
            // Return all employees since they can now be in multiple teams
            const employees = await userService.findUsers({ type: 'employee' });
            if (!employees) return next(ErrorHandler.notFound('No Employees Found'));
            const data = employees.map(o => new UserDto(o));
            res.json({ success: true, message: 'Employees Found', data });
        } catch (error) {
            next(error);
        }
    }

    deleteUser = async (req, res, next) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) return next(ErrorHandler.badRequest('Invalid User Id'));

            const user = await userService.findUser({ _id: id });
            if (!user) return next(ErrorHandler.notFound('User not found'));

            // Cleanup: If the user is a leader, handle their team and employers
            if (user.type === 'leader') {
                const teams = await teamService.findTeams({ leader: id });
                if (teams && teams.length > 0) {
                    for (const team of teams) {
                        // Unassign all employers from this team (as they were under this leader)
                        await userService.UserModel.updateMany({ team: team._id }, { team: null });
                        // Clear the leader from the team
                        await teamService.updateTeam(team._id, { leader: null });
                    }
                }
            }

            // --- FILE CLEANUP START ---
            await fileService.deleteUserFiles(user, problemService);
            // --- FILE CLEANUP END ---

            // --- INVITATION CLEANUP START ---
            await InvitationModel.deleteMany({ email: user.email });
            // --- INVITATION CLEANUP END ---

            const result = await userService.deleteUser(id);
            if (!result) return next(ErrorHandler.serverError('Failed to delete user'));

            res.json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    deleteSalary = async (req, res, next) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) return next(ErrorHandler.badRequest('Invalid Salary Id'));

            const result = await userService.deleteSalary(id);
            if (!result) return next(ErrorHandler.serverError('Failed to delete salary record'));

            res.json({ success: true, message: 'Salary record deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    // Get attendance summary for a user
    getAttendanceSummary = async (req, res, next) => {
        try {
            const { userId } = req.params;
            const { startDate, endDate } = req.query;

            const attendanceSummaryService = require('../services/attendance-summary-service');

            const dateRange = {};
            if (startDate) dateRange.startDate = new Date(startDate);
            if (endDate) dateRange.endDate = new Date(endDate);

            const summary = await attendanceSummaryService.getAttendanceSummary(
                userId || req.user._id,
                Object.keys(dateRange).length > 0 ? dateRange : null
            );

            res.json({ success: true, data: summary });
        } catch (error) {
            console.error('Error getting attendance summary:', error);
            next(error);
        }
    }

    // Edit attendance record (Admin only)
    editAttendance = async (req, res, next) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(ErrorHandler.badRequest('Invalid attendance ID'));
            }

            const updated = await attendanceService.updateAttendance(id, updateData);
            if (!updated) return next(ErrorHandler.notFound('Attendance record not found'));

            res.json({ success: true, message: 'Attendance updated successfully', data: updated });
        } catch (error) {
            console.error('Error editing attendance:', error);
            next(error);
        }
    }

    // Recalculate salary based on attendance (Admin only)
    recalculateSalary = async (req, res, next) => {
        try {
            const { userId } = req.params;
            const { month, year, baseSalary } = req.body;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return next(ErrorHandler.badRequest('Invalid user ID'));
            }

            const attendanceSummaryService = require('../services/attendance-summary-service');

            // Get attendance summary for the month
            const firstDay = new Date(year, month - 1, 1);
            const lastDay = new Date(year, month, 0);

            const summary = await attendanceSummaryService.getAttendanceSummary(userId, {
                startDate: firstDay,
                endDate: lastDay
            });

            // Calculate salary based on attendance
            // Formula: (presentDays / totalDays) * baseSalary
            const attendanceRatio = summary.totalDays > 0 ? summary.presentDays / summary.totalDays : 0;
            const calculatedSalary = Math.round(baseSalary * attendanceRatio);

            // Update or create salary record
            const existingSalary = await userService.findSalary({ employeeID: userId, month, year });

            if (existingSalary) {
                await userService.updateSalary({ employeeID: userId, month, year }, {
                    salary: calculatedSalary,
                    assignedDate: new Date().toISOString().split('T')[0]
                });
            } else {
                await userService.assignSalary({
                    employeeID: userId,
                    salary: calculatedSalary,
                    month,
                    year,
                    assignedDate: new Date().toISOString().split('T')[0]
                });
            }

            res.json({
                success: true,
                message: 'Salary recalculated successfully',
                data: {
                    summary,
                    calculatedSalary,
                    baseSalary,
                    attendanceRatio: (attendanceRatio * 100).toFixed(2) + '%'
                }
            });
        } catch (error) {
            console.error('Error recalculating salary:', error);
            next(error);
        }
    }

    globalSearch = async (req, res, next) => {
        try {
            const { q } = req.query;
            if (!q) return res.json({ success: true, data: [] });

            const searchRegex = new RegExp(q, 'i');
            const users = await userService.findUsers({
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                    { mobile: searchRegex },
                    { employeeId: searchRegex }
                ]
            });

            const usersDto = users ? users.map(user => new UserDto(user)) : [];
            res.json({ success: true, data: usersDto });
        } catch (error) {
            next(error);
        }
    }

    updateUserProgress = async (req, res, next) => {
        try {
            const { id } = req.params;
            let { progress, progressNote } = req.body;

            if (!id || !mongoose.Types.ObjectId.isValid(id)) {
                return next(ErrorHandler.badRequest('Invalid User ID'));
            }

            if (progress === undefined || progress === null) {
                return next(ErrorHandler.badRequest('Progress value is required'));
            }

            progress = Number(progress);
            if (Number.isNaN(progress) || progress < 0 || progress > 100) {
                return next(ErrorHandler.badRequest('Progress must be between 0 and 100'));
            }

            // Update User Model (Current state)
            const user = await userService.UserModel.findByIdAndUpdate(
                id,
                { $set: { progress, progressNote: progressNote || '' } },
                { new: true }
            );

            if (!user) return next(ErrorHandler.notFound('User not found'));

            // Update Progress Model (Historical tracking)
            const progressService = require('../services/progress-service');
            await progressService.upsertForUser(id, progress, progressNote);

            // Emit Real-time Notification
            const socketService = require('../services/socket-service');
            socketService.emitToAll('progress-update', {
                userId: id,
                progress,
                progressNote: progressNote || '',
                updatedAt: new Date()
            });

            res.json({ success: true, message: 'User progress updated', data: user });
        } catch (error) {
            next(ErrorHandler.serverError(error.message));
        }
    }

    getLeaderboardData = async (req, res, next) => {
        try {
            const { type: role, _id: userId, team: userTeamId } = req.user;
            const { mode } = req.query; // 'users' or 'teams'
            let data = [];

            if (mode === 'teams') {
                // Return all teams for everyone to see ranking
                data = await teamService.findTeams({});
            } else {
                // Mode: users
                const filterType = req.query.type;
                if (filterType) {
                    // If a specific type is requested (leaderboard view), allow everyone to see it
                    data = await userService.findUsers({ type: filterType });
                } else if (['super_admin', 'sub_admin'].includes(role.toLowerCase())) {
                    // Default admin view: all employees and leaders
                    const employees = await userService.findUsers({ type: 'employee' });
                    const leaders = await userService.findUsers({ type: 'leader' });
                    data = [...employees, ...leaders];
                } else if (role.toLowerCase() === 'leader') {
                    // Default leader view: their members + all leaders
                    const myTeams = await teamService.findTeams({ leader: userId });
                    const myTeamIds = myTeams.map(t => t._id);
                    const members = await userService.findUsers({ team: { $in: myTeamIds }, type: 'employee' });
                    const leaders = await userService.findUsers({ type: 'leader' });

                    const uniqueUsers = new Map();
                    [...members, ...leaders].forEach(u => uniqueUsers.set(u._id.toString(), u));
                    data = Array.from(uniqueUsers.values());
                } else {
                    // Default employee view: team members
                    if (userTeamId) {
                        data = await userService.findUsers({ team: userTeamId });
                    } else {
                        data = [req.user];
                    }
                }
            }

            const dataDto = data.map(item => {
                if (mode === 'teams') {
                    const TeamDto = require('../dtos/team-dto');
                    return new TeamDto(item);
                }
                return new UserDto(item);
            });

            res.json({ success: true, data: dataDto });
        } catch (error) {
            next(error);
        }
    }
}
module.exports = new UserController();

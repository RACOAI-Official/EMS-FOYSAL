const ErrorHandler = require('../utils/error-handler');
const userService = require('../services/user-service');
const UserDto = require('../dtos/user-dto');
const mongoose = require('mongoose');
const crypto = require('crypto');
const teamService = require('../services/team-service');
const attendanceService = require('../services/attendance-service');
const problemService = require('../services/problem-service');
const fs = require('fs');
const path = require('path');


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

            if (type === 'admin') {
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
                image: file.filename
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
            const filename = file && file.filename;
            let user, id;
            console.log('Update User Request');
            console.log('File:', file);
            console.log('Filename:', filename);
            console.log('User Type:', req.user.type);

            if (req.user.type === 'admin') {
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
                    if ((currentType === 'employee') && (newType === 'admin' || newType === 'leader')) {
                        // Automatically remove from team when promoting employee to admin/leader
                        if (dbUser.team != null) {
                            console.log(`Removing ${dbUser.name} from team due to type change`);
                            removeFromTeam = true;
                        }
                    }

                    if ((currentType === 'leader') && (newType === 'admin' || newType === 'employee')) {
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
                // Only update image if a new file was uploaded
                if (filename) {
                    user.image = filename;
                }
            }
            else {
                id = req.user._id;
                let { name, username, address, mobile, progress, progressNote } = req.body;
                user = { name, username, mobile, address };
                if (progress !== undefined) user.progress = Number(progress);
                if (progressNote !== undefined) user.progressNote = progressNote;
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
        if (!emps || emps.length < 1) return next(ErrorHandler.notFound(`No ${type.charAt(0).toUpperCase() + type.slice(1).replace(' ', '')} Found`));
        const employees = emps.map((o) => new UserDto(o));
        res.json({ success: true, message: `${type.charAt(0).toUpperCase() + type.slice(1).replace(' ', '')} List Found`, data: employees })
    }


    getFreeEmployees = async (req, res, next) => {
        try {
            // Return all employees since they can now be in multiple teams
            const emps = await userService.findUsers({ type: 'employee' });
            if (!emps || emps.length < 1) return next(ErrorHandler.notFound(`No Employees Found`));
            const employees = emps.map((o) => new UserDto(o));
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
            if (!leaders) return next(ErrorHandler.notFound('No Leaders Found'));
            const data = leaders.map((o) => new UserDto(o));
            res.json({ success: true, message: 'Leaders Found', data });
        } catch (error) {
            next(error);
        }
    }

    markEmployeeAttendance = async (req, res, next) => {
        try {
            const { employeeID } = req.body;
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const d = new Date();

            // Format check-in time as HH:MM:SS
            const checkInTime = d.toLocaleTimeString('en-US', { hour12: false });

            const newAttendance = {
                employeeID,
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                date: d.getDate(),
                day: days[d.getDay()],
                present: true,
                checkInTime: checkInTime
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
            const { employeeID } = req.body;
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const d = new Date();

            // Format check-out time as HH:MM:SS
            const checkOutTime = d.toLocaleTimeString('en-US', { hour12: false });

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
            const updated = await attendanceService.updateAttendance(todayAttendance._id, { checkOutTime });
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
            const isLeaveUpdated = await userService.updateLeaveApplication(id, body);
            if (!isLeaveUpdated) return next(ErrorHandler.serverError('Failed to update leave'));
            res.json({ success: true, message: 'Leave Updated' });


        } catch (error) {
            res.json({ success: false, error });
        }
    }

    assignEmployeeSalary = async (req, res, next) => {
        try {
            const data = req.body;
            const obj = {
                "employeeID": data.employeeID
            }
            const isSalaryAssigned = await userService.findSalary(obj);
            if (isSalaryAssigned) return next(ErrorHandler.serverError('Salary already assigned'));

            const d = new Date();
            data["assignedDate"] = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
            const resp = await userService.assignSalary(data);
            if (!resp) return next(ErrorHandler.serverError('Failed to assign salary'));
            res.json({ success: true, data: resp });
        } catch (error) {
            res.json({ success: false, error });
        }
    }

    updateEmployeeSalary = async (req, res, next) => {
        try {
            const body = req.body;
            const { employeeID } = body;
            const d = new Date();
            body["assignedDate"] = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
            const isSalaryUpdated = await userService.updateSalary({ employeeID }, body);
            console.log(isSalaryUpdated);
            if (!isSalaryUpdated) return next(ErrorHandler.serverError('Failed to update salary'));
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
            if (!users) return next(ErrorHandler.notFound('No users found for this type'));

            const usersDto = users.map(user => new UserDto(user));
            res.json({ success: true, data: usersDto });
        } catch (error) {
            next(error);
        }
    }

    // Get all admin users
    getAdminUsers = async (req, res, next) => {
        try {
            const users = await userService.findAdmins();
            if (!users) return next(ErrorHandler.notFound('No admins found'));

            const usersDto = users.map(user => new UserDto(user));
            res.json({ success: true, data: usersDto });
        } catch (error) {
            next(error);
        }
    }

    // Get all leader users
    getLeaderUsers = async (req, res, next) => {
        try {
            const users = await userService.findAllLeaders();
            if (!users) return next(ErrorHandler.notFound('No leaders found'));

            const usersDto = users.map(user => new UserDto(user));
            res.json({ success: true, data: usersDto });
        } catch (error) {
            next(error);
        }
    }

    // Get all employee users
    getEmployeeUsers = async (req, res, next) => {
        try {
            const users = await userService.findAllEmployees();
            if (!users) return next(ErrorHandler.notFound('No employees found'));

            const usersDto = users.map(user => new UserDto(user));
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
            try {
                // 1. Delete Profile Image
                if (user.image && user.image !== 'user.png') {
                    const profilePath = path.join(__dirname, '../storage/images/profile', user.image);
                    if (fs.existsSync(profilePath)) {
                        fs.unlinkSync(profilePath);
                        console.log(`Deleted profile image: ${profilePath}`);
                    }
                }

                // 2. Delete Problem Images
                const problems = await problemService.findProblems({ user: id });
                if (problems && problems.length > 0) {
                    for (const problem of problems) {
                        if (problem.image) {
                            const problemPath = path.join(__dirname, '../storage/images/problems', problem.image);
                            if (fs.existsSync(problemPath)) {
                                fs.unlinkSync(problemPath);
                                console.log(`Deleted problem image: ${problemPath}`);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Error during file cleanup:", err);
                // Continue with user deletion even if file cleanup fails
            }
            // --- FILE CLEANUP END ---

            const result = await userService.deleteUser(id);
            if (!result) return next(ErrorHandler.serverError('Failed to delete user'));

            res.json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();

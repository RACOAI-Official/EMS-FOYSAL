const UserModel = require('../models/user-model');
const LeaveModel = require('../models/leave-model');
const UserSalaryModel = require('../models/user-salary');
const bcrypt = require('bcrypt');

class UserService {

    UserModel = UserModel; // Expose UserModel for direct operations

    createUser = async user => await UserModel.create(user);

    updateUser = async (_id, user) => await UserModel.findByIdAndUpdate(_id, user, { new: true, runValidators: true });

    findCount = async filter => await UserModel.find(filter).countDocuments();

    findUser = async filter => await UserModel.findOne(filter);

    findUsers = async filter => await UserModel.find(filter).populate('team');

    verifyPassword = async (password, hashPassword) => await bcrypt.compare(password, hashPassword);

    resetPassword = async (_id, password) => await UserModel.updateOne({ _id }, { password });

    updatePassword = async (_id, password) => await UserModel.updateOne({ _id }, { password });

    findLeaders = async (req, res, next) => await UserModel.aggregate([
        { $match: { "type": 'leader' } },
        {
            $lookup:
            {
                from: "teams",
                localField: "_id",
                foreignField: "leader",
                as: "team"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "team._id",
                foreignField: "team",
                as: "teamMembers"
            }
        },
        {
            $addFields: {
                totalMembers: { $size: "$teamMembers" }
            }
        },
        {
            $project: {
                teamMembers: 0
            }
        }
    ])

    findFreeLeaders = async (req, res, next) => await UserModel.aggregate([
        { $match: { "type": 'leader' } },
        {
            $lookup:
            {
                from: "teams",
                localField: "_id",
                foreignField: "leader",
                as: "team"
            }
        },
        { $match: { "team": { $eq: [] } } }
    ])

    // Find all users by specific type
    findUsersByType = async (type) => {
        return await UserModel.find({ type: type.toLowerCase() }).populate('team');
    }

    // Find all admins
    findAdmins = async () => {
        return await UserModel.find({ type: { $in: ['super_admin', 'sub_admin'] } }).populate('team');
    }

    // Find all leaders
    findAllLeaders = async () => {
        return await UserModel.find({ type: 'leader' }).populate('team');
    }

    // Find all employees
    findAllEmployees = async () => {
        return await UserModel.find({ type: 'employee' }).populate('team');
    }

    createLeaveApplication = async data => LeaveModel.create(data);

    findLeaveApplication = async (data) => LeaveModel.findOne(data);

    findAllLeaveApplications = async (data) => LeaveModel.find(data);

    assignSalary = async (data) => UserSalaryModel.create(data);

    findSalary = async (data) => UserSalaryModel.findOne(data);

    findAllSalary = async (data) => UserSalaryModel.find(data);

    updateSalary = async (data, updatedSalary) => UserSalaryModel.findOneAndUpdate(data, updatedSalary);

    updateLeaveApplication = async (id, updatedLeave) => LeaveModel.findByIdAndUpdate(id, updatedLeave);

    deleteLeaveApplication = async (id) => await LeaveModel.findByIdAndDelete(id);

    deleteUser = async (_id) => await UserModel.findByIdAndDelete({ _id });

    deleteSalary = async (_id) => await UserSalaryModel.findByIdAndDelete({ _id });

}


module.exports = new UserService();

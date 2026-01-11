import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
    baseURL: `${process.env.REACT_APP_BASE_URL}/api`,
    withCredentials: true
})

// 'http://localhost:5500/api'

//Auth
export const doLogin = data => api.post('/auth/login', data);
export const forgotPassword = data => api.post('/auth/forgot', data);
export const resetPassword = data => api.patch('/auth/reset', data);
export const dLogout = () => api.get('/auth/logout');

//Admin
export const getCounts = () => api.get('/admin/counts');
export const getEmployees = () => api.get('/admin/employees');
export const getLeaders = () => api.get('/admin/leaders');
export const getFreeLeaders = () => api.get('/admin/leaders/free');
export const getAdmins = () => api.get('/admin/admins');
export const getTeams = () => api.get('/admin/teams');

// Type-filtered user queries (data-driven role pages)
export const getAdminUsers = () => api.get('/admin/users/type/admin');
export const getLeaderUsers = () => api.get('/admin/users/type/leader');
export const getEmployeeUsers = () => api.get('/admin/users/type/employee');
export const getUsersByType = (type) => api.get(`/admin/users/by-type/${type}`);

export const getTeamMembers = data => api.get(`/admin/team/${data}/members`);
export const addUser = data => api.post('/admin/user', data);
export const updateUser = (id, data) => api.patch(`/admin/user/${id}`, data);
export const deleteUser = (id) => api.delete(`/admin/user/${id}`);
export const addTeam = data => api.post('/admin/team', data);
export const deleteTeam = (id) => api.delete(`/admin/team/${id}`);
export const updateTeam = (id, data) => api.patch(`/admin/team/${id}`, data);
export const updateTeamProgress = (id, data) => api.patch(`/admin/team/${id}/progress`, data);
export const getEmployee = data => api.get(`/admin/employee/${data}`);
export const getLeader = data => api.get(`/admin/leader/${data}`);
export const getFreeEmployees = () => api.get('/admin/employees/free');
export const getTeam = data => api.get(`/admin/team/${data}`);
export const removeMember = data => api.patch('/admin/team/member/remove', data);
export const addMember = data => api.patch('/admin/team/member/add', data);
export const removeLeader = data => api.patch('/admin/team/leader/remove', data);
export const addLeader = data => api.patch('/admin/team/leader/add', data);
export const getUser = data => api.get(`/admin/user/${data}`);
export const getAttendance = data => api.post('/admin/view-employee-attendance', data);
export const viewLeaves = data => api.post('/admin/view-leave-applications', data);
export const updateLeave = (id, data) => api.post(`/admin/update-leave/${id}`, data);
export const assignSalary = data => api.post('/admin/assign-employee-salary', data);
export const updateSalary = data => api.post('/admin/update-employee-salary', data);
export const viewAllSalaries = data => api.post('/admin/view-all-salary', data);

// Progress (admin read-only)
export const getAllProgress = () => api.get('/admin/progress');

//Leader
export const getMembers_Leader = () => api.get('/leader/team/members');
export const getTeam_Leader = () => api.get('/leader/team/');
export const updateTeamProgress_Leader = (data) => api.patch('/leader/team/progress', data);

// Leader self progress
export const submitLeaderProgress = (data) => api.post('/leader/progress', data);
export const getLeaderProgress = () => api.get('/leader/progress');

// Employee self update
export const updateSelfUser = (data) => api.patch('/employee/user', data);

// Employee self progress
export const submitEmployeeProgress = (data) => api.post('/employee/progress', data);
export const getEmployeeProgress = () => api.get('/employee/progress');


// Employee
export const getEmployeeTeam = data => api.get(`/employee/team/${data}`);
export const getEmployeeTeamMembers = data => api.get(`/employee/team/${data}/members`);
export const markEmployeeAttendance = data => api.post('/employee/mark-employee-attendance', data);
export const markEmployeeCheckOut = data => api.post('/employee/mark-employee-checkout', data);
export const viewEmployeeAttendance = data => api.post('/employee/view-employee-attendance', data);
export const applyforleave = data => api.post('/employee/apply-leave-application', data);
export const viewLeaveApplications = data => api.post('/employee/view-leave-applications', data);
export const viewEmployeeSalary = data => api.post('/employee/view-salary', data);
// Task Management
export const createTask = (data) => api.post('/tasks/admin', data);
export const getAdminTasks = () => api.get('/tasks/admin');
export const deleteTask = (id) => api.delete(`/tasks/admin/${id}`);
export const downloadTaskPDF = (id, mode) => `${api.defaults.baseURL}/tasks/${id}/pdf?mode=${mode}`;
export const getUserTasks = () => api.get('/tasks/user');
export const getDropdownUsers = () => api.get('/users');

// Project Problems
export const submitProblem = data => api.post('/problems/submit', data);
export const getUserProblems = () => api.get('/problems/my-problems');
export const getAllProblems = () => api.get('/problems/all');
export const getProblem = (id) => api.get(`/problems/${id}`);
export const updateProblemStatus = (id, data) => api.patch(`/problems/status/${id}`, data);
export const provideSolution = (id, data) => api.patch(`/problems/solution/${id}`, data);
export const getLeaderProblems = () => api.get('/problems/leader-problems');

// Chat
export const sendMessage = (data) => api.post('/chat/send', data);
export const getMessages = (userId) => api.get(`/chat/messages/${userId}`);
export const getContacts = () => api.get('/chat/contacts');
export const markMessagesAsRead = (userId) => api.patch(`/chat/mark-read/${userId}`);
export const deleteMessage = (id) => api.delete(`/chat/${id}`);
export const deleteConversation = (userId) => api.delete(`/chat/conversation/${userId}`);

// Empires
export const getEmpires = () => api.get('/empires');
export const createEmpire = data => api.post('/empires', data);
export const updateEmpire = (id, data) => api.put(`/empires/${id}`, data);
export const deleteEmpire = (id) => api.delete(`/empires/${id}`);

// Leader Stats
export const getLeaderStats = () => api.get('/leader/stats');

// Notifications
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);

// Employee
api.interceptors.response.use((response) => {
    console.log("All Cookies", document.cookie);
    return response.data;
}, (error) => {
    console.log(error);
    if (error.response) {
        return error.response.data;
    }
    return {
        success: false,
        message: error.message || 'Network Error'
    };
})

export default api;

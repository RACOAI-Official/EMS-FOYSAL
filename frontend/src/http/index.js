import axios from 'axios';

/* ==============================
   Backend URL Setup
============================== */

const getBackendUrl = () => {
    const envUrl = process.env.REACT_APP_BASE_URL?.trim();
    if (envUrl) {
        return envUrl;
    }

    return 'http://192.168.10.13:5500';
};

export const backendUrl = getBackendUrl();

/* ==============================
   Axios Instance
============================== */

const api = axios.create({
    baseURL: `${backendUrl}/api`,
    withCredentials: true,
});

/* ==============================
   REQUEST INTERCEPTOR
   → Attach Access Token
============================== */

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/* ==============================
   RESPONSE INTERCEPTOR
   → Handle Refresh Token
============================== */

let isRefreshing = false;
let refreshSubscribers = [];

const clearClientSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
};

const subscribeTokenRefresh = () =>
    new Promise((resolve, reject) => {
        refreshSubscribers.push({ resolve, reject });
    });

const onRefreshed = () => {
    refreshSubscribers.forEach(({ resolve }) => resolve());
    refreshSubscribers = [];
};

const onRefreshFailed = (error) => {
    refreshSubscribers.forEach(({ reject }) => reject(error));
    refreshSubscribers = [];
};

api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;
        const requestUrl = originalRequest?.url || '';
        const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh');
        const hasLocalUser = !!localStorage.getItem('user');

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !isAuthEndpoint &&
            hasLocalUser
        ) {
            if (isRefreshing) {
                return subscribeTokenRefresh().then(() => api(originalRequest));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axios.get(`${backendUrl}/api/auth/refresh`, {
                    withCredentials: true,
                });

                isRefreshing = false;
                onRefreshed();

                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                onRefreshFailed(refreshError);
                clearClientSession();
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 401 && isAuthEndpoint) {
            clearClientSession();
        }

        return Promise.reject(error);
    }
);

/* ==============================
   AUTH APIs
============================== */

export const doLogin = (data) => api.post('/auth/login', data);
export const forgotPassword = (data) => api.post('/auth/forgot', data);
export const resetPassword = (data) => api.patch('/auth/reset', data);
export const registerInvited = (data) => api.post('/auth/register-invited', data);
export const dLogout = () => api.get('/auth/logout');

/* ==============================
     Notification APIs
    (use configured `api` so cookies are sent)
============================== */
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

/* ==============================
    EMPLOYEE / ATTENDANCE APIs
============================== */
export const markEmployeeAttendance = (data) => api.post('/employee/attendance/mark', data);
export const markEmployeeCheckOut = (data) => api.post('/employee/attendance/checkout', data);
export const viewEmployeeAttendance = (data) => api.post('/employee/attendance/view', data);
export const getAttendanceSummary = (userId, startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    if (userId) {
        return api.get(`/admin/attendance-summary/${userId}`, { params });
    }

    return api.get('/employee/attendance/summary', { params });
};
export const getMyAttendanceSummary = (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return api.get('/employee/attendance/summary', { params });
};

/* ==============================
    LEAVE / SALARY APIs
============================== */
export const applyforleave = (data) => api.post('/employee/leave/apply', data);
export const viewLeaveApplications = (data) => api.post('/employee/leave/view', data);
export const viewEmployeeSalary = (data) => api.post('/employee/salary/view', data);

/* ==============================
    ADMIN / USER / TEAM APIs
============================== */
export const getEmployees = () => api.get('/admin/employees');
export const getFreeEmployees = () => api.get('/admin/employees/free');
export const getLeaders = () => api.get('/admin/leaders');
export const getFreeLeaders = () => api.get('/admin/leaders/free');
export const getUser = (id) => api.get(`/admin/employee/${id}`);
export const getUserNoFilter = (id) => api.get(`/admin/user/${id}`);
export const getAdminUsers = () => api.get('/admin/users/type/admin');
export const getLeaderUsers = () => api.get('/admin/users/type/leader');
export const getEmployeeUsers = () => api.get('/admin/users/type/employee');
export const createUser = (fd) => api.post('/admin/user', fd);
export const updateUser = (id, fd) => api.patch(`/admin/user/${id}`, fd);
export const updateSelfUser = (fd) => api.patch('/users/update-self', fd);
export const deleteUser = (id) => api.delete(`/admin/user/${id}`);

export const getTeams = () => api.get('/admin/teams');
export const getTeam = (id) => api.get(`/admin/team/${id}`);
export const getTeamMembers = (id) => api.get(`/admin/team/${id}/members`);
export const addTeam = (fd) => api.post('/admin/team', fd);
export const updateTeam = (id, fd) => api.patch(`/admin/team/${id}`, fd);
export const deleteTeam = (id) => api.delete(`/admin/team/${id}`);
export const addLeader = (data) => api.patch('/admin/team/leader/add', data);
export const removeLeader = (data) => api.patch('/admin/team/leader/remove', data);
export const addMember = (data) => api.patch('/admin/team/member/add', data);
export const removeMember = (data) => api.patch('/admin/team/member/remove', data);
export const updateTeamProgress = (id, data) => api.patch(`/admin/team/${id}/progress`, data);
export const getCounts = () => api.get('/admin/counts');
export const getDropdownUsers = () => api.get('/admin/employees');

// Convenience aliases
export const getEmployee = (id) => getUser(id);
export const getLeader = (id) => getUser(id);

/* ==============================
    ATTENDANCE / SALARY (ADMIN)
============================== */
export const getAttendance = (data) => api.post('/admin/view-employee-attendance', data);
export const editAttendance = (id, data) => api.patch(`/admin/attendance/${id}`, data);
export const assignSalary = (data) => api.post('/admin/assign-employee-salary', data);
export const updateSalary = (data) => api.post('/admin/update-employee-salary', data);
export const viewAllSalaries = (data) => api.post('/admin/view-all-salary', data);
export const deleteSalary = (id) => api.delete(`/admin/delete-salary/${id}`);

/* ==============================
    TASKS
============================== */
export const createTask = (fd) => api.post('/tasks/admin', fd);
export const getAdminTasks = (params) => api.get('/tasks/admin', { params });
export const getLeaderTasks = (params) => api.get('/tasks/leader', { params });
export const getUserTasks = (params) => api.get('/tasks/user', { params });
export const deleteTask = (id) => api.delete(`/tasks/admin/${id}`);
export const downloadTaskPDF = (id) => api.get(`/tasks/${id}/pdf`, { responseType: 'blob' });
export const updateTaskProgress = (id, data) => api.patch(`/tasks/${id}/progress`, data);

/* ==============================
    CHAT
============================== */
export const getContacts = () => api.get('/chat/contacts');
export const getMessages = (userId) => api.get(`/chat/messages/${userId}`);
export const sendMessage = (fd) => api.post('/chat/send', fd);
export const markMessagesAsRead = (userId) => api.patch(`/chat/mark-read/${userId}`);
export const deleteMessage = (id) => api.delete(`/chat/${id}`);
export const deleteConversation = (userId) => api.delete(`/chat/conversation/${userId}`);

/* ==============================
    PROBLEMS
============================== */
export const submitProblem = (fd) => api.post('/problems/submit', fd);
export const getUserProblems = () => api.get('/problems/my-problems');
export const getLeaderProblems = () => api.get('/problems/leader-problems');
export const getAllProblems = () => api.get('/problems/all');
export const updateProblemStatus = (id, data) => api.patch(`/problems/status/${id}`, data);
export const provideSolution = (id, data) => api.patch(`/problems/solution/${id}`, data);
export const deleteProblem = (id) => api.delete(`/problems/${id}`);
export const getProblem = (id) => api.get(`/problems/${id}`);

/* ==============================
    INVITATIONS
============================== */
export const inviteUser = (data) => api.post('/invitations/invite', data);
export const verifyInvitation = (token) => api.get(`/invitations/verify/${token}`);
export const getInvitations = (params = {}) =>
    api.get('/invitations', {
        params: {
            page: 1,
            limit: 200,
            ...params
        },
        timeout: 15000
    });
export const deleteInvitation = (id) => api.delete(`/invitations/${id}`);

/* ==============================
    SEARCH / EMPIRE (Employer) APIs
============================== */
export const globalSearch = (q) => api.get('/search', { params: { q } });

export const getEmpires = () => api.get('/employers');
export const createEmpire = (fd) => api.post('/employers', fd);
export const updateEmpire = (id, fd) => api.patch(`/employers/${id}`, fd);
export const deleteEmpire = (id) => api.delete(`/employers/${id}`);

/* ==============================
    LEADER / TEAM APIs
============================== */
export const getTeam_Leader = () => api.get('/leader/team');
export const getMembers_Leader = () => api.get('/leader/team/members');
export const getLeaderStats = () => api.get('/leader/stats');

export const getEmployeeTeam = (id) => api.get(`/employee/team/${id}`);
export const getEmployeeTeamMembers = (id) => api.get(`/employee/team/${id}/members`);

/* ==============================
    LEAVE (ADMIN) helpers
============================== */
export const viewLeaves = (data) => api.post('/admin/view-leave-applications', data);
export const updateLeave = (id, data) => api.post(`/admin/update-leave/${id}`, data);
export const deleteLeave = (id) => api.delete(`/admin/delete-leave/${id}`);

/* ==============================
    PROGRESS
============================== */
export const getAllProgress = () => api.get('/admin/progress');

/* ==============================
    PROGRESS / LEADER HELPERS
============================== */
export const updateUserProgress = (id, data) => api.patch(`/admin/user/${id}/progress`, data);
export const updateMemberProgress = (id, data) => api.patch(`/leader/progress/member/${id}`, data);
export const getLeaderboardData = (mode, type) => api.get('/leader/leaderboard', { params: { mode, type } });

/* ==============================
   EXPORT INSTANCE
============================== */

export default api;

import React, { useEffect, useState } from 'react';
import { getAttendance, getEmployees, getLeaders, editAttendance } from '../../../http';
import { toast } from 'react-toastify';
import HeaderSection from '../../../components/HeaderSection';
import AttendanceSummaryCards from '../../../components/common/AttendanceSummaryCards';

const AdminAttendanceManagement = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const [empRes, leaderRes] = await Promise.all([
                getEmployees(),
                getLeaders()
            ]);
            
            const allUsers = [
                ...(empRes.data || []),
                ...(leaderRes.data || [])
            ];
            setUsers(allUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        }
    };

    const fetchAttendance = async (userId) => {
        try {
            setLoading(true);
            const res = await getAttendance({ employeeID: userId });
            if (res.success) {
                setAttendance(res.data || []);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
            toast.error('Failed to load attendance');
        } finally {
            setLoading(false);
        }
    };

    const handleUserSelect = (e) => {
        const userId = e.target.value;
        const user = users.find(u => u.id === userId);
        setSelectedUser(user);
        if (userId) {
            fetchAttendance(userId);
        } else {
            setAttendance([]);
        }
    };

    const handleEditClick = (record) => {
        setEditingRecord({
            ...record,
            status: record.status || (record.present ? 'Present' : 'Absent')
        });
    };

    const handleSaveEdit = async () => {
        try {
            const { _id, status, present, checkInTime, checkOutTime } = editingRecord;
            const updateData = {
                status,
                present: status === 'Present' || status === 'Leave',
                checkInTime,
                checkOutTime
            };

            const res = await editAttendance(_id, updateData);
            if (res.success) {
                toast.success('Attendance updated successfully');
                setEditingRecord(null);
                setRefreshTrigger(prev => prev + 1);
                fetchAttendance(selectedUser.id);
            } else {
                toast.error(res.message || 'Failed to update attendance');
            }
        } catch (error) {
            console.error('Error updating attendance:', error);
            toast.error('Failed to update attendance');
        }
    };

    const handleCancelEdit = () => {
        setEditingRecord(null);
    };

    return (
        <div className="main-content">
            <section className="section">
                {/* Page Header */}
                <div className="glass-card mb-4 p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="font-weight-bold text-dark mb-1">Direct Attendance Override</h3>
                        <p className="text-muted mb-0">Manually adjust entrance and departure records for any user</p>
                    </div>
                </div>

                {/* User Selection */}
                <div className="glass-card mb-4 p-4 shadow-sm">
                    <div className="row align-items-end">
                        <div className="col-md-8">
                            <label className="text-muted small font-weight-bold mb-2">TARGET USER</label>
                            <select 
                                className="form-control rounded-pill border-0 bg-light shadow-sm"
                                value={selectedUser?.id || ''}
                                onChange={handleUserSelect}
                                style={{ height: '45px' }}
                            >
                                <option value="">-- Choose Employee or Leader --</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.type}) • {user.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            {selectedUser && (
                                <div className="d-flex align-items-center bg-primary-soft p-2 rounded-pill px-3 shadow-sm" style={{ height: '45px' }}>
                                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mr-2 font-weight-bold" style={{width: '30px', height: '30px', fontSize: '0.8rem'}}>
                                        {selectedUser.name.charAt(0)}
                                    </div>
                                    <div className="text-primary font-weight-bold small truncate">{selectedUser.name}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {selectedUser && (
                    <div className="mb-4">
                        <AttendanceSummaryCards userId={selectedUser.id} refreshTrigger={refreshTrigger} />
                    </div>
                )}

                {selectedUser && (
                    <div className="glass-card border-0 shadow-lg overflow-hidden">
                        <div className="card-header bg-white border-bottom py-4 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 font-weight-bold text-dark">
                                <i className="fas fa-edit mr-2 text-warning"></i> Correction Log for {selectedUser.name}
                            </h5>
                        </div>
                        <div className="p-3">
                            {loading ? (
                                <div className="text-center p-5">
                                    <div className="spinner-border text-primary" role="status"></div>
                                    <div className="mt-2 text-muted">Retrieving logs...</div>
                                </div>
                            ) : attendance.length === 0 ? (
                                <div className="text-center p-5">
                                    <div className="glass-card d-inline-block px-5 py-4">
                                        <i className="fas fa-calendar-times fa-2x mb-3 text-muted opacity-50"></i>
                                        <p className="text-muted mb-0">No attendance records found for this user</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-borderless align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                                        <thead>
                                            <tr className="text-muted text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>
                                                <th className="ps-4">Date</th>
                                                <th>Day</th>
                                                <th>Status Override</th>
                                                <th>Entrance</th>
                                                <th>Departure</th>
                                                <th className="text-right pe-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendance.map((record, idx) => (
                                                <tr key={record._id} className="soft-card shadow-sm hover-lift">
                                                    <td className="ps-4 py-3">
                                                        <div className="fw-bold text-dark">{`${record.date}/${record.month}/${record.year}`}</div>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted small font-weight-bold">{record.day}</span>
                                                    </td>
                                                    <td>
                                                        {editingRecord && editingRecord._id === record._id ? (
                                                            <select 
                                                                className="form-control form-control-sm rounded-pill border-0 bg-light shadow-sm font-weight-bold text-dark"
                                                                value={editingRecord.status}
                                                                onChange={(e) => setEditingRecord({
                                                                    ...editingRecord,
                                                                    status: e.target.value
                                                                })}
                                                            >
                                                                <option value="Present">Present</option>
                                                                <option value="Absent">Absent</option>
                                                                <option value="Leave">Leave (Approved)</option>
                                                            </select>
                                                        ) : (
                                                            <div className={`badge rounded-pill px-3 ${
                                                                record.status === 'Leave' ? 'bg-primary-soft text-primary' :
                                                                record.status === 'Present' ? 'bg-success-soft text-success' :
                                                                'bg-danger-soft text-danger'
                                                            }`}>
                                                                {record.status || (record.present ? 'Present' : 'Absent')}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editingRecord && editingRecord._id === record._id ? (
                                                            <input 
                                                                type="text"
                                                                className="form-control form-control-sm rounded-pill border-0 bg-light shadow-sm text-center font-weight-bold"
                                                                value={editingRecord.checkInTime || ''}
                                                                onChange={(e) => setEditingRecord({
                                                                    ...editingRecord,
                                                                    checkInTime: e.target.value
                                                                })}
                                                                placeholder="HH:MM:SS"
                                                                style={{ width: '100px' }}
                                                            />
                                                        ) : (
                                                            <div className="fw-bold text-primary">{record.checkInTime || '-'}</div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editingRecord && editingRecord._id === record._id ? (
                                                            <input 
                                                                type="text"
                                                                className="form-control form-control-sm rounded-pill border-0 bg-light shadow-sm text-center font-weight-bold"
                                                                value={editingRecord.checkOutTime || ''}
                                                                onChange={(e) => setEditingRecord({
                                                                    ...editingRecord,
                                                                    checkOutTime: e.target.value
                                                                })}
                                                                placeholder="HH:MM:SS"
                                                                style={{ width: '100px' }}
                                                            />
                                                        ) : (
                                                            <div className="fw-bold text-warning">{record.checkOutTime || '-'}</div>
                                                        )}
                                                    </td>
                                                    <td className="text-right pe-4">
                                                        <div className="d-flex justify-content-end gap-2">
                                                            {editingRecord && editingRecord._id === record._id ? (
                                                                <>
                                                                    <button 
                                                                        className="btn btn-sm btn-success rounded-pill px-3 font-weight-bold shadow-sm"
                                                                        onClick={handleSaveEdit}
                                                                    >
                                                                        <i className="fas fa-save mr-1"></i> Save
                                                                    </button>
                                                                    <button 
                                                                        className="btn btn-sm btn-light border rounded-pill px-3 font-weight-bold"
                                                                        onClick={handleCancelEdit}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button 
                                                                    className="btn btn-sm btn-soft-warning rounded-pill px-4 font-weight-bold shadow-sm"
                                                                    onClick={() => handleEditClick(record)}
                                                                >
                                                                    <i className="fas fa-edit mr-1"></i> Correct
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminAttendanceManagement;

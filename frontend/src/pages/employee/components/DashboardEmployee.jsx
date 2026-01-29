import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { updateTaskProgress, getUserTasks, downloadTaskPDF } from '../../../http';
import { getFileUrl } from '../../../utils/fileUtil';
import { toast } from 'react-toastify';
import CircularProgress from '../../../components/CircularProgress';
import ProgressLeaderboard from '../../../components/common/ProgressLeaderboard';

const DashboardEmployee = () => {
  const { user } = useSelector((state) => state.authSlice);
  
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [tempProgress, setTempProgress] = useState({});

  useEffect(() => {
     fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
        const res = await getUserTasks();
        if (Array.isArray(res)) {
            setTasks(res);
            setFilteredTasks(res);
            
            // Initialize temp progress values
            const temp = {};
            res.forEach(t => {
                temp[t._id] = t.progress || 0;
            });
            setTempProgress(temp);
        }
    } catch (err) {
        console.error("Failed to fetch tasks", err);
    }
  };

  useEffect(() => {
    if (selectedTaskId === 'all') {
        setFilteredTasks(tasks);
    } else {
        setFilteredTasks(tasks.filter(t => t._id === selectedTaskId));
    }
  }, [selectedTaskId, tasks]);

  const handleUpdateProgress = async (taskId) => {
    const progress = tempProgress[taskId];
    if (progress < 0 || progress > 100) {
        return toast.error("Progress must be between 0 and 100");
    }

    setUpdatingId(taskId);
    try {
        const res = await updateTaskProgress(taskId, { progress });
        if (res.success) {
            toast.success("Progress updated");
            fetchTasks();
        } else {
            toast.error(res.message || "Failed to update progress");
        }
    } catch (err) {
        toast.error("An error occurred");
    } finally {
        setUpdatingId(null);
    }
  };

  const onProgressChange = (taskId, val) => {
    setTempProgress(prev => ({ ...prev, [taskId]: val }));
  };

  return (
    <>
        {/* Page Header */}
        <div className="glass-card mb-4 p-4 d-flex justify-content-between align-items-center">
            <div>
                <h3 className="font-weight-bold text-dark mb-1">Welcome, {user?.name}</h3>
                <p className="text-muted mb-0">Your Daily Mission Overview & Progress</p>
            </div>
            <div className="d-flex align-items-center gap-3">
                <div className="form-group mb-0" style={{ width: '250px' }}>
                    <select 
                        className="form-control rounded-pill border-0 shadow-sm" 
                        value={selectedTaskId} 
                        onChange={(e) => setSelectedTaskId(e.target.value)}
                        style={{ height: '45px', paddingLeft: '20px' }}
                    >
                        <option value="all">🔍 Search Missions...</option>
                        {tasks.map(t => (
                            <option key={t._id} value={t._id}>{t.title}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        {/* Profile Card */}
        <div className="glass-card mb-4 overflow-hidden">
          <div className="card-body p-0 d-flex flex-column flex-md-row">
            <div className="profile-img-container p-4 d-flex justify-content-center align-items-center bg-primary-soft">
              <img 
                className='img-fluid rounded-xl shadow-lg border-white border-4 profile-img' 
                src={user.image || '/assets/icons/user.png'} 
                alt="Profile" 
                onError={(e) => { e.target.src = '/assets/icons/user.png' }}
              />
            </div>

            <div className="p-4 flex-grow-1">
              <div className="row g-4">
                <div className="col-md-6 col-lg-4">
                    <label className="text-uppercase text-muted small font-weight-bold d-block">Employee ID</label>
                    <span className="text-primary font-weight-bold">{user.employeeId}</span>
                </div>
                <div className="col-md-6 col-lg-4">
                    <label className="text-uppercase text-muted small font-weight-bold d-block">Position</label>
                    <span className="text-dark font-weight-bold">{user.position}</span>
                </div>
                <div className="col-md-6 col-lg-4">
                    <label className="text-uppercase text-muted small font-weight-bold d-block">Username</label>
                    <span className="text-dark">{user.username}</span>
                </div>
                <div className="col-md-6 col-lg-4 mt-3">
                    <label className="text-uppercase text-muted small font-weight-bold d-block">Email</label>
                    <span className="text-dark">{user.email}</span>
                </div>
                <div className="col-md-6 col-lg-4 mt-3">
                    <label className="text-uppercase text-muted small font-weight-bold d-block">Status</label>
                    <span className={`badge badge-pill ${user.status === 'active' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'} px-3`}>
                        {user.status === 'active' ? '● ' : ''}{user.status?.toUpperCase()}
                    </span>
                </div>
                <div className="col-md-6 col-lg-4 mt-3">
                    <label className="text-uppercase text-muted small font-weight-bold d-block">Contact</label>
                    <span className="text-dark font-weight-bold">{user.mobile}</span>
                </div>
                <div className="col-12 mt-3 pt-3 border-top">
                    <div className="row">
                        <div className="col-md-4">
                            <label className="text-uppercase text-muted small font-weight-bold d-block">Present Address</label>
                            <span className="text-dark small">{user.presentAddress || '-'}</span>
                        </div>
                        <div className="col-md-4">
                            <label className="text-uppercase text-muted small font-weight-bold d-block">NID</label>
                            <span className="text-dark small">{user.nid || '-'}</span>
                        </div>
                        <div className="col-md-4">
                            <label className="text-uppercase text-muted small font-weight-bold d-block">Blood Group</label>
                            <span className="text-danger font-weight-bold">{user.bloodGroup || '-'}</span>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Missions Table */}
        <div className="glass-card mb-5 border-0 shadow-lg">
            <div className="card-header bg-white border-bottom py-4 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 font-weight-bold text-dark">
                    <i className="fas fa-rocket mr-2 text-primary"></i> Current Mission Progress
                </h5>
                <span className="badge badge-primary rounded-pill px-3">{filteredTasks.length} Assigned</span>
            </div>
            <div className="p-3">
                <table className="table table-borderless align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                    <thead>
                        <tr className="text-muted text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                            <th scope="col" className="ps-4">Mission Title</th>
                            <th scope="col">Assigned By</th>
                            <th scope="col" className="text-center">Progress</th>
                            <th scope="col" className="text-right pe-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center p-5">
                                    <div className="py-4">
                                        <i className="fas fa-tasks fa-3x text-muted opacity-25 mb-3"></i>
                                        <p className="text-muted">No missions assigned yet.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredTasks.map(task => (
                            <tr key={task._id} className="soft-card shadow-sm hover-lift">
                                <td className="ps-4 py-3">
                                    <div className="fw-bold text-dark mb-1">{task.title}</div>
                                    <p className="text-muted mb-2 small text-truncate" style={{maxWidth: '300px'}} title={task.description}>
                                        {task.description}
                                    </p>
                                    <div className="badge badge-light border text-muted" style={{fontSize: '0.65rem'}}>
                                        <i className="far fa-calendar-check mr-1"></i> 
                                        Deadline: {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'N/A'}
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle bg-primary-soft text-primary d-flex align-items-center justify-content-center mr-2 font-weight-bold shadow-sm" style={{width: '32px', height: '32px', fontSize: '11px'}}>
                                            {task.assignedBy?.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-dark font-weight-bold small">{task.assignedBy?.name}</span>
                                    </div>
                                </td>
                                <td className="text-center">
                                    <div className="d-flex flex-column align-items-center gap-2">
                                        <CircularProgress value={task.progress || 0} size={45} />
                                        <div className="input-group input-group-sm" style={{ maxWidth: '100px' }}>
                                            <input 
                                                type="number" 
                                                className="form-control text-center font-weight-bold border-0 bg-light" 
                                                value={tempProgress[task._id] ?? 0}
                                                onChange={(e) => onProgressChange(task._id, e.target.value)}
                                                min="0" max="100"
                                            />
                                            <div className="input-group-append">
                                                <button 
                                                    className="btn btn-primary btn-sm px-2" 
                                                    onClick={() => handleUpdateProgress(task._id)}
                                                    disabled={updatingId === task._id}
                                                >
                                                    {updatingId === task._id ? '..' : <i className="fas fa-sync-alt"></i>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="text-right pe-4">
                                  <div className="d-flex justify-content-end gap-2">
                                    <a 
                                      href={downloadTaskPDF(task._id, 'download')} 
                                      className="btn btn-sm btn-light border rounded-pill px-3 py-1 font-weight-bold shadow-sm"
                                    >
                                      <i className="fas fa-download mr-1 text-primary"></i> PDF View
                                    </a>
                                    {task.file && (
                                        <a 
                                            href={getFileUrl(task.file)} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-light border rounded-pill px-3 py-1 font-weight-bold shadow-sm"
                                        >
                                            <i className="fas fa-paperclip mr-1 text-success"></i> Attachment
                                        </a>
                                    )}
                                  </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Personal Progress Card */}
        <div className="glass-card mb-5 overflow-hidden">
            <div className="card-header bg-white border-bottom py-4">
                <h5 className="font-weight-bold text-dark mb-0"><i className="fas fa-chart-line mr-2 text-primary"></i> Your Performance Metrics</h5>
            </div>
            <div className="card-body p-5">
                <div className="row align-items-center">
                    <div className="col-md-3 text-center mb-4 mb-md-0">
                        <div className="d-inline-block p-4 rounded-circle bg-primary-soft shadow-lg">
                            <CircularProgress value={user.progress || 0} size={120} strokeWidth={8} />
                        </div>
                    </div>
                    <div className="col-md-9 border-left ps-md-5">
                        <div className="d-flex justify-content-between align-items-end mb-3">
                            <div>
                                <h4 className="font-weight-bold text-dark mb-1">Overall Progress</h4>
                                <p className="text-muted small">Updated by your supervisor recently</p>
                            </div>
                            <div className="h1 font-weight-bold text-primary mb-0">{user.progress || 0}%</div>
                        </div>
                        <div className="progress rounded-pill mb-4" style={{ height: '12px', background: 'var(--primary-soft)' }}>
                            <div 
                                className={`progress-bar rounded-pill ${user.progress >= 75 ? 'bg-success' : user.progress >= 50 ? 'bg-primary' : user.progress >= 25 ? 'bg-warning' : 'bg-danger'}`}
                                role="progressbar" 
                                style={{ width: `${user.progress || 0}%`, transition: 'width 1.5s cubic-bezier(0.1, 0, 0.3, 1)' }}
                            >
                            </div>
                        </div>
                        {user.progressNote && (
                            <div className="bg-primary-soft p-3 rounded-lg border-left border-primary" style={{ borderLeftWidth: '4px' }}>
                                <i className="fas fa-quote-left mr-2 text-primary opacity-50"></i>
                                <span className="text-dark font-italic">"{user.progressNote}"</span>
                                <div className="mt-2 text-right">
                                    <small className="font-weight-bold text-primary">— Your Manager</small>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Progress & Ranking Section */}
        <div className="row">
          <div className="col-lg-6 mb-4">
            <ProgressLeaderboard 
              mode="teams" 
              title="Team Performance Ranking" 
            />
          </div>
          <div className="col-lg-6 mb-4">
            <ProgressLeaderboard 
              mode="users"
              type="leader"
              includeLeaders={true} 
              title="Leader Performance Ranking" 
            />
          </div>
          <div className="col-md-12">
            <ProgressLeaderboard 
              mode="users"
              type="employee"
              includeLeaders={false} 
              title="All Employee Metrics" 
            />
          </div>
        </div>
    </>
  );
};

export default DashboardEmployee;

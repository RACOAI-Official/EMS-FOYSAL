 import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSelfUser, getUserTasks, downloadTaskPDF } from '../http';
import { setAuth } from '../store/auth-slice';

const DashboardEmployee = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.authSlice);
  
  // Local state for the form inputs
  const [progressInput, setProgressInput] = useState('');
  const [progressNote, setProgressNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
     (async () => {
        try {
            const res = await getUserTasks();
            if (Array.isArray(res)) setTasks(res);
        } catch (err) {
            console.error("Failed to fetch tasks", err);
        }
     })();
  }, []);

  // Handle form submission
  const handleProgressUpdate = async (e) => {
    e.preventDefault();
    const p = Number(progressInput);

    // Validation: Ensure it's a number between 0 and 100
    if (Number.isNaN(p) || p < 0 || p > 100) {
      alert("Please enter a valid percentage between 0 and 100");
      return;
    }

    setSaving(true);
    try {
      const res = await updateSelfUser({ progress: p, progressNote });
      
      if (res.success) {
        // Update user in global Redux store so the UI updates immediately
        const updatedUser = { ...user, progress: p, progressNote };
        dispatch(setAuth(updatedUser));
        
        // Clear form fields
        setProgressInput('');
        setProgressNote('');
      }
    } catch (err) {
      console.error("Failed to update progress:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="main-content">
      <section className="section">
        {/* Header Card */}
        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <h4>Welcome {user?.name}</h4>
          </div>
        </div>

        {/* Profile and Progress Card */}
        <div className="card">
          <div className="card-body row">
            {/* Profile Image */}
            <div className="col-md-3">
              <img className='img-fluid img-thumbnail' src={user.image} alt="Profile" />
            </div>

            {/* Information Table */}
            <div className="col-md-9">
              <table className='table'>
                <tbody>
                  <tr>
                    <th>Name</th>
                    <td>{user.name}</td>
                  </tr>
                  <tr>
                    <th>Username</th>
                    <td>{user.username}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>{user.email}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>{user.status}</td>
                  </tr>
                  <tr>
                    <th>Mobile</th>
                    <td>{user.mobile}</td>
                  </tr>
                  
                  {/* Progress Display Row */}
                  <tr>
                    <th>Progress</th>
                    <td>
                      <div className="progress" style={{ height: '25px' }}>
                        <div 
                          className="progress-bar progress-bar-striped progress-bar-animated" 
                          role="progressbar" 
                          style={{ width: `${user.progress || 0}%` }} 
                          aria-valuenow={user.progress || 0} 
                          aria-valuemin="0" 
                          aria-valuemax="100"
                        >
                          {user.progress || 0}%
                        </div>
                      </div>
                      {user.progressNote && (
                        <small className="text-muted mt-1 d-block">
                          Latest Note: {user.progressNote}
                        </small>
                      )}
                    </td>
                  </tr>

                  <tr>
                    
                  </tr>
                </tbody>
              </table>

              <hr />

              {/* Update Progress Form */}
              <form onSubmit={handleProgressUpdate} className="form-inline mt-3">
                <div className="form-group mr-2">
                  <label className="mr-2 font-weight-bold">Update Progress (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    className="form-control" 
                    value={progressInput} 
                    onChange={(e) => setProgressInput(e.target.value)} 
                    placeholder="e.g. 45" 
                  />
                </div>
                <div className="form-group mr-2">
                  <input 
                    type="text" 
                    className="form-control" 
                    value={progressNote} 
                    onChange={(e) => setProgressNote(e.target.value)} 
                    placeholder="Note (optional)" 
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Progress'}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Assigned Tasks Section */}
        <div className="card border-0 shadow-lg rounded-3 mt-4">
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold text-primary">My Assigned Tasks</h5>
                <span className="badge bg-soft-primary text-primary">{tasks.length} Active</span>
            </div>
            <div className="table-responsive p-3">
                <table className="table table-hover align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                    <thead className="bg-light text-secondary">
                        <tr>
                            <th scope="col" className="border-0 rounded-start ps-3">Task Details</th>
                            <th scope="col" className="border-0">Assigned By</th>
                            <th scope="col" className="border-0">Timeline</th>
                            <th scope="col" className="border-0 rounded-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center p-5 text-muted fst-italic">No tasks assigned yet.</td>
                            </tr>
                        ) : tasks.map(task => (
                            <tr key={task._id} className="shadow-sm bg-white rounded-3">
                                <td className="ps-3 border-0 rounded-start">
                                    <div className="fw-bold text-dark fs-5">{task.title}</div>
                                    <p className="text-muted mb-0 small" style={{lineHeight: '1.4'}}>{task.description}</p>
                                    {task.file && (
                                        <div className="mt-2">
                                            <a href={`${process.env.REACT_APP_BASE_URL}/${task.file}`} target="_blank" rel="noopener noreferrer" className="badge bg-light text-info border text-decoration-none">
                                                <i className="fa fa-paperclip me-1"></i> Attached File
                                            </a>
                                        </div>
                                    )}
                                </td>
                                <td className="border-0">
                                    {task.assignedBy ? (
                                        <div className="d-flex align-items-center">
                                            <div className="avatar me-2 bg-soft-info text-info rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '12px'}}>
                                                {task.assignedBy.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-dark fw-medium">{task.assignedBy.name}</span>
                                        </div>
                                    ) : <span className="text-muted">Unknown</span>}
                                </td>
                                <td className="border-0">
                                    <div className="small text-secondary">
                                        {task.startDate && <div><span className="fw-bold">Start:</span> {new Date(task.startDate).toLocaleDateString()}</div>}
                                        {task.endDate && <div><span className="fw-bold">End:</span> {new Date(task.endDate).toLocaleDateString()}</div>}
                                        <div className="mt-1 text-muted" style={{fontSize: '0.75em'}}>Assigned: {new Date(task.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </td>
                                <td className="border-0 rounded-end">
                                    <a 
                                      href={downloadTaskPDF(task._id, 'download')} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="btn btn-sm btn-primary rounded-pill px-3 shadow-sm"
                                    >
                                      Download PDF
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardEmployee;

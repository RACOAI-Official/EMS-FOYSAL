import React, { useState, useEffect } from 'react';
import HeaderSection from "../../components/HeaderSection";
import { getLeaderTasks, downloadTaskPDF, backendUrl } from '../../http';
import { getFileUrl } from '../../utils/fileUtil';
import CircularProgress from '../../components/CircularProgress';

const LeaderTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
        setLoading(true);
        const res = await getLeaderTasks();
        if (Array.isArray(res)) {
            setTasks(res);
        }
    } catch (err) {
        console.error("Failed to fetch leader tasks", err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <section className="section">
        <HeaderSection title='Team Tasks' />
        
        <div className="card border-0 shadow-lg rounded-3 mt-4">
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold text-primary">Tasks Assigned to Team Members</h5>
                <span className="badge bg-soft-primary text-primary">{tasks.length} Active Tasks</span>
            </div>
            <div className="table-responsive p-3">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light text-secondary">
                        <tr>
                            <th scope="col" className="border-0 ps-3">Task Details</th>
                            <th scope="col" className="border-0">Assigned To</th>
                            <th scope="col" className="border-0">Progress Status</th>
                            <th scope="col" className="border-0">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             <tr><td colSpan="4" className="text-center p-5">Loading...</td></tr>
                        ) : tasks.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center p-5 text-muted fst-italic">No tasks found for your team members.</td>
                            </tr>
                        ) : tasks.map(task => (
                            <tr key={task._id} className="bg-white">
                                <td className="ps-3 border-0">
                                    <div className="fw-bold text-dark">{task.title}</div>
                                    <p className="text-muted mb-1 small" style={{lineHeight: '1.4'}}>{task.description}</p>
                                    <div className="small text-secondary">
                                        <span className="fw-bold">Deadline:</span> {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'N/A'}
                                    </div>
                                </td>
                                <td className="border-0">
                                    {task.assignedTo && (
                                        <div className="d-flex align-items-center">
                                            <div className="avatar mr-2 bg-soft-info text-info rounded-circle d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px', fontSize: '12px'}}>
                                                {task.assignedTo.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-dark small fw-medium">{task.assignedTo.name}</div>
                                                <div className="text-muted" style={{fontSize: '10px'}}>{task.assignedTo.email}</div>
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td className="border-0" style={{ minWidth: '150px' }}>
                                    <div className="d-flex align-items-center mb-1">
                                        <CircularProgress value={task.progress || 0} size={40} />
                                    </div>
                                    <span className="small text-muted">{task.progress || 0}% Complete</span>
                                </td>
                                <td className="border-0">
                                    <div className="d-flex gap-2">
                                        <a 
                                            href={downloadTaskPDF(task._id, 'view')} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline-info rounded-pill px-3"
                                        >
                                            <i className="fas fa-file-pdf mr-1"></i> PDF View
                                        </a>
                                        {task.file && (
                                            <a 
                                                href={getFileUrl(task.file)} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                            >
                                                <i className="fas fa-paperclip mr-1"></i> Attachment
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
      </section>
    </div>
  );
};

export default LeaderTasks;

import { useEffect, useState } from "react";
import { getAllProgress, backendUrl } from "../../http";
import { Link } from "react-router-dom";

const ProgressPage = () => {
    const [loading, setLoading] = useState(true);
    const [progressLogs, setProgressLogs] = useState([]);

    const fetchProgress = async () => {
        setLoading(true);
        try {
            const res = await getAllProgress();
            if (res.success) {
                setProgressLogs(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProgress();
    }, []);

    return (
        <div className="main-content">
            <section className="section">
                <div className="glass-card mb-4 p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="font-weight-bold text-dark mb-1">Performance Logs</h3>
                        <p className="text-muted mb-0">Monitor real-time progress updates from all team members</p>
                    </div>
                </div>

                <div className="glass-card border-0 shadow-lg overflow-hidden">
                    <div className="card-header bg-white border-bottom py-4">
                        <h5 className="mb-0 font-weight-bold text-dark">
                            <i className="fas fa-chart-line mr-2 text-primary"></i> Global Progress Stream
                        </h5>
                    </div>
                    <div className="card-body p-3">
                        <div className="table-responsive">
                            <table className="table table-borderless align-middle mb-0">
                                <thead>
                                    <tr className="text-muted text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>
                                        <th>Employee</th>
                                        <th>Role</th>
                                        <th className="text-center">Progress %</th>
                                        <th>Last Note</th>
                                        <th>Date Submitted</th>
                                        <th className="text-right pe-4">Profile</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center p-5">Loading performance data...</td></tr>
                                    ) : progressLogs.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center p-5">No progress logs found.</td></tr>
                                    ) : progressLogs.map((log) => (
                                        <tr key={log._id} className="soft-card shadow-sm mb-2" style={{ borderBottom: '12px solid transparent' }}>
                                            <td className="ps-3">
                                                <div className="d-flex align-items-center">
                                                    <img 
                                                        src={log.user?.image ? (log.user.image.startsWith('http') ? log.user.image : `${backendUrl}/storage/${log.user.image}`) : '/assets/icons/user.png'} 
                                                        className="rounded-circle mr-2" width="35" height="35" alt="" 
                                                    />
                                                    <span className="font-weight-bold">{log.user?.name || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="text-capitalize small">{log.user?.type || 'N/A'}</td>
                                            <td className="text-center">
                                                <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                                                    <div 
                                                        className={`progress-bar ${log.progress > 75 ? 'bg-success' : log.progress > 40 ? 'bg-primary' : 'bg-warning'}`} 
                                                        style={{ width: `${log.progress}%` }}
                                                    ></div>
                                                </div>
                                                <small className="font-weight-bold">{log.progress}%</small>
                                            </td>
                                            <td style={{ maxWidth: '250px' }}>
                                                <small className="text-muted d-block text-truncate" title={log.progressNote}>
                                                    {log.progressNote || 'No description provided'}
                                                </small>
                                            </td>
                                            <td>{new Date(log.updatedAt).toLocaleDateString()}</td>
                                            <td className="text-right pe-3">
                                                <Link to={`/employee/${log.user?._id}`} className="btn btn-sm btn-light rounded-pill">
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default ProgressPage;

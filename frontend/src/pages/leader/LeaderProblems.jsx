import { useEffect, useState } from "react";
import HeaderSection from "../../components/HeaderSection";
import { getLeaderProblems } from "../../http";

const LeaderProblems = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProblems = async () => {
        setLoading(true);
        const res = await getLeaderProblems();
        if (res.success) {
            setProblems(res.data);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchProblems();
    }, []);

    return (
        <div className="main-content">
            <section className="section">
                <HeaderSection title='Employer Problems' />
                <div className="card">
                    <div className="card-header">
                        <h4>Problems Reported by Your Team</h4>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-striped table-md center-text">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Reported By</th>
                                        <th>Project</th>
                                        <th>Problem Area</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Admin Solution</th>
                                        <th>Submitted At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!loading && problems.map((prob, index) => (
                                        <tr key={prob._id}>
                                            <td>{index + 1}</td>
                                            <td>
                                              <div className="d-flex align-items-center">
                                                <div className="avatar avatar-sm mr-2 bg-primary text-white">
                                                    {prob.user?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                {prob.user?.name}
                                              </div>
                                            </td>
                                            <td>{prob.project}</td>
                                            <td>{prob.problemLocation}</td>
                                            <td>
                                                <div className={`badge badge-${prob.priority === 'High' ? 'danger' : prob.priority === 'Medium' ? 'warning' : 'info'}`}>
                                                    {prob.priority}
                                                </div>
                                            </td>
                                            <td>
                                        <div className={`badge badge-${prob.status === 'Checked' ? 'success' : 'light'}`}>
                                            {prob.status}
                                        </div>
                                    </td>
                                    <td>
                                        {prob.adminSolution ? (
                                            <div className="text-success small">
                                                <strong>Admin: </strong>{prob.adminSolution}
                                            </div>
                                        ) : <span className="text-muted small">No solution</span>}
                                    </td>
                                            <td>{new Date(prob.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {!loading && problems.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center">No problems reported yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default LeaderProblems;

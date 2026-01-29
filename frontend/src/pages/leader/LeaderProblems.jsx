import { useEffect, useState } from "react";
import HeaderSection from "../../components/HeaderSection";
import { getLeaderProblems, provideSolution } from "../../http";
import { toast } from "react-toastify";

const LeaderProblems = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [solutionInputs, setSolutionInputs] = useState({});

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

    const handleInputChange = (id, value) => {
        setSolutionInputs(prev => ({...prev, [id]: value}));
    }

    const handleSubmitSolution = async (id) => {
        const solution = solutionInputs[id];
        if(!solution || !solution.trim()) return toast.error("Please enter a solution");
        
        try {
            const res = await provideSolution(id, { solution });
            if(res.success) {
                toast.success("Solution submitted successfully");
                fetchProblems();
                setSolutionInputs(prev => {
                    const newState = {...prev};
                    delete newState[id];
                    return newState;
                });
            } else {
                toast.error(res.message || "Failed to submit solution");
            }
        } catch (err) {
            toast.error("Something went wrong");
        }
    }

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
                                        <th>Description</th>
                                        <th>Admin/Leader Solution</th>
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
                                        <button className="btn btn-sm btn-info" onClick={() => toast.info(prob.description)}>View</button>
                                    </td>
                                    <td style={{minWidth: '250px'}}>
                                        {prob.adminSolution ? (
                                            <div className="text-success small">
                                                <strong>{prob.solutionBy || 'Admin'}: </strong>{prob.adminSolution}
                                            </div>
                                        ) : (
                                            <div className="input-group input-group-sm">
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    placeholder="Provide solution..."
                                                    value={solutionInputs[prob._id] || ''}
                                                    onChange={(e) => handleInputChange(prob._id, e.target.value)}
                                                />
                                                <div className="input-group-append">
                                                    <button 
                                                        className="btn btn-primary"
                                                        onClick={() => handleSubmitSolution(prob._id)}
                                                    >
                                                        Submit
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                            <td>{new Date(prob.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {!loading && problems.length === 0 && (
                                        <tr>
                                            <td colSpan="9" className="text-center">No problems reported yet</td>
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

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import HeaderSection from "../../components/HeaderSection";
import { getAllProblems, updateProblemStatus, provideSolution } from "../../http";
import moment from "moment";
import BootstrapModal from "../../BootstrapModal";

const AdminProblems = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [adminSolution, setAdminSolution] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchProblems = async () => {
        setLoading(true);
        try {
            const res = await getAllProblems();
            if (res.success) {
                setProblems(res.data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch problems");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProblems();
    }, []);

    const handleViewDetails = (problem) => {
        setSelectedProblem(problem);
        setNewStatus(problem.status);
        setAdminSolution(problem.adminSolution || "");
        setIsModalOpen(true);
    };

    const handleUpdateStatus = async () => {
        try {
            const res = await updateProblemStatus(selectedProblem._id, { status: newStatus });
            if (res.success) {
                toast.success("Status updated successfully");
                setIsModalOpen(false);
                fetchProblems();
            } else {
                toast.error(res.message || "Failed to update status");
            }
        } catch (err) {
            toast.error("An error occurred");
        }
    };

    const handleProvideSolution = async () => {
        if (!adminSolution.trim()) return toast.error("Please enter a solution");
        try {
            const res = await provideSolution(selectedProblem._id, { solution: adminSolution });
            if (res.success) {
                toast.success("Solution provided and status set to Checked");
                setIsModalOpen(false);
                fetchProblems();
            } else {
                toast.error(res.message || "Failed to provide solution");
            }
        } catch (err) {
            toast.error("An error occurred");
        }
    };

    return (
        <div className="main-content">
            <section className="section">
                <HeaderSection title='User Problems Management' />
                <div className="card">
                    <div className="card-header">
                        <h4>All User Submitted Problems</h4>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-striped table-md center-text">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>User Name</th>
                                        <th>Project Name</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                        <th>Submitted Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!loading && problems.length > 0 ? (
                                        problems.map((problem, index) => (
                                            <tr key={problem._id}>
                                                <td>{index + 1}</td>
                                                <td>{problem.user?.name || 'N/A'}</td>
                                                <td>{problem.project || 'N/A'}</td>
                                                <td>{problem.problemLocation}</td>
                                                <td  >
                                                    <select 
                                                        className={`form-control form-control-sm badge-${problem.status === 'Checked' ? 'success' : 'danger'}`}
                                                        value={problem.status}
                                                        onChange={(e) => {
                                                            const newStatus = e.target.value;
                                                            updateProblemStatus(problem._id, { status: newStatus })
                                                                .then(res => {
                                                                    if (res.success) {
                                                                        toast.success("Status updated");
                                                                        fetchProblems();
                                                                    } else {
                                                                        toast.error(res.message || "Update failed");
                                                                    }
                                                                })
                                                                .catch(() => toast.error("An error occurred"));
                                                        }}
                                                        style={{ 
                                                            appearance: 'auto', 
                                                            padding: '2px 5px',
                                                            height: 'auto',
                                                            width: 'auto',
                                                            display: 'inline-block',
                                                            color: 'black',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <option value="Un Checked" style={{ color: 'white', background: 'red' }}>Un Checked</option>
                                                        <option value="Checked" style={{ color: 'white', background: 'green' }}>Checked</option>
                                                    </select>
                                                </td>
                                                <td>{moment(problem.createdAt).format('DD MMM YYYY')}</td>
                                                <td>
                                                    <button 
                                                        className="btn btn-info btn-sm" 
                                                        onClick={() => handleViewDetails(problem)}
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center">
                                                {loading ? 'Loading...' : 'No problems found'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bootstrap Modal for Details and Status Update */}
            {isModalOpen && selectedProblem && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Problem Details</h5>
                                <button type="button" className="close" onClick={() => setIsModalOpen(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <p><strong>User:</strong> {selectedProblem.user?.name}</p>
                                        <p><strong>Project:</strong> {selectedProblem.project}</p>
                                        <p><strong>Location:</strong> {selectedProblem.problemLocation}</p>
                                        <p><strong>Submitted Date:</strong> {moment(selectedProblem.createdAt).format('LLL')}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p><strong>Current Status:</strong> {selectedProblem.status}</p>
                                        <div className="form-group">
                                            <label>Update Status</label>
                                            <select 
                                                className="form-control" 
                                                value={newStatus} 
                                                onChange={(e) => setNewStatus(e.target.value)}
                                            >
                                                <option className="text-danger" value="Un Checked">Un Checked</option>
                                                <option className="text-success" value="Checked">Checked</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-12 mt-3">
                                        <h6>Description:</h6>
                                        <div className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                                            {selectedProblem.description}
                                        </div>
                                    </div>
                                    <div className="col-md-12 mt-3">
                                        <h6>Admin Solution:</h6>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            placeholder="Enter solution here..."
                                            value={adminSolution}
                                            onChange={(e) => setAdminSolution(e.target.value)}
                                        ></textarea>
                                        <small className="text-muted">Submitting a solution will automatically mark the problem as Checked.</small>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Close</button>
                                <button type="button" className="btn btn-info" onClick={handleProvideSolution}>Submit Solution</button>
                                <button type="button" className="btn btn-primary" onClick={handleUpdateStatus}>Update Status Only</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProblems;

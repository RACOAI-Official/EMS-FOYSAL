import { useEffect, useState } from "react";
import { getEmpires, createEmpire, updateEmpire, deleteEmpire } from "../../http";
import { toast } from "react-toastify";
import swal from "sweetalert";

const EmpiresPage = () => {
    const [loading, setLoading] = useState(true);
    const [empires, setEmpires] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', id: null });

    const fetchEmpires = async () => {
        setLoading(true);
        try {
            const res = await getEmpires();
            if (res.success) {
                setEmpires(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchEmpires();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                const res = await updateEmpire(formData.id, formData);
                if (res.success) toast.success("Employer updated");
            } else {
                const res = await createEmpire(formData);
                if (res.success) toast.success("Employer created");
            }
            setShowModal(false);
            setFormData({ name: '', description: '', id: null });
            fetchEmpires();
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        }
    }

    const handleDelete = async (id) => {
        const willDelete = await swal({
            title: "Are you sure?",
            text: "This will delete the employer and potentially affecting associated data!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        });

        if (willDelete) {
            try {
                const res = await deleteEmpire(id);
                if (res.success) {
                    toast.success("Employer deleted");
                    fetchEmpires();
                }
            } catch (err) {
                toast.error("Deletion failed");
            }
        }
    }

    return (
        <div className="main-content">
            <section className="section">
                <div className="glass-card mb-4 p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="font-weight-bold text-dark mb-1">Employer Management</h3>
                        <p className="text-muted mb-0">Manage business units and organizational structures</p>
                    </div>
                    <button onClick={() => { setFormData({ name: '', description: '', id: null }); setShowModal(true); }} className="btn btn-primary rounded-pill px-4">
                        <i className="fas fa-plus mr-2"></i> Add Employer
                    </button>
                </div>

                <div className="row g-4">
                    {loading ? (
                        <div className="col-12 text-center p-5">Loading employers...</div>
                    ) : empires.length === 0 ? (
                        <div className="col-12 text-center p-5">No employers found.</div>
                    ) : empires.map((emp) => (
                        <div key={emp._id} className="col-lg-4 col-md-6">
                            <div className="glass-card p-4 h-100 hover-lift border-0 shadow-sm shadow-hover transition-all">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="rounded-circle bg-primary-soft text-primary p-3">
                                        <i className="fas fa-building fa-lg"></i>
                                    </div>
                                    <div className="dropdown">
                                        <button className="btn btn-link text-muted" data-bs-toggle="dropdown">
                                            <i className="fas fa-ellipsis-v"></i>
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end">
                                            <li><a className="dropdown-item" onClick={() => { setFormData({ name: emp.name, description: emp.description, id: emp._id }); setShowModal(true); }}>Edit</a></li>
                                            <li><a className="dropdown-item text-danger" onClick={() => handleDelete(emp._id)}>Delete</a></li>
                                        </ul>
                                    </div>
                                </div>
                                <h5 className="font-weight-bold mb-2">{emp.name}</h5>
                                <p className="text-muted small mb-3 flex-grow-1">{emp.description || 'No description provided'}</p>
                                <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                                    <span className={`badge ${emp.status === 'active' ? 'badge-success' : 'badge-secondary'} rounded-pill`}>
                                        {emp.status}
                                    </span>
                                    <small className="text-muted">Created: {new Date(emp.createdAt).toLocaleDateString()}</small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Simplified Modal */}
                {showModal && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title font-weight-bold">{formData.id ? 'Edit Employer' : 'New Employer'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label small font-weight-bold text-muted uppercase">Employer Name</label>
                                            <input type="text" className="form-control rounded-3" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small font-weight-bold text-muted uppercase">Description</label>
                                            <textarea className="form-control rounded-3" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                                        </div>
                                    </div>
                                    <div className="modal-footer border-0">
                                        <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary rounded-pill px-4">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

export default EmpiresPage;

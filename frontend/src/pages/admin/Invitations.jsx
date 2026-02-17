import { useEffect, useState } from "react";
import { getInvitations, deleteInvitation } from "../../http";
import { toast } from "react-toastify";
import swal from "sweetalert";

const InvitationsPage = () => {
    const [loading, setLoading] = useState(true);
    const [invitations, setInvitations] = useState([]);

    const fetchInvitations = async () => {
        setLoading(true);
        try {
            const res = await getInvitations();
            if (res.success) {
                setInvitations(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchInvitations();
    }, []);

    const handleDelete = async (id) => {
        const willDelete = await swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this invitation!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        });

        if (willDelete) {
            try {
                const res = await deleteInvitation(id);
                if (res.success) {
                    toast.success("Invitation deleted");
                    fetchInvitations();
                }
            } catch (err) {
                toast.error("Failed to delete invitation");
            }
        }
    }

    return (
        <div className="main-content">
            <section className="section">
                <div className="glass-card mb-4 p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="font-weight-bold text-dark mb-1">Invitation History</h3>
                        <p className="text-muted mb-0">Track and manage sent recruitment links</p>
                    </div>
                </div>

                <div className="glass-card border-0 shadow-lg overflow-hidden">
                    <div className="card-header bg-white border-bottom py-4">
                        <h5 className="mb-0 font-weight-bold text-dark">
                            <i className="fas fa-envelope-open-text mr-2 text-primary"></i> Pending & Used Invitations
                        </h5>
                    </div>
                    <div className="card-body p-3">
                        <div className="table-responsive">
                            <table className="table table-borderless align-middle mb-0">
                                <thead>
                                    <tr className="text-muted text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>
                                        <th>Email</th>
                                        <th>Target Role</th>
                                        <th>Position</th>
                                        <th>Status</th>
                                        <th>Expires</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center p-5">Loading invitations...</td></tr>
                                    ) : invitations.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center p-5">No invitations found.</td></tr>
                                    ) : invitations.map((inv) => (
                                        <tr key={inv._id} className="soft-card shadow-sm mb-2" style={{ borderBottom: '12px solid transparent' }}>
                                            <td className="font-weight-bold">{inv.email}</td>
                                            <td className="text-capitalize">{inv.type}</td>
                                            <td>{inv.position}</td>
                                            <td>
                                                <span className={`badge rounded-pill px-3 ${inv.status === 'pending' ? 'badge-primary' : inv.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td>{new Date(inv.expiresAt).toLocaleDateString()}</td>
                                            <td className="text-right">
                                                <button onClick={() => handleDelete(inv._id)} className="btn btn-sm btn-outline-danger rounded-circle">
                                                    <i className="fas fa-trash"></i>
                                                </button>
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

export default InvitationsPage;

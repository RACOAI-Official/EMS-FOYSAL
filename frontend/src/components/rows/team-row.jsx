import { useState } from "react";
import { NavLink } from "react-router-dom";
import { updateTeamProgress } from "../../http";
import { toast } from "react-toastify";
import ProgressModal from "../common/ProgressModal";

const RowTeam = ({ index, data, refresh }) => {
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleProgressSave = async (progress, progressNote) => {
        setLoading(true);
        try {
            const res = await updateTeamProgress(data.id, { progress, progressNote });
            if (res.success) {
                toast.success('Team progress updated successfully');
                setShowProgressModal(false);
                if (refresh) refresh();
                else window.location.reload();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update team progress');
        } finally {
            setLoading(false);
        }
    };

    return (
        <tr className="soft-card shadow-sm hover-lift">
            <td className="ps-4 py-3">
                <div className="d-flex align-items-center">
                    <div className="rounded-circle overflow-hidden border mr-3 shadow-sm bg-light d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                        <img src={data.image || '/assets/icons/team.png'} className="w-100 h-100 object-fit-cover" alt={data.name} onError={(e) => e.target.src = '/assets/icons/team.png'} />
                    </div>
                    <div>
                        <div className="fw-bold text-dark">{data.name}</div>
                        <div className="text-muted small">ID: {data.id?.substring(0, 8)}...</div>
                    </div>
                </div>
            </td>
            <td>
                {data.leader ? (
                    <div className="d-flex align-items-center">
                        <img src={data.leader.image || '/assets/icons/user.png'} className="rounded-circle mr-2 border shadow-sm" width="30" height="30" alt="" onError={(e) => e.target.src = '/assets/icons/user.png'} />
                        <div className="fw-bold text-primary small">{data.leader.name}</div>
                    </div>
                ) : (
                    <div className="badge bg-light text-muted border rounded-pill px-3">
                        <i className="fas fa-user-slash mr-1"></i> No Leader
                    </div>
                )}
            </td>
            <td>
                <div className="badge border text-dark font-weight-bold px-3 py-2">
                    <i className="fas fa-users mr-2 text-muted"></i>
                    {data.totalMembers || 0} Members
                </div>
            </td>
            <td className="text-center">
                <div className={`badge rounded-pill px-3 py-2 ${data.status === 'Active' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                    <i className={`fas fa-${data.status === 'Active' ? 'check-circle' : 'exclamation-triangle'} mr-1`}></i>
                    {data.status}
                </div>
            </td>
            <td className="text-right pe-4">
                <div className="d-flex justify-content-end gap-2">
                    <NavLink to={`/team/${data.id}`} className="btn btn-sm btn-light border rounded-pill px-3 py-1 font-weight-bold shadow-none" title="View Team Details">
                        <i className="fas fa-eye mr-1"></i> Details
                    </NavLink>
                    <button onClick={() => setShowProgressModal(true)} className="btn btn-sm btn-soft-warning rounded-pill px-3 py-1 font-weight-bold shadow-none" title="Report Progress">
                        <i className="fas fa-chart-line"></i>
                    </button>
                    <button className="btn btn-sm btn-soft-danger rounded-pill px-3 py-1 font-weight-bold shadow-none" onClick={() => (data.onDelete && data.onDelete(data))} title="Delete Team">
                        <i className="fas fa-trash-alt"></i>
                    </button>
                </div>

                <ProgressModal
                    show={showProgressModal}
                    onHide={() => setShowProgressModal(false)}
                    title={`Update Team Progress - ${data.name}`}
                    initialProgress={data.progress}
                    initialNote={data.progressNote}
                    onSave={handleProgressSave}
                    loading={loading}
                />
            </td>
        </tr>
    );
}

export default RowTeam;

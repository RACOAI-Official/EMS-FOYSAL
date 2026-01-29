import { useState } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { backendUrl, updateUserProgress } from "../../http";
import { toast } from "react-toastify";
import ProgressModal from "../common/ProgressModal";
import { getFileUrl } from "../../utils/fileUtil";

const RowLeader = ({ index, data, refresh }) => {
    const { user } = useSelector(state => state.authSlice);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleProgressSave = async (progress, progressNote) => {
        setLoading(true);
        try {
            const res = await updateUserProgress(data.id, { progress, progressNote });
            if (res.success) {
                toast.success('Leader progress updated successfully');
                setShowProgressModal(false);
                if (refresh) refresh();
                else window.location.reload();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update progress');
        } finally {
            setLoading(false);
        }
    };
    return(
        <>
        <tr className="soft-card shadow-sm hover-lift mb-3">
            <td className="ps-4 py-3">
                <div className="d-flex align-items-center">
                    <div className="position-relative">
                        <img 
                            src={getFileUrl(data.image)} 
                            className="rounded-circle mr-3 border-ring shadow-sm" 
                            alt={data.name} 
                            width="52" height="52" 
                            style={{ objectFit: 'cover' }}
                            onError={(e) => { e.target.src = '/assets/icons/user.png' }}
                        />
                        <div className="position-absolute" style={{ bottom: '2px', right: '12px' }}>
                            <div className="bg-success rounded-circle border border-2 border-transparent" style={{ width: '12px', height: '12px' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="fw-bold text-dark mb-0" style={{ fontSize: '0.95rem' }}>{data.name}</div>
                        <div className="text-muted small d-flex align-items-center">
                            <i className="far fa-envelope mr-1 opacity-50" style={{ fontSize: '0.7rem' }}></i>
                            {data.email}
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <div className="bg-primary-soft text-primary px-3 py-1 rounded-pill d-inline-flex align-items-center font-weight-bold" style={{ fontSize: '0.72rem', letterSpacing: '0.3px' }}>
                    <i className="fas fa-shield-alt mr-1 opacity-75"></i>
                    {data.position || 'Department Leader'}
                </div>
            </td>
            <td>
                <div className="text-dark font-weight-bold small d-flex align-items-center">
                    <i className="fas fa-phone-alt mr-2 text-primary opacity-25" style={{ fontSize: '0.8rem' }}></i>
                    {data.mobile}
                </div>
            </td>
            <td>
                <div className={`badge rounded-pill px-3 py-1 ${data.status === 'Active' ? 'bg-success-soft text-success' : 'bg-light text-muted border'}`} style={{ fontSize: '0.7rem' }}>
                    {data.status === 'Active' ? '● Online' : 'Offline'}
                </div>
            </td>
            <td>
                {data.team && Object.keys(data.team).length !== 0 ? (
                    <NavLink to={`/team/${data.team.id}`} className="text-decoration-none">
                        <div className="d-flex align-items-center bg-transparent shadow-xs p-1 pe-3 rounded-pill hover-lift border border-light" style={{ transition: 'all 0.2s ease', maxWidth: 'fit-content' }}>
                            <img src={getFileUrl(data.team.image, '/assets/icons/team.png')} className='rounded-circle mr-2 shadow-sm' alt="Team" width="26" height="26" />
                            <span className="small font-weight-bold" style={{ fontSize: '0.8rem' }}>{data.team.name}</span>
                        </div>
                    </NavLink>
                ) : (
                    <div className="small text-muted font-italic opacity-50">Unassigned</div>
                )}
            </td>
            <td className="text-center">
                <div className="d-inline-flex align-items-center px-2 py-1 bg-light rounded-lg">
                    <span className="font-weight-bold text-primary mr-1" style={{ fontSize: '0.9rem' }}>{data.totalMembers || 0}</span>
                    <i className="fas fa-users text-muted" style={{ fontSize: '0.7rem' }}></i>
                </div>
            </td>
            <td className="text-right pe-4">
                <div className="d-flex justify-content-end align-items-center" style={{ gap: '8px' }}>
                    <NavLink to={`/employee/${data.id}`} className="btn btn-icon-sm btn-light border rounded-pill shadow-xs" title="View Profile">
                        <i className="fas fa-eye text-primary"></i>
                    </NavLink>
                    <button onClick={() => setShowProgressModal(true)} className="btn btn-icon-sm btn-soft-primary rounded-pill shadow-xs" title="Update Performance">
                        <i className="fas fa-chart-line"></i>
                    </button>
                    {['super_admin', 'sub_admin'].includes(user.type) && (
                        <NavLink to={`/print-id/${data.id}`} className="btn btn-icon-sm btn-light border rounded-pill shadow-xs" title="Print ID Card">
                            <i className="fas fa-id-card text-info"></i>
                        </NavLink>
                    )}
                    <button className="btn btn-icon-sm btn-soft-danger rounded-pill shadow-xs" onClick={() => (data.onDelete && data.onDelete(data))} title="Remove Leader">
                        <i className="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        </tr>
        
        {/* Modal outside table row to prevent duplication */}
        {showProgressModal && (
            <ProgressModal
                show={showProgressModal}
                onHide={() => setShowProgressModal(false)}
                title={`Efficiency Review - ${data.name}`}
                initialProgress={data.progress}
                initialNote={data.progressNote}
                onSave={handleProgressSave}
                loading={loading}
            />
        )}
        </>
    );
}

export default RowLeader;

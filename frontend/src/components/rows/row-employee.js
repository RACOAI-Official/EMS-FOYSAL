import { useState } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { deleteUser, updateUserProgress, updateMemberProgress, backendUrl } from "../../http";
import { toast } from "react-toastify";
import ProgressModal from "../common/ProgressModal";
import { getFileUrl } from "../../utils/fileUtil";


const RowEmployee = ({ index, data, refresh }) => {
    const { user } = useSelector(state => state.authSlice);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = () => {
        if (data.onDelete) {
            data.onDelete(data);
        }
    }

    const handleProgressSave = async (progress, progressNote) => {
        setLoading(true);
        try {
            const updateFn = ['super_admin', 'sub_admin'].includes(user.type) ? updateUserProgress : updateMemberProgress;
            const res = await updateFn(data.id, { progress, progressNote });
            if (res.success) {
                toast.success('Progress updated successfully');
                setShowProgressModal(false);
                if (refresh) refresh();
                else window.location.reload(); // Fallback if refresh not provided
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update progress');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <tr className="soft-card shadow-sm hover-lift">
                <td className="ps-4 py-3">
                    <div className="d-flex align-items-center">
                        <div className="avatar mr-3 shadow-sm border border-2 border-white rounded-circle overflow-hidden"
                            style={{ width: '45px', height: '45px' }}>
                            <img
                                src={getFileUrl(data.image)}
                                alt="Employee"
                                className="w-100 h-100 object-fit-cover"
                                onError={(e) => { e.target.src = '/assets/icons/user.png' }}
                            />
                        </div>
                        <div>
                            <div className="fw-bold text-dark mb-0">{data.name}</div>
                            <div className="text-primary small font-weight-bold" style={{ fontSize: '0.7rem' }}>
                                {data.employeeId || `ID# ${data.id?.substring(0, 8)}`}
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <span className="badge bg-primary-soft text-primary px-3 rounded-pill font-weight-bold" style={{ fontSize: '0.7rem' }}>
                        {data.position || 'Organization Member'}
                    </span>
                </td>
                <td>
                    <div className="small text-dark fw-medium">{data.email}</div>
                    <div className="text-muted small">{data.mobile || 'No mobile listed'}</div>
                </td>
                <td>
                    <span className={`badge rounded-pill px-3 py-1 font-weight-bold ${data.status === 'Active' ? 'bg-success-soft text-success' : 'bg-light text-muted border'}`} style={{ fontSize: '0.7rem' }}>
                        <i className="fas fa-circle mr-1" style={{ fontSize: '0.5rem' }}></i> {data.status === 'Active' ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    {data.team ? (
                        <NavLink to={`/team/${data.team.id}`} className="text-decoration-none">
                            <div className="d-flex align-items-center bg-white p-1 pe-3 rounded-pill hover-lift border shadow-sm">
                                <img src={getFileUrl(data.team.image, '/assets/icons/team.png')} className='rounded-circle mr-2' alt="Team" width="28" height="28" />
                                <span className="text-dark small font-weight-bold">{data.team.name}</span>
                            </div>
                        </NavLink>
                    ) : (
                        <span className="small text-muted font-italic opacity-75">Not Assigned</span>
                    )}
                </td>
                <td className="text-center" style={{ minWidth: '140px' }}>
                    <div className="d-flex flex-column align-items-center">
                        <div className="progress w-100 mb-1" style={{ height: '6px', backgroundColor: 'var(--primary-glow)', borderRadius: '10px' }}>
                            <div
                                className={`progress-bar rounded-pill ${data.progress >= 75 ? 'bg-success' : data.progress >= 50 ? 'bg-primary' : 'bg-warning'}`}
                                role="progressbar"
                                style={{ width: `${data.progress || 0}%`, transition: 'width 1s ease' }}
                            ></div>
                        </div>
                        <small className="font-weight-bold text-dark opacity-75">{data.progress || 0}% Efficiency</small>
                    </div>
                </td>
                <td className="text-right pe-4">
                    <div className="d-flex justify-content-end gap-2">
                        <NavLink to={`/employee/${data.id}`} className="btn btn-sm btn-light border rounded-pill px-3 py-1 font-weight-bold" title="Full Profile">
                            <i className="fas fa-eye text-primary"></i> Profile
                        </NavLink>
                        {(['super_admin', 'sub_admin', 'leader'].includes(user.type)) && (
                            <button onClick={() => setShowProgressModal(true)} className="btn btn-sm btn-soft-primary rounded-pill px-3 py-1 font-weight-bold" title="Performance Update">
                                <i className="fas fa-chart-line"></i>
                            </button>
                        )}
                        {['super_admin', 'sub_admin'].includes(user.type) && (
                            <>
                                <NavLink to={`/print-id/${data.id}`} className="btn btn-sm btn-light border rounded-pill px-3 py-1 font-weight-bold" title="Generate ID">
                                    <i className="fas fa-id-card text-info"></i>
                                </NavLink>
                                <button onClick={handleDelete} className="btn btn-sm btn-soft-danger rounded-pill px-3 py-1 font-weight-bold" title="Restrict Access">
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            </>
                        )}
                    </div>
                </td>
            </tr>

            {/* Modal outside table row to prevent duplication */}
            {
                showProgressModal && (
                    <ProgressModal
                        show={showProgressModal}
                        onHide={() => setShowProgressModal(false)}
                        title={`Performance Update: ${data.name}`}
                        initialProgress={data.progress}
                        initialNote={data.progressNote}
                        onSave={handleProgressSave}
                        loading={loading}
                    />
                )
            }
        </>
    );
}

export default RowEmployee;

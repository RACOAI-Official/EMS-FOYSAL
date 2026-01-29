import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

const RowAdmin = ({index,data}) =>
{
    const { user } = useSelector(state => state.authSlice);
    return (
        <tr className="soft-card shadow-sm hover-lift">
            <td className="ps-4 py-3">
                <div className="d-flex align-items-center">
                    <div className="avatar mr-3 shadow-sm border border-2 border-white rounded-circle overflow-hidden" 
                         style={{ width: '45px', height: '45px' }}>
                        <img 
                            src={data.image || '/assets/icons/user.png'} 
                            alt={data.name}
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => { e.target.src = '/assets/icons/user.png' }}
                        />
                    </div>
                    <div>
                        <div className="fw-bold text-dark h6 mb-0">{data.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Admin ID: #{data.id?.substring(0, 8)}</div>
                    </div>
                </div>
            </td>
            <td>
                <div className="text-dark small fw-medium">{data.email}</div>
                <div className="text-muted small">{data.mobile || 'No mobile'}</div>
            </td>
            <td>
                <span className="badge bg-primary-soft text-primary rounded-pill px-3 py-1 font-weight-bold" style={{ fontSize: '0.7rem' }}>
                    {data.position || 'System Admin'}
                </span>
            </td>
            <td className="text-center">
                <span className={`badge rounded-pill px-3 py-1 font-weight-bold ${data.status === 'Active' ? 'bg-success-soft text-success' : 'bg-secondary-soft text-secondary'}`} style={{ fontSize: '0.7rem' }}>
                    <i className={`fas fa-circle mr-1`} style={{ fontSize: '0.5rem' }}></i> {data.status}
                </span>
            </td>
            <td className="text-right pe-4">
                <div className="d-flex justify-content-end gap-2">
                    <NavLink to={`/admin/${data.id}`} className="btn btn-sm btn-light border rounded-pill px-3 py-1 font-weight-bold">
                        <i className="fas fa-eye mr-1 text-primary"></i> Detail
                    </NavLink>
                    {['super_admin', 'sub_admin'].includes(user.type) && (
                        <NavLink to={`/print-id/${data.id}`} className="btn btn-sm btn-soft-primary rounded-pill px-3 py-1 font-weight-bold">
                            <i className="fas fa-id-card mr-1"></i> ID Card
                        </NavLink>
                    )}
                </div>
            </td>
        </tr>
    );
}

export default RowAdmin;

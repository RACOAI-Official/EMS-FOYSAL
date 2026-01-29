import { useEffect, useState } from "react";
import HeaderSection from "../../components/HeaderSection";
import RowAdmin from "../../components/rows/row-admin";
import { getAdminUsers } from "../../http";

const AdminsPage = () =>
{
    const [loading,setLoading] = useState(true);
    const [users,setUsers] = useState({});

    // Fetch data on mount and whenever component updates
    const fetchAdmins = async () => {
        setLoading(true);
        const res = await getAdminUsers();
        if(res.success)
        {
            setUsers(res.data);
        }
        setLoading(false);
    }

    useEffect(()=>{
        fetchAdmins();
    },[])

    return (
        <div className="main-content">
            <section className="section">
                {/* Page Header */}
                <div className="glass-card mb-4 p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="font-weight-bold text-dark mb-1">Administrative Staff</h3>
                        <p className="text-muted mb-0">Overview of users with elevated privileges and governance roles</p>
                    </div>
                </div>

                <div className="glass-card border-0 shadow-lg overflow-hidden">
                    <div className="card-header bg-white border-bottom py-4 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 font-weight-bold text-dark">
                            <i className="fas fa-user-shield mr-2 text-primary"></i> Admin Registry
                        </h5>
                        <span className="badge bg-primary-soft text-primary rounded-pill px-3 py-2">
                             System Operators
                        </span>
                    </div>
                    <div className="card-body p-3">
                        <div className="table-responsive">
                            <table className="table table-borderless align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                                <thead>
                                    <tr className="text-muted text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>
                                        <th className="ps-4">Administrator</th>
                                        <th>Contact Details</th>
                                        <th>Designation</th>
                                        <th className="text-center">Status</th>
                                        <th className="text-right pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5" className="text-center p-5 text-muted">Retrieving administrative records...</td></tr>
                                    ) : users.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center p-5 text-muted">No administrators found.</td></tr>
                                    ) : users.map((data, index) => (
                                        <RowAdmin key={index} index={index + 1} data={data} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default AdminsPage;

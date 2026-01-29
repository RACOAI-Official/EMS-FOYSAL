import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUser, backendUrl } from "../../http";

const VerifyUser = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await getUser(id);
                if (res.success) {
                    setUser(res.data);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Error fetching user", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#f4f6f9' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
            </div>
            <h4 className="ml-3 text-muted">Verifying Employee Identity...</h4>
        </div>
    );

    if (error || !user) return (
        <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '100vh', background: '#f4f6f9' }}>
            <div className="text-danger mb-3" style={{ fontSize: '64px' }}>
                <i className="fas fa-times-circle"></i>
            </div>
            <h2 className="text-danger">Verification Failed</h2>
            <p className="text-muted">Invalid ID or Employee Not Found</p>
        </div>
    );

    return (
        <div style={{ background: '#f4f6f9', minHeight: '100vh', padding: '20px' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card shadow-lg border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                            <div className="card-header text-center text-white" style={{ background: 'linear-gradient(135deg, #6777ef, #3e4ebb)', padding: '30px 20px' }}>
                                <div className="mb-3">
                                    <i className="fas fa-check-circle" style={{ fontSize: '48px', color: '#fff' }}></i>
                                </div>
                                <h4 className="mb-0">Verified Employee</h4>
                                <small style={{ opacity: 0.8 }}>RACO AI Verification System</small>
                            </div>
                            <div className="card-body text-center" style={{ marginTop: '-40px', paddingTop: '0' }}>
                                <div className="mb-4">
                                    <img 
                                        src={user.image.startsWith('http') ? user.image : `${backendUrl}/storage/${user.image}`} 
                                        alt={user.name}
                                        className="rounded-circle shadow"
                                        style={{ 
                                            width: '120px', 
                                            height: '120px', 
                                            objectFit: 'cover', 
                                            border: '5px solid #fff' 
                                        }}
                                    />
                                </div>
                                
                                <h3 style={{ color: '#333', fontWeight: '700' }}>{user.name}</h3>
                                <p className="text-muted mb-4">{user.designation || user.type || 'Employee'} • {user.employeeId}</p>

                                <div className="text-left w-100 px-3">
                                    <div className="list-group list-group-flush">
                                        <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <span className="text-muted"><i className="fas fa-envelope mr-2"></i>Email</span>
                                            <span style={{ fontWeight: '500' }}>{user.email}</span>
                                        </div>
                                        <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <span className="text-muted"><i className="fas fa-phone mr-2"></i>Mobile</span>
                                            <span style={{ fontWeight: '500' }}>{user.mobile}</span>
                                        </div>
                                        <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <span className="text-muted"><i className="fas fa-tint mr-2"></i>Blood Group</span>
                                            <span style={{ fontWeight: '500' }}>{user.bloodGroup || 'N/A'}</span>
                                        </div>
                                        <div className="list-group-item px-0">
                                            <span className="text-muted d-block mb-1"><i className="fas fa-map-marker-alt mr-2"></i>Address</span>
                                            <span style={{ fontWeight: '500', display: 'block' }}>{
                                                user.presentAddress ? 
                                                `${user.presentAddress}${user.village ? `, ${user.village}` : ''}${user.district ? `, ${user.district}` : ''}` 
                                                : 
                                                (user.address || 'N/A')
                                            }</span>
                                        </div>
                                        <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <span className="text-muted"><i className="fas fa-user mr-2"></i>Father's Name</span>
                                            <span style={{ fontWeight: '500' }}>{user.fatherName || 'N/A'}</span>
                                        </div>
                                        <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <span className="text-muted"><i className="fas fa-user mr-2"></i>Mother's Name</span>
                                            <span style={{ fontWeight: '500' }}>{user.motherName || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-top">
                                    <div className="badge badge-success px-4 py-2" style={{ fontSize: '14px', borderRadius: '30px' }}>
                                        <i className="fas fa-shield-alt mr-2"></i> 
                                        Active Status: {user.status ? user.status.toUpperCase() : 'ACTIVE'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-center mt-3 text-muted">
                            <small>© {new Date().getFullYear()} RACO AI. All Verification Rights Reserved.</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyUser;

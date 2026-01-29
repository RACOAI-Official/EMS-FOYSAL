import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { getUser } from "../../http";
import CircularProgress from "../../components/CircularProgress";

const Admin = () =>
{
    const [user,setUser] = useState({
        name:'',
        email:'',
        mobile:'',
        image:'',
        address:'',
        status:''
    });
    const {id} = useParams();
    useEffect(()=>{
        (async ()=>{
            const res= await getUser(id);
            if(res.success)
                setUser(res.data);
        })();
    },[id])


    return (
        <div className="main-content">
            <section className="section">
                {/* Page Header */}
                <div className="glass-card mb-4 p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="font-weight-bold text-dark mb-1">Administrative Profile</h3>
                        <p className="text-muted mb-0">Governance and credentials management for organizational administrators</p>
                    </div>
                    <NavLink to={`/edituser/${id}`} className='btn btn-primary rounded-pill px-4 shadow-sm hover-lift font-weight-bold'>
                        <i className="fas fa-edit mr-2"></i> Edit Authority
                    </NavLink>
                </div>

                <div className="row">
                    {/* Left Column: Core Info Card */}
                    <div className="col-lg-4 mb-4">
                        <div className="glass-card border-0 shadow-lg text-center p-5 sticky-top" style={{ top: '100px', zIndex: 1 }}>
                            <div className="mb-4 position-relative d-inline-block">
                                <div className="p-1 rounded-circle bg-white shadow-xl" style={{ border: '4px solid var(--primary-soft)' }}>
                                    <img 
                                        className='rounded-circle object-fit-cover shadow-sm' 
                                        src={user.image} 
                                        alt={user.name} 
                                        style={{ width: '160px', height: '160px' }}
                                        onError={(e) => { e.target.src = '/assets/icons/user.png' }}
                                    />
                                </div>
                                <div className="position-absolute" style={{ bottom: '10px', right: '10px' }}>
                                    <div className="bg-success rounded-circle border border-4 border-white" style={{ width: '24px', height: '24px' }}></div>
                                </div>
                            </div>
                            <h4 className="font-weight-bold text-dark mb-1">{user.name}</h4>
                            <div className="badge bg-primary-soft text-primary px-3 py-1 rounded-pill mb-4" style={{ letterSpacing: '0.5px' }}>
                                <i className="fas fa-shield-alt mr-1"></i> System Administrator
                            </div>
                            
                            <hr className="my-4 opacity-10" />
                            
                            <div className="d-flex justify-content-center gap-4">
                                <div className="text-center">
                                    <CircularProgress value={user.progress || 0} size={70} strokeWidth={8} color="var(--primary)" />
                                    <div className="mt-2 small font-weight-bold text-muted uppercase" style={{ fontSize: '0.65rem' }}>Authority Score</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Credentials */}
                    <div className="col-lg-8">
                        <div className="glass-card border-0 shadow-lg overflow-hidden mb-4">
                            <div className="card-header bg-white border-bottom py-3">
                                <h5 className="mb-0 font-weight-bold text-dark d-flex align-items-center">
                                    <i className="fas fa-id-card-alt mr-2 text-primary opacity-50"></i> 
                                    Identity & Credentials
                                </h5>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-4">
                                    <div className="col-md-6 mb-4">
                                        <div className="p-3 bg-light-soft rounded-xl border border-light">
                                            <label className="text-muted text-uppercase mb-2 d-block" style={{ fontSize: '0.65rem', letterSpacing: '1px', fontWeight: '800' }}>Full Name</label>
                                            <div className="font-weight-bold text-dark h6 mb-0">{user.name}</div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-4">
                                        <div className="p-3 bg-light-soft rounded-xl border border-light">
                                            <label className="text-muted text-uppercase mb-2 d-block" style={{ fontSize: '0.65rem', letterSpacing: '1px', fontWeight: '800' }}>Email Address</label>
                                            <div className="font-weight-bold text-dark h6 mb-0">{user.email}</div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-4">
                                        <div className="p-3 bg-light-soft rounded-xl border border-light">
                                            <label className="text-muted text-uppercase mb-2 d-block" style={{ fontSize: '0.65rem', letterSpacing: '1px', fontWeight: '800' }}>Primary Contact</label>
                                            <div className="font-weight-bold text-dark h6 mb-0">{user.mobile}</div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-4">
                                        <div className="p-3 bg-light-soft rounded-xl border border-light">
                                            <label className="text-muted text-uppercase mb-2 d-block" style={{ fontSize: '0.65rem', letterSpacing: '1px', fontWeight: '800' }}>Status</label>
                                            <div className="d-flex align-items-center">
                                                <div className="bg-success rounded-circle mr-2" style={{ width: '8px', height: '8px' }}></div>
                                                <div className="font-weight-bold text-success h6 mb-0">Authorized</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 mb-4">
                                        <div className="p-3 bg-light-soft rounded-xl border border-light">
                                            <label className="text-muted text-uppercase mb-2 d-block" style={{ fontSize: '0.65rem', letterSpacing: '1px', fontWeight: '800' }}>Domicile Address</label>
                                            <div className="font-weight-bold text-dark h6 mb-0">{user.address || 'Standard Registered Office Location'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / System Role */}
                        <div className="glass-card border-0 shadow-lg p-4 bg-primary text-white overflow-hidden position-relative">
                            <div className="position-relative" style={{ zIndex: 2 }}>
                                <h5 className="font-weight-bold mb-2">Systems Level: Advanced Governance</h5>
                                <p className="opacity-75 mb-0 small" style={{ maxWidth: '80%' }}>
                                    This administrator has full delegation authority within the organizational structure. 
                                    Authorized actions include human resource auditing, team restructuring, and cross-departmental coordination.
                                </p>
                            </div>
                            <i className="fas fa-shield-alt position-absolute text-white opacity-10" style={{ right: '-20px', bottom: '-20px', fontSize: '10rem', zIndex: 1 }}></i>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Admin;

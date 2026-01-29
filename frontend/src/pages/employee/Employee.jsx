import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { getUser, updateUser, backendUrl } from "../../http";
import { getFileUrl } from "../../utils/fileUtil";
import CircularProgress from "../../components/CircularProgress";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const Employee = () =>
{
    const [user,setUser] = useState({
        name:'',
        email:'',
        mobile:'',
        image:'',
        address:'',
        status:''
    });
    
    const { user: currentUser } = useSelector(state => state.authSlice);
    const isAdmin = currentUser.type.toLowerCase().includes('admin');
    const [editingProgress, setEditingProgress] = useState(false);
    const [progressData, setProgressData] = useState({ progress: 0, progressNote: '' });
    
    const {id} = useParams();
    useEffect(()=>{
        (async ()=>{
            const res = await getUser(id);
            console.log("Employee detail response:", res);
            if(res.success) {
                console.log("Employee data received:", res.data);
                setUser(res.data);
                setProgressData({
                    progress: res.data.progress || 0,
                    progressNote: res.data.progressNote || ''
                });
            } else {
                console.log("Failed to fetch employee:", res.message);
            }
        })();
    },[id])

    const handleProgressUpdate = async () => {
        try {
            const res = await updateUser(id, progressData);
            if (res.success) {
                toast.success('Progress updated successfully!');
                setUser(prev => ({ ...prev, ...progressData }));
                setEditingProgress(false);
            } else {
                toast.error(res.message || 'Failed to update progress');
            }
        } catch (error) {
            toast.error('Failed to update progress');
        }
    };


    return (
        <div className="main-content">
            <section className="section">
                {/* Page Header */}
                <div className="glass-card mb-4 p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="font-weight-bold text-dark mb-1">Employee Profile</h3>
                        <p className="text-muted mb-0">Detailed organization member record and performance analytics</p>
                    </div>
                    {isAdmin && (
                        <NavLink to={`/edituser/${id}`} className='btn btn-primary rounded-pill px-4 shadow-sm hover-lift'>
                            <i className="fas fa-user-edit mr-2"></i> Edit Record
                        </NavLink>
                    )}
                </div>

                <div className="row">
                    {/* Left Column: Image & Basic Info */}
                    <div className="col-lg-4">
                        <div className="glass-card border-0 shadow-lg p-5 text-center mb-4">
                            <div className="position-relative d-inline-block mb-4">
                                <div className="avatar shadow-xl border border-4 border-white rounded-circle overflow-hidden mx-auto" 
                                     style={{ width: '180px', height: '180px' }}>
                                    <img
                                        src={getFileUrl(user.image)}
                                        alt={user.name}
                                        className="w-100 h-100 object-fit-cover"
                                        onError={(e) => { e.target.src = '/assets/icons/user.png' }}
                                    />
                                </div>
                                <span className={`position-absolute border border-4 border-white shadow-sm rounded-circle ${user.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}
                                      style={{ width: '25px', height: '25px', bottom: '10px', right: '15px' }}></span>
                            </div>
                            <h4 className="font-weight-bold text-dark mb-1">{user.name}</h4>
                            <p className="text-primary font-weight-bold mb-3">{user.position || 'Organization Member'}</p>
                            <div className="badge bg-primary-soft text-primary rounded-pill px-4 py-2">
                                <i className="fas fa-shield-alt mr-1"></i> {user.type}
                            </div>
                        </div>

                        {/* Performance Quick View */}
                        <div className="glass-card border-0 shadow-lg p-4 text-center">
                            <h6 className="font-weight-bold text-dark mb-4 text-uppercase" style={{ letterSpacing: '1px' }}>Efficiency Score</h6>
                            <CircularProgress value={user.progress || 0} size={130} />
                            <h5 className="mt-4 font-weight-bold text-dark">{user.progress || 0}% Complete</h5>
                            <p className="text-muted small px-3">Aggregated performance based on assigned tasks and milestones</p>
                        </div>
                    </div>

                    {/* Right Column: Detailed Info & Progress Note */}
                    <div className="col-lg-8">
                        <div className="glass-card border-0 shadow-lg overflow-hidden mb-4">
                            <div className="card-header bg-white border-bottom py-3">
                                <h5 className="mb-0 font-weight-bold text-dark">
                                    <i className="fas fa-info-circle mr-2 text-primary"></i> Personal Credentials
                                </h5>
                            </div>
                            <div className="card-body p-0">
                                <div className="row g-0">
                                    {[
                                        { label: 'Full Legal Name', value: user.name, icon: 'user' },
                                        { label: 'Professional Email', value: user.email, icon: 'envelope' },
                                        { label: 'Contact Mobile', value: user.mobile, icon: 'phone' },
                                        { label: 'System Designation', value: user.position, icon: 'briefcase' },
                                        { label: 'Official Role', value: user.type, icon: 'shield-alt' },
                                        { label: 'Identification (NID)', value: user.nid || 'Not Provided', icon: 'id-card' },
                                        { label: 'Blood Group', value: user.bloodGroup || 'Not Notified', icon: 'tint' },
                                        { label: 'Father\'s Name', value: user.fatherName || '-', icon: 'user-tie' },
                                        { label: 'Mother\'s Name', value: user.motherName || '-', icon: 'user-friends' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="col-md-6 border-bottom border-right p-4 d-flex align-items-center">
                                            <div className="icon-box mr-3 bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                <i className={`fas fa-${item.icon} text-primary opacity-75`}></i>
                                            </div>
                                            <div>
                                                <div className="text-muted small mb-1">{item.label}</div>
                                                <div className="font-weight-bold text-dark">{item.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="col-12 p-4">
                                        <div className="text-muted small mb-2"><i className="fas fa-map-marker-alt mr-1"></i> Registered Address</div>
                                        <div className="font-weight-bold text-dark">{user.address || 'No address registered'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Progress Detailed */}
                        <div className="glass-card border-0 shadow-lg overflow-hidden">
                            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 font-weight-bold text-dark">
                                    <i className="fas fa-chart-line mr-2 text-primary"></i> Governance & Performance
                                </h5>
                                {isAdmin && !editingProgress && (
                                    <button 
                                        className="btn btn-sm btn-soft-primary rounded-pill px-3 py-1 font-weight-bold" 
                                        onClick={() => setEditingProgress(true)}
                                    >
                                        <i className="fas fa-edit mr-1"></i> Adjust Performance
                                    </button>
                                )}
                            </div>
                            <div className="card-body p-4">
                                {editingProgress && isAdmin ? (
                                    <div className="p-3 bg-white rounded-lg border">
                                        <div className="row align-items-center mb-4">
                                            <div className="col-md-7">
                                                <label className="font-weight-bold text-dark">Efficiency Target ({progressData.progress}%)</label>
                                                <input 
                                                    type="range" 
                                                    min="0" 
                                                    max="100" 
                                                    step="5"
                                                    value={progressData.progress}
                                                    onChange={(e) => setProgressData(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                                                    className="form-control-range" 
                                                    style={{ height: '35px' }}
                                                />
                                                <div className="d-flex justify-content-between text-muted small px-1 font-weight-bold">
                                                    <span>Entry</span>
                                                    <span>Mid</span>
                                                    <span>Peak</span>
                                                </div>
                                            </div>
                                            <div className="col-md-5">
                                                <label className="font-weight-bold text-dark mb-2">Live Forecast</label>
                                                <div className="progress rounded-pill shadow-sm" style={{ height: '35px' }}>
                                                    <div 
                                                        className="progress-bar progress-bar-striped progress-bar-animated bg-primary shadow-inner" 
                                                        role="progressbar" 
                                                        style={{ width: `${progressData.progress}%` }}
                                                    >
                                                        <span className="font-weight-bold">{progressData.progress}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group mb-4">
                                            <label className="font-weight-bold text-dark">Administrative Review Notes</label>
                                            <textarea 
                                                className="form-control border-0 bg-light p-3" 
                                                rows="4"
                                                style={{ borderRadius: '15px' }}
                                                value={progressData.progressNote}
                                                onChange={(e) => setProgressData(prev => ({ ...prev, progressNote: e.target.value }))}
                                                placeholder="Provide detailed context on performance metrics, compliance, and institutional contributions..."
                                            ></textarea>
                                        </div>
                                        <div className="d-flex justify-content-end gap-2">
                                            <button 
                                                className="btn btn-light rounded-pill px-4 font-weight-bold border" 
                                                onClick={() => {
                                                    setEditingProgress(false);
                                                    setProgressData({
                                                        progress: user.progress || 0,
                                                        progressNote: user.progressNote || ''
                                                    });
                                                }}
                                            >
                                                Discard
                                            </button>
                                            <button 
                                                className="btn btn-primary rounded-pill px-4 font-weight-bold shadow-sm" 
                                                onClick={handleProgressUpdate}
                                            >
                                                <i className="fas fa-check-circle mr-2"></i> Commit Updates
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-2">
                                        <h6 className="text-muted text-uppercase mb-3" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Official Review Summary</h6>
                                        <div className="p-4 bg-light rounded-xl border-0" style={{ borderRadius: '20px', minHeight: '120px', borderLeft: '5px solid var(--primary)' }}>
                                            <i className="fas fa-quote-left text-primary opacity-25 mb-2 fa-2x"></i>
                                            <p className="text-dark font-italic mb-0" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                                                {user.progressNote || 'Standard organizational participation. No specific performance anomalies or exceptional milestones recorded for the current governance period.'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Employee;

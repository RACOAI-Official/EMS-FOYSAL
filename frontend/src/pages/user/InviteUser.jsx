import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import HeaderSection from "../../components/HeaderSection";
import { inviteUser } from "../../http";

const InviteUser = () => {
    const { user: currentUser } = useSelector((state) => state.authSlice);
    const initialState = { email: '', type: 'Employee', position: '' };
    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);

    const positions = [
        'AI Engineer', 'AI Developer', 
        'Full Stack Developer', 'Full Stack Engineer', 
        'HR', 'CEO', 'COO'
    ];

    const inputEvent = (e) => {
        const { name, value } = e.target;
        setFormData((old) => ({ ...old, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const { email, type, position } = formData;

        if (!email) return toast.error('Email is required');
        if (!type) return toast.error('User type is required');
        if (!position) return toast.error('Position (Sub-Type) is required');

        setLoading(true);
        try {
            const { success, message } = await inviteUser(formData);
            if (success) {
                toast.success(message || 'Invitation sent successfully');
                setFormData(initialState);
            } else {
                toast.error(message || 'Failed to send invitation');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    const isSuperAdmin = currentUser?.type === 'super_admin';
    const isSubAdmin = currentUser?.type === 'sub_admin';

    return (
        <div className="main-content">
            <section className="section">
                {/* Page Header */}
                <div className="glass-card mb-5 p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="font-weight-bold text-dark mb-1">Onboarding Center</h3>
                        <p className="text-muted mb-0">Invite new team members to the EMS platform</p>
                    </div>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="glass-card border-0 shadow-lg p-5">
                            <div className="text-center mb-5">
                                <div className="rounded-circle bg-primary-soft text-primary d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{width: '60px', height: '60px'}}>
                                    <i className="fas fa-user-plus fa-lg"></i>
                                </div>
                                <h4 className="font-weight-bold text-dark">Send Invitation</h4>
                                <p className="text-muted">Fill out the details below to grant access to a new user</p>
                            </div>

                            <form className='row g-4' onSubmit={onSubmit}>
                                <div className="form-group col-md-12 mb-4">
                                    <label className="text-muted small font-weight-bold mb-2 uppercase">Email Address</label>
                                    <div className="input-group shadow-sm">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text bg-light border-0"><i className="fas fa-envelope text-primary"></i></div>
                                        </div>
                                        <input 
                                            onChange={inputEvent} 
                                            value={formData.email} 
                                            type="email" 
                                            name='email' 
                                            className="form-control border-0 bg-light rounded-right h-100 py-3" 
                                            placeholder="e.g., employee@company.com"
                                            style={{ minHeight: '50px' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group col-md-6 mb-4">
                                    <label className="text-muted small font-weight-bold mb-2 uppercase">Role / Access Level</label>
                                    <div className="input-group shadow-sm">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text bg-light border-0"><i className="fas fa-user-shield text-info"></i></div>
                                        </div>
                                        <select name='type' onChange={inputEvent} value={formData.type} className="form-control border-0 bg-light rounded-right h-100 py-2">
                                            <option value="employee">Employee</option>
                                            <option value="leader">Leader</option>
                                            {isSuperAdmin && <option value="sub_admin">Sub Admin</option>}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group col-md-6 mb-4">
                                    <label className="text-muted small font-weight-bold mb-2 uppercase">Professional Position</label>
                                    <div className="input-group shadow-sm">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text bg-light border-0"><i className="fas fa-briefcase text-warning"></i></div>
                                        </div>
                                        <select name='position' onChange={inputEvent} value={formData.position} className="form-control border-0 bg-light rounded-right h-100 py-2">
                                            <option value="">Select Position</option>
                                            {positions.map((pos) => (
                                                <option key={pos} value={pos}>{pos}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group text-center col-md-12 mt-4">
                                    <button 
                                        className='btn btn-primary btn-lg rounded-pill px-5 shadow-lg font-weight-bold w-100 py-3' 
                                        type='submit' 
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm mr-2"></span> Sending Request...</>
                                        ) : (
                                            <><i className="fas fa-paper-plane mr-2"></i> Send Invitation</>
                                        )}
                                    </button>
                                    <p className="text-muted small mt-3">An email will be sent to the user with a registration link</p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default InviteUser;

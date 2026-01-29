import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { verifyInvitation, registerInvited } from "../../http";

const RegisterInvited = () => {
    const { token } = useParams();
    const history = useHistory();
    const [imagePreview, setImagePreview] = useState('/assets/icons/user.png');
    const [invitationData, setInvitationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        password: '',
        mobile: '',
        fatherName: '',
        motherName: '',
        presentAddress: '',
        village: '',
        union: '',
        district: '',
        nid: '',
        bloodGroup: '',
        profile: null
    });

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const { success, data, message } = await verifyInvitation(token);
                if (success) {
                    setInvitationData(data);
                } else {
                    toast.error(message || "Invalid or expired invitation");
                    history.push('/login');
                }
            } catch (err) {
                toast.error("Failed to verify invitation");
                history.push('/login');
            } finally {
                setLoading(false);
            }
        };
        verifyToken();
    }, [token, history]);

    const inputEvent = (e) => {
        const { name, value } = e.target;
        setFormData((old) => ({ ...old, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(old => ({ ...old, profile: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const { name, password, mobile } = formData;

        if (!name || !password || !mobile) {
            return toast.error("Name, Password and Mobile are required");
        }

        setSubmitting(true);
        try {
            // Use FormData for file upload
            const fd = new FormData();
            Object.keys(formData).forEach(key => {
                fd.append(key, formData[key]);
            });
            fd.append('token', token);

            const res = await registerInvited(fd);
            if (res.success) {
                toast.success(res.message);
                history.push('/login');
            } else {
                toast.error(res.message || "Registration failed");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center mt-5"><h4>Verifying Invitation...</h4></div>;

    return (
        <section className="section">
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">
                        <div className="login-brand">
                            <h2 style={{ color: '#6777ef' }}>RACO AI</h2>
                        </div>
                        <div className="card card-primary">
                            <div className="card-header">
                                <h4>Complete Your Registration</h4>
                                <div className="ml-auto">
                                    <span className="badge badge-info mr-2">{invitationData?.type}</span>
                                    <span className="badge badge-primary">{invitationData?.position}</span>
                                </div>
                            </div>

                            <div className="card-body">
                                <p className="text-muted">Registering with: <b>{invitationData?.email}</b></p>
                                <form onSubmit={onSubmit}>
                                    
                                    <div className="form-group text-center mb-4">
                                        <div className="d-flex justify-content-center">
                                            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                                                <img 
                                                    src={imagePreview} 
                                                    alt="Profile Preview" 
                                                    className="rounded-circle border"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                <input 
                                                    type="file" 
                                                    id="profile-upload"
                                                    accept="image/*"
                                                    className="d-none"
                                                    onChange={handleImageChange}
                                                />
                                                <label 
                                                    htmlFor="profile-upload"
                                                    className="btn btn-sm btn-primary rounded-circle"
                                                    style={{ 
                                                        position: 'absolute', 
                                                        bottom: '0', 
                                                        right: '0',
                                                        width: '32px',
                                                        height: '32px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <i className="fas fa-camera"></i>
                                                </label>
                                            </div>
                                        </div>
                                        <small className="form-text text-muted mt-2">Upload Profile Picture (Optional)</small>
                                    </div>

                                    <div className="row">
                                        <div className="form-group col-12">
                                            <label htmlFor="name">Full Name</label>
                                            <input onChange={inputEvent} value={formData.name} type="text" className="form-control" name="name" required />
                                        </div>
                                    </div>

                                    {/* ... rest of the form ... */}
                                    <div className="row">
                                        <div className="form-group col-6">
                                            <label htmlFor="password">Password</label>
                                            <div className="input-group">
                                                <input onChange={inputEvent} value={formData.password} type={showPassword ? "text" : "password"} className="form-control" name="password" required />
                                                <div className="input-group-append">
                                                    <span className="input-group-text" onClick={() => setShowPassword(!showPassword)} style={{cursor: 'pointer'}}>
                                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group col-6">
                                            <label htmlFor="mobile">Mobile Number</label>
                                            <input onChange={inputEvent} value={formData.mobile} type="text" className="form-control" name="mobile" required />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="form-group col-6">
                                            <label>Father's Name</label>
                                            <input onChange={inputEvent} value={formData.fatherName} type="text" className="form-control" name="fatherName" />
                                        </div>
                                        <div className="form-group col-6">
                                            <label>Mother's Name</label>
                                            <input onChange={inputEvent} value={formData.motherName} type="text" className="form-control" name="motherName" />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Present Address</label>
                                        <input onChange={inputEvent} value={formData.presentAddress} type="text" className="form-control" name="presentAddress" />
                                    </div>

                                    <div className="row">
                                        <div className="form-group col-6">
                                            <label>NID Number</label>
                                            <input onChange={inputEvent} value={formData.nid} type="text" className="form-control" name="nid" placeholder="Enter NID Number" />
                                        </div>
                                        <div className="form-group col-6">
                                            <label>Blood Group</label>
                                            <select onChange={inputEvent} value={formData.bloodGroup} className="form-control" name="bloodGroup">
                                                <option value="">Select Blood Group</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                            </select>
                                        </div>
                                    </div>



                                    <div className="form-group">
                                        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
                                            {submitting ? 'Registering...' : 'Register & Create Account'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RegisterInvited;

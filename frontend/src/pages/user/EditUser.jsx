import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useHistory } from "react-router";
import { toast } from "react-toastify";
import HeaderSection from "../../components/HeaderSection";
import { updateUser, getUser, backendUrl } from "../../http";
import { getFileUrl } from "../../utils/fileUtil";
import Modal from '../../components/modal/Modal';

const EditUser = () => {
    const { user: currentUser } = useSelector((state) => state.authSlice);
    const isAdmin = ['super_admin', 'sub_admin'].includes(currentUser?.type);

    const initialState = {
        name: '',
        email: '',
        mobile: '',
        password: '',
        type: '',
        address: '',
        profile: '',
        status: '',
        fatherName: '',
        motherName: '',
        presentAddress: '',
        permanentAddress: '',
        employeeId: '',
        village: '',
        union: '',
        district: '',
        nid: '',
        bloodGroup: ''
    };
    const [imagePreview, setImagePreview] = useState('/assets/icons/user.png');
    const [formData, setFormData] = useState(initialState);
    const [showModal, setShowModal] = useState(false);
    const [updateFormData, setUpdatedFormData] = useState({});
    const [originalFormData, setOriginalFormData] = useState(initialState);
    const [showPassword, setShowPassword] = useState(false);
    const [showAdminPassword, setShowAdminPassword] = useState(false);
 // Track original data

    const [userType, setUserType] = useState('User');

    const { id } = useParams();
    const history = useHistory();

    useEffect(() => {
        (async () => {
            const res = await getUser(id);
            if (res.success) {
                setUserType(res.data.type);
                setFormData(res.data);
                setOriginalFormData(res.data); // Store original data
                
                let img = getFileUrl(res.data.image);
                setImagePreview(img);
            }
        })();
    }, [id])

    const inputEvent = (e) => {
        const { name, value } = e.target;
        setFormData((old) => {
            return {
                ...old,
                [name]: value
            }

        });

        // Only add to updateFormData if value actually changed from original
        if (name === 'type') {
            // For type changes, check if it's different from original
            if (value.toLowerCase() !== originalFormData.type?.toLowerCase()) {
                setUpdatedFormData((old) => {
                    return {
                        ...old,
                        [name]: value
                    }
                });
            } else {
                // Remove type from updateFormData if it's back to original
                setUpdatedFormData((old) => {
                    const { type, ...rest } = old;
                    return rest;
                });
            }
        } else {
            setUpdatedFormData((old) => {
                return {
                    ...old,
                    [name]: value
                }
            });
        }
    }



    const onSubmit = async (e) => {
        e.preventDefault();
        console.log('=== UPDATE USER SUBMIT ===');
        console.log('Original type:', originalFormData.type);
        console.log('Current type in form:', formData.type);
        console.log('Type in updateFormData:', updateFormData.type);
        console.log('Full updateFormData:', updateFormData);

        if (updateFormData.type && !showModal) return setShowModal(true);

        const fd = new FormData();
        Object.keys(updateFormData).map((key) => {
            return fd.append(key, updateFormData[key]);
        })

        console.log('FormData keys:', Array.from(fd.keys()));
        console.log('FormData type value:', fd.get('type'));

        const { success, message } = await updateUser(id, fd);
        console.log("Update User:", message)

        if (success) {
            toast.success(message);
            setShowModal(false); // Close modal if open
            console.log('✅ Type change persisted to MongoDB, redirecting...');

            // Redirect to employees list - role pages will fetch fresh data on mount
            setTimeout(() => {
                history.push('/employees');
            }, 500);
        } else {
            toast.error(message);
        }
    }

    const captureImage = (e) => {
        const file = e.target.files[0];
        setFormData((old) => {
            return {
                ...old,
                profile: file
            }

        })

        setUpdatedFormData((old) => {
            return {
                ...old,
                profile: file
            }

        })
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setImagePreview(reader.result);
        }
    }
    const modalAction = () => setShowModal(showModal ? false : true);

    return (
        <div className="main-content">
            {showModal && (
                <Modal close={modalAction} title="Confirm Authority Reclassification" width='50%'>
                    <div className="p-4">
                        <div className="row align-items-center mb-4 p-4 bg-light-soft rounded-xl border border-light">
                            <div className="col-md-3 text-center">
                                <img className='rounded-circle shadow-lg border border-4 border-white' src={imagePreview} width='100' height='100' style={{objectFit: 'cover'}} alt="" />
                            </div>
                            <div className="col-md-9 border-left ps-4">
                                <h5 className="font-weight-bold text-dark mb-1">{formData.name}</h5>
                                <p className="text-muted small mb-3">{formData.email}</p>
                                <div className="d-flex gap-3 align-items-center">
                                    <div className="badge bg-light text-muted border px-3 py-1 rounded-pill">
                                        From: <span className="font-weight-bold ml-1">{originalFormData.type}</span>
                                    </div>
                                    <i className="fas fa-arrow-right text-primary opacity-50"></i>
                                    <div className="badge bg-success-soft text-success px-3 py-1 rounded-pill">
                                        To: <span className="font-weight-bold ml-1">{formData.type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="form-group mb-4">
                            <label className="font-weight-bold text-dark mb-2">Security Verification Required</label>
                            <div className="input-group search-element">
                                <div className="input-group-prepend">
                                    <div className="input-group-text bg-light border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                        <i className="fas fa-shield-alt text-primary opacity-50"></i>
                                    </div>
                                </div>
                                <input
                                    onChange={(e) => {
                                        setFormData((old) => ({ ...old, adminPassword: e.target.value }));
                                        setUpdatedFormData((old) => ({ ...old, adminPassword: e.target.value }));
                                    }}
                                    value={formData.adminPassword || ''}
                                    type={showAdminPassword ? "text" : "password"}
                                    placeholder="Enter your administrative credentials to confirm"
                                    className="form-control border-left-0"
                                    style={{ borderRadius: '0', height: '50px' }}
                                    autoFocus
                                />
                                <div className="input-group-append">
                                    <span className="input-group-text bg-light border-left-0 cursor-pointer" 
                                          onClick={() => setShowAdminPassword(!showAdminPassword)} style={{ borderRadius: '0 12px 12px 0' }}>
                                        <i className={`fas ${showAdminPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-3 mt-4">
                            <button className='btn btn-light rounded-pill px-4 font-weight-bold' type='button' onClick={modalAction}>Cancel</button>
                            <button className='btn btn-primary rounded-pill px-4 shadow-lg font-weight-bold' type='submit' form='updateUserForm'>
                                Confirm Reclassification
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            <section className="section">
                {/* Page Header */}
                <div className="glass-card mb-4 p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="font-weight-bold text-dark mb-1">Edit {userType} Profile</h3>
                        <p className="text-muted mb-0">Modify organizational credentials and professional configuration for system members</p>
                    </div>
                </div>

                <div className="glass-card border-0 shadow-lg overflow-hidden">
                    <div className="card-header bg-white border-bottom py-3">
                        <h5 className="mb-0 font-weight-bold text-dark">
                            <i className="fas fa-user-edit mr-2 text-primary"></i> Administrative Controls
                        </h5>
                    </div>
                    <div className="card-body p-4 p-lg-5">
                        <form className='row g-4' onSubmit={onSubmit} id='updateUserForm'>
                            {/* Avatar Section */}
                            <div className="col-12 text-center mb-5">
                                <div className="position-relative d-inline-block">
                                    <input type="file" id='profile' name='profile' className="form-control d-none" onChange={captureImage} accept="image/*" />
                                    <label htmlFor='profile' className="cursor-pointer d-block">
                                        <div className="avatar-preview shadow-xl border border-4 border-white rounded-circle overflow-hidden mx-auto position-relative" 
                                             style={{ width: '130px', height: '130px', transition: 'transform 0.3s ease' }}>
                                            <img className='w-100 h-100 object-fit-cover' src={imagePreview} alt="" />
                                            <div className="avatar-overlay position-absolute w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 opacity-0 transition-opacity" 
                                                 style={{ top: 0, left: 0 }}>
                                                <i className="fas fa-camera text-white fa-2x"></i>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-primary font-weight-bold small">
                                            <i className="fas fa-sync-alt mr-2"></i> Update Profile Image
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {isAdmin && (
                                <div className="col-md-12 mb-4">
                                    <label className="font-weight-bold text-dark mb-2">Unique Employee ID (RACO-YYYY-RAND)</label>
                                    <div className="input-group search-element">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text bg-light-soft border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                                <i className="fas fa-id-badge text-primary opacity-50"></i>
                                            </div>
                                        </div>
                                        <input onChange={inputEvent} value={formData.employeeId} type="text" name='employeeId' 
                                               className="form-control border-left-0" style={{ borderRadius: '0 12px 12px 0', height: '50px' }} />
                                    </div>
                                    <small className="text-muted ml-2">Format: RACO-YEAR-NUMBER (Must be unique)</small>
                                </div>
                            )}

                            <div className="col-md-4 mb-4">
                                <label className="font-weight-bold text-dark mb-2">Name</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light-soft border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-user text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input onChange={inputEvent} value={formData.name} type="text" name='name' 
                                           className="form-control border-left-0" style={{ borderRadius: '0 12px 12px 0', height: '50px' }} />
                                </div>
                            </div>

                            <div className="col-md-4 mb-4">
                                <label className="font-weight-bold text-dark mb-2">Email</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light-soft border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-envelope text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input onChange={inputEvent} value={formData.email} type="email" name='email' 
                                           className="form-control border-left-0" style={{ borderRadius: '0 12px 12px 0', height: '50px' }} />
                                </div>
                            </div>

                            <div className="col-md-4 mb-4">
                                <label className="font-weight-bold text-dark mb-2">Username</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light-soft border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-user-circle text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input onChange={inputEvent} value={formData.username} type="text" name='username' 
                                           className="form-control border-left-0" style={{ borderRadius: '0 12px 12px 0', height: '50px' }} />
                                </div>
                            </div>

                            <div className="col-md-6 mb-4">
                                <label className="font-weight-bold text-dark mb-2">Mobile Contact</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light-soft border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-phone text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input onChange={inputEvent} value={formData.mobile} type="tel" name='mobile' 
                                           className="form-control border-left-0" style={{ borderRadius: '0 12px 12px 0', height: '50px' }} />
                                </div>
                            </div>

                            <div className="col-md-6 mb-4">
                                <label className="font-weight-bold text-dark mb-2">Secret Code (Optional)</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light-soft border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-lock text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input onChange={inputEvent} value={formData.password} type={showPassword ? "text" : "password"} name='password' 
                                           className="form-control border-left-0" placeholder="New Secret Password" 
                                           style={{ borderRadius: '0', height: '50px' }} />
                                    <div className="input-group-append">
                                        <span className="input-group-text bg-light-soft border-left-0 cursor-pointer" 
                                              onClick={() => setShowPassword(!showPassword)} style={{ borderRadius: '0 12px 12px 0' }}>
                                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6 mb-4">
                                <label className="font-weight-bold text-dark mb-2">
                                    Classification Role
                                </label>
                                <input 
                                    className="form-control search-element px-4 font-weight-bold text-dark" 
                                    style={{ borderRadius: '12px', height: '55px', border: 'none', background: '#f8f9fa' }}
                                    value={formData.type}
                                    readOnly
                                    disabled
                                />
                                <small className="text-muted ml-2">Role cannot be changed after invitation</small>
                            </div>

                            <div className="col-md-6 mb-4">
                                <label className="font-weight-bold text-dark mb-2">Governance Status</label>
                                <select name='status' onChange={inputEvent} value={formData.status} 
                                        className="form-control search-element px-4 font-weight-bold text-dark" style={{ borderRadius: '12px', height: '55px', border: 'none', background: '#f8f9fa' }}>
                                    <option value="active">Active Authority</option>
                                    <option value="banned">Banned/Suspended</option>
                                </select>
                            </div>

                            <div className="col-md-6 mb-4">
                                <label className="font-weight-bold text-dark mb-2">NID Identifier</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light-soft border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-id-card text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input onChange={inputEvent} value={formData.nid} type="text" name='nid' 
                                           className="form-control border-left-0" style={{ borderRadius: '0 12px 12px 0', height: '50px' }} />
                                </div>
                            </div>

                            <div className="col-md-6 mb-4">
                                <label className="font-weight-bold text-dark mb-2">Blood Group Titer</label>
                                <select name='bloodGroup' onChange={inputEvent} value={formData.bloodGroup} 
                                        className="form-control search-element px-4 font-weight-bold text-dark" style={{ borderRadius: '12px', height: '55px', border: 'none', background: '#f8f9fa' }}>
                                    <option value="">Undisclosed</option>
                                    <option value="A+">A Positive (+)</option>
                                    <option value="A-">A Negative (-)</option>
                                    <option value="B+">B Positive (+)</option>
                                    <option value="B-">B Negative (-)</option>
                                    <option value="AB+">AB Positive (+)</option>
                                    <option value="AB-">AB Negative (-)</option>
                                    <option value="O+">O Positive (+)</option>
                                    <option value="O-">O Negative (-)</option>
                                </select>
                            </div>

                            <div className="col-md-12 mb-4">
                                <label className="font-weight-bold text-dark mb-2">Permanent  Address</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light-soft border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-map-marker-alt text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input onChange={inputEvent} value={formData.permanentAddress || formData.address} type="text" name='permanentAddress' 
                                           className="form-control border-left-0" style={{ borderRadius: '0 12px 12px 0', height: '50px' }} />
                                </div>
                            </div>

                            <div className="col-md-12 mb-4">
                                <label className="font-weight-bold text-dark mb-2">Present Address</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light-soft border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-home text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input onChange={inputEvent} value={formData.presentAddress} type="text" name='presentAddress' 
                                           className="form-control border-left-0" style={{ borderRadius: '0 12px 12px 0', height: '50px' }} />
                                </div>
                            </div>

                            <div className="col-md-6 mb-4">
                                <label className="font-weight-bold text-dark mb-2">Father Name</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light-soft border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-user-friends text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input onChange={inputEvent} value={formData.fatherName} type="text" name='fatherName' 
                                           className="form-control border-left-0" style={{ borderRadius: '0 12px 12px 0', height: '50px' }} />
                                </div>
                            </div>

                            <div className="col-md-6 mb-4">
                                <label className="font-weight-bold text-dark mb-2">Mother Name</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light-soft border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-user-friends text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input onChange={inputEvent} value={formData.motherName} type="text" name='motherName' 
                                           className="form-control border-left-0" style={{ borderRadius: '0 12px 12px 0', height: '50px' }} />
                                </div>
                            </div>

                            <div className="col-12 mt-5 text-right">
                                <button className='btn btn-primary btn-lg rounded-pill px-5 shadow-lg hover-lift font-weight-bold' type='submit' 
                                        style={{ height: '55px' }}>
                                    <i className="fas fa-check-circle mr-2"></i> Update Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default EditUser;

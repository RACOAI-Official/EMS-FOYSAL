import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateSelfUser, backendUrl } from '../../http';
import { getFileUrl } from '../../utils/fileUtil';
import { toast } from "react-toastify";
import HeaderSection from "../../components/HeaderSection";
import { setAuth } from '../../store/auth-slice';

const Profile = () => {
    const { user } = useSelector((state) => state.authSlice);
    const dispatch = useDispatch();
    const [imagePreview, setImagePreview] = useState('/assets/icons/user.png');
    
    const initialState = {
        name: '',
        email: '',
        mobile: '',
        password: '',
        address: '',
        profile: '',
        fatherName: '',
        motherName: '',
        presentAddress: '',
        village: '',
        union: '',
        district: ''
    };
    
    const [formData, setFormData] = useState(initialState);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                ...initialState,
                ...user,
                password: '' // Don't show hash
            });
            
            let img = getFileUrl(user.image);
            if(img) setImagePreview(img);
        }
    }, [user]);

    const inputEvent = (e) => {
        const { name, value } = e.target;
        setFormData((old) => ({
            ...old,
            [name]: value
        }));
    }

    const captureImage = (e) => {
        const file = e.target.files[0];
        setFormData((old) => ({
            ...old,
            profile: file
        }));
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setImagePreview(reader.result);
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        
        const fd = new FormData();
        // Only append fields that are relevant for self-update
        const allowedFields = ['name', 'email', 'mobile', 'password', 'address', 'fatherName', 'motherName', 'presentAddress', 'village', 'union', 'district'];
        
        allowedFields.forEach(field => {
             if (formData[field]) {
                fd.append(field, formData[field]);
             }
        });

        if (formData.profile) {
            fd.append('profile', formData.profile);
        }

        try {
            const { success, message, data } = await updateSelfUser(fd);
            if (success) {
                toast.success(message);
                // Update redux state with new user data
                dispatch(setAuth({ user: data }));
            } else {
                toast.error(message);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile");
        }
    }

    return (
        <div className="main-content">
            <section className="section">
                {/* Page Header */}
                <div className="glass-card mb-4 p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="font-weight-bold text-dark mb-1">Account Settings</h3>
                        <p className="text-muted mb-0">Manage your personal credentials, professional profile, and security preferences</p>
                    </div>
                </div>

                <div className="glass-card border-0 shadow-lg overflow-hidden">
                    <div className="card-header bg-white border-bottom py-3">
                        <h5 className="mb-0 font-weight-bold text-dark">
                            <i className="fas fa-user-circle mr-2 text-primary"></i> Profile Information
                        </h5>
                    </div>
                    <div className="card-body p-4 p-lg-5">
                        <form className='row g-4' onSubmit={onSubmit}>
                            {/* Avatar Section */}
                            <div className="col-12 text-center mb-5">
                                <div className="position-relative d-inline-block">
                                    <input type="file" id='profile' name='profile' className="form-control d-none" onChange={captureImage} accept="image/*" />
                                    <label htmlFor='profile' className="cursor-pointer d-block">
                                        <div className="avatar-preview shadow-xl border border-4 border-white rounded-circle overflow-hidden mx-auto position-relative" 
                                             style={{ width: '150px', height: '150px', transition: 'transform 0.3s ease' }}>
                                            <img className='w-100 h-100 object-fit-cover' src={imagePreview} alt="Profile" />
                                            <div className="avatar-overlay position-absolute w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 opacity-0 transition-opacity" 
                                                 style={{ top: 0, left: 0 }}>
                                                <i className="fas fa-camera text-white fa-2x"></i>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-primary font-weight-bold">
                                            <i className="fas fa-cloud-upload-alt mr-2"></i> Update Profile Image
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <label className="font-weight-bold text-dark mb-2">Display Name</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-user text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input onChange={inputEvent} value={formData.name} type="text" name='name' 
                                           className="form-control border-left-0" style={{ borderRadius: '0 12px 12px 0', height: '50px' }} />
                                </div>
                            </div>

                            <div className="col-md-4">
                                <label className="font-weight-bold text-dark mb-2">Professional Email</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-envelope text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input onChange={inputEvent} value={formData.email} type="email" name='email' 
                                           className="form-control border-left-0" style={{ borderRadius: '0 12px 12px 0', height: '50px' }} />
                                </div>
                            </div>

                            <div className="col-md-4">
                                <label className="font-weight-bold text-dark mb-2">Organization Role</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-id-badge text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input value={user?.type || ''} type="text" className="form-control border-left-0 bg-light-soft" 
                                           style={{ borderRadius: '0 12px 12px 0', height: '50px' }} disabled />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label className="font-weight-bold text-dark mb-2">Contact Mobile</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-phone text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input onChange={inputEvent} value={formData.mobile} type="tel" name='mobile' 
                                           className="form-control border-left-0" style={{ borderRadius: '0 12px 12px 0', height: '50px' }} />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label className="font-weight-bold text-dark mb-2">Update Security Code (Optional)</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-lock text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input onChange={inputEvent} value={formData.password} type={showPassword ? "text" : "password"} name='password' 
                                           className="form-control border-left-0" placeholder="New Secret Password" 
                                           style={{ borderRadius: '0', height: '50px' }} />
                                    <div className="input-group-append">
                                        <span className="input-group-text bg-light border-left-0 cursor-pointer" 
                                              onClick={() => setShowPassword(!showPassword)} style={{ borderRadius: '0 12px 12px 0' }}>
                                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-12">
                                <label className="font-weight-bold text-dark mb-2">Permanent Domicile Address</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-map-marker-alt text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input onChange={inputEvent} value={formData.address} type="text" name='address' 
                                           className="form-control border-left-0" style={{ borderRadius: '0 12px 12px 0', height: '50px' }} />
                                </div>
                            </div>

                            <div className="col-md-12">
                                <label className="font-weight-bold text-dark mb-2">Current Residence Address</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-home text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input onChange={inputEvent} value={formData.presentAddress} type="text" name='presentAddress' 
                                           className="form-control border-left-0" style={{ borderRadius: '0 12px 12px 0', height: '50px' }} />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label className="font-weight-bold text-dark mb-2">Paternal Cognomen (Father's Name)</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-user-friends text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input onChange={inputEvent} value={formData.fatherName} type="text" name='fatherName' 
                                           className="form-control border-left-0" style={{ borderRadius: '0 12px 12px 0', height: '50px' }} />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label className="font-weight-bold text-dark mb-2">Maternal Cognomen (Mother's Name)</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
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
                                    <i className="fas fa-check-circle mr-2"></i> Commit Account Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Profile;

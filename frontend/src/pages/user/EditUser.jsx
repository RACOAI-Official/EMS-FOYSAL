import { useEffect } from "react";
import { useState } from "react";
import { useParams, useHistory } from "react-router";
import { toast } from "react-toastify";
import HeaderSection from "../../components/HeaderSection";
import { updateUser, getUser } from "../../http";
import Modal from '../../components/modal/Modal';

const EditUser = () => {
    const initialState = {
        name: '',
        email: '',
        mobile: '',
        password: '',
        type: '',
        address: '',
        profile: '',
        status: ''
    };
    const [imagePreview, setImagePreview] = useState('/assets/icons/user.png');
    const [formData, setFormData] = useState(initialState);
    const [showModal, setShowModal] = useState(false);
    const [updateFormData, setUpdatedFormData] = useState({});
    const [originalFormData, setOriginalFormData] = useState(initialState); // Track original data

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
                setImagePreview(res.data.image);
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
        <>
            {
                showModal &&
                <Modal close={modalAction} title="Confirm User Type Change" width='40%'>
                    <div className="row" style={{ margin: '20px' }}>
                        <div className="col col-md-4">
                            <div className="input-group justify-content-center text-center">
                                <img className='rounded' src={imagePreview} width='120' alt="" />
                            </div>
                        </div>
                        <div className="col col-md-8">
                            <table className='table table-md'>
                                <tbody>
                                    <tr>
                                        <th>Name</th>
                                        <td>{formData.name}</td>
                                    </tr>
                                    <tr>
                                        <th>Email</th>
                                        <td>{formData.email}</td>
                                    </tr>
                                    <tr>
                                        <th>Current Type</th>
                                        <td><span className="badge badge-info">{originalFormData.type}</span></td>
                                    </tr>
                                    <tr>
                                        <th>New Type</th>
                                        <td><span className="badge badge-success">{formData.type}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="form-group col-md-12">
                        <label>Enter Your Password (Admin)</label>
                        <div className="input-group">
                            <div className="input-group-prepend">
                                <div className="input-group-text">
                                    <i className="fas fa-lock"></i>
                                </div>
                            </div>
                            <input
                                onChange={(e) => {
                                    setFormData((old) => ({ ...old, adminPassword: e.target.value }));
                                    setUpdatedFormData((old) => ({ ...old, adminPassword: e.target.value }));
                                }}
                                value={formData.adminPassword || ''}
                                type="password"
                                placeholder={`Enter Your Password To Change ${formData.name}'s Type to ${formData.type}`}
                                id='adminPassword'
                                name='adminPassword'
                                className="form-control"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="justify-content-center text-center mb-3">
                        <button className='btn btn-secondary btn-md me-2' type='button' onClick={modalAction} style={{ width: '20vh', marginRight: '10px' }}>Cancel</button>
                        <button className='btn btn-primary btn-md' type='submit' form='updateUserForm' style={{ width: '20vh' }}>Confirm Change</button>
                    </div>
                </Modal>
            }
            <div className="main-content">
                <section className="section">
                    <HeaderSection title={`Edit ${userType}`} />
                    <div className="card">
                        <div className="card-body pr-5 pl-5 m-1">
                            <form className='row' onSubmit={onSubmit} id='updateUserForm'>
                                <div className="form-group col-md-12 text-center">
                                    <div className="input-group justify-content-center">
                                        <input type="file" id='profile' name='profile' className="form-control d-none" onChange={captureImage} accept="image/*" />
                                        <label htmlFor='profile'> <img className='rounded' src={imagePreview} width='120' alt="" /> </label>
                                    </div>
                                </div>

                                <div className="form-group col-md-4">
                                    <label>Enter Name</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text">
                                                <i className="fas fa-user"></i>
                                            </div>
                                        </div>
                                        <input onChange={inputEvent} value={formData.name} type="text" id='name' name='name' className="form-control" />
                                    </div>
                                </div>

                                <div className="form-group col-md-4">
                                    <label>Enter Email</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text">
                                                <i className="fas fa-envelope"></i>
                                            </div>
                                        </div>
                                        <input onChange={inputEvent} value={formData.email} type="email" id='email' name='email' className="form-control" />
                                    </div>
                                </div>

                                <div className="form-group col-md-4">
                                    <label>Enter Username</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text">
                                                <i className="fas fa-user-circle"></i>
                                            </div>
                                        </div>
                                        <input onChange={inputEvent} value={formData.username} type="username" id='username' name='username' className="form-control" />
                                    </div>
                                </div>

                                <div className="form-group col-md-3">
                                    <label>Enter Mobile Number</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text">
                                                <i className="fas fa-phone"></i>
                                            </div>
                                        </div>
                                        <input onChange={inputEvent} value={formData.mobile} type="tel" id='mobile' name='mobile' className="form-control" />
                                    </div>
                                </div>

                                <div className="form-group col-md-3">
                                    <label>Enter Password</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text">
                                                <i className="fas fa-lock"></i>
                                            </div>
                                        </div>
                                        <input onChange={inputEvent} value={formData.password} type="password" id='password' name='password' className="form-control" />
                                    </div>
                                </div>

                                <div className="form-group col-md-3">
                                    <label>User Type {formData.type !== originalFormData.type && <span className="text-warning">⚠ Changed</span>}</label>
                                    <select name='type' onChange={inputEvent} value={formData.type} className="form-control select2">
                                        <option value="Employee">Employee</option>
                                        <option value="Leader">Leader</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                    {formData.type !== originalFormData.type && (
                                        <small className="form-text text-warning">
                                            Changing from <strong>{originalFormData.type}</strong> to <strong>{formData.type}</strong> requires admin password
                                        </small>
                                    )}
                                </div>

                                <div className="form-group col-md-3">
                                    <label>User Status</label>
                                    <select name='status' onChange={inputEvent} value={formData.status} className="form-control select2">
                                        <option value="active">Active</option>
                                        <option value="banned">Banned</option>
                                    </select>
                                </div>

                                <div className="form-group col-md-12 ">
                                    <label>Enter Address</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text">
                                                <i className="fas fa-map-marker-alt"></i>
                                            </div>
                                        </div>
                                        <input onChange={inputEvent} value={formData.address} type="text" id='address' name='address' className="form-control" />
                                    </div>
                                </div>

                                <div className="form-group text-center col-md-12">
                                    <button className='btn btn-primary btn-lg' type='submit' style={{ width: '30vh' }}>Update {userType}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}

export default EditUser;
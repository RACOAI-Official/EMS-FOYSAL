import { useState } from "react";
import { toast } from "react-toastify";
import HeaderSection from "../../components/HeaderSection";
import { addUser } from "../../http";

const AddLeader = () => {
    const [imagePreview, setImagePreview] = useState('/assets/icons/user.png');
    const initialState = {
        name: '', email: '', mobile: '', password: '', 
        type: 'Leader', address: '', profile: ''
    };
    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);

    const inputEvent = (e) => {
        const { name, value, files } = e.target;
        if (name === 'profile') {
            const file = files[0];
            setFormData(old => ({ ...old, profile: file }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            if (file) reader.readAsDataURL(file);
        } else {
            setFormData((old) => ({
                ...old,
                [name]: value
            }));
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const { name, email, mobile, password, type, address, profile } = formData;

        if (!name || !email || !mobile || !password || !type || !address || !profile) {
            return toast.error('All fields are required');
        }

        setLoading(true);
        try {
            const fd = new FormData();
            Object.keys(formData).forEach(key => {
                fd.append(key, formData[key]);
            });

            const res = await addUser(fd);
            if (res.success) {
                toast.success("Leader Added Successfully!");
                setFormData(initialState);
                setImagePreview('/assets/icons/user.png');
            } else {
                toast.error(res.message || "Failed to add leader");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-content">
            <section className="section">
                <HeaderSection title='Add Leader' />
                <div className="card">
                    <div className="card-header">
                        <h4>Create New Leader</h4>
                    </div>
                    <div className="card-body pr-5 pl-5 m-1">
                        <form className='row' onSubmit={onSubmit}>
                            <div className="form-group col-md-12 text-center">
                                <figure className="avatar avatar-xl mr-3">
                                    <img src={imagePreview} alt="User" />
                                </figure>
                                <div className="mt-3">
                                    <input type="file" name="profile" onChange={inputEvent} accept="image/*" />
                                </div>
                            </div>

                            <div className="form-group col-md-6">
                                <label>Name</label>
                                <input onChange={inputEvent} value={formData.name} type="text" name='name' className="form-control" required />
                            </div>

                            <div className="form-group col-md-6">
                                <label>Email</label>
                                <input onChange={inputEvent} value={formData.email} type="email" name='email' className="form-control" required />
                            </div>

                            <div className="form-group col-md-6">
                                <label>Mobile</label>
                                <input onChange={inputEvent} value={formData.mobile} type="text" name='mobile' className="form-control" required />
                            </div>

                            <div className="form-group col-md-6">
                                <label>Password</label>
                                <input onChange={inputEvent} value={formData.password} type="password" name='password' className="form-control" required />
                            </div>

                            <div className="form-group col-md-12">
                                <label>Address</label>
                                <textarea onChange={inputEvent} value={formData.address} name='address' className="form-control" rows="2" required></textarea>
                            </div>

                            <div className="form-group text-center col-md-12">
                                <button className='btn btn-primary btn-lg' type='submit' disabled={loading} style={{ width: '30vh' }}>
                                    {loading ? 'Adding...' : 'Add Leader'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AddLeader;

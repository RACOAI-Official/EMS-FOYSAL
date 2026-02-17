import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateSelfUser } from '../../http';
import { getFileUrl } from '../../utils/fileUtil';
import { toast } from 'react-toastify';
import { setAuth } from '../../store/auth-slice';

const initialState = {
  name: '',
  email: '',
  mobile: '',
  password: '',
  address: '',
  image: null,
  fatherName: '',
  motherName: '',
  presentAddress: '',
  village: '',
  union: '',
  district: ''
};

const Profile = () => {
  const { user } = useSelector((state) => state.authSlice);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState(initialState);
  const [imagePreview, setImagePreview] = useState('/assets/icons/user.png');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFormData({ ...initialState, ...user, password: '' });
    if (user.image) setImagePreview(getFileUrl(user.image));
  }, [user]);

  const inputEvent = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const captureImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, GIF, WEBP allowed');
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const fd = new FormData();
    const allowedFields = Object.keys(initialState).filter((k) => k !== 'image');

    allowedFields.forEach((field) => {
      if (formData[field]?.toString().trim()) fd.append(field, formData[field]);
    });

    if (formData.image) fd.append('image', formData.image);

    try {
      setLoading(true);
      const res = await updateSelfUser(fd);
      const { success, message, user: updatedUser, data } = res;
      const userData = updatedUser || data;

      if (!success || !userData) {
        toast.error(message || 'Failed to update profile');
        return;
      }

      toast.success(message || 'Profile updated successfully');
      dispatch(setAuth(userData));
      if (userData.image) setImagePreview(getFileUrl(userData.image));
    } catch (error) {
      console.error('❌ Profile update error:', error);
      toast.error(error.response?.data?.message || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <section className="section">

        <div className="glass-card mb-4 p-4">
          <h3 className="font-weight-bold mb-1">Account Settings</h3>
          <p className="text-muted">Manage your profile information</p>
        </div>

        <div className="glass-card shadow-lg">
          <div className="card-body p-4 p-lg-5">
            <form className="row g-4" onSubmit={onSubmit}>

              {/* Avatar */}
              <div className="col-12 text-center mb-4">
                <input
                  type="file"
                  id="profileImage"
                  className="d-none"
                  accept="image/*"
                  onChange={captureImage}
                />
                <label htmlFor="profileImage" className="cursor-pointer">
                  <div className="rounded-circle overflow-hidden mx-auto" style={{ width: 150, height: 150 }}>
                    <img src={imagePreview} alt="Profile" className="w-100 h-100 object-fit-cover" />
                  </div>
                  <div className="mt-2 text-primary">Update Profile Image</div>
                </label>
              </div>

              {/* Inputs */}
              {[
                { label: 'Name', name: 'name', type: 'text' },
                { label: 'Email', name: 'email', type: 'email' },
                { label: 'Mobile', name: 'mobile', type: 'tel' },
                { label: 'Password', name: 'password', type: showPassword ? 'text' : 'password' },
                { label: 'Address', name: 'address', type: 'text' },
                { label: "Father's Name", name: 'fatherName', type: 'text' },
                { label: "Mother's Name", name: 'motherName', type: 'text' },
                { label: 'Present Address', name: 'presentAddress', type: 'text' },
                { label: 'Village', name: 'village', type: 'text' },
                { label: 'Union', name: 'union', type: 'text' },
                { label: 'District', name: 'district', type: 'text' }
              ].map((field) => (
                <div className="col-md-6" key={field.name}>
                  <label>{field.label}</label>
                  <input
                    className="form-control"
                    {...field}
                    value={formData[field.name]}
                    onChange={inputEvent}
                  />
                  {field.name === 'password' && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary mt-1"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>
              ))}

              <div className="col-12 text-end mt-4">
                <button className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
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

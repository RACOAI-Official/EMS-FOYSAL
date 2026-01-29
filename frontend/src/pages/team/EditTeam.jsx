import { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import HeaderSection from "../../components/HeaderSection";
import { getTeam, updateTeam, backendUrl } from "../../http";
import { getFileUrl } from "../../utils/fileUtil";

const EditTeam = () =>
{
    const [imagePreview, setImagePreview] = useState('/assets/icons/team.png');
    const [formData,setFormData] = useState({
        name:'',
        description:'',
        image:'',
        status:'',
        isFavorite: false,
        progress: 0,
        progressNote: ''
    });

    const [updateFormData,setUpdatedFormData] = useState({});
    
    const {id} = useParams();
    const history = useHistory();

    useEffect(()=>{
        (async () =>{
            const res = await getTeam(id);
            if(res.success)
            {
                setFormData(res.data);
                setImagePreview(getFileUrl(res.data.image))
            }
        })();
    },[id])

    const inputEvent = (e) =>
    {
        const {name,value} = e.target;
        setFormData((old)=>
        {
            return{
                ...old,
                [name]:value
            }

        })

        setUpdatedFormData((old)=>
        {
            return{
                ...old,
                [name]:value
            }
        })
    }

    const onSubmit = async (e) =>
    {
        e.preventDefault();

        const {name,description} = formData;
        if(!name || !description) return toast.error('All Fields Required');

        const fd = new FormData();
        Object.keys(updateFormData).map((key)=>
        {
            return fd.append(key,updateFormData[key]);
        })
        const res = await updateTeam(id,fd);
        if(res.success){
            toast.success(res.message);
            // Redirect to team detail after successful update
            history.push(`/team/${id}`);
        }
    }

    const captureImage = (e) =>
    {
        const file = e.target.files[0];
        setFormData((old)=>
        {
            return{
                ...old,
                image:file
            }
        })

        setUpdatedFormData((old)=>
        {
            return{
                ...old,
                image:file
            }
        })
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () =>
        {
            setImagePreview(reader.result);
        }
    }

    return (
        <div className="main-content">
            <section className="section">
                {/* Page Header */}
                <div className="glass-card mb-4 p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="font-weight-bold text-dark mb-1">Edit Team Configuration</h3>
                        <p className="text-muted mb-0">Modify organizational units, mission objectives, and performance benchmarks</p>
                    </div>
                </div>

                <div className="glass-card border-0 shadow-lg overflow-hidden">
                    <div className="card-header bg-white border-bottom py-3">
                        <h5 className="mb-0 font-weight-bold text-dark">
                            <i className="fas fa-users-cog mr-2 text-primary"></i> Team Governance
                        </h5>
                    </div>
                    <div className="card-body p-4 p-lg-5">
                        <form className='row g-4' onSubmit={onSubmit}>
                            {/* Avatar Section */}
                            <div className="col-12 text-center mb-5">
                                <div className="position-relative d-inline-block">
                                    <input type="file" id='image' name='image' className="form-control d-none" onChange={captureImage} accept="image/*" />
                                    <label htmlFor='image' className="cursor-pointer d-block">
                                        <div className="avatar-preview shadow-xl border border-4 border-white rounded-circle overflow-hidden mx-auto position-relative" 
                                             style={{ width: '130px', height: '130px', transition: 'transform 0.3s ease' }}>
                                            <img className='w-100 h-100 object-fit-cover' src={imagePreview} alt="" />
                                            <div className="avatar-overlay position-absolute w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 opacity-0 transition-opacity" 
                                                 style={{ top: 0, left: 0 }}>
                                                <i className="fas fa-camera text-white fa-2x"></i>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-primary font-weight-bold small">
                                            <i className="fas fa-sync-alt mr-2"></i> Update Team Logo
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="col-md-6 mb-4">
                                <label className="font-weight-bold text-dark mb-2">Team Designation</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light-soft border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-users text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input onChange={inputEvent} value={formData.name} type="text" name='name' 
                                           className="form-control border-left-0" style={{ borderRadius: '0 12px 12px 0', height: '50px' }} />
                                </div>
                            </div>

                            <div className="col-md-6 mb-4">
                                <label className="font-weight-bold text-dark mb-2">Operational Status</label>
                                <select name='status' onChange={inputEvent} value={formData.status} 
                                        className="form-control search-element px-4 font-weight-bold text-dark" style={{ borderRadius: '12px', height: '55px', border: 'none', background: '#f8f9fa' }}>
                                    <option value="Active">Active Operations</option>
                                    <option value="Banned">Suspended</option>
                                    <option value="Expired">Decommissioned</option>
                                    <option value="Deleted">Archived</option>
                                </select>
                            </div>

                            <div className="col-12 mb-4">
                                <div className="p-4 bg-light-soft rounded-xl border border-light shadow-xs">
                                    <div className="custom-control custom-checkbox custom-checkbox-premium">
                                        <input 
                                            type="checkbox" 
                                            className="custom-control-input" 
                                            id="isFavorite" 
                                            name="isFavorite"
                                            checked={formData.isFavorite}
                                            onChange={(e) => {
                                                const { name, checked } = e.target;
                                                setFormData(prev => ({ ...prev, [name]: checked }));
                                                setUpdatedFormData(prev => ({ ...prev, [name]: checked }));
                                            }}
                                        />
                                        <label className="custom-control-label font-weight-bold text-dark ps-2 pt-1 cursor-pointer" htmlFor="isFavorite">
                                            Promote to Strategic Focus <span className="text-muted font-weight-normal ml-2">(Feature this team on executive dashboards)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 mb-4">
                                <div className="p-4 bg-light-soft rounded-xl border border-light">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <label className="font-weight-bold text-dark mb-0">Mission Progress Benchmarking</label>
                                        <span className="badge bg-primary px-3 py-1 rounded-pill text-white font-weight-bold shadow-sm" style={{ fontSize: '1rem' }}>{formData.progress}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        className="form-control-range custom-range-premium" 
                                        id="progress" 
                                        name="progress"
                                        min="0" 
                                        max="100" 
                                        step="5"
                                        value={formData.progress}
                                        onChange={(e) => {
                                            const { name, value } = e.target;
                                            setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
                                            setUpdatedFormData(prev => ({ ...prev, [name]: parseInt(value) }));
                                        }}
                                        style={{ height: '8px', cursor: 'pointer' }}
                                    />
                                    <div className="d-flex justify-content-between text-muted small mt-2 font-weight-bold">
                                        <span>INITIATED</span>
                                        <span>STRATEGIC</span>
                                        <span>COMPLETED</span>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 mb-4">
                                <label className="font-weight-bold text-dark mb-2">Performance & Strategy Notes</label>
                                <textarea 
                                    className="form-control search-element p-4" 
                                    name="progressNote"
                                    rows="4"
                                    value={formData.progressNote}
                                    onChange={inputEvent}
                                    placeholder="Enter strategic objectives, performance anomalies, or milestone documentation..."
                                    style={{ borderRadius: '16px', border: 'none', background: '#f8f9fa' }}
                                ></textarea>
                            </div>

                            <div className="col-12 mb-4">
                                <label className="font-weight-bold text-dark mb-2">Team Mission Statement</label>
                                <div className="input-group search-element">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text bg-light-soft border-right-0" style={{ borderRadius: '12px 0 0 12px' }}>
                                            <i className="fas fa-file-alt text-primary opacity-50"></i>
                                        </div>
                                    </div>
                                    <input onChange={inputEvent} value={formData.description} type="text" name='description' 
                                           className="form-control border-left-0" style={{ borderRadius: '0 12px 12px 0', height: '50px' }} />
                                </div>
                            </div>

                            <div className="col-12 mt-5 text-right">
                                <button className='btn btn-primary btn-lg rounded-pill px-5 shadow-lg hover-lift font-weight-bold' type='submit' 
                                        style={{ height: '55px' }}>
                                    <i className="fas fa-check-circle mr-2"></i> Commit Team Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default EditTeam;

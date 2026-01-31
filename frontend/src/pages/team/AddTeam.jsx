import { useState } from "react";
import { toast } from "react-toastify";
import HeaderSection from "../../components/HeaderSection";
import { addTeam, backendUrl } from "../../http";
import { getFileUrl } from "../../utils/fileUtil";

const AddTeam = () =>
{
    const initialState = {name:'',description:'',image:''};
    const [imagePreview, setImagePreview] = useState('/assets/icons/team.png');
    const [formData,setFormData] = useState(initialState);

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
    }

    const onSubmit = async (e) =>
    {
        e.preventDefault();

        const {name,description} = formData;
        if(!name || !description) return toast.error('All Field Required');;

        const fd = new FormData();
        Object.keys(formData).map((key)=>
        {
            return fd.append(key,formData[key]);
        })
        const res = await addTeam(fd);
        if(res.success)
        {
            setFormData({...initialState});
            setImagePreview('/assets/icons/team.png');
            toast.success(res.message);
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
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => setImagePreview(reader.result);
    }

    return(
        <div className="main-content">
            <section className="section">
                {/* Page Header */}
                <div className="glass-card mb-5 p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="font-weight-bold text-dark mb-1">Team Creation</h3>
                        <p className="text-muted mb-0">Establish a new organizational unit and define its purpose</p>
                    </div>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="glass-card border-0 shadow-lg p-5">
                            <form onSubmit={onSubmit}>
                                <div className="text-center mb-5">
                                    <div className="position-relative d-inline-block">
                                        <input type="file" id='image' name='image' className="form-control d-none" onChange={captureImage} accept="image/*" />
                                        <label htmlFor='image' className="cursor-pointer">
                                            <div className="rounded-circle overflow-hidden border border-4 border-white shadow-lg profile-upload-preview hover-lift" style={{ width: '140px', height: '140px' }}>
                                                <img src={imagePreview} className="w-100 h-100 object-fit-cover" alt="Team Preview" />
                                                <div className="upload-overlay">
                                                    <i className="fas fa-camera text-white"></i>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                    <h5 className="font-weight-bold ml-2 text-dark mt-3 mb-1">Team Identity</h5>
                                    <p className="text-muted small">Upload a representative logo or team photo</p>
                                </div>

                                <div className="form-group mb-4">
                                    <label className="text-muted small font-weight-bold mb-2 uppercase">Official Team Name</label>
                                    <div className="input-group shadow-sm">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text bg-light border-0"><i className="fas fa-users text-primary"></i></div>
                                        </div>
                                        <input 
                                            onChange={inputEvent} 
                                            value={formData.name} 
                                            type="text" 
                                            name='name' 
                                            className="form-control border-0 bg-light rounded-right py-4" 
                                            placeholder="e.g., AI Research & Development"
                                        />
                                    </div>
                                </div>

                                <div className="form-group mb-5 ">
                                    <label className="text-muted small font-weight-bold mb-2 uppercase">Team Mission / Description</label>
                                    <div className="input-group shadow-sm">
                                        <div className="input-group-prepend align-items-start">
                                            <div className="input-group-text bg-light border-0 pt-3"><i className="fas fa-quote-left text-muted"></i></div>
                                        </div>
                                        <textarea 
                                            onChange={inputEvent} 
                                            value={formData.description} 
                                            name='description' 
                                            className="form-control border-0 bg-light rounded-right py-3" 
                                            rows="3"
                                            placeholder="What is the primary focus of this team?"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="form-group text-center mt-2">
                                    <button 
                                        className='btn btn-primary btn-lg rounded-pill px-5 shadow-lg font-weight-bold w-100 py-3 transition-all' 
                                        type='submit' 
                                    >
                                        <i className="fas fa-plus-circle mr-2"></i>Create Team
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default AddTeam;

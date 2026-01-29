import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import HeaderSection from "../../components/HeaderSection";
import { submitProblem, getUserProblems, getUserTasks } from "../../http";
import moment from "moment";
import { useSelector } from "react-redux";

const Userproblem = () => {
    const initialState = {
        project: '',
        problemLocation: '',
        description: '',
        priority: 'Low',
        problemImage: null,
        empireId: ''
    };
    
    const [formData, setFormData] = useState(initialState);
    const [teams, setTeams] = useState([]);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);


    const fetchMyProblems = async () => {
        try {
            const res = await getUserProblems();
            if (res.success) {
                setProblems(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const tasksRes = await getUserTasks();
            const tasks = Array.isArray(tasksRes) ? tasksRes : [];
            if (tasks.length > 0) {
                const uniqueProjects = Array.from(new Map(tasks.map(t => [t.title, { id: t.title, name: t.title }])).values());
                setTeams(uniqueProjects);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchDropdownData();
        fetchMyProblems();
    }, []);

    const inputEvent = (e) => {
        const { name, value, files } = e.target;
        if (name === 'problemImage') {
            const file = files[0];
            setFormData(old => ({ ...old, problemImage: file }));
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
        const { project, problemLocation, description } = formData;

        if (!project || !problemLocation || !description) {
            return toast.error('Required fields are missing');
        }

        setLoading(true);
        try {
            const fd = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) fd.append(key, formData[key]);
            });

            const res = await submitProblem(fd);
            if (res.success) {
                toast.success("Problem Submitted Successfully!");
                setFormData(initialState);
                setImagePreview(null);
                fetchMyProblems();
            } else {
                toast.error(res.message || "Submission failed");
            }
        } catch (err) {
            toast.error("An error occurred during submission");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-content">
            <section className="section">
                <HeaderSection title='Report a Problem' />
                <div className="card">
                    <div className="card-header">
                        <h4>Submit New Problem</h4>
                    </div>
                    <div className="card-body pr-5 pl-5 m-1">
                        <form className='row' onSubmit={onSubmit} id='problemForm'>
                            
                            {/* Project Selection */}
                            <div className="form-group col-md-6">
                                <label>Project</label>
                                {teams.length > 0 ? (
                                    <select
                                        className='form-control'
                                        name="project"
                                        value={formData.project}
                                        onChange={inputEvent}
                                        required
                                    >
                                        <option value="">Select Project</option>
                                        {teams.map((team) => (
                                            <option key={team.id} value={team.id}>
                                                {team.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="alert alert-warning p-2">
                                        No active project assigned via tasks.
                                    </div>
                                )}
                            </div>

                            {/* Problem Location */}
                            <div className="form-group col-md-6">
                                <label>Problem Location / Module</label>
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text"><i className="fas fa-map-marker-alt"></i></div>
                                    </div>
                                    <input 
                                        onChange={inputEvent} 
                                        value={formData.problemLocation} 
                                        type="text" 
                                        name='problemLocation' 
                                        placeholder="e.g. Login Page, Payment Module"
                                        className="form-control" 
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="form-group col-md-12">
                                <label>Problem Description</label>
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text"><i className="fas fa-align-left"></i></div>
                                    </div>
                                    <textarea 
                                        onChange={inputEvent} 
                                        value={formData.description} 
                                        name='description' 
                                        placeholder="Detailed description of the problem..."
                                        className="form-control" 
                                        rows="4"
                                        style={{ height: 'auto' }}
                                        required
                                    ></textarea>
                                </div>
                            </div>

                            {/* Priority */}
                            <div className="form-group col-md-6">
                                <label>Priority</label>
                                <select className="form-control" name="priority" value={formData.priority} onChange={inputEvent}>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            {/* File Upload */}
                            <div className="form-group col-md-6">
                                <label>Image (Optional)</label>
                                <input type="file" name="problemImage" className="form-control" onChange={inputEvent} accept="image/*" />
                                {imagePreview && <img src={imagePreview} alt="Preview" width="100" className="mt-2 rounded" />}
                            </div>

                            <div className="form-group text-center col-md-12">
                                <button className='btn btn-primary btn-lg' type='submit' disabled={loading} style={{ width: '30vh' }}>
                                    {loading ? 'Submitting...' : 'Submit Problem'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Problems Table */}
                <div className="card mt-4">
                    <div className="card-header">
                        <h4>My Submitted Problems</h4>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-striped table-md">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Project Name</th>
                                        <th>Location</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Admin Solution</th>
                                        <th>Submitted Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {problems.length > 0 ? (
                                        problems.map((problem, index) => (
                                            <tr key={problem._id}>
                                                <td>{index + 1}</td>
                                                <td>{problem.project || 'N/A'}</td>
                                                <td>{problem.problemLocation}</td>
                                                <td title={problem.description}>
                                                    {problem.description.length > 50 
                                                        ? problem.description.substring(0, 50) + '...' 
                                                        : problem.description}
                                                </td>
                                                <td>
                                                    <div className={`badge badge-${
                                                        problem.status === 'Checked' ? 'success' : 'danger'
                                                    }`}>
                                                        {problem.status === 'Un Checked' ? 'Pending' : problem.status}
                                                    </div>
                                                </td>
                                                <td>
                                                    {problem.adminSolution ? (
                                                        <div className="text-success small">
                                                            <strong>{problem.solutionBy || 'Admin'}: </strong>{problem.adminSolution}
                                                        </div>
                                                    ) : <span className="text-muted small">No solution yet</span>}
                                                </td>
                                                <td>{moment(problem.createdAt).format('DD MMM YYYY')}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center">No problems submitted yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Userproblem;

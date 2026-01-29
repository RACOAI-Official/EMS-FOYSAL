import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import HeaderSection from "../../../components/HeaderSection";
import { applyforleave, viewLeaves } from "../../../http";
import Modal from '../../../components/modal/Modal';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";


const ApplyForLeave = () =>
{
  const {user} = useSelector(state => state.authSlice); 
  const initialState = {title:'',type:'', period:'', startDate:'', endDate:'', reason:''}
  const [formData,setFormData] = useState(initialState);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        fetchMyLeaves();
    }, [user.id]);

    const fetchMyLeaves = async () => {
        try {
            setLoadingHistory(true);
            const res = await viewLeaves({ applicantID: user.id });
            if (res.success) {
                setMyLeaves(res.data || []);
            }
        } catch (error) {
            console.error('Error fetching my leaves:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

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

    // Auto-calculate period when start or end date changes
    useEffect(() => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            
            // Calculate difference in days
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day
            
            setFormData(prev => ({
                ...prev,
                period: diffDays
            }));
        }
    }, [formData.startDate, formData.endDate]);

    const onSubmit = async (e) =>
    {
        e.preventDefault();
        const {title, type, startDate, endDate, reason, period} = formData;
        if(!title || !type || !startDate || !endDate || !reason) return toast.error('All Fields Required');
        
        if (new Date(endDate) < new Date(startDate)) {
            return toast.error('End date cannot be before start date');
        }
        
        const d = new Date();
        
        const payload = { ...formData };
        payload["applicantID"] = user.id;
        payload["appliedDate"] = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();

        const res = await applyforleave(payload);
        const {success} = res;
        if(success) {
          toast.success("Leave Application Sent!");
          fetchMyLeaves(); // Refresh history
          setFormData(initialState);
        } else {
            toast.error(res.message || "Failed to send application");
        }
    }

    return(
        <div className="main-content">
            <section className="section">
                {/* Page Header */}
                <div className="glass-card mb-4 p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="font-weight-bold text-dark mb-1">Leave Management</h3>
                        <p className="text-muted mb-0">Apply for time off and track your approval status</p>
                    </div>
                </div>

                <div className="row">
                    {/* Leave Form */}
                    <div className="col-lg-12 mb-4">
                        <div className="glass-card p-4 shadow-sm border-0">
                            <div className="d-flex align-items-center mb-4 pb-2 border-bottom">
                                <div className="rounded-circle bg-primary-soft text-primary d-flex align-items-center justify-content-center mr-3 shadow-sm" style={{width: '45px', height: '45px'}}>
                                    <i className="fas fa-paper-plane"></i>
                                </div>
                                <h5 className="mb-0 font-weight-bold text-dark">New Leave Request</h5>
                            </div>
                            
                            <form className='row g-4' onSubmit={onSubmit}>
                                <div className="form-group col-md-4">
                                    <label className="text-muted small font-weight-bold mb-2 uppercase">Subject / Title</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text bg-light border-0"><i className="fas fa-pen text-primary"></i></div>
                                        </div>
                                        <input onChange={inputEvent} value={formData.title} type="text" name='title' className="form-control border-0 bg-light rounded-right" placeholder="e.g., Family Wedding"/>
                                    </div>
                                </div>

                                <div className="form-group col-md-4">
                                    <label className="text-muted small font-weight-bold mb-2 uppercase">Leave Type</label>
                                    <select name='type' onChange={inputEvent} value={formData.type} className="form-control border-0 bg-light rounded-pill px-3 shadow-sm">
                                        <option value="">Select Leave Type</option>
                                        <option>Sick Leave</option>
                                        <option>Casual Leave</option>
                                        <option>Emergency Leave</option>
                                    </select>
                                </div>

                                <div className="form-group col-md-4">
                                    <label className="text-muted small font-weight-bold mb-2 uppercase">Period (Auto)</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text bg-light border-0"><i className="fas fa-calendar-day text-success"></i></div>
                                        </div>
                                        <input value={formData.period || 'Select dates'} type="text" className="form-control border-0 bg-white" readOnly placeholder="0 Days"/>
                                    </div>
                                </div>

                                <div className="form-group col-md-6"> 
                                    <label className="text-muted small font-weight-bold mb-2 uppercase">Start Date</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text bg-light border-0"><i className="fa fa-calendar-plus text-primary"></i></div>
                                        </div>
                                        <input onChange={inputEvent} value={formData.startDate} type="date" name="startDate" className="form-control border-0 bg-light rounded-right"/>
                                    </div>
                                </div>    

                                <div className="form-group col-md-6"> 
                                    <label className="text-muted small font-weight-bold mb-2 uppercase">End Date</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text bg-light border-0"><i className="fa fa-calendar-check text-warning"></i></div>
                                        </div>
                                        <input onChange={inputEvent} value={formData.endDate} type="date" name="endDate" className="form-control border-0 bg-light rounded-right"/>
                                    </div>
                                </div>  

                                <div className="form-group col-md-12">
                                    <label className="text-muted small font-weight-bold mb-2 uppercase">Reason / Description</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend align-items-start">
                                            <div className="input-group-text bg-light border-0 pt-3"><i className="fas fa-align-left text-muted"></i></div>
                                        </div>
                                        <textarea onChange={inputEvent} value={formData.reason} name='reason' className="form-control border-0 bg-light rounded-right" rows="3" placeholder="Briefly describe why you are taking leave..."></textarea>
                                    </div>
                                </div>

                                <div className="form-group text-center col-md-12 mt-3">
                                    <button className='btn btn-primary btn-lg rounded-pill px-5 shadow-lg font-weight-bold' type='submit'>
                                        <i className="fas fa-paper-plane mr-2"></i> Submit Application
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Leave History List */}
                    <div className="col-lg-12">
                        <div className="glass-card border-0 shadow-lg overflow-hidden">
                            <div className="card-header bg-white border-bottom py-4">
                                <h5 className="mb-0 font-weight-bold text-dark">
                                    <i className="fas fa-history mr-2 text-primary"></i> My Leave History
                                </h5>
                            </div>
                            <div className="p-3">
                                <div className="table-responsive">
                                    <table className="table table-borderless align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                                        <thead>
                                            <tr className="text-muted text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>
                                                <th className="ps-4">Type</th>
                                                <th>Title</th>
                                                <th>Period</th>
                                                <th>Applied Date</th>
                                                <th className="text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loadingHistory ? (
                                                <tr><td colSpan="5" className="text-center p-5 text-muted">Fetching your records...</td></tr>
                                            ) : myLeaves.length === 0 ? (
                                                <tr><td colSpan="5" className="text-center p-5 text-muted">No leave applications found.</td></tr>
                                            ) : myLeaves.map((leave, idx) => (
                                                <tr key={idx} className="soft-card shadow-sm hover-lift">
                                                    <td className="ps-4 py-3">
                                                        <div className="fw-bold text-dark">{leave.type}</div>
                                                    </td>
                                                    <td>
                                                        <div className="text-muted small font-weight-bold">{leave.title}</div>
                                                    </td>
                                                    <td>
                                                        <div className="badge border text-dark font-weight-bold">
                                                            <i className="far fa-calendar-alt mr-1 text-muted"></i>
                                                            {leave.period} Days
                                                        </div>
                                                        <div className="text-muted" style={{fontSize: '0.65rem'}}>{leave.startDate} to {leave.endDate}</div>
                                                    </td>
                                                    <td>
                                                        <div className="small text-muted">{leave.appliedDate}</div>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className={`badge rounded-pill px-3 py-2 ${
                                                            leave.adminResponse === 'Approved' ? 'bg-success-soft text-success' : 
                                                            leave.adminResponse === 'Rejected' ? 'bg-danger-soft text-danger' : 
                                                            'bg-primary-soft text-primary'
                                                        }`}>
                                                            {leave.adminResponse || 'Pending'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ApplyForLeave;


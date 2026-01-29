import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { updateLeave, viewLeaves } from '../../../http';
import { toast } from 'react-toastify';
import Loading from '../../../components/Loading';






const Leave = () => {
    const { id } = useParams();
    const [application, setApplication] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const obj = { "_id": id };
            const res = await viewLeaves(obj);
            if (res.success && res.data.length > 0) {
                setApplication(res.data[0]);
            }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setApplication(prev => ({ ...prev, [name]: value }));
    };

    const approveApplication = async () => {
        if (application.adminResponse === "Approved") {
            toast.error("Application already approved");
            return;
        }
        
        const updatedApp = { ...application, adminResponse: "Approved" };
        const res = await updateLeave(id, updatedApp);
        if (res.success) {
            toast.success("Leave Approved");
            setApplication(updatedApp);
        }
    }

    const rejectApplication = async () => {
        if (application.adminResponse === "Rejected") {
            toast.error("Application already rejected");
            return;
        }
        
        const updatedApp = { ...application, adminResponse: "Rejected" };
        const res = await updateLeave(id, updatedApp);
        if (res.success) {
            toast.success("Leave Rejected");
            setApplication(updatedApp);
        }
    }

    if (loading) return <Loading />;

    return (
        <>
            {
                application ? (<div className="main-content">
                    <section className="section">
                        {/* Page Header */}
                        <div className="glass-card mb-4 p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h3 className="font-weight-bold text-dark mb-1">Application Details</h3>
                                <p className="text-muted mb-0">Reviewing request submitted on {application?.appliedDate}</p>
                            </div>
                            <div className={`badge rounded-pill px-4 py-2 font-weight-bold shadow-sm ${
                                application?.adminResponse === 'Approved' ? 'bg-success-soft text-success' : 
                                application?.adminResponse === 'Rejected' ? 'bg-danger-soft text-danger' : 
                                'bg-primary-soft text-primary'
                            }`}>
                                <i className={`fas fa-${application?.adminResponse === 'Approved' ? 'check-circle' : application?.adminResponse === 'Rejected' ? 'times-circle' : 'clock'} mr-2`}></i>
                                {application?.adminResponse || 'Pending Review'}
                            </div>
                        </div>

                        <div className="row justify-content-center">
                            <div className="col-lg-10">
                                <div className="glass-card border-0 shadow-lg p-5">
                                    <h5 className="font-weight-bold text-dark mb-4 pb-2 border-bottom">
                                        <i className="fas fa-info-circle mr-2 text-primary"></i> Leave Information
                                    </h5>

                                    <div className="table-responsive">
                                        <table className='table table-borderless align-middle'>
                                            <tbody>
                                                <tr className="soft-card mb-2">
                                                    <th className="text-muted small uppercase ps-4" style={{width: '200px'}}>Subject</th>
                                                    <td className="fw-bold h6 text-dark py-3">{application?.title}</td>
                                                </tr>
                                                <tr className="soft-card mb-2">
                                                    <th className="text-muted small uppercase ps-4">Leave Type</th>
                                                    <td className="py-3">
                                                        <span className="badge border px-3 text-dark">{application?.type}</span>
                                                    </td>
                                                </tr>
                                                <tr className="soft-card mb-2">
                                                    <th className="text-muted small uppercase ps-4">Reason</th>
                                                    <td className="py-3 text-muted">{application?.reason}</td>
                                                </tr>
                                                <tr className="soft-card mb-2">
                                                    <th className="text-muted small uppercase ps-4">Start Date</th>
                                                    <td className="py-3">
                                                        <input 
                                                            type="date" 
                                                            name="startDate" 
                                                            className="form-control form-control-sm rounded-pill border-0 bg-light shadow-sm px-3"
                                                            value={application?.startDate} 
                                                            onChange={handleDateChange}
                                                            disabled={application?.adminResponse !== "Pending"}
                                                            style={{maxWidth: '200px'}}
                                                        />
                                                    </td>
                                                </tr>
                                                <tr className="soft-card mb-2">
                                                    <th className="text-muted small uppercase ps-4">End Date</th>
                                                    <td className="py-3">
                                                        <input 
                                                            type="date" 
                                                            name="endDate" 
                                                            className="form-control form-control-sm rounded-pill border-0 bg-light shadow-sm px-3"
                                                            value={application?.endDate} 
                                                            onChange={handleDateChange}
                                                            disabled={application?.adminResponse !== "Pending"}
                                                            style={{maxWidth: '200px'}}
                                                        />
                                                    </td>
                                                </tr>
                                                <tr className="soft-card mb-2">
                                                    <th className="text-muted small uppercase ps-4">Duration</th>
                                                    <td className="py-3 fw-bold text-primary">{application?.period} Days</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-5 d-flex gap-3 justify-content-center pt-4 border-top">
                                        <button
                                            onClick={approveApplication}
                                            className={`btn btn-lg rounded-pill px-5 font-weight-bold shadow-sm transition-all ${
                                                application?.adminResponse === "Approved" ? "btn-light text-muted" : "btn-success"
                                            }`}
                                            disabled={application?.adminResponse === "Approved" || application?.adminResponse === "Rejected"}
                                        >
                                            <i className="fas fa-check-circle mr-2"></i> Approve Request
                                        </button>
                                        <button
                                            onClick={rejectApplication}
                                            className={`btn btn-lg rounded-pill px-5 font-weight-bold shadow-sm transition-all ${
                                                application?.adminResponse === "Rejected" ? "btn-light text-muted" : "btn-danger"
                                            }`}
                                            disabled={application?.adminResponse === "Approved" || application?.adminResponse === "Rejected"}
                                        >
                                            <i className="fas fa-times-circle mr-2"></i> Reject Request
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>)
                    : <div className="main-content"><section className="section"><div className="glass-card p-5 text-center"><h4 className="text-muted">Application not found</h4></div></section></div>
            }
        </>
    )
}

export default Leave;

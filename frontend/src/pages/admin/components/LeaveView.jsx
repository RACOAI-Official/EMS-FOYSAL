import React, { useEffect, useState } from 'react'
import { getEmployees, getLeaders, viewLeaves, deleteLeave } from '../../../http';
import { useHistory } from "react-router-dom";
import { exportToPrint } from '../../../utils/printHelper';
import Loading from '../../../components/Loading';
import swal from 'sweetalert';


const LeaveView = () => {
  const [type, setType] = useState();
  const [status, setStatus] = useState();
  const [appliedDate, setAppliedDate] = useState();
  const [applications, setApplications] = useState();
  const history = useHistory();
  const [employees, setEmployees] = useState();
  const [employeeMap, setEmployeeMap] = useState();
  const [selectedEmployee, setSelectedEmployee] = useState();

  useEffect(() => {

    let empObj = {};
    const fetchData = async () => {
      const res = await viewLeaves({});
      const { data } = res;
      setApplications(data);
    }

    const fetchEmployees = async () => {
      const emps = await getEmployees();
      const leaders = await getLeaders();
      emps.data.forEach(employee => empObj[employee.id] = [employee.name, employee.email]);
      leaders.data.forEach(leader => empObj[leader.id] = [leader.name, leader.email]);
      setEmployeeMap(empObj);
      setEmployees([...emps.data, ...leaders.data]);
    }

    fetchData();
    fetchEmployees();

  }, []);

  const searchLeaveApplications = async () => {
    const obj = {

    }

    if (selectedEmployee) {
      obj["applicantID"] = selectedEmployee;
    }

    if (type) {
      obj["type"] = type;
    }
    if (status) {
      obj["adminResponse"] = status
    }
    if (appliedDate) {
      obj["appliedDate"] = appliedDate;
    }

    console.log(obj);

    const res = await viewLeaves(obj);
    const { data } = res;
    setApplications(data);

    setAppliedDate("");
    setType("");
    setStatus("");
  }

  const handlePrintApplication = (e, application) => {
    e.stopPropagation(); // Prevent row click navigation

    const applicantName = employeeMap && employeeMap[application.applicantID] ? employeeMap[application.applicantID][0] : 'N/A';
    const applicantEmail = employeeMap && employeeMap[application.applicantID] ? employeeMap[application.applicantID][1] : 'N/A';

    const tableColumn = ["Field", "Information"];
    const tableRows = [
      ["Employee Name", applicantName],
      ["Emp ID", application.applicantID.toString()],
      ["Leave Type", application.type],
      ["Subject", application.title],
      ["Description", application.description || "N/A"],
      ["Applied Date", application.appliedDate],
      ["Status", application.adminResponse || "Pending"]
    ];

    exportToPrint({
      title: "Leave Application",
      columns: tableColumn,
      data: tableRows,
      date: `Generated: ${new Date().toLocaleDateString()}`
    });
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this leave application!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
      .then(async (willDelete) => {
        if (willDelete) {
          const res = await deleteLeave(id);
          if (res.success) {
            swal("Poof! Leave application has been deleted!", {
              icon: "success",
            });
            // Refresh data
            const fetchData = async () => {
              const res = await viewLeaves({});
              const { data } = res;
              setApplications(data);
            }
            fetchData();
          } else {
            swal(res.message || "Failed to delete leave application", {
              icon: "error",
            });
          }
        }
      });
  };

  return (
    <>
      {
        applications ?
          (<div className="main-content">
            <section className="section">
              {/* Page Header */}
              <div className="glass-card mb-4 p-4 d-flex justify-content-between align-items-center">
                  <div>
                      <h3 className="font-weight-bold text-dark mb-1">Leave Requests</h3>
                      <p className="text-muted mb-0">Review and manage employee time-off applications</p>
                  </div>
              </div>

              {/* Search Filters */}
              <div className="glass-card border-0 shadow-sm mb-4 p-4">
                  <div className="row g-3 align-items-end">
                      <div className="col-md-3">
                          <label className="text-muted small font-weight-bold mb-2">EMPLOYEE</label>
                          <select
                              className='form-control rounded-pill border-0 bg-light shadow-sm'
                              value={selectedEmployee || ''}
                              onChange={(e) => setSelectedEmployee(e.target.value)}
                          >
                            <option value="">All Employees</option>
                            {employees?.map((employee) => (
                              <option key={employee.id} value={employee.id}>{employee.name}</option>
                            ))}
                          </select>
                      </div>

                      <div className="col-md-2">
                          <label className="text-muted small font-weight-bold mb-2">LEAVE TYPE</label>
                          <select name='type' onChange={(e) => setType(e.target.value)} className="form-control rounded-pill border-0 bg-light shadow-sm">
                            <option value="">All Types</option>
                            <option>Sick Leave</option>
                            <option>Casual Leave</option>
                            <option>Emergency Leave</option>
                          </select>
                      </div>

                      <div className="col-md-2">
                          <label className="text-muted small font-weight-bold mb-2">STATUS</label>
                          <select name='status' onChange={(e) => setStatus(e.target.value)} className="form-control rounded-pill border-0 bg-light shadow-sm">
                            <option value="">All Statuses</option>
                            <option>Pending</option>
                            <option>Approved</option>
                            <option>Rejected</option>
                          </select>
                      </div>

                      <div className="col-md-3">
                          <label className="text-muted small font-weight-bold mb-2">APPLIED DATE</label>
                          <div className="input-group">
                              <div className="input-group-prepend">
                                  <div className="input-group-text bg-light border-0"><i className="fa fa-calendar text-primary"></i></div>
                              </div>
                              <input onChange={(e) => setAppliedDate(e.target.value)} type="date" className="form-control border-0 bg-light rounded-right"/>
                          </div>
                      </div>

                      <div className="col-md-2">
                          <button onClick={searchLeaveApplications} className="btn btn-primary btn-block rounded-pill font-weight-bold shadow-sm" style={{ height: '42px' }}>
                              <i className="fas fa-search mr-2"></i> Filter
                          </button>
                      </div>
                  </div>
              </div>

              {/* Applications Table */}
              <div className="glass-card border-0 shadow-lg overflow-hidden">
                  <div className="card-header bg-white border-bottom py-4 d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 font-weight-bold text-dark">
                          <i className="fas fa-inbox mr-2 text-primary"></i> Incoming Applications
                      </h5>
                      <span className="badge bg-primary-soft text-primary rounded-pill px-3 py-2">
                          {applications?.length || 0} Total Requests
                      </span>
                  </div>
                  <div className="p-3">
                    <div className="table-responsive">
                      <table className="table table-borderless align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                        <thead>
                          <tr className="text-muted text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>
                            <th className="ps-4">Applicant</th>
                            <th>Leave Details</th>
                            <th>Applied On</th>
                            <th className="text-center">Status</th>
                            <th className="text-right pe-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applications?.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="text-center p-5 text-muted">No leave applications found matching your criteria.</td>
                            </tr>
                          ) : applications?.map((app, idx) => (
                            <tr key={idx} className="soft-card shadow-sm hover-lift cursor-pointer" onClick={() => history.push(`leaves/${app._id}`)} title="View Details">
                              <td className="ps-4 py-3">
                                <div className="d-flex align-items-center">
                                  <div className="rounded-circle bg-primary-soft text-primary d-flex align-items-center justify-content-center mr-3 font-weight-bold shadow-sm" style={{width: '40px', height: '40px'}}>
                                    {employeeMap?.[app.applicantID]?.[0]?.charAt(0) || '?'}
                                  </div>
                                  <div>
                                    <div className="fw-bold text-dark">{employeeMap?.[app.applicantID]?.[0] || 'Unknown'}</div>
                                    <div className="text-muted small">{employeeMap?.[app.applicantID]?.[1] || '-'}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="fw-bold text-dark">{app.type}</div>
                                <div className="text-muted small truncate" style={{maxWidth: '200px'}}>{app.title}</div>
                              </td>
                              <td>
                                <div className="small text-muted">{app.appliedDate}</div>
                                <div className="badge border text-dark font-weight-bold mt-1" style={{fontSize: '0.65rem'}}>
                                    {app.period} Days
                                </div>
                              </td>
                              <td className="text-center">
                                <div className={`badge rounded-pill px-3 py-2 ${
                                  app.adminResponse === 'Approved' ? 'bg-success-soft text-success' : 
                                  app.adminResponse === 'Rejected' ? 'bg-danger-soft text-danger' : 
                                  'bg-primary-soft text-primary'
                                }`}>
                                  {app.adminResponse || 'Pending'}
                                </div>
                              </td>
                              <td className="text-right pe-4">
                                <div className="d-flex justify-content-end gap-2">
                                  <button className="btn btn-sm btn-soft-info rounded-pill px-3" onClick={(e) => handlePrintApplication(e, app)} title="Generate PDF Document">
                                    <i className="fas fa-print"></i>
                                  </button>
                                  <button className="btn btn-sm btn-soft-danger rounded-pill px-3" onClick={(e) => handleDelete(e, app._id)} title="Delete Application">
                                    <i className="fas fa-trash"></i>
                                  </button>
                                  <button className="btn btn-sm btn-light border rounded-pill px-3 shadow-none">
                                    <i className="fas fa-chevron-right text-muted"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
              </div>
            </section>
          </div>)
          :
          <Loading />
      }
    </>


  )
}

export default LeaveView;

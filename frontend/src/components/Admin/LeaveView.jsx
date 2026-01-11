import React, { useEffect, useState } from 'react'
import { getEmployees, getLeaders, viewLeaves } from '../../http';
import { useHistory } from "react-router-dom";
import Loading from '../Loading';
import jsPDF from 'jspdf';


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

    const doc = new jsPDF();
    const applicantName = employeeMap && employeeMap[application.applicantID] ? employeeMap[application.applicantID][0] : 'N/A';
    const applicantEmail = employeeMap && employeeMap[application.applicantID] ? employeeMap[application.applicantID][1] : 'N/A';

    // Header
    doc.setFontSize(22);
    doc.text("Easy Employee", 15, 20);
    doc.setFontSize(10);
    doc.text("No 2, 4th Floor, 100ft Road", 15, 26);
    doc.text("Koramangala, Bangalore - 560034", 15, 31);

    doc.line(15, 35, 195, 35); // Separator line

    // Date
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 45);

    // Subject
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Subject: Leave Application - ${application.type}`, 15, 55);
    doc.setFont(undefined, 'normal');

    // Body
    doc.setFontSize(11);
    const bodyText = `
Respected Sir/Madam,

I am writing to formally request a leave of absence.

Employee Name: ${applicantName}
Emp ID: ${application.applicantID}
Leave Type: ${application.type}

Reason/Title: ${application.title}
Details: ${application.description || "N/A"}

I request you to kindly approve my leave application.

Sincerely,
${applicantName}
${applicantEmail}
    `;

    doc.text(bodyText, 15, 65);

    // Approval Section
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("Administrative Approval", 15, 160);
    doc.setFont(undefined, 'normal');
    doc.font = "courier"; // Monospace for 'box' effect

    doc.rect(15, 165, 180, 40); // Box
    doc.text(`Status: ${application.adminResponse}`, 20, 175);
    doc.text(`Date of Action: ${new Date().toLocaleDateString()}`, 20, 185);
    doc.text("Authorized Signature: __________________________", 20, 195);


    // Preview
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
  };

  return (
    <>
      {
        applications ?
          (<div className="main-content">
            <section className="section">
              <div className="card">
                <div className="card-header d-flex justify-content-between">
                  <h4>Leave Applications</h4>
                </div>
              </div>

              <div className="d-flex justify-content-center align-items-center w-100">

                <div className="form-group col-md-2">
                  <label>Employee</label>
                  <select
                    className='form-control select2'
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                  >
                    <option value="">Employees</option>
                    {employees?.map((employee) => (
                      <option key={employee._id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group col-md-2">
                  <label>Leave Type</label>
                  <select name='type' onChange={(e) => setType(e.target.value)} className="form-control select2">
                    <option>Select</option>
                    <option>Sick Leave</option>
                    <option>Casual Leave</option>
                    <option>Emergency Leave</option>
                  </select>
                </div>
                <div className="form-group col-md-2">
                  <label>Status</label>
                  <select name='type' onChange={(e) => setStatus(e.target.value)} className="form-control select2">
                    <option>Select</option>
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                  </select>
                </div>

                <div className="form-group col-md-4">
                  <label>Applied Date</label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <div className="input-group-text">
                        <i class="fa fa-calendar"></i>
                      </div>
                    </div>
                    <input onChange={(e) => setAppliedDate(e.target.value)} type="date" id="startDate" name="startDate" className="form-control"></input>

                  </div>
                </div>



                <button onClick={searchLeaveApplications} className="btn btn-lg btn-primary col">Search</button>
              </div>
            </section>
            <div className="table-responsive">
              <table className="table table-striped table-md center-text">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody className="sidebar-wrapper">
                  {
                    applications?.map((application, idx) =>

                      <tr className='hover-effect' onClick={() => history.push(`leaves/${application._id}`)}>
                        <td>{idx + 1}</td>
                        <td>{employeeMap && employeeMap[application.applicantID] ? employeeMap[application.applicantID][0] : 'N/A'}</td>
                        <td>{employeeMap && employeeMap[application.applicantID] ? employeeMap[application.applicantID][1] : 'N/A'}</td>
                        <td>{application.type}</td>
                        <td>{application.title}</td>
                        <td>{application.appliedDate}</td>
                        <td className={`${application.adminResponse === "Rejected" ? "text-danger" : application.adminResponse === "Pending" ? "text-primary" : "text-success"}`}>{application.adminResponse}</td>
                        <td>
                          <button className="btn btn-sm btn-info" onClick={(e) => handlePrintApplication(e, application)} title="Print Application">
                            <i className="fas fa-print"></i>
                          </button>
                        </td>
                      </tr>


                    )
                  }
                </tbody>
              </table>
            </div>
          </div>)
          :
          <Loading />
      }
    </>


  )
}

export default LeaveView;

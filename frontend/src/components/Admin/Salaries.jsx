import React, { useEffect, useState } from 'react'
import { getEmployees, getLeaders, viewAllSalaries } from '../../http';
import { useHistory } from "react-router-dom";
import Loading from '../Loading';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Salaries = () => {

  const history = useHistory();
  const [employees, setEmployees] = useState();
  const [employeeMap, setEmployeeMap] = useState();
  const [selectedEmployee, setSelectedEmployee] = useState();
  const [salaries, setSalaries] = useState();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));

  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    let empObj = {};
    const fetchData = async () => {
      const res = await viewAllSalaries({});
      const { data } = res;
      setSalaries(data);
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

  const searchSalary = async () => {
    const obj = {

    }

    if (selectedEmployee) {
      obj["employeeID"] = selectedEmployee;
    }
    const res = await viewAllSalaries(obj);
    const { data } = res;
    setSalaries(data);

  }

  const handlePrintSalary = () => {
    if (!salaries || salaries.length === 0) {
      alert("No salary data to print.");
      return;
    }

    const doc = new jsPDF();

    // Title & Header
    doc.setFontSize(22);
    doc.text("Easy Employee", 15, 20);
    doc.setFontSize(10);
    doc.text("No 2, 4th Floor, 100ft Road", 15, 26);
    doc.text("Koramangala, Bangalore - 560034", 15, 31);

    doc.setFontSize(16);
    doc.text("Salary Report", 105, 45, null, null, "center");

    doc.setFontSize(10);
    doc.text(`Period: ${selectedMonth} ${selectedYear}`, 15, 55);
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 150, 55);

    if (selectedEmployee && salaries.length === 1 && employeeMap) {
      // Individual Salary Slip Style
      const salary = salaries[0];
      const empDetails = employeeMap[salary.employeeID];
      const name = empDetails ? empDetails[0] : 'N/A';
      const email = empDetails ? empDetails[1] : 'N/A';

      doc.setFontSize(12);
      doc.text(`Employee Name: ${name}`, 15, 65);
      doc.text(`Email: ${email}`, 15, 70);

      doc.line(15, 75, 195, 75);

      doc.setFontSize(14);
      doc.text("Earnings", 15, 85);

      doc.setFontSize(12);
      doc.text(`Basic Salary: ${salary.salary}`, 15, 95);
      doc.text(`Bonus: ${salary.bonus}`, 15, 105);
      doc.text(`Reason for Bonus: ${salary.reasonForBonus || '-'}`, 15, 115);

      doc.line(15, 125, 60, 125);
      doc.text(`Total: ${parseInt(salary.salary) + parseInt(salary.bonus)}`, 15, 135);

    } else {
      // List View
      const tableColumn = ["#", "Name", "Email", "Salary", "Bonus", "Last Updated"];
      const tableRows = salaries.map((salary, index) => [
        index + 1,
        employeeMap && employeeMap[salary.employeeID] ? employeeMap[salary.employeeID][0] : 'N/A',
        employeeMap && employeeMap[salary.employeeID] ? employeeMap[salary.employeeID][1] : 'N/A',
        salary.salary,
        salary.bonus,
        salary.assignedDate || '-'
      ]);

      doc.autoTable({
        startY: 65,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [103, 119, 239] },
      });
    }

    // Preview
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
  };

  return (
    <>
      {
        salaries ?
          (<div className="main-content">
            <section className="section">
              <div className="card">
                <div className="card-header d-flex justify-content-between">
                  <h4>Salaries</h4>
                </div>
              </div>

              <div className="d-flex justify-content-center align-items-center w-100 flex-wrap">

                <div className="form-group col-md-3">
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
                  <label>Year</label>
                  <select
                    className='form-control select2'
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group col-md-2">
                  <label>Month</label>
                  <select
                    className='form-control select2'
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3 d-flex">
                  <button onClick={searchSalary} className="btn btn-lg btn-primary mr-2 flex-grow-1">Search</button>
                  <button onClick={handlePrintSalary} className="btn btn-lg btn-success flex-grow-1">
                    <i className="fas fa-print mr-2"></i> Print
                  </button>
                </div>
              </div>
            </section>
            <div className="table-responsive">
              <table className="table table-striped table-md center-text">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Salary</th>
                    <th>Bonus</th>
                  </tr>
                </thead>

                <tbody className="sidebar-wrapper">
                  {
                    salaries?.map((salary, idx) =>

                      <tr className='hover-effect' onClick={() => history.push(`salary/${salary._id}`)}>
                        <td>{idx + 1}</td>
                        <td>{employeeMap && employeeMap[salary.employeeID] ? employeeMap[salary.employeeID][0] : 'N/A'}</td>
                        <td>{employeeMap && employeeMap[salary.employeeID] ? employeeMap[salary.employeeID][1] : 'N/A'}</td>
                        <td>{salary.salary}</td>
                        <td>{salary.bonus}</td>
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

export default Salaries;

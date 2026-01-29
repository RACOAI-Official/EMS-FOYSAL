import React, { useEffect, useState } from 'react'
import { deleteSalary, getEmployees, getLeaders, viewAllSalaries } from '../../../http';
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { exportToPrint } from '../../../utils/printHelper';
import Loading from '../../../components/Loading';

const Salaries = () => {

  const history = useHistory();
  const [employees, setEmployees] = useState();
  const [employeeMap, setEmployeeMap] = useState();
  const [selectedEmployee, setSelectedEmployee] = useState();
  const [salaries, setSalaries] = useState();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));

  const [years, setYears] = useState([]);

  useEffect(() => {
    let startYear = 2020; // Default fallback
    const currentYear = new Date().getFullYear();

    if (selectedEmployee && employeeMap && employees) {
        const emp = employees.find(e => e.id === selectedEmployee);
        if (emp && emp.createdAt) {
            startYear = new Date(emp.createdAt).getFullYear();
        }
    }
    
    const yearList = [];
    for (let y = startYear; y <= currentYear + 1; y++) {
      yearList.push(y);
    }
    setYears(yearList);
    
    // If selected year is not in the new list, reset to current
     if (!yearList.includes(parseInt(selectedYear))) {
          setSelectedYear(currentYear.toString());
      }

  }, [selectedEmployee, employees]);
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
      year: parseInt(selectedYear)
    }

    if (selectedEmployee) {
      obj["employeeID"] = selectedEmployee;
    } else {
      // If no employee selected, we might want to filter by month for the general list
      obj["month"] = months.indexOf(selectedMonth) + 1;
    }
    
    const res = await viewAllSalaries(obj);
    const { data } = res;
    setSalaries(data);
  }
  
  const handleDeleteSalary = async (e, salaryId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this salary record? This will NOT delete the user.")) {
      try {
        const res = await deleteSalary(salaryId);
        if (res.success) {
          toast.success("Salary record removed");
          searchSalary();
        } else {
          toast.error(res.message || "Failed to delete record");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error deleting salary");
      }
    }
  };

  const handlePrintSalary = () => {
    if (!salaries || salaries.length === 0) {
      alert("No salary data to print.");
      return;
    }

    let reportTitle = "Salary Report";
    let tableColumn = ["#", "Name", "Email", "Salary", "Bonus", "Last Updated"];
    let tableRows = [];

    if (selectedEmployee && salaries.length === 1 && employeeMap) {
      // Individual Salary Slip Style
      const salary = salaries[0];
      const empDetails = employeeMap[salary.employeeID];
      const name = empDetails ? empDetails[0] : 'N/A';
      const email = empDetails ? empDetails[1] : 'N/A';

      reportTitle = `Salary slip - ${name}`;
      tableColumn = ["Description", "Amount"];
      tableRows = [
        ["Employee Name", name],
        ["Email", email],
        ["Basic Salary", salary.salary.toString()],
        ["Bonus", salary.bonus.toString()],
        ["Reason for Bonus", salary.reasonForBonus || '-'],
        ["Total", (parseInt(salary.salary) + parseInt(salary.bonus)).toString()]
      ];
    } else {
      // List View
      tableRows = salaries.map((salary, index) => [
        index + 1,
        employeeMap && employeeMap[salary.employeeID] ? employeeMap[salary.employeeID][0] : 'N/A',
        employeeMap && employeeMap[salary.employeeID] ? employeeMap[salary.employeeID][1] : 'N/A',
        salary.salary,
        salary.bonus,
        salary.assignedDate || '-'
      ]);
    }

    exportToPrint({
      title: reportTitle,
      columns: tableColumn,
      data: tableRows,
      date: `Period: ${selectedMonth} ${selectedYear}`
    });
  };

  const handlePrintAnnualReport = () => {
    if (!selectedEmployee || !employeeMap) {
      alert("Please select an employee first.");
      return;
    }

    const empDetails = employeeMap[selectedEmployee];
    const name = empDetails ? empDetails[0] : 'N/A';
    
    const tableColumn = ["Month", "Salary", "Bonus", "Total", "Reason"];
    const tableRows = months.map((monthName, index) => {
      const monthNum = index + 1;
      const salaryRecord = salaries?.find(s => s.month === monthNum && String(s.employeeID) === String(selectedEmployee));
      const sal = salaryRecord ? salaryRecord.salary : 0;
      const bonus = salaryRecord ? salaryRecord.bonus : 0;
      return [
        monthName,
        sal,
        bonus,
        sal + bonus,
        salaryRecord?.reasonForBonus || '-'
      ];
    });

    const totalSalary = tableRows.reduce((acc, row) => acc + row[1], 0);
    const totalBonus = tableRows.reduce((acc, row) => acc + row[2], 0);
    
    tableRows.push(["TOTAL SALARY", "", "", totalSalary, ""]);
    tableRows.push(["TOTAL BONUS", "", "", totalBonus, ""]);
    tableRows.push(["GRAND TOTAL", "", "", totalSalary + totalBonus, ""]);

    exportToPrint({
      title: `Annual Salary Report - ${selectedYear}`,
      columns: tableColumn,
      data: tableRows,
      date: `Employee: ${name}`
    });
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
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody className="sidebar-wrapper">
                  {
                    salaries?.filter(salary => {
                      // If an employee is selected, only show records from their join date onwards
                      if (selectedEmployee) {
                        const user = employees?.find(e => e.id === selectedEmployee);
                        const joinDate = user && user.createdAt ? new Date(user.createdAt) : null;
                        const recordMonthDate = new Date(salary.year, salary.month - 1, 1);
                        const joinMonthDate = joinDate ? new Date(joinDate.getFullYear(), joinDate.getMonth(), 1) : null;
                        return !joinMonthDate || recordMonthDate >= joinMonthDate;
                      }
                      return true;
                    }).map((salary, idx) =>

                      <tr className='hover-effect' key={idx} onClick={() => history.push(`salary/${salary._id}`)}>
                        <td>{idx + 1}</td>
                        <td>{employeeMap && employeeMap[salary.employeeID] ? employeeMap[salary.employeeID][0] : 'N/A'}</td>
                        <td>{employeeMap && employeeMap[salary.employeeID] ? employeeMap[salary.employeeID][1] : 'N/A'}</td>
                         <td>{salary.salary}</td>
                        <td>{salary.bonus}</td>
                        <td>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={(e) => handleDeleteSalary(e, salary._id)}
                            title="Delete Salary Record"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>


                    )
                  }
                </tbody>
              </table>
            </div>

            {selectedEmployee && (
              <div className="mt-5">
                <div className="card-header d-flex justify-content-between align-items-center mb-3">
                  <h4>Annual Salary Report - {selectedYear}</h4>
                  <button onClick={handlePrintAnnualReport} className="btn btn-success">
                    <i className="fas fa-file-pdf mr-2"></i> Print Annual Report
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered table-md text-center bg-white">
                    <thead className="bg-light">
                      <tr>
                        <th>Month</th>
                        <th>Salary (tk)</th>
                        <th>Bonus (tk)</th>
                        <th>Total (tk)</th>
                        <th>Reason for Bonus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {months.map((monthName, index) => {
                        const monthNum = index + 1;
                        
                        // Check if user was active during this month
                        const user = employees?.find(e => e.id === selectedEmployee);
                        const joinDate = user && user.createdAt ? new Date(user.createdAt) : null;
                        const currentMonthDate = new Date(selectedYear, index, 1);
                        const joinMonthDate = joinDate ? new Date(joinDate.getFullYear(), joinDate.getMonth(), 1) : null;

                        if (joinMonthDate && currentMonthDate < joinMonthDate) {
                          return null;
                        }

                        const salaryRecord = salaries?.find(s => s.month === monthNum && String(s.employeeID) === String(selectedEmployee));
                        return (
                          <tr key={index}>
                            <td className="font-weight-bold">{monthName}</td>
                            <td>{salaryRecord ? salaryRecord.salary : '0'}</td>
                            <td>{salaryRecord ? salaryRecord.bonus : '0'}</td>
                            <td className="font-weight-bold">{salaryRecord ? (parseInt(salaryRecord.salary) + parseInt(salaryRecord.bonus)) : '0'}</td>
                            <td>{salaryRecord?.reasonForBonus || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            
          </div>)
          :
          <Loading />
      }
    </>


  )
}

export default Salaries;

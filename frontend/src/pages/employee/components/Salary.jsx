import React, { useEffect, useState } from 'react';
import { exportToPrint } from '../../../utils/printHelper';
import { useSelector } from 'react-redux';
import { viewEmployeeSalary } from '../../../http';
import { toast } from "react-toastify";
import Loading from '../../../components/Loading';






const Salary = () => {
  const {user} = useSelector(state => state.authSlice);
  const [salaries, setSalaries] = useState([]);
  const [salary, setSalary] = useState();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [years, setYears] = useState([]);
  
  useEffect(() => {
    if (user && user.createdAt) {
      const startYear = new Date(user.createdAt).getFullYear();
      const currentYear = new Date().getFullYear();
      const yearList = [];
      for (let y = startYear; y <= currentYear + 5; y++) {
        yearList.push(y);
      }
      setYears(yearList);
      // Ensure selected year is valid, otherwise set to current
      if (!yearList.includes(parseInt(selectedYear))) {
          setSelectedYear(currentYear.toString());
      }
    } else {
        // Fallback
        const currentYear = new Date().getFullYear();
         setYears([currentYear]);
    }
  }, [user]);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchData = async () => {
    const obj = {
      "employeeID": user.id,
      "year": parseInt(selectedYear)
    }
    const res = await viewEmployeeSalary(obj);
    const {data} = res;
    setSalaries(data || []);
    if(data && data.length > 0){
      // Set the most recent one as the 'active' one displayed in detail
      setSalary(data[data.length - 1]);
    } else {
      setSalary(null);
    }
  }

  useEffect(() => {
    fetchData();
  },[selectedYear]);

  const handlePrint = () => {
    if (!salary) return;

    const tableColumn = ["Description", "Amount"];
    const tableRows = [
      ["Employee Name", user.name],
      ["Email", user.email],
      ["Basic Salary", `tk ${salary.salary}`],
      ["Bonus", `tk ${salary.bonus}`],
      ["Total Salary", `tk ${parseInt(salary.salary) + parseInt(salary.bonus)}`],
      ["Description", salary.reasonForBonus || "N/A"],
      ["Updated On", salary.assignedDate]
    ];

    exportToPrint({
      title: "Salary Slip",
      columns: tableColumn,
      data: tableRows,
      date: `Generated: ${new Date().toLocaleDateString()}`
    });
  };

  const handlePrintAnnual = () => {
    if (!salaries || salaries.length === 0) {
      alert("No records to print for this year.");
      return;
    }

    const tableColumn = ["Month", "Salary (tk)", "Bonus (tk)", "Total (tk)"];
    const tableRows = months.map((monthName, index) => {
      const monthNum = index + 1;
      const sr = salaries.find(s => s.month === monthNum);
      const sal = sr ? sr.salary : 0;
      const bonus = sr ? sr.bonus : 0;
      return [monthName, sal, bonus, sal + bonus];
    });

    const totalSalary = tableRows.reduce((acc, row) => acc + row[1], 0);
    const totalBonus = tableRows.reduce((acc, row) => acc + row[2], 0);
    
    tableRows.push(["TOTAL SALARY", "", "", totalSalary]);
    tableRows.push(["TOTAL BONUS", "", "", totalBonus]);
    tableRows.push(["GRAND TOTAL", "", "", totalSalary + totalBonus]);

    exportToPrint({
      title: `Annual Salary Report - ${selectedYear}`,
      columns: tableColumn,
      data: tableRows,
      date: `Employee: ${user.name} (ID: ${user.id})`
    });
  };

  return (
    <>
      <div className="main-content">
        <section className="section">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4>Salary Overview</h4>
              <div className="d-flex align-items-center">
                <select 
                  className="form-control mr-3" 
                  style={{width: '120px'}}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button className='btn btn-success' onClick={handlePrintAnnual}>
                  <i className="fas fa-file-pdf mr-2"></i> Print Annual Report
                </button>
              </div>
            </div>
          </div>

          {!salary ? (
            <div className="card border-0 shadow-sm p-4 text-center">
              <h5 className="text-muted">No salary record found for {selectedYear}</h5>
            </div>
          ) : (
            <div className="card shadow-sm border-0">
              <div className="card-header border-bottom py-3">
                <h5 className="mb-0">Latest Update: {salary?.assignedDate}</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 text-center mb-4 mb-md-0">
                    <img 
                      className='img-fluid rounded-circle shadow-sm' 
                      src={user.image} 
                      alt={user.name} 
                      style={{width: '150px', height: '150px', objectFit: 'cover'}}
                      onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + user.name; }}
                    />
                  </div>
                  <div className="col-md-9">
                    <div className="table-responsive">
                      <table className='table table-borderless'>
                        <tbody>
                          <tr><th width="30%">Name</th><td>{user.name}</td></tr>
                          <tr><th>Email</th><td>{user.email}</td></tr>
                          <tr><th>Mobile</th><td>{user.mobile}</td></tr>
                          <tr><th>Last Salary</th><td className="font-weight-bold text-primary">tk {salary?.salary}</td></tr>
                          <tr><th>Last Bonus</th><td className="text-success">+ tk {salary?.bonus}</td></tr>
                          <tr><th>Reason</th><td className="text-muted small">{salary?.reasonForBonus}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5">
            <div className="card border-0 shadow-sm">
                <div className="card-header border-bottom py-3">
                    <h5 className="mb-0">Annual Salary Report for {selectedYear}</h5>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-striped table-md text-center mb-0">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Salary (tk)</th>
                                    <th>Bonus (tk)</th>
                                    <th>Total (tk)</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {months.map((monthName, index) => {
                                    const monthNum = index + 1;
                                    const sr = salaries.find(s => s.month === monthNum);
                                    return (
                                        <tr key={index}>
                                            <td className="font-weight-bold">{monthName}</td>
                                            <td>{sr ? sr.salary : '0'}</td>
                                            <td>{sr ? sr.bonus : '0'}</td>
                                            <td className="font-weight-bold text-primary">{sr ? (sr.salary + sr.bonus) : '0'}</td>
                                            <td>
                                              {sr && (
                                                <button className="btn btn-sm btn-outline-info" onClick={() => setSalary(sr)}>
                                                  <i className="fas fa-eye"></i> View
                                                </button>
                                              )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Salary;

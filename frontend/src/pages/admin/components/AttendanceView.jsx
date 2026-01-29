import React, { useEffect, useState } from 'react';
import { getAttendance, getEmployees, getLeaders } from '../../../http';
import { useHistory } from 'react-router-dom';
import { exportToPrint } from '../../../utils/printHelper';
import { toast } from 'react-toastify';
import Loading from '../../../components/Loading';
import AttendanceSummaryCards from '../../../components/common/AttendanceSummaryCards';
import LiveLocationMap from '../../../components/common/LiveLocationMap';
// import moment from 'moment';

const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const monthDays = {
  "January": 31,
  "February": 28,
  "March": 31,
  "April": 30,
  "May": 31,
  "June": 30,
  "July": 31,
  "August": 31,
  "September": 30,
  "October": 31,
  "November": 30,
  "December": 31,
}

const AttendanceView = () => {
  const history = useHistory();
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [attendance, setAttendance] = useState();
  const [employeeMap, setEmployeeMap] = useState();
  const [employees, setEmployees] = useState();
  const [selectedEmployee, setSelectedEmployee] = useState();
  
  // Live Map State
  const [showLiveMap, setShowLiveMap] = useState(false);
  const [liveMapTarget, setLiveMapTarget] = useState(null); // { userId, lat, lng }

  const numOfDays = monthDays[selectedMonth] || 30;
  const days = Array.from({ length: numOfDays }, (_, index) => index + 1);

  useEffect(() => {
    const dt = new Date();
    setSelectedYear(dt.getFullYear().toString());
    setSelectedMonth(months[dt.getMonth()]);
    setSelectedDay(dt.getDate().toString());

    const fetchEmployees = async () => {
      const emps = await getEmployees();
      const leaders = await getLeaders();
      let empObj = {};
      const employeesArr = emps?.data || [];
      const leadersArr = leaders?.data || [];
      
      employeesArr.forEach(employee => empObj[employee.id] = [employee.name, employee.email, 'Employee']);
      leadersArr.forEach(leader => empObj[leader.id] = [leader.name, leader.email, 'Leader']);
      
      setEmployeeMap(empObj);
      setEmployees([...employeesArr, ...leadersArr]);
    }
    fetchEmployees();
  }, []);

  const searchAttendance = React.useCallback(async () => {
    const obj = {};
    if (selectedEmployee) {
      obj["employeeID"] = selectedEmployee;
    }
    if (selectedYear) {
      obj["year"] = selectedYear;
    }
    if (selectedMonth) {
      obj["month"] = months.findIndex(month => month === selectedMonth) + 1;
    }
    if (selectedDay) {
      obj["date"] = selectedDay;
    }

    const res = await getAttendance(obj);
    if (!res.success) {
      toast.error(res.message || 'Failed to fetch attendance');
      setAttendance([]);
      return;
    }
    let { data } = res;

    // If a specific date is selected, show all employees
    // If specific employee selected, we might want to fill gaps for the month? 
    // For now, retaining existing logic but ensuring data consistency.

    if (!selectedEmployee && selectedDay && selectedMonth && selectedYear) {
      // View: All Employees for specific Date
      const dateRecords = data || [];
      const selectedDateObj = new Date(selectedYear, months.findIndex(m => m === selectedMonth), selectedDay);
      
      const allAttendance = employees
        .filter(emp => {
          // Filter out users who hadn't joined yet by this date
          const joinDate = emp.createdAt ? new Date(emp.createdAt) : null;
          const joinDayStart = joinDate ? new Date(joinDate.getFullYear(), joinDate.getMonth(), joinDate.getDate()) : null;
          return !joinDayStart || selectedDateObj >= joinDayStart;
        })
        .map(emp => {
          const existing = dateRecords.find(a => a.employeeID === emp.id);
          if (existing) return existing;
          return {
            employeeID: emp.id,
            year: parseInt(selectedYear),
            month: months.findIndex(m => m === selectedMonth) + 1,
            date: parseInt(selectedDay),
            day: new Date(selectedYear, months.findIndex(m => m === selectedMonth), selectedDay).toLocaleDateString('en-US', { weekday: 'long' }),
            present: false
          };
        });
      data = allAttendance;
    } else if (selectedEmployee && selectedMonth && selectedYear) {
      // View: Specific Employee for Month (Fill gaps)
      const monthIndex = months.findIndex(m => m === selectedMonth);
      const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate();
      const fullMonthData = [];

      // Get user's join date
      const user = employees.user ? employees.find(e => e.id === (selectedEmployee.id || selectedEmployee)) : null;
      // Fixed: employees logic was potentially accessing undefined properties
      // Actually employees is an array of objects {id, name...}
      // Re-finding user safely:
      const userObj = Array.isArray(employees) ? employees.find(e => e.id === selectedEmployee) : null;
      
      const joinDate = userObj && userObj.createdAt ? new Date(userObj.createdAt) : null;
      const joinDayStart = joinDate ? new Date(joinDate.getFullYear(), joinDate.getMonth(), joinDate.getDate()) : null;

      for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(selectedYear, monthIndex, i);
        
        // Skip dates before joining
        if (joinDayStart && currentDate < joinDayStart) {
          continue;
        }

        const record = data?.find(d => d.date === i);
        if (record) {
          fullMonthData.push(record);
        } else {
          fullMonthData.push({
            employeeID: selectedEmployee,
            year: parseInt(selectedYear),
            month: monthIndex + 1,
            date: i,
            day: new Date(selectedYear, monthIndex, i).toLocaleDateString('en-US', { weekday: 'long' }),
            present: false
          });
        }
      }
      data = fullMonthData;
    }

    setAttendance(data);
  }, [selectedEmployee, selectedYear, selectedMonth, selectedDay, employees]);

  useEffect(() => {
    // Only auto-fetch if we have the initial data loaded or if specific params are changing
    // Avoiding infinite loop or excessive calls if not needed, but existing logic relies on this.
    if (employees && selectedYear && selectedMonth && selectedDay) {
      searchAttendance();
    }
  }, [employees, selectedDay, selectedMonth, selectedYear, searchAttendance]);

  // Keeping original logic structure but ensuring it works with manual search primarily.
  // The original useEffect was a bit complex. I'll rely on searchAttendance mostly.

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '-';
    try {
      const splitCheckIn = checkIn.split(':').map(Number);
      const splitCheckOut = checkOut.split(':').map(Number);

      const inH = splitCheckIn[0];
      const inM = splitCheckIn[1] || 0;
      const inS = splitCheckIn[2] || 0;

      const outH = splitCheckOut[0];
      const outM = splitCheckOut[1] || 0;
      const outS = splitCheckOut[2] || 0;

      const inTotal = inH * 3600 + inM * 60 + inS;
      const outTotal = outH * 3600 + outM * 60 + outS;

      let diff = outTotal - inTotal;
      if (diff < 0) diff += 24 * 3600;

      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);

      return `${h}h ${m}m`;
    } catch (error) {
      return '-';
    }
  };

  const getDayStatus = (record, attendanceDate) => {
    if (record && record.status === 'Leave') return "Leave (Approved)";
    if (record && record.present === true) return "Present";

    // Auto Absent Logic
    // Office starts at 12 PM. Deadline is 12 hours later -> 12 AM next day.
    const now = new Date();
    const day = attendanceDate.date;
    const month = attendanceDate.month;
    const year = attendanceDate.year;

    // Create a date object for the next day at Midnight
    const deadline = new Date(year, month - 1, day);
    deadline.setDate(deadline.getDate() + 1);
    deadline.setHours(0, 0, 0, 0);

    if (now > deadline) {
      return "Absent (Auto)";
    }

    return "-";
  };

  const handleLiveTrack = (att) => {
      // Logic to parse location string "lat,long"
      let initialLat = 0;
      let initialLng = 0;
      if (att.checkInLocation) {
          const parts = att.checkInLocation.split(',');
          if (parts.length === 2) {
              initialLat = parseFloat(parts[0]);
              initialLng = parseFloat(parts[1]);
          }
      }
      setLiveMapTarget({
          userId: att.employeeID,
          lat: initialLat,
          lng: initialLng
      });
      setShowLiveMap(true);
  };



  const handlePrint = () => {
    // Default Print Handler (Current View)
    if (!attendance || attendance.length === 0) return;

    let reportTitle = "Attendance Logs";
    let tableColumn = ["Date", "Name", "Check-In", "Check-Out", "Hours", "Status"];
    let tableRows = [];
    let periodText = `${selectedDay} ${selectedMonth} ${selectedYear}`;

    if (selectedEmployee && employeeMap) {
      const details = employeeMap[selectedEmployee];
      const name = details[0];
      reportTitle = `Attendance Report - ${name}`;
      periodText = `Period: ${selectedMonth} ${selectedYear}`;
      
      tableColumn = ["Date", "Day", "Check-In", "Check-Out", "Hours", "Status"];
      tableRows = attendance.map(att => [
        `${att.date}/${att.month}/${att.year}`,
        att.day,
        att.checkInTime || "-",
        att.checkOutTime || "-",
        calculateWorkHours(att.checkInTime, att.checkOutTime),
        getDayStatus(att, { date: att.date, month: att.month, year: att.year })
      ]);
    } else {
      tableRows = attendance.map(att => [
        `${att.date}/${att.month}/${att.year}`,
        employeeMap?.[att.employeeID]?.[0] || '-',
        att.checkInTime || "-",
        att.checkOutTime || "-",
        calculateWorkHours(att.checkInTime, att.checkOutTime),
        getDayStatus(att, { date: att.date, month: att.month, year: att.year })
      ]);
    }

    exportToPrint({
      title: reportTitle,
      columns: tableColumn,
      data: tableRows,
      date: periodText
    });
  };

//   const handleRowPrint = async (employeeId) => {
//     // 1. Fetch Full Month Data for this employee
//     if (!selectedYear) {
//       alert("Please select Year first.");
//       return;
//     }

//     try {
//       const obj = {
//         "employeeID": employeeId,
//         "year": parseInt(selectedYear)
//       };
//       if (selectedMonth) {
//         obj["month"] = months.findIndex(m => m === selectedMonth) + 1;
//       }

//       const res = await getAttendance(obj);
//       const serverData = res.data || [];

//       // 2. Fill gaps logic
//       let fullData = [];
//       const targetMonths = selectedMonth
//         ? [months.findIndex(m => m === selectedMonth) + 1]
//         : Array.from({ length: 12 }, (_, i) => i + 1); // 1 to 12 if no month selected

//       targetMonths.forEach(mIndex => {
//         const daysInMonth = new Date(selectedYear, mIndex, 0).getDate();
//         for (let i = 1; i <= daysInMonth; i++) {
//           // Check if data exists for this specific date
//           const record = serverData.find(d => d.date === i && d.month === mIndex);
//           if (record) {
//             fullData.push(record);
//           } else {
//             fullData.push({
//               employeeID: employeeId,
//               year: parseInt(selectedYear),
//               month: mIndex,
//               date: i,
//               day: new Date(selectedYear, mIndex - 1, i).toLocaleDateString('en-US', { weekday: 'long' }),
//               present: false
//             });
//           }
//         }
//       });

//       // 3. Prepare User Details
//       const details = employeeMap[employeeId];
//       const userDetails = {
//         name: details ? details[0] : "Employee",
//         email: details ? details[1] : "-",
//         role: details ? (details[2] || "Employee") : "Employee",
//         id: employeeId
//       };

//       const period = {
//         year: selectedYear
//       };

//       // 4. Generate PDF
//       generatePDF(fullData, userDetails, period);

//     } catch (err) {
//       console.error(err);
//       alert("Failed to generate report.");
//     }
//   };

  return (
    <>
      {
        attendance ? (
          <div className="main-content">
            <section className="section">
              {/* Page Header */}
              <div className="glass-card mb-4 p-4 d-flex justify-content-between align-items-center">
                  <div>
                      <h3 className="font-weight-bold text-dark mb-1">Attendance Management</h3>
                      <p className="text-muted mb-0">Monitor and track employee presence and live location</p>
                  </div>
                  <div className="d-flex gap-3">
                      <button onClick={handlePrint} className="btn btn-lg rounded-pill px-4 shadow-sm font-weight-bold btn-success">
                          <i className="fas fa-file-pdf mr-2"></i>Export Logs
                      </button>
                  </div>
              </div>

              {/* Attendance Summary Cards for Selected Employee */}
              {selectedEmployee && (
                <div className="mb-4">
                   <AttendanceSummaryCards 
                    userId={selectedEmployee} 
                    dateRange={selectedMonth && selectedYear ? {
                      startDate: new Date(selectedYear, months.findIndex(m => m === selectedMonth), 1),
                      endDate: new Date(selectedYear, months.findIndex(m => m === selectedMonth) + 1, 0)
                    } : null}
                  />
                </div>
              )}

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
                          <label className="text-muted small font-weight-bold mb-2">YEAR</label>
                          <select
                              className='form-control rounded-pill border-0 bg-light shadow-sm'
                              value={selectedYear}
                              onChange={(e) => setSelectedYear(e.target.value)}
                          >
                            <option value="">Select Year</option>
                            {years.map((year) => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                      </div>

                      <div className="col-md-2">
                          <label className="text-muted small font-weight-bold mb-2">MONTH</label>
                          <select
                              className='form-control rounded-pill border-0 bg-light shadow-sm'
                              value={selectedMonth}
                              onChange={(e) => setSelectedMonth(e.target.value)}
                          >
                            <option value="">Select Month</option>
                            {months.map((month) => (
                              <option key={month} value={month}>{month}</option>
                            ))}
                          </select>
                      </div>

                      <div className="col-md-2">
                          <label className="text-muted small font-weight-bold mb-2">DAY</label>
                          <select
                              className='form-control rounded-pill border-0 bg-light shadow-sm'
                              value={selectedDay}
                              onChange={(e) => setSelectedDay(e.target.value)}
                          >
                             <option value="">Select Day</option>
                             {days.map((day) => (
                               <option key={day} value={day}>{day}</option>
                             ))}
                          </select>
                      </div>

                      <div className="col-md-3">
                          <button onClick={searchAttendance} className="btn btn-primary btn-block rounded-pill font-weight-bold shadow-sm" style={{ height: '42px' }}>
                              <i className="fas fa-search mr-2"></i> Refresh Logs
                          </button>
                      </div>
                  </div>
              </div>

              {/* Attendance Table */}
              <div className="glass-card border-0 shadow-lg overflow-hidden">
                  <div className="card-header bg-white border-bottom py-4 d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 font-weight-bold text-dark">
                          <i className="fas fa-list-alt mr-2 text-primary"></i> Attendance Logs
                      </h5>
                      <span className="badge bg-primary-soft text-primary rounded-pill px-3 py-2">
                          Showing {attendance?.length || 0} Records
                      </span>
                  </div>
                  <div className="p-3">
                    <div className="table-responsive">
                      <table className="table table-borderless align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                        <thead>
                          <tr className="text-muted text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>
                            <th className="ps-4">Date</th>
                            <th>Employee</th>
                            <th>Entrance</th>
                            <th>Departure</th>
                            <th>Hours</th>
                            <th>Status</th>
                            <th className="text-right pe-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendance?.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="text-center p-5 text-muted">No attendance logs found for specified criteria.</td>
                            </tr>
                          ) : attendance?.map((att, idx) => {
                            const status = getDayStatus(att, { date: att.date, month: att.month, year: att.year });
                            const empData = employeeMap?.[att.employeeID];
                            return (
                              <tr key={idx} className="soft-card shadow-sm hover-lift">
                                <td className="ps-4 py-3">
                                  <div className="fw-bold text-dark">{att.date + "/" + att.month + "/" + att.year}</div>
                                  <div className="text-muted small">{att.day}</div>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="rounded-circle bg-primary-soft text-primary d-flex align-items-center justify-content-center mr-3 font-weight-bold shadow-sm" style={{width: '40px', height: '40px'}}>
                                      {empData?.[0]?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                      <div className="fw-bold text-dark">{empData?.[0] || 'Unknown'}</div>
                                      <div className="text-muted small">{empData?.[1] || '-'}</div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="fw-bold text-primary">{att.checkInTime || '-'}</div>
                                  <div className="text-muted small" style={{fontSize: '0.65rem'}}>Entrance</div>
                                </td>
                                <td>
                                  <div className="fw-bold text-warning">{att.checkOutTime || '-'}</div>
                                  <div className="text-muted small" style={{fontSize: '0.65rem'}}>Departure</div>
                                </td>
                                <td>
                                  <div className="badge border text-dark font-weight-bold">
                                    <i className="far fa-clock mr-1 text-muted"></i>
                                    {calculateWorkHours(att.checkInTime, att.checkOutTime)}
                                  </div>
                                </td>
                                <td>
                                  <div className={`badge rounded-pill px-3 ${
                                    status === 'Present' ? 'bg-success-soft text-success' : 
                                    status.startsWith('Leave') ? 'bg-primary-soft text-primary' : 
                                    status === '-' ? 'bg-light text-muted' : 'bg-danger-soft text-danger'
                                  }`}>
                                    {status}
                                  </div>
                                </td>
                                <td className="text-right pe-4">
                                  <div className="d-flex justify-content-end gap-2">
                                    {att.checkInLocation && (
                                      <a 
                                        href={`https://www.google.com/maps?q=${att.checkInLocation}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-soft-primary rounded-pill px-3"
                                        title="View Entrance Location"
                                      >
                                        <i className="fas fa-map-marker-alt"></i>
                                      </a>
                                    )}
                                    {
                                      (att.checkInTime && !att.checkOutTime && 
                                       att.date === new Date().getDate() && 
                                       att.month === (new Date().getMonth() + 1) && 
                                       att.year === new Date().getFullYear()) && (
                                        <button 
                                          className="btn btn-sm btn-soft-danger rounded-pill px-3"
                                          onClick={() => handleLiveTrack(att)}
                                          title="Live Track Employee"
                                        >
                                          <i className="fas fa-satellite-dish animate-pulse"></i>
                                        </button>
                                      )
                                    }
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
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

        {/* Live Map Modal */}
        {showLiveMap && liveMapTarget && (
          <div 
            className="modal d-block" 
            tabIndex="-1" 
            role="dialog" 
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 1050 }}
            onClick={() => setShowLiveMap(false)}
          >
            <div 
              className="modal-dialog modal-lg modal-dialog-centered" 
              role="document"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass-card border-0 shadow-2xl overflow-hidden w-100">
                <div className="modal-header border-bottom bg-white py-3 px-4 d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="modal-title font-weight-bold text-dark mb-0">Live Tracking</h5>
                    <p className="text-muted small mb-0">Real-time geolocation for {employeeMap?.[liveMapTarget.userId]?.[0]}</p>
                  </div>
                  <button 
                    type="button" 
                    className="close border-0 bg-transparent h4 mb-0" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLiveMap(false);
                    }}
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body p-0" style={{ height: '450px' }}>
                  <LiveLocationMap 
                    userId={liveMapTarget.userId} 
                    initialLat={liveMapTarget.lat} 
                    initialLng={liveMapTarget.lng} 
                  />
                </div>
                <div className="modal-footer border-top bg-light p-3">
                  <button 
                    type="button" 
                    className="btn btn-secondary rounded-pill px-4 font-weight-bold" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLiveMap(false);
                    }}
                  >
                    Close Tracker
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </>

  )
}

export default AttendanceView;

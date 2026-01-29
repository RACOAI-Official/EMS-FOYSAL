import React, { useEffect, useState } from 'react'
import { markEmployeeAttendance, markEmployeeCheckOut, viewEmployeeAttendance } from '../../../http';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import socket from '../../../socket';
import Loading from '../../../components/Loading';
import AttendanceSummaryCards from '../../../components/common/AttendanceSummaryCards';




const Attendance = () => {
  const { user } = useSelector(state => state.authSlice);
  const [isAttendanceMarked, setIsAttendanceMarked] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [attendance, setAttendance] = useState();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationError, setLocationError] = useState('');

  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]; // Customize this as needed
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
  const numOfDays = monthDays[selectedMonth];
  const days = Array.from({ length: numOfDays }, (_, index) => index + 1);

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

  useEffect(() => {
    // Check Status for Today from DB
    const checkTodayStatus = async () => {
      const dt = new Date();
      const obj = {
        "employeeID": user.id,
        "year": dt.getFullYear(),
        "month": dt.getMonth() + 1,
        "date": dt.getDate()
      }
      try {
        const res = await viewEmployeeAttendance(obj);
        // viewEmployeeAttendance returns a list. If list has items, attendance is marked.
        if (res.success && res.data && res.data.length > 0) {
          setIsAttendanceMarked(true);
          const todayRecord = res.data[0];
          if (todayRecord.checkOutTime) {
            setIsCheckedOut(true);
          }
        }
      } catch (err) {
        console.error("Failed to check today's status", err);
      }
    }
    checkTodayStatus();
  }, [user.id]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch all attendance for the user by default
      const res = await viewEmployeeAttendance({ "employeeID": user.id });
      if (res.success) {
        setAttendance(res.data || []);
      }
    }
    fetchData();
  }, [user.id]);



  const getLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        toast.warning('Geolocation not supported. Attendance will be marked without location.');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(`${position.coords.latitude},${position.coords.longitude}`);
        },
        (error) => {
          console.error('Error getting location:', error);
          
          if (error.code === 1 && error.message.includes("secure origin")) {
              toast.warning('Location unavailable (HTTPS required). Attendance will be marked without location.');
          } else if (error.code === 1) {
              toast.warning('Location permission denied. Attendance will be marked without location.');
          } else {
              toast.warning('Unable to get location. Attendance will be marked without location.');
          }
          
          resolve(null);
        }
      );
    });
  };

  const markAttendance = async () => {
    const location = await getLocation();
    console.log('📍 Location captured:', location); // Debug log
    // Allow attendance even if location is null
    const res = await markEmployeeAttendance({ "employeeID": user.id, location });
    const { success } = res;
    if (success) {
      toast.success(res.message);
      setIsAttendanceMarked(true);
      setRefreshTrigger(prev => prev + 1);
      // Trigger background tracker
      const event = new Event('attendance-update');
      window.dispatchEvent(event);
      // Refresh the table
      searchAttendance(); 
    }
  }

  const markCheckOut = async () => {
    const location = await getLocation();
    // Allow checkout even if location is null
    const res = await markEmployeeCheckOut({ "employeeID": user.id, location });
    const { success } = res;
    if (success) {
      toast.success(res.message);
      setIsCheckedOut(true);
      setRefreshTrigger(prev => prev + 1);
      // Trigger background tracker
      const event = new Event('attendance-update');
      window.dispatchEvent(event);
      // Refresh the table
      searchAttendance();
    } else {
      toast.error(res.message || 'Failed to mark check-out');
    }
  }


  const searchAttendance = async () => {
    const obj = {
      "employeeID": user.id
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

    const res = await viewEmployeeAttendance(obj);
    if (!res.success) {
      toast.error(res.message || 'Failed to fetch attendance');
      setAttendance([]);
      return;
    }
    let { data } = res;

    // Fill gaps logic
    if (selectedMonth && selectedYear && !selectedDay) {
      const monthIndex = months.findIndex(m => m === selectedMonth);
      const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate();
      const fullMonthData = [];

      for (let i = 1; i <= daysInMonth; i++) {
        const record = data?.find(d => d.date === i);
        if (record) {
          fullMonthData.push(record);
        } else {
          fullMonthData.push({
            employeeID: user.id,
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
  }
  return (
    <>
      {
        attendance ? (
    <div className="main-content">
      <section className="section">
        {/* Page Header & Actions */}
        <div className="glass-card mb-4 p-4 d-flex justify-content-between align-items-center">
            <div>
                <h3 className="font-weight-bold text-dark mb-1">Time & Attendance</h3>
                <p className="text-muted mb-0">Track your daily working hours and location</p>
            </div>
            <div className="d-flex gap-3">
                <button
                    className={`btn btn-lg rounded-pill px-4 shadow-sm font-weight-bold ${isAttendanceMarked ? "btn-light border text-success" : "btn-primary"}`}
                    onClick={markAttendance}
                    disabled={isAttendanceMarked}
                >
                    <i className={`fas ${isAttendanceMarked ? "fa-check-circle" : "fa-sign-in-alt"} mr-2`}></i>
                    {isAttendanceMarked ? "Checked In" : "Mark Entrance"}
                </button>
                <button
                    className={`btn btn-lg rounded-pill px-4 shadow-sm font-weight-bold ${isCheckedOut ? "btn-light border text-muted" : (isAttendanceMarked ? "btn-warning text-white" : "btn-light border text-muted")}`}
                    onClick={markCheckOut}
                    disabled={!isAttendanceMarked || isCheckedOut}
                >
                    <i className={`fas ${isCheckedOut ? "fa-flag-checkered" : "fa-sign-out-alt"} mr-2`}></i>
                    {isCheckedOut ? "Departure Marked" : "Mark Departure"}
                </button>
            </div>
        </div>

        {/* Attendance Summary Cards */}
        <AttendanceSummaryCards />

        {/* Search Filters */}
        <div className="glass-card border-0 shadow-sm mb-4 p-4">
            <div className="row g-3 align-items-end">
                <div className="col-md-3">
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

                <div className="col-md-3">
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

                <div className="col-md-3">
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
                        <i className="fas fa-search mr-2"></i> Filter Logs
                    </button>
                </div>
            </div>
        </div>

        {/* Attendance Log Table */}
        <div className="glass-card border-0 shadow-lg overflow-hidden">
            <div className="card-header bg-white border-bottom py-4">
                <h5 className="mb-0 font-weight-bold text-dark">
                    <i className="fas fa-history mr-2 text-primary"></i> Attendance History
                </h5>
            </div>
            <div className="p-3">
                <div className="table-responsive">
                    <table className="table table-borderless align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                        <thead>
                            <tr className="text-muted text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>
                                <th className="ps-4">Date</th>
                                <th>Day</th>
                                <th>Entrance</th>
                                <th>Departure</th>
                                <th>Hours</th>
                                <th>Status</th>
                                <th className="text-right pe-4">Location Tracks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance?.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center p-5 text-muted">No attendance logs found for the selected period.</td>
                                </tr>
                            ) : attendance?.map((att, idx) => {
                                const status = getDayStatus(att, { date: att.date, month: att.month, year: att.year });
                                return (
                                    <tr key={idx} className="soft-card shadow-sm hover-lift">
                                        <td className="ps-4 py-3">
                                            <div className="fw-bold text-dark">{att.date + "/" + att.month + "/" + att.year}</div>
                                        </td>
                                        <td>
                                            <span className="text-muted small font-weight-bold">{att.day}</span>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-primary">{att.checkInTime || '-'}</div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-warning">{att.checkOutTime || '-'}</div>
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
                                                        title="Check-In Location"
                                                    >
                                                        <i className="fas fa-map-marker-alt mr-1"></i> In
                                                    </a>
                                                )}
                                                {att.checkOutLocation && (
                                                    <a 
                                                        href={`https://www.google.com/maps?q=${att.checkOutLocation}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="btn btn-sm btn-soft-warning rounded-pill px-3"
                                                        title="Check-Out Location"
                                                    >
                                                        <i className="fas fa-map-marker-alt mr-1"></i> Out
                                                    </a>
                                                )}
                                                {!att.checkInLocation && !att.checkOutLocation && <span className="text-muted small italic">N/A</span>}
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
    </div>
) : (
    <Loading />
)
      }
    </>
  )
}

export default Attendance;

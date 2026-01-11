import React, { useEffect, useState } from 'react'
import { markEmployeeAttendance, markEmployeeCheckOut, viewEmployeeAttendance } from '../../http';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loading from '../Loading';







const Attendance = () => {
  const { user } = useSelector(state => state.authSlice);
  const [isAttendanceMarked, setIsAttendanceMarked] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [attendance, setAttendance] = useState();

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
    const dt = new Date();
    const obj = {
      "employeeID": user.id,
      "year": dt.getFullYear(),
      "month": dt.getMonth() + 1
    }
    const fetchData = async () => {
      const res = await viewEmployeeAttendance(obj);
      let { data } = res;

      // Fill gaps logic for initial load (current month)
      const monthIndex = dt.getMonth();
      const year = dt.getFullYear();
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const fullMonthData = [];

      for (let i = 1; i <= daysInMonth; i++) {
        const record = data?.find(d => d.date === i);
        if (record) {
          fullMonthData.push(record);
        } else {
          fullMonthData.push({
            employeeID: user.id,
            year: year,
            month: monthIndex + 1,
            date: i,
            day: new Date(year, monthIndex, i).toLocaleDateString('en-US', { weekday: 'long' }),
            present: false
          });
        }
      }
      setAttendance(fullMonthData);
    }
    fetchData();

  }, []);



  const markAttendance = async () => {
    const res = await markEmployeeAttendance({ "employeeID": user.id });
    const { success } = res;
    if (success) {
      toast.success(res.message);
      setIsAttendanceMarked(true);
      // Refresh the table
      searchAttendance(); 
    }
  }

  const markCheckOut = async () => {
    const res = await markEmployeeCheckOut({ "employeeID": user.id });
    const { success } = res;
    if (success) {
      toast.success(res.message);
      setIsCheckedOut(true);
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
        attendance ?
          (<div className="main-content">
            <section className="section">
              <div className="card">
                <div className="card-header d-flex justify-content-between">
                  <h4>Attendance</h4>
                  <div>
                    <button
                      className={`btn btn-lg ${isAttendanceMarked ? "btn-secondary" : "btn-primary"} btn-icon-split mr-2`}
                      onClick={markAttendance}
                      disabled={isAttendanceMarked}
                    >
                      {isAttendanceMarked ? "Attendance Marked" : "Mark Attendance"}
                    </button>
                    <button
                      className={`btn btn-lg ${isCheckedOut ? "btn-secondary" : "btn-warning"} btn-icon-split`}
                      onClick={markCheckOut}
                      disabled={!isAttendanceMarked || isCheckedOut}
                    >
                      {isCheckedOut ? "Checked Out" : "Mark Check-Out"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-center w-100">

                <div className="col">
                  <select
                    className='form-control select2'
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <option value="">Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col">
                  <select
                    className='form-control select2'
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value="">Month</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col">
                  <select
                    className='form-control select2'
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                  >
                    <option value="">Day</option>
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={searchAttendance} className="btn btn-lg btn-primary col">Search</button>
              </div>
            </section>
            <div className="table-responsive">
              <table className="table table-striped table-md center-text">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Check-In Time</th>
                    <th>Check-Out Time</th>
                    <th>Working Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    attendance?.map((att, idx) =>
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{att.date + "/" + att.month + "/" + att.year}</td>
                        <td>{att.day}</td>
                        <td>{att.checkInTime || '-'}</td>
                        <td>{att.checkOutTime || '-'}</td>
                        <td>{calculateWorkHours(att.checkInTime, att.checkOutTime)}</td>
                        <td>{getDayStatus(att, { date: att.date, month: att.month, year: att.year })}</td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
            </div>
          </div>
          ) :
          <Loading />
      }
    </>
  )
}

export default Attendance;

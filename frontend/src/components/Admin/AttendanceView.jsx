import React, { useEffect, useState } from 'react'
import { getAttendance, getEmployees, getLeaders } from '../../http';
import Loading from '../Loading';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';

const AttendanceView = () => {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [attendance, setAttendance] = useState();
  const [employeeMap, setEmployeeMap] = useState();
  const [employees, setEmployees] = useState();
  const [selectedEmployee, setSelectedEmployee] = useState();

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

  useEffect(() => {
    const dt = new Date();
    setSelectedYear(dt.getFullYear().toString());
    setSelectedMonth(months[dt.getMonth()]);
    setSelectedDay(dt.getDate().toString());

    const fetchEmployees = async () => {
      const emps = await getEmployees();
      const leaders = await getLeaders();
      let empObj = {};
      emps.data.forEach(employee => empObj[employee.id] = [employee.name, employee.email, 'Employee']);
      leaders.data.forEach(leader => empObj[leader.id] = [leader.name, leader.email, 'Leader']);
      setEmployeeMap(empObj);
      setEmployees([...emps.data, ...leaders.data]);
    }
    fetchEmployees();
  }, []);

  useEffect(() => {
    // Only auto-fetch if we have the initial data loaded or if specific params are changing
    // Avoiding infinite loop or excessive calls if not needed, but existing logic relies on this.
    if (employees && selectedYear && selectedMonth && selectedDay) {
      searchAttendance();
    }
  }, [employees, selectedDay, selectedMonth, selectedYear]);

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

  const searchAttendance = async () => {
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
    let { data } = res;

    // If a specific date is selected, show all employees
    // If specific employee selected, we might want to fill gaps for the month? 
    // For now, retaining existing logic but ensuring data consistency.

    if (!selectedEmployee && selectedDay && selectedMonth && selectedYear) {
      // View: All Employees for specific Date
      const dateRecords = data || [];
      const allAttendance = employees.map(emp => {
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

      for (let i = 1; i <= daysInMonth; i++) {
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
  }

  const generatePDF = (attendanceData, userDetails, period) => {
    if (!attendanceData || attendanceData.length === 0) {
      alert("No attendance data to print.");
      return;
    }

    const doc = new jsPDF();
    const { name, role, id } = userDetails;

    // Group data by Month-Year key
    const groupedData = {};
    attendanceData.forEach(att => {
      const key = `${att.month}-${att.year}`;
      if (!groupedData[key]) groupedData[key] = [];
      groupedData[key].push(att);
    });

    // Sort keys to ensure chronological order (e.g., 1-2025, 2-2025...)
    const sortedKeys = Object.keys(groupedData).sort((a, b) => {
      const [m1, y1] = a.split('-').map(Number);
      const [m2, y2] = b.split('-').map(Number);
      return y1 - y2 || m1 - m2;
    });

    sortedKeys.forEach((key, index) => {
      if (index > 0) doc.addPage(); // New page for each month

      const [monthNum, yearNum] = key.split('-').map(Number);
      const monthName = months[monthNum - 1];
      const currentMonthData = groupedData[key];

      // Ensure sorted by date within month
      currentMonthData.sort((a, b) => a.date - b.date);

      // Header Section
      doc.setFontSize(20);
      doc.text("Easy Employee", 15, 20);

      doc.setFontSize(9);
      doc.text("No 2, 4th Floor, 100ft Road", 15, 25);
      doc.text("Koramangala, Bangalore - 560034", 15, 29);

      // Title
      doc.setFontSize(14);
      doc.text("Attendance History Report", 105, 38, null, null, "center");

      // Employee & Period Details
      doc.setFontSize(9);
      doc.text(`Employee Name: ${name}`, 15, 48);
      doc.text(`Employee ID: ${id}`, 15, 53);
      doc.text(`Role: ${role}`, 15, 58);

      const startDate = `01 ${monthName} ${yearNum}`;
      const lastDay = new Date(yearNum, monthNum, 0).getDate();
      const endDate = `${lastDay} ${monthName} ${yearNum}`;

      doc.text(`Reporting Period: ${startDate} to ${endDate}`, 140, 48);
      doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 140, 53);

      // Summary Statistics for this month
      let presentCount = 0;
      let absentCount = 0;
      let offCount = 0;

      currentMonthData.forEach(att => {
        const status = getDayStatus(att, { date: att.date, month: att.month, year: att.year });
        if (status === "Present") presentCount++;
        else if (status.includes("Absent") && !status.includes("Auto") && att.present === false) absentCount++;
        else if (status.includes("Absent (Auto)")) absentCount++;
        else offCount++;
      });

      doc.autoTable({
        startY: 63,
        head: [['Present Days', 'Absent Days', 'Off/Leave Days']],
        body: [[presentCount, absentCount, offCount]],
        theme: 'striped',
        headStyles: { fillColor: [103, 119, 239], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        styles: { cellPadding: 1, minCellHeight: 8 },
        margin: { left: 15, right: 15 }
      });

      // Main Table
      const tableColumn = ["Date", "Day", "Check-In", "Check-Out", "Total Hours", "Status"];
      const tableRows = currentMonthData.map(att => {
        const attDate = `${att.date}/${att.month}/${att.year}`;
        const workHours = calculateWorkHours(att.checkInTime, att.checkOutTime);
        const status = getDayStatus(att, { date: att.date, month: att.month, year: att.year });

        return [
          attDate,
          att.day,
          att.checkInTime || "-",
          att.checkOutTime || "-",
          workHours,
          status
        ];
      });

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 5,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [103, 119, 239], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 1 },
        margin: { left: 15, right: 15 },
        didDrawPage: function (data) {
          // Footer
          var str = "Page " + doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          var pageSize = doc.internal.pageSize;
          var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          doc.text(str, data.settings.margin.left, pageHeight - 5);
        }
      });
    });

    // Preview
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    // Default Print Handler (Current View)
    if (!attendance || attendance.length === 0) return;

    if (selectedEmployee && employeeMap) {
      // Single Employee Full Month View
      const details = employeeMap[selectedEmployee];
      const userDetails = {
        name: details[0],
        email: details[1],
        role: details[2] || "Employee",
        id: selectedEmployee
      };
      const period = {
        start: selectedMonth && selectedYear ? `01 ${selectedMonth} ${selectedYear}` : "N/A",
        end: selectedMonth && selectedYear ? `${new Date(selectedYear, months.findIndex(m => m === selectedMonth) + 1, 0).getDate()} ${selectedMonth} ${selectedYear}` : "N/A",
        month: selectedMonth,
        year: selectedYear
      };
      generatePDF(attendance, userDetails, period);
    } else {
      const doc = new jsPDF();
      doc.text("Attendance Daily Report", 105, 20, null, null, "center");
      doc.setFontSize(10);
      doc.text(`Date: ${selectedDay} ${selectedMonth} ${selectedYear}`, 15, 30);

      const tableColumn = ["Name", "Check-In", "Check-Out", "Hours", "Status"];
      const tableRows = attendance.map(att => [
        employeeMap?.[att.employeeID]?.[0] || '-',
        att.checkInTime || "-",
        att.checkOutTime || "-",
        calculateWorkHours(att.checkInTime, att.checkOutTime),
        getDayStatus(att, { date: att.date, month: att.month, year: att.year })
      ]);

      doc.autoTable({
        startY: 40,
        head: [tableColumn],
        body: tableRows,
      });

      // Preview
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
    }
  };

  const handleRowPrint = async (employeeId) => {
    // 1. Fetch Full Month Data for this employee
    if (!selectedYear) {
      alert("Please select Year first.");
      return;
    }

    try {
      const obj = {
        "employeeID": employeeId,
        "year": parseInt(selectedYear)
      };
      if (selectedMonth) {
        obj["month"] = months.findIndex(m => m === selectedMonth) + 1;
      }

      const res = await getAttendance(obj);
      const serverData = res.data || [];

      // 2. Fill gaps logic
      let fullData = [];
      const targetMonths = selectedMonth
        ? [months.findIndex(m => m === selectedMonth) + 1]
        : Array.from({ length: 12 }, (_, i) => i + 1); // 1 to 12 if no month selected

      targetMonths.forEach(mIndex => {
        const daysInMonth = new Date(selectedYear, mIndex, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
          // Check if data exists for this specific date
          const record = serverData.find(d => d.date === i && d.month === mIndex);
          if (record) {
            fullData.push(record);
          } else {
            fullData.push({
              employeeID: employeeId,
              year: parseInt(selectedYear),
              month: mIndex,
              date: i,
              day: new Date(selectedYear, mIndex - 1, i).toLocaleDateString('en-US', { weekday: 'long' }),
              present: false
            });
          }
        }
      });

      // 3. Prepare User Details
      const details = employeeMap[employeeId];
      const userDetails = {
        name: details ? details[0] : "Employee",
        email: details ? details[1] : "-",
        role: details ? (details[2] || "Employee") : "Employee",
        id: employeeId
      };

      const period = {
        year: selectedYear
      };

      // 4. Generate PDF
      generatePDF(fullData, userDetails, period);

    } catch (err) {
      console.error(err);
      alert("Failed to generate report.");
    }
  };

  return (
    <>
      {
        attendance ? (<div className="main-content">
          <section className="section">
            <div className="card">
              <div className="card-header d-flex justify-content-between">
                <h4>Attendance</h4>
              </div>
            </div>

            <div className="d-flex justify-content-center w-100 flex-wrap">

              <div className="col-md-2 col-sm-6 mb-2">
                <select
                  className='form-control select2'
                  value={selectedEmployee || ''}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">Employees</option>
                  {employees?.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2 col-sm-6 mb-2">
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

              <div className="col-md-2 col-sm-6 mb-2">
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
              <div className="col-md-2 col-sm-6 mb-2">
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
              <div className="col-md-3 col-sm-12 mb-2 d-flex">
                <button onClick={searchAttendance} className="btn btn-lg btn-primary mr-2 flex-grow-1">Search</button>
                <button onClick={handlePrint} className="btn btn-lg btn-success flex-grow-1">
                  <i className="fas fa-print mr-2"></i>Print
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
                      <td>{employeeMap?.[att.employeeID]?.[0] || '-'}</td>
                      <td>{employeeMap?.[att.employeeID]?.[1] || '-'}</td>
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
        </div>)
          :
          <Loading />
      }
    </>

  )
}

export default AttendanceView;

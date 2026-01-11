import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom"; // Added import for useLocation

const Leader = () =>
{
    const location = useLocation(); // Added useLocation hook
    return(
    <ul className="sidebar-menu">
      <li><NavLink className="nav-link" to="/leader/dashboard"><i className="fas fa-home"></i> <span>Leader Dashboard</span></NavLink></li>
      <li><NavLink className="nav-link" to="/members"><i className="fas fa-users"></i> <span>Members</span></NavLink></li>
      <li><NavLink className="nav-link" to="/leader/problems"><i className="fas fa-exclamation-triangle"></i> <span>Problems</span></NavLink></li>
      <li><NavLink className="nav-link" to="/leader/report-problem"><i className="fas fa-bug"></i> <span>Report Problem</span></NavLink></li>
      <li className={location.pathname === '/chat' ? 'active' : ''}>
          <NavLink className="nav-link" to="/chat">
             <i className="fas fa-comments"></i> <span>Chat Room</span>
          </NavLink>
      </li>
      <li><NavLink className="nav-link" to="/userAttendance"><i className="fas fa-user-check"></i> <span>Attendance</span></NavLink></li>
      <li><NavLink className="nav-link" to="/applyforleave"><i className="fas fa-pen"></i> <span>Apply For Leave</span></NavLink></li>
      <li><NavLink className="nav-link" to="/userLeaveApplications"><i className="fas fa-book"></i> <span>Leave Applications</span></NavLink></li>
      <li><NavLink className="nav-link" to="/userSalary"><i class="fas fa-piggy-bank"></i> <span>Salary</span></NavLink></li>

      <li className="menu-header">Settings</li>
        <li><NavLink className="nav-link" to="/home"><i className="fas fa-sign-out-alt"></i> <span>Logout</span></NavLink></li>
    </ul>
    )
}

export default Leader;

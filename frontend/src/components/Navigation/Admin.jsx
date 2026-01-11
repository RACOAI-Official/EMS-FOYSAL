import { NavLink } from "react-router-dom";

const Admin = () => {
  return (
    <ul className="sidebar-menu">
      <li><NavLink className="nav-link" to="/home"><i className="fas fa-home"></i> <span>Dashboard</span></NavLink></li>
      <li><NavLink className="nav-link" to="/chat"><i className="fas fa-comments"></i> <span>Chat Room</span></NavLink></li>
      <li><NavLink className="nav-link" to="/employees"><i className="fas fa-users"></i> <span>Employees</span></NavLink></li>
      <li><NavLink className="nav-link" to="/leaders"><i className="fas fa-user-friends"></i> <span>Leaders</span></NavLink></li>
      <li><NavLink className="nav-link" to="/admins"><i className="fas fa-users-cog"></i> <span>Admins</span></NavLink></li>
      <li><NavLink className="nav-link" to="/teams"><i className="fas fa-fire"></i> <span>Teams</span></NavLink></li>
      <li><NavLink className="nav-link" to="/attendance"><i className="fas fa-user"></i> <span>Attendance</span></NavLink></li>
      <li><NavLink className="nav-link" to="/leaves"><i className="fas fa-book"></i><span>Leaves</span></NavLink></li>
      <li><NavLink className="nav-link" to="/assignSalary"><i class="fas fa-pen"></i> <span>Assign Salary</span></NavLink></li>
      <li><NavLink className="nav-link" to="/salaries"><i className="fas fa-piggy-bank"></i> <span>Salaries</span></NavLink></li>
      <li><NavLink className="nav-link" to="/admin/problems"><i className="fas fa-exclamation-triangle"></i> <span>User Problems</span></NavLink></li>


      <li className="menu-header">Starter</li>
      <li><NavLink className="nav-link" to="/adduser"><i className="fas fa-user-plus"></i> <span>Add User</span></NavLink></li>
      <li><NavLink className="nav-link" to="/addleader"><i className="fas fa-user-tie"></i> <span>Add Leader</span></NavLink></li>
      <li><NavLink className="nav-link" to="/addteam"><i className="fas fa-address-card"></i> <span>Add Team</span></NavLink></li>
      <li><NavLink className="nav-link" to="/Addtask"><i className="far fa-square"></i> <span>Addtask submit</span></NavLink></li>

      <li className="menu-header">Settings</li>
      <li><NavLink className="nav-link" to="/home"><i className="fas fa-sign-out-alt"></i> <span>Logout</span></NavLink></li>
    </ul>
  )
}

export default Admin;

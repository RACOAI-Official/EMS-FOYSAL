import { NavLink, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { dLogout } from "../http";
import { setAuth } from "../store/auth-slice";
import swal from 'sweetalert';

const Admin = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const logout = async (e) => {
        if (e) e.preventDefault();
        
        const willLogout = await swal({
            title: "Are you sure?",
            text: "Do you want to logout?",
            icon: "warning",
            buttons: ["Cancel", "Yes, Logout"],
            dangerMode: true,
        });
        
        if (!willLogout) {
            return;
        }
        
        try {
            await dLogout();
            dispatch(setAuth(null));
            history.push('/login');
        } catch (err) {
            console.error("Logout failed", err);
            dispatch(setAuth(null));
            history.push('/login');
        }
    }

  return (
    <ul className="sidebar-menu overflow-auto">
      <li><NavLink className="nav-link" to="/home"><i className="fas fa-home"></i> <span>Dashboard</span></NavLink></li>
      <li><NavLink className="nav-link" to="/chat"><i className="fas fa-comments"></i> <span>Chat Room</span></NavLink></li>
      <li><NavLink className="nav-link" to="/employees"><i className="fas fa-users"></i> <span>Employees</span></NavLink></li>
      <li><NavLink className="nav-link" to="/leaders"><i className="fas fa-user-friends"></i> <span>Leaders</span></NavLink></li>
      <li><NavLink className="nav-link" to="/admins"><i className="fas fa-users-cog"></i> <span>Admins</span></NavLink></li>
      <li><NavLink className="nav-link" to="/teams"><i className="fas fa-fire"></i> <span>Teams</span></NavLink></li>
      <li><NavLink className="nav-link" to="/attendance"><i className="fas fa-user"></i> <span>Attendance</span></NavLink></li>
      <li><NavLink className="nav-link" to="/admin/attendance-management"><i className="fas fa-user-edit"></i> <span>Manage Attendance</span></NavLink></li>
      <li><NavLink className="nav-link" to="/leaves"><i className="fas fa-book"></i><span>Leaves</span></NavLink></li>
      <li><NavLink className="nav-link" to="/assignSalary"><i className="fas fa-pen"></i> <span>Assign Salary</span></NavLink></li>
      <li><NavLink className="nav-link" to="/salaries"><i className="fas fa-piggy-bank"></i> <span>Salaries</span></NavLink></li>
      <li><NavLink className="nav-link" to="/admin/problems"><i className="fas fa-exclamation-triangle"></i> <span>User Problems</span></NavLink></li>


      <li className="menu-header">Starter</li>
      <li><NavLink className="nav-link" to="/inviteuser"><i className="fas fa-envelope-open-text"></i> <span>Invite User</span></NavLink></li>
      <li><NavLink className="nav-link" to="/addteam"><i className="fas fa-address-card"></i> <span>Add Team</span></NavLink></li>
      <li><NavLink className="nav-link" to="/Addtask"><i className="far fa-square"></i> <span>Assign Task</span></NavLink></li>

        <li><NavLink className="nav-link" to="/letterhead"><i className="far fa-square"></i> <span>Pad</span></NavLink></li>
      <li><NavLink className="nav-link"  onClick={logout} to="#"><i className="fas fa-sign-out-alt"></i> <span>Logout</span></NavLink></li>
    </ul>
  )
}

export default Admin;

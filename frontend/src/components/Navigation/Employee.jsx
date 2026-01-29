import { NavLink } from "react-router-dom";
import { dLogout } from "../../http";
import { setAuth } from "../../store/auth-slice";
import { useDispatch, useSelector } from "react-redux"; // Added useSelector
import { useHistory } from "react-router-dom";
import swal from 'sweetalert';




const Employee = () =>
{

  const dispatch = useDispatch();
  const { user } = useSelector(state => state.authSlice); // Get user from state
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
    return(
      <ul className="sidebar-menu overflow-auto">
        <li><NavLink className="nav-link" to="/dashboardEmployee"><i className="fas fa-fire"></i> <span>Dashboard</span></NavLink></li>
        <li><NavLink className="nav-link" to="/userTeams"><i className="fas fa-users"></i> <span>Team</span></NavLink></li>
        <li><NavLink className="nav-link" to="/userAttendance"><i className="fas fa-user"></i> <span>Attendance</span></NavLink></li>
        <li><NavLink className="nav-link" to="/applyforleave"><i className="fas fa-pen"></i> <span>Apply For Leave</span></NavLink></li>
        <li><NavLink className="nav-link" to="/userLeaveApplications"><i className="fas fa-book"></i> <span>Leave Applications</span></NavLink></li>
        <li>
          <NavLink className="nav-link" to="/userSalary"><i className="fas fa-piggy-bank"></i> <span>Salary</span></NavLink>
          </li>

          <li>
            <NavLink className="nav-link" to="/userproblem"><i className="fas fa-exclamation-circle"></i> <span>Report Problem</span></NavLink>
          </li>
          <li>
            <NavLink className="nav-link" to="/chat"><i className="fas fa-comments"></i> <span>Chat Room</span></NavLink>
          </li>
        
     
        <li><NavLink onClick={logout} className="nav-link" to="#"><i className="fas fa-sign-out-alt"></i> <span>Logout</span></NavLink></li>
      </ul>
    )
}

export default Employee;

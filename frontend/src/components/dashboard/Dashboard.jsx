import { useSelector } from "react-redux";
import HeaderSection from "../HeaderSection";
import Admin from "./Admin";
import Employee from "../../pages/employee/components/DashboardEmployee";
import Leader from "../../pages/leader/components/DashboardLeader";

const Dashboard = () =>
{
  const {user} = useSelector(state=>state.authSlice);
    return(
        <div className="main-content">
          <section className="section">
            <HeaderSection title='Dashboard'/>
            {
              ['super_admin', 'sub_admin'].includes(user.type) ? <Admin/> : user.type==='leader' ? <Leader/> : <Employee/>
            }
          </section>
        </div>
    )
}

export default Dashboard;

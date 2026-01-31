import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom"
import Admin from './Admin';
import Leader from './Leader';
import Employee from './Employee';

const SideBar = () => {

  const { user } = useSelector(state => state.authSlice);

  return (
    <div className="main-sidebar">
      <aside id="sidebar-wrapper">
        <div className="sidebar-brand">
          <NavLink to="/home">RACO AI</NavLink>
        </div>
        <div className="sidebar-brand sidebar-brand-sm">
          <NavLink to="/home">RA</NavLink>
        </div>
        {
          (['super_admin', 'sub_admin'].includes(user.type)) ? <Admin /> : (user.type === 'leader') ? <Leader /> : <Employee />
        }
        <div className="mt-2 mb-4 p-3 hide-sidebar-mini">
          <a href="https://racoai.io/" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg btn-block btn-icon-split shadow-sm">
            <i className="fas fa-id-card mr-2"></i> ID Card Website
          </a>
        </div>
      </aside>
    </div>
  )
}

export default SideBar;

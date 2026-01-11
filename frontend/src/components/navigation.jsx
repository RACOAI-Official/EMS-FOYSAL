import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { NavLink } from "react-router-dom";
import { dLogout, getNotifications, markNotificationRead } from "../http";
import { setAuth } from "../store/auth-slice";
import { useState, useEffect } from "react";


const Navigation = () => {
    const { name, image } = useSelector((state) => state.authSlice.user);
    const dispatch = useDispatch();
    const history = useHistory();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
            const res = await getNotifications();
            if (res.success) {
                setNotifications(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    }

    const handleMarkAsRead = async (e, notif) => {
        e.preventDefault();
        try {
            await markNotificationRead(notif._id);
            fetchNotifications(); // Refresh list
            if (notif.link) {
                history.push(notif.link);
            }
        } catch (err) {
            console.error(err);
        }
    }

    const handleMarkAllRead = async (e) => {
        e.preventDefault();
        try {
            await markNotificationRead('all');
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const logout = async () => {
        await dLogout();
        dispatch(setAuth(null))
        return history.push('/login');
    }

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);

        // Handle mobile sidebar toggle
        if (window.innerWidth <= 991) {
            if (document.body.classList.contains('sidebar-show')) {
                document.body.classList.remove('sidebar-show');
                document.body.classList.add('sidebar-gone');
            } else {
                document.body.classList.add('sidebar-show');
                document.body.classList.remove('sidebar-gone');
            }
        }
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 991) {
                document.body.classList.add('sidebar-gone');
                document.body.classList.remove('sidebar-mini');
            } else {
                document.body.classList.remove('sidebar-gone', 'sidebar-show');
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check

        if (isSidebarCollapsed && window.innerWidth > 991) {
            document.body.classList.add('sidebar-mini');
        } else {
            document.body.classList.remove('sidebar-mini');
        }

        return () => window.removeEventListener('resize', handleResize);
    }, [isSidebarCollapsed]);

    return (
        <>

            <div className="navbar-bg"></div>
            <nav className="navbar navbar-expand-lg main-navbar">
                <form className="form-inline mr-auto">
                    <ul className="navbar-nav mr-3">
                        <li><a href="#" onClick={(e) => { e.preventDefault(); toggleSidebar(); }} id='sidebarCollapse' data-toggle="sidebar" className="nav-link nav-link-lg"><i className="fas fa-bars"></i></a></li>
                        <li><NavLink to='/' data-toggle="search" className="nav-link nav-link-lg d-sm-none"><i className="fas fa-search"></i></NavLink></li>
                    </ul>
                    <div className="search-element">
                        <input className="form-control" type="search" placeholder="Search" aria-label="Search" data-width="250" />
                        <button className="btn" type="submit"><i className="fas fa-search"></i></button>

                    </div>
                </form>
                <ul className="navbar-nav navbar-right">
                    <li className="dropdown dropdown-list-toggle"><a href='#' data-bs-toggle="dropdown" className={`nav-link notification-toggle nav-link-lg ${notifications.length > 0 ? 'beep' : ''}`}><i className="far fa-bell"></i></a>
                        <div className="dropdown-menu dropdown-list dropdown-menu-right">
                            <div className="dropdown-header">Notifications
                                <div className="float-right">
                                    <NavLink to='#' onClick={handleMarkAllRead}>Mark All As Read</NavLink>
                                </div>
                            </div>
                            <div className="dropdown-list-content dropdown-list-icons">
                                {notifications.length > 0 ? notifications.map((notif) => (
                                    <a href="#" key={notif._id} className="dropdown-item dropdown-item-unread" onClick={(e) => handleMarkAsRead(e, notif)}>
                                        <div className={`dropdown-item-icon ${notif.type === 'problem' ? 'bg-danger' : 'bg-info'} text-white`}>
                                            <i className={`fas ${notif.type === 'problem' ? 'fa-exclamation-triangle' : 'fa-comment'}`}></i>
                                        </div>
                                        <div className="dropdown-item-desc">
                                            {notif.message}
                                            <div className="time text-primary">{new Date(notif.createdAt).toLocaleTimeString()}</div>
                                        </div>
                                    </a>
                                )) : (
                                    <div className="dropdown-item">
                                        <div className="dropdown-item-desc text-center">
                                            No new notifications
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="dropdown-footer text-center">
                                <NavLink to='/'>View All <i className="fas fa-chevron-right"></i></NavLink>
                            </div>
                        </div>
                    </li>
                    <li className="dropdown"><a href='#' data-bs-toggle="dropdown" className="nav-link dropdown-toggle nav-link-lg nav-link-user" style={{ color: 'black' }}>
                        <img alt="image" src={image} className="rounded-circle mr-1" />
                        <div className="d-sm-none d-lg-inline-block">Hi, {name}</div></a>
                        <div className="dropdown-menu dropdown-menu-right">
                            <div className="dropdown-title">Logged in 5 min ago</div>
                            <NavLink to="features-profile.html" className="dropdown-item has-icon">
                                <i className="far fa-user"></i> Profile
                            </NavLink>
                            <NavLink to="features-activities.html" className="dropdown-item has-icon">
                                <i className="fas fa-bolt"></i> Activities
                            </NavLink>
                            <NavLink to="features-settings.html" className="dropdown-item has-icon">
                                <i className="fas fa-cog"></i> Settings
                            </NavLink>
                            <div className="dropdown-divider"></div>
                            <NavLink to='/' onClick={logout} className="dropdown-item has-icon text-danger">
                                <i className="fas fa-sign-out-alt"></i> Logout
                            </NavLink>
                        </div>
                    </li>
                </ul>
            </nav>
        </>
    )
}

export default Navigation;

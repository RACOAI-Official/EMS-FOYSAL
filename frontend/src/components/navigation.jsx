import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useHistory, NavLink } from "react-router-dom";
import { dLogout, getNotifications, markNotificationRead, backendUrl } from "../http";
import { setAuth } from "../store/auth-slice";
import { useState, useEffect } from "react";
import socket from "../socket";
import { useTheme } from "../store/ThemeContext";
import logo from "../assets/icons/logo.png";


const Navigation = () => {
    const { theme, toggleTheme } = useTheme();
    const { name, image, id, _id } = useSelector((state) => state.authSlice.user);
    const userId = id || _id;
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

        if (userId) {
            socket.connect();
            
            const handleConnect = () => {
                console.log('Connected to socket server');
                socket.emit('join', userId);
            };

            const handleNotification = (notif) => {
                console.log('New notification received:', notif);
                setNotifications(prev => [notif, ...prev]);
            };

            socket.on('connect', handleConnect);
            socket.on('notification', handleNotification);

            // Re-emit join on reconnect
            if (socket.connected) {
                socket.emit('join', userId);
            }
        }

        return () => {
            socket.off('connect');
            socket.off('notification');
            // Do not disconnect, keep connection alive across pages
            // socket.disconnect();
        };
    }, [userId]);

    const logout = async (e) => {
        if (e) e.preventDefault();
        try {
            await dLogout();
            dispatch(setAuth(null));
            history.push('/login');
        } catch (err) {
            console.error("Logout failed", err);
            // Even if API fails, clear auth and redirect
            dispatch(setAuth(null));
            history.push('/login');
        }
    }

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
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
            if (window.innerWidth > 991) {
                document.body.classList.remove('sidebar-show');
            }
        };

        const handleBackdropClick = (e) => {
            if (document.body.classList.contains('sidebar-show') && e.target.closest('.main-sidebar') === null && e.target.closest('#sidebarCollapse') === null) {
                document.body.classList.remove('sidebar-show');
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousedown', handleBackdropClick);
        
        if (isSidebarCollapsed && window.innerWidth > 991) {
            document.body.classList.add('sidebar-mini');
        } else {
            document.body.classList.remove('sidebar-mini');
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousedown', handleBackdropClick);
        };
    }, [isSidebarCollapsed]);

    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            history.push(`/search?q=${searchQuery.trim()}`);
            setSearchQuery('');
        }
    }

    return (
        <>

            <div className="navbar-bg"></div>
            <nav className="navbar navbar-expand-lg main-navbar">
                <form className="d-flex align-items-center flex-grow-1" onSubmit={handleSearch}>
                    <ul className="navbar-nav mr-3">
                        <li><a href="#" onClick={(e) => { e.preventDefault(); toggleSidebar(); }} id='sidebarCollapse' className="nav-link nav-link-lg"><i className="fas fa-bars"></i></a></li>
                        <li><NavLink to='/' className="nav-link nav-link-lg d-none"><i className="fas fa-search"></i></NavLink></li>
                    </ul>
                    <div className="d-flex align-items-center mr-3" style={{ whiteSpace: 'nowrap' }}>
                        <img src={logo} alt="RACO AI Logo" style={{ height: '35px', marginRight: '10px' }} />
                        <span style={{ fontSize: '18px', fontWeight: '600', color: theme === 'dark' ? '#fff' : '#333' }}>RACO AI</span>
                    </div>
                    <div className="search-element input-group mx-auto d-none d-lg-flex" style={{ maxWidth: '400px' }}>
                        <input 
                            className="form-control" 
                            type="search" 
                            placeholder="Name, Email, or Mobile" 
                            aria-label="Search" 
                            data-width="250" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="input-group-append">
                            <button className="btn btn-primary" type="submit"><i className="fas fa-search"></i></button>
                        </div>
                    </div>
                </form>
                <div className="theme-toggle-wrapper mr-3 d-none d-lg-block">
                    <button 
                        className="btn btn-icon btn-dark theme-toggle-btn" 
                        onClick={toggleTheme}
                        style={{
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                    </button>
                </div>
                <ul className="navbar-nav navbar-right">
                    <li className="dropdown dropdown-list-toggle d-none d-lg-block">
                        <a href='#' data-bs-toggle="dropdown" className="nav-link notification-toggle nav-link-lg" style={{ position: 'relative' }}>
                            <i className="far fa-bell"></i>
                            {notifications.length > 0 && (
                                <span className="badge badge-danger" style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '5px',
                                    padding: '2px 5px',
                                    fontSize: '10px',
                                    borderRadius: '50%',
                                    minWidth: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold'
                                }}>
                                    {notifications.length}
                                </span>
                            )}
                        </a>
                        <div className="dropdown-menu dropdown-list dropdown-menu-end">
                            <div className="dropdown-header">Notifications
                                <div className="float-right">
                                    <NavLink to='#' onClick={handleMarkAllRead}>Mark All As Read</NavLink>
                                </div>
                            </div>
                            <div className="dropdown-list-content dropdown-list-icons">
                                {notifications.length > 0 ? notifications.map((notif) => (
                                    <a href="#" key={notif._id} className="dropdown-item dropdown-item-unread" onClick={(e) => handleMarkAsRead(e, notif)}>
                                        <div className={`dropdown-item-icon ${notif.type === 'problem' ? 'bg-danger' : (notif.type === 'salary' ? 'bg-success' : 'bg-info')} text-white`}>
                                            <i className={`fas ${notif.type === 'problem' ? 'fa-exclamation-triangle' : (notif.type === 'salary' ? 'fa-money-bill-wave' : 'fa-comment')}`}></i>
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
                        <img alt="image" src={image && !image.startsWith('http') ? `${backendUrl}/storage/${image}` : image} className="rounded-circle mr-1" />
                        <div className="d-sm-none d-lg-inline-block">Hi, {name}</div></a>
                        <div className="dropdown-menu dropdown-menu-end">
                            <div className="dropdown-title">Logged in 5 min ago</div>



                            <div className="dropdown-divider"></div>
                            <NavLink to="/profile" className="dropdown-item has-icon">
                                <i className="far fa-user"></i> Profile
                            </NavLink>
                            <NavLink to='#' onClick={logout} className="dropdown-item has-icon text-danger">
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

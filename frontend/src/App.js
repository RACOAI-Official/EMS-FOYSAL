
import { Redirect, Switch, Route } from 'react-router-dom'
import Login from './pages/auth/Login'
import Forgot from './pages/auth/Forgot'
import Home from './pages/Home'
import InviteUser from './pages/user/InviteUser'
import RegisterInvited from './pages/auth/RegisterInvited'
import VerifyUser from './pages/public/VerifyUser';
import { useSelector } from 'react-redux';

import '@popperjs/core';
import Loading from './components/Loading';
import SearchResults from './pages/user/SearchResults';
import { useAutoLogin } from './hooks/useAutoLogin';
import Employees from './pages/employee/Employees';
import Admins from './pages/admin/Admins';
import Teams from './pages/team/Teams';
import AddTeam from './pages/team/AddTeam';
import Employee from './pages/employee/Employee';
import Team from './pages/team/team/Team';
import EditUser from './pages/user/EditUser';
import EditTeam from './pages/team/EditTeam';
import Admin from './pages/admin/Admin';
import './assets/css/bootstrap.min.css';
import './assets/css/style.css';
import './assets/css/components.css';
import './App.css';
import Leaders from './pages/leader/Leaders';
import MainLayout from './navigation/MainLayout';
import Members from './pages/leaderpage/Members';
import UserTeams from './pages/employee/components/UserTeams';
import Attendance from './pages/employee/components/Attendance';
import LeaveApplications from './pages/employee/components/LeaveApplications';
import Salary from './pages/employee/components/Salary';
import ApplyForLeave from './pages/employee/components/ApplyForLeave';
import EmployeeTeam from './pages/team/team/EmployeeTeam';
import LeaveApplication from './pages/employee/components/LeaveApplication';
import DashboardEmployee from './pages/employee/components/DashboardEmployee';
// LocationTracker needs to be imported after DashboardEmployee to avoid compilation errors order
import LocationTracker from './components/common/LocationTracker';
import AttendanceView from './pages/admin/components/AttendanceView';
import LeaveView from './pages/admin/components/LeaveView';
import Leave from './pages/admin/components/Leave';
import AssignSalary from './pages/admin/components/AssignSalary';
import Salaries from './pages/admin/components/Salaries';
import SalaryView from './pages/admin/components/Salary';
import IdCard from './pages/employee/components/IdCard';
import AdminAttendanceManagement from './pages/admin/components/AdminAttendanceManagement';

import Addtasksubmit from './pages/user/Addtasksubmit'
import Userproblem from './pages/user/Userproblem.jsx'
import AdminProblems from './pages/admin/Problems.jsx'

import LeaderDashboard from './pages/leader/LeaderDashboard.jsx';
import LeaderProblems from './pages/leader/LeaderProblems.jsx';
import LeaderTasks from './pages/leader/LeaderTasks.jsx';
import Chat from "./pages/Chat";
import Profile from './pages/user/Profile';
import NotFound from "./pages/NotFound";
import Letterhead from './Letterhead';
import PrintReport from './components/common/PrintReport';



const App = () => {
  const loading = useAutoLogin();

  return loading ?
    <Loading /> : (
      <Switch>
        <EmployeeRoute exact path='/userTeams'>
          <UserTeams />
        </EmployeeRoute>
        <EmployeeRoute exact path='/userteam/:id'>
          <EmployeeTeam />
        </EmployeeRoute>
        <EmployeeRoute exact path='/dashboardEmployee'>
          <div className="main-content">
            <section className="section">
              <DashboardEmployee />
            </section>
          </div>
        </EmployeeRoute>
        <EmployeeRoute exact path='/userAttendance'>
          <Attendance />
        </EmployeeRoute>
        <EmployeeRoute exact path='/applyforleave'>
          <ApplyForLeave />
        </EmployeeRoute>
        <EmployeeRoute exact path='/userSalary'>
          <Salary />
        </EmployeeRoute>
        <EmployeeRoute exact path='/userLeaveApplications'>
          <LeaveApplications />
        </EmployeeRoute>
        <EmployeeRoute exact path='/userLeaveApplications/:id'>
          <LeaveApplication />
        </EmployeeRoute>
        <EmployeeRoute exact path='/userproblem'>
          <Userproblem />
        </EmployeeRoute>


        <GuestRoute exact path='/' >
          <Login />
        </GuestRoute>
        <GuestRoute exact path='/login' >
          <Login />
        </GuestRoute>
        <GuestRoute exact path='/verify/:id' >
          <VerifyUser />
        </GuestRoute>
        <GuestRoute exact path='/register/:token' >
          <RegisterInvited />
        </GuestRoute>
        <GuestRoute exact path='/forgot' >
          <Forgot />
        </GuestRoute>
        <ProtectedRoute exact path='/home'>
          <Home />
        </ProtectedRoute>
        <AdminRoute exact path='/letterhead'>
          <Letterhead />
        </AdminRoute>
        <AdminRoute exact path='/employees'>
          <Employees />
        </AdminRoute>
        <LeaderRoute exact path='/members'>
          <Members />
        </LeaderRoute>
        <AdminRoute exact path='/admins'>
          <Admins />
        </AdminRoute>
        <AdminRoute exact path='/teams'>
          <Teams />
        </AdminRoute>
        <AdminRoute exact path='/inviteuser'>
          <InviteUser />
        </AdminRoute>

        <AdminLeaderRoute exact path='/Addtask'>
          < Addtasksubmit />
        </AdminLeaderRoute>

        <AdminRoute exact path='/attendance'>
          <AttendanceView />
        </AdminRoute>
        <AdminRoute exact path='/admin/attendance-management'>
          <AdminAttendanceManagement />
        </AdminRoute>
        <AdminRoute exact path='/leaves'>
          <LeaveView />
        </AdminRoute>
        <AdminRoute exact path='/assignSalary'>
          <AssignSalary />
        </AdminRoute>
        <AdminRoute exact path='/salaries'>
          <Salaries />
        </AdminRoute>
        <AdminRoute exact path='/leaves/:id'>
          <Leave />
        </AdminRoute>
        <AdminRoute exact path='/salary/:id'>
          <SalaryView />
        </AdminRoute>
        <AdminRoute exact path='/addteam'>
          <AddTeam />
        </AdminRoute>
        <AdminRoute path='/employee/:id'>
          <Employee />
        </AdminRoute>
        <AdminRoute path='/team/:id'>
          <Team />
        </AdminRoute>
        <AdminRoute path='/edituser/:id'>
          <EditUser />
        </AdminRoute>
        <AdminRoute path='/editteam/:id'>
          <EditTeam />
        </AdminRoute>
        <PlainProtectedRoute path='/print-id/:id'>
          <IdCard />
        </PlainProtectedRoute>
        <PlainProtectedRoute path='/print-report'>
          <PrintReport />
        </PlainProtectedRoute>
        <AdminRoute path='/admin/problems'>
          <AdminProblems />
        </AdminRoute>
        <AdminRoute path='/leaders'>
          <Leaders />
        </AdminRoute>
        <LeaderRoute exact path='/leader/dashboard'>
          <div className="main-content">
            <section className="section">
              <LeaderDashboard />
            </section>
          </div>
        </LeaderRoute>
        <LeaderRoute exact path='/leader/tasks'>
          <LeaderTasks />
        </LeaderRoute>
        <ProtectedRoute path="/leader/problems" exact>
          <LeaderProblems />
        </ProtectedRoute>

        <ProtectedRoute path="/chat" exact>
          <Chat />
        </ProtectedRoute>

        <ProtectedRoute path="/profile" exact>
          <Profile />
        </ProtectedRoute>

        <ProtectedRoute path="/search" exact>
          <SearchResults />
        </ProtectedRoute>

        <LeaderRoute exact path='/leader/report-problem'>
          <Userproblem />
        </LeaderRoute>

        <AdminRoute path='/admin/:id'>
          <Admin />
        </AdminRoute>
        <Route path="*" component={NotFound} />
      </Switch>
    )
}


const GuestRoute = ({ children, ...rest }) => {
  const { isAuth, user } = useSelector((state) => state.authSlice);
  return (
    <Route {...rest} render={({ location }) => {
      let pathname = '/home';
      if (user?.type === 'employee') pathname = '/dashboardEmployee';
      else if (user?.type === 'leader') pathname = '/leader/dashboard';
      else if (['super_admin', 'sub_admin'].includes(user?.type)) pathname = '/home';

      return isAuth ? (
        <Redirect to={{ pathname, state: { from: location } }} />
      ) : (children);
    }}>
    </Route>
  )
}


const PlainProtectedRoute = ({ children, ...rest }) => {
  const { isAuth } = useSelector((state) => state.authSlice);
  return (
    <Route {...rest} render={({ location }) => {
      return isAuth ? (
        children
      ) : (
        <Redirect
          to={{
            pathname: '/',
            state: {
              from: location
            }
          }}
        />
      );
    }} />
  );
}

const ProtectedRoute = ({ children, ...rest }) => {
  const { isAuth } = useSelector((state) => state.authSlice);
  return (
    <Route {...rest} render={({ location }) => {
      return isAuth ? (
        <MainLayout>
          {children}
        </MainLayout>) : (
        <Redirect
          to={{
            pathname: '/',
            state: {
              from: location
            }
          }}
        />
      );
    }} />
  );
}

const AdminRoute = ({ children, ...rest }) => {
  const { user } = useSelector((state) => state.authSlice);
  return (
    <Route {...rest} render={({ location }) => {
      return user && ['super_admin', 'sub_admin'].includes(user.type) ? (
        <MainLayout>
          {children}
        </MainLayout>) : (
        <Redirect
          to={{
            pathname: '/',
            state: {
              from: location
            }
          }}
        />
      );
    }} />
  );
}


const LeaderRoute = ({ children, ...rest }) => {
  const { user } = useSelector((state) => state.authSlice);
  return (
    <Route {...rest} render={({ location }) => {
      return user && user.type === 'leader' ? (
        <MainLayout>
          <LocationTracker />
          {children}
        </MainLayout>) : (
        <Redirect
          to={{
            pathname: '/',
            state: {
              from: location
            }
          }}
        />
      );
    }} />
  );
}

const EmployeeRoute = ({ children, ...rest }) => {
  const { user } = useSelector((state) => state.authSlice);
  return (
    <Route {...rest} render={({ location }) => {
      return user && (user.type === 'employee' || user.type === 'leader') ? (
        <MainLayout>
          <LocationTracker />
          {children}
        </MainLayout>) : (
        <Redirect
          to={{
            pathname: '/',
            state: {
              from: location
            }
          }}
        />
      );
    }} />
  );
}

const AdminLeaderRoute = ({ children, ...rest }) => {
  const { user } = useSelector((state) => state.authSlice);
  return (
    <Route {...rest} render={({ location }) => {
      return user && (['super_admin', 'sub_admin', 'leader'].includes(user.type)) ? (
        <MainLayout>
          {children}
        </MainLayout>) : (
        <Redirect
          to={{
            pathname: '/',
            state: {
              from: location
            }
          }}
        />
      );
    }} />
  );
}

export default App;

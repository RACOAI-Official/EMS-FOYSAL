 import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getCounts, getAdminTasks, deleteTask, downloadTaskPDF, getDropdownUsers, backendUrl } from "../../http";
import { getFileUrl } from "../../utils/fileUtil";
import { setCount } from "../../store/main-slice";
import CountsCard from "./CountsCard";
import { toast } from "react-toastify";
import CircularProgress from "../CircularProgress";
import ProgressLeaderboard from "../common/ProgressLeaderboard";

const Admin = () => {
  const dispatch = useDispatch();
  const { counts } = useSelector((state) => state.mainSlice);
  const { admin, employee, leader, team } = counts;
  
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [dropdownUsers, setDropdownUsers] = useState([]);
  
  // Filter states
  const [selectedUser, setSelectedUser] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchTasks = async () => {
    try {
      const res = await getAdminTasks();
      if (Array.isArray(res)) {
        setTasks(res);
        setFilteredTasks(res);
      }
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getDropdownUsers();
      if (res && Array.isArray(res)) {
        setDropdownUsers(res);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    (async () => {
      const res = await getCounts();
      if (res.success) dispatch(setCount(res.data));
    })();
    fetchTasks();
    fetchUsers();
  }, [dispatch]);

  // Apply filters
  useEffect(() => {
    let result = tasks;

    if (selectedUser !== "all") {
      result = result.filter(t => t.assignedTo?._id === selectedUser);
    }

    if (dateFrom) {
      result = result.filter(t => {
        if (!t.startDate) return false;
        return new Date(t.startDate) >= new Date(dateFrom);
      });
    }

    if (dateTo) {
      result = result.filter(t => {
        if (!t.startDate) return false;
        return new Date(t.startDate) <= new Date(dateTo);
      });
    }

    setFilteredTasks(result);
  }, [selectedUser, dateFrom, dateTo, tasks]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(id);
      toast.success("Task deleted");
      fetchTasks();
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };
  
  return (
    <>
      {/* Counts Section */}
      <div className="row g-4 mb-5">
        <CountsCard title="Employees" icon="fa-user" count={employee} />
        <CountsCard title="Total Leader" icon="fa-user" count={leader} />
        <CountsCard title="Total Admin" icon="fa-user" count={admin} />
        <CountsCard title="Total Team" icon="fa-user" count={team} />
      </div>

      <div className="row">
        <div className="col-md-12">
           <div className="card border-0 shadow-lg rounded-3">
             <div className="card-header border-0 py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
               <h5 className="mb-3 mb-md-0 fw-bold text-primary">Assigned Tasks</h5>
               
               <div className="d-flex flex-wrap gap-2">
                 <div className="form-group mb-0">
                   <select 
                     className="form-control form-control-sm" 
                     value={selectedUser} 
                     onChange={(e) => setSelectedUser(e.target.value)}
                     style={{ minWidth: '150px' }}
                   >
                     <option value="all">All Users</option>
                     {dropdownUsers.map(u => (
                       <option key={u._id} value={u._id}>{u.name} ({u.type})</option>
                     ))}
                   </select>
                 </div>
                 <div className="d-flex align-items-center gap-1">
                   <input 
                     type="date" 
                     className="form-control form-control-sm" 
                     value={dateFrom} 
                     onChange={(e) => setDateFrom(e.target.value)} 
                     placeholder="From"
                   />
                   <span className="text-muted small">to</span>
                   <input 
                     type="date" 
                     className="form-control form-control-sm" 
                     value={dateTo} 
                     onChange={(e) => setDateTo(e.target.value)} 
                     placeholder="To"
                   />
                   {(selectedUser !== 'all' || dateFrom || dateTo) && (
                     <button 
                       className="btn btn-sm btn-link text-danger p-0 ms-1"
                       onClick={() => {
                         setSelectedUser('all');
                         setDateFrom('');
                         setDateTo('');
                       }}
                       title="Clear Filters"
                     >
                       <i className="fas fa-times-circle"></i>
                     </button>
                   )}
                 </div>
               </div>
             </div>
             <div className="p-3">
                <table className="table table-borderless align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                  <thead>
                    <tr className="text-muted text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                      <th scope="col" className="ps-4">Task Details</th>
                      <th scope="col">Assigned To</th>
                      <th scope="col">Duration</th>
                      <th scope="col" className="text-center">Progress</th>
                      <th scope="col" className="text-right pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center p-5">
                          <div className="glass-card d-inline-block px-5 py-4">
                            <i className="fas fa-search fa-2x mb-3 text-muted opacity-50"></i>
                            <p className="text-muted mb-0">No tasks found matching your filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredTasks.map(task => (
                      <tr key={task._id} className="soft-card shadow-sm hover-lift">
                        <td className="ps-4 py-3">
                          <div className="fw-bold h6 mb-1">{task.title}</div>
                          <div className="d-flex align-items-center gap-2">
                            {task.assignedTo?.team?.name && (
                              <span className="badge badge-light border text-primary">
                                {task.assignedTo.team.name}
                              </span>
                            )}
                            {task.file && (
                              <a href={getFileUrl(task.file)} target="_blank" rel="noopener noreferrer" 
                                 className="text-muted small text-decoration-none">
                                <i className="fa fa-paperclip"></i> View File
                              </a>
                            )}
                          </div>
                        </td>
                        <td>
                          {task.assignedTo ? (
                            <div className="d-flex align-items-center">
                                <img 
                                  src={getFileUrl(task.assignedTo?.image)} 
                                  className="rounded-circle mr-3 border shadow-sm" 
                                  width="35" height="35" 
                                  alt="" 
                                  onError={(e) => { e.target.src = '/assets/icons/user.png' }}
                                />
                              <div>
                                <div className="fw-bold small">{task.assignedTo.name}</div>
                                <div className="text-muted" style={{fontSize: '0.7rem'}}>{task.assignedTo.type}</div>
                              </div>
                            </div>
                          ) : <span className="badge badge-danger">Deleted</span>}
                        </td>
                        <td>
                          <div className="small">
                            {task.startDate && <div className="text-muted">Start: {new Date(task.startDate).toLocaleDateString()}</div>}
                            {task.endDate && <div className="font-weight-bold">End: {new Date(task.endDate).toLocaleDateString()}</div>}
                          </div>
                        </td>
                        <td className="text-center">
                          <CircularProgress value={task.progress || 0} size={45} />
                        </td>
                        <td className="text-right pe-4">
                          <div className="d-flex justify-content-end gap-2">
                            <a 
                              href={downloadTaskPDF(task._id, 'view')} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-light border rounded-pill px-3 py-1 font-weight-bold"
                            >
                              <i className="fas fa-file-pdf mr-1 text-danger"></i> PDF View
                            </a>
                            {task.file && (
                                <a 
                                    href={getFileUrl(task.file)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-light border rounded-pill px-3 py-1 font-weight-bold"
                                >
                                    <i className="fas fa-paperclip mr-1 text-success"></i> Attachment
                                </a>
                            )}
                            <button 
                              onClick={() => handleDelete(task._id)}
                              className="btn btn-sm btn-soft-danger rounded-pill px-3 py-1 font-weight-bold"
                            >
                              <i className="fas fa-trash-alt mr-1"></i> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           </div>
        </div>
      </div>

      {/* Progress & Ranking Section */}
      <div className="row mt-5">
        <div className="col-lg-6 mb-4">
          <ProgressLeaderboard 
            mode="teams" 
            title="Teams Performance Ranking" 
            includeLeaders={true}
          />
        </div>
        <div className="col-lg-6 mb-4">
          <ProgressLeaderboard 
            mode="users"
            type="leader"
            includeLeaders={true} 
            title="Leader Performance Rankings" 
          />
        </div>
        <div className="col-md-12">
          <ProgressLeaderboard 
            mode="users"
            type="employee"
            includeLeaders={true} 
            title="All Employee Metrics" 
          />
        </div>
      </div>
    </>
  );
};

export default Admin;

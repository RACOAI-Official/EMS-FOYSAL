 import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getCounts, getAdminTasks, deleteTask, downloadTaskPDF } from "../../http";
import { setCount } from "../../store/main-slice";
import CountsCard from "./CountsCard";
import { toast } from "react-toastify";

const Admin = () => {
  const dispatch = useDispatch();
  const { counts } = useSelector((state) => state.mainSlice);
  const { admin, employee, leader, team } = counts;
  
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const res = await getAdminTasks();
      if (Array.isArray(res)) {
        setTasks(res);
      }
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  useEffect(() => {
    (async () => {
      const res = await getCounts();
      if (res.success) dispatch(setCount(res.data));
    })();
    fetchTasks();
  }, [dispatch]);

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
    <div className="admin-page bg-light min-vh-100 p-4">
      {/* Counts Section */}
      <div className="row g-4 mb-5">
        <CountsCard title="Total Employee" icon="fa-user" count={employee} />
        <CountsCard title="Total Leader" icon="fa-user" count={leader} />
        <CountsCard title="Total Admin" icon="fa-user" count={admin} />
        <CountsCard title="Total Team" icon="fa-user" count={team} />
      </div>

      <div className="row">
        <div className="col-md-12">
           <div className="card border-0 shadow-lg rounded-3">
             <div className="card-header bg-white border-0 py-3">
               <h5 className="mb-0 fw-bold text-primary">Assigned Tasks</h5>
             </div>
             <div className="table-responsive p-3">
                <table className="table table-hover align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                  <thead className="bg-light text-secondary">
                    <tr>
                      <th scope="col" className="border-0 rounded-start ps-3">Title</th>
                      <th scope="col" className="border-0">Assigned To</th>
                      <th scope="col" className="border-0">Duration</th>
                      <th scope="col" className="border-0 rounded-end">Actions</th>
                        <th scope="col" className="border-0 rounded-end">View status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center p-5 text-muted fst-italic">No tasks found</td>
                      </tr>
                    ) : tasks.map(task => (
                      <tr key={task._id} className="shadow-sm bg-white rounded-3">
                        <td className="ps-3 border-0 rounded-start">
                          <div className="fw-bold text-dark">{task.title}</div>
                          {task.assignedTo?.team?.name && (
                            <small className="text-primary d-block fw-bold mb-1">
                              Dept: {task.assignedTo.team.name}
                            </small>
                          )}
                          <small className="text-muted d-block text-truncate" style={{maxWidth: '250px'}}>{task.description}</small>
                          {task.file && (
                              <div className="mt-2">
                                  <a href={`${process.env.REACT_APP_BASE_URL}/${task.file}`} target="_blank" rel="noopener noreferrer" className="badge bg-light text-primary border text-decoration-none">
                                      <i className="fa fa-paperclip me-1"></i> Attachment
                                  </a>
                              </div>
                          )}
                        </td>
                        <td className="border-0">
                          {task.assignedTo ? (
                            <div className="d-flex align-items-center">
                              <div className="avatar me-2 bg-soft-primary text-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '35px', height: '35px'}}>
                                {task.assignedTo.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="fw-semibold">{task.assignedTo.name}</div>
                                <small className="text-muted" style={{fontSize: '0.75rem'}}>{task.assignedTo.type}</small>
                              </div>
                            </div>
                          ) : <span className="badge bg-danger">User Deleted</span>}
                        </td>
                        <td className="border-0">
                            {task.startDate && <div className="text-nowrap"><small className="text-muted fw-bold">Start:</small> <small>{new Date(task.startDate).toLocaleDateString()}</small></div>}
                            {task.endDate && <div className="text-nowrap"><small className="text-muted fw-bold">End:</small> <small>{new Date(task.endDate).toLocaleDateString()}</small></div>}
                            {!task.startDate && !task.endDate && <span className="text-muted">-</span>}
                        </td>
                        <td className="border-0 rounded-end">
                          <div className="d-flex gap-2">
                            <a 
                              href={downloadTaskPDF(task._id, 'view')} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-lg btn-outline-primary rounded-pill px-2"
                            >
                              View PDF
                            </a>
                            <button 
                              onClick={() => handleDelete(task._id)}
                              className="btn btn-lg btn-outline-danger rounded-pill mx-2"
                            >
                              Delete
                            </button>
                          </div>
                        </td> 
                        <td>
                            <button 
                              // onClick={() => handleViewStatus(task._id)}
                              className="btn btn-lg btn-outline-success rounded-pill mx-2"
                            >
                              View Status
                            </button>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

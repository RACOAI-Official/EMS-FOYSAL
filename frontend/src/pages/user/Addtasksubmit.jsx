import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getDropdownUsers, createTask } from "../../http";
import "react-datepicker/dist/react-datepicker.css";

const Addtasksubmit = ({ onTaskAdded, isPage = true }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [file, setFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getDropdownUsers();
        if (res && Array.isArray(res)) {
          setUsers(res);
        }
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !assignedTo) {
      toast.error("Title, Description and Assigned User are required");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("assignedTo", assignedTo);
      if (startDate) formData.append("startDate", startDate);
      if (endDate) formData.append("endDate", endDate);
      if (file) formData.append("taskFile", file);

      const res = await createTask(formData);
      if (res?.message) {
        toast.success(res.message);
        setTitle("");
        setDescription("");
        setAssignedTo("");
        setStartDate("");
        setEndDate("");
        setFile(null);
        if (onTaskAdded) onTaskAdded();
      } else {
        toast.error("Failed to create task");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formBody = (
    <div className="glass-card overflow-hidden">
      <div className="px-4 py-4 border-bottom border-light">
        <h5 className="mb-0 gradient-text h4">Create Mission</h5>
        <p className="text-muted small mb-0">Assign a new task to your team members</p>
      </div>
      <div className="card-body p-4 p-md-5">
        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            <div className="form-group col-md-12">
              <label className="mb-2 small text-uppercase fw-bold text-muted">Mission Title <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control form-control-lg border-0 shadow-sm rounded-3 px-4"
                style={{ fontSize: '1rem' }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What objective needs to be achieved?"
                required
              />
            </div>

            <div className="form-group col-md-12">
              <label className="mb-2 small text-uppercase fw-bold text-muted">Assign Special Agent <span className="text-danger">*</span></label>
              <select
                className="form-select form-select-lg border-0 shadow-sm rounded-3 px-4"
                style={{ fontSize: '1rem', height: '54px' }}
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                required
              >
                <option value="">Select an agent</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} — {user.type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group col-md-6">
              <label className="mb-2 small text-uppercase fw-bold text-muted">Activation Date</label>
              <div className="input-group">
                <span className="input-group-text border-0 shadow-sm rounded-start-3">
                  <i className="far fa-calendar-alt text-primary"></i>
                </span>
                <input
                  type="date"
                  className="form-control form-control-lg border-0 shadow-sm rounded-end-3"
                  style={{ fontSize: '0.95rem' }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group col-md-6">
              <label className="mb-2 small text-uppercase fw-bold text-muted">Deadline</label>
              <div className="input-group">
                <span className="input-group-text border-0 shadow-sm rounded-start-3">
                  <i className="far fa-calendar-check text-danger"></i>
                </span>
                <input
                  type="date"
                  className="form-control form-control-lg border-0 shadow-sm rounded-end-3"
                  style={{ fontSize: '0.95rem' }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group col-md-12">
              <label className="mb-2 small text-uppercase fw-bold text-muted">Mission Files</label>
              <div className="p-4 rounded-3 border-2 border-dashed text-center shadow-sm position-relative" style={{ border: '2px dashed #e2e8f0' }}>
                <i className="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
                <p className="small text-muted mb-0">Click to upload or drag and drop mission assets</p>
                <input
                  type="file"
                  className="opacity-0 position-absolute top-0 start-0 w-100 h-100 cursor-pointer"
                  style={{ cursor: 'pointer' }}
                  onChange={(e) => setFile(e.target.files[0])}
                />
                {file && <div className="mt-2 badge bg-primary">{file.name}</div>}
              </div>
            </div>

            <div className="form-group col-md-12">
              <label className="mb-2 small text-uppercase fw-bold text-muted">Mission Details <span className="text-danger">*</span></label>
              <textarea
                className="form-control border-0 shadow-sm rounded-3 p-4"
                rows="5"
                style={{ fontSize: '1rem' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the mission parameters and expectations..."
                required
              ></textarea>
            </div>

            <div className="form-group pt-3 col-md-12">
              <button
                className="btn btn-primary w-100 py-3 text-uppercase letter-spacing-1 shadow-lg border-0"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" role="status"></span> Deploying...</>
                ) : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  if (!isPage) return formBody;

  return (
    <div className="main-content" style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      <section className="section">
        <div className="container py-4">
          <div className="mb-4">
             <h2 className="display-6 fw-bold gradient-text">Add Task</h2>
             
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {formBody}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Addtasksubmit;


import { useEffect, useState } from "react";
import HeaderSection from "../../components/HeaderSection";
import RowLeader from "../../components/rows/row-leader";
import { getLeaderUsers, deleteUser, getAdminTasks, downloadTaskPDF, backendUrl } from "../../http";
import { getFileUrl } from "../../utils/fileUtil";
import { exportToPrint } from "../../utils/printHelper";
import ConfirmationModal from "../../components/modal/ConfirmationModal";
import { toast } from "react-toastify";
import CircularProgress from "../../components/CircularProgress";

const Leaders = () => {
    const [leaders, setLeaders] = useState([]);
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedLeader, setSelectedLeader] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const leaderRes = await getLeaderUsers();
            if (leaderRes.success) {
                setLeaders(leaderRes.data);
            }

            const taskRes = await getAdminTasks();
            if (Array.isArray(taskRes)) {
                // Filter tasks assigned to Leaders
                const leaderMissions = taskRes.filter(task => task.assignedTo?.type === 'Leader');
                setMissions(leaderMissions);
            }
        } catch (err) {
            console.error("Failed to fetch data", err);
            toast.error("Failed to load leaders or missions");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const confirmDelete = (leader) => {
        setSelectedLeader(leader);
        setIsDeleting(true);
    }

    const handleDelete = async () => {
        if (!selectedLeader) return;
        const res = await deleteUser(selectedLeader.id);
        if (res.success) {
            toast.success(res.message);
            fetchData();
        } else {
            toast.error(res.message);
        }
        setIsDeleting(false);
    }

    const handlePrintLeaders = () => {
        const tableColumn = ["#", "Name", "Email", "Mobile", "Sub-Type (Position)", "Team", "Total Members"];
        const tableRows = [];

        leaders.forEach((leader, index) => {
            const rowData = [
                index + 1,
                leader.name,
                leader.email,
                leader.mobile,
                leader.position || "Not Specified",
                leader.team && leader.team.name ? leader.team.name : "No Team",
                leader.totalMembers || 0
            ];
            tableRows.push(rowData);
        });

        exportToPrint({
            title: "Leaders List",
            columns: tableColumn,
            data: tableRows,
            date: new Date().toLocaleDateString()
        });
    };

    return (
        <div className="main-content">
      <section className="section">
        {/* Page Header */}
        <div className="glass-card mb-4 p-4 d-flex justify-content-between align-items-center">
            <div>
                <h3 className="font-weight-bold text-dark mb-1">Leader Directory</h3>
                <p className="text-muted mb-0">Manage management roles and team leadership</p>
            </div>
            <button onClick={handlePrintLeaders} className="btn btn-primary rounded-pill px-4 shadow-sm">
              <i className="fas fa-print mr-2"></i> Export Report
            </button>
        </div>

        <div className="glass-card border-0 shadow-lg mb-5">
            <div className="card-header bg-white border-bottom py-4">
                <h5 className="mb-0 font-weight-bold text-dark">
                    <i className="fas fa-user-shield mr-2 text-primary"></i> Organization Leaders
                </h5>
            </div>
          <div className="card-body p-3">
            <div className="table-responsive">
              <table className="table table-borderless align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                <thead>
                  <tr className="text-muted text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                    <th className="ps-4">Leader Profile</th>
                    <th>Sub-Type (Position)</th>
                    <th>Contact Info</th>
                    <th>Status</th>
                    <th>Management Team</th>
                    <th className="text-center">Team Size</th>
                    <th className="text-right pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                        <td colSpan="7" className="text-center p-5">
                            <div className="spinner-border text-primary" role="status"></div>
                        </td>
                    </tr>
                  ) : leaders && leaders.length > 0 ? leaders.map((data, index) => (
                    <RowLeader key={data.id} index={index + 1} data={{ ...data, onDelete: confirmDelete }} refresh={fetchData} />
                  )) : (
                    <tr>
                        <td colSpan="7" className="text-center p-5 text-muted">No leaders found in the directory.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Missions Table */}
        <div className="glass-card border-0 shadow-lg">
            <div className="card-header bg-white border-bottom py-4 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 font-weight-bold text-dark">
                    <i className="fas fa-paper-plane mr-2 text-primary"></i> Missions Submitted to Leaders
                </h5>
            </div>
            <div className="p-3">
                <div className="table-responsive">
                    <table className="table table-borderless align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                        <thead>
                            <tr className="text-muted text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>
                                <th scope="col" className="ps-4">Mission Title</th>
                                <th scope="col">Assigned To</th>
                                <th scope="col" className="text-center">Progress</th>
                                <th scope="col">Deadline</th>
                                <th scope="col" className="text-right pe-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center p-5">Loading missions...</td></tr>
                            ) : missions.length === 0 ? (
                                <tr><td colSpan="5" className="text-center p-5 text-muted fst-italic">No missions assigned to leaders yet.</td></tr>
                            ) : missions.map(mission => (
                                <tr key={mission._id} className="soft-card shadow-sm hover-lift">
                                    <td className="ps-4 py-3">
                                        <div className="fw-bold text-dark mb-1">{mission.title}</div>
                                        <small className="text-muted d-block text-truncate" style={{maxWidth: '250px'}} title={mission.description}>
                                            {mission.description}
                                        </small>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-primary-soft text-primary d-flex align-items-center justify-content-center mr-2 shadow-sm font-weight-bold" style={{width: '32px', height: '32px', fontSize: '12px'}}>
                                                {mission.assignedTo?.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-dark small font-weight-bold">{mission.assignedTo?.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center">
                                            <CircularProgress value={mission.progress || 0} size={40} />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="badge badge-light border text-muted px-2" style={{fontSize: '0.7rem'}}>
                                            <i className="far fa-calendar-alt mr-1"></i>
                                            {mission.endDate ? new Date(mission.endDate).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="text-right pe-4">
                                      <div className="d-flex justify-content-end gap-2">
                                        <a 
                                            href={downloadTaskPDF(mission._id, 'view')} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-light border rounded-pill px-3 shadow-sm font-weight-bold"
                                        >
                                            <i className="fas fa-eye mr-1 text-primary"></i> PDF View
                                        </a>
                                        {mission.file && (
                                            <a 
                                                href={getFileUrl(mission.file)} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-light border rounded-pill px-3 shadow-sm font-weight-bold"
                                            >
                                                <i className="fas fa-paperclip mr-1 text-success"></i> Attachment
                                            </a>
                                        )}
                                      </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </section>
            <ConfirmationModal
                isOpen={isDeleting}
                onClose={() => setIsDeleting(false)}
                onConfirm={handleDelete}
                title="Delete Leader"
                message={`Are you sure you want to delete "${selectedLeader?.name}"? Associated employers will be unassigned.`}
            />
        </div>
    );
}

export default Leaders;

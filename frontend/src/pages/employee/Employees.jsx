import { useEffect, useState } from "react";
import { exportToPrint } from "../../utils/printHelper";
import HeaderSection from "../../components/HeaderSection";
import RowEmployee from "../../components/rows/row-employee";
import { getEmployeeUsers, deleteUser, getTeams } from "../../http";
import ConfirmationModal from "../../components/modal/ConfirmationModal";
import { toast } from "react-toastify";

const Employees = () => {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchEmployees = async (isMounted = true) => {
    if (isMounted) setLoading(true);
    const res = await getEmployeeUsers();
    if (res.success && isMounted) {
      setUsers(res.data);
    }
    if (isMounted) setLoading(false);
  }

  const fetchTeams = async (isMounted = true) => {
    const res = await getTeams();
    if (res.success && isMounted) {
      setTeams(res.data);
    }
  }

  useEffect(() => {
    let isMounted = true;
    fetchEmployees(isMounted);
    fetchTeams(isMounted);
    
    return () => {
      isMounted = false;
    };
  }, [])

  const confirmDelete = (user) => {
    setSelectedUser(user);
    setIsDeleting(true);
  }

  const handleDelete = async () => {
    if (!selectedUser) return;
    const res = await deleteUser(selectedUser.id);
    if (res.success) {
      toast.success(res.message);
      fetchEmployees();
    } else {
      toast.error(res.message || "Failed to delete employee");
    }
    setIsDeleting(false);
  }
  const handlePrintList = () => {
    const tableColumn = ["#", "Name", "Email", "Mobile", "Sub-Type (Position)", "Status", "Team"];
    const tableRows = [];

    const filteredUsers = users.filter(u => {
      const q = query.trim().toLowerCase();
      const matchesQuery = q === "" || (
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        String(u.mobile || "").toLowerCase().includes(q)
      );
      const matchesTeam = teamFilter === "" || (u.team && u.team.name === teamFilter);
      return matchesQuery && matchesTeam;
    });

    filteredUsers.forEach((user, index) => {
      const rowData = [
        index + 1,
        user.name,
        user.email,
        user.mobile,
        user.position || "Not Specified",
        user.status ? "Active" : "Inactive",
        user.team ? user.team.name : "Unassigned"
      ];
      tableRows.push(rowData);
    });

    exportToPrint({
      title: "Employee Directory",
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
                <h3 className="font-weight-bold text-dark mb-1">Employee Directory</h3>
                <p className="text-muted mb-0">Manage and oversee all organization members and their performance</p>
            </div>
            <button onClick={handlePrintList} className="btn btn-primary rounded-pill px-4 shadow-sm hover-lift">
              <i className="fas fa-file-export mr-2"></i> Export Directory (PDF)
            </button>
        </div>

        <div className="glass-card border-0 shadow-lg overflow-hidden">
          <div className="card-body p-0">
            {/* Filter Section */}
            <div className="row g-3 px-4 py-4 border-bottom bg-light-50 align-items-center">
              <div className="col-md-5">
                <div className="search-element position-relative">
                    <i className="fas fa-search position-absolute text-muted" style={{ left: '15px', top: '15px' }}></i>
                    <input
                      type="text"
                      className="form-control rounded-pill border shadow-sm ps-5"
                      placeholder="Search by name, email, or mobile..."
                      style={{ height: '45px', paddingLeft: '45px' }}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
              </div>
              <div className="col-md-3">
                <div className="position-relative">
                   <i className="fas fa-filter position-absolute text-muted" style={{ left: '15px', top: '15px' }}></i>
                    <select
                      className="form-control rounded-pill border shadow-sm ps-5"
                      style={{ height: '45px', paddingLeft: '45px', appearance: 'none' }}
                      value={teamFilter}
                      onChange={(e) => setTeamFilter(e.target.value)}
                    >
                      <option value="">All Teams (Global)</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.name}>{team.name}</option>
                      ))}
                    </select>
                </div>
              </div>
              <div className="col-md-4 text-right">
                 <span className="text-muted small font-weight-bold">
                    Showing {users.filter(u => {
                        const q = query.trim().toLowerCase();
                        const matchesQuery = q === "" || (
                        (u.name || "").toLowerCase().includes(q) ||
                        (u.email || "").toLowerCase().includes(q) ||
                        String(u.mobile || "").toLowerCase().includes(q)
                        );
                        const matchesTeam = teamFilter === "" || (u.team && u.team.name === teamFilter);
                        return matchesQuery && matchesTeam;
                    }).length} results
                 </span>
              </div>
            </div>

            <div className="p-3">
                <div className="table-responsive">
                  <table className="table table-borderless align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                    <thead>
                      <tr className="text-muted text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>
                        <th className="ps-4">Employee</th>
                        <th>Position</th>
                        <th>Contact info</th>
                        <th>Status</th>
                        <th>Current Team</th>
                        <th className="text-center">Performance</th>
                        <th className="text-right pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                            <td colSpan="7" className="text-center p-5">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="text-muted mt-2">Loading employee records...</p>
                            </td>
                        </tr>
                      ) : users && users
                          .filter(u => {
                            const q = query.trim().toLowerCase();
                            const matchesQuery = q === "" || (
                              (u.name || "").toLowerCase().includes(q) ||
                              (u.email || "").toLowerCase().includes(q) ||
                              String(u.mobile || "").toLowerCase().includes(q)
                            );
                            const matchesTeam = teamFilter === "" || (u.team && u.team.name === teamFilter);
                            return matchesQuery && matchesTeam;
                          }).length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center p-5">
                                    <div className="py-4">
                                        <i className="fas fa-users-slash fa-3x text-muted opacity-25 mb-3"></i>
                                        <p className="text-muted">No employees found matching your criteria.</p>
                                    </div>
                                </td>
                            </tr>
                          ) : users
                          .filter(u => {
                            const q = query.trim().toLowerCase();
                            const matchesQuery = q === "" || (
                              (u.name || "").toLowerCase().includes(q) ||
                              (u.email || "").toLowerCase().includes(q) ||
                              String(u.mobile || "").toLowerCase().includes(q)
                            );
                            const matchesTeam = teamFilter === "" || (u.team && u.team.name === teamFilter);
                            return matchesQuery && matchesTeam;
                          })
                          .map((data, index) => {
                            return <RowEmployee key={index} index={index + 1} data={{ ...data, onDelete: confirmDelete }} refresh={fetchEmployees} />
                          })
                      }
                    </tbody>
                  </table>
                </div>
            </div>
          </div>
        </div>
      </section>
      <ConfirmationModal
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete "${selectedUser?.name}"? This will also remove them from any assigned team.`}
      />
    </div>
  )
}

export default Employees;

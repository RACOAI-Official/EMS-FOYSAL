import { useEffect, useState } from "react";
import HeaderSection from "../../components/HeaderSection";
import RowEmployee from "../../components/rows/row-employee";
import { getEmployeeUsers, deleteUser, getTeams } from "../../http";
import ConfirmationModal from "../../components/modal/ConfirmationModal";
import { toast } from "react-toastify";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Employees = () => {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    const res = await getEmployeeUsers();
    if (res.success) {
      setUsers(res.data);
    }
    setLoading(false);
  }

  const fetchTeams = async () => {
    const res = await getTeams();
    if (res.success) {
      setTeams(res.data);
    }
  }

  useEffect(() => {
    fetchEmployees();
    fetchTeams();
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
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("Easy Employee", 15, 20);

    doc.setFontSize(16);
    doc.text("Employee List", 105, 40, null, null, "center");

    doc.setFontSize(10);
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 15, 50);

    const tableColumn = ["#", "Name", "Email", "Mobile", "Status", "Team"];
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
        user.status ? "Active" : "Inactive",
        user.team ? user.team.name : "Unassigned"
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [103, 119, 239] },
    });

    // Preview
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
  };

  return (
    <div className="main-content">
      <section className="section">
        <HeaderSection title='Employees' />
        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <h4>All Employees</h4>
            <button onClick={handlePrintList} className="btn btn-primary">
              <i className="fas fa-print mr-2"></i> Print List
            </button>
          </div>
          <div className="card-body p-0">
            <div className="row px-3 py-3">
              <div className="form-group col-md-6 mb-2">
                <label>Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, email, mobile"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="form-group col-md-3 mb-2">
                <label>Team</label>
                <select
                  className="form-control select2"
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.name}>{team.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-md center-text">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Status</th>
                    <th>Team</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    !loading && users && users
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

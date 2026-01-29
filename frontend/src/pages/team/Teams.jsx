import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { exportToPrint } from "../../utils/printHelper";
import { useDispatch } from "react-redux";
import HeaderSection from "../../components/HeaderSection";
import RowTeam from "../../components/rows/team-row";
import { getTeams, deleteTeam } from "../../http";
import { setTeam } from "../../store/team-slice";
import { setTeamMembers } from "../../store/user-slice";
import ConfirmationModal from "../../components/modal/ConfirmationModal";
import { toast } from "react-toastify";

const Teams = () => {
    const history = useHistory();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);

    const fetchTeams = async () => {
        setLoading(true);
        const res = await getTeams();
        if (res.success) {
            setTeams(res.data);
        }
        setLoading(false);
    }

    useEffect(() => {
        dispatch(setTeam(null));
        dispatch(setTeamMembers(null));
        fetchTeams();
    }, [dispatch]);

    const confirmDelete = (team) => {
        setSelectedTeam(team);
        setIsDeleting(true);
    }

    const handleDelete = async () => {
        if (!selectedTeam) return;
        const res = await deleteTeam(selectedTeam.id);
        if (res.success) {
            toast.success(res.message);
            fetchTeams();
        } else {
            toast.error(res.message || "Failed to delete team");
        }
        setIsDeleting(false);
    }

    const handlePrintTeams = () => {
        const tableColumn = ["#", "Name", "Leader", "Status", "Total Members"];
        const tableRows = [];

        teams.forEach((team, index) => {
            const rowData = [
                index + 1,
                team.name,
                team.leader ? team.leader.name : "No Leader",
                team.status,
                team.totalMembers || 0
            ];
            tableRows.push(rowData);
        });

        exportToPrint({
            title: "Teams List",
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
                        <h3 className="font-weight-bold text-dark mb-1">Organizational Units</h3>
                        <p className="text-muted mb-0">Manage and monitor all active teams within the company</p>
                    </div>
                    <button onClick={handlePrintTeams} className="btn btn-primary rounded-pill px-4 shadow-sm font-weight-bold">
                        <i className="fas fa-print mr-2"></i> Export Directory
                    </button>
                </div>

                <div className="glass-card border-0 shadow-lg overflow-hidden">
                    <div className="card-header bg-white border-bottom py-4">
                        <h5 className="mb-0 font-weight-bold text-dark">
                            <i className="fas fa-users-cog mr-2 text-primary"></i> Team Registry
                        </h5>
                    </div>
                    <div className="card-body p-3">
                        <div className="table-responsive">
                            <table className="table table-borderless align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                                <thead>
                                    <tr className="text-muted text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>
                                        <th className="ps-4">Team</th>
                                        <th>Leadership</th>
                                        <th>Resource Stats</th>
                                        <th className="text-center">Status</th>
                                        <th className="text-right pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5" className="text-center p-5 text-muted">Synchronizing team data...</td></tr>
                                    ) : teams.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center p-5 text-muted">No teams found in the registry.</td></tr>
                                    ) : teams.map((data, index) => (
                                        <RowTeam key={data.id} index={index + 1} data={{ ...data, onDelete: confirmDelete }} />
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
                title="Delete Team"
                message={`Are you sure you want to delete the team "${selectedTeam?.name}"? Employers in this team will be unassigned.`}
            />
        </div>
    );
}

export default Teams;

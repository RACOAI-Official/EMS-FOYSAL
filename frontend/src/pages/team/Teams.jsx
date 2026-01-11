import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import HeaderSection from "../../components/HeaderSection";
import RowTeam from "../../components/rows/team-row";
import { getTeams, deleteTeam } from "../../http";
import { setTeam } from "../../store/team-slice";
import { setTeamMembers } from "../../store/user-slice";
import ConfirmationModal from "../../components/modal/ConfirmationModal";
import { toast } from "react-toastify";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Teams = () => {
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
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.text("Easy Employee", 15, 20);

        doc.setFontSize(16);
        doc.text("Teams List", 105, 40, null, null, "center");

        doc.setFontSize(10);
        doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 15, 50);

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
                <HeaderSection title='Teams' />
                <div className="card">
                    <div className="card-header d-flex justify-content-between">
                        <h4>All Teams</h4>
                        <button onClick={handlePrintTeams} className="btn btn-primary">
                            <i className="fas fa-print mr-2"></i> Print List
                        </button>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-striped table-md center-text">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Leader</th>
                                        <th>Status</th>
                                        <th>Total Members</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!loading && teams && teams.map((data, index) => (
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

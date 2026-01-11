import { useEffect, useState } from "react";
import HeaderSection from "../../components/HeaderSection";
import RowLeader from "../../components/rows/row-leader";
import { getLeaderUsers, deleteUser } from "../../http";
import ConfirmationModal from "../../components/modal/ConfirmationModal";
import { toast } from "react-toastify";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Leaders = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedLeader, setSelectedLeader] = useState(null);

    const fetchLeaders = async () => {
        setLoading(true);
        const res = await getLeaderUsers();
        if (res.success) {
            setLeaders(res.data);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchLeaders();
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
            fetchLeaders();
        } else {
            toast.error(res.message);
        }
        setIsDeleting(false);
    }

    const handlePrintLeaders = () => {
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.text("Easy Employee", 15, 20);

        doc.setFontSize(16);
        doc.text("Leaders List", 105, 40, null, null, "center");

        doc.setFontSize(10);
        doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 15, 50);

        const tableColumn = ["#", "Name", "Email", "Mobile", "Team", "Total Members"];
        const tableRows = [];

        leaders.forEach((leader, index) => {
            const rowData = [
                index + 1,
                leader.name,
                leader.email,
                leader.mobile,
                leader.team && leader.team.name ? leader.team.name : "No Team",
                leader.totalMembers || 0
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
                <HeaderSection title='Leaders' />
                <div className="card">
                    <div className="card-header d-flex justify-content-between">
                        <h4>All Leaders</h4>
                        <button onClick={handlePrintLeaders} className="btn btn-primary">
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
                                        <th>Email</th>
                                        <th>Mobile</th>
                                        <th>Status</th>
                                        <th>Leading Team</th>
                                        <th>Total Members</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!loading && leaders && leaders.map((data, index) => (
                                        <RowLeader key={data.id} index={index + 1} data={{ ...data, onDelete: confirmDelete }} />
                                    ))}
                                    {!loading && (!leaders || leaders.length === 0) && (
                                        <tr>
                                            <td colSpan="9" className="text-center">No leaders found</td>
                                        </tr>
                                    )}
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

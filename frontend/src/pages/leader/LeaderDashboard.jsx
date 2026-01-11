import { useEffect, useState } from "react";
import HeaderSection from "../../components/HeaderSection";
import { getLeaderStats, getMembers_Leader } from "../../http";
import RowEmployee from "../../components/rows/row-employee";

const LeaderDashboard = () => {
    const [stats, setStats] = useState({ totalMembers: 0, totalProblems: 0 });
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const statsRes = await getLeaderStats();
        if (statsRes.success) setStats(statsRes.data);

        const membersRes = await getMembers_Leader();
        if (membersRes.success) setMembers(membersRes.data);
        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="main-content">
            <section className="section">
                <HeaderSection title='Leader Dashboard' />
                
                <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-12">
                        <div className="card card-statistic-2">
                            <div className="card-icon shadow-primary bg-primary">
                                <i className="fas fa-users"></i>
                            </div>
                            <div className="card-wrap">
                                <div className="card-header">
                                    <h4>Total Members</h4>
                                </div>
                                <div className="card-body">
                                    {members.length}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-12">
                        <div className="card card-statistic-2">
                            <div className="card-icon shadow-primary bg-danger">
                                <i className="fas fa-exclamation-triangle"></i>
                            </div>
                            <div className="card-wrap">
                                <div className="card-header">
                                    <h4>Reported Problems</h4>
                                </div>
                                <div className="card-body">
                                    {stats.totalProblems}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h4>Employers Under You</h4>
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
                                        <th>Project</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!loading && members.map((data, index) => (
                                        <RowEmployee key={data.id} index={index + 1} data={data} />
                                    ))}
                                    {!loading && members.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center">No members found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default LeaderDashboard;

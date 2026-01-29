import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import HeaderSection from "../../components/HeaderSection";
import { getLeaderStats, getMembers_Leader } from "../../http";
import RowEmployee from "../../components/rows/row-employee";
import CircularProgress from "../../components/CircularProgress";

const LeaderDashboard = () => {
    const { user } = useSelector((state) => state.authSlice);
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
        <>
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
                    <h4>My Profile Details</h4>
                  </div>
                  <div className="card-body row text-md-left text-center">
                    <div className="col-md-3 mb-4 mb-md-0 d-flex justify-content-center align-items-center">
                      <img 
                        className='img-fluid img-thumbnail shadow-sm' 
                        src={user?.image} 
                        alt="Profile" 
                        style={{ borderRadius: '15px', maxHeight: '300px', objectFit: 'cover', width: '100%' }}
                      />
                    </div>

                    <div className="col-md-9 text-left">
                      <div className="table-responsive">
                        <table className='table table-sm'>
                          <tbody>
                            <tr>
                              <th className="border-0">Name</th>
                              <td className="border-0">{user?.name}</td>
                            </tr>
                            <tr>
                              <th className="border-0">Email</th>
                              <td className="border-0">{user?.email}</td>
                            </tr>
                            <tr>
                              <th>Mobile</th>
                              <td>{user?.mobile}</td>
                            </tr>
                            <tr>
                              <th>Father's Name</th>
                              <td>{user?.fatherName || '-'}</td>
                            </tr>
                            <tr>
                              <th>Mother's Name</th>
                              <td>{user?.motherName || '-'}</td>
                            </tr>
                            <tr>
                                <th>Present Address</th>
                                <td>{user?.presentAddress || '-'}</td>
                            </tr>
                            <tr>
                                <th>Permanent Address</th>
                                <td>{user?.address || '-'}</td>
                            </tr>

                            <tr>
                                <th>NID</th>
                                <td>{user?.nid || '-'}</td>
                            </tr>
                            <tr>
                                <th>Blood Group</th>
                                <td>{user?.bloodGroup || '-'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
  {/* Personal Progress Card */}
                <div className="card">
                    <div className="card-header">
                        <h4><i className="fas fa-user-check mr-2"></i>My Progress</h4>
                    </div>
                    <div className="card-body">
                        <div className="row align-items-center">
                            <div className="col-md-3 text-center">
                                <CircularProgress value={user.progress || 0} size={100} />
                            </div>
                            <div className="col-md-9">
                                <h5 className="mb-3">Your Performance: {user.progress || 0}%</h5>
                                <div className="progress mb-3" style={{ height: '30px' }}>
                                    <div 
                                        className={`progress-bar ${user.progress >= 75 ? 'bg-success' : user.progress >= 50 ? 'bg-info' : user.progress >= 25 ? 'bg-warning' : 'bg-danger'}`}
                                        role="progressbar" 
                                        style={{ width: `${user.progress || 0}%` }}
                                    >
                                        {user.progress || 0}%
                                    </div>
                                </div>
                                {user.progressNote && (
                                    <div className="alert alert-info mb-0">
                                        <strong>Note from Admin:</strong> {user.progressNote}
                                    </div>
                                )}
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
                                         
                                        <th>Employee ID/Name</th>
                                        <th>Position</th>
                                        <th>Email/Mobile</th>
                                        <th>Status</th>
                                        <th>Teams</th>
                                        <th>Progress</th>
                                        <th>Actions</th>
                                         
                                    </tr>
                                </thead>
                                <tbody>
                                    {!loading && members.map((data, index) => (
                                        <RowEmployee key={data.id} index={index + 1} data={data} />
                                    ))}
                                    {!loading && members.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="text-center">No members found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

              

                
 

               
        </>
    );
}

export default LeaderDashboard;

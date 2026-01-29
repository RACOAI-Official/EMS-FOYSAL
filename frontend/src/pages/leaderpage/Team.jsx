import { useEffect, useState } from "react";
import CountsCard from "../../components/dashboard/CountsCard";
import RowMember from "../../components/rows/row-member";
import { getTeam_Leader, getMembers_Leader } from "../../http";
import CircularProgress from "../../components/CircularProgress";

const Team = () => {
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  // Progress input removed for leader page (display-only here)

  useEffect(() => {
    (async () => {
      const res = await getTeam_Leader();
      if (res.success) {
        setTeam(res.data);
        setLoading(false);
      }
      const res1 = await getMembers_Leader();
      if (res1.success) {
        setMembers(res1.data);
        setMembersLoading(false);
      }
    })();
  }, [])

  return (
    <>
      <div className="main-content">
        <section className="section">
          {team && (
            <>
              <div className="section-header  d-flex justify-content-between">
                <h1>Team</h1>
                <div>{/* Leader controls could be added here if needed */}</div>
              </div>

              <div className="row">
                <CountsCard title='Total Employee' icon='fa-user' count={(members && members.length) || 0} />
              </div>

              <div className="card">
                <div className="card-body row">
                  <div className="col-md-3 ">
                    <img className='img-fluid img-thumbnail' src={team.image} alt="" />
                  </div>
                  <div className="col-md-9">
                    <table className='table'>
                      <tbody>
                        <tr>
                          <th>Name</th>
                          <td>{team.name}</td>
                        </tr>
                        <tr>
                          <th>Description</th>
                          <td>{team.description}</td>
                        </tr>
                        <tr>
                          <th>Progress</th>
                          <td>
                            <div className="text-center">
                                <CircularProgress value={team.progress || 0} size={50} />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          { !membersLoading && (
            <div className="card">
              <div className="card-header">
                <h4>All Employees</h4>
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
                        <th>Progress</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      { !loading && members && members.map((data, index) => (
                          <RowMember key={index} index={index + 1} data={data} />
                        )) }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  )
}

export default Team;

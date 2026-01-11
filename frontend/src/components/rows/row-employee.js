import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { deleteUser } from "../../http";
import { toast } from "react-toastify";


const RowEmployee = ({ index, data, refresh }) => {
    const { user } = useSelector(state => state.authSlice);

    const handleDelete = () => {
        if (data.onDelete) {
            data.onDelete(data);
        }
    }

    return (
        <tr>
            <td>{index}</td>
            <td><figure className="avatar"> <img src={data.image} alt={data.name} /> </figure></td>
            <td>{data.name}</td>
            <td>{data.email}</td>
            <td>{data.mobile}</td>
            <td><div className={`badge ${data.status === 'Active' ? 'badge-primary' : 'badge-danger'}`}>{data.status}</div></td>

            {
                user.type === "Admin" ?
                    (<td>
                        {data.team ?
                            <NavLink to={`/team/${data.team.id}`} className='badge  badge-primary' style={{ padding: '0px 10px 0px 0px' }}>
                                <img src={data.team.image} className='avatar avatar-sm mr-2' alt="Person" width="96" height="96" />
                                {data.team.name}
                            </NavLink>
                            :
                            <div className='badge  badge-light' style={{ padding: '0px 10px 0px 0px' }}>
                                <img src='./assets/icons/team.png' className='avatar avatar-sm mr-2' alt="Person" width="96" height="96" />
                                No Team
                            </div>}
                    </td>)
                    : ""
            }
            {
                user.type === "Admin" ?
                    (<td>
                        <NavLink to={`/employee/${data.id}`} className="btn btn-secondary mr-2">Detail</NavLink>
                        <button onClick={handleDelete} className="btn btn-danger">Delete</button>
                    </td>)
                    : ""
            }
        </tr>
    );
}

export default RowEmployee;

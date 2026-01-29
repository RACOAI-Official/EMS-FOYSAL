import React, { useEffect, useState } from 'react';
import { useLocation, useHistory, NavLink } from 'react-router-dom';
import { globalSearch } from '../../http';
import Loading from '../../components/Loading';
import HeaderSection from '../../components/HeaderSection';

const SearchResults = () => {
    const location = useLocation();
    const history = useHistory();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const query = new URLSearchParams(location.search).get('q');

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const res = await globalSearch(query);
                if (res.success) {
                    const data = res.data;
                    // If only one result, redirect immediately to user detail
                    if (data.length === 1) {
                        const user = data[0];
                        let path = `/employee/${user.id}`;
                        if (['super_admin', 'sub_admin'].includes(user.type)) {
                            path = `/admin/${user.id}`;
                        } else if (user.type === 'leader') {
                            path = `/employee/${user.id}`; // Leaders also use employee detail view usually
                        }
                        history.replace(path);
                    } else {
                        setResults(data);
                    }
                }
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query, history]);

    if (loading) return <Loading />;

    return (
        <div className="main-content">
            <section className="section">
                <HeaderSection title={`Search Results for "${query}"`} />
                <div className="section-body">
                    <div className="card">
                        <div className="card-body">
                            {results.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="fas fa-search fa-3x mb-3 text-muted"></i>
                                    <h5>No matching users found</h5>
                                    <p className="text-muted">Try searching with a different name, email, or mobile number.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Type</th>
                                                <th>Email</th>
                                                <th>Mobile</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map((user) => (
                                                <tr key={user.id}>
                                                    <td>{user.name}</td>
                                                    <td>
                                                        <div className={`badge badge-${['super_admin', 'sub_admin'].includes(user.type) ? 'danger' : user.type === 'leader' ? 'warning' : 'primary'}`}>
                                                            {user.type}
                                                        </div>
                                                    </td>
                                                    <td>{user.email}</td>
                                                    <td>{user.mobile}</td>
                                                    <td>
                                                        <NavLink 
                                                            to={['super_admin', 'sub_admin'].includes(user.type) ? `/admin/${user.id}` : `/employee/${user.id}`} 
                                                            className="btn btn-primary btn-sm"
                                                        >
                                                            View Profile
                                                        </NavLink>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SearchResults;

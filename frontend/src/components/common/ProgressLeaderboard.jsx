import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getLeaderboardData } from '../../http';
import socket from '../../socket';
import CircularProgress from '../CircularProgress';

const ProgressLeaderboard = ({ mode = "users", type = null, includeLeaders = false, title = "Top Performers" }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector(state => state.authSlice);

    useEffect(() => {
        let isMounted = true;
        fetchData(isMounted);
        
        // Real-time listener
        if (socket) {
            socket.on('progress-update', (data) => {
                if (isMounted) {
                    console.log('Real-time progress update received:', data);
                    fetchData(isMounted);
                }
            });
        }

        return () => {
            isMounted = false;
            if (socket) socket.off('progress-update');
        };
    }, [mode, type, includeLeaders]);

    const fetchData = async (isMounted = true) => {
        try {
            setLoading(true);
            const res = await getLeaderboardData(mode, type);
            if (res.success && isMounted) {
                let allData = res.data;

                // Client-side filtering/sorting refinement
                const sorted = allData
                    .filter(u => (u.progress || 0) > 0 || (mode === 'teams')) 
                    .sort((a, b) => (b.progress || 0) - (a.progress || 0));

                setLeaderboard(sorted);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            if (isMounted) setLoading(false);
        }
    };

    const getMedalIcon = (rank, item) => {
        if (mode === "teams" && item.isFavorite) return '⭐';
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank;
    };

    if (loading) {
        return (
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body text-center py-5">
                    <div className="spinner-grow text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (leaderboard.length === 0) {
        return (
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header border-0 pt-4">
                    <h4 className="font-weight-bold mb-0"><i className="fas fa-chart-bar mr-2 text-primary"></i>{title}</h4>
                </div>
                <div className="card-body text-center py-5 text-muted">
                    <p className="mb-0">No progress data available.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card mb-4 overflow-hidden border-0">
            <div className="card-header border-bottom py-4 d-flex justify-content-between align-items-center">
                <h5 className="font-weight-bold mb-0">
                    <i className={mode === "teams" ? "fas fa-layer-group mr-2 text-primary" : "fas fa-fire mr-3 text-danger"}></i>
                    {title}
                </h5>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-borderless align-middle mb-0">
                        <thead>
                            <tr className="text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
                                <th style={{ width: '85px' }} className="text-center ps-4">Rank</th>
                                <th>{mode === "teams" ? "Team" : "Member"}</th>
                                {mode === "users" && <th className="d-none d-md-table-cell">Team</th>}
                                <th style={{ width: '120px' }} className="text-center pe-4">Progress</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((item, index) => {
                                const isCurrentUser = mode === "users" && (item.id === user.id || item._id === user._id);
                                const isMyTeam = mode === "teams" && user.team && (Array.isArray(user.team) ? user.team.some(t => (t._id || t) === item.id) : (user.team._id || user.team) === item.id);
                                const rank = index + 1;
                                
                                return (
                                    <tr 
                                        key={item.id || item._id} 
                                        className={`${isCurrentUser || isMyTeam ? 'bg-primary-soft' : ''} border-bottom`}
                                        style={{ transition: 'background-color 0.2s ease' }}
                                    >
                                        <td className="text-center align-middle ps-4 py-3">
                                            <div className={`rank-circle rank-${rank} ${rank <= 3 ? 'rank-top' : ''} shadow-sm`}>
                                                {getMedalIcon(rank, item)}
                                            </div>
                                        </td>
                                        <td className="align-middle py-3">
                                            <div className="d-flex align-items-center">
                                                <img 
                                                    src={item.image || '/assets/icons/user.png'} 
                                                    className="rounded-circle mr-3 border shadow-sm" 
                                                    width="40" height="40" 
                                                    alt="" 
                                                    onError={(e) => { e.target.src = '/assets/icons/user.png' }}
                                                />
                                                <div>
                                                    <div className={`font-weight-bold ${isCurrentUser ? 'text-primary' : ''} small`}>
                                                        {item.name}
                                                    </div>
                                                    {mode === "users" && includeLeaders && (
                                                        <small className="text-muted text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>
                                                            {item.type}
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        {mode === "users" && (
                                            <td className="align-middle d-none d-md-table-cell py-3">
                                                {item.team ? (
                                                    <span className="badge badge-light font-weight-bold text-primary border">
                                                        {Array.isArray(item.team) ? (item.team[0]?.name || 'Unknown') : (item.team.name || (typeof item.team === 'string' ? item.team : 'Unknown Team'))}
                                                    </span>
                                                ) : <small className="text-muted">Freelance</small>}
                                            </td>
                                        )}
                                        <td className="align-middle text-center pe-4 py-3">
                                            <CircularProgress value={item.progress || 0} size={45} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


export default ProgressLeaderboard;

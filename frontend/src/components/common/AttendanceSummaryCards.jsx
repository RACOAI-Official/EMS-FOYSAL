import React, { useEffect, useState } from 'react';
import { getMyAttendanceSummary, getAttendanceSummary } from '../../http';
import './AttendanceSummaryCards.css';

const AttendanceSummaryCards = ({ userId = null, dateRange = null, refreshTrigger = 0 }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, [userId, dateRange, refreshTrigger]);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const startDate = dateRange?.startDate instanceof Date ? dateRange.startDate.toISOString() : dateRange?.startDate;
            const endDate = dateRange?.endDate instanceof Date ? dateRange.endDate.toISOString() : dateRange?.endDate;
            
            let res;
            if (userId) {
                res = await getAttendanceSummary(userId, startDate, endDate);
            } else {
                res = await getMyAttendanceSummary(startDate, endDate);
            }
            
            if (res.success) {
                setSummary(res.data);
            }
        } catch (error) {
            console.error('Error fetching attendance summary:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="summary-cards-container">
                <div className="summary-card skeleton">
                    <div className="skeleton-content"></div>
                </div>
                <div className="summary-card skeleton">
                    <div className="skeleton-content"></div>
                </div>
                <div className="summary-card skeleton">
                    <div className="skeleton-content"></div>
                </div>
                <div className="summary-card skeleton">
                    <div className="skeleton-content"></div>
                </div>
            </div>
        );
    }

    if (!summary) return null;

    const { percentages } = summary.summary;

    return (
        <div className="row mb-4">
            <div className="col-lg-3 col-md-6 mb-4">
                <div className="glass-card p-4 hover-lift d-flex align-items-center h-100">
                    <div className="rounded-circle d-flex align-items-center justify-content-center mr-3 shadow-sm" 
                         style={{ width: '50px', height: '50px', background: 'var(--success-soft)', color: 'var(--success)', minWidth: '50px' }}>
                        <i className="fas fa-check-circle fa-lg"></i>
                    </div>
                    <div className="overflow-hidden">
                        <div className="text-uppercase text-muted font-weight-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Present & Holiday</div>
                        <div className="h4 font-weight-bold text-dark mb-0">{summary.presentDays} <small className="text-muted" style={{fontSize: '0.8rem'}}>({percentages.present}%)</small></div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Incl. {summary.holidayDays} Holidays</div>
                    </div>
                </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-4">
                <div className="glass-card p-4 hover-lift d-flex align-items-center h-100">
                    <div className="rounded-circle d-flex align-items-center justify-content-center mr-3 shadow-sm" 
                         style={{ width: '50px', height: '50px', background: 'var(--danger-soft)', color: 'var(--danger)', minWidth: '50px' }}>
                        <i className="fas fa-times-circle fa-lg"></i>
                    </div>
                    <div className="overflow-hidden">
                        <div className="text-uppercase text-muted font-weight-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Absent Days</div>
                        <div className="h4 font-weight-bold text-dark mb-0">{summary.absentDays} <small className="text-muted" style={{fontSize: '0.8rem'}}>({percentages.absent}%)</small></div>
                    </div>
                </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-4">
                <div className="glass-card p-4 hover-lift d-flex align-items-center h-100">
                    <div className="rounded-circle d-flex align-items-center justify-content-center mr-3 shadow-sm" 
                         style={{ width: '50px', height: '50px', background: 'var(--primary-soft)', color: 'var(--primary)', minWidth: '50px' }}>
                        <i className="fas fa-calendar-alt fa-lg"></i>
                    </div>
                    <div className="overflow-hidden">
                        <div className="text-uppercase text-muted font-weight-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Leave Days</div>
                        <div className="h4 font-weight-bold text-dark mb-0">{summary.leaveDays} <small className="text-muted" style={{fontSize: '0.8rem'}}>({percentages.leave}%)</small></div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Counts as Present</div>
                    </div>
                </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-4">
                <div className="glass-card p-4 hover-lift d-flex align-items-center h-100">
                    <div className="rounded-circle d-flex align-items-center justify-content-center mr-3 shadow-sm" 
                         style={{ width: '50px', height: '50px', background: 'var(--primary-glow)', color: 'var(--primary)', minWidth: '50px', border: '1px solid var(--border-color)' }}>
                        <i className="fas fa-calendar-check fa-lg"></i>
                    </div>
                    <div className="overflow-hidden">
                        <div className="text-uppercase text-muted font-weight-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Annual Progress</div>
                        <div className="h4 font-weight-bold text-dark mb-0">{summary.totalDays} <small className="text-muted" style={{fontSize: '0.8rem'}}>({percentages.total}%)</small></div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Goal: 365 Days</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceSummaryCards;

import React from 'react';

const CircularProgress = ({ value = 0, size = 60, strokeWidth = 6 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    let color = '#28a745'; // Green by default (60-100)
    if (value < 30) {
        color = '#dc3545'; // Red
    } else if (value < 60) {
        color = '#ffc107'; // Yellow
    }

    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ transform: 'rotate(-90deg)' }}
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="var(--border-color)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
            </svg>
            <span style={{ 
                position: 'absolute', 
                fontSize: '12px', 
                fontWeight: 'bold', 
                color: 'var(--text-main)' 
            }}>
                {Math.round(value)}%
            </span>
        </div>
    );
};

export default CircularProgress;

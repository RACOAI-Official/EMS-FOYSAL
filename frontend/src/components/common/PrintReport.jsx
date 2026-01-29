import React, { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import Letterhead from '../../Letterhead';

const PrintReport = () => {
    const location = useLocation();
    const history = useHistory();
    const [config, setConfig] = React.useState(location.state);

    useEffect(() => {
        let currentConfig = location.state;
        
        if (!currentConfig) {
            const savedData = localStorage.getItem('printData');
            if (savedData) {
                currentConfig = JSON.parse(savedData);
                setConfig(currentConfig);
            }
        }

        if (!currentConfig) {
            history.push('/employees');
            return;
        }

    }, [location.state, history]);

    const { title, columns, data, date } = config || {};

    if (!config) return null;

    return (
        <Letterhead>
            <div className="report-content">
                <style>
                    {`
                        .report-header {
                            text-align: left;
                            margin-bottom: 40px;
                            border-left: 6px solid #f39200;
                            padding: 5px 0 5px 25px;
                            background: linear-gradient(90deg, #fffcf5 0%, transparent 100%);
                        }
                        .report-title {
                            font-size: 28px;
                            font-weight: 800;
                            color: #1a1c1e;
                            margin: 0;
                            letter-spacing: -1px;
                            text-transform: uppercase;
                        }
                        .report-date {
                            font-size: 11px;
                            color: #f39200;
                            font-weight: 700;
                            text-transform: uppercase;
                            letter-spacing: 2px;
                            margin-top: 4px;
                        }
                        .report-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 30px;
                            background: #fff;
                        }
                        .report-table th {
                            background-color: #1a1c1e !important;
                            color: white !important;
                            text-align: left;
                            padding: 16px 15px;
                            font-size: 12px;
                            font-weight: 700;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            border-bottom: 3px solid #f39200;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .report-table td {
                            padding: 14px 15px;
                            border-bottom: 1px solid #eee;
                            font-size: 13px;
                            color: #444;
                            line-height: 1.5;
                        }
                        .report-table tr:nth-child(even) {
                            background-color: #fcfcfc;
                        }
                        .report-table tr:hover {
                            background-color: #fdf8f0;
                        }
                        @media print {
                            .report-table {
                                width: 100% !important;
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }
                        }
                    `}
                </style>
                
                <div className="report-header">
                    <h2 className="report-title">{title || 'Report'}</h2>
                    <p className="report-date">Generated Date: {date || new Date().toLocaleDateString()}</p>
                </div>

                <table className="report-table">
                    <thead>
                        <tr>
                            {columns && columns.map((col, index) => (
                                <th key={index}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Letterhead>
    );
};

export default PrintReport;

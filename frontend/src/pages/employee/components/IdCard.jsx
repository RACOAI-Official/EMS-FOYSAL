import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUser, backendUrl } from "../../../http";
import HeaderSection from "../../../components/HeaderSection";
import { getFileUrl } from "../../../utils/fileUtil";
import { QRCodeSVG as QRCode } from 'qrcode.react';

const IdCard = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await getUser(id);
                if (res.success) {
                    setUser(res.data);
                }
            } catch (err) {
                console.error("Error fetching user", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (!user) return <div className="text-center mt-5">User not found</div>;

    return (
        <div className="main-content">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Helvetica:wght@300;400;700&display=swap');
                
                @media print {
                    .no-print { display: none !important; }
                    .main-content { margin: 0; padding: 0; width: 100% !important; background-color: #f0f2f5 !important; }
                    .section { padding: 0; margin: 0; }
                    .section-header { display: none; }
                    body { background-color: #f0f2f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .id-card-wrapper { 
                        display: flex !important;
                        flex-direction: row !important; 
                        gap: 40px !important; 
                        padding: 50px !important;
                        justify-content: center !important;
                        background-color: #f0f2f5 !important;
                    }
                    .premium-id-card { 
                        box-shadow: none !important; 
                        page-break-inside: avoid; 
                    }
                }
                
                .id-card-wrapper {
                    display: flex;
                    gap: 40px;
                    justify-content: center;
                    padding: 50px;
                    background-color: #f0f2f5;
                    font-family: 'Helvetica', Arial, sans-serif;
                }

                .premium-id-card {
                    width: 2.125in;
                    height: 3.375in;
                    background-color: #121212 !important;
                    color: #ffffff !important;
                    // border-radius: 12px;
                    padding: 16px 35px 22px 16px;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    overflow: hidden;
                }

                /* Front Page Specifics */
                .phone-notch {
                    width: 50px;
                    height: 15px;
                    background: #ffffff;
                    margin: -26px auto 15px 55px;
                    border-radius: 8px 8px 8px 8px;
                }

                .user-photo-box {
                    width: 100%;
                    height: 160px;
                    background: #2a2a2a;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 12px;
                }

                .user-photo-box img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .front-name-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .front-name-row h2 {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    color: #ffffff !important;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .id-arrow {
                    width: 16px;
                    height: 16px;
                    border: 1.5px solid #ffffff;
                    border-radius: 60%;
                    position: absolute;
                    right: 7px;
                    bottom: 120px;
                    font-size: 12px;
                    color: #ffffff !important;
                }

                .user-role {
                    margin: 2px 0 0 0;
                    font-size: 10px;
                    color: #ffffff !important;
                    text-transform: capitalize;
                    font-weight: 300;
                }

                .front-footer-row {
                    margin-top: auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }

                .id-label {
                    margin: 0;
                    font-size: 7px;
                    color: #b4b4b4 !important;
                    letter-spacing: 0.5px;
                }

                .id-value {
                    margin: 2px 0 0 0;
                    font-size: 11px;
                    font-weight: 600;
                    color: #ffffff !important;
                }

                .minor-circle {
                    width: 16px;
                    height: 16px;
                    border: 1.5px solid #cccccc;
                    border-radius: 60%;
                    position: absolute;
                    right: 7px;
                    bottom: 40px;
                    font-size: 12px;
                    color: #ffffff !important;
                }

                /* Back Page Specifics */
                .website-link {
                    margin: 0 0 10px 0;
                    font-size: 8px;
                    color: #888888 !important;
                    letter-spacing: 0.5px;
                }

                .back-title-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }

                .back-title-row h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    text-transform: uppercase;
                    line-height: 1.1;
                    color: #ffffff !important;
                }

                .company-desc {
                    font-size: 8px;
                    line-height: 1.4;
                    color: #aaaaaa !important;
                    margin: 0 0 12px 0;
                }

                .return-box {
                    margin-top: 12px;
                    border-top: 1px solid #333;
                    padding-top: 8px;
                }

                .return-label {
                    margin: 0;
                    font-size: 7px;
                    color: #ff5e5e !important;
                    font-weight: bold;
                    letter-spacing: 0.3px;
                }

                .return-address {
                    margin: 2px 0 0 0;
                    font-size: 8px;
                    color: #cccccc !important;
                    line-height: 1.2;
                }

                .blood-row {
                    margin-top: 8px;
                }

                .blood-label {
                    font-size: 7px;
                    color: #888888 !important;
                }

                .blood-value {
                    font-size: 7px;
                    color: #ffffff !important;
                    font-weight: bold;
                }

                .side-divider {
                    position: absolute;
                    right: 14px;
                    top: 95px;
                    width: 2px;
                    height: 50px;
                    background: rgb(255, 251, 251);
                }

                .qr-box {
                    width: 60px;
                    height: 60px;
                    margin-bottom: 5px;
                    background: #ffffff !important;
                    padding: 3px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .contact-box {
                    text-align: right;
                }

                .contact-label {
                    margin: 0;
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    color: #ffffff !important;
                }

                .contact-details {
                    font-size: 8px;
                    color: #aaaaaa !important;
                    line-height: 1.2;
                }
                `}
            </style>
            
            <section className="section">
                <HeaderSection title="Employee ID Card" />
                
                <div className="section-body">
                    <div className="text-center mb-4 no-print">
                        <button onClick={handlePrint} className="btn btn-primary btn-lg shadow-sm">
                            <i className="fas fa-print mr-2"></i> Print ID Card
                        </button>
                    </div>

                    <div className="id-card-wrapper">
                        {/* FRONT SIDE */}
                        <div className="premium-id-card">
                            <div className="phone-notch"></div>

                            <div className="user-photo-box">
                                <img 
                                    src={getFileUrl(user.image)} 
                                    alt={user.name}
                                    onError={(e) => { e.target.src = '/assets/icons/user.png'; }}
                                />
                            </div>

                            <div>
                                <div className="front-name-row">
                                    <h2>{user.name?.split(' ')[0] || user.name}</h2>
                                </div>
                                <p className="user-role">{user.position || user.type || 'Employee'}</p>
                            </div>

                            <div className="side-divider"></div>
                            <div className="id-arrow">→</div>

                            <div className="front-footer-row">
                                <div>
                                    <p className="id-label">ID NUMBER</p>
                                    <p className="id-value">{user.employeeId || user._id?.substring(0, 8).toUpperCase()}</p>
                                </div>
                                <div className="minor-circle text-bold">---</div>
                            </div>
                        </div>

                        {/* BACK SIDE */}
                        <div className="premium-id-card">
                            <div className="side-divider"></div>

                            <p className="website-link">https://racoai.io</p>

                            <div style={{ marginBottom: '15px' }}>
                                <div className="back-title-row">
                                    <h3>RACO AI</h3>
                                    <div className="id-arrow">→</div>
                                </div>
                                <p className="company-desc">State-of-the-art machine learning and deep learning solutions tailored for your needs.</p>
                                
                                <div className="return-box">
                                    <p className="return-label">IF FOUND, PLEASE RETURN TO:</p>
                                    <p className="return-address">
                                        House-40, Road-20,B, Sector-04, Uttara, Dhaka.<br />
                                        Or Call: 01343831119
                                    </p>
                                </div>

                                <div className="blood-row">
                                    <span className="blood-label">BLOOD GROUP: </span>
                                    <span className="blood-value">{user.bloodGroup || 'N/A'}</span>
                                </div>
                            </div>


                            <div className="front-footer-row">
                                <div className="qr-box">
                                    <QRCode 
                                        value="https://racoai.io"
                                        size={50}
                                        level="H"
                                    />
                                </div>
                                
                                <div className="contact-box">
                                    <p className="contact-label">CONTACT</p>
                                    <p className="contact-details">
                                        {user.mobile || '+8801343831119'}<br />
                                        {user.email || 'raco-operationsbd@racoai.io'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default IdCard;

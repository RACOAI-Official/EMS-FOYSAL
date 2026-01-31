import React from 'react';
import logo from './assets/icons/logo.png';
const Letterhead = ({ children }) => {
  // Configurable Data
  const companyUrl = "https://racoai.io";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(companyUrl)}`;

  const styles = {
    bodyWrapper: {
      backgroundColor: 'var(--surface-bg)',
      display: 'flex',
      justifyContent: 'center',
      padding: '40px 0',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    container: {
      width: '21cm',
      minHeight: '29.7cm',
      height: '29.7cm',
      backgroundColor: 'var(--card-bg)',
      position: 'relative',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    // Top Designs
    topAccent: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '300px',
      height: '150px',
      background: `
        linear-gradient(135deg, #1a1c1e 25%, transparent 25.1%),
        linear-gradient(135deg, #f39200 30%, transparent 30.1%),
        linear-gradient(135deg, #52595D 35%, transparent 35.1%)
      `,
      zIndex: 1,
    },
    topAccentAfter: {
      position: 'absolute',
      top: 0,
      left: '155px', 
      width: 'calc(21cm - 142px)',
      height: '28px',
      backgroundColor: '#f39200',
      zIndex: 1,
      clipPath: 'polygon(28px 0%, 100% 0%, 100% 28px, 0% 28px)', // Flush top-left cut
    },
    header: {
      padding: '60px 60px 20px 60px',
      position: 'relative',
    },
    headerContent: {
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '20px',
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: '15px',
    },
    // Logo Styles
    logoIcon: {
      backgroundColor: '#f39200',
      color: 'white',
      width: '50px',
      height: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50% 50% 50% 0', // Leaf shape
      fontWeight: '800',
      fontSize: '26px',
      marginRight: '15px',
      boxShadow: '2px 2px 10px rgba(0,0,0,0.1)',
    },
    brandTextH1: {
      fontSize: '32px',
      fontWeight: 800,
      color: 'var(--text-main)',
      lineHeight: 1,
      margin: 0,
      letterSpacing: '-1px'
    },
    brandTextP: {
      fontSize: '11px',
      color: '#f39200',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      marginTop: '4px',
      fontWeight: 'bold'
    },
    qrCodeImg: {
      width: '75px',
      height: '75px',
      border: '1px solid #eee',
      padding: '4px',
      backgroundColor: '#fff'
    },
    bodySection: {
      padding: '40px 80px',
      flexGrow: 1,
      color: 'var(--text-main)',
      lineHeight: '1.6',
    },
    footer: {
      position: 'relative',
      paddingBottom: '30px',
    },
    footerCards: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0 60px 40px 60px',
      position: 'relative',
      zIndex: 2
    },
    card: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '12px',
      color: 'var(--text-muted)',
      flex: 1,
    },
    icon: {
      background: '#f39200',
      color: 'white',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '10px',
      borderRadius: '4px',
    },
    bottomAccent: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: '350px',
      height: '120px',
      background: `
        linear-gradient(-45deg, #1a1c1e 20%, transparent 20.1%),
        linear-gradient(-45deg, #f39200 25%, transparent 25.1%),
        linear-gradient(-45deg, #52595D 30%, transparent 30.1%)
      `,
    },

    bottomAccentAfter: {
      position: 'absolute',
      bottom: 0,
      right: '155px', 
      width: 'calc(21cm - 142px)',
      height: '28px',
      backgroundColor: '#1a1c1e',
      zIndex: 1,
      clipPath: 'polygon(0% 0%, 100% 0%, calc(100% - 28px) 100%, 0% 100%)', // Right-side cut
    },
    printButton: {
      position: 'fixed',
      bottom: '40px',
      right: '40px',
      backgroundColor: '#f39200',
      color: 'white',
      border: 'none',
      borderRadius: '50px',
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
      zIndex: 9999,
      transition: 'all 0.3s ease',
    }
  };

  return (
    <div style={styles.bodyWrapper} className="letterhead-print-wrapper">
      <style>
        {`
          @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
          
          @page {
            margin: 0;
          }

          @media print {
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background-color: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .letterhead-print-wrapper {
              padding: 0 !important;
              margin: 0 !important;
              background-color: white !important;
              display: block !important;
            }

            .letterhead-container {
              width: 100% !important;
              min-height: 100vh !important;
              height: auto !important;
              box-shadow: none !important;
              margin: 0 !important;
              padding: 0 !important;
              position: relative !important;
              background-color: white !important;
            }

            /* Fixed Header Section */
            .top-accent, .top-accent-after, .letterhead-header {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              z-index: 100 !important;
            }

            .top-accent {
              width: 300px !important;
            }

            .top-accent-after {
              left: 155px !important;
              width: calc(100% - 155px) !important;
            }

            .letterhead-header {
              width: 100% !important;
              padding: 20px 60px !important;
              box-sizing: border-box !important;
            }

            /* Fixed Footer Section */
            .letterhead-footer, .bottom-accent, .bottom-accent-after {
              position: fixed !important;
              bottom: 0 !important;
              left: 0 !important;
              width: 100% !important;
              z-index: 100 !important;
            }

            .letterhead-footer {
              padding-bottom: 30px !important;
              background-color: transparent !important;
            }

            .bottom-accent {
              left: auto !important;
              right: 0 !important;
              width: 350px !important;
            }

            .bottom-accent-after {
              left: auto !important;
              right: 155px !important;
              width: calc(100% - 155px) !important;
            }

            /* Content Area Spacing */
            .letterhead-body {
              padding-top: 180px !important;
              padding-bottom: 200px !important;
              padding-left: 80px !important;
              padding-right: 80px !important;
              margin: 0 !important;
              display: block !important;
              width: 100% !important;
              box-sizing: border-box !important;
            }

            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
      <div style={styles.container} className="letterhead-container">
        {/* Geometric Accents */}
        <div style={styles.topAccent} className="top-accent"></div>
        <div style={styles.topAccentAfter} className="top-accent-after"></div>

        <header style={styles.header} className="letterhead-header">
          <div style={styles.headerContent}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {/* Refined Company Logo */}
              <div style={styles.logoIcon}>
                <span style={{ marginTop: '-4px' }}>
                  <img src={logo} alt="Logo" style={{ width: '50px', height: '50px' ,objectFit: 'cover',objectPosition: 'center',borderRadius: '50%'}} />
                </span>
              </div>
              <div>
                <h1 style={styles.brandTextH1}>RACO AI</h1>
                <p style={styles.brandTextP}>Limitless Intelligence</p>
              </div>
            </div>

            {/* Dynamic QR Code for racoai.io */}
            <div className="qr-code">
              <img 
                src={qrCodeUrl} 
                alt="RACO AI QR Code" 
                style={styles.qrCodeImg} 
              />
            </div>
          </div>
        </header>

        <main style={styles.bodySection} className="letterhead-body">
          {children}
        </main>

        <footer style={styles.footer} className="letterhead-footer">
          <div style={styles.footerCards}>
            <div style={styles.card}>
              <span style={styles.icon}><i className="fas fa-phone"></i></span>
              <div>
                UK: +44 7417491176<br />
                BD: 0134383119
              </div>
            </div>

            <div style={styles.card}>
              <span style={styles.icon}><i className="fas fa-globe"></i></span>
              <div>www.racoai.com</div>
            </div>

            <div style={styles.card}>
              <span style={styles.icon}><i className="fas fa-map-marker-alt"></i></span>
              <div>
                40, Shahjalal Avenue<br />
                Sector: 4, Uttara, Dhaka-1230
              </div>
            </div>
          </div>
          
          <div style={styles.bottomAccent} className="bottom-accent"></div>
          <div style={styles.bottomAccentAfter} className="bottom-accent-after"></div>
        </footer>

        {/* Floating Print Button */}
        <button 
          onClick={() => window.print()} 
          style={styles.printButton}
          className="no-print letterhead-print-btn"
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
          }}
        >
          <i className="fas fa-print"></i>
          Print Document
        </button>
      </div>

    </div>
  );
};

export default Letterhead;


const CountsCard = ({ title, icon, count }) => {
  return (
    <div className="col-lg-3 col-md-6 col-6">
      <div className="glass-card p-4 mb-4 hover-lift d-flex align-items-center">
        <div className="rounded-circle d-flex align-items-center justify-content-center mr-4" 
             style={{ 
               width: '60px', 
               height: '60px', 
               background: 'var(--primary-soft)',
               color: 'var(--primary)',
               fontSize: '24px'
             }}>
          <i className={`fas ${icon}`}></i>
        </div>
        <div>
          <div className="text-uppercase text-muted font-weight-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
            {title}
          </div>
          <div className="h2 font-weight-bold mb-0 mt-1">
            {count || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountsCard;

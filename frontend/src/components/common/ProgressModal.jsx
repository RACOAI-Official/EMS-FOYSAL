import React, { useState, useEffect } from 'react';
import Modal from '../modal/Modal';

const ProgressModal = ({ show, onHide, title, initialProgress, initialNote, onSave, loading }) => {
    const [progress, setProgress] = useState(initialProgress || 0);
    const [note, setNote] = useState(initialNote || '');

    useEffect(() => {
        if (show) {
            setProgress(initialProgress || 0);
            setNote(initialNote || '');
        }
    }, [initialProgress, initialNote, show]);

    if (!show) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(progress, note);
    };

    return (
        <Modal close={onHide} title={title || 'Update Progress'} width="450px">
            <form onSubmit={handleSubmit} className="p-4">
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="small text-uppercase fw-bold text-muted mb-0">Progress Level</label>
                        <span className={`badge ${progress >= 75 ? 'badge-success' : progress >= 50 ? 'badge-info' : 'badge-warning'} px-3 shadow-sm`}>
                            {progress}%
                        </span>
                    </div>
                    <input
                        type="range"
                        className="form-range w-100"
                        value={progress}
                        onChange={(e) => setProgress(e.target.value)}
                        min="0"
                        max="100"
                        step="5"
                        style={{ height: '30px' }}
                    />
                    <div className="d-flex justify-content-between mt-1 px-1">
                        <small className="text-muted">0%</small>
                        <small className="text-muted">50%</small>
                        <small className="text-muted">100%</small>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="small text-uppercase fw-bold text-muted mb-2 d-block">Progress Note</label>
                    <textarea
                        rows={3}
                        placeholder="Enter notes about this progress update..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="form-control border-0 shadow-sm"
                        style={{ backgroundColor: '#f8f9fa', borderRadius: '10px', fontSize: '0.9rem' }}
                    />
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                    <button 
                        type="button" 
                        className="btn btn-light px-4 mr-2" 
                        onClick={onHide} 
                        disabled={loading}
                        style={{ borderRadius: '8px' }}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary px-4 shadow-sm" 
                        disabled={loading}
                        style={{ borderRadius: '8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                    >
                        {loading ? (
                            <><span className="spinner-border spinner-border-sm me-2" role="status"></span> Updating...</>
                        ) : 'Update Progress'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ProgressModal;

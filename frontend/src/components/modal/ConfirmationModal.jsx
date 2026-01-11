import Modal from './Modal';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <Modal close={onClose} title={title || "Confirm Action"} width="400px">
            <div className="p-4">
                <p>{message || "Are you sure you want to proceed? This action cannot be undone."}</p>
                <div className="d-flex justify-content-end mt-4">
                    <button className="btn btn-secondary mr-2" onClick={onClose}>Cancel</button>
                    <button className="btn btn-danger" onClick={() => { onConfirm(); onClose(); }}>Confirm</button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;

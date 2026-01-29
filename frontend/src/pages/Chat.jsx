import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import HeaderSection from '../components/HeaderSection';
import { getContacts, getMessages, sendMessage, markMessagesAsRead, deleteMessage, deleteConversation, backendUrl } from '../http';
import { getFileUrl } from '../utils/fileUtil';
import moment from 'moment';
import { toast } from 'react-toastify';
import socket from '../socket';

const Chat = () => {
    const { user } = useSelector((state) => state.authSlice);
    const [contacts, setContacts] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchContacts();
    }, []);

    useEffect(() => {
        if (activeContact) {
            fetchMessages(activeContact._id);
        }
    }, [activeContact]);

    useEffect(() => {
        const userId = user?.id || user?._id;
        if (userId) {
            const handleMessage = (msg) => {
                console.log('New message received via socket:', msg);
                if (activeContact && (String(msg.sender) === String(activeContact._id) || String(msg.receiver) === String(activeContact._id))) {
                    setMessages(prev => {
                        if (prev.find(m => m._id === msg._id)) return prev;
                        return [...prev, msg];
                    });
                    
                    if (String(msg.sender) === String(activeContact._id)) {
                        markMessagesAsRead(activeContact._id).catch(console.error);
                    }
                }
                fetchContacts();
            };

            const handleUpdateContacts = () => {
                fetchContacts();
            };

            const handleStatusUpdate = ({ userId: updatedUserId, isOnline }) => {
                setContacts(prev => prev.map(c => 
                    String(c._id) === String(updatedUserId) ? { ...c, isOnline } : c
                ));
                if (activeContact && String(activeContact._id) === String(updatedUserId)) {
                    setActiveContact(prev => ({ ...prev, isOnline }));
                }
            };

            const handleConnect = () => {
                socket.emit('join', userId);
            };

            socket.on('message', handleMessage);
            socket.on('updateContacts', handleUpdateContacts);
            socket.on('user-status-update', handleStatusUpdate);
            socket.on('connect', handleConnect);

            if (!socket.connected) {
                socket.connect();
                socket.emit('join', userId);
            }
        }

        return () => {
            socket.off('message');
            socket.off('updateContacts');
            socket.off('user-status-update');
            socket.off('connect');
        };
    }, [activeContact, user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchContacts = async () => {
        try {
            const res = await getContacts();
            if (res.success) {
                setContacts(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMessages = async (userId, background = false) => {
        if (!background) setLoading(true);
        try {
            const res = await getMessages(userId);
            if (res.success) {
                setMessages(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (!background) setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (isSending) return;
        if (!newMessage.trim() && !selectedFile) return;
        if (!activeContact) return;

        setIsSending(true);
        try {
            const formData = new FormData();
            formData.append('receiverId', activeContact._id);
            if (newMessage.trim()) formData.append('message', newMessage);
            if (selectedFile) formData.append('chatFile', selectedFile);

            const res = await sendMessage(formData);
            if (res.success) {
                setMessages([...messages, res.data]);
                setNewMessage("");
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            } else {
                toast.error("Failed to send message");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error sending message");
        } finally {
            setIsSending(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size too large (max 10MB)");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleContactClick = async (contact) => {
        setActiveContact(contact);
        if (contact.unreadCount > 0) {
            try {
                await markMessagesAsRead(contact._id);
                setContacts(prevContacts =>
                    prevContacts.map(c =>
                        c._id === contact._id ? { ...c, unreadCount: 0 } : c
                    )
                );
            } catch (err) {
                console.error('Failed to mark messages as read', err);
            }
        }
    };

    const [searchTerm, setSearchTerm] = useState("");
    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isImage = (filename) => {
        if (!filename) return false;
        const ext = filename.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    };

    return (
        <div className="main-content">
            <section className="section">
                <HeaderSection title="Chat Room" />
                <div className="row">
                    {/* Contacts List */}
                    <div className={`col-md-4 ${activeContact ? 'd-none d-md-block' : 'd-block'}`}>
                        <div className="card" style={{ height: '75vh' }}>
                            <div className="card-header d-block pb-0">
                                <h4>Contacts</h4>
                                <div className="mt-3 mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search contacts..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ borderRadius: '20px' }}
                                    />
                                </div>
                            </div>
                            <div className="card-body p-0" style={{ overflowY: 'auto' }}>
                                <ul className="list-group list-group-flush">
                                    {filteredContacts.map(contact => (
                                        <li
                                            key={contact._id}
                                            className={`list-group-item d-flex align-items-center justify-content-between ${activeContact?._id === contact._id ? 'bg-aliceblue' : ''}`}
                                            onClick={() => handleContactClick(contact)}
                                            style={{
                                                cursor: 'pointer',
                                                borderLeft: activeContact?._id === contact._id ? '4px solid #6777ef' : 'none',
                                                backgroundColor: activeContact?._id === contact._id ? '#f4f6f9' : 'white'
                                            }}
                                        >
                                            <div className="d-flex align-items-center w-100">
                                                <div className="avatar mr-3 position-relative">
                                                    <img
                                                        src={getFileUrl(contact.image)}
                                                        alt={contact.name}
                                                        className="rounded-circle"
                                                        width="40"
                                                        height="40"
                                                        onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + contact.name; }}
                                                    />
                                                    {contact.isOnline && (
                                                        <span className="position-absolute" style={{
                                                            bottom: '2px',
                                                            right: '2px',
                                                            width: '12px',
                                                            height: '12px',
                                                            backgroundColor: '#44b700',
                                                            borderRadius: '50%',
                                                            border: '2px solid white',
                                                            zIndex: 999
                                                        }}></span>
                                                    )}
                                                </div>
                                                <div style={{ position: 'relative', width: '100%' }} className="contact-item">
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <h6 className="mb-0 text-dark font-weight-bold" style={{ fontSize: '0.95rem' }}>{contact.name}</h6>
                                                        <div className="d-flex align-items-center">
                                                            {contact.lastMessageTime && (
                                                                <small className="text-muted ml-2 mr-1" style={{ fontSize: '0.7rem' }}>
                                                                    {moment(contact.lastMessageTime).format('MMM D')}
                                                                </small>
                                                            )}
                                                            <button
                                                                className="btn btn-sm btn-link text-danger p-0 delete-conv-btn opacity-0"
                                                                style={{ transition: 'opacity 0.2s', zIndex: 10 }}
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    if (window.confirm(`Delete your sent messages with ${contact.name}?`)) {
                                                                        try {
                                                                            const res = await deleteConversation(contact._id);
                                                                            if (res.success) {
                                                                                fetchContacts();
                                                                                if (activeContact && activeContact._id === contact._id) {
                                                                                    setMessages([]);
                                                                                }
                                                                                toast.success("Messages deleted");
                                                                            }
                                                                        } catch (err) {
                                                                            console.error(err);
                                                                            toast.error("Failed to delete messages");
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex justify-content-between">
                                                        <small className={`${contact.unreadCount > 0 ? 'font-weight-bold text-dark' : 'text-muted'}`} style={{
                                                            fontSize: '0.8rem',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            maxWidth: '160px',
                                                            display: 'block'
                                                        }}>
                                                            {contact.lastMessage || contact.position || 'Not Specified'}
                                                        </small>
                                                        {contact.unreadCount > 0 && (
                                                            <span className="badge badge-primary badge-pill ml-2" style={{ fontSize: '0.7rem' }}>
                                                                {contact.unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <style>{`
                                                .contact-item:hover .delete-conv-btn { opacity: 1 !important; }
                                            `}</style>
                                        </li>
                                    ))}
                                    {filteredContacts.length === 0 && <li className="list-group-item text-muted text-center p-4">No contacts found</li>}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`col-md-8 ${!activeContact ? 'd-none d-md-block' : 'd-block'}`}>
                        <div className="card shadow-sm" style={{ height: '75vh', display: 'flex', flexDirection: 'column', borderRadius: '15px', overflow: 'hidden' }}>
                            <div className="card-header bg-white border-bottom p-3">
                                {activeContact ? (
                                    <div className="d-flex align-items-center">
                                        <button className="btn btn-icon btn-light mr-3 d-md-none" onClick={() => setActiveContact(null)}>
                                            <i className="fas fa-chevron-left"></i>
                                        </button>
                                        <div className="avatar mr-3 position-relative">
                                            <img
                                                src={getFileUrl(activeContact.image)}
                                                className="rounded-circle shadow-sm"
                                                alt="avatar"
                                                width="45"
                                                height="45"
                                                style={{ objectFit: 'cover' }}
                                                onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + activeContact.name; }}
                                            />
                                            {activeContact.isOnline && (
                                                <span className="position-absolute" style={{
                                                    bottom: '0px',
                                                    right: '0px',
                                                    width: '14px',
                                                    height: '14px',
                                                    backgroundColor: '#44b700',
                                                    borderRadius: '50%',
                                                    border: '2px solid white',
                                                    zIndex: 999
                                                }}></span>
                                            )}
                                        </div>
                                        <div>
                                            <h5 className="mb-0 text-dark font-weight-bold">{activeContact.name}</h5>
                                            <small className="text-muted">{activeContact.isOnline ? 'Online' : 'Offline'}</small>
                                        </div>
                                    </div>
                                ) : <h5 className="text-muted mb-0">Select a conversation</h5>}
                            </div>
                            <div className="card-body bg-light" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: '#f0f2f5' }}>
                                {activeContact ? (
                                    <>
                                        {messages.map((msg, index) => {
                                            const isMe = String(msg.sender) === String(user?.id || user?._id);

                                            return (
                                                <div key={index} className={`d-flex mb-4 message-item ${isMe ? 'justify-content-end' : 'align-items-start'}`}>
                                                    {!isMe && (
                                                        <div className="mr-3 align-self-end">
                                                            <img
                                                                src={getFileUrl(activeContact.image)}
                                                                alt="avatar"
                                                                className="rounded-circle shadow-sm"
                                                                width="40"
                                                                height="40"
                                                                style={{ objectFit: 'cover' }}
                                                                onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + activeContact.name; }}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className={`d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'}`} style={{ maxWidth: '75%', position: 'relative' }}>
                                                        <div className="small text-muted mb-1">
                                                            <span className="font-weight-bold">
                                                                {isMe ? 'You' : activeContact.name}
                                                            </span>
                                                            <span className="opacity-50 ml-2">
                                                                {moment(msg.createdAt).format('HH:mm')}
                                                            </span>
                                                        </div>

                                                        <div className="d-flex align-items-center">
                                                            {isMe && (
                                                                <button
                                                                    className="btn btn-sm btn-link text-danger mr-2 p-0 opacity-0 delete-btn"
                                                                    style={{ transition: 'opacity 0.2s' }}
                                                                    onClick={async () => {
                                                                        if (window.confirm("Delete this message?")) {
                                                                            try {
                                                                                const res = await deleteMessage(msg._id);
                                                                                if (res.success) {
                                                                                    setMessages(prev => prev.filter(m => m._id !== msg._id));
                                                                                    toast.success("Deleted");
                                                                                }
                                                                            } catch (err) {
                                                                                console.error(err);
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    <i className="fas fa-trash-alt"></i>
                                                                </button>
                                                            )}

                                                            <div
                                                                className={`p-3 rounded shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-white text-dark border'}`}
                                                                style={{
                                                                    borderRadius: isMe ? '15px 15px 2px 15px' : '15px 15px 15px 2px',
                                                                    fontSize: '0.95rem',
                                                                    lineHeight: '1.4',
                                                                    wordWrap: 'break-word',
                                                                    minWidth: '50px'
                                                                }}
                                                            >
                                                                {msg.message && <div className="mb-1">{msg.message}</div>}
                                                                {msg.file && (
                                                                    <div className="mt-2 text-center">
                                                                        {isImage(msg.file) ? (
                                                                            <img 
                                                                                src={getFileUrl(msg.file)} 
                                                                                alt="Chat Attachment" 
                                                                                className="img-fluid rounded" 
                                                                                style={{ maxHeight: '250px', cursor: 'pointer' }}
                                                                                onClick={() => window.open(getFileUrl(msg.file), '_blank')}
                                                                            />
                                                                        ) : (
                                                                            <a 
                                                                                href={getFileUrl(msg.file)} 
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer" 
                                                                                className={`btn btn-sm ${isMe ? 'btn-light' : 'btn-primary'}`}
                                                                            >
                                                                                <i className="fas fa-paperclip mr-1"></i> Download File
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="small text-muted mt-1 opacity-50">
                                                            {isMe ? (msg.isRead ? 'Seen' : 'Delivered') : ''}
                                                        </div>
                                                    </div>

                                                    {isMe && (
                                                        <div className="ml-3 align-self-end">
                                                            <img
                                                                src={getFileUrl(user.image)}
                                                                alt="avatar"
                                                                className="rounded-circle shadow-sm"
                                                                width="40"
                                                                height="40"
                                                                style={{ objectFit: 'cover' }}
                                                                onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + user.name; }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </>
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center h-100 flex-column opacity-50">
                                        <div className="bg-white p-4 rounded-circle shadow-sm mb-3">
                                            <i className="fas fa-comments fa-3x text-primary"></i>
                                        </div>
                                        <h5 className="text-dark font-weight-bold">Your Messages</h5>
                                        <p className="text-muted">Send private photos and messages to a friend or group.</p>
                                    </div>
                                )}
                            </div>
                            {activeContact && (
                                <div className="card-footer bg-white p-3 border-top">
                                    <form onSubmit={handleSendMessage}>
                                        {selectedFile && (
                                            <div className="alert alert-info py-2 px-3 mb-2 d-flex justify-content-between align-items-center" style={{ fontSize: '0.85rem' }}>
                                                <span><i className="fas fa-paperclip mr-2"></i> {selectedFile.name}</span>
                                                <button type="button" className="close" onClick={() => setSelectedFile(null)}><span>&times;</span></button>
                                            </div>
                                        )}
                                        <div className="input-group align-items-center">
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                className="d-none" 
                                                onChange={handleFileChange}
                                            />
                                            <div className="input-group-prepend mr-2">
                                                <button 
                                                    className="btn btn-light rounded-circle text-primary" 
                                                    type="button" 
                                                    onClick={() => fileInputRef.current.click()}
                                                >
                                                    <i className="fas fa-image fa-lg"></i>
                                                </button>
                                            </div>

                                            <input
                                                type="text"
                                                className="form-control bg-light border-0"
                                                placeholder="Aa"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                style={{ borderRadius: '20px', paddingLeft: '15px' }}
                                            />

                                            <div className="input-group-append ml-2">
                                                <button 
                                                    className="btn btn-primary rounded-circle shadow-sm" 
                                                    type="submit" 
                                                    disabled={isSending}
                                                    style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    {isSending ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                    <style>{`
                                        .message-item:hover .delete-btn { opacity: 1 !important; }
                                    `}</style>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Chat;

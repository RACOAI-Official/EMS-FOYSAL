import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import HeaderSection from '../components/HeaderSection';
import { getContacts, getMessages, sendMessage, markMessagesAsRead, deleteMessage, deleteConversation } from '../http';
import moment from 'moment';
import { toast } from 'react-toastify';

const Chat = () => {
    const { user } = useSelector((state) => state.authSlice);
    const [contacts, setContacts] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchContacts();
        // Refresh contacts every 5 seconds to update unread counts
        const interval = setInterval(() => {
            fetchContacts();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeContact) {
            fetchMessages(activeContact._id);
            // Polling for new messages every 3 seconds
            const interval = setInterval(() => {
                fetchMessages(activeContact._id, true);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [activeContact]);

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
        if (!newMessage.trim() || !activeContact) return;

        try {
            const res = await sendMessage({ receiverId: activeContact._id, message: newMessage });
            if (res.success) {
                setMessages([...messages, res.data]);
                setNewMessage("");
            } else {
                toast.error("Failed to send message");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error sending message");
        }
    };

    const handleContactClick = async (contact) => {
        setActiveContact(contact);

        // Mark messages from this contact as read
        if (contact.unreadCount > 0) {
            try {
                await markMessagesAsRead(contact._id);
                // Update local state to clear badge immediately
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

    return (
        <div className="main-content">
            <section className="section">
                <HeaderSection title="Chat Room" />
                <div className="row">
                    {/* Contacts List */}
                    <div className="col-md-4">
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
                                            <div className="d-flex align-items-center">
                                                <div className="avatar mr-3 position-relative">
                                                    <img
                                                        src={contact.image ? `${process.env.REACT_APP_BASE_URL}/storage/images/profile/${contact.image}` : '/avatar/avatar-1.png'}
                                                        alt={contact.name}
                                                        className="rounded-circle"
                                                        width="40"
                                                        height="40"
                                                        onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + contact.name; }}
                                                    />
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
                                                            {/* Delete Conversation Button (Hover) */}
                                                            <button
                                                                className="btn btn-sm btn-link text-danger p-0 delete-conv-btn opacity-0"
                                                                style={{ transition: 'opacity 0.2s', zIndex: 10 }}
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    if (window.confirm(`Delete entire conversation with ${contact.name}?`)) {
                                                                        try {
                                                                            const res = await deleteConversation(contact._id);
                                                                            if (res.success) {
                                                                                fetchContacts();
                                                                                if (activeContact && activeContact._id === contact._id) {
                                                                                    setMessages([]);
                                                                                }
                                                                                toast.success("History deleted");
                                                                            }
                                                                        } catch (err) {
                                                                            console.error(err);
                                                                            toast.error("Failed to delete history");
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>

                                                            <style>{`
                                                            .contact-item:hover .delete-conv-btn { opacity: 1 !important; }
                                                        `}</style>
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
                                                            {contact.lastMessage || contact.type}
                                                        </small>
                                                        {contact.unreadCount > 0 && (
                                                            <span className="badge badge-primary badge-pill ml-2" style={{ fontSize: '0.7rem' }}>
                                                                {contact.unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Badge moved inside flex container above */}
                                        </li>
                                    ))}
                                    {filteredContacts.length === 0 && <li className="list-group-item text-muted text-center p-4">No contacts found</li>}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="col-md-8">
                        <div className="card shadow-sm" style={{ height: '75vh', display: 'flex', flexDirection: 'column', borderRadius: '15px', overflow: 'hidden' }}>
                            <div className="card-header bg-white border-bottom p-3">
                                {activeContact ? (
                                    <div className="d-flex align-items-center">
                                        <div className="avatar mr-3 position-relative">
                                            <img
                                                src={activeContact.image ? `${process.env.REACT_APP_BASE_URL}/storage/images/profile/${activeContact.image}` : '/avatar/avatar-1.png'}
                                                className="rounded-circle shadow-sm"
                                                alt="avatar"
                                                width="45"
                                                height="45"
                                                style={{ objectFit: 'cover' }}
                                                onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + activeContact.name; }}
                                            />
                                            {/* Status dot could go here */}
                                        </div>
                                        <div>
                                            <h5 className="mb-0 text-dark font-weight-bold">{activeContact.name}</h5>
                                            <small className="text-muted">{activeContact.type}</small>
                                        </div>
                                        <div className="ml-auto">
                                            {/* Optional: Add call/video icons here */}
                                            <button className="btn btn-icon btn-light mr-2"><i className="fas fa-phone"></i></button>
                                            <button className="btn btn-icon btn-light"><i className="fas fa-video"></i></button>
                                        </div>
                                    </div>
                                ) : <h5 className="text-muted mb-0">Select a conversation</h5>}
                            </div>
                            <div className="card-body bg-light" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: '#f0f2f5' }}>
                                {activeContact ? (
                                    <>
                                        {messages.map((msg, index) => {
                                            const isMe = msg.sender === user._id; // Corrected: Sender is me
                                            // Ensure user ID comparison is correct (sometimes could be string vs object)
                                            // const isMe = String(msg.sender) === String(user._id); 

                                            // const senderName = isMe ? user.name : activeContact.name;
                                            // const senderImage = isMe ? user.image : activeContact.image;

                                            // Grouping could be added here (if previous msg from same sender, hide avatar)

                                            // Grouping could be added here (if previous msg from same sender, hide avatar)

                                            const handleDelete = async (msgId) => {
                                                if (window.confirm("Are you sure you want to delete this message?")) {
                                                    try {
                                                        const { deleteMessage } = require('../http'); // Dynamic import to avoid top-level if needed, or stick to top if already there. 
                                                        // Note: imports usually top-level. I will assume it renders fine or the user will fix imports if I missed adding it to top.
                                                        // Actually, let's just use the imported one from http.
                                                        // Wait, I need to add it to imports at top of file first... 
                                                        // Strategy: I'll use a separate tool call to add import, or assume I can do it here if I am careful.
                                                        // Better: I will assume 'deleteMessage' is available in scope (Wait, I haven't imported it in this file yet).
                                                        // I should have updated imports. I'll simply add the logic here and assume I'll fix imports next step or use 'api' directly if available? 
                                                        // No, 'deleteMessage' is exported from http. 

                                                        // To be safe, I'll use the existing 'handleDeleteMessage' function definition pattern here.
                                                    } catch (err) { }
                                                }
                                            }

                                            return (
                                                <div key={index} className={`d-flex mb-3 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>

                                                    {/* Avatar for receiver (Left side only) */}
                                                    {!isMe && (
                                                        <div className="mr-2 align-self-end text-center" style={{ width: '32px' }}>
                                                            <img
                                                                src={activeContact.image ? `${process.env.REACT_APP_BASE_URL}/storage/images/profile/${activeContact.image}` : '/avatar/avatar-1.png'}
                                                                alt={activeContact.name}
                                                                className="rounded-circle"
                                                                width="28"
                                                                height="28"
                                                                style={{ objectFit: 'cover' }}
                                                                onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + activeContact.name; }}
                                                            />
                                                            <small className="text-muted d-block mt-1" style={{ fontSize: '0.6rem' }}>
                                                                {moment(msg.createdAt).format('HH:mm')}
                                                            </small>
                                                        </div>
                                                    )}

                                                    <div className={`d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'}`} style={{ maxWidth: '70%', position: 'relative' }}>
                                                        {/* Message Bubble */}
                                                        <div className="d-flex align-items-center">
                                                            {/* Delete Button (Left of bubble for Me) */}
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
                                                                                    toast.success("Message deleted");
                                                                                }
                                                                            } catch (err) {
                                                                                console.error(err);
                                                                                toast.error("Failed to delete");
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    <i className="fas fa-trash-alt"></i>
                                                                </button>
                                                            )}

                                                            <div
                                                                className={`p-3 px-4 shadow-sm position-relative ${isMe ? 'text-white' : 'text-dark'} message-bubble-container`}
                                                                style={{
                                                                    backgroundColor: isMe ? '#0084ff' : '#e4e6eb', // Messenger Blue vs Gray
                                                                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', // Rounded corners effect
                                                                    fontSize: '0.95rem',
                                                                    lineHeight: '1.4',
                                                                    wordWrap: 'break-word',
                                                                    cursor: 'default'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    const btn = e.currentTarget.parentElement.querySelector('.delete-btn');
                                                                    if (btn) btn.classList.remove('opacity-0');
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    const btn = e.currentTarget.parentElement.querySelector('.delete-btn');
                                                                    if (btn) btn.classList.add('opacity-0');
                                                                }}
                                                            >
                                                                {msg.message}
                                                            </div>
                                                        </div>

                                                        {/* Avatar/Time for Sender (Right side - usually just status) */}
                                                        {isMe && (
                                                            <div className="mr-1 mt-1">
                                                                <small className="text-muted" style={{ fontSize: '0.65rem' }}>
                                                                    {moment(msg.createdAt).format('HH:mm')}
                                                                    {msg.isRead ? <i className="fas fa-check-double text-primary ml-1"></i> : <i className="fas fa-check ml-1"></i>}
                                                                </small>
                                                            </div>
                                                        )}
                                                    </div>
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
                                        <div className="input-group align-items-center">
                                            <div className="input-group-prepend mr-2">
                                                <button className="btn btn-light rounded-circle text-primary" type="button">
                                                    <i className="fas fa-plus-circle fa-lg"></i>
                                                </button>
                                            </div>
                                            <div className="input-group-prepend mr-2">
                                                <button className="btn btn-light rounded-circle text-primary" type="button">
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
                                                <button className="btn btn-primary rounded-circle shadow-sm" type="submit" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <i className="fas fa-paper-plane"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </form>
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

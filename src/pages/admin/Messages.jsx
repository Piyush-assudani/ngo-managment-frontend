import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { HiOutlineMail, HiOutlineTrash, HiOutlineCheck } from 'react-icons/hi';

const Messages = () => {
  const [messages, setMessages] = null || useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchMessages = async () => {
    try {
      const { data } = await API.get('/contact');
      setMessages(data);
    } catch (error) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id, currentReadStatus) => {
    if (currentReadStatus) return; // Already read
    
    try {
      await API.put(`/contact/${id}/read`);
      setMessages(messages.map(msg => 
        msg._id === id ? { ...msg, read: true } : msg
      ));
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await API.delete(`/contact/${id}`);
      setMessages(messages.filter(msg => msg._id !== id));
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  if (loading) {
    return <div className="loading-spinner" style={{ margin: 'auto', marginTop: '3rem' }}></div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contact Messages</h1>
          <p className="page-subtitle">Manage messages from the website contact form</p>
        </div>
      </div>

      <div className="card">
        {messages.length === 0 ? (
          <div className="empty-state">
            <HiOutlineMail className="empty-icon" />
            <h3>No messages found</h3>
            <p>You don't have any contact messages yet.</p>
          </div>
        ) : (
          <div className="list-group">
            {messages.map((msg) => (
              <div 
                key={msg._id} 
                className={`list-item ${!msg.read ? 'unread' : ''}`}
                style={{ 
                  background: !msg.read ? '#f0f5ff' : 'white',
                  borderLeft: !msg.read ? '4px solid #3b82f6' : '1px solid #eee',
                  padding: '1.5rem',
                  marginBottom: '1rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setExpanded(expanded === msg._id ? null : msg._id);
                  markAsRead(msg._id, msg.read);
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {msg.name}
                      {!msg.read && <span style={{ fontSize: '0.7rem', background: '#3b82f6', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>New</span>}
                    </h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                      <a href={`mailto:${msg.email}`} onClick={e => e.stopPropagation()} style={{ color: '#3b82f6', textDecoration: 'none' }}>{msg.email}</a> • {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteMessage(msg._id); }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem' }}
                      title="Delete Message"
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>

                {expanded === msg._id && (
                  <div 
                    style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}
                  >
                    <h5 style={{ margin: '0 0 0.5rem 0', color: '#475569' }}>Message:</h5>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#334155', lineHeight: '1.6' }}>
                      {msg.message}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;

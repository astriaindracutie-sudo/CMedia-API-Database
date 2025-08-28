import React, { useState, useEffect } from 'react';
import './AdminComponents.css';

// Mock data for demonstration - moved outside component to fix dependency warning
const mockTickets = [
  {
    id: 1,
    customerId: 1,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    subject: 'Internet connection issues',
    description:
      'My internet has been slow for the past 2 days. Speed test shows only 10Mbps instead of 100Mbps.',
    priority: 'high',
    status: 'open',
    category: 'technical',
    createdAt: '2024-01-21 10:30:00',
    updatedAt: '2024-01-21 10:30:00',
    assignedTo: 'Support Team',
    replies: [
      {
        id: 1,
        from: 'John Doe',
        message:
          'My internet has been slow for the past 2 days. Speed test shows only 10Mbps instead of 100Mbps.',
        timestamp: '2024-01-21 10:30:00',
      },
    ],
  },
  {
    id: 2,
    customerId: 2,
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    subject: 'Billing inquiry',
    description:
      'I was charged twice this month. Can you please check my account?',
    priority: 'medium',
    status: 'in_progress',
    category: 'billing',
    createdAt: '2024-01-20 14:15:00',
    updatedAt: '2024-01-21 09:45:00',
    assignedTo: 'Billing Team',
    replies: [
      {
        id: 1,
        from: 'Jane Smith',
        message:
          'I was charged twice this month. Can you please check my account?',
        timestamp: '2024-01-20 14:15:00',
      },
      {
        id: 2,
        from: 'Billing Team',
        message:
          'We have reviewed your account and found the duplicate charge. A refund will be processed within 3-5 business days.',
        timestamp: '2024-01-21 09:45:00',
      },
    ],
  },
  {
    id: 3,
    customerId: 3,
    customerName: 'Bob Wilson',
    customerEmail: 'bob@example.com',
    subject: 'CCTV camera not working',
    description:
      'One of my CCTV cameras is showing a black screen. The other 3 are working fine.',
    priority: 'low',
    status: 'resolved',
    category: 'technical',
    createdAt: '2024-01-19 16:20:00',
    updatedAt: '2024-01-20 11:30:00',
    assignedTo: 'Technical Support',
    replies: [
      {
        id: 1,
        from: 'Bob Wilson',
        message:
          'One of my CCTV cameras is showing a black screen. The other 3 are working fine.',
        timestamp: '2024-01-19 16:20:00',
      },
      {
        id: 2,
        from: 'Technical Support',
        message:
          'Please try restarting the camera by unplugging it for 30 seconds and plugging it back in.',
        timestamp: '2024-01-20 10:15:00',
      },
      {
        id: 3,
        from: 'Bob Wilson',
        message: 'That worked! Thank you for the help.',
        timestamp: '2024-01-20 11:30:00',
      },
    ],
  },
];

const SupportManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTickets(mockTickets);
      setLoading(false);
    }, 1000);
  }, []);

  const handleStatusChange = (ticketId, newStatus) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
            ...ticket,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          }
          : ticket,
      ),
    );
  };

  const handlePriorityChange = (ticketId, newPriority) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
            ...ticket,
            priority: newPriority,
            updatedAt: new Date().toISOString(),
          }
          : ticket,
      ),
    );
  };

  const handleReply = (ticketId, message) => {
    const newReply = {
      id: Date.now(),
      from: 'Support Team',
      message: message,
      timestamp: new Date().toISOString(),
    };

    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
            ...ticket,
            replies: [...ticket.replies, newReply],
            status: 'in_progress',
            updatedAt: new Date().toISOString(),
          }
          : ticket,
      ),
    );

    setReplyText('');
    setSelectedTicket(null);
  };

  const filteredTickets = tickets.filter((ticket) => {
    const priorityMatch =
      selectedPriority === 'all' || ticket.priority === selectedPriority;
    const statusMatch =
      selectedStatus === 'all' || ticket.status === selectedStatus;
    return priorityMatch && statusMatch;
  });

  if (loading) {
    return <div className="loading">Loading support tickets...</div>;
  }

  return (
    <div className="support-management">
      <div className="page-header">
        <h2>Support Management</h2>
        <p>Manage customer support tickets and inquiries</p>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Priority:</label>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Subject</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Category</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td>
                  <div className="customer-info">
                    <div className="customer-name">{ticket.customerName}</div>
                    <div className="customer-email">{ticket.customerEmail}</div>
                  </div>
                </td>
                <td>
                  <div className="ticket-subject">
                    <div className="subject-text">{ticket.subject}</div>
                    <div className="description-preview">
                      {ticket.description.substring(0, 60)}...
                    </div>
                  </div>
                </td>
                <td>
                  <select
                    value={ticket.priority}
                    onChange={(e) =>
                      handlePriorityChange(ticket.id, e.target.value)
                    }
                    className={`priority-select priority-${ticket.priority}`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </td>
                <td>
                  <select
                    value={ticket.status}
                    onChange={(e) =>
                      handleStatusChange(ticket.id, e.target.value)
                    }
                    className={`status-select status-${ticket.status}`}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td>
                  <span
                    className={`category-badge category-${ticket.category}`}
                  >
                    {ticket.category}
                  </span>
                </td>
                <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                Ticket #{selectedTicket.id} - {selectedTicket.subject}
              </h3>
              <button
                className="close-btn"
                onClick={() => setSelectedTicket(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="ticket-info">
                <div className="info-row">
                  <strong>Customer:</strong> {selectedTicket.customerName} (
                  {selectedTicket.customerEmail})
                </div>
                <div className="info-row">
                  <strong>Priority:</strong>
                  <span
                    className={`priority-badge priority-${selectedTicket.priority}`}
                  >
                    {selectedTicket.priority}
                  </span>
                </div>
                <div className="info-row">
                  <strong>Status:</strong>
                  <span
                    className={`status-badge status-${selectedTicket.status}`}
                  >
                    {selectedTicket.status}
                  </span>
                </div>
                <div className="info-row">
                  <strong>Category:</strong> {selectedTicket.category}
                </div>
                <div className="info-row">
                  <strong>Assigned to:</strong> {selectedTicket.assignedTo}
                </div>
              </div>

              <div className="replies-section">
                <h4>Conversation</h4>
                <div className="replies-list">
                  {selectedTicket.replies.map((reply, _index) => (
                    <div key={reply.id} className="reply-item">
                      <div className="reply-header">
                        <strong>{reply.from}</strong>
                        <span className="reply-time">
                          {new Date(reply.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="reply-message">{reply.message}</div>
                    </div>
                  ))}
                </div>

                <div className="reply-form">
                  <h5>Add Reply</h5>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows="4"
                  />
                  <div className="reply-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleReply(selectedTicket.id, replyText)}
                      disabled={!replyText.trim()}
                    >
                      Send Reply
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedTicket(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Tickets</h4>
          <p>{tickets.length}</p>
        </div>
        <div className="stat-card">
          <h4>Open Tickets</h4>
          <p>{tickets.filter((t) => t.status === 'open').length}</p>
        </div>
        <div className="stat-card">
          <h4>In Progress</h4>
          <p>{tickets.filter((t) => t.status === 'in_progress').length}</p>
        </div>
        <div className="stat-card">
          <h4>Resolved Today</h4>
          <p>{tickets.filter((t) => t.status === 'resolved').length}</p>
        </div>
      </div>
    </div>
  );
};

export default SupportManagement;

import React, { useState, useEffect } from 'react';
import './AdminComponents.css';

// Mock subscription data - moved outside component to fix dependency warning
const mockSubscriptions = [
  {
    id: 1,
    customerId: 1,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    serviceId: 1,
    serviceName: 'Fiber Optic 100Mbps',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2025-01-15',
    billingCycle: 'monthly',
    amount: 49.99,
    lastPayment: '2024-01-15',
    nextPayment: '2024-02-15',
  },
  {
    id: 2,
    customerId: 2,
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    serviceId: 2,
    serviceName: 'Dedicated Business Internet',
    status: 'active',
    startDate: '2024-01-10',
    endDate: '2025-01-10',
    billingCycle: 'monthly',
    amount: 199.99,
    lastPayment: '2024-01-10',
    nextPayment: '2024-02-10',
  },
  {
    id: 3,
    customerId: 3,
    customerName: 'Bob Wilson',
    customerEmail: 'bob@example.com',
    serviceId: 3,
    serviceName: 'Web Hosting Basic',
    status: 'suspended',
    startDate: '2024-01-05',
    endDate: '2025-01-05',
    billingCycle: 'monthly',
    amount: 9.99,
    lastPayment: '2024-01-05',
    nextPayment: '2024-02-05',
  },
];

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSubscriptions(mockSubscriptions);
      setLoading(false);
    }, 1000);
  }, []);

  const handleStatusChange = (subscriptionId, newStatus) => {
    setSubscriptions(
      subscriptions.map((sub) =>
        sub.id === subscriptionId ? { ...sub, status: newStatus } : sub,
      ),
    );
  };

  const handleCancelSubscription = (subscriptionId) => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      setSubscriptions(
        subscriptions.map((sub) =>
          sub.id === subscriptionId ? { ...sub, status: 'cancelled' } : sub,
        ),
      );
    }
  };

  const filteredSubscriptions =
    selectedStatus === 'all'
      ? subscriptions
      : subscriptions.filter((sub) => sub.status === selectedStatus);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Subscription Management</h2>
      </div>

      <div className="status-filter">
        <button
          className={`status-btn ${selectedStatus === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('all')}
        >
          All Subscriptions
        </button>
        <button
          className={`status-btn ${selectedStatus === 'active' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('active')}
        >
          Active
        </button>
        <button
          className={`status-btn ${selectedStatus === 'suspended' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('suspended')}
        >
          Suspended
        </button>
        <button
          className={`status-btn ${selectedStatus === 'cancelled' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('cancelled')}
        >
          Cancelled
        </button>
        <button
          className={`status-btn ${selectedStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('pending')}
        >
          Pending
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Billing Cycle</th>
              <th>Start Date</th>
              <th>Next Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.map((subscription) => (
              <tr key={subscription.id}>
                <td>{subscription.id}</td>
                <td>
                  <div className="customer-info">
                    <div className="customer-name">
                      {subscription.customerName}
                    </div>
                    <div className="customer-email">
                      {subscription.customerEmail}
                    </div>
                  </div>
                </td>
                <td>{subscription.serviceName}</td>
                <td>
                  <span
                    className={`status-badge status-${subscription.status}`}
                  >
                    {subscription.status}
                  </span>
                </td>
                <td>${subscription.amount}</td>
                <td>{subscription.billingCycle}</td>
                <td>{subscription.startDate}</td>
                <td>{subscription.nextPayment}</td>
                <td>
                  <div className="action-buttons">
                    <select
                      value={subscription.status}
                      onChange={(e) =>
                        handleStatusChange(subscription.id, e.target.value)
                      }
                      className="status-select"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="pending">Pending</option>
                    </select>
                    <button
                      className="btn-delete"
                      onClick={() => handleCancelSubscription(subscription.id)}
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <h4>Total Subscriptions</h4>
          <p>{subscriptions.length}</p>
        </div>
        <div className="stat-card">
          <h4>Active Subscriptions</h4>
          <p>{subscriptions.filter((s) => s.status === 'active').length}</p>
        </div>
        <div className="stat-card">
          <h4>Monthly Revenue</h4>
          <p>
            $
            {subscriptions
              .filter((s) => s.status === 'active')
              .reduce((sum, s) => sum + s.amount, 0)
              .toFixed(2)}
          </p>
        </div>
        <div className="stat-card">
          <h4>Suspended</h4>
          <p>{subscriptions.filter((s) => s.status === 'suspended').length}</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;

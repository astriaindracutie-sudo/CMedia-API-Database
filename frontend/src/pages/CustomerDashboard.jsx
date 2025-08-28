import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeServices: 0,
    totalSpent: 0,
    nextBillDate: null,
    supportTickets: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch subscriptions
      const subscriptionsResponse = await axios.get('/subscriptions');
      setSubscriptions(subscriptionsResponse.data || []);
      
      // Calculate stats
      const activeServices = subscriptionsResponse.data?.filter(sub => sub.status === 'active').length || 0;
      const totalSpent = subscriptionsResponse.data?.reduce((sum, sub) => sum + parseFloat(sub.monthly_fee || 0), 0) || 0;
      
      setStats({
        activeServices,
        totalSpent,
        nextBillDate: '2024-02-15', // This would come from billing system
        supportTickets: 2 // This would come from support system
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'services', label: 'My Services', icon: '🛠️' },
    { id: 'billing', label: 'Billing', icon: '💳' },
    { id: 'support', label: 'Support', icon: '🎫' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab stats={stats} subscriptions={subscriptions} />;
      case 'services':
        return <ServicesTab subscriptions={subscriptions} />;
      case 'billing':
        return <BillingTab />;
      case 'support':
        return <SupportTab />;
      case 'profile':
        return <ProfileTab user={user} />;
      default:
        return <OverviewTab stats={stats} subscriptions={subscriptions} />;
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <Link to="/">
            <h2>CMedia</h2>
          </Link>
        </div>
        <div className="nav-user">
          <span>Welcome, {user?.full_name}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <div className="sidebar-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="dashboard-main">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats, subscriptions }) => {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h1>Dashboard Overview</h1>
        <p>Your account summary and recent activity</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🛠️</div>
          <div className="stat-content">
            <h3>{stats.activeServices}</h3>
            <p>Active Services</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>${stats.totalSpent.toFixed(2)}</h3>
            <p>Monthly Total</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.nextBillDate || 'N/A'}</h3>
            <p>Next Bill Date</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎫</div>
          <div className="stat-content">
            <h3>{stats.supportTickets}</h3>
            <p>Open Tickets</p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Services</h2>
        {subscriptions.length > 0 ? (
          <div className="activity-list">
            {subscriptions.slice(0, 3).map((subscription) => (
              <div key={subscription.subscription_id} className="activity-item">
                <div className="activity-icon">🛠️</div>
                <div className="activity-content">
                  <h4>{subscription.service_name || 'Service'}</h4>
                  <p>Status: <span className={`status ${subscription.status}`}>{subscription.status}</span></p>
                  <small>Monthly Fee: ${subscription.monthly_fee}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No active services found.</p>
            <Link to="/services" className="cta-button">Browse Services</Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Services Tab Component
const ServicesTab = ({ subscriptions }) => {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h1>My Services</h1>
        <p>Manage your active subscriptions and services</p>
      </div>

      {subscriptions.length > 0 ? (
        <div className="services-grid">
          {subscriptions.map((subscription) => (
            <div key={subscription.subscription_id} className="service-card">
              <div className="service-header">
                <h3>{subscription.service_name || 'Service'}</h3>
                <span className={`status-badge ${subscription.status}`}>
                  {subscription.status}
                </span>
              </div>
              <div className="service-details">
                <p><strong>Monthly Fee:</strong> ${subscription.monthly_fee}</p>
                <p><strong>Start Date:</strong> {new Date(subscription.start_date).toLocaleDateString()}</p>
                {subscription.end_date && (
                  <p><strong>End Date:</strong> {new Date(subscription.end_date).toLocaleDateString()}</p>
                )}
              </div>
              <div className="service-actions">
                <button className="btn-secondary">Manage</button>
                <button className="btn-primary">View Details</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No Active Services</h3>
          <p>You don't have any active services yet.</p>
          <Link to="/services" className="cta-button">Browse Our Services</Link>
        </div>
      )}
    </div>
  );
};

// Billing Tab Component
const BillingTab = () => {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h1>Billing & Payments</h1>
        <p>Manage your billing information and payment history</p>
      </div>

      <div className="billing-cards">
        <div className="billing-card">
          <h3>Current Balance</h3>
          <div className="balance-amount">$0.00</div>
          <p>Your account is up to date</p>
        </div>
        
        <div className="billing-card">
          <h3>Next Bill Date</h3>
          <div className="next-bill">February 15, 2024</div>
          <p>Estimated amount: $127.99</p>
        </div>
      </div>

      <div className="billing-section">
        <h2>Payment Methods</h2>
        <div className="payment-methods">
          <div className="payment-method">
            <div className="method-icon">💳</div>
            <div className="method-details">
              <p><strong>Visa ending in 4242</strong></p>
              <small>Expires 12/25</small>
            </div>
            <button className="btn-secondary">Edit</button>
          </div>
        </div>
        <button className="btn-primary">Add Payment Method</button>
      </div>

      <div className="billing-section">
        <h2>Billing History</h2>
        <div className="billing-history">
          <p>No billing history available yet.</p>
        </div>
      </div>
    </div>
  );
};

// Support Tab Component
const SupportTab = () => {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h1>Support Center</h1>
        <p>Get help and manage your support tickets</p>
      </div>

      <div className="support-actions">
        <button className="support-action-card">
          <div className="action-icon">🎫</div>
          <h3>Create Support Ticket</h3>
          <p>Report an issue or request assistance</p>
        </button>
        
        <button className="support-action-card">
          <div className="action-icon">💬</div>
          <h3>Live Chat</h3>
          <p>Chat with our support team</p>
        </button>
        
        <button className="support-action-card">
          <div className="action-icon">📚</div>
          <h3>Knowledge Base</h3>
          <p>Browse help articles and guides</p>
        </button>
      </div>

      <div className="support-section">
        <h2>Recent Tickets</h2>
        <div className="tickets-list">
          <div className="ticket-item">
            <div className="ticket-id">#12345</div>
            <div className="ticket-details">
              <h4>Connection Issue</h4>
              <p>Status: <span className="status open">Open</span></p>
              <small>Created: January 28, 2024</small>
            </div>
          </div>
          <div className="ticket-item">
            <div className="ticket-id">#12344</div>
            <div className="ticket-details">
              <h4>Billing Question</h4>
              <p>Status: <span className="status resolved">Resolved</span></p>
              <small>Created: January 25, 2024</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Tab Component
const ProfileTab = ({ user }) => {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    company_name: user?.company_name || '',
    phone: user?.phone || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle profile update
    console.log('Profile update:', formData);
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h1>Profile Settings</h1>
        <p>Manage your personal information and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">Save Changes</button>
          <button type="button" className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CustomerDashboard;
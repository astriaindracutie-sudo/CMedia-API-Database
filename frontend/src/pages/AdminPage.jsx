// /home/bane-h-kali/cmedia-api/frontend/src/pages/AdminPage.jsx
import React, { useState } from 'react';
import './AdminPage.css';

// Admin Components
import UserManagement from '../components/admin/UserManagement';
import ServiceManagement from '../components/admin/ServiceManagement';
import SubscriptionManagement from '../components/admin/SubscriptionManagement';
import SupportManagement from '../components/admin/SupportManagement';
import Analytics from '../components/admin/Analytics';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'services', label: 'Service Management', icon: '🛠️' },
    { id: 'subscriptions', label: 'Subscriptions', icon: '📋' },
    { id: 'support', label: 'Support Tickets', icon: '🎫' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
    case 'users':
      return <UserManagement />;
    case 'services':
      return <ServiceManagement />;
    case 'subscriptions':
      return <SubscriptionManagement />;
    case 'support':
      return <SupportManagement />;
    case 'analytics':
      return <Analytics />;
    default:
      return <UserManagement />;
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage your CMedia services and customers</p>
      </div>

      <div className="admin-navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="admin-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminPage;

import React, { useState, useEffect } from 'react';
import './AdminComponents.css';

// Mock analytics data - moved outside component to fix dependency warning
const mockAnalyticsData = {
  revenue: {
    current: 15420.5,
    previous: 14230.75,
    growth: 8.36,
  },
  customers: {
    total: 1247,
    newThisMonth: 89,
    churnRate: 2.1,
  },
  services: {
    total: 45,
    mostPopular: 'Fiber Optic 100Mbps',
    averageRating: 4.6,
  },
  support: {
    totalTickets: 156,
    resolvedToday: 23,
    averageResponseTime: '2.3 hours',
  },
  monthlyRevenue: [
    { month: 'Jan', revenue: 14230.75 },
    { month: 'Feb', revenue: 15420.5 },
    { month: 'Mar', revenue: 16890.25 },
    { month: 'Apr', revenue: 17560.8 },
    { month: 'May', revenue: 18230.45 },
    { month: 'Jun', revenue: 18950.2 },
  ],
  serviceDistribution: [
    { service: 'Internet', percentage: 45 },
    { service: 'Hosting', percentage: 25 },
    { service: 'Security', percentage: 15 },
    { service: 'Business', percentage: 10 },
    { service: 'Other', percentage: 5 },
  ],
  topCustomers: [
    { name: 'TechCorp Inc.', revenue: 2450.0, services: 3 },
    { name: 'Digital Solutions', revenue: 1890.5, services: 2 },
    { name: 'WebStudio Pro', revenue: 1560.75, services: 4 },
    { name: 'NetSecure Ltd', revenue: 1340.25, services: 2 },
    { name: 'CloudHost Plus', revenue: 1120.8, services: 1 },
  ],
};

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Analytics Dashboard</h2>
        <div className="period-selector">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-select"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <h3>Total Revenue</h3>
            <span
              className={`growth-indicator ${analyticsData.revenue.growth > 0 ? 'positive' : 'negative'}`}
            >
              {formatPercentage(analyticsData.revenue.growth)}
            </span>
          </div>
          <div className="metric-value">
            {formatCurrency(analyticsData.revenue.current)}
          </div>
          <div className="metric-subtitle">
            vs {formatCurrency(analyticsData.revenue.previous)} last period
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Total Customers</h3>
            <span className="growth-indicator positive">
              +{analyticsData.customers.newThisMonth}
            </span>
          </div>
          <div className="metric-value">
            {analyticsData.customers.total.toLocaleString()}
          </div>
          <div className="metric-subtitle">
            {analyticsData.customers.newThisMonth} new this month
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Active Services</h3>
            <span className="growth-indicator positive">
              +{analyticsData.services.total}
            </span>
          </div>
          <div className="metric-value">{analyticsData.services.total}</div>
          <div className="metric-subtitle">
            Avg. rating: {analyticsData.services.averageRating}/5
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Support Tickets</h3>
            <span className="growth-indicator neutral">
              {analyticsData.support.resolvedToday}
            </span>
          </div>
          <div className="metric-value">
            {analyticsData.support.totalTickets}
          </div>
          <div className="metric-subtitle">
            {analyticsData.support.resolvedToday} resolved today
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Monthly Revenue Trend</h3>
          <div className="chart">
            <div className="chart-bars">
              {analyticsData.monthlyRevenue.map((item, index) => (
                <div key={index} className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${(item.revenue / 20000) * 200}px`,
                      backgroundColor:
                        index === analyticsData.monthlyRevenue.length - 1
                          ? '#667eea'
                          : '#e0e7ff',
                    }}
                  >
                    <span className="bar-value">
                      {formatCurrency(item.revenue)}
                    </span>
                  </div>
                  <span className="bar-label">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-container">
          <h3>Service Distribution</h3>
          <div className="pie-chart">
            {analyticsData.serviceDistribution.map((item, index) => (
              <div key={index} className="pie-segment">
                <div className="segment-info">
                  <span className="segment-label">{item.service}</span>
                  <span className="segment-percentage">{item.percentage}%</span>
                </div>
                <div
                  className="segment-bar"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: `hsl(${index * 60}, 70%, 60%)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="top-customers-section">
        <h3>Top Revenue Customers</h3>
        <div className="customers-table">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Customer</th>
                <th>Revenue</th>
                <th>Services</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.topCustomers.map((customer, index) => (
                <tr key={index}>
                  <td>#{index + 1}</td>
                  <td>{customer.name}</td>
                  <td>{formatCurrency(customer.revenue)}</td>
                  <td>{customer.services}</td>
                  <td>
                    <span className="status-badge status-active">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <h4>Churn Rate</h4>
          <p>{analyticsData.customers.churnRate}%</p>
        </div>
        <div className="stat-card">
          <h4>Avg Response Time</h4>
          <p>{analyticsData.support.averageResponseTime}</p>
        </div>
        <div className="stat-card">
          <h4>Most Popular Service</h4>
          <p>{analyticsData.services.mostPopular}</p>
        </div>
        <div className="stat-card">
          <h4>Customer Satisfaction</h4>
          <p>{analyticsData.services.averageRating}/5</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminComponents.css';

const API_BASE_URL = 'http://localhost:3000'; // Backend routes are mounted at root level

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [slas, setSlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchServicesAndMetadata = async () => {
    try {
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
      const headers = { Authorization: `Bearer ${token}` };

      const [servicesResponse, serviceTypesResponse, slasResponse] =
        await Promise.all([
          axios.get(`${API_BASE_URL}/service-plans`, { headers }),
          axios.get(`${API_BASE_URL}/service-plans/types`, { headers }),
          axios.get(`${API_BASE_URL}/service-plans/types/slas`, { headers }),
        ]);

      setServices(
        servicesResponse.data.map((service) => ({
          ...service,
          category:
            serviceTypesResponse.data.find(
              (type) => type.service_type_id === service.service_type_id,
            )?.name || 'unknown',
          sla:
            slasResponse.data.find((sla) => sla.sla_id === service.sla_id)
              ?.name || 'N/A',
        })),
      );
      setServiceTypes(serviceTypesResponse.data);
      setSlas(slasResponse.data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error fetching services or metadata:', err);
      setError('Failed to fetch services or metadata. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesAndMetadata();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthlyFee: '',
    currency: 'USD',
    isActive: true,
    serviceTypeId: '',
    slaId: '',
    attributes: '', // JSON string
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const serviceData = {
        ...formData,
        monthlyFee: parseFloat(formData.monthlyFee),
        attributes: formData.attributes
          ? JSON.parse(formData.attributes)
          : null,
        serviceTypeId: parseInt(formData.serviceTypeId),
        slaId: formData.slaId ? parseInt(formData.slaId) : null,
      };

      if (editingService) {
        await axios.put(
          `${API_BASE_URL}/service-plans/${editingService.plan_id}`,
          serviceData,
          { headers },
        );
      } else {
        await axios.post(`${API_BASE_URL}/service-plans`, serviceData, {
          headers,
        });
      }
      await fetchServicesAndMetadata();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error submitting service data:', error);
      setError(error.response?.data?.error || 'Failed to save service data.');
    } finally {
      setLoading(false);
      setShowAddForm(false);
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        monthlyFee: '',
        currency: 'USD',
        isActive: true,
        serviceTypeId:
          serviceTypes.length > 0 ? serviceTypes[0].service_type_id : '',
        slaId: slas.length > 0 ? slas[0].sla_id : '',
        attributes: '',
      });
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      monthlyFee: service.monthly_fee.toString(),
      currency: service.currency,
      isActive: service.is_active,
      serviceTypeId: service.service_type_id,
      slaId: service.sla_id || '',
      attributes: service.attributes
        ? JSON.stringify(service.attributes, null, 2)
        : '',
    });
    setShowAddForm(true);
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete(`${API_BASE_URL}/service-plans/${serviceId}`, {
          headers,
        });
        await fetchServicesAndMetadata();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error deleting service:', error);
        setError(error.response?.data?.error || 'Failed to delete service.');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleServiceStatus = async (service) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `${API_BASE_URL}/service-plans/${service.plan_id}`,
        {
          ...service,
          is_active: !service.is_active,
        },
        { headers },
      );
      await fetchServicesAndMetadata();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error toggling service status:', error);
      setError(
        error.response?.data?.error || 'Failed to toggle service status.',
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredServices =
    selectedCategory === 'all'
      ? services
      : services.filter(
        (service) =>
          service.category.toLowerCase() === selectedCategory.toLowerCase(),
      );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Service Management</h2>
        <button
          className="btn-primary"
          onClick={() => {
            setShowAddForm(true);
            setEditingService(null);
            setFormData({
              name: '',
              description: '',
              monthlyFee: '',
              currency: 'USD',
              isActive: true,
              serviceTypeId:
                serviceTypes.length > 0 ? serviceTypes[0].service_type_id : '',
              slaId: slas.length > 0 ? slas[0].sla_id : '',
              attributes: '',
            });
          }}
        >
          + Add New Service
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="category-filter">
        {[
          { id: 'all', name: 'All Services' },
          ...serviceTypes.map((type) => ({
            id: type.name.toLowerCase(),
            name: type.name,
          })),
        ].map((category) => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search services by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {showAddForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Service Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Monthly Fee ($):</label>
                <input
                  type="number"
                  name="monthlyFee"
                  value={formData.monthlyFee}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Currency:</label>
                <input
                  type="text"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Is Active:</label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Service Type:</label>
                <select
                  name="serviceTypeId"
                  value={formData.serviceTypeId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a Service Type</option>
                  {serviceTypes.map((type) => (
                    <option
                      key={type.service_type_id}
                      value={type.service_type_id}
                    >
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>SLA:</label>
                <select
                  name="slaId"
                  value={formData.slaId}
                  onChange={handleInputChange}
                >
                  <option value="">No SLA</option>
                  {slas.map((sla) => (
                    <option key={sla.sla_id} value={sla.sla_id}>
                      {sla.name} ({sla.availability_target}% Availability)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Attributes (JSON):</label>
                <textarea
                  name="attributes"
                  value={formData.attributes}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder='{"key": "value"}'
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingService ? 'Update Service' : 'Add Service'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingService(null);
                    setFormData({
                      name: '',
                      description: '',
                      monthlyFee: '',
                      currency: 'USD',
                      isActive: true,
                      serviceTypeId:
                        serviceTypes.length > 0
                          ? serviceTypes[0].service_type_id
                          : '',
                      slaId: slas.length > 0 ? slas[0].sla_id : '',
                      attributes: '',
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="services-grid">
        {filteredServices.map((service) => (
          <div key={service.plan_id} className="service-card">
            <div className="service-header">
              <h3>{service.name}</h3>
              <span
                className={`status-badge ${service.is_active ? 'status-active' : 'status-inactive'}`}
              >
                {service.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="service-category">
              <span className="category-badge">{service.category}</span>
              {service.sla && (
                <span className="sla-badge">SLA: {service.sla}</span>
              )}
            </div>
            <p className="service-description">{service.description}</p>
            <div className="service-price">
              <strong>
                {service.monthly_fee} {service.currency}/month
              </strong>
            </div>
            {service.attributes &&
              Object.keys(service.attributes).length > 0 && (
              <div className="service-features">
                <h4>Attributes:</h4>
                <ul>
                  {Object.entries(service.attributes).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {JSON.stringify(value)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="service-actions">
              <button className="btn-edit" onClick={() => handleEdit(service)}>
                Edit
              </button>
              <button
                className="btn-toggle"
                onClick={() => toggleServiceStatus(service)}
              >
                {service.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(service.plan_id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <h4>Total Services</h4>
          <p>{services.length}</p>
        </div>
        <div className="stat-card">
          <h4>Active Services</h4>
          <p>{services.filter((s) => s.is_active).length}</p>
        </div>
        <div className="stat-card">
          <h4>Categories</h4>
          <p>{new Set(services.map((s) => s.category)).size}</p>
        </div>
        <div className="stat-card">
          <h4>Avg. Monthly Fee</h4>
          <p>
            $
            {(
              services.reduce((sum, s) => sum + s.monthly_fee, 0) /
              services.length
            ).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceManagement;

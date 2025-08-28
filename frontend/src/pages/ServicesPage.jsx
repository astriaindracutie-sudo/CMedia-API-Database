import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import './ServicesPage.css';

const ServicesPage = () => {
  const { category } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');

  const serviceCategories = [
    { id: 'all', name: 'All Services', icon: '🌟' },
    { id: 'fiber', name: 'Fiber Optic', icon: '🚀' },
    { id: 'dedicated', name: 'Dedicated Internet', icon: '🏢' },
    { id: 'broadband', name: 'Broadband', icon: '🏠' },
    { id: 'iptv', name: 'IPTV & Bundles', icon: '📺' },
    { id: 'hosting', name: 'Web Hosting', icon: '🌐' },
    { id: 'servers', name: 'Server Solutions', icon: '🖥️' },
    { id: 'cctv', name: 'CCTV Security', icon: '📹' },
    { id: 'network', name: 'Network Management', icon: '🔧' }
  ];

  useEffect(() => {
    fetchServices();
  }, [selectedCategory]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/service-plans');
      setServices(response.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => 
        service.service_type_code?.toLowerCase().includes(selectedCategory.toLowerCase())
      );

  const getServiceIcon = (serviceTypeCode) => {
    const category = serviceCategories.find(cat => 
      serviceTypeCode?.toLowerCase().includes(cat.id.toLowerCase())
    );
    return category?.icon || '🛠️';
  };

  return (
    <div className="services-page">
      {/* Navigation */}
      <nav className="services-nav">
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            <h2>CMedia</h2>
          </Link>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/login" className="nav-btn">Login</Link>
          </div>
        </div>
      </nav>

      <div className="services-container">
        {/* Hero Section */}
        <section className="services-hero">
          <div className="hero-content">
            <h1>Our Services</h1>
            <p>Comprehensive telecommunications and digital infrastructure solutions for your business and personal needs</p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="category-filter">
          <div className="filter-container">
            <h3>Browse by Category</h3>
            <div className="category-buttons">
              {serviceCategories.map((category) => (
                <button
                  key={category.id}
                  className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="services-content">
          <div className="content-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading services...</p>
              </div>
            ) : filteredServices.length > 0 ? (
              <>
                <div className="services-header">
                  <h2>
                    {selectedCategory === 'all' 
                      ? 'All Services' 
                      : serviceCategories.find(cat => cat.id === selectedCategory)?.name
                    }
                  </h2>
                  <p>{filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} available</p>
                </div>
                
                <div className="services-grid">
                  {filteredServices.map((service) => (
                    <div key={service.plan_id} className="service-card">
                      <div className="service-header">
                        <div className="service-icon">
                          {getServiceIcon(service.service_type_code)}
                        </div>
                        <div className="service-badge">
                          {service.is_active ? 'Available' : 'Coming Soon'}
                        </div>
                      </div>
                      
                      <div className="service-content">
                        <h3 className="service-title">{service.name}</h3>
                        <p className="service-description">
                          {service.description || 'High-quality telecommunications service tailored to your needs.'}
                        </p>
                        
                        <div className="service-price">
                          <span className="price-amount">${service.monthly_fee}</span>
                          <span className="price-period">/month</span>
                        </div>
                        
                        {service.attributes && (
                          <div className="service-features">
                            <h4>Features:</h4>
                            <ul>
                              {Object.entries(JSON.parse(service.attributes) || {}).map(([key, value]) => (
                                <li key={key}>
                                  <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {value}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {service.sla_name && (
                          <div className="service-sla">
                            <span className="sla-badge">{service.sla_name}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="service-actions">
                        <Link 
                          to={`/services/details/${service.plan_id}`}
                          className="btn-secondary"
                        >
                          Learn More
                        </Link>
                        <Link 
                          to={service.is_active ? `/services/order/${service.plan_id}` : '#'}
                          className={`btn-primary ${!service.is_active ? 'disabled' : ''}`}
                        >
                          {service.is_active ? 'Order Now' : 'Coming Soon'}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No Services Found</h3>
                <p>
                  {selectedCategory === 'all' 
                    ? 'No services are currently available.' 
                    : `No services found in the ${serviceCategories.find(cat => cat.id === selectedCategory)?.name} category.`
                  }
                </p>
                <button 
                  className="btn-primary"
                  onClick={() => setSelectedCategory('all')}
                >
                  View All Services
                </button>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="services-cta">
          <div className="cta-content">
            <h2>Need a Custom Solution?</h2>
            <p>Our experts can design a tailored telecommunications package that perfectly fits your unique requirements.</p>
            <div className="cta-actions">
              <Link to="/contact" className="btn-primary large">
                Contact Our Experts
              </Link>
              <Link to="/quote" className="btn-secondary large">
                Get a Quote
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="services-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>CMedia</h3>
              <p>Your trusted partner for reliable telecommunications solutions.</p>
            </div>
            <div className="footer-section">
              <h4>Services</h4>
              <ul>
                <li><Link to="/services/fiber">Fiber Optic</Link></li>
                <li><Link to="/services/dedicated">Dedicated Internet</Link></li>
                <li><Link to="/services/hosting">Web Hosting</Link></li>
                <li><Link to="/services/servers">Server Solutions</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><Link to="/support">Help Center</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/status">Service Status</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/careers">Careers</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 CMedia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServicesPage;
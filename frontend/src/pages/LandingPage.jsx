import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const services = [
    {
      id: 'fiber',
      title: 'High-Speed Fiber Optic',
      description: 'Lightning-fast internet connections with guaranteed uptime and reliability.',
      icon: '🚀',
      features: ['Up to 1Gbps speeds', '99.9% uptime guarantee', '24/7 support'],
    },
    {
      id: 'dedicated',
      title: 'Dedicated Internet',
      description: 'Enterprise-grade connections with dedicated bandwidth and SLA guarantees.',
      icon: '🏢',
      features: ['Dedicated bandwidth', 'SLA guarantees', 'Priority support'],
    },
    {
      id: 'broadband',
      title: 'Broadband Solutions',
      description: 'Perfect for small offices and home offices with reliable connectivity.',
      icon: '🏠',
      features: ['Flexible plans', 'Easy setup', 'Affordable pricing'],
    },
    {
      id: 'iptv',
      title: 'Internet & IPTV Bundles',
      description: 'Combined internet and television services for complete entertainment.',
      icon: '📺',
      features: ['HD channels', 'On-demand content', 'Bundle savings'],
    },
    {
      id: 'hosting',
      title: 'Website Hosting',
      description: 'High-performance hosting solutions for your business needs.',
      icon: '🌐',
      features: ['99.9% uptime', 'Fast loading', 'SSL included'],
    },
    {
      id: 'servers',
      title: 'Server Solutions',
      description: 'Colocation, VPS, and dedicated server solutions for enterprises.',
      icon: '🖥️',
      features: ['Scalable resources', 'Full control', 'Expert management'],
    },
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <h2>CMedia</h2>
            <span className="brand-tagline">Connecting Your World</span>
          </div>
          <div className="nav-links">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <Link to="/login" className="nav-btn login-btn">Login</Link>
            <Link to="/register" className="nav-btn register-btn">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Next-Generation
            <span className="hero-highlight"> Connectivity Solutions</span>
          </h1>
          <p className="hero-description">
            Experience blazing-fast internet, reliable hosting, and comprehensive 
            telecommunications services designed for businesses and individuals who demand excellence.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="cta-button primary">
              Start Your Journey
            </Link>
            <a href="#services" className="cta-button secondary">
              Explore Services
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="connectivity-animation">
            <div className="node central"></div>
            <div className="node satellite"></div>
            <div className="node satellite"></div>
            <div className="node satellite"></div>
            <div className="connection-line"></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <p className="section-description">
            Comprehensive telecommunications and digital infrastructure solutions
          </p>
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <ul className="service-features">
                  {service.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                <Link to={`/services/${service.id}`} className="service-link">
                  Learn More →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose CMedia?</h2>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Experience speeds that keep up with your ambitions</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🛡️</div>
              <h3>Reliable & Secure</h3>
              <p>99.9% uptime guarantee with enterprise-grade security</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🎯</div>
              <h3>24/7 Support</h3>
              <p>Expert technical support whenever you need it</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📈</div>
              <h3>Scalable Solutions</h3>
              <p>Grow with solutions that adapt to your needs</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Get Connected?</h2>
          <p>Join thousands of satisfied customers who trust CMedia for their connectivity needs.</p>
          <div className="cta-actions">
            <Link to="/register" className="cta-button primary large">
              Get Started Today
            </Link>
            <a href="#contact" className="cta-button secondary large">
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>CMedia</h3>
              <p>Connecting your world with reliable, high-speed telecommunications solutions.</p>
            </div>
            <div className="footer-section">
              <h4>Services</h4>
              <ul>
                <li><a href="/services/fiber">Fiber Optic</a></li>
                <li><a href="/services/dedicated">Dedicated Internet</a></li>
                <li><a href="/services/hosting">Web Hosting</a></li>
                <li><a href="/services/servers">Server Solutions</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="/support">Help Center</a></li>
                <li><a href="/support/contact">Contact Us</a></li>
                <li><a href="/support/status">Service Status</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="/about">About Us</a></li>
                <li><a href="/careers">Careers</a></li>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms of Service</a></li>
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

export default LandingPage;
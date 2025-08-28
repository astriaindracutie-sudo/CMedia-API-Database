import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      // Note: This endpoint would need to be implemented in the backend
      const response = await axios.post('http://localhost:3000/auth/forgot-password', {
        email
      });

      if (response.status === 200) {
        setIsSubmitted(true);
        setMessage('Password reset instructions have been sent to your email address.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      
      if (error.response?.status === 404) {
        setError('No account found with this email address.');
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <Link to="/" className="back-to-home">
              ← Back to Home
            </Link>
            <div className="auth-brand">
              <h1>CMedia</h1>
              <p>Password Reset</p>
            </div>
          </div>

          <div className="auth-card">
            <div className="auth-form-header">
              <div className="success-icon">📧</div>
              <h2>Check Your Email</h2>
              <p>We've sent password reset instructions to {email}</p>
            </div>

            <div className="success-message">
              <p>{message}</p>
              <p>
                If you don't receive the email within a few minutes, please check your spam folder 
                or try again with a different email address.
              </p>
            </div>

            <div className="auth-footer">
              <p>
                Remember your password?{' '}
                <Link to="/login" className="auth-link">
                  Back to Login
                </Link>
              </p>
            </div>
          </div>

          <div className="auth-benefits">
            <h3>Need Help?</h3>
            <ul>
              <li>
                <span className="benefit-icon">📞</span>
                <div>
                  <strong>Call Support</strong>
                  <p>Speak with our team directly</p>
                </div>
              </li>
              <li>
                <span className="benefit-icon">💬</span>
                <div>
                  <strong>Live Chat</strong>
                  <p>Get instant help online</p>
                </div>
              </li>
              <li>
                <span className="benefit-icon">📚</span>
                <div>
                  <strong>Help Center</strong>
                  <p>Browse our knowledge base</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="back-to-home">
            ← Back to Home
          </Link>
          <div className="auth-brand">
            <h1>CMedia</h1>
            <p>Password Reset</p>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-form-header">
            <h2>Forgot Your Password?</h2>
            <p>Enter your email address and we'll send you instructions to reset your password</p>
          </div>

          {error && (
            <div className="error-message general-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={error ? 'error' : ''}
                placeholder="Enter your email address"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="auth-footer">
            <p>
              Remember your password?{' '}
              <Link to="/login" className="auth-link">
                Back to Login
              </Link>
            </p>
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-benefits">
          <h3>Security First</h3>
          <ul>
            <li>
              <span className="benefit-icon">🔒</span>
              <div>
                <strong>Secure Reset</strong>
                <p>Your password reset link expires in 1 hour</p>
              </div>
            </li>
            <li>
              <span className="benefit-icon">🛡️</span>
              <div>
                <strong>Account Protection</strong>
                <p>We'll never share your personal information</p>
              </div>
            </li>
            <li>
              <span className="benefit-icon">⚡</span>
              <div>
                <strong>Quick Recovery</strong>
                <p>Get back to your services in minutes</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
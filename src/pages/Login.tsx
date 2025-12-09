import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import '../App.css';

const Login: React.FC = () => {
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const role = isAdminLogin ? 'admin' : 'student';
    const success = await login(email, password, role);
    
    if (success) {
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      setError(role === 'admin' 
        ? 'Invalid admin credentials' 
        : 'Invalid Application ID or Password'
      );
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      {/* College Information Banner */}
      <div className="college-banner">
        <div className="banner-content">
          <div className="college-logo">
            <i className="bi bi-mortarboard-fill"></i>
          </div>
          <div className="college-info">
            <h1>The New College Kolhapur</h1>
            <p className="tagline">
              <i className="bi bi-award-fill"></i> Excellence in Education Since 1971
            </p>
            <div className="college-highlights">
              <div className="highlight-item">
                <i className="bi bi-book-fill"></i>
                <span>UGC Recognized</span>
              </div>
              <div className="highlight-item">
                <i className="bi bi-star-fill"></i>
                <span>NAAC A+ Accredited</span>
              </div>
              <div className="highlight-item">
                <i className="bi bi-people-fill"></i>
                <span>10,000+ Students</span>
              </div>
              <div className="highlight-item">
                <i className="bi bi-trophy-fill"></i>
                <span>50+ Years Legacy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-box">
        <div className="login-header">
          <i className="bi bi-person-circle login-icon"></i>
          <h1>{isAdminLogin ? 'Admin Portal' : 'Student Login'}</h1>
          <p>Access your admission portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">
              <i className={isAdminLogin ? 'bi bi-envelope-fill' : 'bi bi-card-heading'}></i>
              {isAdminLogin ? ' Email' : ' Application ID'}
            </label>
            <div className="input-with-icon">
              <i className={isAdminLogin ? 'bi bi-person-badge' : 'bi bi-123'}></i>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAdminLogin ? 'admin@college.com' : 'NCK20250001'}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <i className="bi bi-lock-fill"></i> Password
            </label>
            <div className="input-with-icon">
              <i className="bi bi-key-fill"></i>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <i className="bi bi-exclamation-triangle-fill"></i>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="bi bi-arrow-clockwise spin-icon"></i> Logging in...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i> Login
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          {!isAdminLogin && (
            <>
              <p className="new-student-text">
                <i className="bi bi-person-plus-fill"></i> New student?
              </p>
              <button
                className="link-button apply-btn"
                onClick={() => navigate('/apply')}
              >
                <i className="bi bi-pencil-square"></i> Apply for Admission
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer with Admin Login */}
      <div className="page-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4><i className="bi bi-geo-alt-fill"></i> Address</h4>
            <p>The New College, Kolhapur<br />Maharashtra, India</p>
          </div>
          <div className="footer-section">
            <h4><i className="bi bi-telephone-fill"></i> Contact</h4>
            <p>Phone: +91-231-XXXXXXX<br />Email: info@newcollege.edu</p>
          </div>
          <div className="footer-section">
            <h4><i className="bi bi-clock-fill"></i> Office Hours</h4>
            <p>Mon - Fri: 9:00 AM - 5:00 PM<br />Sat: 9:00 AM - 1:00 PM</p>
          </div>
          <div className="footer-section admin-footer-section">
            {!isAdminLogin && (
              <button
                className="admin-login-btn"
                onClick={() => setIsAdminLogin(true)}
              >
                <i className="bi bi-shield-lock-fill"></i> Admin Login
              </button>
            )}
            {isAdminLogin && (
              <button
                className="back-to-student-btn"
                onClick={() => setIsAdminLogin(false)}
              >
                <i className="bi bi-arrow-left-circle-fill"></i> Back to Student Login
              </button>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 The New College Kolhapur. All rights reserved.</p>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          position: relative;
        }

        .college-banner {
          width: 100%;
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          margin-bottom: 30px;
          border-radius: 12px;
          overflow: hidden;
        }

        .banner-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 30px;
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .college-logo {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3.5rem;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
        }

        .college-info {
          flex: 1;
        }

        .college-info h1 {
          color: #2d3748;
          font-size: 2.5rem;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .tagline {
          color: #667eea;
          font-size: 1.2rem;
          margin-bottom: 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .college-highlights {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }

        .highlight-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .highlight-item i {
          color: #667eea;
          font-size: 1.2rem;
        }

        .login-box {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 480px;
          width: 100%;
          padding: 45px;
          margin-bottom: 30px;
          position: relative;
          overflow: hidden;
        }

        .login-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }

        .login-header {
          text-align: center;
          margin-bottom: 35px;
        }

        .login-icon {
          font-size: 4rem;
          color: #667eea;
          margin-bottom: 15px;
          display: block;
        }

        .login-header h1 {
          color: #2d3748;
          font-size: 2rem;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .login-header p {
          color: #64748b;
          font-size: 1rem;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-icon i {
          position: absolute;
          left: 16px;
          color: #64748b;
          font-size: 1.2rem;
          z-index: 1;
        }

        .input-with-icon input {
          padding-left: 48px !important;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .login-form .form-group {
          margin-bottom: 0;
        }

        .login-form label {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .login-form input {
          width: 100%;
        }

        .login-btn {
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 1.1rem;
        }

        .login-footer {
          margin-top: 30px;
          text-align: center;
          padding-top: 25px;
          border-top: 2px solid #e2e8f0;
        }

        .new-student-text {
          color: #64748b;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
        }

        .apply-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 14px 30px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .apply-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
        }

        .page-footer {
          width: 100%;
          background: rgba(255, 255, 255, 0.98);
          border-radius: 12px;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
          padding: 40px 30px 20px;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 30px;
          margin-bottom: 30px;
        }

        .footer-section h4 {
          color: #2d3748;
          margin-bottom: 15px;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-section h4 i {
          color: #667eea;
        }

        .footer-section p {
          color: #64748b;
          line-height: 1.8;
          font-size: 0.95rem;
        }

        .admin-footer-section {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-login-btn,
        .back-to-student-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .back-to-student-btn {
          background: linear-gradient(135deg, #64748b 0%, #475569 100%);
        }

        .admin-login-btn:hover,
        .back-to-student-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        .footer-bottom {
          text-align: center;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
          color: #64748b;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .banner-content {
            flex-direction: column;
            text-align: center;
            padding: 30px 20px;
          }

          .college-info h1 {
            font-size: 1.8rem;
          }

          .college-highlights {
            grid-template-columns: repeat(2, 1fr);
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 25px;
            text-align: center;
          }

          .footer-section h4 {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .login-box {
            padding: 35px 25px;
          }

          .login-header h1 {
            font-size: 1.6rem;
          }

          .college-info h1 {
            font-size: 1.5rem;
          }

          .college-highlights {
            grid-template-columns: 1fr;
          }

          .banner-content {
            padding: 25px 15px;
          }

          .college-logo {
            width: 80px;
            height: 80px;
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;

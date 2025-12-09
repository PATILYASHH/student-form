import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import '../App.css';

const Login: React.FC = () => {
  const [role, setRole] = useState<'student' | 'admin'>('student');
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
      <div className="login-box">
        <div className="login-header">
          <h1>NCK College Admission Portal</h1>
          <p>Login to your account</p>
        </div>

        <div className="role-selector">
          <button
            className={`role-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}
            type="button"
          >
            Student Login
          </button>
          <button
            className={`role-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
            type="button"
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">
              {role === 'admin' ? 'Email' : 'Application ID'}
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === 'admin' ? 'admin@college.com' : 'NCK20250001'}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          {role === 'student' && (
            <>
              <p>New student?</p>
              <button
                className="link-button"
                onClick={() => navigate('/apply')}
              >
                Apply for Admission
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .login-box {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 450px;
          width: 100%;
          padding: 40px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-header h1 {
          color: #2d3748;
          font-size: 1.8rem;
          margin-bottom: 10px;
        }

        .login-header p {
          color: #64748b;
          font-size: 1rem;
        }

        .role-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
        }

        .role-btn {
          flex: 1;
          padding: 12px;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #64748b;
        }

        .role-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .role-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .login-form .form-group {
          margin-bottom: 0;
        }

        .login-form input {
          width: 100%;
        }

        .login-footer {
          margin-top: 30px;
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .login-footer p {
          color: #64748b;
          margin-bottom: 10px;
        }

        .link-button {
          background: none;
          border: none;
          color: #667eea;
          font-weight: 600;
          cursor: pointer;
          font-size: 1rem;
          text-decoration: underline;
        }

        .link-button:hover {
          color: #764ba2;
        }

        @media (max-width: 480px) {
          .login-box {
            padding: 30px 20px;
          }

          .login-header h1 {
            font-size: 1.5rem;
          }

          .role-selector {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;

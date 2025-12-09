import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface Application {
  id: string;
  application_id: string;
  student_name: string;
  email: string;
  contact_number: string;
  marks_10: number;
  marks_12: number;
  status: string;
  created_at: string;
  admin_notes: string | null;
}

interface ActivityLog {
  action: string;
  details: string;
  created_at: string;
}

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }
    fetchApplicationData();
  }, [user, navigate]);

  const fetchApplicationData = async () => {
    try {
      const { data: appData, error: appError } = await supabase
        .from('admissions')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (appError) throw appError;
      setApplication(appData);

      const { data: logsData, error: logsError } = await supabase
        .from('activity_logs')
        .select('action, details, created_at')
        .eq('admission_id', user?.id)
        .order('created_at', { ascending: false });

      if (!logsError && logsData) {
        setActivityLogs(logsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading-screen">Loading your application...</div>;
  }

  if (!application) {
    return <div className="error-screen">Application not found</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'under_review': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✓';
      case 'rejected': return '✗';
      case 'under_review': return '⏳';
      default: return '⋯';
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <i className="bi bi-mortarboard-fill"></i>
          <h2>The New College Kolhapur</h2>
        </div>
        <div className="nav-actions">
          <span className="user-info">
            <i className="bi bi-person-circle"></i>
            {application.student_name}
          </span>
          <button onClick={handleLogout} className="btn-secondary">
            <i className="bi bi-box-arrow-right"></i>
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>
            <i className="bi bi-emoji-smile"></i>
            Welcome, {application.student_name}!
          </h1>
          <p>
            <i className="bi bi-card-heading"></i>
            Application ID: <strong>{application.application_id}</strong>
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="status-card" style={{ borderLeftColor: getStatusColor(application.status) }}>
            <div className="status-icon" style={{ backgroundColor: getStatusColor(application.status) }}>
              {getStatusIcon(application.status)}
            </div>
            <div className="status-info">
              <h3>Application Status</h3>
              <p className="status-value" style={{ color: getStatusColor(application.status) }}>
                {application.status.toUpperCase().replace('_', ' ')}
              </p>
              <small>Last updated: {new Date(application.created_at).toLocaleDateString()}</small>
            </div>
          </div>

          <div className="info-card">
            <h3>
              <i className="bi bi-envelope-fill"></i>
              Contact Information
            </h3>
            <p><strong>Email:</strong> {application.email}</p>
            <p><strong>Phone:</strong> {application.contact_number}</p>
          </div>

          <div className="info-card">
            <h3>
              <i className="bi bi-graph-up-arrow"></i>
              Academic Details
            </h3>
            <p><strong>10th Marks:</strong> {application.marks_10}%</p>
            <p><strong>12th Marks:</strong> {application.marks_12}%</p>
            <p><strong>Average:</strong> {((application.marks_10 + application.marks_12) / 2).toFixed(2)}%</p>
          </div>
        </div>

        {application.admin_notes && (
          <div className="notes-section">
            <h3>
              <i className="bi bi-chat-left-text-fill"></i>
              Message from Administration
            </h3>
            <p>{application.admin_notes}</p>
          </div>
        )}

        <div className="activity-section">
          <h3>
            <i className="bi bi-clock-history"></i>
            Application Timeline
          </h3>
          {activityLogs.length > 0 ? (
            <div className="timeline">
              {activityLogs.map((log, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <p className="timeline-action">{log.details}</p>
                    <small>{new Date(log.created_at).toLocaleString()}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-activity">No activity logs yet</p>
          )}
        </div>
      </div>

      <style>{`
        .dashboard-container {
          min-height: 100vh;
          background: #f5f7fa;
        }

        .dashboard-nav {
          background: white;
          padding: 20px 40px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-brand i {
          font-size: 2rem;
          color: #667eea;
        }

        .dashboard-nav h2 {
          color: #2d3748;
          margin: 0;
          font-weight: 700;
        }

        .nav-actions {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .user-info {
          color: #64748b;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-info i {
          font-size: 1.5rem;
          color: #667eea;
        }

        .dashboard-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .welcome-section {
          margin-bottom: 40px;
        }

        .welcome-section h1 {
          color: #2d3748;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .welcome-section h1 i {
          color: #667eea;
          font-size: 2.5rem;
        }

        .welcome-section p {
          color: #64748b;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .welcome-section p i {
          color: #667eea;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .status-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          gap: 20px;
          align-items: center;
          border-left: 4px solid;
        }

        .status-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: white;
          flex-shrink: 0;
        }

        .status-info {
          flex: 1;
        }

        .status-info h3 {
          margin: 0 0 10px 0;
          color: #64748b;
          font-size: 0.9rem;
          text-transform: uppercase;
        }

        .status-value {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .info-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .info-card h3 {
          margin: 0 0 20px 0;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .info-card h3 i {
          color: #667eea;
          font-size: 1.5rem;
        }

        .info-card p {
          margin: 10px 0;
          color: #64748b;
        }

        .notes-section {
          background: #fff7ed;
          border-left: 4px solid #f59e0b;
          border-radius: 8px;
          padding: 25px;
          margin-bottom: 40px;
        }

        .notes-section h3 {
          margin: 0 0 15px 0;
          color: #92400e;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .notes-section h3 i {
          font-size: 1.5rem;
        }

        .notes-section p {
          color: #78350f;
          line-height: 1.6;
        }

        .activity-section {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .activity-section h3 {
          margin: 0 0 25px 0;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .activity-section h3 i {
          color: #667eea;
          font-size: 1.5rem;
        }

        .timeline {
          position: relative;
          padding-left: 30px;
        }

        .timeline-item {
          position: relative;
          padding-bottom: 30px;
        }

        .timeline-item:last-child {
          padding-bottom: 0;
        }

        .timeline-marker {
          position: absolute;
          left: -30px;
          top: 5px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #667eea;
          border: 3px solid white;
          box-shadow: 0 0 0 2px #667eea;
        }

        .timeline-item::before {
          content: '';
          position: absolute;
          left: -24px;
          top: 17px;
          bottom: -17px;
          width: 2px;
          background: #e2e8f0;
        }

        .timeline-item:last-child::before {
          display: none;
        }

        .timeline-content {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
        }

        .timeline-action {
          margin: 0 0 5px 0;
          color: #2d3748;
          font-weight: 500;
        }

        .timeline-content small {
          color: #64748b;
        }

        .no-activity {
          text-align: center;
          color: #94a3b8;
          padding: 40px;
        }

        .loading-screen,
        .error-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #64748b;
        }

        @media (max-width: 768px) {
          .dashboard-nav {
            padding: 15px 20px;
            flex-direction: column;
            gap: 15px;
          }

          .nav-actions {
            width: 100%;
            justify-content: space-between;
          }

          .dashboard-content {
            padding: 20px 15px;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .status-card {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;

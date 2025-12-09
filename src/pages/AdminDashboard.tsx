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

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'marks_10' | 'marks_12' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchApplications();
  }, [user, navigate]);

  useEffect(() => {
    applyFilters();
  }, [applications, statusFilter, sortBy, sortOrder, searchTerm]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('admissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.student_name.localeCompare(b.student_name);
          break;
        case 'marks_10':
          comparison = a.marks_10 - b.marks_10;
          break;
        case 'marks_12':
          comparison = a.marks_12 - b.marks_12;
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredApps(filtered);
  };

  const updateStatus = async (appId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('admissions')
        .update({ status: newStatus, admin_notes: adminNotes || null })
        .eq('id', appId);

      if (error) throw error;

      // Log the activity
      await supabase
        .from('activity_logs')
        .insert({
          admission_id: appId,
          action: 'status_changed',
          details: `Status changed to ${newStatus}`,
          performed_by: user?.email || 'admin'
        });

      await fetchApplications();
      setShowModal(false);
      setSelectedApp(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const openModal = (app: Application) => {
    setSelectedApp(app);
    setAdminNotes(app.admin_notes || '');
    setShowModal(true);
  };

  const getStats = () => {
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      approved: applications.filter(a => a.status === 'approved').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      under_review: applications.filter(a => a.status === 'under_review').length,
    };
  };

  const stats = getStats();

  if (loading) {
    return <div className="loading-screen">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <i className="bi bi-shield-lock-fill"></i>
          <div>
            <h2>Admin Dashboard</h2>
            <p className="college-name">The New College Kolhapur</p>
          </div>
        </div>
        <div className="nav-actions">
          <span className="user-info">
            <i className="bi bi-person-badge"></i>
            {user?.email}
          </span>
          <button onClick={() => { logout(); navigate('/login'); }} className="btn-secondary">
            <i className="bi bi-box-arrow-right"></i>
            Logout
          </button>
        </div>
      </nav>

      <div className="admin-content">
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card" style={{ borderLeftColor: '#667eea' }}>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <i className="bi bi-files"></i>
            </div>
            <div className="stat-info">
              <h3>Total Applications</h3>
              <p className="stat-number">{stats.total}</p>
            </div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#64748b' }}>
            <div className="stat-icon" style={{ background: '#64748b' }}>
              <i className="bi bi-hourglass-split"></i>
            </div>
            <div className="stat-info">
              <h3>Pending</h3>
              <p className="stat-number">{stats.pending}</p>
            </div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
            <div className="stat-icon" style={{ background: '#10b981' }}>
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <div className="stat-info">
              <h3>Approved</h3>
              <p className="stat-number">{stats.approved}</p>
            </div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#ef4444' }}>
            <div className="stat-icon" style={{ background: '#ef4444' }}>
              <i className="bi bi-x-circle-fill"></i>
            </div>
            <div className="stat-info">
              <h3>Rejected</h3>
              <p className="stat-number">{stats.rejected}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="filter-select">
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="marks_10">10th Marks</option>
              <option value="marks_12">12th Marks</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Order:</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} className="filter-select">
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Applications Table */}
        <div className="applications-section">
          <h3>
            <i className="bi bi-table"></i>
            Applications ({filteredApps.length})
          </h3>
          <div className="table-container">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>App ID</th>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>10th %</th>
                  <th>12th %</th>
                  <th>Avg %</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map(app => (
                  <tr key={app.id}>
                    <td><strong>{app.application_id}</strong></td>
                    <td>{app.student_name}</td>
                    <td>{app.email}</td>
                    <td>{app.marks_10}%</td>
                    <td>{app.marks_12}%</td>
                    <td>{((app.marks_10 + app.marks_12) / 2).toFixed(1)}%</td>
                    <td>
                      <span className={`status-badge status-${app.status}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{new Date(app.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn-action"
                        onClick={() => openModal(app)}
                      >
                        <i className="bi bi-gear-fill"></i>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredApps.length === 0 && (
              <p className="no-results">No applications found</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedApp && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Application</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="app-details">
                <h3>{selectedApp.student_name}</h3>
                <p><strong>Application ID:</strong> {selectedApp.application_id}</p>
                <p><strong>Email:</strong> {selectedApp.email}</p>
                <p><strong>Phone:</strong> {selectedApp.contact_number}</p>
                <p><strong>10th Marks:</strong> {selectedApp.marks_10}%</p>
                <p><strong>12th Marks:</strong> {selectedApp.marks_12}%</p>
                <p><strong>Average:</strong> {((selectedApp.marks_10 + selectedApp.marks_12) / 2).toFixed(2)}%</p>
                <p><strong>Current Status:</strong> 
                  <span className={`status-badge status-${selectedApp.status}`}>
                    {selectedApp.status.replace('_', ' ')}
                  </span>
                </p>
              </div>

              <div className="form-group">
                <label>Admin Notes:</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for the student..."
                  rows={4}
                />
              </div>

              <div className="status-actions">
                <button
                  className="btn-status btn-pending"
                  onClick={() => updateStatus(selectedApp.id, 'pending')}
                >
                  <i className="bi bi-hourglass-split"></i>
                  Mark Pending
                </button>
                <button
                  className="btn-status btn-review"
                  onClick={() => updateStatus(selectedApp.id, 'under_review')}
                >
                  <i className="bi bi-eye-fill"></i>
                  Under Review
                </button>
                <button
                  className="btn-status btn-approve"
                  onClick={() => updateStatus(selectedApp.id, 'approved')}
                >
                  <i className="bi bi-check-circle-fill"></i>
                  Approve
                </button>
                <button
                  className="btn-status btn-reject"
                  onClick={() => updateStatus(selectedApp.id, 'rejected')}
                >
                  <i className="bi bi-x-circle-fill"></i>
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-dashboard {
          min-height: 100vh;
          background: #f5f7fa;
        }

        .admin-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-left: 4px solid;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: white;
          flex-shrink: 0;
        }

        .stat-info {
          flex: 1;
        }

        .stat-card h3 {
          margin: 0 0 8px 0;
          color: #64748b;
          font-size: 0.9rem;
          text-transform: uppercase;
          font-weight: 600;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2d3748;
          margin: 0;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .nav-brand i {
          font-size: 2.5rem;
          color: #667eea;
        }

        .nav-brand h2 {
          margin: 0;
          font-size: 1.5rem;
        }

        .college-name {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-info i {
          font-size: 1.5rem;
          color: #667eea;
        }

        .filters-section {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 30px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .filter-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #4a5568;
          font-size: 0.9rem;
        }

        .filter-input,
        .filter-select {
          width: 100%;
          padding: 10px 14px;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.95rem;
        }

        .applications-section {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .applications-section h3 {
          margin: 0 0 20px 0;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .applications-section h3 i {
          color: #667eea;
          font-size: 1.5rem;
        }

        .table-container {
          overflow-x: auto;
        }

        .applications-table {
          width: 100%;
          border-collapse: collapse;
        }

        .applications-table th {
          background: #f8f9fa;
          padding: 15px;
          text-align: left;
          font-weight: 600;
          color: #2d3748;
          border-bottom: 2px solid #e2e8f0;
          white-space: nowrap;
        }

        .applications-table td {
          padding: 15px;
          border-bottom: 1px solid #e2e8f0;
          color: #64748b;
        }

        .applications-table tbody tr:hover {
          background: #f8f9fa;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-pending { background: #e2e8f0; color: #64748b; }
        .status-under_review { background: #fef3c7; color: #92400e; }
        .status-approved { background: #d1fae5; color: #065f46; }
        .status-rejected { background: #fee2e2; color: #991b1b; }

        .btn-action {
          padding: 8px 16px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }

        .btn-action:hover {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
        }

        .no-results {
          text-align: center;
          padding: 40px;
          color: #94a3b8;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          padding: 25px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          color: #2d3748;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 2rem;
          color: #64748b;
          cursor: pointer;
          line-height: 1;
        }

        .modal-body {
          padding: 25px;
        }

        .app-details {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
        }

        .app-details h3 {
          margin: 0 0 15px 0;
          color: #2d3748;
        }

        .app-details p {
          margin: 8px 0;
          color: #64748b;
        }

        .status-actions {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 20px;
        }

        .btn-status {
          padding: 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .btn-pending { background: #64748b; }
        .btn-review { background: #f59e0b; }
        .btn-approve { background: #10b981; }
        .btn-reject { background: #ef4444; }

        .btn-status:hover {
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
          .filters-section {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .status-actions {
            grid-template-columns: 1fr;
          }

          .table-container {
            font-size: 0.85rem;
          }

          .applications-table th,
          .applications-table td {
            padding: 10px 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;

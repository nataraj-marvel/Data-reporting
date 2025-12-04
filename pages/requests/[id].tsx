// pages/requests/[id].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { Request, RequestUpdate, User } from '../../types';

export default function RequestEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  
  const [formData, setFormData] = useState<Partial<Request>>({
    title: '',
    description: '',
    request_type: 'feature',
    priority: 'medium',
    status: 'submitted',
    acceptance_criteria: '',
    estimated_hours: null,
    actual_hours: null,
    assigned_to: null,
    due_date: null
  });

  useEffect(() => {
    fetchUsers();
    if (id && id !== 'new') {
      fetchRequest();
    } else if (id === 'new') {
      setLoading(false);
    }
  }, [id]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/requests/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setFormData(data.data);
      } else {
        setError(data.error || 'Failed to load request');
      }
    } catch (err) {
      setError('Failed to fetch request');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const url = id === 'new' ? '/api/requests' : `/api/requests/${id}`;
      const method = id === 'new' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(id === 'new' ? 'Request created successfully!' : 'Request updated successfully!');
        if (id === 'new') {
          setTimeout(() => router.push(`/requests/${data.data.request_id}`), 1500);
        }
      } else {
        setError(data.error || 'Failed to save request');
      }
    } catch (err) {
      setError('Failed to save request');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        router.push('/requests');
      } else {
        setError(data.error || 'Failed to delete request');
      }
    } catch (err) {
      setError('Failed to delete request');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#e74c3c';
      case 'high': return '#e67e22';
      case 'medium': return '#f39c12';
      case 'low': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#27ae60';
      case 'in_progress': return '#3498db';
      case 'approved': return '#9b59b6';
      case 'under_review': return '#f39c12';
      case 'rejected': return '#e74c3c';
      case 'on_hold': return '#95a5a6';
      default: return '#bdc3c7';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>{id === 'new' ? 'Create Request' : 'Edit Request'}</h1>
        <div className="header-actions">
          <button onClick={() => router.back()} className="btn btn-secondary">
            ← Back
          </button>
          {id !== 'new' && (
            <button onClick={handleDelete} className="btn btn-danger">
              Delete
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Enter request title..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={6}
            placeholder="Describe the request in detail..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="request_type">Request Type</label>
            <select
              id="request_type"
              value={formData.request_type || 'feature'}
              onChange={(e) => setFormData({ ...formData, request_type: e.target.value as any })}
            >
              <option value="feature">Feature</option>
              <option value="enhancement">Enhancement</option>
              <option value="refactor">Refactor</option>
              <option value="documentation">Documentation</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">
              Priority
              <span 
                className="priority-indicator" 
                style={{ backgroundColor: getPriorityColor(formData.priority || 'medium') }}
              />
            </label>
            <select
              id="priority"
              value={formData.priority || 'medium'}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">
              Status
              <span 
                className="status-indicator" 
                style={{ backgroundColor: getStatusColor(formData.status || 'submitted') }}
              />
            </label>
            <select
              id="status"
              value={formData.status || 'submitted'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="assigned_to">Assign To</label>
            <select
              id="assigned_to"
              value={formData.assigned_to || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                assigned_to: e.target.value ? parseInt(e.target.value) : null 
              })}
            >
              <option value="">Unassigned</option>
              {users.map(user => (
                <option key={user.user_id} value={user.user_id}>
                  {user.full_name} ({user.username})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="acceptance_criteria">Acceptance Criteria</label>
          <textarea
            id="acceptance_criteria"
            value={formData.acceptance_criteria || ''}
            onChange={(e) => setFormData({ ...formData, acceptance_criteria: e.target.value })}
            rows={4}
            placeholder="- Criteria 1&#10;- Criteria 2&#10;- Criteria 3"
          />
          <small className="form-hint">
            List the conditions that must be met for this request to be considered complete
          </small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="estimated_hours">Estimated Hours</label>
            <input
              type="number"
              id="estimated_hours"
              value={formData.estimated_hours || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                estimated_hours: e.target.value ? parseFloat(e.target.value) : null 
              })}
              min="0"
              step="0.5"
              placeholder="0.0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="actual_hours">Actual Hours</label>
            <input
              type="number"
              id="actual_hours"
              value={formData.actual_hours || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                actual_hours: e.target.value ? parseFloat(e.target.value) : null 
              })}
              min="0"
              step="0.5"
              placeholder="0.0"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="due_date">Due Date</label>
          <input
            type="date"
            id="due_date"
            value={formData.due_date || ''}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value || null })}
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : id === 'new' ? 'Create Request' : 'Update Request'}
          </button>
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>

      <style jsx>{`
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .page-header h1 {
          margin: 0;
          color: #333;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .loading {
          text-align: center;
          padding: 40px;
          font-size: 18px;
          color: #666;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .alert-error {
          background-color: #fee;
          color: #c33;
          border: 1px solid #fcc;
        }

        .alert-success {
          background-color: #efe;
          color: #3c3;
          border: 1px solid #cfc;
        }

        .form-card {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .required {
          color: #e74c3c;
        }

        .priority-indicator,
        .status-indicator {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        input[type="text"],
        input[type="number"],
        input[type="date"],
        textarea,
        select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
        }

        textarea {
          resize: vertical;
        }

        input:focus,
        textarea:focus,
        select:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .form-hint {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #666;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background-color: #3498db;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #2980b9;
        }

        .btn-secondary {
          background-color: #95a5a6;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #7f8c8d;
        }

        .btn-danger {
          background-color: #e74c3c;
          color: white;
        }

        .btn-danger:hover {
          background-color: #c0392b;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
}



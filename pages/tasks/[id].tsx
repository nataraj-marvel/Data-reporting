// pages/tasks/[id].tsx - Task Edit/View Form
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { TaskEnhanced, TaskUpdate, User, Request, Issue } from '../../types';

export default function TaskEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  
  const [formData, setFormData] = useState<Partial<TaskEnhanced>>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    task_type: 'development',
    estimated_hours: null,
    actual_hours: null,
    completion_percentage: 0,
    due_date: null,
    blocked_reason: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchRequests();
    fetchIssues();
    if (id && id !== 'new') {
      fetchTask();
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

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/requests?limit=100');
      const data = await response.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch requests');
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await fetch('/api/issues?limit=100');
      const data = await response.json();
      if (data.success) {
        setIssues(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch issues');
    }
  };

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setFormData(data.data);
      } else {
        setError(data.error || 'Failed to load task');
      }
    } catch (err) {
      setError('Failed to fetch task');
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
      const url = id === 'new' ? '/api/tasks' : `/api/tasks/${id}`;
      const method = id === 'new' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(id === 'new' ? 'Task created successfully!' : 'Task updated successfully!');
        if (id === 'new') {
          setTimeout(() => router.push('/tasks'), 1500);
        } else {
          // Refresh the task data
          fetchTask();
        }
      } else {
        setError(data.error || 'Failed to save task');
      }
    } catch (err) {
      setError('Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        router.push('/tasks');
      } else {
        setError(data.error || 'Failed to delete task');
      }
    } catch (err) {
      setError('Failed to delete task');
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
      case 'review': return '#9b59b6';
      case 'blocked': return '#e74c3c';
      case 'cancelled': return '#95a5a6';
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
        <h1>{id === 'new' ? 'Create Task' : 'Edit Task'}</h1>
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
            Task Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Enter task title..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Task Description</label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Describe the task in detail..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">
              Status
              <span 
                className="status-indicator" 
                style={{ backgroundColor: getStatusColor(formData.status || 'pending') }}
              />
            </label>
            <select
              id="status"
              value={formData.status || 'pending'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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
            <label htmlFor="task_type">Task Type</label>
            <select
              id="task_type"
              value={formData.task_type || 'development'}
              onChange={(e) => setFormData({ ...formData, task_type: e.target.value as any })}
            >
              <option value="development">Development</option>
              <option value="bugfix">Bug Fix</option>
              <option value="testing">Testing</option>
              <option value="documentation">Documentation</option>
              <option value="review">Review</option>
              <option value="research">Research</option>
              <option value="deployment">Deployment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="completion_percentage">
              Completion % ({formData.completion_percentage || 0}%)
            </label>
            <input
              type="range"
              id="completion_percentage"
              value={formData.completion_percentage || 0}
              onChange={(e) => setFormData({ 
                ...formData, 
                completion_percentage: parseInt(e.target.value) 
              })}
              min="0"
              max="100"
              step="5"
            />
          </div>
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

        {formData.status === 'blocked' && (
          <div className="form-group">
            <label htmlFor="blocked_reason">Blocked Reason</label>
            <textarea
              id="blocked_reason"
              value={formData.blocked_reason || ''}
              onChange={(e) => setFormData({ ...formData, blocked_reason: e.target.value })}
              rows={3}
              placeholder="Explain why this task is blocked..."
            />
          </div>
        )}

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
          <small className="form-hint">
            Select the user responsible for completing this task
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="request_id">Related Request (Optional)</label>
          <select
            id="request_id"
            value={formData.request_id || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              request_id: e.target.value ? parseInt(e.target.value) : null 
            })}
          >
            <option value="">None</option>
            {requests.map(request => (
              <option key={request.request_id} value={request.request_id}>
                {request.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="issue_id">Related Issue (Optional)</label>
          <select
            id="issue_id"
            value={formData.issue_id || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              issue_id: e.target.value ? parseInt(e.target.value) : null 
            })}
          >
            <option value="">None</option>
            {issues.map(issue => (
              <option key={issue.issue_id} value={issue.issue_id}>
                {issue.title} - {issue.severity}
              </option>
            ))}
          </select>
        </div>

        {id !== 'new' && (
          <div className="info-section">
            <h3>Task Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Created By:</span>
                <span className="info-value">{formData.creator_name || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Assigned To:</span>
                <span className="info-value">{formData.assigned_user_name || 'Unassigned'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Created:</span>
                <span className="info-value">
                  {formData.created_at ? new Date(formData.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Updated:</span>
                <span className="info-value">
                  {formData.updated_at ? new Date(formData.updated_at).toLocaleString() : 'N/A'}
                </span>
              </div>
              {formData.started_at && (
                <div className="info-item">
                  <span className="info-label">Started:</span>
                  <span className="info-value">
                    {new Date(formData.started_at).toLocaleString()}
                  </span>
                </div>
              )}
              {formData.completed_at && (
                <div className="info-item">
                  <span className="info-label">Completed:</span>
                  <span className="info-value">
                    {new Date(formData.completed_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : id === 'new' ? 'Create Task' : 'Update Task'}
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
        input[type="range"],
        textarea,
        select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
        }

        input[type="range"] {
          padding: 0;
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

        .info-section {
          margin: 30px 0;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .info-section h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 16px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
        }

        .info-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .info-value {
          font-size: 14px;
          color: #333;
          font-weight: 500;
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

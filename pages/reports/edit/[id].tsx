// pages/reports/edit/[id].tsx - Report Edit Form
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { DailyReport, DailyReportUpdate } from '../../../types';

export default function ReportEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<Partial<DailyReport>>({
    report_date: '',
    work_description: '',
    hours_worked: 0,
    tasks_completed: '',
    blockers: '',
    notes: '',
    status: 'draft'
  });

  useEffect(() => {
    if (id) {
      fetchReport();
    }
  }, [id]);

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/reports/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setFormData(data.data);
      } else {
        setError(data.error || 'Failed to load report');
      }
    } catch (err) {
      setError('Failed to fetch report');
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
      const response = await fetch(`/api/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_description: formData.work_description,
          hours_worked: formData.hours_worked,
          tasks_completed: formData.tasks_completed,
          blockers: formData.blockers,
          notes: formData.notes,
          status: formData.status
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Report updated successfully!');
        setTimeout(() => router.push(`/reports/${id}`), 1500);
      } else {
        setError(data.error || 'Failed to update report');
      }
    } catch (err) {
      setError('Failed to update report');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        router.push('/reports');
      } else {
        setError(data.error || 'Failed to delete report');
      }
    } catch (err) {
      setError('Failed to delete report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed': return '#27ae60';
      case 'submitted': return '#3498db';
      case 'draft': return '#f39c12';
      default: return '#95a5a6';
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
        <h1>Edit Daily Report</h1>
        <div className="header-actions">
          <button onClick={() => router.push(`/reports/${id}`)} className="btn btn-secondary">
            ← View Report
          </button>
          <button onClick={handleDelete} className="btn btn-danger">
            Delete
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="info-row">
          <div className="info-item">
            <span className="info-label">Report Date:</span>
            <span className="info-value">
              {formData.report_date ? new Date(formData.report_date).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Report #:</span>
            <span className="info-value">{id}</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="work_description">
            Work Description <span className="required">*</span>
          </label>
          <textarea
            id="work_description"
            value={formData.work_description || ''}
            onChange={(e) => setFormData({ ...formData, work_description: e.target.value })}
            required
            rows={6}
            placeholder="Describe the work you completed today..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="hours_worked">
              Hours Worked <span className="required">*</span>
            </label>
            <input
              type="number"
              id="hours_worked"
              value={formData.hours_worked || 0}
              onChange={(e) => setFormData({ 
                ...formData, 
                hours_worked: parseFloat(e.target.value) || 0 
              })}
              required
              min="0"
              max="24"
              step="0.5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">
              Status
              <span 
                className="status-indicator" 
                style={{ backgroundColor: getStatusColor(formData.status || 'draft') }}
              />
            </label>
            <select
              id="status"
              value={formData.status || 'draft'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tasks_completed">Tasks Completed</label>
          <textarea
            id="tasks_completed"
            value={formData.tasks_completed || ''}
            onChange={(e) => setFormData({ ...formData, tasks_completed: e.target.value })}
            rows={4}
            placeholder="- Task 1&#10;- Task 2&#10;- Task 3"
          />
          <small className="form-hint">
            List the specific tasks you completed (one per line)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="blockers">Blockers / Issues</label>
          <textarea
            id="blockers"
            value={formData.blockers || ''}
            onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
            rows={3}
            placeholder="Describe any blockers or issues encountered..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            placeholder="Any additional notes or comments..."
          />
        </div>

        <div className="info-section">
          <h3>Report Metadata</h3>
          <div className="info-grid">
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
            {formData.submitted_at && (
              <div className="info-item">
                <span className="info-label">Submitted:</span>
                <span className="info-value">
                  {new Date(formData.submitted_at).toLocaleString()}
                </span>
              </div>
            )}
            {formData.reviewed_at && (
              <div className="info-item">
                <span className="info-label">Reviewed:</span>
                <span className="info-value">
                  {new Date(formData.reviewed_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : 'Update Report'}
          </button>
          <button 
            type="button" 
            onClick={() => router.push(`/reports/${id}`)} 
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

        .info-row {
          display: flex;
          gap: 30px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 30px;
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

        .status-indicator {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        input[type="number"],
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
          font-weight: 600;
        }

        .info-value {
          font-size: 14px;
          color: #333;
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

          .info-row {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}



// pages/files/[id].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { FileVersion, FileVersionUpdate } from '../../types';

export default function FileVersionPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<Partial<FileVersion>>({
    file_path: '',
    version_number: '',
    change_type: 'modified',
    lines_added: 0,
    lines_deleted: 0,
    file_size_bytes: null,
    commit_hash: '',
    branch_name: '',
    change_description: '',
    metadata: {}
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchFileVersion();
    } else if (id === 'new') {
      setLoading(false);
    }
  }, [id]);

  const fetchFileVersion = async () => {
    try {
      const response = await fetch(`/api/files/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setFormData(data.data);
      } else {
        setError(data.error || 'Failed to load file version');
      }
    } catch (err) {
      setError('Failed to fetch file version');
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
      const url = id === 'new' ? '/api/files' : `/api/files/${id}`;
      const method = id === 'new' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(id === 'new' ? 'File version created successfully!' : 'File version updated successfully!');
        if (id === 'new') {
          setTimeout(() => router.push(`/files/${data.data.file_id}`), 1500);
        }
      } else {
        setError(data.error || 'Failed to save file version');
      }
    } catch (err) {
      setError('Failed to save file version');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this file version?')) return;

    try {
      const response = await fetch(`/api/files/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        router.push('/files');
      } else {
        setError(data.error || 'Failed to delete file version');
      }
    } catch (err) {
      setError('Failed to delete file version');
    }
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'created': return '#27ae60';
      case 'modified': return '#3498db';
      case 'deleted': return '#e74c3c';
      case 'renamed': return '#f39c12';
      case 'moved': return '#9b59b6';
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
        <h1>{id === 'new' ? 'Log File Version' : 'File Version Details'}</h1>
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
          <label htmlFor="file_path">
            File Path <span className="required">*</span>
          </label>
          <input
            type="text"
            id="file_path"
            value={formData.file_path || ''}
            onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
            required
            placeholder="src/pages/api/users.ts"
            disabled={id !== 'new'}
          />
          {id !== 'new' && (
            <small className="form-hint">File path cannot be changed after creation</small>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="version_number">
              Version Number <span className="required">*</span>
            </label>
            <input
              type="text"
              id="version_number"
              value={formData.version_number || ''}
              onChange={(e) => setFormData({ ...formData, version_number: e.target.value })}
              required
              placeholder="1.2.0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="change_type">
              Change Type
              <span 
                className="change-type-indicator" 
                style={{ backgroundColor: getChangeTypeColor(formData.change_type || 'modified') }}
              />
            </label>
            <select
              id="change_type"
              value={formData.change_type || 'modified'}
              onChange={(e) => setFormData({ ...formData, change_type: e.target.value as any })}
              disabled={id !== 'new'}
            >
              <option value="created">Created</option>
              <option value="modified">Modified</option>
              <option value="deleted">Deleted</option>
              <option value="renamed">Renamed</option>
              <option value="moved">Moved</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="lines_added">Lines Added</label>
            <input
              type="number"
              id="lines_added"
              value={formData.lines_added || 0}
              onChange={(e) => setFormData({ 
                ...formData, 
                lines_added: parseInt(e.target.value) || 0 
              })}
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lines_deleted">Lines Deleted</label>
            <input
              type="number"
              id="lines_deleted"
              value={formData.lines_deleted || 0}
              onChange={(e) => setFormData({ 
                ...formData, 
                lines_deleted: parseInt(e.target.value) || 0 
              })}
              min="0"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="commit_hash">Commit Hash</label>
            <input
              type="text"
              id="commit_hash"
              value={formData.commit_hash || ''}
              onChange={(e) => setFormData({ ...formData, commit_hash: e.target.value })}
              placeholder="a1b2c3d4e5f6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="branch_name">Branch Name</label>
            <input
              type="text"
              id="branch_name"
              value={formData.branch_name || ''}
              onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
              placeholder="main"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="change_description">Change Description</label>
          <textarea
            id="change_description"
            value={formData.change_description || ''}
            onChange={(e) => setFormData({ ...formData, change_description: e.target.value })}
            rows={4}
            placeholder="Describe what changed in this version..."
          />
        </div>

        {id !== 'new' && (
          <div className="stats-section">
            <h3>Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Lines Added</div>
                <div className="stat-value added">+{formData.lines_added || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Lines Deleted</div>
                <div className="stat-value deleted">-{formData.lines_deleted || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Net Change</div>
                <div className="stat-value">
                  {((formData.lines_added || 0) - (formData.lines_deleted || 0))}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">File Size</div>
                <div className="stat-value">
                  {formData.file_size_bytes 
                    ? `${(formData.file_size_bytes / 1024).toFixed(2)} KB`
                    : 'N/A'
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="metadata">Metadata (JSON)</label>
          <textarea
            id="metadata"
            value={typeof formData.metadata === 'string' 
              ? formData.metadata 
              : JSON.stringify(formData.metadata || {}, null, 2)
            }
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setFormData({ ...formData, metadata: parsed });
              } catch {
                setFormData({ ...formData, metadata: e.target.value as any });
              }
            }}
            rows={4}
            placeholder='{"language": "typescript", "framework": "nextjs"}'
          />
          <small className="form-hint">
            Additional metadata in JSON format
          </small>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : id === 'new' ? 'Create Version' : 'Update Version'}
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

        .change-type-indicator {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        input[type="text"],
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

        input:disabled,
        select:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
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

        .stats-section {
          margin: 30px 0;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .stats-section h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 18px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }

        .stat-card {
          background: white;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }

        .stat-value.added {
          color: #27ae60;
        }

        .stat-value.deleted {
          color: #e74c3c;
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

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}



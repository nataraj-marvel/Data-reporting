// pages/prompts/[id].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { AIPrompt, AIPromptUpdate } from '../../types';

export default function PromptEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<Partial<AIPrompt>>({
    prompt_text: '',
    response_text: '',
    ai_model: 'cursor-ai',
    category: 'other',
    effectiveness_rating: null,
    tokens_used: 0,
    context_data: {}
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchPrompt();
    } else if (id === 'new') {
      setLoading(false);
    }
  }, [id]);

  const fetchPrompt = async () => {
    try {
      const response = await fetch(`/api/prompts/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setFormData(data.data);
      } else {
        setError(data.error || 'Failed to load prompt');
      }
    } catch (err) {
      setError('Failed to fetch prompt');
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
      const url = id === 'new' ? '/api/prompts' : `/api/prompts/${id}`;
      const method = id === 'new' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(id === 'new' ? 'Prompt created successfully!' : 'Prompt updated successfully!');
        if (id === 'new') {
          setTimeout(() => router.push(`/prompts/${data.data.prompt_id}`), 1500);
        }
      } else {
        setError(data.error || 'Failed to save prompt');
      }
    } catch (err) {
      setError('Failed to save prompt');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        router.push('/prompts');
      } else {
        setError(data.error || 'Failed to delete prompt');
      }
    } catch (err) {
      setError('Failed to delete prompt');
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
        <h1>{id === 'new' ? 'Create AI Prompt' : 'Edit AI Prompt'}</h1>
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
          <label htmlFor="prompt_text">
            Prompt Text <span className="required">*</span>
          </label>
          <textarea
            id="prompt_text"
            value={formData.prompt_text || ''}
            onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
            required
            rows={6}
            placeholder="Enter your AI prompt here..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="response_text">AI Response</label>
          <textarea
            id="response_text"
            value={formData.response_text || ''}
            onChange={(e) => setFormData({ ...formData, response_text: e.target.value })}
            rows={8}
            placeholder="AI response will appear here..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ai_model">AI Model</label>
            <select
              id="ai_model"
              value={formData.ai_model || 'cursor-ai'}
              onChange={(e) => setFormData({ ...formData, ai_model: e.target.value })}
            >
              <option value="cursor-ai">Cursor AI</option>
              <option value="claude-sonnet-4.5">Claude Sonnet 4.5</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="copilot">GitHub Copilot</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={formData.category || 'other'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            >
              <option value="debug">Debug</option>
              <option value="refactor">Refactor</option>
              <option value="feature">Feature</option>
              <option value="documentation">Documentation</option>
              <option value="test">Test</option>
              <option value="optimization">Optimization</option>
              <option value="review">Review</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="effectiveness_rating">
              Effectiveness Rating (1-5)
            </label>
            <select
              id="effectiveness_rating"
              value={formData.effectiveness_rating || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                effectiveness_rating: e.target.value ? parseInt(e.target.value) : null 
              })}
            >
              <option value="">Not rated</option>
              <option value="1">1 - Not helpful</option>
              <option value="2">2 - Somewhat helpful</option>
              <option value="3">3 - Helpful</option>
              <option value="4">4 - Very helpful</option>
              <option value="5">5 - Extremely helpful</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tokens_used">Tokens Used</label>
            <input
              type="number"
              id="tokens_used"
              value={formData.tokens_used || 0}
              onChange={(e) => setFormData({ 
                ...formData, 
                tokens_used: parseInt(e.target.value) || 0 
              })}
              min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="context_data">Context Data (JSON)</label>
          <textarea
            id="context_data"
            value={typeof formData.context_data === 'string' 
              ? formData.context_data 
              : JSON.stringify(formData.context_data || {}, null, 2)
            }
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setFormData({ ...formData, context_data: parsed });
              } catch {
                setFormData({ ...formData, context_data: e.target.value as any });
              }
            }}
            rows={4}
            placeholder='{"file": "path/to/file.ts", "line": 45}'
          />
          <small className="form-hint">
            Enter additional context as JSON (e.g., file path, line number, etc.)
          </small>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : id === 'new' ? 'Create Prompt' : 'Update Prompt'}
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
        }

        .required {
          color: #e74c3c;
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



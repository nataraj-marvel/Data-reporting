// pages/reports.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import type { DailyReport } from '@/types';

export default function Reports() {
    const router = useRouter();
    const [reports, setReports] = useState<DailyReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        fetchReports();
    }, [filterStatus]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const queryParams = filterStatus ? `?status=${filterStatus}` : '';
            const res = await fetch(`/api/reports${queryParams}`);
            const data = await res.json();
            if (data.success) {
                setReports(data.data);
            } else {
                setError(data.error || 'Failed to load reports');
            }
        } catch (e) {
            setError('Network error while fetching reports');
        } finally {
            setLoading(false);
        }
    };

    const handleNewReport = () => {
        router.push('/reports/new');
    };

    return (
        <>
            <Head>
                <title>Reports Dashboard – Nautilus Reporting</title>
                <meta
                    name="description"
                    content="Dashboard showing all daily reports for the logged‑in user."
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <div className="container">
                <div className="header">
                    <h1>📊 Reports Dashboard</h1>
                    <button className="new-btn" onClick={handleNewReport}>
                        + New Report
                    </button>
                </div>

                {!loading && !error && (
                    <div className="stats-cards">
                        <div className="stat-card">
                            <div className="stat-value">{reports.length}</div>
                            <div className="stat-label">Total Reports</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{reports.filter(r => r.status === 'draft').length}</div>
                            <div className="stat-label">Draft</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{reports.filter(r => r.status === 'submitted').length}</div>
                            <div className="stat-label">Submitted</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{reports.filter(r => r.status === 'reviewed').length}</div>
                            <div className="stat-label">Reviewed</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">
                                {reports.reduce((sum, r) => sum + (parseFloat(r.hours_worked) || 0), 0).toFixed(1)}
                            </div>
                            <div className="stat-label">Total Hours</div>
                        </div>
                    </div>
                )}

                <div className="filters">
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="submitted">Submitted</option>
                        <option value="reviewed">Reviewed</option>
                    </select>
                    <button className="refresh-btn" onClick={fetchReports}>🔄 Refresh</button>
                </div>

                {loading && <p className="loading">Loading reports…</p>}
                {error && <p className="error">{error}</p>}
                {!loading && !error && (
                    <>
                        {reports.length === 0 ? (
                            <div className="empty-state">
                                <p className="empty">No reports found.</p>
                                <button className="new-btn" onClick={handleNewReport}>
                                    Create Your First Report
                                </button>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Date</th>
                                            <th>User</th>
                                            <th>Work Description</th>
                                            <th>Hours</th>
                                            <th>Tasks Completed</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reports.map(r => (
                                            <tr key={r.report_id} className="table-row">
                                                <td className="id-cell">#{r.report_id}</td>
                                                <td className="date-cell">
                                                    {new Date(r.report_date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="user-cell">
                                                    <div className="user-info">
                                                        <strong>{r.full_name || 'Unknown'}</strong>
                                                        <span className="username">@{r.full_name ? r.full_name.toLowerCase().replace(' ', '') : 'user'}</span>
                                                    </div>
                                                </td>
                                                <td className="description-cell">
                                                    <div className="description-content">
                                                        {r.work_description.substring(0, 60)}
                                                        {r.work_description.length > 60 ? '...' : ''}
                                                    </div>
                                                </td>
                                                <td className="hours-cell">
                                                    <span className="hours-badge">{r.hours_worked}h</span>
                                                </td>
                                                <td className="tasks-cell">
                                                    {r.tasks_completed ? (
                                                        <div className="tasks-preview">
                                                            {r.tasks_completed.split('\n').length} task(s)
                                                        </div>
                                                    ) : '—'}
                                                </td>
                                                <td className="status-cell">
                                                    <span className={`badge badge-${r.status}`}>{r.status}</span>
                                                </td>
                                                <td className="actions-cell">
                                                    <button
                                                        className="view-btn"
                                                        onClick={() => router.push(`/reports/${r.report_id}`)}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        className="edit-btn"
                                                        onClick={() => router.push(`/reports/edit/${r.report_id}`)}
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
            <style jsx>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', sans-serif; }
        
        .container { 
          max-width: 1400px; 
          margin: 40px auto; 
          padding: 30px; 
          background: rgba(15, 41, 66, 0.6); 
          backdrop-filter: blur(20px); 
          border-radius: 16px; 
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 80px rgba(0, 212, 255, 0.1); 
          border: 1px solid rgba(0, 212, 255, 0.3);
          position: relative;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        h1 { 
          margin: 0; 
          color: #ffffff; 
          font-weight: 700; 
          font-size: 36px;
          background: linear-gradient(135deg, #00d4ff 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 40px rgba(0, 212, 255, 0.3);
          letter-spacing: -0.5px;
        }
        
        .stats-cards { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
          gap: 15px; 
          margin-bottom: 25px; 
        }
        
        .stat-card { 
          background: rgba(15, 41, 66, 0.4); 
          backdrop-filter: blur(10px);
          padding: 24px; 
          border-radius: 12px; 
          text-align: center; 
          border: 1px solid rgba(0, 212, 255, 0.2);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #00d4ff, #06b6d4, #00d4ff);
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(0, 212, 255, 0.5);
          box-shadow: 0 8px 24px rgba(0, 212, 255, 0.2);
        }
        
        .stat-value { 
          font-size: 36px; 
          font-weight: 700; 
          background: linear-gradient(135deg, #00d4ff 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px; 
        }
        
        .stat-label { 
          font-size: 11px; 
          color: #94a3b8; 
          text-transform: uppercase; 
          letter-spacing: 1px;
          font-weight: 600;
        }

        .filters { 
          display: flex; 
          gap: 10px; 
          margin-bottom: 20px; 
        }
        
        select { 
          padding: 12px 16px; 
          border-radius: 8px; 
          border: 1px solid rgba(0, 212, 255, 0.2); 
          background: rgba(15, 41, 66, 0.6);
          color: #e3f2fd;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        select:hover {
          border-color: rgba(0, 212, 255, 0.4);
          background: rgba(15, 41, 66, 0.8);
        }
        
        select:focus {
          outline: none;
          border-color: #00d4ff;
          box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.15);
        }
        
        .refresh-btn { 
          padding: 12px 20px; 
          background: rgba(15, 41, 66, 0.6); 
          border: 1px solid rgba(0, 212, 255, 0.3); 
          border-radius: 8px; 
          cursor: pointer; 
          font-size: 14px; 
          font-weight: 600; 
          color: #00d4ff;
          transition: all 0.3s ease;
        }
        
        .refresh-btn:hover { 
          background: rgba(0, 212, 255, 0.1); 
          border-color: #00d4ff;
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.2);
          transform: translateY(-2px);
        }
        
        .loading, .error { 
          text-align: center; 
          margin-top: 40px; 
          font-size: 16px; 
          padding: 20px;
        }
        
        .error { color: #ff6b6b; }
        .loading { color: #b0b0b0; }
        
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: rgba(15, 41, 66, 0.4);
          border-radius: 12px;
          border: 1px solid rgba(0, 212, 255, 0.2);
        }
        
        .empty { 
          font-size: 18px;
          color: #94a3b8;
          margin-bottom: 24px;
          font-weight: 500;
        }
        
        .new-btn { 
          background: linear-gradient(135deg, #00d4ff 0%, #06b6d4 100%); 
          color: #0a1929; 
          border: none; 
          padding: 12px 28px; 
          border-radius: 8px; 
          cursor: pointer; 
          font-weight: 700; 
          font-size: 14px;
          transition: all 0.3s ease; 
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .new-btn:hover { 
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0, 212, 255, 0.5);
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
        }

        .table-container { 
          overflow-x: auto; 
          background: rgba(15, 41, 66, 0.4); 
          backdrop-filter: blur(10px);
          border-radius: 12px; 
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); 
          border: 1px solid rgba(0, 212, 255, 0.2);
        }
        
        .table { 
          width: 100%; 
          border-collapse: collapse; 
        }
        
        .table thead { 
          background: rgba(0, 212, 255, 0.1); 
          position: relative;
        }
        
        .table thead::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00d4ff, transparent);
        }
        
        .table th { 
          padding: 18px 16px; 
          text-align: left; 
          font-weight: 700; 
          color: #00d4ff; 
          font-size: 11px; 
          text-transform: uppercase; 
          letter-spacing: 1px; 
          border-bottom: none;
        }
        
        .table td { 
          padding: 18px 16px; 
          border-bottom: 1px solid rgba(0, 212, 255, 0.08); 
          font-size: 14px; 
          color: #e3f2fd;
        }
        
        .table-row:hover { 
          background: rgba(0, 212, 255, 0.08); 
          box-shadow: inset 3px 0 0 #00d4ff;
        }
        
        .id-cell { 
          color: #00d4ff; 
          font-weight: 700; 
          width: 70px;
          font-family: 'Courier New', monospace;
        }
        
        .date-cell { 
          color: #94a3b8; 
          white-space: nowrap;
          font-weight: 500;
        }
        
        .user-cell .user-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        
        .user-cell strong {
          color: #ffffff;
          font-weight: 600;
        }
        
        .username {
          font-size: 12px;
          color: #64748b;
          font-family: 'Courier New', monospace;
        }
        
        .description-cell { 
          max-width: 350px; 
        }
        
        .description-content {
          color: #cbd5e1;
          line-height: 1.6;
        }
        
        .hours-cell .hours-badge {
          display: inline-block;
          padding: 6px 14px;
          background: rgba(0, 212, 255, 0.15);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 16px;
          color: #00d4ff;
          font-weight: 700;
          font-size: 13px;
          font-family: 'Courier New', monospace;
        }
        
        .tasks-cell .tasks-preview {
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
        }

        .badge { 
          display: inline-block; 
          padding: 6px 14px; 
          border-radius: 16px; 
          font-size: 10px; 
          text-transform: uppercase; 
          font-weight: 700; 
          letter-spacing: 0.8px;
        }
        
        .badge-draft { 
          background: rgba(251, 191, 36, 0.15); 
          color: #fbbf24; 
          border: 1px solid rgba(251, 191, 36, 0.3);
        }
        
        .badge-submitted { 
          background: rgba(0, 212, 255, 0.15); 
          color: #00d4ff; 
          border: 1px solid rgba(0, 212, 255, 0.3);
        }
        
        .badge-reviewed { 
          background: rgba(34, 197, 94, 0.15); 
          color: #22c55e; 
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .actions-cell { 
          white-space: nowrap; 
        }
        
        .view-btn, .edit-btn { 
          padding: 8px 16px; 
          border: none; 
          border-radius: 6px; 
          cursor: pointer; 
          font-size: 12px; 
          font-weight: 600; 
          margin-right: 6px; 
          transition: all 0.3s ease; 
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .view-btn { 
          background: rgba(0, 212, 255, 0.15); 
          color: #00d4ff; 
          border: 1px solid rgba(0, 212, 255, 0.3);
        }
        
        .view-btn:hover { 
          background: rgba(0, 212, 255, 0.25); 
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
        }
        
        .edit-btn { 
          background: rgba(251, 191, 36, 0.15); 
          color: #fbbf24; 
          border: 1px solid rgba(251, 191, 36, 0.3);
        }
        
        .edit-btn:hover { 
          background: rgba(251, 191, 36, 0.25); 
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        }

        @media (max-width: 1200px) {
          .table-container { font-size: 13px; }
          .table th, .table td { padding: 12px 8px; }
        }
      `}</style>
        </>
    );
}

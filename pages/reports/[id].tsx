// pages/reports/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import type { DailyReport } from '@/types';

/**
 * MarvelQuant Report Viewer
 * Enhanced with professional theme and complete data display
 * URL pattern: /reports/[id]
 */
export default function ReportDetail() {
    const router = useRouter();
    const { id } = router.query as { id: string };
    const [report, setReport] = useState<DailyReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        const fetchReport = async () => {
            try {
                const res = await fetch(`/api/reports/${id}`);
                const data = await res.json();
                if (data.success) {
                    setReport(data.data);
                } else {
                    setError(data.error || 'Failed to load report');
                }
            } catch (e) {
                setError('Network error while fetching report');
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <>
                <Head>
                    <title>Loading Report – MarvelQuant</title>
                </Head>
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading report...</p>
                </div>
                <style jsx>{`
                    .loading-container {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        height: 80vh;
                        gap: 20px;
                    }
                    .spinner {
                        width: 50px;
                        height: 50px;
                        border: 4px solid rgba(0, 212, 255, 0.2);
                        border-top-color: #00d4ff;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                    p {
                        color: #94a3b8;
                        font-size: 16px;
                        font-weight: 500;
                    }
                `}</style>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Head>
                    <title>Error – MarvelQuant</title>
                </Head>
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h2>Error Loading Report</h2>
                    <p className="error-message">{error}</p>
                    <button onClick={() => router.push('/reports')} className="back-btn">
                        ← Back to Reports
                    </button>
                </div>
                <style jsx>{`
                    .error-container {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        height: 80vh;
                        gap: 20px;
                        padding: 40px;
                    }
                    .error-icon {
                        font-size: 64px;
                    }
                    h2 {
                        color: #ef4444;
                        font-size: 24px;
                        margin: 0;
                    }
                    .error-message {
                        color: #94a3b8;
                        font-size: 16px;
                    }
                    .back-btn {
                        padding: 12px 24px;
                        background: rgba(0, 212, 255, 0.15);
                        color: #00d4ff;
                        border: 1px solid rgba(0, 212, 255, 0.3);
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    }
                    .back-btn:hover {
                        background: rgba(0, 212, 255, 0.25);
                        transform: translateY(-2px);
                    }
                `}</style>
            </>
        );
    }

    if (!report) return null;

    return (
        <>
            <Head>
                <title>Report #{report.report_id} – MarvelQuant</title>
                <meta
                    name="description"
                    content={`Daily report for ${report.report_date}`}
                />
            </Head>
            <div className="container">
                {/* Header */}
                <div className="header">
                    <div className="header-left">
                        <h1>📊 Report #{report.report_id}</h1>
                        <p className="subtitle">{formatDate(report.report_date)}</p>
                    </div>
                    <div className="header-right">
                        <span className={`status-badge status-${report.status}`}>
                            {report.status}
                        </span>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="summary-cards">
                    <div className="summary-card">
                        <div className="card-icon">⏱️</div>
                        <div className="card-content">
                            <div className="card-value">{report.hours_worked}h</div>
                            <div className="card-label">Hours Worked</div>
                        </div>
                    </div>
                    {report.start_time && report.end_time && (
                        <div className="summary-card">
                            <div className="card-icon">🕐</div>
                            <div className="card-content">
                                <div className="card-value">{report.start_time} - {report.end_time}</div>
                                <div className="card-label">Time Range</div>
                            </div>
                        </div>
                    )}
                    {report.task_title && (
                        <div className="summary-card">
                            <div className="card-icon">✓</div>
                            <div className="card-content">
                                <div className="card-value">{report.task_title}</div>
                                <div className="card-label">Related Task</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Work Description */}
                <div className="section">
                    <h2 className="section-title">💼 Work Description</h2>
                    <div className="section-content markdown-content">
                        {report.work_description}
                    </div>
                </div>

                {/* Tasks Completed */}
                {report.tasks_completed && (
                    <div className="section">
                        <h2 className="section-title">✅ Tasks Completed</h2>
                        <div className="section-content">
                            {report.tasks_completed}
                        </div>
                    </div>
                )}

                {/* Issues Found */}
                {(report as any).issues_found && (
                    <div className="section issue-section">
                        <h2 className="section-title">🔍 Issues Found</h2>
                        <div className="section-content issue-content">
                            {(report as any).issues_found}
                        </div>
                    </div>
                )}

                {/* Issues Solved */}
                {(report as any).issues_solved && (
                    <div className="section success-section">
                        <h2 className="section-title">✨ Issues Solved</h2>
                        <div className="section-content success-content">
                            {(report as any).issues_solved}
                        </div>
                    </div>
                )}

                {/* Blockers */}
                {report.blockers && (
                    <div className="section blocker-section">
                        <h2 className="section-title">⚠️ Blockers</h2>
                        <div className="section-content blocker-content">
                            {report.blockers}
                        </div>
                    </div>
                )}

                {/* Notes */}
                {report.notes && (
                    <div className="section">
                        <h2 className="section-title">📝 Notes</h2>
                        <div className="section-content">
                            {report.notes}
                        </div>
                    </div>
                )}

                {/* Metadata */}
                <div className="metadata">
                    <div className="metadata-item">
                        <span className="metadata-label">Created</span>
                        <span className="metadata-value">{formatDateTime(report.created_at)}</span>
                    </div>
                    <div className="metadata-item">
                        <span className="metadata-label">Updated</span>
                        <span className="metadata-value">{formatDateTime(report.updated_at)}</span>
                    </div>
                    {report.submitted_at && (
                        <div className="metadata-item">
                            <span className="metadata-label">Submitted</span>
                            <span className="metadata-value">{formatDateTime(report.submitted_at)}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="actions">
                    <button className="edit-btn" onClick={() => router.push(`/reports/edit/${id}`)}>
                        <span className="btn-icon">✏️</span>
                        <span>Edit Report</span>
                    </button>
                    <button className="back-btn" onClick={() => router.push('/reports')}>
                        <span className="btn-icon">←</span>
                        <span>Back to Reports</span>
                    </button>
                </div>
            </div>
            <style jsx>{`
        .container {
          max-width: 1000px;
          margin: 40px auto;
          padding: 40px;
          background: rgba(15, 41, 66, 0.6);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 80px rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid rgba(0, 212, 255, 0.2);
        }
        h1 {
          margin: 0 0 8px 0;
          font-size: 36px;
          font-weight: 700;
          background: linear-gradient(135deg, #00d4ff 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          margin: 0;
          color: #94a3b8;
          font-size: 16px;
          font-weight: 500;
        }
        .status-badge {
          padding: 8px 18px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .status-draft {
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }
        .status-submitted {
          background: rgba(0, 212, 255, 0.15);
          color: #00d4ff;
          border: 1px solid rgba(0, 212, 255, 0.3);
        }
        .status-reviewed {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        /* Summary Cards */
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }
        .summary-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: rgba(15, 41, 66, 0.4);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(0, 212, 255, 0.2);
          transition: all 0.3s ease;
        }
        .summary-card:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 212, 255, 0.4);
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.2);
        }
        .card-icon {
          font-size: 32px;
          line-height: 1;
        }
        .card-value {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 4px;
        }
        .card-label {
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        /* Sections */
        .section {
          margin-bottom: 25px;
          padding: 25px;
          background: rgba(15, 41, 66, 0.3);
          border-radius: 12px;
          border: 1px solid rgba(0, 212, 255, 0.15);
        }
        .section-title {
          margin: 0 0 15px 0;
          font-size: 20px;
          font-weight: 700;
          color: #00d4ff;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-content {
          color: #e3f2fd;
          line-height: 1.8;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .markdown-content {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          background: rgba(0, 0, 0, 0.2);
          padding: 20px;
          border-radius: 8px;
          border-left: 3px solid #00d4ff;
        }

        /* Special Section Styles */
        .issue-section {
          border-left: 3px solid #fbbf24;
        }
        .issue-content {
          background: rgba(251, 191, 36, 0.05);
          padding: 15px;
          border-radius: 8px;
        }
        .success-section {
          border-left: 3px solid #22c55e;
        }
        .success-content {
          background: rgba(34, 197, 94, 0.05);
          padding: 15px;
          border-radius: 8px;
        }
        .blocker-section {
          border-left: 3px solid #ef4444;
        }
        .blocker-content {
          background: rgba(239, 68, 68, 0.05);
          padding: 15px;
          border-radius: 8px;
        }

        /* Metadata */
        .metadata {
          display: flex;
          gap: 30px;
          padding: 20px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          margin-bottom: 25px;
          flex-wrap: wrap;
        }
        .metadata-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .metadata-label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .metadata-value {
          font-size: 14px;
          color: #cbd5e1;
          font-weight: 500;
        }

        /* Actions */
        .actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .edit-btn,
        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
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
        .back-btn {
          background: rgba(0, 212, 255, 0.15);
          color: #00d4ff;
          border: 1px solid rgba(0, 212, 255, 0.3);
        }
        .back-btn:hover {
          background: rgba(0, 212, 255, 0.25);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
        }
        .btn-icon {
          font-size: 16px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .container {
            margin: 20px;
            padding: 20px;
          }
          .header {
            flex-direction: column;
            gap: 15px;
          }
          .summary-cards {
            grid-template-columns: 1fr;
          }
          .actions {
            flex-direction: column;
          }
          .edit-btn,
          .back-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
        </>
    );
}

// pages/reports.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import type { DailyReport } from '@/types';

/**
 * Premium Reports Dashboard – displayed after successful login.
 * Fetches reports from `/api/reports` (authenticated) and shows a clean table.
 */
export default function Reports() {
    const router = useRouter();
    const [reports, setReports] = useState<DailyReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('/api/reports');
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
        fetchReports();
    }, []);

    const handleNewReport = () => {
        router.push('/reports/new');
    };

    return (
        <>
            <Head>
                <title>Reports – Nautilus Reporting</title>
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
                <h1>My Reports</h1>
                {loading && <p className="loading">Loading reports…</p>}
                {error && <p className="error">{error}</p>}
                {!loading && !error && (
                    <>
                        <button className="new-btn" onClick={handleNewReport}>
                            + New Report
                        </button>
                        {reports.length === 0 ? (
                            <p className="empty">No reports found.</p>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Task</th>
                                        <th>Hours</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map(r => (
                                        <tr key={r.id}>
                                            <td>{new Date(r.report_date).toLocaleDateString()}</td>
                                            <td>{r.start_time ? `${r.start_time} - ${r.end_time || '?'}` : '—'}</td>
                                            <td>{r.task_title || '—'}</td>
                                            <td>{r.hours_worked}</td>
                                            <td>
                                                <span className={`badge badge-${r.status}`}>{r.status}</span>
                                            </td>
                                            <td>
                                                <button
                                                    className="view-btn"
                                                    onClick={() => router.push(`/reports/${r.id}`)}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </div>
            <style jsx>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #f5f7ff, #e8ecff); }
        .container { max-width: 960px; margin: 40px auto; padding: 20px; background: rgba(255,255,255,0.93); backdrop-filter: blur(10px); border-radius: 12px; box-shadow: 0 12px 30px rgba(0,0,0,0.08); }
        h1 { text-align: center; margin-bottom: 24px; color: #222; font-weight: 600; }
        .loading, .error, .empty { text-align: center; margin-top: 20px; font-size: 1rem; }
        .error { color: #e53935; }
        .new-btn { background: #0066ff; color: #fff; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; margin-bottom: 16px; transition: background 0.2s; }
        .new-btn:hover { background: #0052cc; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { padding: 12px 8px; border-bottom: 1px solid #e0e0e0; text-align: left; }
        .table th { background: #f9fbff; font-weight: 600; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 500; }
        .badge-draft { background: #fff9c4; color: #795548; }
        .badge-submitted { background: #bbdefb; color: #0d47a1; }
        .badge-reviewed { background: #c8e6c9; color: #1b5e20; }
        .view-btn { background: #00c853; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: background 0.2s; }
        .view-btn:hover { background: #009624; }
      `}</style>
        </>
    );
}

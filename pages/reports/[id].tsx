// pages/reports/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import type { DailyReport } from '@/types';

/**
 * Premium single‑report view page.
 * URL pattern: /reports/[id]
 * Fetches the report via GET `/api/reports/[id]` (requires authentication).
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

    if (loading) {
        return (
            <>
                <Head>
                    <title>Loading… – Nautilus Reporting</title>
                </Head>
                <div className="center"><p>Loading report…</p></div>
                <style jsx>{`.center { display:flex; justify-content:center; align-items:center; height:80vh; font-size:1.2rem; }`}</style>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Head>
                    <title>Error – Nautilus Reporting</title>
                </Head>
                <div className="center"><p className="error">{error}</p></div>
                <style jsx>{`.center { display:flex; justify-content:center; align-items:center; height:80vh; font-size:1.2rem; } .error { color:#e53935; }`}</style>
            </>
        );
    }

    if (!report) return null;

    return (
        <>
            <Head>
                <title>Report #{report.id} – Nautilus Reporting</title>
                <meta
                    name="description"
                    content={`Daily report for ${report.report_date} – ${report.work_description}`}
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <div className="container">
                <h1>Report #{report.id}</h1>
                <table className="detail-table">
                    <tbody>
                        <tr><th>Date</th><td>{new Date(report.report_date).toLocaleDateString()}</td></tr>
                        {report.task_title && (
                            <tr><th>Related Task</th><td><strong>{report.task_title}</strong></td></tr>
                        )}
                        {(report.start_time || report.end_time) && (
                            <tr><th>Time Range</th><td>{report.start_time || '?'} — {report.end_time || '?'}</td></tr>
                        )}
                        <tr><th>Work Description</th><td>{report.work_description}</td></tr>
                        <tr><th>Hours Worked</th><td>{report.hours_worked}</td></tr>
                        <tr><th>Tasks Completed</th><td>{report.tasks_completed || '—'}</td></tr>
                        <tr><th>Blockers</th><td>{report.blockers || '—'}</td></tr>
                        <tr><th>Notes</th><td>{report.notes || '—'}</td></tr>
                        <tr><th>Status</th><td><span className={`badge badge-${report.status}`}>{report.status}</span></td></tr>
                        <tr><th>Created At</th><td>{new Date(report.created_at).toLocaleString()}</td></tr>
                        <tr><th>Updated At</th><td>{new Date(report.updated_at).toLocaleString()}</td></tr>
                    </tbody>
                </table>
                <button className="back-btn" onClick={() => router.push('/reports')}>← Back to Reports</button>
            </div>
            <style jsx>{`
        * { box-sizing: border-box; }
        body { margin:0; font-family:'Inter',sans-serif; background:linear-gradient(135deg,#f5f7ff,#e8ecff); }
        .container { max-width:800px; margin:40px auto; padding:30px; background:rgba(255,255,255,0.93); backdrop-filter:blur(12px); border-radius:12px; box-shadow:0 12px 30px rgba(0,0,0,0.07); }
        h1 { text-align:center; margin-bottom:24px; color:#222; font-weight:600; }
        .detail-table { width:100%; border-collapse:collapse; }
        .detail-table th { text-align:left; padding:8px; background:#f9fbff; width:180px; }
        .detail-table td { padding:8px; }
        .badge { display:inline-block; padding:4px 8px; border-radius:4px; font-size:0.85rem; font-weight:500; }
        .badge-draft { background:#fff9c4; color:#795548; }
        .badge-submitted { background:#bbdefb; color:#0d47a1; }
        .badge-reviewed { background:#c8e6c9; color:#1b5e20; }
        .back-btn { margin-top:20px; background:#0066ff; color:#fff; border:none; padding:10px 16px; border-radius:8px; cursor:pointer; font-weight:600; }
        .back-btn:hover { background:#0052cc; }
      `}</style>
        </>
    );
}

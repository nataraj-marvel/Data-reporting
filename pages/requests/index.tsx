import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Request {
    id: number;
    title: string;
    description?: string;
    status: string;
    priority: string;
    created_at: string;
}

export default function RequestsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await fetch('/api/requests');
            const data = await response.json();
            
            if (data.success) {
                setRequests(data.data || []);
            } else {
                setError(data.error || 'Failed to fetch requests');
            }
        } catch (err) {
            setError('An error occurred while fetching requests');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container"><div className="loading">Loading requests...</div></div>;
    if (error) return <div className="container"><div className="error">{error}</div></div>;

    return (
        <div className="container">
            <div className="header">
                <h1>📋 Requests Dashboard</h1>
                <Link href="/requests/new" className="new-btn">
                    + New Request
                </Link>
            </div>

            {requests.length === 0 ? (
                <div className="empty-state">
                    <p className="empty">No requests found</p>
                    <Link href="/requests/new" className="new-btn">Create First Request</Link>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                                {requests.map((request) => (
                                <tr key={request.request_id} className="table-row">
                                    <td className="id-cell">#{request.request_id}</td>
                                    <td className="title-cell">
                                        <strong>{request.title}</strong>
                                    </td>
                                    <td className="description-cell">
                                        {request.description?.substring(0, 80)}
                                        {request.description && request.description.length > 80 ? '...' : ''}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${request.status}`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge priority-${request.priority}`}>
                                            {request.priority}
                                        </span>
                                    </td>
                                    <td className="date-cell">
                                        {new Date(request.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            onClick={() => router.push(`/requests/${request.request_id}`)}
                                            className="view-btn"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <style jsx>{`
                .container {
                    max-width: 1400px;
                    margin: 40px auto;
                    padding: 30px;
                    background: rgba(15, 41, 66, 0.6);
                    backdrop-filter: blur(20px);
                    border-radius: 16px;
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 80px rgba(0, 212, 255, 0.1);
                    border: 1px solid rgba(0, 212, 255, 0.3);
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                }
                h1 {
                    margin: 0;
                    font-size: 36px;
                    font-weight: 700;
                    background: linear-gradient(135deg, #00d4ff 0%, #06b6d4 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
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
                    text-decoration: none;
                    display: inline-block;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
                }
                .new-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 24px rgba(0, 212, 255, 0.5);
                }
                .loading, .error {
                    text-align: center;
                    padding: 40px;
                    font-size: 16px;
                    color: #94a3b8;
                }
                .error {
                    color: #f87171;
                }
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
                }
                .table-container {
                    overflow-x: auto;
                    background: rgba(15, 41, 66, 0.4);
                    border-radius: 12px;
                    border: 1px solid rgba(0, 212, 255, 0.2);
                }
                .table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .table thead {
                    background: rgba(0, 212, 255, 0.1);
                }
                .table th {
                    padding: 18px 16px;
                    text-align: left;
                    font-weight: 700;
                    color: #00d4ff;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .table td {
                    padding: 18px 16px;
                    border-bottom: 1px solid rgba(0, 212, 255, 0.08);
                    color: #e3f2fd;
                }
                .table-row:hover {
                    background: rgba(0, 212, 255, 0.08);
                    box-shadow: inset 3px 0 0 #00d4ff;
                }
                .id-cell {
                    color: #00d4ff;
                    font-weight: 700;
                    font-family: 'Courier New', monospace;
                }
                .title-cell {
                    color: #ffffff;
                    font-weight: 600;
                }
                .description-cell {
                    max-width: 300px;
                    color: #94a3b8;
                }
                .date-cell {
                    color: #94a3b8;
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
                .badge-open {
                    background: rgba(0, 212, 255, 0.15);
                    color: #00d4ff;
                    border: 1px solid rgba(0, 212, 255, 0.3);
                }
                .badge-in_progress {
                    background: rgba(251, 191, 36, 0.15);
                    color: #fbbf24;
                    border: 1px solid rgba(251, 191, 36, 0.3);
                }
                .badge-completed {
                    background: rgba(34, 197, 94, 0.15);
                    color: #22c55e;
                    border: 1px solid rgba(34, 197, 94, 0.3);
                }
                .priority-low {
                    background: rgba(148, 163, 184, 0.15);
                    color: #94a3b8;
                    border: 1px solid rgba(148, 163, 184, 0.3);
                }
                .priority-medium {
                    background: rgba(251, 191, 36, 0.15);
                    color: #fbbf24;
                    border: 1px solid rgba(251, 191, 36, 0.3);
                }
                .priority-high {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                }
                .view-btn {
                    padding: 8px 16px;
                    background: rgba(0, 212, 255, 0.15);
                    color: #00d4ff;
                    border: 1px solid rgba(0, 212, 255, 0.3);
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
                .view-btn:hover {
                    background: rgba(0, 212, 255, 0.25);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
                }
            `}</style>
        </div>
    );
}



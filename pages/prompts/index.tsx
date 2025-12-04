import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Prompt {
    id: number;
    prompt_text: string;
    context?: string;
    response?: string;
    created_at: string;
    created_by: number;
}

export default function PromptsPage() {
    const router = useRouter();
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPrompts();
    }, []);

    const fetchPrompts = async () => {
        try {
            const response = await fetch('/api/prompts');
            const data = await response.json();
            
            if (data.success) {
                setPrompts(data.data || []);
            } else {
                setError(data.error || 'Failed to fetch prompts');
            }
        } catch (err) {
            setError('An error occurred while fetching prompts');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container"><div className="loading">Loading AI prompts...</div></div>;
    if (error) return <div className="container"><div className="error">{error}</div></div>;

    return (
        <div className="container">
            <div className="header">
                <h1>🤖 AI Prompts Dashboard</h1>
                <Link href="/prompts/new" className="new-btn">
                    + New Prompt
                </Link>
            </div>

            {prompts.length === 0 ? (
                <div className="empty-state">
                    <p className="empty">No AI prompts found</p>
                    <Link href="/prompts/new" className="new-btn">Create First Prompt</Link>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Prompt</th>
                                <th>Context</th>
                                <th>Date Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                                {prompts.map((prompt) => (
                                <tr key={prompt.prompt_id} className="table-row">
                                    <td className="id-cell">#{prompt.prompt_id}</td>
                                    <td className="prompt-cell">
                                        <div className="prompt-text">
                                            {prompt.prompt_text?.substring(0, 100)}
                                            {prompt.prompt_text?.length > 100 ? '...' : ''}
                                        </div>
                                    </td>
                                    <td className="context-cell">
                                        {prompt.context ? (
                                            <span className="has-context">✓ Yes</span>
                                        ) : (
                                            <span className="no-context">-</span>
                                        )}
                                    </td>
                                    <td className="date-cell">
                                        {new Date(prompt.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            onClick={() => router.push(`/prompts/${prompt.prompt_id}`)}
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
                .prompt-cell {
                    max-width: 400px;
                }
                .prompt-text {
                    color: #cbd5e1;
                    line-height: 1.5;
                }
                .context-cell {
                    font-weight: 500;
                }
                .has-context {
                    color: #22c55e;
                }
                .no-context {
                    color: #64748b;
                }
                .date-cell {
                    color: #94a3b8;
                    font-weight: 500;
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

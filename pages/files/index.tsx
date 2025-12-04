import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface FileVersion {
    id: number;
    file_path: string;
    version_number: string;
    change_description?: string;
    created_at: string;
}

export default function FilesPage() {
    const router = useRouter();
    const [files, setFiles] = useState<FileVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const response = await fetch('/api/files');
            const data = await response.json();
            
            if (data.success) {
                setFiles(data.data || []);
            } else {
                setError(data.error || 'Failed to fetch files');
            }
        } catch (err) {
            setError('An error occurred while fetching files');
        } finally {
            setLoading(false);
        }
    };

    const getFileName = (path: string) => {
        return path.split('/').pop() || path;
    };

    if (loading) return <div className="container"><div className="loading">Loading files...</div></div>;
    if (error) return <div className="container"><div className="error">{error}</div></div>;

    return (
        <div className="container">
            <div className="header">
                <h1>📁 Files & Versions Dashboard</h1>
                <Link href="/files/new" className="new-btn">
                    + Add File Version
                </Link>
            </div>

            {files.length === 0 ? (
                <div className="empty-state">
                    <p className="empty">No file versions found</p>
                    <Link href="/files/new" className="new-btn">Add First File Version</Link>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>File Name</th>
                                <th>Path</th>
                                <th>Version</th>
                                <th>Changes</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                                {files.map((file) => (
                                <tr key={file.file_id} className="table-row">
                                    <td className="id-cell">#{file.file_id}</td>
                                    <td className="filename-cell">
                                        <div className="file-icon">📄</div>
                                        <strong>{getFileName(file.file_path)}</strong>
                                    </td>
                                    <td className="path-cell">
                                        <code>{file.file_path}</code>
                                    </td>
                                    <td className="version-cell">
                                        <span className="version-badge">v{file.version_number}</span>
                                    </td>
                                    <td className="changes-cell">
                                        {file.change_description?.substring(0, 60)}
                                        {file.change_description && file.change_description.length > 60 ? '...' : ''}
                                    </td>
                                    <td className="date-cell">
                                        {new Date(file.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            onClick={() => router.push(`/files/${file.file_id}`)}
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
                .filename-cell {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #ffffff;
                    font-weight: 600;
                }
                .file-icon {
                    font-size: 20px;
                }
                .path-cell code {
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    color: #94a3b8;
                    background: rgba(0, 0, 0, 0.3);
                    padding: 4px 8px;
                    border-radius: 4px;
                }
                .version-cell {
                    font-family: 'Courier New', monospace;
                }
                .version-badge {
                    background: rgba(0, 212, 255, 0.15);
                    color: #00d4ff;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 11px;
                    border: 1px solid rgba(0, 212, 255, 0.3);
                }
                .changes-cell {
                    max-width: 300px;
                    color: #94a3b8;
                    font-size: 13px;
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



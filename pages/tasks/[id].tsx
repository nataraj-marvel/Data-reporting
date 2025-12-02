// pages/tasks/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState, FormEvent } from 'react';
import Head from 'next/head';
import type { Task, User } from '@/types';

export default function TaskDetail() {
    const router = useRouter();
    const { id } = router.query as { id: string };
    const [task, setTask] = useState<Task | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    // Edit Form State
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editStatus, setEditStatus] = useState('');
    const [editPriority, setEditPriority] = useState('');
    const [editAssignee, setEditAssignee] = useState('');
    const [editDueDate, setEditDueDate] = useState('');

    useEffect(() => {
        if (!id) return;
        fetchTask();
        fetchUsers();
    }, [id]);

    const fetchTask = async () => {
        try {
            const res = await fetch(`/api/tasks/${id}`);
            const data = await res.json();
            if (data.success) {
                setTask(data.data);
                // Initialize edit state
                setEditTitle(data.data.title);
                setEditDescription(data.data.description || '');
                setEditStatus(data.data.status);
                setEditPriority(data.data.priority);
                setEditAssignee(data.data.assigned_to.toString());
                setEditDueDate(data.data.due_date ? data.data.due_date.split('T')[0] : '');
            } else {
                setError(data.error || 'Failed to load task');
            }
        } catch (e) {
            setError('Network error fetching task');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (e) {
            console.error('Failed to fetch users');
        }
    };

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        setSaveLoading(true);
        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    status: editStatus,
                    priority: editPriority,
                    assigned_to: parseInt(editAssignee),
                    due_date: editDueDate || null,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setTask(data.data);
                setIsEditing(false);
            } else {
                alert(data.error || 'Failed to update task');
            }
        } catch (e) {
            alert('Network error updating task');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                router.push('/tasks');
            } else {
                alert(data.error || 'Failed to delete task');
            }
        } catch (e) {
            alert('Network error deleting task');
        }
    };

    if (loading) return <div className="center">Loading task...</div>;
    if (error) return <div className="center error">{error}</div>;
    if (!task) return null;

    return (
        <>
            <Head>
                <title>Task #{task.id} – Nautilus Reporting</title>
            </Head>
            <div className="container">
                <div className="header">
                    <h1>Task #{task.id}</h1>
                    <div className="actions">
                        {!isEditing && (
                            <>
                                <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Task</button>
                                <button className="delete-btn" onClick={handleDelete}>Delete</button>
                            </>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <form onSubmit={handleSave} className="edit-form">
                        <div className="form-group">
                            <label>Title</label>
                            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={4} />
                        </div>
                        <div className="row">
                            <div className="form-group half">
                                <label>Status</label>
                                <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                            </div>
                            <div className="form-group half">
                                <label>Priority</label>
                                <select value={editPriority} onChange={e => setEditPriority(e.target.value)}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                        </div>
                        <div className="row">
                            <div className="form-group half">
                                <label>Assigned To</label>
                                <select value={editAssignee} onChange={e => setEditAssignee(e.target.value)}>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.full_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group half">
                                <label>Due Date</label>
                                <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                            <button type="submit" className="save-btn" disabled={saveLoading}>
                                {saveLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="task-view">
                        <div className="status-bar">
                            <span className={`badge status-${task.status}`}>{task.status.replace('_', ' ')}</span>
                            <span className={`badge priority-${task.priority}`}>{task.priority} Priority</span>
                        </div>
                        <h2>{task.title}</h2>
                        <div className="meta">
                            <p><strong>Assigned To:</strong> {task.assignee_name}</p>
                            <p><strong>Assigned By:</strong> {task.assigner_name}</p>
                            <p><strong>Due Date:</strong> {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'None'}</p>
                            <p><strong>Created:</strong> {new Date(task.created_at).toLocaleString()}</p>
                        </div>
                        <div className="description">
                            <h3>Description</h3>
                            <p>{task.description || 'No description provided.'}</p>
                        </div>
                    </div>
                )}

                <button className="back-btn" onClick={() => router.push('/tasks')}>← Back to Tasks</button>
            </div>

            <style jsx>{`
        .container { max-width: 800px; margin: 40px auto; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); font-family: 'Inter', sans-serif; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
        h1 { margin: 0; color: #333; }
        .center { display: flex; justify-content: center; align-items: center; height: 80vh; }
        .error { color: #d32f2f; }
        
        .actions { display: flex; gap: 10px; }
        .edit-btn { background: #0066ff; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
        .delete-btn { background: #ffebee; color: #c62828; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
        
        .status-bar { display: flex; gap: 10px; margin-bottom: 15px; }
        .badge { padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
        .status-pending { background: #e0e0e0; color: #616161; }
        .status-in_progress { background: #e3f2fd; color: #1976d2; }
        .status-completed { background: #e8f5e9; color: #2e7d32; }
        .status-blocked { background: #ffebee; color: #c62828; }
        .priority-critical { background: #ffebee; color: #c62828; }
        .priority-high { background: #fff3e0; color: #ef6c00; }
        .priority-medium { background: #fffde7; color: #fbc02d; }
        .priority-low { background: #e8f5e9; color: #2e7d32; }

        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .meta p { margin: 5px 0; color: #555; }
        .description { line-height: 1.6; color: #444; }
        
        .edit-form { display: flex; flex-direction: column; gap: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; }
        .row { display: flex; gap: 15px; }
        .half { flex: 1; }
        .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
        .save-btn { background: #2e7d32; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
        .cancel-btn { background: #f5f5f5; color: #333; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }

        .back-btn { margin-top: 30px; background: transparent; color: #666; border: 1px solid #ddd; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
        .back-btn:hover { background: #f5f5f5; }
      `}</style>
        </>
    );
}

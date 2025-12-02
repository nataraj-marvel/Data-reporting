// pages/tasks/index.tsx
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import type { Task, User } from '@/types';

export default function TasksDashboard() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Filter states
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');

    // New Task Form State
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskAssignee, setNewTaskAssignee] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('medium');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [createLoading, setCreateLoading] = useState(false);

    useEffect(() => {
        fetchTasks();
        fetchUsers();
    }, [filterStatus, filterPriority]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filterStatus) queryParams.append('status', filterStatus);
            if (filterPriority) queryParams.append('priority', filterPriority);

            const res = await fetch(`/api/tasks?${queryParams.toString()}`);
            const data = await res.json();
            if (data.success) {
                setTasks(data.data);
            } else {
                setError(data.error || 'Failed to load tasks');
            }
        } catch (e) {
            setError('Network error fetching tasks');
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

    const handleCreateTask = async (e: FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTaskTitle,
                    description: newTaskDescription,
                    assigned_to: parseInt(newTaskAssignee),
                    priority: newTaskPriority,
                    due_date: newTaskDueDate || null,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setShowCreateModal(false);
                setNewTaskTitle('');
                setNewTaskDescription('');
                setNewTaskAssignee('');
                setNewTaskDueDate('');
                fetchTasks(); // Refresh list
            } else {
                alert(data.error || 'Failed to create task');
            }
        } catch (e) {
            alert('Network error creating task');
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Tasks – Nautilus Reporting</title>
            </Head>
            <div className="container">
                <div className="header">
                    <h1>Tasks Dashboard</h1>
                    <button className="create-btn" onClick={() => setShowCreateModal(true)}>
                        + Create Task
                    </button>
                </div>

                <div className="filters">
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                    </select>
                    <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                        <option value="">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>

                {loading ? (
                    <p className="loading">Loading tasks...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : tasks.length === 0 ? (
                    <p className="empty">No tasks found.</p>
                ) : (
                    <div className="task-grid">
                        {tasks.map(task => (
                            <div key={task.id} className={`task-card priority-${task.priority}`}>
                                <div className="task-header">
                                    <span className={`badge status-${task.status}`}>{task.status.replace('_', ' ')}</span>
                                    <span className={`priority-dot ${task.priority}`} title={`Priority: ${task.priority}`} />
                                </div>
                                <h3>{task.title}</h3>
                                <p className="assignee">Assigned to: <strong>{task.assignee_name}</strong></p>
                                <p className="due-date">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</p>
                                <div className="actions">
                                    <button onClick={() => router.push(`/tasks/${task.id}`)}>View Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showCreateModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>Create New Task</h2>
                            <form onSubmit={handleCreateTask}>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        value={newTaskTitle}
                                        onChange={e => setNewTaskTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={newTaskDescription}
                                        onChange={e => setNewTaskDescription(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Assign To</label>
                                    <select
                                        value={newTaskAssignee}
                                        onChange={e => setNewTaskAssignee(e.target.value)}
                                        required
                                    >
                                        <option value="">Select User</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.full_name} ({u.username})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="row">
                                    <div className="form-group half">
                                        <label>Priority</label>
                                        <select value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)}>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                    <div className="form-group half">
                                        <label>Due Date</label>
                                        <input
                                            type="date"
                                            value={newTaskDueDate}
                                            onChange={e => setNewTaskDueDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                    <button type="submit" className="submit-btn" disabled={createLoading}>
                                        {createLoading ? 'Creating...' : 'Create Task'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; font-family: 'Inter', sans-serif; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        h1 { color: #333; margin: 0; }
        .create-btn { background: #0066ff; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; }
        .create-btn:hover { background: #0052cc; }
        
        .filters { display: flex; gap: 10px; margin-bottom: 20px; }
        select { padding: 8px; border-radius: 6px; border: 1px solid #ddd; }

        .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .task-card { background: white; border-radius: 8px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #eee; transition: transform 0.2s; }
        .task-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .task-card.priority-critical { border-left: 4px solid #d32f2f; }
        .task-card.priority-high { border-left: 4px solid #f57c00; }
        .task-card.priority-medium { border-left: 4px solid #fbc02d; }
        .task-card.priority-low { border-left: 4px solid #388e3c; }

        .task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .badge { padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; }
        .status-pending { background: #e0e0e0; color: #616161; }
        .status-in_progress { background: #e3f2fd; color: #1976d2; }
        .status-completed { background: #e8f5e9; color: #2e7d32; }
        .status-blocked { background: #ffebee; color: #c62828; }

        h3 { margin: 0 0 10px 0; font-size: 1.1rem; color: #222; }
        .assignee, .due-date { margin: 5px 0; font-size: 0.9rem; color: #666; }
        .actions { margin-top: 15px; text-align: right; }
        .actions button { background: transparent; color: #0066ff; border: 1px solid #0066ff; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
        .actions button:hover { background: #f0f7ff; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: white; padding: 30px; border-radius: 12px; width: 100%; max-width: 500px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
        .modal h2 { margin-top: 0; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 500; color: #444; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; }
        .row { display: flex; gap: 15px; }
        .half { flex: 1; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        .cancel-btn { background: #f5f5f5; color: #333; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
        .submit-btn { background: #0066ff; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>
        </>
    );
}

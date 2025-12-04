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

                {!loading && !error && (
                    <div className="stats-cards">
                        <div className="stat-card">
                            <div className="stat-value">{tasks.length}</div>
                            <div className="stat-label">Total Tasks</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{tasks.filter(t => t.status === 'pending').length}</div>
                            <div className="stat-label">Pending</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{tasks.filter(t => t.status === 'in_progress').length}</div>
                            <div className="stat-label">In Progress</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{tasks.filter(t => t.status === 'completed').length}</div>
                            <div className="stat-label">Completed</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{tasks.filter(t => t.priority === 'critical' || t.priority === 'high').length}</div>
                            <div className="stat-label">High Priority</div>
                        </div>
                    </div>
                )}

                <div className="filters">
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                        <option value="review">Review</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                        <option value="">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                    <button className="refresh-btn" onClick={fetchTasks}>🔄 Refresh</button>
                </div>

                {loading ? (
                    <p className="loading">Loading tasks...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : tasks.length === 0 ? (
                    <p className="empty">No tasks found.</p>
                ) : (
                    <div className="table-container">
                        <table className="tasks-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Assigned To</th>
                                    <th>Type</th>
                                    <th>Due Date</th>
                                    <th>Progress</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => (
                                    <tr key={task.task_id} className="task-row">
                                        <td className="id-cell">#{task.task_id}</td>
                                        <td className="title-cell">
                                            <div className="title-content">
                                                <strong>{task.title}</strong>
                                                {task.description && (
                                                    <span className="description">{task.description.substring(0, 50)}{task.description.length > 50 ? '...' : ''}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge status-${task.status}`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge priority-${task.priority}`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td className="assignee-cell">
                                            {task.assignee_name || 'Unassigned'}
                                        </td>
                                        <td className="type-cell">
                                            {(task as any).task_type || 'N/A'}
                                        </td>
                                        <td className="date-cell">
                                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="progress-cell">
                                            {(task as any).completion_percentage !== undefined ? (
                                                <div className="progress-bar">
                                                    <div 
                                                        className="progress-fill" 
                                                        style={{ width: `${(task as any).completion_percentage}%` }}
                                                    />
                                                    <span className="progress-text">{(task as any).completion_percentage}%</span>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="date-cell">
                                            {new Date(task.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="actions-cell">
                                            <button 
                                                className="view-btn"
                                                    onClick={() => router.push(`/tasks/${task.task_id}`)}
                                            >
                                                View
                                            </button>
                                            <button 
                                                className="edit-btn"
                                                    onClick={() => router.push(`/tasks/${task.task_id}`)}
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
                                            <option key={u.user_id} value={u.user_id}>{u.full_name} ({u.username})</option>
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
        .container { 
          max-width: 1400px; 
          margin: 40px auto; 
          padding: 30px; 
          font-family: 'Inter', sans-serif; 
          background: rgba(15, 41, 66, 0.6); 
          backdrop-filter: blur(20px); 
          border-radius: 16px; 
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 80px rgba(0, 212, 255, 0.1); 
          border: 1px solid rgba(0, 212, 255, 0.3);
        }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
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
        .create-btn { 
          background: linear-gradient(135deg, #00d4ff 0%, #06b6d4 100%); 
          color: #0a1929; 
          border: none; 
          padding: 12px 28px; 
          border-radius: 8px; 
          cursor: pointer; 
          font-weight: 700; 
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
        }
        .create-btn:hover { 
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); 
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0, 212, 255, 0.5);
        }
        
        /* Stats Cards */
        .stats-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px; }
        .stat-card { 
          background: rgba(15, 41, 66, 0.4); 
          backdrop-filter: blur(10px);
          padding: 24px; 
          border-radius: 12px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.3); 
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

        .filters { display: flex; gap: 10px; margin-bottom: 20px; }
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

        .loading, .error, .empty { text-align: center; padding: 40px; font-size: 16px; }
        .loading { color: #94a3b8; }
        .error { color: #f87171; font-weight: 500; }

        /* Table Styles */
        .table-container { 
          overflow-x: auto; 
          background: rgba(15, 41, 66, 0.4); 
          backdrop-filter: blur(10px);
          border-radius: 12px; 
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); 
          border: 1px solid rgba(0, 212, 255, 0.2);
        }
        .tasks-table { width: 100%; border-collapse: collapse; }
        .tasks-table thead { 
          background: rgba(0, 212, 255, 0.1); 
          position: relative;
        }
        .tasks-table thead::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00d4ff, transparent);
        }
        .tasks-table th { 
          padding: 18px 16px; 
          text-align: left; 
          font-weight: 700; 
          color: #00d4ff; 
          border-bottom: none; 
          font-size: 11px; 
          text-transform: uppercase; 
          letter-spacing: 1px; 
        }
        .tasks-table td { 
          padding: 18px 16px; 
          border-bottom: 1px solid rgba(0, 212, 255, 0.08); 
          font-size: 14px; 
          color: #e3f2fd;
        }
        .tasks-table tbody tr:hover { 
          background: rgba(0, 212, 255, 0.08); 
          box-shadow: inset 3px 0 0 #00d4ff;
        }

        .id-cell { 
          color: #00d4ff; 
          font-weight: 700; 
          width: 70px;
          font-family: 'Courier New', monospace;
        }
        .title-cell { max-width: 350px; }
        .title-content { display: flex; flex-direction: column; gap: 4px; }
        .title-content strong { color: #ffffff; font-weight: 600; }
        .description { color: #94a3b8; font-size: 12px; }
        .assignee-cell { color: #e3f2fd; font-weight: 500; }
        .type-cell { color: #94a3b8; text-transform: capitalize; font-weight: 500; }
        .date-cell { color: #94a3b8; white-space: nowrap; font-weight: 500; }

        /* Badge Styles */
        .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; text-transform: uppercase; font-weight: 600; white-space: nowrap; }
        
        /* Status Badges */
        .status-pending { background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3); }
        .status-in_progress { background: rgba(0, 212, 255, 0.15); color: #00d4ff; border: 1px solid rgba(0, 212, 255, 0.3); }
        .status-completed { background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); }
        .status-blocked { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
        .status-review { background: rgba(168, 85, 247, 0.15); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3); }
        .status-cancelled { background: rgba(100, 116, 139, 0.15); color: #64748b; border: 1px solid rgba(100, 116, 139, 0.3); }

        /* Priority Badges */
        .priority-low { background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); }
        .priority-medium { background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3); }
        .priority-high { background: rgba(249, 115, 22, 0.15); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.3); }
        .priority-critical { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }

        /* Progress Bar */
        .progress-cell { min-width: 110px; }
        .progress-bar { 
          position: relative; 
          width: 100%; 
          height: 24px; 
          background: rgba(15, 41, 66, 0.6); 
          border-radius: 12px; 
          overflow: hidden; 
          border: 1px solid rgba(0, 212, 255, 0.2);
        }
        .progress-fill { 
          position: absolute; 
          left: 0; 
          top: 0; 
          height: 100%; 
          background: linear-gradient(90deg, #00d4ff, #06b6d4, #0891b2); 
          transition: width 0.5s ease;
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        }
        .progress-text { 
          position: absolute; 
          left: 50%; 
          top: 50%; 
          transform: translate(-50%, -50%); 
          font-size: 11px; 
          font-weight: 700; 
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          font-family: 'Courier New', monospace;
        }

        /* Action Buttons */
        .actions-cell { white-space: nowrap; }
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

        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: white; padding: 30px; border-radius: 12px; width: 100%; max-width: 500px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
        .modal h2 { margin-top: 0; color: #333; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 500; color: #444; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; }
        .form-group textarea { resize: vertical; font-family: inherit; }
        .row { display: flex; gap: 15px; }
        .half { flex: 1; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        .cancel-btn { background: #f5f5f5; color: #333; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; }
        .cancel-btn:hover { background: #e0e0e0; }
        .submit-btn { background: #0066ff; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; }
        .submit-btn:hover { background: #0052cc; }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        @media (max-width: 1200px) {
          .table-container { font-size: 13px; }
          .tasks-table th, .tasks-table td { padding: 8px; }
        }
      `}</style>
        </>
    );
}

// pages/reports/new.tsx
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import type { Task } from '@/types';

/**
 * Premium New Report page – accessible after login via the "New Report" button.
 * Submits a POST request to `/api/reports` to create a new daily/hourly report.
 */
export default function NewReport() {
    const router = useRouter();
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [taskId, setTaskId] = useState('');
    const [workDescription, setWorkDescription] = useState('');
    const [hoursWorked, setHoursWorked] = useState('');
    const [tasksCompleted, setTasksCompleted] = useState('');
    const [blockers, setBlockers] = useState('');
    const [notes, setNotes] = useState('');

    const [tasks, setTasks] = useState<Task[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/tasks?status=in_progress'); // Or fetch all?
            const data = await res.json();
            if (data.success) {
                setTasks(data.data);
            }
        } catch (e) {
            console.error('Failed to fetch tasks');
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    report_date: reportDate,
                    start_time: startTime || null,
                    end_time: endTime || null,
                    task_id: taskId ? parseInt(taskId) : null,
                    work_description: workDescription,
                    hours_worked: parseFloat(hoursWorked),
                    tasks_completed: tasksCompleted,
                    blockers,
                    notes,
                    status: 'draft',
                }),
            });
            const data = await response.json();
            if (data.success) {
                setSuccess('Report created successfully! Redirecting…');
                setTimeout(() => router.push('/reports'), 1500);
            } else {
                setError(data.error || 'Failed to create report');
            }
        } catch (err) {
            setError('Network error – please try again');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>New Report – Nautilus Reporting</title>
                <meta
                    name="description"
                    content="Create a new daily/hourly report for the Nautilus Reporting system."
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <div className="container">
                <h1>New Activity Report</h1>
                <form onSubmit={handleSubmit} className="form">
                    <div className="row">
                        <div className="form-group half">
                            <label>Date</label>
                            <input
                                type="date"
                                value={reportDate}
                                onChange={e => setReportDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group half">
                            <label>Related Task (Optional)</label>
                            <select value={taskId} onChange={e => setTaskId(e.target.value)}>
                                <option value="">-- Select Task --</option>
                                {tasks.map(t => (
                                    <option key={t.id} value={t.id}>{t.title} ({t.status})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="row">
                        <div className="form-group half">
                            <label>Start Time</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                            />
                        </div>
                        <div className="form-group half">
                            <label>End Time</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Work Description</label>
                        <textarea
                            rows={4}
                            placeholder="Describe what you worked on..."
                            value={workDescription}
                            onChange={e => setWorkDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Hours Worked</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="e.g. 2.5"
                            value={hoursWorked}
                            onChange={e => setHoursWorked(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Tasks Completed / Progress</label>
                        <textarea
                            rows={3}
                            placeholder="List specific items completed..."
                            value={tasksCompleted}
                            onChange={e => setTasksCompleted(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Blockers / Issues Faced</label>
                        <textarea
                            rows={2}
                            placeholder="Any issues or blockers encountered?"
                            value={blockers}
                            onChange={e => setBlockers(e.target.value)}
                            className={blockers ? 'has-content' : ''}
                        />
                    </div>

                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            rows={2}
                            placeholder="Additional notes..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                    </div>

                    {error && <p className="error">{error}</p>}
                    {success && <p className="success">{success}</p>}

                    <div className="actions">
                        <button type="button" className="cancel-btn" onClick={() => router.push('/reports')}>Cancel</button>
                        <button type="submit" disabled={loading} className="submit-btn">
                            {loading ? 'Saving…' : 'Create Report'}
                        </button>
                    </div>
                </form>
            </div>
            <style jsx>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #f5f7ff, #e8ecff); }
        .container { max-width: 800px; margin: 40px auto; padding: 30px; background: rgba(255,255,255,0.93); backdrop-filter: blur(12px); border-radius: 12px; box-shadow: 0 12px 30px rgba(0,0,0,0.07); }
        h1 { text-align: center; margin-bottom: 24px; color: #222; font-weight: 600; }
        .form { display: flex; flex-direction: column; gap: 20px; }
        .row { display: flex; gap: 20px; }
        .half { flex: 1; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 500; color: #444; font-size: 0.95rem; }
        input, textarea, select { width: 100%; padding: 12px 16px; border: 1px solid #ccc; border-radius: 8px; font-size: 0.95rem; transition: border-color 0.2s; background: white; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: #0066ff; }
        
        .actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 10px; }
        .submit-btn { background: #0066ff; color: #fff; border: none; border-radius: 8px; padding: 12px 24px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .submit-btn:hover { background: #0052cc; }
        .cancel-btn { background: #f5f5f5; color: #333; border: none; border-radius: 8px; padding: 12px 24px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .cancel-btn:hover { background: #e0e0e0; }

        .error { color: #e53935; margin-top: 8px; text-align: center; }
        .success { color: #43a047; margin-top: 8px; text-align: center; }
      `}</style>
        </>
    );
}

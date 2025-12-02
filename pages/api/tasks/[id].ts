import type { NextApiRequest, NextApiResponse } from 'next';
import { queryOne, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Task, ApiResponse, AuthUser } from '@/types';

async function handleGet(
    res: NextApiResponse<ApiResponse>,
    user: AuthUser,
    taskId: number
) {
    try {
        const task = await queryOne<Task>(
            `SELECT t.*, 
              u1.full_name as assignee_name, 
              u2.full_name as assigner_name 
       FROM tasks t
       LEFT JOIN users u1 ON t.assigned_to = u1.id
       LEFT JOIN users u2 ON t.assigned_by = u2.id
       WHERE t.id = ?`,
            [taskId]
        );

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // Access control
        if (user.role === 'programmer' && task.assigned_to !== user.id && task.assigned_by !== user.id) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        return res.status(200).json({ success: true, data: task });
    } catch (error) {
        console.error('Get task error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

async function handlePut(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse>,
    user: AuthUser,
    taskId: number
) {
    try {
        const task = await queryOne<Task>('SELECT * FROM tasks WHERE id = ?', [taskId]);
        if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

        if (user.role === 'programmer' && task.assigned_to !== user.id && task.assigned_by !== user.id) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        const { title, description, status, priority, due_date, assigned_to } = req.body;
        const updates: string[] = [];
        const params: any[] = [];

        // Programmers can usually only update status
        if (user.role === 'programmer') {
            if (status) {
                updates.push('status = ?');
                params.push(status);
            }
            // Maybe allow updating description if they created it?
            if (task.assigned_by === user.id) {
                if (title) { updates.push('title = ?'); params.push(title); }
                if (description) { updates.push('description = ?'); params.push(description); }
                if (priority) { updates.push('priority = ?'); params.push(priority); }
                if (due_date) { updates.push('due_date = ?'); params.push(due_date); }
            }
        } else {
            // Admin can update everything
            if (title) { updates.push('title = ?'); params.push(title); }
            if (description) { updates.push('description = ?'); params.push(description); }
            if (status) { updates.push('status = ?'); params.push(status); }
            if (priority) { updates.push('priority = ?'); params.push(priority); }
            if (due_date) { updates.push('due_date = ?'); params.push(due_date); }
            if (assigned_to) { updates.push('assigned_to = ?'); params.push(assigned_to); }
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, error: 'No valid updates provided' });
        }

        params.push(taskId);
        await execute(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, params);

        const updatedTask = await queryOne<Task>('SELECT * FROM tasks WHERE id = ?', [taskId]);
        return res.status(200).json({ success: true, data: updatedTask, message: 'Task updated' });

    } catch (error) {
        console.error('Update task error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

async function handleDelete(
    res: NextApiResponse<ApiResponse>,
    user: AuthUser,
    taskId: number
) {
    try {
        const task = await queryOne<Task>('SELECT * FROM tasks WHERE id = ?', [taskId]);
        if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

        if (user.role !== 'admin' && task.assigned_by !== user.id) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        await execute('DELETE FROM tasks WHERE id = ?', [taskId]);
        return res.status(200).json({ success: true, message: 'Task deleted' });
    } catch (error) {
        console.error('Delete task error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse>
) {
    const user = (req as any).user as AuthUser;
    const { id } = req.query;
    const taskId = parseInt(id as string);

    if (req.method === 'GET') {
        return handleGet(res, user, taskId);
    } else if (req.method === 'PUT') {
        return handlePut(req, res, user, taskId);
    } else if (req.method === 'DELETE') {
        return handleDelete(res, user, taskId);
    } else {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}

export default requireAuth(handler);

import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Task, ApiResponse, AuthUser } from '@/types';

async function handleGet(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse>,
    user: AuthUser
) {
    try {
        const { status, priority, assigned_to } = req.query;

        let sql = `
      SELECT t.*, 
             u1.full_name as assignee_name, 
             u2.full_name as assigner_name 
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.assigned_by = u2.id
      WHERE 1=1
    `;
        const params: any[] = [];

        // Role-based filtering
        if (user.role === 'programmer') {
            // Programmers see tasks assigned TO them or created BY them
            sql += ' AND (t.assigned_to = ? OR t.assigned_by = ?)';
            params.push(user.id, user.id);
        }

        if (status) {
            sql += ' AND t.status = ?';
            params.push(status);
        }
        if (priority) {
            sql += ' AND t.priority = ?';
            params.push(priority);
        }
        // Admin can filter by assignee
        if (user.role === 'admin' && assigned_to) {
            sql += ' AND t.assigned_to = ?';
            params.push(assigned_to);
        }

        sql += ' ORDER BY t.created_at DESC';

        const tasks = await query<Task>(sql, params);

        return res.status(200).json({
            success: true,
            data: tasks,
        });
    } catch (error) {
        console.error('Get tasks error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

async function handlePost(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse>,
    user: AuthUser
) {
    try {
        const { title, description, assigned_to, priority, due_date } = req.body;

        if (!title || !assigned_to) {
            return res.status(400).json({ success: false, error: 'Title and Assignee are required' });
        }

        // Only admin can assign to others? Or anyone? Let's allow anyone to create tasks for now, 
        // but usually admins assign. Let's stick to: Admin assigns, or User assigns to self.
        if (user.role !== 'admin' && assigned_to !== user.id) {
            return res.status(403).json({ success: false, error: 'You can only assign tasks to yourself' });
        }

        const result = await execute(
            `INSERT INTO tasks (title, description, assigned_to, assigned_by, priority, due_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [
                title,
                description || '',
                assigned_to,
                user.id,
                priority || 'medium',
                due_date || null
            ]
        );

        const newTask = await query<Task>(
            'SELECT * FROM tasks WHERE id = ?',
            [result.insertId]
        );

        return res.status(201).json({
            success: true,
            data: newTask[0],
            message: 'Task created successfully'
        });
    } catch (error) {
        console.error('Create task error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse>
) {
    const user = (req as any).user as AuthUser;

    if (req.method === 'GET') {
        return handleGet(req, res, user);
    } else if (req.method === 'POST') {
        return handlePost(req, res, user);
    } else {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}

export default requireAuth(handler);

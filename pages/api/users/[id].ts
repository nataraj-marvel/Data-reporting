import type { NextApiRequest, NextApiResponse } from 'next';
import { queryOne, execute } from '@/lib/db';
import { requireAdmin, hashPassword } from '@/lib/auth';
import { User, UserUpdate, ApiResponse } from '@/types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ success: false, error: 'Invalid user ID' });
  }

  const userId = parseInt(id);

  if (req.method === 'GET') {
    return handleGet(res, userId);
  } else if (req.method === 'PUT') {
    return handlePut(req, res, userId);
  } else if (req.method === 'DELETE') {
    return handleDelete(res, userId);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function handleGet(
  res: NextApiResponse<ApiResponse>,
  userId: number
) {
  try {
    const user = await queryOne<User>(
      'SELECT user_id, username, role, full_name, email, created_at, updated_at, last_login, is_active FROM users WHERE user_id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  userId: number
) {
  try {
    const user = await queryOne<User>(
      'SELECT user_id FROM users WHERE user_id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const data: UserUpdate & { password?: string } = req.body;
    const updates: string[] = [];
    const params: any[] = [];

    if (data.full_name !== undefined) {
      updates.push('full_name = ?');
      params.push(data.full_name);
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      params.push(data.email);
    }
    if (data.role !== undefined) {
      updates.push('role = ?');
      params.push(data.role);
    }
    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(data.is_active ? 1 : 0);
    }
    if (data.password) {
      const password_hash = await hashPassword(data.password);
      updates.push('password_hash = ?');
      params.push(password_hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    params.push(userId);
    await execute(`UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`, params);

    const updatedUser = await queryOne<User>(
      'SELECT user_id, username, role, full_name, email, created_at, updated_at, last_login, is_active FROM users WHERE user_id = ?',
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleDelete(
  res: NextApiResponse<ApiResponse>,
  userId: number
) {
  try {
    const user = await queryOne<User>(
      'SELECT user_id FROM users WHERE user_id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await execute('DELETE FROM users WHERE user_id = ?', [userId]);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export default requireAdmin(handler);
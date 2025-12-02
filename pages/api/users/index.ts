import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';
import { User, UserCreate, ApiResponse } from '@/types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const { role, is_active } = req.query;

    let sql = 'SELECT id, username, role, full_name, email, created_at, updated_at, last_login, is_active FROM users WHERE 1=1';
    const params: any[] = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    sql += ' ORDER BY created_at DESC';

    const users = await query<User>(sql, params);

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const data: UserCreate = req.body;

    if (!data.username || !data.password || !data.full_name || !data.email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: username, password, full_name, email',
      });
    }

    // Check if username or email already exists
    const existing = await query<User>(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [data.username, data.email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Username or email already exists',
      });
    }

    // Hash password
    const password_hash = await hashPassword(data.password);

    const result = await execute(
      `INSERT INTO users (username, password_hash, role, full_name, email)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.username,
        password_hash,
        data.role || 'programmer',
        data.full_name,
        data.email,
      ]
    );

    const newUser = await query<User>(
      'SELECT id, username, role, full_name, email, created_at, updated_at, last_login, is_active FROM users WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      data: newUser[0],
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

export default requireAdmin(handler);
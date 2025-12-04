import type { NextApiRequest, NextApiResponse } from 'next';
import { queryOne } from '@/lib/db';
import {
  verifyPassword,
  generateToken,
  setAuthCookie,
  createSession,
} from '@/lib/auth';
import { User, LoginRequest, ApiResponse } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { username, password }: LoginRequest = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required',
      });
    }

    // Find user
    console.log('Login attempt for username:', username);
    const user = await queryOne<any>(
      'SELECT user_id, username, password_hash, role, full_name, email, is_active FROM users WHERE username = ? AND is_active = TRUE',
      [username]
    );

    if (!user) {
      console.log('User not found or inactive:', username);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    console.log('Raw user object from DB:', JSON.stringify(user));
    const userId = user.user_id;
    console.log('User found:', { user_id: userId, username: user.username, role: user.role });

    // Verify password
    console.log('Password hash from DB:', user.password_hash ? 'exists' : 'missing');
    console.log('Password to verify:', password);
    const isValid = await verifyPassword(password, user.password_hash!);
    console.log('Password verification result:', isValid);
    
    if (!isValid) {
      console.log('Password verification failed - returning 401');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }
    
    console.log('Password verified successfully!');

    // Generate token
    const token = generateToken({
      user_id: userId,
      username: user.username,
      role: user.role,
      full_name: user.full_name,
      email: user.email,
    });

    // Create session
    await createSession(userId, token, req);

    // Set cookie
    setAuthCookie(res, token);

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie';
import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne, execute } from './db';
import { User, Session, AuthUser } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d'; // 7 days
const COOKIE_NAME = 'auth_token';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      user_id: user.user_id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function setAuthCookie(res: NextApiResponse, token: string): void {
  const cookie = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  res.setHeader('Set-Cookie', cookie);
}

export function clearAuthCookie(res: NextApiResponse): void {
  const cookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  res.setHeader('Set-Cookie', cookie);
}

export function getTokenFromRequest(req: NextApiRequest): string | null {
  const cookies = parse(req.headers.cookie || '');
  return cookies[COOKIE_NAME] || null;
}

export async function authenticateRequest(
  req: NextApiRequest
): Promise<AuthUser | null> {
  const token = getTokenFromRequest(req);
  if (!token) {
    return null;
  }

  const user = verifyToken(token);
  if (!user) {
    return null;
  }

  // Verify session exists in database
  const session = await queryOne<Session>(
    'SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()',
    [token]
  );

  if (!session) {
    return null;
  }

  return user;
}

export async function createSession(
  userId: number,
  token: string,
  req: NextApiRequest
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await execute(
    `INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userId,
      token,
      expiresAt,
      req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
      req.headers['user-agent'] || null,
    ]
  );

  // Update last login
  await execute('UPDATE users SET last_login = NOW() WHERE user_id = ?', [userId]);
}

export async function deleteSession(token: string): Promise<void> {
  await execute('DELETE FROM sessions WHERE token = ?', [token]);
}

export async function deleteAllUserSessions(userId: number): Promise<void> {
  await execute('DELETE FROM sessions WHERE user_id = ?', [userId]);
}

export async function cleanupExpiredSessions(): Promise<void> {
  await execute('DELETE FROM sessions WHERE expires_at < NOW()');
}

export function requireAuth(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = await authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    (req as any).user = user;
    return handler(req, res);
  };
}

export function requireAdmin(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = await authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    (req as any).user = user;
    return handler(req, res);
  };
}

// Alias for consistency with v2.0 API endpoints
export const verifyAuth = authenticateRequest;
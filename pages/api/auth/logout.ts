import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getTokenFromRequest,
  deleteSession,
  clearAuthCookie,
} from '@/lib/auth';
import { ApiResponse } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const token = getTokenFromRequest(req);
    
    if (token) {
      await deleteSession(token);
    }

    clearAuthCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
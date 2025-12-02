// pages/api/users/public-create.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { execute } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { UserCreate, ApiResponse } from '@/types';

/**
 * Public endpoint to create a new user without authentication.
 * Intended for initial admin/user provisioning.
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const data: UserCreate = req.body;

    // Basic validation
    if (!data.username || !data.password || !data.full_name || !data.email) {
        return res
            .status(400)
            .json({ success: false, error: 'Missing required fields' });
    }

    try {
        // Hash the password using the same bcrypt routine as the rest of the app
        const passwordHash = await hashPassword(data.password);

        // Insert user – role defaults to 'programmer' if not supplied
        const role = data.role || 'programmer';
        await execute(
            `INSERT INTO users (username, password_hash, role, full_name, email)
       VALUES (?, ?, ?, ?, ?)`,
            [data.username, passwordHash, role, data.full_name, data.email]
        );

        return res
            .status(201)
            .json({ success: true, message: 'User created successfully' });
    } catch (error) {
        console.error('Public user creation error:', error);
        return res
            .status(500)
            .json({ success: false, error: 'Internal server error' });
    }
}

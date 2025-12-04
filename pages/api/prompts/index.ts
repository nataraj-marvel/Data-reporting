// pages/api/prompts/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '../../../lib/db';
import { verifyAuth } from '../../../lib/auth';
import type { AIPrompt, AIPromptCreate, ApiResponse, PromptFilters } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<AIPrompt | AIPrompt[]>>
) {
  try {
    // Verify authentication
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      return await handleGet(req, res, user);
    } else if (req.method === 'POST') {
      return await handlePost(req, res, user);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('AI Prompts API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<AIPrompt[]>>,
  user: any
) {
  const {
    user_id,
    report_id,
    category,
    ai_model,
    start_date,
    end_date,
    search,
    min_rating,
    page = '1',
    limit = '20'
  } = req.query as Partial<PromptFilters> & { page?: string; limit?: string };

  // Build WHERE clause
  const conditions: string[] = [];
  const values: any[] = [];

  // Non-admin users can only see their own prompts
  if (user.role !== 'admin') {
    conditions.push('ap.user_id = ?');
    values.push(user.id);
  } else if (user_id) {
    conditions.push('ap.user_id = ?');
    values.push(user_id);
  }

  if (report_id) {
    conditions.push('ap.report_id = ?');
    values.push(report_id);
  }

  if (category) {
    conditions.push('ap.category = ?');
    values.push(category);
  }

  if (ai_model) {
    conditions.push('ap.ai_model = ?');
    values.push(ai_model);
  }

  if (start_date) {
    conditions.push('DATE(ap.created_at) >= ?');
    values.push(start_date);
  }

  if (end_date) {
    conditions.push('DATE(ap.created_at) <= ?');
    values.push(end_date);
  }

  if (search) {
    conditions.push('(ap.prompt_text LIKE ? OR ap.response_text LIKE ?)');
    const searchPattern = `%${search}%`;
    values.push(searchPattern, searchPattern);
  }

  if (min_rating) {
    conditions.push('ap.effectiveness_rating >= ?');
    values.push(min_rating);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM ai_prompts ap ${whereClause}`,
    values
  );
  const total = countResult[0]?.total || 0;

  // Get paginated results
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  values.push(limitNum, offset);

  const prompts = await query(
    `
    SELECT 
      ap.*,
      u.username,
      u.full_name,
      dr.report_date,
      (SELECT COUNT(*) FROM prompt_files pf WHERE pf.prompt_id = ap.prompt_id) as files_affected_count
    FROM ai_prompts ap
    LEFT JOIN users u ON ap.user_id = u.user_id
    LEFT JOIN daily_reports dr ON ap.report_id = dr.report_id
    ${whereClause}
    ORDER BY ap.created_at DESC
    LIMIT ? OFFSET ?
    `,
    values
  );

  return res.status(200).json({
    success: true,
    data: prompts,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  });
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<AIPrompt>>,
  user: any
) {
  const {
    prompt_text,
    response_text,
    ai_model = 'unknown',
    context_data,
    category = 'other',
    effectiveness_rating,
    tokens_used = 0,
    report_id,
    file_paths
  } = req.body as AIPromptCreate;

  // Validation
  if (!prompt_text || prompt_text.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Prompt text is required'
    });
  }

  // Insert prompt
  const result = await execute(
    `
    INSERT INTO ai_prompts (
      user_id, report_id, prompt_text, response_text, ai_model,
      context_data, category, effectiveness_rating, tokens_used
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      user.id,
      report_id || null,
      prompt_text,
      response_text || null,
      ai_model,
      context_data ? JSON.stringify(context_data) : null,
      category,
      effectiveness_rating || null,
      tokens_used
    ]
  );

  const promptId = result.insertId;

  // Link files if provided
  if (file_paths && Array.isArray(file_paths) && file_paths.length > 0) {
    for (const filePath of file_paths) {
      // Get the latest file version for this path
      const fileVersions = await query(
        'SELECT id FROM file_versions WHERE file_path = ? ORDER BY created_at DESC LIMIT 1',
        [filePath]
      );

      if (fileVersions.length > 0) {
        await query(
          'INSERT IGNORE INTO prompt_files (prompt_id, file_version_id, relevance_score) VALUES (?, ?, ?)',
          [promptId, fileVersions[0].file_id, 1.0]
        );
      }
    }
  }

  // Fetch the created prompt with joined data
  const prompts = await query(
    `
    SELECT 
      ap.*,
      u.username,
      u.full_name,
      dr.report_date
    FROM ai_prompts ap
    LEFT JOIN users u ON ap.user_id = u.user_id
    LEFT JOIN daily_reports dr ON ap.report_id = dr.report_id
    WHERE ap.prompt_id = ?
    `,
    [promptId]
  );

  return res.status(201).json({
    success: true,
    data: prompts[0],
    message: 'AI prompt created successfully'
  });
}

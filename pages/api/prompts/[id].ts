// pages/api/prompts/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';
import { verifyAuth } from '../../../lib/auth';
import type { AIPrompt, AIPromptUpdate, ApiResponse } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<AIPrompt>>
) {
  try {
    // Verify authentication
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.query;

    if (req.method === 'GET') {
      return await handleGet(req, res, user, id as string);
    } else if (req.method === 'PUT') {
      return await handlePut(req, res, user, id as string);
    } else if (req.method === 'DELETE') {
      return await handleDelete(req, res, user, id as string);
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('AI Prompt API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<AIPrompt>>,
  user: any,
  id: string
) {
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
    [id]
  );

  if (prompts.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'AI prompt not found'
    });
  }

  const prompt = prompts[0];

  // Check access permission
  if (user.role !== 'admin' && prompt.user_id !== user.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Get associated files
  const files = await query(
    `
    SELECT 
      fv.*,
      u.username
    FROM file_versions fv
    INNER JOIN prompt_files pf ON fv.file_id = pf.file_version_id
    LEFT JOIN users u ON fv.user_id = u.user_id
    WHERE pf.prompt_id = ?
    ORDER BY fv.created_at DESC
    `,
    [id]
  );

  prompt.files_affected = files;

  return res.status(200).json({
    success: true,
    data: prompt
  });
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<AIPrompt>>,
  user: any,
  id: string
) {
  // Check if prompt exists and user has permission
  const existing = await query(
    'SELECT user_id FROM ai_prompts WHERE prompt_id = ?',
    [id]
  );

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'AI prompt not found'
    });
  }

  if (user.role !== 'admin' && existing[0].user_id !== user.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  const {
    prompt_text,
    response_text,
    ai_model,
    context_data,
    category,
    effectiveness_rating,
    tokens_used,
    report_id
  } = req.body as AIPromptUpdate;

  // Build update query dynamically
  const updates: string[] = [];
  const values: any[] = [];

  if (prompt_text !== undefined) {
    updates.push('prompt_text = ?');
    values.push(prompt_text);
  }
  if (response_text !== undefined) {
    updates.push('response_text = ?');
    values.push(response_text);
  }
  if (ai_model !== undefined) {
    updates.push('ai_model = ?');
    values.push(ai_model);
  }
  if (context_data !== undefined) {
    updates.push('context_data = ?');
    values.push(JSON.stringify(context_data));
  }
  if (category !== undefined) {
    updates.push('category = ?');
    values.push(category);
  }
  if (effectiveness_rating !== undefined) {
    updates.push('effectiveness_rating = ?');
    values.push(effectiveness_rating);
  }
  if (tokens_used !== undefined) {
    updates.push('tokens_used = ?');
    values.push(tokens_used);
  }
  if (report_id !== undefined) {
    updates.push('report_id = ?');
    values.push(report_id);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No fields to update'
    });
  }

  values.push(id);

  await query(
    `UPDATE ai_prompts SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  // Fetch updated prompt
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
    [id]
  );

  return res.status(200).json({
    success: true,
    data: prompts[0],
    message: 'AI prompt updated successfully'
  });
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<AIPrompt>>,
  user: any,
  id: string
) {
  // Check if prompt exists and user has permission
  const existing = await query(
    'SELECT user_id FROM ai_prompts WHERE prompt_id = ?',
    [id]
  );

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'AI prompt not found'
    });
  }

  if (user.role !== 'admin' && existing[0].user_id !== user.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  await query('DELETE FROM ai_prompts WHERE id = ?', [id]);

  return res.status(200).json({
    success: true,
    message: 'AI prompt deleted successfully'
  });
}



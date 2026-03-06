import { Router, Response } from 'express';
import { supabaseClient } from '../utils/supabase.js';
import { sendError, sendSuccess, sendCreated } from '../utils/jwt.js';
import { validate, createMessageSchema } from '../utils/validation.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/messages
 * Get all conversations for current user
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    // Get conversations (distinct users the current user has messaged)
    const { data: conversations, error } = await supabaseClient
      .from('messages')
      .select(`
        id,
        sender_id,
        recipient_id,
        product_id,
        content,
        is_read,
        created_at,
        sender:users!messages_sender_id_fkey(id, full_name, avatar_url),
        recipient:users!messages_recipient_id_fkey(id, full_name, avatar_url)
      `)
      .or(`sender_id.eq.${req.user.userId},recipient_id.eq.${req.user.userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      return sendError(res, 400, error.message);
    }

    // Group by conversation partners
    const conversationsMap = new Map();
    conversations?.forEach((msg: any) => {
      const partnerId = msg.sender_id === req.user.userId ? msg.recipient_id : msg.sender_id;
      const partner = msg.sender_id === req.user.userId ? msg.recipient : msg.sender;
      
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partner,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      if (!msg.is_read && msg.recipient_id === req.user.userId) {
        conversationsMap.get(partnerId).unreadCount += 1;
      }
    });

    sendSuccess(res, Array.from(conversationsMap.values()));
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

/**
 * GET /api/messages/:userId
 * Get conversation with specific user
 */
router.get('/:userId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    let query = supabaseClient
      .from('messages')
      .select('*', { count: 'exact' })
      .or(`and(sender_id.eq.${req.user.userId},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${req.user.userId})`);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: messages, error, count } = await query;

    if (error) {
      return sendError(res, 400, error.message);
    }

    sendSuccess(res, {
      messages: messages?.reverse() || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

/**
 * POST /api/messages
 * Send a message
 */
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    const data = validate(createMessageSchema, req.body);

    // Verify recipient exists
    const { data: recipient, error: recipientError } = await supabaseClient
      .from('users')
      .select('id')
      .eq('id', data.recipient_id)
      .single();

    if (recipientError || !recipient) {
      return sendError(res, 404, 'Recipient not found');
    }

    // Prevent messaging yourself
    if (data.recipient_id === req.user.userId) {
      return sendError(res, 400, 'Cannot message yourself');
    }

    const { data: message, error } = await supabaseClient
      .from('messages')
      .insert({
        sender_id: req.user.userId,
        recipient_id: data.recipient_id,
        product_id: data.product_id || null,
        content: data.content,
      })
      .select()
      .single();

    if (error) {
      return sendError(res, 400, error.message);
    }

    sendCreated(res, message);
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

/**
 * PUT /api/messages/:id/read
 * Mark message as read
 */
router.put('/:id/read', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    const { id } = req.params;

    // Check if user is recipient
    const { data: message, error: messageError } = await supabaseClient
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();

    if (messageError || !message) {
      return sendError(res, 404, 'Message not found');
    }

    if (message.recipient_id !== req.user.userId) {
      return sendError(res, 403, 'You cannot mark this message as read');
    }

    const { data: updatedMessage, error } = await supabaseClient
      .from('messages')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return sendError(res, 400, error.message);
    }

    sendSuccess(res, updatedMessage, 'Message marked as read');
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

export default router;

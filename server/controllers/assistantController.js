import { v4 as uuidv4 } from 'uuid';
import { query } from '../database/db.js';
import { chatWithAssistant } from '../services/geminiService.js';

export async function listConversations(req, res) {
  try {
    const { rows } = await query(
      `SELECT c.id, c.title, c.report_id, c.created_at, c.updated_at,
              r.title as report_title,
              (SELECT message_text FROM chat_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
       FROM conversations c
       LEFT JOIN medical_reports r ON r.id = c.report_id
       WHERE c.user_id = $1
       ORDER BY c.updated_at DESC`,
      [req.user.id]
    );

    return res.json({
      success: true,
      data: {
        conversations: rows
      }
    });
  } catch (err) {
    console.error('[AssistantController] List error:', err);
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to load conversations.' }
    });
  }
}

export async function createConversation(req, res) {
  try {
    const { title, report_id } = req.body || {};
    const convId = `conv_${uuidv4()}`;
    const convTitle = (title && title.trim()) || 'Clinical Consultation';

    // Verify report ownership if report_id provided
    if (report_id) {
      const repCheck = await query('SELECT id FROM medical_reports WHERE id = $1 AND user_id = $2', [report_id, req.user.id]);
      if (repCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid or unauthorized report selection.' }
        });
      }
    }

    await query(
      `INSERT INTO conversations (id, user_id, report_id, title)
       VALUES ($1, $2, $3, $4)`,
      [convId, req.user.id, report_id || null, convTitle]
    );

    return res.status(201).json({
      success: true,
      data: {
        conversation: {
          id: convId,
          title: convTitle,
          report_id: report_id || null,
        }
      }
    });
  } catch (err) {
    console.error('[AssistantController] Create error:', err);
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to initialize conversation.' }
    });
  }
}

export async function getConversationMessages(req, res) {
  try {
    const { id } = req.params;

    // Verify conversation ownership
    const convCheck = await query(
      `SELECT c.id, c.title, c.report_id, r.title as report_title 
       FROM conversations c
       LEFT JOIN medical_reports r ON r.id = c.report_id
       WHERE c.id = $1 AND c.user_id = $2`,
      [id, req.user.id]
    );

    if (convCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Conversation not found or unauthorized.' }
      });
    }

    const { rows: messages } = await query(
      `SELECT id, sender_role, message_text, supporting_sources, created_at 
       FROM chat_messages 
       WHERE conversation_id = $1 
       ORDER BY created_at ASC`,
      [id]
    );

    const parsedMessages = messages.map(m => {
      let sources = [];
      try {
        sources = JSON.parse(m.supporting_sources || '[]');
      } catch {
        sources = [];
      }
      return {
        id: m.id,
        sender_role: m.sender_role,
        message_text: m.message_text,
        supporting_sources: sources,
        created_at: m.created_at,
      };
    });

    return res.json({
      success: true,
      data: {
        conversation: convCheck.rows[0],
        messages: parsedMessages,
      }
    });
  } catch (err) {
    console.error('[AssistantController] Messages error:', err);
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to retrieve messages.' }
    });
  }
}

export async function sendMessage(req, res) {
  try {
    let { id } = req.params;
    const { message, report_id } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Please enter a message or question.' }
      });
    }

    // Auto-create or verify conversation
    let conversation = null;
    if (id && id !== 'null' && id !== 'undefined' && id !== 'new') {
      const convCheck = await query(
        `SELECT id, report_id, title FROM conversations WHERE id = $1 AND user_id = $2`,
        [id, req.user.id]
      );
      if (convCheck.rows.length > 0) {
        conversation = convCheck.rows[0];
      }
    }

    if (!conversation) {
      id = `conv_${uuidv4()}`;
      const convTitle = message.trim().slice(0, 40) + (message.length > 40 ? '...' : '');
      await query(
        `INSERT INTO conversations (id, user_id, report_id, title)
         VALUES ($1, $2, $3, $4)`,
        [id, req.user.id, report_id || null, convTitle]
      );
      conversation = { id, report_id: report_id || null, title: convTitle };
    }

    // Store user message
    const userMsgId = `msg_${uuidv4()}`;
    await query(
      `INSERT INTO chat_messages (id, conversation_id, sender_role, message_text)
       VALUES ($1, $2, $3, $4)`,
      [userMsgId, id, 'user', message.trim()]
    );

    // Retrieve recent history for context
    const { rows: history } = await query(
      `SELECT sender_role, message_text FROM chat_messages 
       WHERE conversation_id = $1 
       ORDER BY created_at ASC 
       LIMIT 12`,
      [id]
    );

    // Retrieve report context if linked
    let reportContext = null;
    const targetReportId = conversation.report_id || report_id;
    if (targetReportId) {
      const repQuery = await query(
        `SELECT title, report_date FROM medical_reports WHERE id = $1`,
        [targetReportId]
      );
      const resQuery = await query(
        `SELECT test_name, result_value, unit, reference_range, flag 
         FROM extracted_test_results WHERE report_id = $1`,
        [targetReportId]
      );

      if (repQuery.rows.length > 0) {
        reportContext = {
          title: repQuery.rows[0].title,
          report_date: repQuery.rows[0].report_date,
          results: resQuery.rows,
        };
      }
    }

    // Call Gemini Assistant
    const aiResponse = await chatWithAssistant(message.trim(), history, reportContext);

    // Store assistant response
    const assistantMsgId = `msg_${uuidv4()}`;
    await query(
      `INSERT INTO chat_messages (id, conversation_id, sender_role, message_text, supporting_sources)
       VALUES ($1, $2, $3, $4, $5)`,
      [assistantMsgId, id, 'assistant', aiResponse.message, JSON.stringify(aiResponse.sources || [])]
    );

    // Update conversation timestamp
    await query(`UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);

    return res.json({
      success: true,
      data: {
        conversation_id: id,
        conversation_title: conversation.title,
        message: {
          id: assistantMsgId,
          sender_role: 'assistant',
          message_text: aiResponse.message,
          supporting_sources: aiResponse.sources || [],
          created_at: new Date().toISOString(),
          modelVersion: aiResponse.modelVersion,
        }
      }
    });
  } catch (err) {
    console.error('[AssistantController] Send message error:', err);
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'The clinical AI assistant is currently unavailable. Please try again.' }
    });
  }
}

export async function deleteConversation(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM conversations WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    return res.json({ success: true, message: 'Conversation deleted successfully.' });
  } catch (err) {
    console.error('[AssistantController] Delete error:', err);
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to delete conversation.' }
    });
  }
}

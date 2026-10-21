import { Router } from 'express';
import { 
  listConversations, 
  createConversation, 
  getConversationMessages, 
  sendMessage, 
  deleteConversation 
} from '../controllers/assistantController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/conversations', listConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:id/messages', getConversationMessages);
router.post('/conversations/:id/messages', sendMessage);
router.delete('/conversations/:id', deleteConversation);

export default router;

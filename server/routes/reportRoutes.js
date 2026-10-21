import { Router } from 'express';
import multer from 'multer';
import { 
  uploadReport, 
  listReports, 
  getReportDetails, 
  downloadReport, 
  deleteReport, 
  deleteAllReports,
  compareReports 
} from '../controllers/reportController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15 MB
});

// All report routes require authentication
router.use(requireAuth);

router.post('/upload', upload.single('file'), uploadReport);
router.get('/', listReports);
router.get('/compare', compareReports);
router.delete('/all', deleteAllReports);
router.delete('/', deleteAllReports);
router.get('/:id', getReportDetails);
router.get('/:id/download', downloadReport);
router.delete('/:id', deleteReport);

export default router;

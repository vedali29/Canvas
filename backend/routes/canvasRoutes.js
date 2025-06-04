const express = require('express');
const router = express.Router();
const canvasController = require('../controllers/canvasController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post('/initialize', canvasController.initializeCanvas);
router.post('/add/rectangle', canvasController.addRectangle);
router.post('/add/circle', canvasController.addCircle);
router.post('/add/text', canvasController.addText);
router.post('/add/image', upload.single('image'), canvasController.addImage);
router.delete('/element/:id', canvasController.deleteElement);
router.put('/element/:id', canvasController.updateElement);
router.get('/state', canvasController.getCanvasState);
router.get('/export/pdf', canvasController.exportToPDF);
router.get('/export/image/:format', canvasController.exportToImage); // <-- fix: path param
router.delete('/clear', canvasController.clearCanvas); // <-- fix: clear endpoint

module.exports = router;
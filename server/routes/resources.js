const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// Get all resources
router.get('/', async (req, res) => {
  try {
    const { search, department, category, semester, sort } = req.query;
    const query = {};
    if (search) query.$or = [
      { title: new RegExp(search, 'i') },
      { subject: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
    ];
    if (department) query.department = department;
    if (category) query.category = category;
    if (semester) query.semester = semester;

    const sortMap = {
      newest: '-createdAt',
      downloads: '-downloads',
      rating: '-views',
      views: '-views',
    };
    const sortBy = sortMap[sort] || '-createdAt';

    const resources = await Resource.find(query).populate('uploadedBy', 'name').sort(sortBy);
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload resource
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File required' });
    const { title, description, subject, department, semester, category } = req.body;
    const resource = await Resource.create({
      title, description, subject, department, semester, category,
      filename: req.file.filename,
      originalName: req.file.originalname,
      uploadedBy: req.user.id,
    });
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Preview resource (inline) — increments view count
router.get('/:id/preview', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Not found' });
    resource.views = (resource.views || 0) + 1;
    await resource.save();
    const filePath = path.resolve(__dirname, '../uploads', resource.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found on server' });
    const ext = path.extname(resource.originalName).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.txt': 'text/plain',
    };
    const mime = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Download resource
router.get('/:id/download', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Not found' });
    resource.downloads += 1;
    await resource.save();
    const filePath = path.resolve(__dirname, '../uploads', resource.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found on server' });
    res.setHeader('Content-Disposition', `attachment; filename="${resource.originalName}"`);
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get comments
router.get('/:id/comments', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Not found' });
    res.json(resource.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Not found' });
    resource.comments.push({ user: req.user.id, name: req.user.name, text: req.body.text });
    await resource.save();
    res.json(resource.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rate resource
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { value } = req.body;
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Not found' });
    const existing = resource.ratings.find(r => r.user.toString() === req.user.id);
    if (existing) existing.value = value;
    else resource.ratings.push({ user: req.user.id, value });
    await resource.save();
    res.json({ message: 'Rated', ratings: resource.ratings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete resource
router.delete('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Not found' });
    if (resource.uploadedBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });
    const filePath = path.resolve(__dirname, '../uploads', resource.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await resource.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

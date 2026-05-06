const router = require('express').Router();
const Request = require('../models/Request');
const auth = require('../middleware/auth');

// Get all requests
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find().sort('-createdAt');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Post a request
router.post('/', auth, async (req, res) => {
  try {
    const { title, subject, department, semester, description } = req.body;
    if (!title || !subject || !department) return res.status(400).json({ message: 'Title, subject and department are required' });
    const request = await Request.create({
      title, subject, department, semester, description,
      requestedBy: req.user.id,
      requesterName: req.user.name,
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark as fulfilled
router.patch('/:id/fulfill', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Not found' });
    request.fulfilled = true;
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete own request
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Not found' });
    if (request.requestedBy.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    await request.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

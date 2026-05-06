const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { name, studentId, email, department, year, password } = req.body;
    if (!name || !studentId || !email || !department || !year || !password)
      return res.status(400).json({ message: 'All fields are required' });
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });
    if (await User.findOne({ studentId }))
      return res.status(400).json({ message: 'Student ID already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, studentId, email, department, year, password: hashed });
    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { _id: user._id, name: user.name, studentId: user.studentId, email: user.email, department: user.department, year: user.year } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Invalid email or password' });
    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { _id: user._id, name: user.name, studentId: user.studentId, email: user.email, department: user.department, year: user.year } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

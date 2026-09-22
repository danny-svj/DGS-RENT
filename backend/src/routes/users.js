const express = require('express');
const db = require('../db/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, requireRole('admin'), (req, res) => {
  const users = db
    .prepare('SELECT id, name, email, role, company, created_at FROM users ORDER BY created_at DESC')
    .all();
  return res.json({ users });
});

module.exports = router;

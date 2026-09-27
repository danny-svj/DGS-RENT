const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

const MAX_LEN = 2000;

// --- Chat del cliente con soporte (un solo hilo por cliente) ---

router.get('/', authenticate, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM messages WHERE user_id = ? ORDER BY created_at ASC')
    .all(req.user.id);
  db.prepare(
    "UPDATE messages SET read_by_user = 1 WHERE user_id = ? AND sender_role = 'admin' AND read_by_user = 0"
  ).run(req.user.id);
  return res.json({ messages: rows });
});

router.get('/unread', authenticate, (req, res) => {
  const { c } = db
    .prepare(
      "SELECT COUNT(*) AS c FROM messages WHERE user_id = ? AND sender_role = 'admin' AND read_by_user = 0"
    )
    .get(req.user.id);
  return res.json({ count: c });
});

router.post(
  '/',
  authenticate,
  [body('body').trim().isLength({ min: 1, max: MAX_LEN }).withMessage('Escribe un mensaje valido')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    const info = db
      .prepare(
        `INSERT INTO messages (user_id, sender_role, body, read_by_user, read_by_admin)
         VALUES (?, 'user', ?, 1, 0)`
      )
      .run(req.user.id, req.body.body.trim());
    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(info.lastInsertRowid);
    return res.status(201).json({ message });
  }
);

// --- Vista de soporte (admin): lista de hilos y conversacion por cliente ---

router.get('/admin/threads', authenticate, requireRole('admin'), (req, res) => {
  const rows = db
    .prepare(
      `SELECT u.id AS user_id, u.name, u.email,
              (SELECT body FROM messages m2 WHERE m2.user_id = u.id ORDER BY m2.created_at DESC, m2.id DESC LIMIT 1) AS last_message,
              (SELECT created_at FROM messages m2 WHERE m2.user_id = u.id ORDER BY m2.created_at DESC, m2.id DESC LIMIT 1) AS last_message_at,
              (SELECT COUNT(*) FROM messages m3 WHERE m3.user_id = u.id AND m3.sender_role = 'user' AND m3.read_by_admin = 0) AS unread_count
       FROM users u
       WHERE u.role = 'user' AND EXISTS (SELECT 1 FROM messages m WHERE m.user_id = u.id)
       ORDER BY last_message_at DESC`
    )
    .all();
  return res.json({ threads: rows });
});

router.get('/admin/unread', authenticate, requireRole('admin'), (req, res) => {
  const { c } = db
    .prepare("SELECT COUNT(*) AS c FROM messages WHERE sender_role = 'user' AND read_by_admin = 0")
    .get();
  return res.json({ count: c });
});

router.get('/admin/thread/:userId', authenticate, requireRole('admin'), (req, res) => {
  const customer = db.prepare("SELECT id, name, email FROM users WHERE id = ? AND role = 'user'").get(
    req.params.userId
  );
  if (!customer) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  const rows = db
    .prepare('SELECT * FROM messages WHERE user_id = ? ORDER BY created_at ASC')
    .all(req.params.userId);
  db.prepare(
    "UPDATE messages SET read_by_admin = 1 WHERE user_id = ? AND sender_role = 'user' AND read_by_admin = 0"
  ).run(req.params.userId);
  return res.json({ customer, messages: rows });
});

router.post(
  '/admin/thread/:userId',
  authenticate,
  requireRole('admin'),
  [body('body').trim().isLength({ min: 1, max: MAX_LEN }).withMessage('Escribe un mensaje valido')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    const customer = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'user'").get(req.params.userId);
    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    const info = db
      .prepare(
        `INSERT INTO messages (user_id, sender_role, body, read_by_user, read_by_admin)
         VALUES (?, 'admin', ?, 0, 1)`
      )
      .run(req.params.userId, req.body.body.trim());
    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(info.lastInsertRowid);
    return res.status(201).json({ message });
  }
);

module.exports = router;

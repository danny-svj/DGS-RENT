const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../db/db');
const { authenticate, signToken } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Correo invalido').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('La contrasena debe tener al menos 6 caracteres'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, password, company } = req.body;

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const info = db
      .prepare('INSERT INTO users (name, email, password_hash, role, company) VALUES (?, ?, ?, ?, ?)')
      .run(name, email, passwordHash, 'user', company || null);

    const user = { id: info.lastInsertRowid, name, email, role: 'user' };
    const token = signToken(user);

    return res.status(201).json({ token, user });
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Correo invalido').normalizeEmail(),
    body('password').notEmpty().withMessage('La contrasena es obligatoria'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    const dbUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!dbUser || !bcrypt.compareSync(password, dbUser.password_hash)) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    const user = { id: dbUser.id, name: dbUser.name, email: dbUser.email, role: dbUser.role };
    const token = signToken(user);

    return res.json({ token, user });
  }
);

router.get('/me', authenticate, (req, res) => {
  const dbUser = db
    .prepare('SELECT id, name, email, role, company, created_at FROM users WHERE id = ?')
    .get(req.user.id);

  if (!dbUser) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  return res.json({ user: dbUser });
});

module.exports = router;

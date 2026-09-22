const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { category, status, maxPrice } = req.query;
  let sql = 'SELECT * FROM vehicles WHERE 1=1';
  const params = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (maxPrice) {
    sql += ' AND daily_price <= ?';
    params.push(Number(maxPrice));
  }
  sql += ' ORDER BY created_at DESC';

  const vehicles = db.prepare(sql).all(...params);
  return res.json({ vehicles });
});

router.get('/:id', (req, res) => {
  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehiculo no encontrado' });
  }
  return res.json({ vehicle });
});

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  [
    body('brand').trim().notEmpty().withMessage('La marca es obligatoria'),
    body('model').trim().notEmpty().withMessage('El modelo es obligatorio'),
    body('year').isInt({ min: 1990 }).withMessage('Anio invalido'),
    body('category').trim().notEmpty().withMessage('La categoria es obligatoria'),
    body('plate').trim().notEmpty().withMessage('La placa es obligatoria'),
    body('daily_price').isFloat({ min: 0 }).withMessage('Precio invalido'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { brand, model, year, category, plate, daily_price: dailyPrice, image_url: imageUrl } = req.body;

    const existingPlate = db.prepare('SELECT id FROM vehicles WHERE plate = ?').get(plate);
    if (existingPlate) {
      return res.status(409).json({ error: 'Ya existe un vehiculo con esa placa' });
    }

    const info = db
      .prepare(
        `INSERT INTO vehicles (brand, model, year, category, plate, daily_price, status, image_url)
         VALUES (?, ?, ?, ?, ?, ?, 'available', ?)`
      )
      .run(brand, model, year, category, plate, dailyPrice, imageUrl || null);

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(info.lastInsertRowid);
    return res.status(201).json({ vehicle });
  }
);

router.put('/:id', authenticate, requireRole('admin'), (req, res) => {
  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehiculo no encontrado' });
  }

  const fields = ['brand', 'model', 'year', 'category', 'plate', 'daily_price', 'status', 'image_url'];
  const updated = { ...vehicle };
  fields.forEach((f) => {
    if (req.body[f] !== undefined) updated[f] = req.body[f];
  });

  db.prepare(
    `UPDATE vehicles SET brand=?, model=?, year=?, category=?, plate=?, daily_price=?, status=?, image_url=?
     WHERE id=?`
  ).run(
    updated.brand,
    updated.model,
    updated.year,
    updated.category,
    updated.plate,
    updated.daily_price,
    updated.status,
    updated.image_url,
    req.params.id
  );

  const result = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
  return res.json({ vehicle: result });
});

router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehiculo no encontrado' });
  }
  db.prepare('DELETE FROM vehicles WHERE id = ?').run(req.params.id);
  return res.status(204).send();
});

module.exports = router;

const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

function diffDays(start, end) {
  const ms = new Date(end) - new Date(start);
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

router.get('/', authenticate, (req, res) => {
  let rows;
  if (req.user.role === 'admin') {
    rows = db
      .prepare(
        `SELECT r.*, u.name AS user_name, u.email AS user_email,
                v.brand, v.model, v.plate
         FROM reservations r
         JOIN users u ON u.id = r.user_id
         JOIN vehicles v ON v.id = r.vehicle_id
         ORDER BY r.created_at DESC`
      )
      .all();
  } else {
    rows = db
      .prepare(
        `SELECT r.*, v.brand, v.model, v.plate
         FROM reservations r
         JOIN vehicles v ON v.id = r.vehicle_id
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC`
      )
      .all(req.user.id);
  }
  return res.json({ reservations: rows });
});

router.post(
  '/',
  authenticate,
  [
    body('vehicle_id').isInt().withMessage('Vehiculo invalido'),
    body('start_date').isISO8601().withMessage('Fecha de inicio invalida'),
    body('end_date').isISO8601().withMessage('Fecha de fin invalida'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { vehicle_id: vehicleId, start_date: startDate, end_date: endDate } = req.body;

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehiculo no encontrado' });
    }
    if (vehicle.status !== 'available') {
      return res.status(409).json({ error: 'El vehiculo no esta disponible' });
    }
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ error: 'La fecha de fin debe ser posterior a la de inicio' });
    }

    const days = diffDays(startDate, endDate);
    const totalPrice = days * vehicle.daily_price;

    const info = db
      .prepare(
        `INSERT INTO reservations (user_id, vehicle_id, start_date, end_date, status, total_price)
         VALUES (?, ?, ?, ?, 'pending', ?)`
      )
      .run(req.user.id, vehicleId, startDate, endDate, totalPrice);

    db.prepare("UPDATE vehicles SET status = 'rented' WHERE id = ?").run(vehicleId);

    const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(info.lastInsertRowid);
    return res.status(201).json({ reservation });
  }
);

router.put('/:id/status', authenticate, requireRole('admin'), (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Estado invalido' });
  }

  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.id);
  if (!reservation) {
    return res.status(404).json({ error: 'Reservacion no encontrada' });
  }

  db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(status, req.params.id);

  if (status === 'cancelled' || status === 'completed') {
    db.prepare("UPDATE vehicles SET status = 'available' WHERE id = ?").run(reservation.vehicle_id);
  }

  const updated = db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.id);
  return res.json({ reservation: updated });
});

router.delete('/:id', authenticate, (req, res) => {
  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.id);
  if (!reservation) {
    return res.status(404).json({ error: 'Reservacion no encontrada' });
  }
  if (req.user.role !== 'admin' && reservation.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No puedes cancelar esta reservacion' });
  }

  db.prepare("UPDATE reservations SET status = 'cancelled' WHERE id = ?").run(req.params.id);
  db.prepare("UPDATE vehicles SET status = 'available' WHERE id = ?").run(reservation.vehicle_id);

  return res.status(204).send();
});

module.exports = router;

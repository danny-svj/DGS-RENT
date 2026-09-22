const path = require('path');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data.sqlite');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin')),
      company TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      category TEXT NOT NULL,
      plate TEXT NOT NULL UNIQUE,
      daily_price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','rented','maintenance')),
      image_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','cancelled','completed')),
      total_price REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function seed() {
  const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (userCount === 0) {
    const insertUser = db.prepare(
      'INSERT INTO users (name, email, password_hash, role, company) VALUES (?, ?, ?, ?, ?)'
    );
    insertUser.run('Admin DGS', 'admin@dgsrent.com', bcrypt.hashSync('Admin123!', 10), 'admin', 'DGS Rent a Car');
    insertUser.run('Cliente Demo', 'cliente@dgsrent.com', bcrypt.hashSync('Cliente123!', 10), 'user', null);
  }

  const vehicleCount = db.prepare('SELECT COUNT(*) AS c FROM vehicles').get().c;
  if (vehicleCount === 0) {
    const insertVehicle = db.prepare(
      `INSERT INTO vehicles (brand, model, year, category, plate, daily_price, status, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const fleet = [
      ['Nissan', 'Versa', 2023, 'Sedan', 'DGS-001', 650, 'available', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'],
      ['Chevrolet', 'Aveo', 2022, 'Sedan', 'DGS-002', 600, 'available', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'],
      ['Toyota', 'RAV4', 2023, 'SUV', 'DGS-003', 1150, 'available', 'https://images.unsplash.com/photo-1518987048-93e29699e79a?auto=format&fit=crop&w=800&q=80'],
      ['Honda', 'CR-V', 2022, 'SUV', 'DGS-004', 1100, 'rented', 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=800&q=80'],
      ['Ford', 'Mustang', 2023, 'Deportivo', 'DGS-005', 1900, 'available', 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80'],
      ['Mercedes-Benz', 'Sprinter', 2021, 'Van', 'DGS-006', 1600, 'maintenance', 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80'],
    ];
    fleet.forEach((v) => insertVehicle.run(...v));
  }
}

migrate();
seed();

module.exports = db;

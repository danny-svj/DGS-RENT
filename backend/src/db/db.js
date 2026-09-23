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
    const ASSET_BASE = 'https://danny-svj.github.io/DGS-RENT/assets/cars';
    const fleet = [
      ['Nissan', 'Versa', 2023, 'Sedan', 'DGS-001', 650, 'available', `${ASSET_BASE}/sedan-blue.svg`],
      ['Chevrolet', 'Aveo', 2022, 'Sedan', 'DGS-002', 600, 'available', `${ASSET_BASE}/sedan-red.svg`],
      ['Toyota', 'RAV4', 2023, 'SUV', 'DGS-003', 1150, 'available', `${ASSET_BASE}/suv-silver.svg`],
      ['Honda', 'CR-V', 2022, 'SUV', 'DGS-004', 1100, 'rented', `${ASSET_BASE}/suv-dark.svg`],
      ['Ford', 'Mustang', 2023, 'Deportivo', 'DGS-005', 1900, 'available', `${ASSET_BASE}/deportivo-red.svg`],
      ['Mercedes-Benz', 'Sprinter', 2021, 'Van', 'DGS-006', 1600, 'maintenance', `${ASSET_BASE}/van-white.svg`],
      ['Volkswagen', 'Jetta', 2023, 'Sedan', 'DGS-007', 680, 'available', `${ASSET_BASE}/sedan-black.svg`],
      ['Toyota', 'Corolla', 2022, 'Sedan', 'DGS-008', 630, 'available', `${ASSET_BASE}/sedan-gold.svg`],
      ['Mazda', '3', 2024, 'Sedan', 'DGS-009', 700, 'available', `${ASSET_BASE}/sedan-graphite.svg`],
      ['Kia', 'Forte', 2023, 'Sedan', 'DGS-010', 610, 'rented', `${ASSET_BASE}/sedan-silver.svg`],
      ['Honda', 'Civic', 2024, 'Sedan', 'DGS-011', 720, 'available', `${ASSET_BASE}/sedan-white.svg`],
      ['Mazda', 'CX-5', 2023, 'SUV', 'DGS-012', 1200, 'available', `${ASSET_BASE}/suv-blue.svg`],
      ['Jeep', 'Compass', 2022, 'SUV', 'DGS-013', 1250, 'available', `${ASSET_BASE}/suv-green.svg`],
      ['Kia', 'Sportage', 2024, 'SUV', 'DGS-014', 1180, 'maintenance', `${ASSET_BASE}/suv-red.svg`],
      ['Nissan', 'X-Trail', 2023, 'SUV', 'DGS-015', 1220, 'available', `${ASSET_BASE}/suv-white.svg`],
      ['Chevrolet', 'Camaro', 2023, 'Deportivo', 'DGS-016', 2100, 'available', `${ASSET_BASE}/deportivo-black.svg`],
      ['BMW', 'Serie 4', 2024, 'Deportivo', 'DGS-017', 2400, 'available', `${ASSET_BASE}/deportivo-blue.svg`],
      ['Ford', 'Mustang GT', 2022, 'Deportivo', 'DGS-018', 1950, 'rented', `${ASSET_BASE}/deportivo-yellow.svg`],
      ['Toyota', 'Hiace', 2023, 'Van', 'DGS-019', 1550, 'available', `${ASSET_BASE}/van-blue.svg`],
      ['Ford', 'Transit', 2024, 'Van', 'DGS-020', 1700, 'available', `${ASSET_BASE}/van-silver.svg`],
      ['Ford', 'Ranger', 2023, 'Pickup', 'DGS-021', 1500, 'available', `${ASSET_BASE}/pickup-black.svg`],
      ['Toyota', 'Hilux', 2022, 'Pickup', 'DGS-022', 1450, 'available', `${ASSET_BASE}/pickup-gray.svg`],
      ['Chevrolet', 'Silverado', 2024, 'Pickup', 'DGS-023', 1650, 'available', `${ASSET_BASE}/pickup-red.svg`],
      ['RAM', '1500', 2023, 'Pickup', 'DGS-024', 1700, 'maintenance', `${ASSET_BASE}/pickup-white.svg`],
    ];
    fleet.forEach((v) => insertVehicle.run(...v));
  }
}

migrate();
seed();

module.exports = db;

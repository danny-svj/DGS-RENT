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

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      sender_role TEXT NOT NULL CHECK(sender_role IN ('user','admin')),
      body TEXT NOT NULL,
      read_by_user INTEGER NOT NULL DEFAULT 0,
      read_by_admin INTEGER NOT NULL DEFAULT 0,
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
    // Fotos reales (Wikimedia Commons, licencia libre) del modelo exacto de cada vehiculo.
    const fleet = [
      ['Nissan', 'Versa', 2023, 'Sedan', 'DGS-001', 650, 'available', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/2020_Nissan_Versa_SR_front_NYIAS_2019.jpg/960px-2020_Nissan_Versa_SR_front_NYIAS_2019.jpg'],
      ['Chevrolet', 'Aveo', 2022, 'Sedan', 'DGS-002', 600, 'available', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/2024_Chevrolet_Aveo_Sed%C3%A1n_LT_%28Mexico%29_front_view.png/960px-2024_Chevrolet_Aveo_Sed%C3%A1n_LT_%28Mexico%29_front_view.png'],
      ['Toyota', 'RAV4', 2023, 'SUV', 'DGS-003', 1150, 'available', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/2022_MY_Toyota_RAV4_Hybrid_facelift_XA50.jpg/960px-2022_MY_Toyota_RAV4_Hybrid_facelift_XA50.jpg'],
      ['Honda', 'CR-V', 2022, 'SUV', 'DGS-004', 1100, 'rented', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/Honda_CR-V_Facelift_front.JPG/960px-Honda_CR-V_Facelift_front.JPG'],
      ['Ford', 'Mustang', 2023, 'Deportivo', 'DGS-005', 1900, 'available', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/2023_Denver_Auto_Show_Ford_Mustang_Dark_Horse_front_right_quarter.jpg/960px-2023_Denver_Auto_Show_Ford_Mustang_Dark_Horse_front_right_quarter.jpg'],
      ['Mercedes-Benz', 'Sprinter', 2021, 'Van', 'DGS-006', 1600, 'maintenance', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/Mercedes-Benz_Sprinter_%282018%29_IMG_3503.jpg/960px-Mercedes-Benz_Sprinter_%282018%29_IMG_3503.jpg'],
      ['Volkswagen', 'Jetta', 2023, 'Sedan', 'DGS-007', 680, 'available', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/2022_Volkswagen_Jetta_VII_1X7A0180.jpg/960px-2022_Volkswagen_Jetta_VII_1X7A0180.jpg'],
      ['Toyota', 'Corolla', 2022, 'Sedan', 'DGS-008', 630, 'available', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/2019-2022_Toyota_Corolla_G-X_1.8_3BA-ZRE212_%2820220911%29.jpg/960px-2019-2022_Toyota_Corolla_G-X_1.8_3BA-ZRE212_%2820220911%29.jpg'],
      ['Mazda', '3', 2024, 'Sedan', 'DGS-009', 700, 'available', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/Mazda3_SEDAN_20S_L_Package_2WD_%285BA-BPFP%29_left.jpg/960px-Mazda3_SEDAN_20S_L_Package_2WD_%285BA-BPFP%29_left.jpg'],
      ['Kia', 'Forte', 2023, 'Sedan', 'DGS-010', 610, 'rented', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/93/2023_Kia_Forte_LX_in_Hyper_Blue%2C_Front_Left%2C_03-22-2023.jpg/960px-2023_Kia_Forte_LX_in_Hyper_Blue%2C_Front_Left%2C_03-22-2023.jpg'],
      ['Honda', 'Civic', 2024, 'Sedan', 'DGS-011', 720, 'available', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/2025_Honda_Civic_Sport_Touring_Hybrid_in_Blue_Lagoon%2C_front_left%2C_2024-09-24.jpg/960px-2025_Honda_Civic_Sport_Touring_Hybrid_in_Blue_Lagoon%2C_front_left%2C_2024-09-24.jpg'],
      ['Mazda', 'CX-5', 2023, 'SUV', 'DGS-012', 1200, 'available', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Mazda_CX-5_%28KF%29_Facelift_1X7A0331.jpg/960px-Mazda_CX-5_%28KF%29_Facelift_1X7A0331.jpg'],
      ['Jeep', 'Compass', 2022, 'SUV', 'DGS-013', 1250, 'available', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Jeep_Compass_%28MP%29_PHEV_Facelift_1X7A0140.jpg/960px-Jeep_Compass_%28MP%29_PHEV_Facelift_1X7A0140.jpg'],
      ['Kia', 'Sportage', 2024, 'SUV', 'DGS-014', 1180, 'maintenance', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Kia_Sportage_%28NQ5%3B_2021%29.jpg/960px-Kia_Sportage_%28NQ5%3B_2021%29.jpg'],
      ['Nissan', 'X-Trail', 2023, 'SUV', 'DGS-015', 1220, 'available', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Nissan_X-Trail_%28T33%29_1X7A7179.jpg/960px-Nissan_X-Trail_%28T33%29_1X7A7179.jpg'],
      ['Chevrolet', 'Camaro', 2023, 'Deportivo', 'DGS-016', 2100, 'available', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/2019_Chevrolet_Camaro_SS.jpg/960px-2019_Chevrolet_Camaro_SS.jpg'],
      ['BMW', 'Serie 4', 2024, 'Deportivo', 'DGS-017', 2400, 'available', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/2020_BMW_4-Series_430i_Coup%C3%A9_M_Sport.jpg/960px-2020_BMW_4-Series_430i_Coup%C3%A9_M_Sport.jpg'],
      ['Ford', 'Mustang GT', 2022, 'Deportivo', 'DGS-018', 1950, 'rented', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Green_S550_Mustang_GT.jpg/960px-Green_S550_Mustang_GT.jpg'],
      ['Toyota', 'Hiace', 2023, 'Van', 'DGS-019', 1550, 'available', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/2020_Toyota_HiAce_%28front%29.jpg/960px-2020_Toyota_HiAce_%28front%29.jpg'],
      ['Ford', 'Transit', 2024, 'Van', 'DGS-020', 1700, 'available', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c6/2020_Ford_Transit_350_Leader_EcoBlue_2.0_facelift_Front.jpg/960px-2020_Ford_Transit_350_Leader_EcoBlue_2.0_facelift_Front.jpg'],
      ['Ford', 'Ranger', 2023, 'Pickup', 'DGS-021', 1500, 'available', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/2023_Ford_Ranger_XLS.jpg/960px-2023_Ford_Ranger_XLS.jpg'],
      ['Toyota', 'Hilux', 2022, 'Pickup', 'DGS-022', 1450, 'available', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/2021_Toyota_Hilux_Revo_Prerunner_Double-Cab_2.4_Mid.jpg/960px-2021_Toyota_Hilux_Revo_Prerunner_Double-Cab_2.4_Mid.jpg'],
      ['Chevrolet', 'Silverado', 2024, 'Pickup', 'DGS-023', 1650, 'available', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/94/2021_Chevrolet_Silverado_1500_LT_4x4_Double_Cab%2C_front_right%2C_09-02-2022.jpg/960px-2021_Chevrolet_Silverado_1500_LT_4x4_Double_Cab%2C_front_right%2C_09-02-2022.jpg'],
      ['RAM', '1500', 2023, 'Pickup', 'DGS-024', 1700, 'maintenance', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/28/2019_Ram_1500_Laramie%2C_front_2.28.20.jpg/960px-2019_Ram_1500_Laramie%2C_front_2.28.20.jpg'],
    ];
    fleet.forEach((v) => insertVehicle.run(...v));
  }
}

migrate();
seed();

module.exports = db;

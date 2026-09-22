require('./setup');
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db/db');

let counter = 0;

async function getTokens() {
  counter += 1;
  const adminEmail = `admin-test${counter}@example.com`;
  const userEmail = `user-test${counter}@example.com`;

  const user = await request(app)
    .post('/api/auth/register')
    .send({ name: 'User Test', email: userEmail, password: 'user123456' });

  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin Test', email: adminEmail, password: 'admin12345' });

  db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(adminEmail);

  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: adminEmail, password: 'admin12345' });

  return { adminToken: adminLogin.body.token, userToken: user.body.token };
}

function uniqueVehicle(overrides = {}) {
  counter += 1;
  return {
    brand: 'Kia',
    model: 'Rio',
    year: 2023,
    category: 'Sedan',
    plate: `TEST-${counter}`,
    daily_price: 700,
    ...overrides,
  };
}

describe('Vehicles API', () => {
  test('GET /api/vehicles es publico y devuelve la flota inicial', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.vehicles)).toBe(true);
    expect(res.body.vehicles.length).toBeGreaterThan(0);
  });

  test('GET /api/vehicles filtra por categoria', async () => {
    const res = await request(app).get('/api/vehicles').query({ category: 'SUV' });
    expect(res.status).toBe(200);
    res.body.vehicles.forEach((v) => expect(v.category).toBe('SUV'));
  });

  test('GET /api/vehicles filtra por precio maximo', async () => {
    const res = await request(app).get('/api/vehicles').query({ maxPrice: 700 });
    expect(res.status).toBe(200);
    res.body.vehicles.forEach((v) => expect(v.daily_price).toBeLessThanOrEqual(700));
  });

  test('GET /api/vehicles/:id devuelve 404 si no existe', async () => {
    const res = await request(app).get('/api/vehicles/999999');
    expect(res.status).toBe(404);
  });

  test('GET /api/vehicles/:id devuelve el vehiculo', async () => {
    const { adminToken } = await getTokens();
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(uniqueVehicle());
    const res = await request(app).get(`/api/vehicles/${created.body.vehicle.id}`);
    expect(res.status).toBe(200);
    expect(res.body.vehicle.id).toBe(created.body.vehicle.id);
  });

  test('POST /api/vehicles rechaza sin token', async () => {
    const res = await request(app).post('/api/vehicles').send(uniqueVehicle());
    expect(res.status).toBe(401);
  });

  test('POST /api/vehicles rechaza rol user', async () => {
    const { userToken } = await getTokens();
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(uniqueVehicle());
    expect(res.status).toBe(403);
  });

  test('POST /api/vehicles crea vehiculo como admin', async () => {
    const { adminToken } = await getTokens();
    const vehicle = uniqueVehicle();
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(vehicle);
    expect(res.status).toBe(201);
    expect(res.body.vehicle.plate).toBe(vehicle.plate);
  });

  test('POST /api/vehicles rechaza placa duplicada', async () => {
    const { adminToken } = await getTokens();
    const vehicle = uniqueVehicle();
    const first = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(vehicle);
    expect(first.status).toBe(201);

    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(vehicle);
    expect(res.status).toBe(409);
  });

  test('POST /api/vehicles valida campos obligatorios', async () => {
    const { adminToken } = await getTokens();
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ brand: '' });
    expect(res.status).toBe(400);
  });

  test('PUT /api/vehicles/:id actualiza un vehiculo', async () => {
    const { adminToken } = await getTokens();
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(uniqueVehicle());

    const res = await request(app)
      .put(`/api/vehicles/${created.body.vehicle.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'maintenance' });

    expect(res.status).toBe(200);
    expect(res.body.vehicle.status).toBe('maintenance');
  });

  test('PUT /api/vehicles/:id devuelve 404 si no existe', async () => {
    const { adminToken } = await getTokens();
    const res = await request(app)
      .put('/api/vehicles/999999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'maintenance' });
    expect(res.status).toBe(404);
  });

  test('PUT /api/vehicles/:id rechaza rol user', async () => {
    const { adminToken, userToken } = await getTokens();
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(uniqueVehicle());

    const res = await request(app)
      .put(`/api/vehicles/${created.body.vehicle.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'maintenance' });
    expect(res.status).toBe(403);
  });

  test('DELETE /api/vehicles/:id elimina un vehiculo como admin', async () => {
    const { adminToken } = await getTokens();
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(uniqueVehicle());

    const res = await request(app)
      .delete(`/api/vehicles/${created.body.vehicle.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);

    const getRes = await request(app).get(`/api/vehicles/${created.body.vehicle.id}`);
    expect(getRes.status).toBe(404);
  });

  test('DELETE /api/vehicles/:id devuelve 404 si no existe', async () => {
    const { adminToken } = await getTokens();
    const res = await request(app)
      .delete('/api/vehicles/999999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});

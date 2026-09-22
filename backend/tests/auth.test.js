require('./setup');
const request = require('supertest');
const app = require('../src/app');

let counter = 0;
function uniqueUser(overrides = {}) {
  counter += 1;
  return {
    name: 'Ana Torres',
    email: `ana${counter}@example.com`,
    password: 'secreta123',
    ...overrides,
  };
}

describe('Auth API', () => {
  test('POST /api/auth/register crea un usuario y devuelve token', async () => {
    const newUser = uniqueUser();
    const res = await request(app).post('/api/auth/register').send(newUser);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(newUser.email);
    expect(res.body.user.role).toBe('user');
  });

  test('POST /api/auth/register rechaza correo invalido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(uniqueUser({ email: 'no-es-correo' }));
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/register rechaza contrasena corta', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(uniqueUser({ password: '123' }));
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/register rechaza correo duplicado', async () => {
    const newUser = uniqueUser();
    await request(app).post('/api/auth/register').send(newUser);
    const res = await request(app).post('/api/auth/register').send(newUser);
    expect(res.status).toBe(409);
  });

  test('POST /api/auth/login funciona con credenciales correctas', async () => {
    const newUser = uniqueUser();
    await request(app).post('/api/auth/register').send(newUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: newUser.email, password: newUser.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('POST /api/auth/login rechaza contrasena incorrecta', async () => {
    const newUser = uniqueUser();
    await request(app).post('/api/auth/register').send(newUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: newUser.email, password: 'incorrecta' });
    expect(res.status).toBe(401);
  });

  test('POST /api/auth/login rechaza usuario inexistente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nadie@example.com', password: 'lo-que-sea' });
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me requiere token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me rechaza token invalido', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer token-falso');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me devuelve el usuario autenticado', async () => {
    const newUser = uniqueUser();
    const register = await request(app).post('/api/auth/register').send(newUser);
    const { token } = register.body;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(newUser.email);
  });

  test('GET /api/auth/me devuelve 404 si el usuario ya no existe', async () => {
    const jwt = require('jsonwebtoken');
    const fakeToken = jwt.sign({ id: 999999, email: 'x@x.com', role: 'user' }, process.env.JWT_SECRET);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${fakeToken}`);
    expect(res.status).toBe(404);
  });
});

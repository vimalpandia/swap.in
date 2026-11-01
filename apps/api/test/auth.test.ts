import request from 'supertest';
import app from '../src/app';

describe('Auth Integration Tests', () => {
  it('should reject signup with invalid password (too short)', async () => {
    const res = await request(app).post('/api/v1/auth/signup').send({
      email: 'test@swap.app',
      username: 'testuser',
      name: 'Test User',
      password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should successfully register a valid new user', async () => {
    const res = await request(app).post('/api/v1/auth/signup').send({
      email: 'alex@swap.app',
      username: 'alex_swap',
      name: 'Alex Rivera',
      password: 'Password123!',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.username).toBe('alex_swap');
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();
  });

  it('should reject duplicate email registration with 409 conflict', async () => {
    await request(app).post('/api/v1/auth/signup').send({
      email: 'maya@swap.app',
      username: 'maya_vibes',
      name: 'Maya Lin',
      password: 'Password123!',
    });

    const res = await request(app).post('/api/v1/auth/signup').send({
      email: 'maya@swap.app',
      username: 'maya_two',
      name: 'Maya Two',
      password: 'Password123!',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should successfully log in an existing user and return tokens', async () => {
    await request(app).post('/api/v1/auth/signup').send({
      email: 'kai@swap.app',
      username: 'kai_creates',
      name: 'Kai Tanaka',
      password: 'Password123!',
    });

    const res = await request(app).post('/api/v1/auth/login').send({
      login: 'kai_creates',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('kai@swap.app');
    expect(res.body.data.tokens.accessToken).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/v1/auth/signup').send({
      email: 'elena@swap.app',
      username: 'elena_sound',
      name: 'Elena Rostova',
      password: 'Password123!',
    });

    const res = await request(app).post('/api/v1/auth/login').send({
      login: 'elena_sound',
      password: 'WrongPassword999!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject protected /api/v1/auth/me without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('should access /api/v1/auth/me with valid Bearer token', async () => {
    const signupRes = await request(app).post('/api/v1/auth/signup').send({
      email: 'me@swap.app',
      username: 'me_user',
      name: 'Me User',
      password: 'Password123!',
    });

    const token = signupRes.body.data.tokens.accessToken;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.username).toBe('me_user');
  });
});

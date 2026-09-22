import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 1: API Integration Tests', () => {
  // TODO: Student implementation - Part 1: Integration Testing
  // Test user creation (POST /users)
  // Test ticket creation (POST /tickets)
  // Test auth middleware rejection
  // Test 404 responses for non-existent users and tickets
  // Test pagination and filtering on GET /tickets

  it('creates a new user', async () => {
    const response = await request(app)
      .post('/users')
      .set('X-User-Id', '1')
      .send({
        name: 'Rachel',
        email: 'rachel@example.com',
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: 'Rachel',
      email: 'rachel@example.com',
    });
    expect(response.body.id).toBeDefined();
  });

  it('creates a new ticket', async () => {
    const userResponse = await request(app)
      .post('/users')
      .set('X-User-Id', '1')
      .send({
        name: 'Ticket Creator',
        email: 'creator@example.com',
      });

    const userId = userResponse.body.id as number;

    const response = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userId))
      .send({
        title: 'Fix login bug',
        description: 'Users cannot log in to the application',
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: 'Fix login bug',
      description: 'Users cannot log in to the application',
      creator_id: userId,
    });
    expect(response.body.id).toBeDefined();
  });

  it('rejects a POST request without an X-User-Id header', async () => {
    const response = await request(app).post('/tickets').send({
      title: 'Unauthorized ticket',
      description: 'This request should be rejected',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: 'Unauthorized',
    });
  });

  it('returns 404 for users and tickets that do not exist', async () => {
    const userResponse = await request(app).get('/users/9999');
    const ticketResponse = await request(app).get('/tickets/9999');

    expect(userResponse.status).toBe(404);
    expect(ticketResponse.status).toBe(404);
  });

  it('supports ticket pagination and status filtering', async () => {
    const userResponse = await request(app)
      .post('/users')
      .set('X-User-Id', '1')
      .send({
        name: 'Pagination User',
        email: 'pagination@example.com',
      });

    const userId = userResponse.body.id as number;

    for (let index = 1; index <= 3; index += 1) {
      await request(app)
        .post('/tickets')
        .set('X-User-Id', String(userId))
        .send({
          title: `Ticket ${index}`,
          description: `Description ${index}`,
        });
    }

    await request(app)
      .patch('/tickets/1/status')
      .set('X-User-Id', String(userId))
      .send({
        status: 'DONE',
      });

    const response = await request(app).get(
      '/tickets?status=TODO&limit=1&offset=1',
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].status).toBe('TODO');
    expect(response.body[0].title).toBe('Ticket 3');
  });
});

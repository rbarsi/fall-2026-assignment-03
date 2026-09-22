import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 2: Time Logs Tests', () => {
  // TODO: Student implementation - Part 2: Time Logging Tests
  // Log hours for a ticket (POST /tickets/:id/time)
  // Fetch total hours for a ticket (GET /tickets/:id/time)
  // Verify aggregation math

  it('logs time and returns the total hours for a ticket', async () => {
    const userResponse = await request(app)
      .post('/users')
      .set('X-User-Id', '1')
      .send({
        name: 'Time Log User',
        email: 'timelog@example.com',
      });

    expect(userResponse.status).toBe(201);

    const userId = userResponse.body.id as number;

    const ticketResponse = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userId))
      .send({
        title: 'Time logging ticket',
        description: 'Test the time-log aggregation feature',
      });

    expect(ticketResponse.status).toBe(201);

    const ticketId = ticketResponse.body.id as number;

    const firstLogResponse = await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', String(userId))
      .send({
        hours: 2,
      });

    expect(firstLogResponse.status).toBe(201);
    expect(firstLogResponse.body).toMatchObject({
      ticket_id: ticketId,
      user_id: userId,
      hours: 2,
    });

    const secondLogResponse = await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', String(userId))
      .send({
        hours: 3,
      });

    expect(secondLogResponse.status).toBe(201);
    expect(secondLogResponse.body.hours).toBe(3);

    const totalResponse = await request(app).get(`/tickets/${ticketId}/time`);

    expect(totalResponse.status).toBe(200);
    expect(totalResponse.body).toEqual({
      ticket_id: ticketId,
      total_hours: 5,
    });
  });
});

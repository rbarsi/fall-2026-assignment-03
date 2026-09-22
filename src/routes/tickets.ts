import { Router } from 'express';
import {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
} from '../dal/tickets.js';
import { getTotalHoursForTicket, insertTimeLog } from '../dal/timeLogs.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const limit =
    req.query.limit !== undefined ? Number(req.query.limit) : undefined;
  const offset =
    req.query.offset !== undefined ? Number(req.query.offset) : undefined;
  const status =
    typeof req.query.status === 'string' ? req.query.status : undefined;

  const tickets = await getAllTickets({
    limit,
    offset,
    status,
  });

  res.status(200).json(tickets);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const ticket = await getTicketById(id);

  if (!ticket) {
    res.status(404).json({ message: 'Ticket not found' });
    return;
  }

  res.status(200).json(ticket);
});

router.post('/', authMiddleware, async (req, res) => {
  const { title, description } = req.body;

  if (
    typeof title !== 'string' ||
    title.trim() === '' ||
    typeof description !== 'string' ||
    description.trim() === ''
  ) {
    res.status(400).json({
      message: 'Title and description are required',
    });
    return;
  }

  const ticket = await createTicket({
    title: title.trim(),
    description: description.trim(),
    creator_id: res.locals.userId,
  });

  res.status(201).json(ticket);
});

router.patch('/:id/status', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const allowedStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];

  if (typeof status !== 'string' || !allowedStatuses.includes(status)) {
    res.status(400).json({
      message: 'Status must be TODO, IN_PROGRESS, or DONE',
    });
    return;
  }

  const updatedTicket = await updateTicketStatus(id, status);

  if (!updatedTicket) {
    res.status(404).json({ message: 'Ticket not found' });
    return;
  }

  res.status(200).json(updatedTicket);
});

router.post('/:id/time', authMiddleware, async (req, res) => {
  const ticketId = Number(req.params.id);
  const userId = res.locals.userId;
  const { hours } = req.body;

  if (
    !Number.isInteger(ticketId) ||
    ticketId <= 0 ||
    typeof hours !== 'number' ||
    hours <= 0
  ) {
    res.status(400).json({
      message: 'A valid ticket ID and positive number of hours are required',
    });
    return;
  }

  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    res.status(404).json({ message: 'Ticket not found' });
    return;
  }

  const timeLog = await insertTimeLog(ticketId, userId, hours);

  res.status(201).json(timeLog);
});

router.get('/:id/time', async (req, res) => {
  const ticketId = Number(req.params.id);
  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    res.status(404).json({ message: 'Ticket not found' });
    return;
  }

  const totalHours = await getTotalHoursForTicket(ticketId);

  res.status(200).json({
    ticket_id: ticketId,
    total_hours: totalHours,
  });
});

export default router;

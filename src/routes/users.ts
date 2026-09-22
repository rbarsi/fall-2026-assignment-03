import { Router } from 'express';
import { createUser, getAllUsers, getUserById } from '../dal/users.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// TODO: Student implementation - Part 1: User Routes
// GET /users
// GET /users/:id
// POST /users
router.get('/', async (_req, res) => {
  const users = await getAllUsers();
  res.status(200).json(users);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const user = await getUserById(id);

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.status(200).json(user);
});

router.post('/', authMiddleware, async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    res.status(400).json({ message: 'Name and email are required' });
    return;
  }

  const newUser = await createUser({
    name,
    email,
  });

  res.status(201).json(newUser);
});

export default router;

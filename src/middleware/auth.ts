import { Request, Response, NextFunction } from 'express';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const userIdHeader = req.get('X-User-Id');

  if (!userIdHeader) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const userId = Number(userIdHeader);

  if (!Number.isInteger(userId) || userId <= 0) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  res.locals.userId = userId;
  next();
}

export default authMiddleware;

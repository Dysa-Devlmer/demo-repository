import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const incoming = req.header('x-request-id');
  const requestId = incoming && incoming.trim() ? incoming.trim() : randomUUID();

  (req as any).requestId = requestId;
  (req as any).id = requestId;
  res.setHeader('X-Request-ID', requestId);

  next();
}

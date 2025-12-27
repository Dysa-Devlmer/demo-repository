import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

type RequestWithIds = Request & { requestId?: string; id?: string };

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const incoming = req.header('x-request-id');
  const requestId = incoming && incoming.trim() ? incoming.trim() : randomUUID();

  const reqWithIds = req as RequestWithIds;
  reqWithIds.requestId = requestId;
  reqWithIds.id = requestId;
  res.setHeader('X-Request-ID', requestId);

  next();
}

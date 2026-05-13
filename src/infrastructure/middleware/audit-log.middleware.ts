import { Request, Response, NextFunction } from 'express';
import { AuditAction } from '@/types';
import { asyncHandler } from '@/shared/utils';


export function auditLog(action: AuditAction) {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await new Promise<void>((resolve, reject) => {
      next();
      res.on('finish', resolve);
      res.on('error', reject);
    });

    if (res.statusCode >= 200 && res.statusCode < 300) {
      req.log.info(
        {
          audit: true,
          action,
          userId: req.user?.userId ?? 'anonymous',
          ip: req.ip,
          resource: res.locals.resource ?? null,
          time: Math.floor(Date.now() / 1000),
        },
        'audit'
      );
    }
  });
}

import { Request, Response, NextFunction } from 'express';
import { AuditAction } from '../../types';
import { asyncHandler } from '../../shared/utils';
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
=======
>>>>>>> Stashed changes

>>>>>>> 56a1c0220338d0bfd9ce8802249c2f90197e4c19

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
        'audit',
      );
    }
  });
}

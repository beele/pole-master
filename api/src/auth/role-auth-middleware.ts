import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

// TODO: Make this a guard!
@Injectable()
export class RoleAuthMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: () => void) {
        const user = req['user'] as {
            email: string;
            roles: string;
            type: string;
        };

        console.log(user);
        if (user.roles) {
            next();
        } else {
            RoleAuthMiddleware.accessDenied(req.url, res);
        }
    }

    private static accessDenied(url: string, res: Response) {
        res.status(403).json({
            statusCode: 403,
            timestamp: new Date().toISOString(),
            path: url,
            message: 'access denied (role)',
        });
    }
}

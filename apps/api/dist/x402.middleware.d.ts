import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class X402Middleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
}

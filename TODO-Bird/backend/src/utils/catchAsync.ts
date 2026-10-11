import { Request, Response, NextFunction } from 'express';
// CUSTOM HANDLER FOR ERROR
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
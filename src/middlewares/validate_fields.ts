import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator/src/validation-result';

const validateFields = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.mapped());
  }
  next();
};

export default validateFields;

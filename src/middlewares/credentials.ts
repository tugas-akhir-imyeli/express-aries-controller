import { NextFunction, Request, Response } from "express";

export const credentials = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header("Access-Control-Allow-Credentials", "true");
  }
  next();
};

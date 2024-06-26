// FILEPATH: /src/app.ts
import createError from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";

import { router as indexRouter } from "./routes/index";
import { corsOptions } from "./config/cors-options";
import { credentials } from "./middlewares/credentials";

export const app = express();

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

(BigInt.prototype as any).toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(credentials);

app.use(cors(corsOptions));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Set the status code to 500 (Internal Server Error)
  res.status(err.status || 500);

  // Send the error message as the response
  res.send({ message: err.message, success: false });
});

// FILEPATH: /src/app.ts
import createError from "http-errors";
import express, { Request, Response, NextFunction, urlencoded } from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";

import { router as indexRouter } from "./routes/index";
import { router as ariesRouter } from "./routes/aries";
import { router as pollRouter } from "./routes/poll";
import { router as cleanupRouter } from "./routes/cleanup";
import { router as registrationRouter } from "./routes/registration";
import { router as revocationRouter } from "./routes/revocation";
import { corsOptions } from "./config/cors-options";
import { credentials } from "./middlewares/credentials";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

(BigInt.prototype as any).toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

export const serviceApp = express();

// view engine setup
serviceApp.set("views", path.join(__dirname, "views"));
serviceApp.set("view engine", "ejs");

serviceApp.use(credentials);

serviceApp.use(cors(corsOptions));

serviceApp.use(logger("dev"));
serviceApp.use(express.json());
serviceApp.use(express.urlencoded({ extended: false }));
serviceApp.use(cookieParser());
serviceApp.use(express.static(path.join(__dirname, "public")));

serviceApp.use("/", indexRouter);
serviceApp.use("/poll", pollRouter)
serviceApp.use("/aries", ariesRouter);
serviceApp.use("/cleanup", cleanupRouter);
serviceApp.use("/registration", registrationRouter);
serviceApp.use("/revocation", revocationRouter);

// catch 404 and forward to error handler
serviceApp.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// error handler
serviceApp.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Set the status code to 500 (Internal Server Error)
  res.status(err.status || 500);

  // Send the error message as the response
  res.send({ message: err.message, success: false });
});

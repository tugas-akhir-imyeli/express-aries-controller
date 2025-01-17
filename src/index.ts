#!/usr/bin/env node

/**
 * Module dependencies.
 */

import { serviceApp } from "./app";
import debug from "debug";
import http from "http";
import * as dotenv from "dotenv";
import { oidcApp } from "./oidc";

dotenv.config();

/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.SERVER_PORT || "3000");
serviceApp.set("port", port);

/**
 * Create HTTP server.
 */

var server = http.createServer(serviceApp);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

oidcApp.listen(3000);
/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: { syscall: string; code: string }) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr?.port;
  debug("Listening on " + bind);
  console.log(`Server is running on address ${addr}`)
  console.log(`Server is running on port ${port}`)
}

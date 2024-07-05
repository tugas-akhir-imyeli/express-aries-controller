import express from "express";
import dotenv from 'dotenv';
import { createProofRequest } from "../helper/request";
export var router = express.Router();

dotenv.config();
/* GET home page. */
router.get("/", async function (req, res, next) {
  try{
    res.send({ message: "Hello World" }).status(200);
  } catch(error:any){
    console.error(error.message);
    res.send({ message: "Internal Server Error", error: error }).status(500);
  }
});
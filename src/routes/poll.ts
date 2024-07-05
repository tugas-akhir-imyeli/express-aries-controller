import express from "express";
import axios from 'axios';
import dotenv from 'dotenv';
import { headers } from "../interfaces/header";
export var router = express.Router();

dotenv.config();
/* GET home page. */
router.get("/presentation/:connectionId", async function (req, res, next) {
  try{
    const connectionId = req.params.connectionId;
    const session = await prisma.proof_session.findFirst({
        where: {
            connection_id: connectionId
        }
    });

    console.log("SESSION")
    console.log(session,"\n")
    if(!session){
        res.send({ message: "Session not found", verified: false }).status(404);
        return
    }

    if(session.verified === true){
        res.send({ message: "Session already verified", verified: true }).status(200);
        return
    }else if(session.verified === false){
        res.send({ message: "Your identity cannot be verified", verified: false }).status(200);
        return    
    }

    res.send({ message: "", verified: null }).status(200);
  } catch(error:any){
    console.error(error.message);
    res.send({ message: "Internal Server Error", error: error }).status(500);
  }
});
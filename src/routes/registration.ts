import express from "express";
import dotenv from 'dotenv';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getInvitation } from "../module/invitation";
import { createProofRequest, createUuidOffer } from "../helper/request";
import { headers } from "../interfaces/header";
export var router = express.Router();

dotenv.config();

router.get("/", async function (req, res, next) {
    try{
        const invitation = await getInvitation();
        res.render("register", { invitation: invitation , ARIES_URL: process.env.ARIES_URL});
    } catch(error:any){
        console.error(error.message);
        res.send({ message: "Internal Server Error", error: error }).status(500);
    }
});

router.post("/verify", async function (req, res, next) {
    try{
        console.log(req.body)
        const {message_id} = req.body;
        const connections = await axios.get(`${process.env.ARIES_URL}/connections`);
        const connection = connections.data.results.filter((data) => data.invitation_msg_id === message_id);
        const connectionId = connection[0].connection_id;      
        const proofRequest = createProofRequest(connectionId);
        const requestUrl = `${process.env.ARIES_URL}/present-proof-2.0/send-request`; 
        console.log(requestUrl)
        console.log(proofRequest)
        await axios.post(`${process.env.ARIES_URL}/present-proof-2.0/send-request`, proofRequest, {headers: headers});
        const uuid = uuidv4();
        await prisma.account.create({
            data: {
                uuid: uuid,
                is_legal_age: true,
                cred_rev_id: "",
                rev_reg_id: "",
            }
        });
        res.render("verify-age", {connectionId: connectionId, uuid: uuid, messageId: message_id});
    } catch(error:any){
        console.error(error.message);
        res.send({ message: "Internal Server Error", error: error }).status(500);
    }
  });

  router.post("/issue", async function (req, res, next) {
    try{
        const { connectionId, uuid, messageId } = req.body;
        console.log("Connection ID", connectionId)
        console.log("UUID", uuid)
        const account = await prisma.account.findFirst({
            where: {
                uuid: uuid
            }
        });
        if(!account){
            return res.send({ message: "Account not found" }).status(404);
        }
        const offer = createUuidOffer(connectionId, uuid);
        const offerUrl = `${process.env.ARIES_URL}/issue-credential-2.0/send-offer`
        console.log(offerUrl);
        await axios.post(offerUrl, offer, {headers: headers});
        
        res.send({ message: "Offer has been sent" }).status(200);
    } catch(error:any){
        console.error(error.message);
        res.send({ message: "Internal Server Error", error: error }).status(500);
    }
  }
);

router.get("/end", async function (req, res, next) {
    try{
        res.render("registration-end")
    } catch(error:any){
        console.error(error.message);
        res.send({ message: "Internal Server Error", error: error }).status(500);
    }
  }
);

router.post("/delete-account", async function (req, res, next) {
    try{
        const {uuid} = req.body;
        const account = await prisma.account.findFirst({
            where: {
                uuid: uuid
            }
        });
        await prisma.account.delete({
            where: {
                id: account.id
            }
        });
        res.send({ message: "Account has been deleted" }).status(200);
    } catch(error:any){
        console.error(error.message);
        res.send({ message: "Internal Server Error", error: error }).status(500);
    }
  });
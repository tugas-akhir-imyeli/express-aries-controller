import express from "express";
import dotenv from 'dotenv';
import axios from 'axios';
export var router = express.Router();

dotenv.config();
/* GET home page. */
router.post("/connections", async function (req, res, next) {
  try{
    const {ARIES_URL} = req.body;
    const connections = await axios.get(`${ARIES_URL}/connections`);
    for (let connection of connections.data.results){
      await axios.delete(`${ARIES_URL}/connections/${connection.connection_id}`);
    }
    res.send({ message: "All connections have been deleted" }).status(200);
  } catch(error:any){
    console.error(error.message);
    res.send({ message: "Internal Server Error", error: error }).status(500);
  }
});

router.post("/presentation-records", async function (req, res, next) {
    try{
      const {ARIES_URL} = req.body;
      const presentations = await axios.get(`${ARIES_URL}/present-proof-2.0/records`);
      for (let presentation of presentations.data.results){
        await axios.delete(`${ARIES_URL}/present-proof-2.0/records/${presentation.pres_ex_id}`);
      }
      res.send({ message: "All presentation records have been deleted" }).status(200);
    } catch(error:any){
      console.error(error.message);
      res.send({ message: "Internal Server Error", error: error }).status(500);
    }
  });

  router.post("/credentials", async function (req, res, next) {
    try{
      const {ARIES_URL} = req.body;
      const credentials = await axios.get(`${ARIES_URL}/credentials`);
      for (let credential of credentials.data.results){
        await axios.delete(`${ARIES_URL}/credential/${credential.referent}`);
      }
      res.send({ message: "All Credentials have been deleted" }).status(200);
    } catch(error:any){
      console.error(error.message);
      res.send({ message: "Internal Server Error", error: error }).status(500);
    }
  });

  router.post("/credential-exchange-records", async function (req, res, next) {
    try{
      const {ARIES_URL} = req.body;
      const credentials = await axios.get(`${ARIES_URL}/issue-credential-2.0/records`);
      for (let credential of credentials.data.results){
        await axios.delete(`${ARIES_URL}/issue-credential-2.0/records/${credential.cred_ex_record.cred_ex_id}`);
      }
      res.send({ message: "All Credentials have been deleted" }).status(200);
    } catch(error:any){
      console.error(error.message);
      res.send({ message: "Internal Server Error", error: error }).status(500);
    }
  });
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

  router.post("/default-clean-all", async function (req, res, next) {
    try{
      
      const ARIES_URL = ["http://127.0.0.1:11000", "http://127.0.0.1:11001", "http://127.0.0.1:11002"]
      for (let url of ARIES_URL){
        const connections = await axios.get(`${url}/connections`);
        for (let connection of connections.data.results){
          await axios.delete(`${url}/connections/${connection.connection_id}`);
        }
  
        const presentations = await axios.get(`${url}/present-proof-2.0/records`);
        for (let presentation of presentations.data.results){
          await axios.delete(`${url}/present-proof-2.0/records/${presentation.pres_ex_id}`);
        }
  
        const credentials = await axios.get(`${url}/credentials`);
        for (let credential of credentials.data.results){
          await axios.delete(`${url}/credential/${credential.referent}`);
        }
  
        const credentialExchangeRecords = await axios.get(`${url}/issue-credential-2.0/records`);
        for (let credential of credentialExchangeRecords.data.results){
          await axios.delete(`${url}/issue-credential-2.0/records/${credential.cred_ex_record.cred_ex_id}`);
        }
      }

      res.send({ message: "All records for clean start have been deleted" }).status(200);
    } catch(error:any){
      console.error(error.message);
      res.send({ message: "Internal Server Error", error: error }).status(500);
    }
  });
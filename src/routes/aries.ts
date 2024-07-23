import express from "express";
import axios from 'axios';
import dotenv from 'dotenv';
export var router = express.Router();

dotenv.config();

/* GET home page. */
router.post("/webhook/topic/out_of_band", async function (req, res, next) {
  try{
    console.log(req.body,'\n\n')
    res.send().status(200);
  } catch(error:any){
    console.error(error.message);
    res.send({ message: "Internal Server Error", error: error }).status(500);
  }
});

router.post("/webhook/topic/connections", async function (req, res, next) {
    try{
      console.log(req.body,'\n\n')
      res.send().status(200);
    } catch(error:any){
      console.error(error.message);
      res.send({ message: "Internal Server Error", error: error }).status(500);
    }
  });

  router.post("/webhook/topic/issue_credential_v2_0", async function (req, res, next) {
    try{
      console.log(req.body,'\n\n')
      if(req.body.state === "request-received"){
        const cred_ex_id = req.body.cred_ex_id;
        const issueUrl = `${process.env.ARIES_URL}/issue-credential-2.0/records/${cred_ex_id}/issue`
        const res = await axios.post(issueUrl, {"comment": "Here's the creds"});
        const cred_rev_id = res.data.indy.cred_rev_id
        const rev_reg_id = res.data.indy.rev_reg_id
        
        //Get credential attributes
        const proofSessionNim = await prisma.proof_session.findFirst({
          where: {
            connection_id: req.body.connection_id
          }
        });
        const nim = proofSessionNim.nim
        const uuid = (await res.data.cred_ex_record.cred_offer.credential_preview.attributes.filter((attr)=> attr.name === "uuid"))[0].value
        const account = await prisma.account.findFirst({
          where: {
            uuid: uuid
          }
        });
        if(!account){
          await prisma.account.create({
            data: {
                uuid: uuid,
                is_legal_age: true,
                nim: nim,
                cred_rev_id: cred_rev_id,
                rev_reg_id: rev_reg_id,
              }
          });
        }else {
          await prisma.account.update({
            where: {
              id: account.id
            },
            data: {
              is_legal_age: true,
              nim: nim,
              cred_rev_id: cred_rev_id,
              rev_reg_id: rev_reg_id
            }
          });
        }
        // Get proof session using messageId
        const proofSession = await prisma.proof_session.findFirst({
          where: {
              connection_id: req.body.connection_id
          }
        });
        // Delete proof session
        await prisma.proof_session.delete({
            where: {
                id: proofSession.id
            }
        });

        await prisma.log.create({
          data: {
            message: "Credential Issued for account with uuid: " + uuid,
            actor: "Issuer",
            activity: "Issue Credential",
          }
        });
      }
      res.send().status(200);
    } catch(error:any){
      console.error(error.message);
      res.send({ message: "Internal Server Error", error: error }).status(500);
    }
  });
  router.post("/webhook/topic/issue_credential_v2_0_indy", async function (req, res, next) {
    try{
      console.log(req.body,'\n\n')
      res.send().status(200);
    } catch(error:any){
      console.error(error.message);
      res.send({ message: "Internal Server Error", error: error }).status(500);
    }
  });
  router.post("/webhook/topic/present_proof_v2_0", async function (req, res, next) {
    try{
      console.log(req.body,'\n\n')
      if(req.body.state === "abandoned"){
        const proofSession = await prisma.proof_session.findFirst({
          where: {
            connection_id: req.body.connection_id
          }
        });
        if(proofSession){
          await prisma.proof_session.update({
            where: {
              id: proofSession.id
            },
            data: {
              state: 'abandoned',
              verified: false
            }
          });
        }
        // Axios delete request localhost:11000/present-proof-2.0/records/req.body.pres_ex_id
        await axios.delete(`${process.env.ARIES_URL}/present-proof-2.0/records/${req.body.pres_ex_id}`);
      }else if (req.body.verified && req.body.verified === "true"){
        //Check if the proof_seesion already exist
        const proofSession = await prisma.proof_session.findFirst({
          where: {
            connection_id: req.body.connection_id
          }
        });
        if(proofSession){
          await prisma.proof_session.update({
            where: {
              id: proofSession.id
            },
            data: {
              verified: true,
              state: 'done'
            }
          });
        }else{
          await prisma.proof_session.create({
            data: {
              connection_id: req.body.connection_id,
              verified: true,
              state: 'done',
              account_id: " ",
              nim: "",
              operation: " "
            }
          });
        }
      }else if (req.body.verified && req.body.verified === "false"){
        //Check if the proof_seesion already exist
        const proofSession = await prisma.proof_session.findFirst({
          where: {
            connection_id: req.body.connection_id
          }
        });
        if(proofSession){
          await prisma.proof_session.update({
            where: {
              id: proofSession.id
            },
            data: {
              verified: false,
              state: 'done'
            }
          });
        }else{
          await prisma.proof_session.create({
            data: {
              connection_id: req.body.connection_id,
              verified: false,
              state: 'done',
              account_id: " ",
              operation: " ",
              nim: " "
            }
          });
        }
      } else if (req.body.state === "presentation-received"){
        const record = await axios.get(`${process.env.ARIES_URL}/present-proof-2.0/records/${req.body.pres_ex_id}`);
        const credDefId = record.data.by_format.pres.indy.identifiers[0].cred_def_id
        console.log("CRED DEF ID")
        console.log(credDefId)
        //Check if the record.results.by_format.pres_request.requested_predicates.age_over_18.restrictions[0].cred_ref.id is equal to MtG3d7RxPQVaU1ZNCDbnP:3:CL:21:default
        if(credDefId === "6P15ETqMotkRBHzTopo9xW:3:CL:1369527:default"){
          console.log("MASUK")
          const accountId = record.data.by_format.pres_request.indy.requested_attributes.property.restrictions[0]["attr::uuid::value"]
          console.log(accountId)
          const proofSession = await prisma.proof_session.findFirst({
            where: {
              connection_id: req.body.connection_id
            }
          });
          console.log("PROOF SESSION")
          console.log(proofSession)
          if(proofSession){
            console.log("MASUK IF")
            if(proofSession.operation !== "login"){
              console.log("BUKAN LOGIN")
              //Update proof session verified to false
              await prisma.proof_session.update({
                where: {
                  id: proofSession.id
                },
                data: {
                  verified: false
                }
              });
              return
            }
            console.log("INI LOGIN UPDATE")
            await prisma.proof_session.update({
              where: {
                id: proofSession.id
              },
              data: {
                state: "presentation-received",
                account_id: accountId,
                operation: "login"
              }
            });
          }else {
            await prisma.proof_session.create({
              data: {
                connection_id: req.body.connection_id,
                state: "presentation-received",
                account_id: accountId,
                operation: "login",
                nim: ""
              }
            });
          }
        } else if (credDefId === "MtG3d7RxPQVaU1ZNCDbnP:3:CL:1369520:2"){
          const nim = record.data.by_format.pres.indy.requested_proof.revealed_attrs.profile.raw
          console.log("INI NIM")
          console.log(nim)
          const proofSession = await prisma.proof_session.findFirst({
            where: {
              connection_id: req.body.connection_id
            }
          })
          if(proofSession){
            await prisma.proof_session.update({
              where: {
                id: proofSession.id
              },
              data: {
                state: "presentation-received",
                operation: "register",
                account_id: "",
                nim: nim
              }
            });
          }else {
            await prisma.proof_session.create({
              data: {
                connection_id: req.body.connection_id,
                state: "presentation-received",
                account_id: "",
                operation: "register",
                nim: nim
              }
            });
          }
        }
      }
      res.send().status(200);
    } catch(error:any){
      console.error(error.message);
      res.send({ message: "Internal Server Error", error: error }).status(500);
    }
  });

  router.post("/webhook/topic/revocation_registry", async function (req, res, next) {
    try{
      console.log(req.body,'\n\n')
      res.send().status(200);
    } catch(error:any){
      console.error(error.message);
      res.send({ message: "Internal Server Error", error: error }).status(500);
    }
  });

  router.post("/webhook/topic/issuer_cred_rev", async function (req, res, next) {
    try{
      console.log(req.body,'\n\n')
      res.send().status(200);
    } catch(error:any){
      console.error(error.message);
      res.send({ message: "Internal Server Error", error: error }).status(500);
    }
  });

  router.post("/webhook/topic/problem_report", async function (req, res, next) {
    try{
      console.log(req.body,'\n\n')
      res.send().status(200);
    } catch(error:any){
      console.error(error.message);
      res.send({ message: "Internal Server Error", error: error }).status(500);
    }
  });
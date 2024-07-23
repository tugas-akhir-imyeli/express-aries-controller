// FILEPATH: /src/app.ts
import express, { Request, Response, NextFunction, urlencoded } from "express";
import Provider from 'oidc-provider';

import { configuration } from "./config/provider";
import * as querystring from 'node:querystring';
import { inspect } from 'node:util';
import { fileURLToPath } from "url";
import { strict as assert } from 'node:assert';
import prisma from "./db";
import path from "path";
import axios from 'axios';
import { credentials } from "./middlewares/credentials";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { corsOptions } from "./config/cors-options";
import { getInvitation } from "./module/invitation";

export const oidcApp = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

oidcApp.set("views", path.join(__dirname, "views"));
oidcApp.set("view engine", "ejs");
oidcApp.use(credentials);

oidcApp.use(cors(corsOptions));

oidcApp.use(logger("dev"));
oidcApp.use(express.json());
oidcApp.use(express.urlencoded({ extended: false }));
oidcApp.use(cookieParser());
oidcApp.use(express.static(path.join(__dirname, "public")));

function setNoCache(req, res, next) {
    res.set('cache-control', 'no-store');
    next();
  }
  
  //Implement isEmpty function
  function isEmpty(value) {
    return value === null || value === undefined || value === '';
  }
  
  const body = urlencoded({ extended: false });
  const keys = new Set();
  const debug = (obj) => querystring.stringify(Object.entries(obj).reduce((acc, [key, value]) => {
    keys.add(key);
    if (isEmpty(value)) return acc;
    acc[key] = inspect(value, { depth: null });
    return acc;
  }, {}), '<br/>', ': ', {
    encodeURIComponent(value) { return keys.has(value) ? `<strong>${value}</strong>` : value; },
  });
  
  const oidc = new Provider(`http://localhost:${process.env.OIDC_PORT}`, configuration);
  oidcApp.use('/oidc', oidc.callback());
  
  oidcApp.get('/interaction/:uid', setNoCache, async (req, res, next) => {
    try {
        const {
            uid, prompt, params, session,
        } = await oidc.interactionDetails(req, res);
    
        const client = await oidc.Client.find(params.client_id);

        console.log("FIRSTTTTTTTTTTTTTTTTTTTTTT")
        console.log(req.body)

  
        switch (prompt.name) {
            case 'login': {
              const invitation = await getInvitation();
              return res.render('login', {
                  uid,
                  invitation : invitation,
                  details: prompt.details,
                  ARIES_URL: process.env.ARIES_URL,
                  params,
                  title: 'Sign-in',
                  session: session ? debug(session) : undefined,
                  dbg: {
                  params: debug(params),
                  prompt: debug(prompt),
                  },
              });
            }
            case 'consent': {
            return res.render('interaction', {
                client,
                uid,
                details: prompt.details,
                params,
                title: 'Authorize',
                session: session ? debug(session) : undefined,
                dbg: {
                params: debug(params),
                prompt: debug(prompt),
                },
            });
            }
            default:
            return undefined;
        }
    } catch (err) {
      return next(err);
    }
  });

  oidcApp.post('/interaction/:uid/verify-id', setNoCache, body, async (req, res, next) => {
    try {
      const {  prompt, params, session } = await oidc.interactionDetails(req, res);
      const uid = req.params.uid;
      console.log("UID", uid)
      console.log("Prompt", prompt)
      console.log("Params", params)
      console.log("Session", session)
      console.log("body", req.body.message_id)
      const connDatas = await axios.get(`${process.env.ARIES_URL}/connections`);
      // filter all datas that have message_id equal to req.body.message_id
      const connData = connDatas.data.results.filter((data) => data.invitation_msg_id === req.body.message_id);
      if(connData.length === 0){
        return res.status(400).send({ message: "Connection not found" });
      }

      console.log("Connection Data", connData[0])

      // Check if the proof_seesion already exist
      const proofSession = await prisma.proof_session.findFirst({
        where: {
          connection_id: connData[0].connection_id
        }
      });
      if(proofSession){
        await prisma.proof_session.update({
          where: {
            id: proofSession.id
          },
          data: {
            message_id: req.body.message_id,
            operation: "login",
            uid: uid
          }
        });
      }else{
        await prisma.proof_session.create({
          data: {
            connection_id: connData[0].connection_id,
            message_id: req.body.message_id,
            uid: uid,
            state: "initial",
            account_id: "",
            operation: "login",
            nim: ""
          }
        });
      }
      res.render('verify-id', {
          uid,
          details: prompt.details,
          params,
          port: process.env.SERVER_PORT,
          connectionId : connData[0].connection_id,
          title: 'Verify ID',
          session: session ? debug(session) : undefined,
          dbg: {
            params: debug(params),
            prompt
          },
        }
      )
    } catch (err) {
        next(err);
    }
  })
  
  oidcApp.post('/interaction/:uid/login', setNoCache, body, async (req, res, next) => {
    try {
        const { prompt: { name } } = await oidc.interactionDetails(req, res);
        assert.equal(name, 'login');
        const {connectionId} = req.body;

        console.log("BEFORE PROOF SESSION")

        const proofSession = await prisma.proof_session.findFirst({
            where: {
                uid: req.params.uid
            }
        });
        console.log("BBBBBBBBBBBBB")
        console.log(connectionId)
        console.log(proofSession)

        console.log("BEFORE ACCOUNT")
        
        const account = await prisma.account.findFirst({
            where: {
                uuid: proofSession.account_id
            }
          });
        
        console.log("ACCOUNT")
        console.log(account)
        const result = {
            login: {
            accountId: account.uuid,
            },
        };

      await prisma.log.create({
        data: {
          message: "User with UUID " + proofSession.account_id +  " has been verified",
          actor: "User",
          activity: "Verify ID",
        }
      });

      // Delete proof session
      await prisma.proof_session.delete({
        where: {
            id: proofSession.id
        }
      });
    
        await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
        } catch (err) {
            next(err);
        }
  });
  
  oidcApp.post('/interaction/:uid/confirm', setNoCache, body, async (req, res, next) => {
    try {
      const interactionDetails = await oidc.interactionDetails(req, res);
      const { prompt: { name, details }, params, session: { accountId } } = interactionDetails;
      assert.equal(name, 'consent');
  
      let { grantId } = interactionDetails;
      let grant;
  
      if (grantId) {
        // we'll be modifying existing grant in existing session
        grant = await oidc.Grant.find(grantId);
      } else {
        // we're establishing a new grant
        grant = new oidc.Grant({
          accountId,
          clientId: params.client_id,
        });
      }
  
      if (details.missingOIDCScope) {
        grant.addOIDCScope(details.missingOIDCScope.join(' '));
      }
      if (details.missingOIDCClaims) {
        grant.addOIDCClaims(details.missingOIDCClaims);
      }
      if (details.missingResourceScopes) {
        for (const [indicator, scopes] of Object.entries(details.missingResourceScopes)) {
          grant.addResourceScope(indicator, (scopes as any).join(' '));
        }
      }
  
      grantId = await grant.save();
  
      const consent = {};
      if (!interactionDetails.grantId) {
        // we don't have to pass grantId to consent, we're just modifying existing one
        (consent as any).grantId = grantId;
      }
  
      const result = { consent };
      await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
    } catch (err) {
      next(err);
    }
  });
  
  oidcApp.get('/interaction/:uid/abort', setNoCache, async (req, res, next) => {
    try {
      const result = {
        error: 'access_denied',
        error_description: 'End-User aborted interaction',
      };
      await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
    } catch (err) {
      next(err);
    }
  });

  oidcApp.get("/registration", async (req, res) => {
    try{
      res.redirect(`http://localhost:${process.env.SERVER_PORT}/registration`);
    }catch(err){
      console.log(err);
      res.send({ message: err.message });
    }
  });
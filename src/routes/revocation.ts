import express from "express";
import dotenv from 'dotenv';
import axios from "axios";
export var router = express.Router();

dotenv.config();
/* GET home page. */
router.get("/", async function (req, res, next) {
  try{
    const accountData = await prisma.account.findMany();
    res.render("revocation", { accountData: accountData });
  } catch(error:any){
    console.error(error.message);
    res.send({ message: "Internal Server Error", error: error }).status(500);
  }
});

router.post("/revoke", async function (req, res, next) {
    try{
        const { cred_rev_id, rev_reg_id, id } = req.body;
        const comment = "Revoked"
        const publish = true

        await axios.post(`${process.env.ARIES_URL}/revocation/revoke`, {
            cred_rev_id: cred_rev_id,
            publish: publish,
            comment: comment,
            rev_reg_id: rev_reg_id
        });

        await prisma.account.delete({
            where: {
                id: parseInt(id)
            }
        });
        //Redirect to revoke page
        res.redirect('/revocation');
    } catch(error:any){
        console.error(error.message);
        res.send({ message: "Internal Server Error", error: error }).status(500);
    }
});
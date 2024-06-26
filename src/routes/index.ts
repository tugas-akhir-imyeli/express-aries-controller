import express from "express";
export var router = express.Router();

/* GET home page. */
router.get("/", async function (req, res, next) {
  try{
    res.send({ message: "Hello World" }).status(200);
  } catch(error:any){
    console.error(error.message);
    res.send({ message: "Internal Server Error", error: error }).status(500);
  }
});

import express from "express";
import { authenticate,register } from "../middleware/authenticate.js";
const authRouter=express.Router()
authRouter.post("/login",authenticate)
authRouter.post("/register",register)
export {authRouter}
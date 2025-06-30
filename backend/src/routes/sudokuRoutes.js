import express from "express";
import { generatePuzzle,validateSubmission,verifyMove } from "../controller/sudokuController.js";
import verifyToken from "../middleware/verifyToken.js";
const sudokuRouter=express.Router()
sudokuRouter.post("/generate",verifyToken,generatePuzzle)
sudokuRouter.post("/verifymove",verifyToken,verifyMove)
sudokuRouter.post("/validatesubmission",verifyToken,validateSubmission)

export {sudokuRouter}
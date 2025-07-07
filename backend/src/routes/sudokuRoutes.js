import express from "express";
import { generatePuzzle,validateSubmission,verifyMove } from "../controller/sudokuController.js";
const sudokuRouter=express.Router()
sudokuRouter.post("/generate",generatePuzzle)
sudokuRouter.post("/verifymove",verifyMove)
sudokuRouter.post("/validatesubmission",validateSubmission)

export {sudokuRouter}
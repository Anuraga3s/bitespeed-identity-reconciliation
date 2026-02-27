import express from "express";
import { identify } from "../controllers/identify.controller";

const router = express.Router();
router.post("/identify", identify);

export default router;
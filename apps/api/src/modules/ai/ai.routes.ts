import { Router } from "express";
import { AIController } from "./ai.controller.js";

const router = Router();
const controller = new AIController();

router.post("/review", (req, res) => controller.review(req, res));

export default router;
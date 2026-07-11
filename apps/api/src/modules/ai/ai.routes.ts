import { Router } from "express";
import { AIController } from "./ai.controller.js";

const router = Router();
const controller = new AIController();

router.post("/review", (req, res) => controller.review(req, res));
router.post("/parse-workflow", (req, res) => controller.parseWorkflow(req, res));

export default router;
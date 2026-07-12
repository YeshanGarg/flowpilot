import { Router } from "express";
import { AIController } from "./ai.controller.js";

const router = Router();
const controller = new AIController();

router.post("/review", (req, res) => controller.review(req, res));
router.post("/parse-workflow", (req, res) => controller.parseWorkflow(req, res));
router.post("/escalation", (req, res) => controller.escalation(req, res));
router.get("/auto-escalation", (req, res) => controller.getAutoEscalation(req, res));
router.post("/auto-escalation", (req, res) => controller.setAutoEscalation(req, res));

export default router;
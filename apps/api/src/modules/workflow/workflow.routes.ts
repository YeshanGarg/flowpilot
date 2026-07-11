import { Router } from "express";
import { WorkflowController } from "./workflow.controller.js";

const router = Router();
const workflowController = new WorkflowController();

router.post("/", (req, res) => workflowController.create(req, res));
router.get("/", (req, res) => workflowController.findAll(req, res));
router.get("/:id", (req, res) => workflowController.findById(req, res));
router.post("/:id/approve", (req, res) => workflowController.approve(req, res));
router.post("/:id/reject", (req, res) => workflowController.reject(req, res));

export default router;

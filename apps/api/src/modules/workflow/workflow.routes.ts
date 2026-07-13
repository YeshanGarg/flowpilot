import { Router } from "express";
import { WorkflowController } from "./workflow.controller.js";
import { requireAdmin } from "../../core/middleware/require-admin.js";

const router = Router();
const workflowController = new WorkflowController();

router.post("/", (req, res) => workflowController.create(req, res));
router.get("/", (req, res) => workflowController.findAll(req, res));
router.post("/end-demo", (req, res) => workflowController.endDemo(req, res));
router.get("/:id", (req, res) => workflowController.findById(req, res));
router.post("/:id/approve", (req, res) => workflowController.approve(req, res));
router.post("/:id/reject", (req, res) => workflowController.reject(req, res));
router.post("/:id/remind", (req, res) => workflowController.remind(req, res));
router.delete("/:id", requireAdmin, (req, res) => workflowController.remove(req, res));

export default router;

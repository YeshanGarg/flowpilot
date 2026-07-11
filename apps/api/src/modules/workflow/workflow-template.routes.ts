import { Router } from "express";
import { WorkflowTemplateController } from "./workflow-template.controller.js";

const router = Router();
const workflowTemplateController = new WorkflowTemplateController();

router.post("/", (req, res) => workflowTemplateController.create(req, res));
router.get("/", (req, res) => workflowTemplateController.findAll(req, res));
router.get("/:id", (req, res) => workflowTemplateController.findById(req, res));

export default router;

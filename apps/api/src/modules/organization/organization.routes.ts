import { Router } from "express";
import { OrganizationController } from "./organization.controller.js";

const organizationController = new OrganizationController();
const router = Router();

router.post("/", (req, res) => organizationController.create(req, res));
router.get("/", (req, res) => organizationController.findAll(req, res));
router.get("/:id", (req, res) => organizationController.findById(req, res));

export default router;
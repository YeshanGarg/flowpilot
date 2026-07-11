import { UserController } from "./user.controller.js";
import { Router } from "express";

const router = Router();
const userController = new UserController();

router.post("/", (req, res) => userController.create(req, res));
router.get("/", (req, res) => userController.findAll(req, res));
router.get("/:id", (req, res) => userController.findById(req, res));

export default router;
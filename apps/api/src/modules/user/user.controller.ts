import { UserService } from "./user.service.js";
import type { Request, Response } from "express";

const userService = new UserService();

export class UserController {
    async create(req: Request, res: Response) {
        const createUserDto = req.body;
        const user = await userService.create(createUserDto);
        return res.status(201).json({"success": true, "data": user});
    }

    async findAll(_: Request, res: Response) {
        const users = await userService.findAll();
        return res.status(200).json({ success: true, data: users });
    }

    async findById(req: Request, res: Response) {
        const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) ?? "";
        const user = await userService.findById(id);
        return res.status(200).json({ success: true, data: user });
    }
}
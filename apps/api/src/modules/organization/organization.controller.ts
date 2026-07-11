import type { Request, Response } from "express";
import { OrganizationService } from "./organization.service.js";

const organizationService = new OrganizationService();

export class OrganizationController {
  async create(req: Request, res: Response) {
    const createOrganizationDto = req.body;
    const organization = await organizationService.create(createOrganizationDto);
    return res.status(201).json({ success: true, data: organization });
  }

  async findAll(_: Request, res: Response) {
    const organizations = await organizationService.findAll();
    return res.status(200).json({ success: true, data: organizations });
  }

  async findById(req: Request, res: Response) {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) ?? "";
    const organization = await organizationService.findById(id);
    return res.status(200).json({ success: true, data: organization });
  }
}
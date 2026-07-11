import prismaClient from "../../core/database/prisma.js";
import type { CreateOrganizationDto } from "./organization.types.js";

export class OrganizationRepository {
    async create(createOrganizationDto: CreateOrganizationDto) {
        const { name } = createOrganizationDto;
        return prismaClient.organization.create({
            data: { name }
        });
    }

    async findById(id: string) {
        return prismaClient.organization.findUnique({
            where: { id }
        });
    }

    async findAll() {
        return prismaClient.organization.findMany();
    }
}
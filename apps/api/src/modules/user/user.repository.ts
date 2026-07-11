import prismaClient from "../../core/database/prisma.js";
import type { CreateUserDto } from "./user.types.js";

export class UserRepository {
    async create(createUserDto: CreateUserDto) {
        const { name, email, organizationId, managerId, role } = createUserDto;
        return prismaClient.user.create({
            data: {
                name,
                email,
                organizationId,
                managerId: managerId ?? null,
                role: role ?? "EMPLOYEE",
            }
        });
    }

    async findById(id: string) {
        return prismaClient.user.findUnique({
            where: { id }
        });
    }

    async findAll() {
        return prismaClient.user.findMany({
            orderBy: { createdAt: "desc" }
        });
    }
}
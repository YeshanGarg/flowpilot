import prismaClient from "../../core/database/prisma.js";
import type { CreateWorkflowTemplateDto } from "./workflow-template.types.js";

export class WorkflowTemplateRepository {
    async create(createWorkflowTemplateDto: CreateWorkflowTemplateDto) {
        const { name, description, organizationId, steps } = createWorkflowTemplateDto;
        return prismaClient.workflowTemplate.create({
            data: {
                name,
                description: description ?? null,
                organizationId,
                steps: {
                        create: steps.map(({ order, name, type }) => ({
                            order,
                            name,
                            type
                        }))
                    }
                },
            include: {
                steps: true
            }
        });
    }

    async findAll() {
        return prismaClient.workflowTemplate.findMany({
            include: {
                steps: {
                    orderBy: { order: "asc" }
                }
            },
            orderBy: { createdAt: "desc" }
        });
    }

    async findById(id: string) {
        return prismaClient.workflowTemplate.findUnique({
            where: { id },
            include: {
                steps: {
                    orderBy: { order: "asc" }
                }
            }
        });
    }
}
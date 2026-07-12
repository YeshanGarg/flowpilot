import prismaClient from "../../core/database/prisma.js";
import { WorkflowStatus, WorkflowStepStatus } from "../../../generated/prisma/client.js";
import { AppError } from "../../core/errors/app-error.js";
import type { CreateWorkflowDto } from "./workflow.types.js";

export class WorkflowRepository {
    async create(createWorkflowDto: CreateWorkflowDto) {
        const { title, workflowTemplateId, requesterId, organizationId, payload } = createWorkflowDto;

        return prismaClient.$transaction(async (prisma) => {
            const template = await prisma.workflowTemplate.findUnique({
                where: { id: workflowTemplateId },
                include: {
                    steps: {
                        orderBy: { order: "asc" }
                    }
                }
            });

            if (!template) {
                throw new AppError("Workflow template not found");
            }

            if (template.steps.length === 0) {
                throw new AppError("Workflow template has no steps");
            }

            if (template.organizationId !== organizationId) {
                throw new AppError("Workflow template does not belong to the organization");
            }

            const requester = await prisma.user.findUnique({
                where: { id: requesterId }
            });

            if (!requester) {
                throw new AppError("Requester not found");
            }

            if (requester.organizationId !== organizationId) {
                throw new AppError("Requester does not belong to the organization");
            }

            const workflow = await prisma.workflow.create({
                data: {
                    title,
                    workflowTemplateId,
                    requesterId,
                    organizationId,
                    payload,
                    status: WorkflowStatus.RUNNING,
                    currentStepOrder: template.steps[0]!.order
                }
            });

            await prisma.workflowStepExecution.createMany({
                data: template.steps.map((step, index) => ({
                    workflowId: workflow.id,
                    workflowTemplateStepId: step.id,
                    status: index === 0 ? WorkflowStepStatus.ACTIVE : WorkflowStepStatus.PENDING,
                    startedAt: index === 0 ? new Date() : null
                }))
            });

            await prisma.auditLog.create({
                data: {
                    workflowId: workflow.id,
                    action: "WORKFLOW_CREATED",
                    actor: requesterId,
                    message: `Workflow '${title}' created`
                }
            });

            return prisma.workflow.findUnique({
                where: { id: workflow.id },
                include: {
                    workflowTemplate: {
                        include: {
                            steps: {
                                orderBy: { order: "asc" }
                            }
                        }
                    },
                    workflowSteps: {
                        include: {
                            workflowTemplateStep: true
                        },
                        orderBy: {
                            workflowTemplateStep: {
                                order: "asc"
                            }
                        }
                    },
                    auditLogs: {
                        orderBy: { createdAt: "asc" }
                    }
                }
            });
        });
    }

    async findById(id: string) {
        return prismaClient.workflow.findUnique({
            where: { id },
            include: {
                workflowTemplate: {
                    include: {
                        steps: {
                            orderBy: { order: "asc" }
                        }
                    }
                },
                workflowSteps: {
                    include: {
                        workflowTemplateStep: true,
                        assignedToUser: true,
                        actedByUser: true
                    },
                    orderBy: {
                        workflowTemplateStep: {
                            order: "asc"
                        }
                    }
                },
                auditLogs: {
                    orderBy: { createdAt: "asc" }
                }
            }
        });
    }

    async deleteById(workflowId: string) {
        return prismaClient.$transaction(async (prisma) => {
            const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });

            if (!workflow) {
                throw new AppError("Workflow not found", 404);
            }

            await prisma.auditLog.deleteMany({ where: { workflowId } });
            await prisma.workflowStepExecution.deleteMany({ where: { workflowId } });
            await prisma.workflow.delete({ where: { id: workflowId } });

            return { id: workflowId };
        });
    }

    async addReminder(workflowId: string, message: string) {
        const workflow = await prismaClient.workflow.findUnique({ where: { id: workflowId } });

        if (!workflow) {
            throw new Error("Workflow not found");
        }

        await prismaClient.auditLog.create({
            data: {
                workflowId,
                action: "REMINDER_SENT",
                actor: "AI Escalation Engine",
                message
            }
        });

        return this.findById(workflowId);
    }

    async findAll() {
        return prismaClient.workflow.findMany({
            include: {
                workflowTemplate: true,
                requester: true,
                workflowSteps: {
                    include: {
                        workflowTemplateStep: true
                    },
                    orderBy: {
                        workflowTemplateStep: {
                            order: "asc"
                        }
                    }
                },
                auditLogs: {
                    where: { action: "REMINDER_SENT" },
                    orderBy: { createdAt: "desc" },
                    take: 5
                }
            },
            orderBy: { createdAt: "desc" }
        });
    }

    async approve(workflowId: string, actedByUserId: string, comments?: string) {
        return prismaClient.$transaction(async (prisma) => {
            const workflow = await prisma.workflow.findUnique({
                where: { id: workflowId },
                include: {
                    workflowSteps: {
                        include: {
                            workflowTemplateStep: true
                        },
                        orderBy: {
                            workflowTemplateStep: {
                                order: "asc"
                            }
                        }
                    }
                }
            });

            if (!workflow) {
                throw new AppError("Workflow not found");
            }

            const activeStep = workflow.workflowSteps.find((step) => step.status === WorkflowStepStatus.ACTIVE);

            if (!activeStep) {
                throw new AppError("No active workflow step found");
            }

            const requiredRole = activeStep.workflowTemplateStep.requiredRole;
            if (requiredRole) {
                const actor = await prisma.user.findUnique({ where: { id: actedByUserId } });
                if (!actor) {
                    throw new AppError("Acting user not found");
                }
                if (actor.role !== requiredRole && actor.role !== "ADMIN") {
                    throw new AppError(`Only a ${requiredRole} can approve the step '${activeStep.workflowTemplateStep.name}' (you are ${actor.role})`, 403);
                }
            }

            await prisma.workflowStepExecution.update({
                where: { id: activeStep.id },
                data: {
                    status: WorkflowStepStatus.APPROVED,
                    actedByUserId,
                    comments: comments ?? null,
                    completedAt: new Date()
                }
            });

            await prisma.auditLog.create({
                data: {
                    workflowId,
                    action: "STEP_APPROVED",
                    actor: actedByUserId,
                    message: `Step '${activeStep.workflowTemplateStep.name}' approved`
                }
            });

            const nextStep = workflow.workflowSteps.find((step) => step.workflowTemplateStep.order > activeStep.workflowTemplateStep.order);

            if (nextStep) {
                await prisma.workflowStepExecution.update({
                    where: { id: nextStep.id },
                    data: {
                        status: WorkflowStepStatus.ACTIVE,
                        startedAt: new Date()
                    }
                });

                await prisma.workflow.update({
                    where: { id: workflowId },
                    data: {
                        status: WorkflowStatus.RUNNING,
                        currentStepOrder: nextStep.workflowTemplateStep.order
                    }
                });
            } else {
                await prisma.workflow.update({
                    where: { id: workflowId },
                    data: {
                        status: WorkflowStatus.COMPLETED
                    }
                });

                await prisma.auditLog.create({
                    data: {
                        workflowId,
                        action: "WORKFLOW_COMPLETED",
                        actor: actedByUserId,
                        message: "Workflow completed"
                    }
                });
            }

            return prisma.workflow.findUnique({
                where: { id: workflowId },
                include: {
                    workflowTemplate: true,
                    workflowSteps: {
                        include: {
                            workflowTemplateStep: true,
                            assignedToUser: true,
                            actedByUser: true
                        },
                        orderBy: {
                            workflowTemplateStep: {
                                order: "asc"
                            }
                        }
                    },
                    auditLogs: {
                        orderBy: { createdAt: "asc" }
                    }
                }
            });
        });
    }

    async reject(workflowId: string, actedByUserId: string, comments?: string) {
        return prismaClient.$transaction(async (prisma) => {
            const workflow = await prisma.workflow.findUnique({
                where: { id: workflowId },
                include: {
                    workflowSteps: {
                        include: {
                            workflowTemplateStep: true
                        }
                    }
                }
            });

            if (!workflow) {
                throw new AppError("Workflow not found");
            }

            const activeStep = workflow.workflowSteps.find((step) => step.status === WorkflowStepStatus.ACTIVE);

            if (!activeStep) {
                throw new AppError("No active workflow step found");
            }

            const requiredRole = activeStep.workflowTemplateStep.requiredRole;
            if (requiredRole) {
                const actor = await prisma.user.findUnique({ where: { id: actedByUserId } });
                if (!actor) {
                    throw new AppError("Acting user not found");
                }
                if (actor.role !== requiredRole && actor.role !== "ADMIN") {
                    throw new AppError(`Only a ${requiredRole} can act on the step '${activeStep.workflowTemplateStep.name}' (you are ${actor.role})`, 403);
                }
            }

            await prisma.workflowStepExecution.update({
                where: { id: activeStep.id },
                data: {
                    status: WorkflowStepStatus.REJECTED,
                    actedByUserId,
                    comments: comments ?? null,
                    completedAt: new Date()
                }
            });

            await prisma.workflow.update({
                where: { id: workflowId },
                data: {
                    status: WorkflowStatus.REJECTED
                }
            });

            await prisma.auditLog.createMany({
                data: [
                    {
                        workflowId,
                        action: "STEP_REJECTED",
                        actor: actedByUserId,
                        message: `Step '${activeStep.workflowTemplateStep.name}' rejected`
                    },
                    {
                        workflowId,
                        action: "WORKFLOW_REJECTED",
                        actor: actedByUserId,
                        message: "Workflow rejected"
                    }
                ]
            });

            return prisma.workflow.findUnique({
                where: { id: workflowId },
                include: {
                    workflowTemplate: true,
                    workflowSteps: {
                        include: {
                            workflowTemplateStep: true,
                            assignedToUser: true,
                            actedByUser: true
                        },
                        orderBy: {
                            workflowTemplateStep: {
                                order: "asc"
                            }
                        }
                    },
                    auditLogs: {
                        orderBy: { createdAt: "asc" }
                    }
                }
            });
        });
    }
}

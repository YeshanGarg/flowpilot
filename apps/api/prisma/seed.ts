import "dotenv/config";
import prismaClient from "../src/core/database/prisma.js";
import { StepType } from "../generated/prisma/client.js";

async function main() {
    const organizationId = "00000000-0000-0000-0000-000000000001";
    const workflowTemplateId = "00000000-0000-0000-0000-000000000010";

    const organization = await prismaClient.organization.upsert({
        where: { id: organizationId },
        update: { name: "FlowPilot Labs" },
        create: {
            id: organizationId,
            name: "FlowPilot Labs"
        }
    });

    const manager = await prismaClient.user.upsert({
        where: { email: "manager@flowpilot.dev" },
        update: {
            name: "Manager User",
            role: "MANAGER",
            organizationId: organization.id
        },
        create: {
            name: "Manager User",
            email: "manager@flowpilot.dev",
            role: "MANAGER",
            organizationId: organization.id
        }
    });

    await prismaClient.user.upsert({
        where: { email: "finance@flowpilot.dev" },
        update: {
            name: "Finance User",
            role: "FINANCE",
            organizationId: organization.id
        },
        create: {
            name: "Finance User",
            email: "finance@flowpilot.dev",
            role: "FINANCE",
            organizationId: organization.id
        }
    });

    await prismaClient.user.upsert({
        where: { email: "employee@flowpilot.dev" },
        update: {
            name: "Employee User",
            role: "EMPLOYEE",
            organizationId: organization.id,
            managerId: manager.id
        },
        create: {
            name: "Employee User",
            email: "employee@flowpilot.dev",
            role: "EMPLOYEE",
            organizationId: organization.id,
            managerId: manager.id
        }
    });

    const workflowTemplate = await prismaClient.workflowTemplate.upsert({
        where: { id: workflowTemplateId },
        update: {
            name: "Expense Approval",
            description: "Standard approval for employee expense claims",
            organizationId: organization.id
        },
        create: {
            id: workflowTemplateId,
            name: "Expense Approval",
            description: "Standard approval for employee expense claims",
            organizationId: organization.id
        }
    });

    await prismaClient.workflowTemplateStep.deleteMany({
        where: { workflowTemplateId: workflowTemplate.id }
    });

    await prismaClient.workflowTemplateStep.createMany({
        data: [
            {
                workflowTemplateId: workflowTemplate.id,
                order: 1,
                name: "Manager Approval",
                type: StepType.APPROVAL,
                requiredRole: "MANAGER"
            },
            {
                workflowTemplateId: workflowTemplate.id,
                order: 2,
                name: "Finance Review",
                type: StepType.REVIEW,
                requiredRole: "FINANCE"
            },
            {
                workflowTemplateId: workflowTemplate.id,
                order: 3,
                name: "Notify Requester",
                type: StepType.NOTIFICATION,
                requiredRole: null
            }
        ]
    });

    console.log("Seed complete");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prismaClient.$disconnect();
    });

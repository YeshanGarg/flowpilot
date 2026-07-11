import { UserRepository } from "./user.repository.js";
import { OrganizationService } from "../organization/organization.service.js";
import type { CreateUserDto } from "./user.types.js";
import { AppError } from "../../core/errors/app-error.js";

export class UserService {
    constructor(
        private readonly userRepository = new UserRepository(),
        private readonly organizationService = new OrganizationService()
    ) {}

    async create(createUserDto: CreateUserDto) {
        const name = createUserDto.name?.trim();
        const email = createUserDto.email?.trim();
        const { organizationId, managerId } = createUserDto;

        if (!name) {
            throw new AppError("Name is required");
        }

        if (!email) {
            throw new AppError("Email is required");
        }

        if (!organizationId) {
            throw new AppError("Organization ID is required");
        }

        await this.organizationService.findById(organizationId);

        if (managerId) {
            const manager = await this.userRepository.findById(managerId);

            if (!manager) {
                throw new AppError("Manager not found");
            }

            if (manager.organizationId !== organizationId) {
                throw new AppError("Manager must belong to the same organization");
            }
        }

        return this.userRepository.create({ name, email, organizationId, managerId: managerId ?? null, role: createUserDto.role ?? "EMPLOYEE" });
    }

    async findAll() {
        return this.userRepository.findAll();
    }

    async findById(id: string) {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new AppError("User not found");
        }

        return user;
    }
}
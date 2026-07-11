import { OrganizationRepository } from "./organization.repository.js";
import type { CreateOrganizationDto } from "./organization.types.js";
import { AppError } from "../../core/errors/app-error.js";

export class OrganizationService {
    constructor(
        private readonly organizationRepository = new OrganizationRepository()
    ) {}

    async create(createOrganizationDto: CreateOrganizationDto) {
        const name = createOrganizationDto.name?.trim();

        if (!name) {
            throw new AppError("Name is required");
        }

        return this.organizationRepository.create({ name });
    }

    async findById(id: string) {
        const organization = await this.organizationRepository.findById(id);

        if (!organization) {
            throw new AppError("Organization not found");
        }

        return organization;
    }

    async findAll() {
        return this.organizationRepository.findAll();
    }
}
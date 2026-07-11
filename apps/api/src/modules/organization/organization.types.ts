export interface CreateOrganizationDto {
  name: string;
}

export interface OrganizationResponseDto {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
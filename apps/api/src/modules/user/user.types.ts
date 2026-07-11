export interface CreateUserDto {
  name: string;
  email: string;
  organizationId: string;
  managerId?: string | null;
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  managerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
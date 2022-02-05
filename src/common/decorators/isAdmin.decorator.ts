import { SetMetadata, UseGuards } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import { AdminGuard } from '../guards/admin-acl.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
export const ENDPOINT_NEED_ADMIN_KEY = 'endpointisForAdmins';

export function Admin() {
  /**
   * instead of checking for is_admin everytime, we use @Admin()
   * for endpoints that user need to be Admin
   */
  return applyDecorators(SetMetadata(ENDPOINT_NEED_ADMIN_KEY, true), UseGuards(JwtAuthGuard, AdminGuard));
}

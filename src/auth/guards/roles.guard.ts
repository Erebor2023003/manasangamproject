import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    // console.log('Allowed Roles: ' + roles);
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    
    const userRoles = this.extractUserRolesFromToken(request.headers.authorization);
    return this.validateRoles(roles, userRoles);
  }

  extractUserRolesFromToken(authorizationHeader: string): string[] {
    const token = authorizationHeader?.split(' ')[1]; 
    if (!token) {
      return [];
    }

    try {
      const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET); 
      const user = decodedToken?.user.findAgent || decodedToken?.user.findAdmin || decodedToken?.user.findCustomer;
      return user?.role || [];
    } catch (error) {
      console.error('Failed to decode token:', error);
      return [];
    }
  }

  validateRoles(roles: string[], userRoles: string[]) {

    if (!userRoles || userRoles.length === 0) {
      return false;
    }

    return roles.some(role => userRoles.includes(role));
  }
}


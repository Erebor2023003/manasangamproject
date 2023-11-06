import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) {}

    async createToken(user: any):Promise<{token: string} | any> {
        const secretKey = process.env.JWT_SECRET;
        const jwtToken = await this.jwtService.signAsync({user}, {secret: secretKey});
        return jwtToken
    }

    async hashPassword(password: string) {
        const bcryptPassword = bcrypt.hash(password, 10);
        return bcryptPassword
    }

    async comparePassword(password: string, hashedPassword: string) {
        const matchPassword = bcrypt.compare(password, hashedPassword);
        return matchPassword
    }

    async verifyToken(token: string): Promise<any> {
        try {
          return this.jwtService.verify(token);
        } catch (error) {
          return null;
        }
      }
}

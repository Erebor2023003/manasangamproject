import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Admin, adminSchema } from './schema/admin.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{name: Admin.name, schema: adminSchema}])],
  controllers: [AdminController],
  providers: [AdminService, AuthService, JwtService,{
    provide: APP_GUARD,
    useClass: RolesGuard,
  }]
})
export class AdminModule {}

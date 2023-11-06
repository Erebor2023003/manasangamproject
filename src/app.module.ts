import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { AgentModule } from './agent/agent.module';
import { CustomerModule } from './customer/customer.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [AdminModule, AgentModule, CustomerModule,AuthModule,
    MongooseModule.forRoot(
      'mongodb+srv://macsof:macsof@nextlevelcarwash.yjs3i.mongodb.net/sangham?retryWrites=true&w=majority',
    ),
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      useFactory: () => ({
        secretOrKey: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: '10s',
        },
      }),
    })],
  controllers: [AppController],
  providers: [AppService,{
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
  JwtService,],
})
export class AppModule {}

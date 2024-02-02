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
import { ScheduleModule } from '@nestjs/schedule';
import { SanghamdepositsModule } from './sanghamdeposits/sanghamdeposits.module';
import { AppuModule } from './appu/appu.module';

@Module({
  imports: [
    AdminModule,
    AgentModule,
    CustomerModule,
    AuthModule,
    MongooseModule.forRoot(
      'mongodb://goridesksk:Shiva5230@13.234.247.156:27017/sangham?authSource=admin',
    ),
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      useFactory: () => ({
        secretOrKey: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: '10s',
        },
      }),
    }),

    ScheduleModule.forRoot(),

    SanghamdepositsModule,

    AppuModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    JwtService,
  ],
})
export class AppModule {}

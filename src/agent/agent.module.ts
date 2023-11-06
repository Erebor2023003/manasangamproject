import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Agent, agentSchema } from './schema/agent.schema';
import { SharedService } from './shared.service';
import { AuthService } from 'src/auth/auth.service';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { Sangham, sanghamSchema } from './schema/sangham.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Agent.name, schema: agentSchema },
      { name: Sangham.name, schema: sanghamSchema },
    ]),
  ],
  controllers: [AgentController],
  providers: [
    AgentService,
    SharedService,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    JwtService,
  ],
})
export class AgentModule {}

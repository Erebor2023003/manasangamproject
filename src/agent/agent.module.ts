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
import { Customer, customerSchema } from 'src/customer/schema/customer.schema';
import { Podupu, podupuSchema } from 'src/admin/schema/podhupu.schema';
import { Deposit, depositSchema } from 'src/admin/schema/deposit.schema';
import { SanghamDeposit, sanghamDepositSchema } from 'src/sanghamdeposits/schema/sanghamdeposit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Agent.name, schema: agentSchema },
      { name: Sangham.name, schema: sanghamSchema },
      { name: Customer.name, schema: customerSchema },
      { name: Podupu.name, schema: podupuSchema },
      { name: Deposit.name, schema: depositSchema },
      { name: SanghamDeposit.name, schema: sanghamDepositSchema },
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

import { Module } from '@nestjs/common';
import { AppuService } from './appu.service';
import { AppuController } from './appu.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppuDetails, appuDetailsSchema } from './schema/appudetails.schema';
import { Appu, appuSchema } from './schema/appu.schema';
import { Surety, suretySchema } from './schema/surety.schema';
import { Customer, customerSchema } from 'src/customer/schema/customer.schema';
import { interest, interestSchema } from './schema/interest.schema';
import { AgentService } from 'src/agent/agent.service';
import { Agent, agentSchema } from 'src/agent/schema/agent.schema';
import { Sangham, sanghamSchema } from 'src/agent/schema/sangham.schema';
import { SharedService } from 'src/agent/shared.service';
import { AuthService } from 'src/auth/auth.service';
import { Podupu, podupuSchema } from 'src/admin/schema/podhupu.schema';
import { Deposit, depositSchema } from 'src/admin/schema/deposit.schema';
import { SanghamDeposit, sanghamDepositSchema } from 'src/sanghamdeposits/schema/sanghamdeposit.schema';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appu.name, schema: appuSchema },
      { name: AppuDetails.name, schema: appuDetailsSchema },
      { name: Surety.name, schema: suretySchema },
      { name: Customer.name, schema: customerSchema },
      { name: interest.name, schema: interestSchema },
      { name: Agent.name, schema: agentSchema },
      { name: Sangham.name, schema: sanghamSchema },
      { name: Podupu.name, schema: podupuSchema },
      { name: Deposit.name, schema: depositSchema },
      { name: SanghamDeposit.name, schema: sanghamDepositSchema },
    ]),
  ],
  controllers: [AppuController],
  providers: [AppuService, AgentService, SharedService, AuthService, JwtService],
})
export class AppuModule {}

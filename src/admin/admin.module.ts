import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Admin, adminSchema } from './schema/admin.schema';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PodupuDetails,
  podhupuDetailsSchema,
} from './schema/podhupuDetails.schema';
import { Podupu, podupuSchema } from './schema/podhupu.schema';
import { Customer, customerSchema } from 'src/customer/schema/customer.schema';
import { DepositDetails, depositDetailsSchema } from './schema/depositDetails.schema';
import { Deposit, depositSchema } from './schema/deposit.schema';
import { Sangham, sanghamSchema } from 'src/agent/schema/sangham.schema';
import { Withdraw, withdrawSchema } from './schema/withdraw.schema';
import { SanghamDeposit, sanghamDepositSchema } from 'src/sanghamdeposits/schema/sanghamdeposit.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: adminSchema },
      { name: PodupuDetails.name, schema: podhupuDetailsSchema },
      { name: Podupu.name, schema: podupuSchema },
      { name: Customer.name, schema: customerSchema },
      { name: DepositDetails.name, schema: depositDetailsSchema },
      { name: Deposit.name, schema: depositSchema },
      { name: Withdraw.name, schema: withdrawSchema },
      { name: SanghamDeposit.name, schema: sanghamDepositSchema },
      { name: Sangham.name, schema: sanghamSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    AuthService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AdminModule {}

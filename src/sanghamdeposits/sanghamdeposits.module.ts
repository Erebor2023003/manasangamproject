import { Module } from '@nestjs/common';
import { SanghamdepositsService } from './sanghamdeposits.service';
import { SanghamdepositsController } from './sanghamdeposits.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SanghamDeposit,
  sanghamDepositSchema,
} from './schema/sanghamdeposit.schema';
import {
  SanghamDepositDetails,
  sanghamDepositDetailsSchema,
} from './schema/sanghamdepositdetails.schema';
import { SanghamWithdraw, sanghamWithdrawSchema } from './schema/sanghamwithdraw.schema';
import { Paid, paidSchema } from './schema/paid.schema';
import { Sangham, sanghamSchema } from 'src/agent/schema/sangham.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SanghamDeposit.name, schema: sanghamDepositSchema },
      { name: SanghamDepositDetails.name, schema: sanghamDepositDetailsSchema },
      {name: SanghamWithdraw.name, schema: sanghamWithdrawSchema},
      {name: Paid.name, schema: paidSchema},
      {name: Sangham.name, schema: sanghamSchema}
    ]),
  ],
  controllers: [SanghamdepositsController],
  providers: [SanghamdepositsService],
})
export class SanghamdepositsModule {}

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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SanghamDeposit.name, schema: sanghamDepositSchema },
      { name: SanghamDepositDetails.name, schema: sanghamDepositDetailsSchema },
      {name: SanghamWithdraw.name, schema: sanghamWithdrawSchema}
    ]),
  ],
  controllers: [SanghamdepositsController],
  providers: [SanghamdepositsService],
})
export class SanghamdepositsModule {}

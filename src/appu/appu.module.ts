import { Module } from '@nestjs/common';
import { AppuService } from './appu.service';
import { AppuController } from './appu.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppuDetails, appuDetailsSchema } from './schema/appudetails.schema';
import { Appu, appuSchema } from './schema/appu.schema';
import { Surety, suretySchema } from './schema/surety.schema';
import { Customer, customerSchema } from 'src/customer/schema/customer.schema';
import { interest, interestSchema } from './schema/interest.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appu.name, schema: appuSchema },
      { name: AppuDetails.name, schema: appuDetailsSchema },
      { name: Surety.name, schema: suretySchema },
      { name: Customer.name, schema: customerSchema },
      { name: interest.name, schema: interestSchema },
    ]),
  ],
  controllers: [AppuController],
  providers: [AppuService],
})
export class AppuModule {}

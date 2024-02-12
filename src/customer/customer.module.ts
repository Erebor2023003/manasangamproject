import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, customerSchema } from './schema/customer.schema';
import { SharedService } from 'src/agent/shared.service';
import { Sangham, sanghamSchema } from 'src/agent/schema/sangham.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: customerSchema },
      { name: Sangham.name, schema: sanghamSchema },
    ]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService, SharedService],
})
export class CustomerModule {}

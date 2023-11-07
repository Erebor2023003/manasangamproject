import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { CustomerStatus } from "src/auth/guards/roles.enum";
import { v4 as uuid } from 'uuid';
@Schema({ timestamps: true })

export class Customer extends Document{
    @Prop({default: uuid})
    customerId: string
    @Prop()
    sanghamId: string
    @Prop()
    firstName: string
    @Prop()
    mobileNo: string
    @Prop()
    aadharNo: string
    @Prop()
    address: string
    @Prop()
    aadharImage: string
    @Prop()
    profileImage: string
    @Prop({default: CustomerStatus.ACTIVE})
    status: string
}

export const customerSchema = SchemaFactory.createForClass(Customer);
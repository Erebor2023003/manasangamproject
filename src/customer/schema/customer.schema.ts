import { Prop } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuid } from 'uuid'

export class Customer extends Document{
    @Prop({default: uuid})
    customerId: string
    @Prop()
    periodOfAppu: string
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
}
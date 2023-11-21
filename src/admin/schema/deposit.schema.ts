import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuid } from 'uuid';
@Schema({ timestamps: true })

export class Deposit extends Document{
    @Prop({default: uuid})
    depositId: string
    @Prop()
    depositAmount: number
    @Prop()
    interest: number
    @Prop()
    customerId: string
    @Prop()
    sanghamId: string
    @Prop()
    date: string
    @Prop()
    withdraw: number
    @Prop()
    total: number
}

export const depositSchema = SchemaFactory.createForClass(Deposit);
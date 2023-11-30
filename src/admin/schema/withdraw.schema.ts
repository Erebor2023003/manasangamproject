import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuid } from 'uuid';
@Schema({ timestamps: true })

export class Withdraw extends Document{
    @Prop({default: uuid})
    withdrawId: string
    @Prop()
    amount: number
    @Prop()
    sanghamId: string
    @Prop()
    customerId: string
    @Prop()
    date: string
}

export const withdrawSchema = SchemaFactory.createForClass(Withdraw);
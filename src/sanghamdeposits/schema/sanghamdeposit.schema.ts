import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuid } from 'uuid';
@Schema({ timestamps: true })
 
export class SanghamDeposit extends Document{
    @Prop({default: uuid})
    sanghamDepositId: string
    @Prop()
    depositAmount: number
    @Prop()
    sanghamId: string
    @Prop()
    agentId: string
    @Prop()
    interest: number
    @Prop()
    total: number
    @Prop()
    date: string
    @Prop()
    withdraw: number
}

export const sanghamDepositSchema  = SchemaFactory.createForClass(SanghamDeposit);
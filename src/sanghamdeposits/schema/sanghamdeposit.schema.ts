import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuid } from 'uuid';
const roundToTwoDecimalPlaces = (value: number) => {
    return parseFloat(value.toFixed(2));
};
@Schema({ timestamps: true })
 
export class SanghamDeposit extends Document{
    @Prop({default: uuid})
    sanghamDepositId: string
    @Prop({ set: roundToTwoDecimalPlaces })
    depositAmount: number
    @Prop()
    sanghamId: string
    @Prop()
    agentId: string
    @Prop({ set: roundToTwoDecimalPlaces })
    interest: number
    @Prop({ set: roundToTwoDecimalPlaces })
    total: number
    @Prop()
    date: string
    @Prop({ set: roundToTwoDecimalPlaces })
    withdraw: number
}

export const sanghamDepositSchema  = SchemaFactory.createForClass(SanghamDeposit);
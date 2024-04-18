import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuid } from 'uuid';
const roundToTwoDecimalPlaces = (value: number) => {
    return parseFloat(value.toFixed(2));
};
@Schema({ timestamps: true })

export class Deposit extends Document{
    @Prop({default: uuid})
    depositId: string
    @Prop({ set: roundToTwoDecimalPlaces })
    depositAmount: number
    @Prop({ set: roundToTwoDecimalPlaces })
    interest: number
    @Prop()
    customerId: string
    @Prop()
    sanghamId: string
    @Prop()
    date: string
    @Prop({ set: roundToTwoDecimalPlaces })
    withdraw: number
    @Prop({ set: roundToTwoDecimalPlaces })
    total: number
}

export const depositSchema = SchemaFactory.createForClass(Deposit);
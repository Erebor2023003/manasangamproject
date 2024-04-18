import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuid } from 'uuid';
const roundToTwoDecimalPlaces = (value: number) => {
    return parseFloat(value.toFixed(2));
};
@Schema({ timestamps: true })

export class Withdraw extends Document{
    @Prop({default: uuid})
    withdrawId: string
    @Prop({ set: roundToTwoDecimalPlaces })
    amount: number
    @Prop()
    sanghamId: string
    @Prop()
    customerId: string
    @Prop()
    date: string
    @Prop({ set: roundToTwoDecimalPlaces })
    total: number
}

export const withdrawSchema = SchemaFactory.createForClass(Withdraw);
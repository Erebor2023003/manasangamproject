import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuid } from "uuid";
const roundToTwoDecimalPlaces = (value: number) => {
    return parseFloat(value.toFixed(2));
};
@Schema({ timestamps: true })

export class Paid extends Document{
    @Prop({default: uuid})
    paidId: string
    @Prop({ set: roundToTwoDecimalPlaces })
    amount: number
    @Prop()
    sanghamId: string
    @Prop()
    date: string
}

export const paidSchema = SchemaFactory.createForClass(Paid);
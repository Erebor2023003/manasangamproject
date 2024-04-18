import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"
import { v4 as uuid } from "uuid"
const roundToTwoDecimalPlaces = (value: number) => {
    return parseFloat(value.toFixed(2));
};
@Schema({ timestamps: true })

export class SanghamWithdraw extends Document{
    @Prop({default: uuid})
    sanghamWithdrawId: string
    @Prop({ set: roundToTwoDecimalPlaces })
    withdrawAmount: number
    @Prop()
    sanghamId: string
    @Prop()
    agentId: string
    @Prop()
    date: string
    @Prop({ set: roundToTwoDecimalPlaces })
    total: number
}
export const sanghamWithdrawSchema = SchemaFactory.createForClass(SanghamWithdraw);
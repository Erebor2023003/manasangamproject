import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { PodupuStatus } from "src/auth/guards/roles.enum";
import { v4 as uuid } from 'uuid';
const roundToTwoDecimalPlaces = (value: number) => {
    return parseFloat(value.toFixed(2));
};
@Schema({ timestamps: true })

export class Podupu extends Document{
    @Prop({default: uuid})
    podhuId: string
    @Prop()
    customerId: string
    @Prop({ set: roundToTwoDecimalPlaces })
    podhupuAmount: number
    @Prop()
    date: string
    @Prop({ set: roundToTwoDecimalPlaces })
    fine: number
    @Prop({ set: roundToTwoDecimalPlaces })
    Total: number
    @Prop({ set: roundToTwoDecimalPlaces })
    interest: number
    @Prop({default: PodupuStatus.UNPAID})
    status: string
    @Prop()
    sanghamId: string
}

export const podupuSchema = SchemaFactory.createForClass(Podupu);
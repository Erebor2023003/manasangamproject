import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { AppuStatus, approveStatus } from "src/auth/guards/roles.enum";
import { v4 as uuid } from 'uuid';

const roundToTwoDecimalPlaces = (value: number) => {
    return parseFloat(value.toFixed(2));
};

@Schema({ timestamps: true })

export class Appu extends Document{
    @Prop({default: uuid})
    appuId: string
    @Prop()
    sanghamId: string
    @Prop()
    customerId: string
    @Prop({ set: roundToTwoDecimalPlaces })
    appuAmount: number
    @Prop({ set: roundToTwoDecimalPlaces })
    interest: number
    @Prop({ set: roundToTwoDecimalPlaces })
    fine: number
    @Prop({ set: roundToTwoDecimalPlaces })
    paidAmount: number
    @Prop({ set: roundToTwoDecimalPlaces })
    total: number
    @Prop()
    date: string
    @Prop()
    timePeriod: number
    @Prop({default: AppuStatus.PENDING})
    appuStatus: string
    @Prop()
    dueDate: string
    @Prop({default: approveStatus.REJECTED})
    approveStatus: string
}

export const appuSchema = SchemaFactory.createForClass(Appu);
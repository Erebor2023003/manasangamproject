import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuid } from 'uuid';
@Schema({ timestamps: true })

export class PodupuDetails extends Document{
    @Prop({default: uuid})
    podupuDetailsId: string
    @Prop()
    sanghamId: string
    @Prop()
    monthlyAmount: number
    @Prop()
    interest: number
    @Prop()
    fine: number
    @Prop()
    startDate: string
    @Prop()
    podupuPeriod: number
}

export const podhupuDetailsSchema = SchemaFactory.createForClass(PodupuDetails);
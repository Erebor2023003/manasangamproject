import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuid} from 'uuid';
@Schema({ timestamps: true })

export class AppuDetails extends Document{
    @Prop({default: uuid})
    appuDetailsId: string
    @Prop()
    appuDate: string
    @Prop()
    sanghamId: string
    @Prop()
    interest: number
    @Prop()
    timePeriod: number
    @Prop()
    customerId: string
    @Prop()
    fine: number
}

export const appuDetailsSchema = SchemaFactory.createForClass(AppuDetails);
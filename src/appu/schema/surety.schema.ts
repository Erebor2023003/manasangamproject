import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuid } from 'uuid';
@Schema({ timestamps: true })

export class Surety extends Document{
    @Prop({default: uuid})
    suretyId: string
    @Prop()
    candidateName: string
    @Prop()
    mobileNumber: number
    @Prop()
    fingerPrint: string
    @Prop()
    candidateImage: string
    @Prop()
    aadharNumber: number
    @Prop()
    customerId: string
    @Prop()
    sanghamId: string
    @Prop()
    candidateId: string
}

export const suretySchema = SchemaFactory.createForClass(Surety);
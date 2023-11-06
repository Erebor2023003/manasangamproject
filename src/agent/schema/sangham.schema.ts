import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuid } from 'uuid';
@Schema({ timestamps: true })

export class Sangham extends Document{
    @Prop({ default: uuid })
    sanghamId: string
    @Prop()
    agentId: string
    @Prop()
    sanghamName: string
    @Prop()
    rateOfInterestPodupu: number
    @Prop()
    rateOfInterestAppu: number
    @Prop()
    rateOfInterestDeposit: number
    @Prop()
    rateOfInterestPodupuFine: number
    @Prop()
    startDate: string
    @Prop()
    endDate: string
    @Prop()
    location: string
}

export const sanghamSchema = SchemaFactory.createForClass(Sangham);
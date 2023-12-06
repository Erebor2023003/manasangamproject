import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import {v4 as uuid} from 'uuid';
@Schema({ timestamps: true })

export class DepositDetails extends Document{
    @Prop({default: uuid})
    depositDetailsId: string
    @Prop()
    sanghamId: string
    @Prop()
    interest: number
    @Prop()
    depositDate: string
}

export const depositDetailsSchema = SchemaFactory.createForClass(DepositDetails);
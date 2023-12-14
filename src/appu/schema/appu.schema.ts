import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { AppuStatus, approveStatus } from "src/auth/guards/roles.enum";
import { v4 as uuid } from 'uuid';
@Schema({ timestamps: true })

export class Appu extends Document{
    @Prop({default: uuid})
    appuId: string
    @Prop()
    sanghamId: string
    @Prop()
    customerId: string
    @Prop()
    appuAmount: number
    @Prop()
    interest: number
    @Prop()
    fine: number
    @Prop()
    paidAmount: number
    @Prop()
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
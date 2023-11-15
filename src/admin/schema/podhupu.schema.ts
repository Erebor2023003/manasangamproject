import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { PodupuStatus } from "src/auth/guards/roles.enum";
import { v4 as uuid } from 'uuid';
@Schema({ timestamps: true })

export class Podupu extends Document{
    @Prop({default: uuid})
    podhuId: string
    @Prop()
    customerId: string
    @Prop()
    podhupuAmount: number
    @Prop()
    date: string
    @Prop()
    fine: number
    @Prop()
    Total: number
    @Prop()
    interest: number
    @Prop({default: PodupuStatus.UNPAID})
    status: string
    @Prop()
    sanghamId: string
}

export const podupuSchema = SchemaFactory.createForClass(Podupu);
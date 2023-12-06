import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuid } from 'uuid';
@Schema({ timestamps: true })

export class SanghamDepositDetails extends Document{
    @Prop({default: uuid})
    sanghamdepositDetailsId: string
    @Prop()
    sanghamId: string
    @Prop()
    agentId: string
    @Prop()
    interestRate: number
    @Prop()
    depositDate: string
}
export const sanghamDepositDetailsSchema = SchemaFactory.createForClass(SanghamDepositDetails);
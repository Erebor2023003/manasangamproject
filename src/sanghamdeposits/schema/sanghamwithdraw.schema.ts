import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"
import { v4 as uuid } from "uuid"
@Schema({ timestamps: true })

export class SanghamWithdraw extends Document{
    @Prop({default: uuid})
    sanghamWithdrawId: string
    @Prop()
    withdrawAmount: number
    @Prop()
    sanghamId: string
    @Prop()
    agentId: string
    @Prop()
    date: string
    @Prop()
    total: number
}
export const sanghamWithdrawSchema = SchemaFactory.createForClass(SanghamWithdraw);
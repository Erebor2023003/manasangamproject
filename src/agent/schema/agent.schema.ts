import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Role } from "src/auth/guards/roles.enum";
import { v4 as uuid } from 'uuid';
@Schema({ timestamps: true })

export class Agent extends Document{
    @Prop({ default: uuid })
    agentId: string
    @Prop()
    agentName: string
    @Prop()
    mobileNo: number
    @Prop()
    emailId: string
    @Prop()
    aadharNo: string
    @Prop()
    aadharImage: string
    @Prop()
    aadharImage2: string
    @Prop()
    tenthmemo: string
    @Prop()
    address:string
    @Prop()
    password: string
    @Prop()
    profilePicture: string
    @Prop({default: Role.AGENT})
    role: string
}

export const agentSchema = SchemaFactory.createForClass(Agent);
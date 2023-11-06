import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Role } from "src/auth/guards/roles.enum";
import { v4 as uuid } from 'uuid';
@Schema({ timestamps: true })

export class Admin extends Document{
    @Prop({default: uuid})
    adminId: string
    @Prop()
    emailId: string
    @Prop()
    password: string
    @Prop({default: Role.ADMIN})
    role: string
}

export const adminSchema = SchemaFactory.createForClass(Admin);
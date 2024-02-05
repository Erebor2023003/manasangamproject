import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid';
@Schema({ timestamps: true })
export class interest extends Document {
  @Prop({ required: true, unique: true, default: uuid })
  interestId: string;
  @Prop()
  interest: number;
}

export const interestSchema = SchemaFactory.createForClass(interest);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StoreDocument = Store & Document;

@Schema({ timestamps: true })
export class Store {
  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  })
  name: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 400,
  })
  address: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  ownerId: Types.ObjectId;

  @Prop({
    type: String,
    trim: true,
    default: 'General',
    index: true,
  })
  category: string;

  @Prop({
    type: Number,
    default: 40.7128,
  })
  latitude: number;

  @Prop({
    type: Number,
    default: -74.0060,
  })
  longitude: number;

  @Prop({
    type: [String],
    default: [],
  })
  photos: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const StoreSchema = SchemaFactory.createForClass(Store);
StoreSchema.index({ name: 'text', address: 'text' });

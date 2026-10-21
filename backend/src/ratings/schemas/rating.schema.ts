import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RatingDocument = Rating & Document;

@Schema({ timestamps: true })
export class Rating {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true,
  })
  storeId: Types.ObjectId;

  @Prop({
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer rating',
    },
  })
  rating: number;

  @Prop({
    type: String,
    trim: true,
    maxlength: 1000,
    default: '',
  })
  review?: string;

  @Prop({
    type: [String],
    default: [],
  })
  photos: string[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'User' }],
    default: [],
  })
  likes: Types.ObjectId[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'User' }],
    default: [],
  })
  dislikes: Types.ObjectId[];

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'User', required: true },
        reason: { type: String, default: 'Inappropriate or fake review' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  reports: Array<{
    userId: Types.ObjectId;
    reason: string;
    createdAt: Date;
  }>;

  createdAt?: Date;
  updatedAt?: Date;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);

// Compound unique index ensuring one rating per user per store
RatingSchema.index({ userId: 1, storeId: 1 }, { unique: true });

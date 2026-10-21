import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../common/interfaces/user-role.enum.js';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    minlength: 5,
    maxlength: 60,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({
    required: true,
    maxlength: 400,
    trim: true,
  })
  address: string;

  @Prop({
    required: true,
  })
  passwordHash: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({
    type: [{ type: String }],
    default: [],
  })
  bookmarks: string[];

  @Prop({
    type: String,
    maxlength: 300,
    trim: true,
    default: '',
  })
  bio?: string;

  @Prop({
    type: String,
    maxlength: 20,
    trim: true,
    default: '',
  })
  phone?: string;

  @Prop({
    type: String,
    maxlength: 100,
    trim: true,
    default: '',
  })
  city?: string;

  @Prop({
    type: String,
    trim: true,
    default: '',
  })
  avatarUrl?: string;

  @Prop({
    type: String,
    default: null,
    select: false,
  })
  resetPasswordToken?: string | null;

  @Prop({
    type: Date,
    default: null,
    select: false,
  })
  resetPasswordExpires?: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

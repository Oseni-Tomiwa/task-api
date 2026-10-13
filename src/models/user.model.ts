import mongoose, { type Model } from 'mongoose';

const { model, models, Schema } = mongoose;

export interface UserDocument {
  email: string;
  passwordHash: string;
}

const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
    select: false,
  },
});

export const User =
  (models.User as Model<UserDocument> | undefined) ?? model<UserDocument>('User', userSchema);

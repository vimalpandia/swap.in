import mongoose, { Schema, Document } from 'mongoose';
import { Role, VibeType } from '@swap/shared';

export interface IUser extends Document {
  email: string;
  username: string;
  name: string;
  passwordHash: string;
  role: Role;
  googleId?: string;
  isEmailVerified: boolean;
  avatarUrl?: string | null;
  bio?: string | null;
  website?: string | null;
  isPrivate: boolean;
  ghostMode: boolean;
  activeVibe: VibeType;
  focusGuardMinutes: number;
  currentStreakCount: number;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  reelsCount: number;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    googleId: { type: String, sparse: true },
    isEmailVerified: { type: Boolean, default: false },
    avatarUrl: { type: String, default: null },
    bio: { type: String, default: null, maxlength: 300 },
    website: { type: String, default: null },
    isPrivate: { type: Boolean, default: false },
    ghostMode: { type: Boolean, default: false },
    activeVibe: { type: String, enum: ['CHILL', 'HYPE', 'FOCUS', 'DARK'], default: 'CHILL' },
    focusGuardMinutes: { type: Number, default: 30 },
    currentStreakCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
    reelsCount: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Text index for search functionality
UserSchema.index({ username: 'text', name: 'text', bio: 'text' });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);


import { User, IUser, Follow, IFollow, Post, Reel } from '../models';
import { Role, VibeType } from '@swap/shared';
import { Types } from 'mongoose';

export interface CreateUserData {
  email: string;
  username: string;
  passwordHash: string;
  name: string;
  role?: Role;
  isEmailVerified?: boolean;
}

export interface UserWithProfile extends Omit<IUser, 'id'> {
  id: string;
  _id: Types.ObjectId;
  profile: {
    id: string;
    userId: string;
    name: string;
    bio: string | null;
    website: string | null;
    avatarUrl: string | null;
    isPrivate: boolean;
    ghostMode: boolean;
    activeVibe: VibeType;
    focusGuardMinutes: number;
    currentStreakCount: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

function toUserWithProfile(userDoc: any): UserWithProfile | null {
  if (!userDoc) return null;
  const obj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  const id = (obj._id || obj.id).toString();
  obj.id = id;
  obj.profile = {
    id,
    userId: id,
    name: obj.name || obj.username,
    bio: obj.bio || null,
    website: obj.website || null,
    avatarUrl: obj.avatarUrl || null,
    isPrivate: !!obj.isPrivate,
    ghostMode: !!obj.ghostMode,
    activeVibe: obj.activeVibe || 'CHILL',
    focusGuardMinutes: obj.focusGuardMinutes ?? 30,
    currentStreakCount: obj.currentStreakCount ?? 0,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
  return obj as UserWithProfile;
}

export class UserRepository {
  async findById(id: string): Promise<UserWithProfile | null> {
    try {
      if (!Types.ObjectId.isValid(id)) return null;
      const user = await User.findOne({ _id: id, deletedAt: null });
      return toUserWithProfile(user);
    } catch {
      return null;
    }
  }

  async findByEmail(email: string): Promise<UserWithProfile | null> {
    try {
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      return toUserWithProfile(user);
    } catch {
      return null;
    }
  }

  async findByUsername(username: string): Promise<UserWithProfile | null> {
    try {
      const user = await User.findOne({ username: username.toLowerCase().trim() });
      return toUserWithProfile(user);
    } catch {
      return null;
    }
  }

  async create(data: CreateUserData): Promise<UserWithProfile> {
    const user = await User.create({
      email: data.email.toLowerCase().trim(),
      username: data.username.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      name: data.name.trim(),
      role: data.role || 'USER',
      isEmailVerified: data.isEmailVerified || false,
      activeVibe: 'CHILL',
      focusGuardMinutes: 30,
    });
    return toUserWithProfile(user)!;
  }

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      bio?: string | null;
      website?: string | null;
      avatarUrl?: string | null;
      isPrivate?: boolean;
      ghostMode?: boolean;
      activeVibe?: VibeType;
      focusGuardMinutes?: number;
    }
  ) {
    if (!Types.ObjectId.isValid(userId)) return null;
    const user = await User.findByIdAndUpdate(userId, { $set: data }, { new: true });
    return toUserWithProfile(user);
  }

  async updateVibe(userId: string, activeVibe: VibeType) {
    if (!Types.ObjectId.isValid(userId)) return null;
    const user = await User.findByIdAndUpdate(userId, { $set: { activeVibe } }, { new: true });
    return toUserWithProfile(user);
  }

  async searchUsers(query: string, limit = 10): Promise<UserWithProfile[]> {
    const regex = new RegExp(query, 'i');
    const users = await User.find({
      deletedAt: null,
      $or: [{ username: { $regex: regex } }, { name: { $regex: regex } }, { bio: { $regex: regex } }],
    }).limit(limit);

    return users.map((u) => toUserWithProfile(u)!);
  }

  async getFollowers(userId: string) {
    if (!Types.ObjectId.isValid(userId)) return [];
    const follows = await Follow.find({ following: userId, status: 'ACCEPTED' })
      .populate('follower')
      .lean();

    return follows.map((f: any) => ({
      ...f,
      id: f._id.toString(),
      follower: toUserWithProfile(f.follower),
    }));
  }

  async getFollowing(userId: string) {
    if (!Types.ObjectId.isValid(userId)) return [];
    const follows = await Follow.find({ follower: userId, status: 'ACCEPTED' })
      .populate('following')
      .lean();

    return follows.map((f: any) => ({
      ...f,
      id: f._id.toString(),
      following: toUserWithProfile(f.following),
    }));
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(followerId) || !Types.ObjectId.isValid(followingId)) return false;
    const follow = await Follow.findOne({
      follower: followerId,
      following: followingId,
      status: 'ACCEPTED',
    });
    return !!follow;
  }

  async followUser(followerId: string, followingId: string, requiresApproval = false) {
    const status = requiresApproval ? 'PENDING' : 'ACCEPTED';
    const follow = await Follow.findOneAndUpdate(
      { follower: followerId, following: followingId },
      { $set: { status } },
      { upsert: true, new: true }
    );

    if (status === 'ACCEPTED') {
      await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
      await User.findByIdAndUpdate(followingId, { $inc: { followersCount: 1 } });
    }

    return {
      id: follow._id.toString(),
      status: follow.status,
    };
  }

  async unfollowUser(followerId: string, followingId: string) {
    const existing = await Follow.findOneAndDelete({ follower: followerId, following: followingId });
    if (existing && existing.status === 'ACCEPTED') {
      await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
      await User.findByIdAndUpdate(followingId, { $inc: { followersCount: -1 } });
    }
    return { success: true };
  }

  async countStats(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      return { postsCount: 0, reelsCount: 0, followersCount: 0, followingCount: 0 };
    }
    const [postsCount, reelsCount, followersCount, followingCount] = await Promise.all([
      Post.countDocuments({ author: userId, deletedAt: null }),
      Reel.countDocuments({ author: userId, deletedAt: null }),
      Follow.countDocuments({ following: userId, status: 'ACCEPTED' }),
      Follow.countDocuments({ follower: userId, status: 'ACCEPTED' }),
    ]);
    return { postsCount, reelsCount, followersCount, followingCount };
  }
}

export const userRepository = new UserRepository();

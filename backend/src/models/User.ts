import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
  },
  { timestamps: true }
);

UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { _id, __v, password, ...rest } = ret as typeof ret & { _id?: mongoose.Types.ObjectId; __v?: number; password?: string };
    return { ...rest, id: _id?.toString() };
  }
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;

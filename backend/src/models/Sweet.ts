import mongoose, { Schema, Document } from 'mongoose';

export interface ISweet extends Document {
  name: string;
  category: string;
  price: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const SweetSchema = new Schema<ISweet>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

SweetSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { _id, __v, ...rest } = ret as typeof ret & { _id?: mongoose.Types.ObjectId; __v?: number };
    return { ...rest, id: _id?.toString() };
  }
});

const Sweet = mongoose.model<ISweet>('Sweet', SweetSchema);
export default Sweet;

import Order, { IOrder } from '../models/Order';
import { Sweet } from '../models/Sweet';
import { User } from '../models/User';
import mongoose from 'mongoose';

interface OrderItemInput {
  sweetId: string;
  quantity: number;
}

interface CreateOrderInput {
  userId: string;
  items: OrderItemInput[];
}

export class OrderService {
  async createOrder(data: CreateOrderInput): Promise<IOrder> {
    const { userId, items } = data;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate all items and check stock
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      if (item.quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }

      const sweet = await Sweet.findById(item.sweetId);
      if (!sweet) {
        throw new Error('Sweet not found');
      }

      if (sweet.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${sweet.name}`);
      }

      orderItems.push({
        sweet: new mongoose.Types.ObjectId(item.sweetId),
        name: sweet.name,
        price: sweet.price,
        quantity: item.quantity,
      });

      totalAmount += sweet.price * item.quantity;

      // Decrease sweet quantity
      sweet.quantity -= item.quantity;
      await sweet.save();
    }

    // Create order
    const order = await Order.create({
      user: new mongoose.Types.ObjectId(userId),
      items: orderItems,
      totalAmount,
      status: 'completed',
    });

    return order;
  }

  async getUserOrders(userId: string): Promise<IOrder[]> {
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('items.sweet');
    return orders;
  }

  async getOrderById(orderId: string): Promise<IOrder | null> {
    const order = await Order.findById(orderId).populate('items.sweet');
    return order;
  }

  async getAllOrders(): Promise<IOrder[]> {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('items.sweet');
    return orders;
  }
}

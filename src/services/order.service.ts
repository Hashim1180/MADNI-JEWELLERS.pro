import { Injectable, signal } from '@angular/core';
import { CartItem, Order } from '../types';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private initialOrders: Map<string, Order> = new Map([
    ['MJ-1024', { id: 'MJ-1024', items: [], total: 8800, status: 'Agent Dispatched', estimatedDelivery: 'Arriving today' }],
    ['MJ-1023', { id: 'MJ-1023', items: [], total: 12500, status: 'Processing', estimatedDelivery: '5 days' }],
    ['MJ-1022', { id: 'MJ-1022', items: [], total: 2900, status: 'Delivered', estimatedDelivery: 'Delivered' }],
  ]);
  private orders = signal<Map<string, Order>>(this.initialOrders);

  // FIX: Explicitly type sort parameters to resolve type inference issue.
  allOrders = () => Array.from(this.orders().values()).sort((a: Order, b: Order) => b.id.localeCompare(a.id));

  getOrderById(id: string): Order | undefined {
    return this.orders().get(id.toUpperCase());
  }

  bookAppointment(items: CartItem[], total: number): Order {
    const newOrderNumber = 1025 + (this.orders().size - this.initialOrders.size);
    const newOrderId = `MJ-${newOrderNumber}`;

    const newOrder: Order = {
      id: newOrderId,
      items: items,
      total: total,
      status: 'Appointment Scheduled',
      estimatedDelivery: 'Pending Confirmation'
    };

    this.orders.update(currentOrders => {
      const newMap = new Map(currentOrders);
      newMap.set(newOrder.id, newOrder);
      return newMap;
    });
    
    return newOrder;
  }
}
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order } from '../../types';
import { ScrollAnimateDirective } from '../../animations/scroll-animate.directive';
import { OrderService } from '../../services/order.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollAnimateDirective],
  templateUrl: './order-tracking.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderTrackingComponent {
  orderService = inject(OrderService);
  route = inject(ActivatedRoute);

  orderId = signal('');
  searchedOrder = signal<Order | null | undefined>(undefined); // undefined for not searched, null for not found
  isLoading = signal(false);

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.orderId.set(id);
        this.trackOrder();
      }
    });
  }

  trackOrder(): void {
    if (!this.orderId().trim()) return;
    this.isLoading.set(true);
    this.searchedOrder.set(undefined);

    // Simulate network delay for better UX
    setTimeout(() => {
      const foundOrder = this.orderService.getOrderById(this.orderId().trim());
      this.searchedOrder.set(foundOrder || null);
      this.isLoading.set(false);
    }, 1000);
  }
}
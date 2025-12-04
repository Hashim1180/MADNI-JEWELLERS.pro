import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ScrollAnimateDirective } from '../../animations/scroll-animate.directive';

@Component({
  selector: 'app-client-ledger',
  standalone: true,
  imports: [CommonModule, RouterLink, ScrollAnimateDirective],
  templateUrl: './client-ledger.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLedgerComponent {
  orderService = inject(OrderService);
  authService = inject(AuthService);
  router = inject(Router);

  orders = computed(() => this.orderService.allOrders());

  constructor() {
    // Basic guard: if not logged in, redirect to home
    if (!this.authService.currentUser()) {
      this.router.navigate(['/']);
    }
  }
}

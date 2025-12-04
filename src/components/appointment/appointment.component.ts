
import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../auth/auth.service';
import { OrderService } from '../../services/order.service';
import { Order } from '../../types';
import { FormsModule } from '@angular/forms';
import { ScrollAnimateDirective } from '../../animations/scroll-animate.directive';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollAnimateDirective, RouterLink],
  templateUrl: './appointment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentComponent implements OnInit {
  cartService = inject(CartService);
  authService = inject(AuthService);
  orderService = inject(OrderService);
  router = inject(Router);

  userName = signal('');
  userCountryCode = signal('+92');
  userPhone = signal('');
  appointmentBooked = signal(false);
  bookedOrder = signal<Order | null>(null);

  countries = [
    { name: 'Pakistan', code: '+92' },
    { name: 'United Kingdom', code: '+44' },
    { name: 'United States', code: '+1' },
    { name: 'Canada', code: '+1' },
    { name: 'Australia', code: '+61' },
    { name: 'UAE', code: '+971' },
    { name: 'Saudi Arabia', code: '+966' },
    { name: 'Afghanistan', code: '+93' },
    { name: 'India', code: '+91' },
    { name: 'Bangladesh', code: '+880' },
    { name: 'Germany', code: '+49' },
    { name: 'France', code: '+33' },
  ];

  ngOnInit() {
    this.userName.set(this.authService.currentUser() || '');
    if (!this.authService.currentUser()) {
        this.authService.showLoginModal.set(true);
    }
  }

  bookAppointment(): void {
    if (!this.userName().trim() || !this.userPhone().trim()) {
        // Simple validation
        return;
    }

    const newOrder = this.orderService.bookAppointment(
      this.cartService.cart(),
      this.cartService.cartTotal()
    );
    
    this.bookedOrder.set(newOrder);
    this.appointmentBooked.set(true);

    // WhatsApp Integration
    const itemsList = this.cartService.cart().map(item => `- ${item.product.name} (x${item.quantity})`).join('%0A');
    const total = this.cartService.cartTotal().toLocaleString();
    const message = `Salam Mr. Awais,%0A%0AI would like to book an appointment for:%0A${itemsList}%0A%0ATotal Estimate: $${total}%0A%0AClient Name: ${this.userName()}%0AContact: ${this.userCountryCode()}${this.userPhone()}%0AOrder ID: ${newOrder.id}`;
    
    // Open WhatsApp in new tab
    window.open(`https://wa.me/923006262886?text=${message}`, '_blank');

    this.cartService.clearCart();
  }
}
